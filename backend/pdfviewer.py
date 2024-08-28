# -*- coding: utf-8 -*-
"""
__project_ = 'stage1-vanillajs-pdfjs-2nd-dev'
__file_name__ = 'pdfviewer.py'
__author__ = '十五'
__email__ = '564298339@qq.com'
__time__ = '2024/7/30 13:35'
"""
from PyQt6.QtGui import QCloseEvent
from .pdfResourceHandler import *
from .protoWindowClass import ProtoWebWindowClass


class PDFViewerJsBridge(QObject):
    def __init__(self, superior: "PDFViewer"):
        super().__init__()
        self.superior = superior
        self.pdf_url = None
        self.DB: PDFInfoDataBase = PDFInfoDataBase()

    @pyqtSlot(str, result=str)
    def save_file_info(self, url):
        self.save_file_url = url
        return "ok"

    @pyqtSlot(str, result=str)
    def save_thumbnail(self, base64_string):
        pdf_uuid = self.superior.pdf_uuid
        try:
            base64_data = base64_string.split(',')[1]
            ThumbnailFileHandler.file_save(base64_data, pdf_uuid)
            return "ok"
        except Exception as e:
            return str(e)

    @pyqtSlot(str,result=str)
    def upload_pdf_outline(self,data_str):
        """
        Args:
            str: jsonString
            {
                pdf_uuid:
                uuid:
                items:[
                    {
                        title:
                        page:
                        items:[]
                    },
                    {
                        title:
                        page:
                        items:[]
                    }
                ]
                created_at:
                updated_at:
            }
        Returns:

        """
        self.superior.upload_pdf_outline(data_str)

    @pyqtSlot(str, result=str)
    def fetch_pdf_outline(self, outline_uuid):
        return json.dumps(self.superior.outline_DB[outline_uuid].to_dict())

    @pyqtSlot(result=str)
    def fetch_pdf_info(self):
        return json.dumps(self.superior.DB[self.superior.pdf_uuid].to_dict())

class PDFViewer(ProtoWebWindowClass):
    def __init__(self,superior,pdf_uuid:str):
        from .homePage import PDFReadingHome
        self.superior: PDFReadingHome = superior
        self.pdf_uuid = pdf_uuid
        self.DB: PDFInfoDataBase = PDFInfoDataBase()
        self.outline_DB:PDFOutLineDataBase = PDFOutLineDataBase()
        super().__init__(templates.pdfViewer,PDFViewerJsBridge)
        self.setWindowTitle(f"PDF viewer of {self.DB[self.pdf_uuid].book_name}")

    def set_web(self, src: str):
        html_template = Template(open(src, "r", encoding="utf-8").read())
        pdfinfo = self.DB[self.pdf_uuid]
        pdf_socketInfo_str = json.dumps({"pdf_uuid": self.pdf_uuid,"pdf_name": pdfinfo.book_name+".pdf","cmd":EnumStatus.Action.FETCH_PDF_FILE})
        html=html_template.safe_substitute(
                is_dev_env=is_dev_env_inject if is_dev_env else ""
                ,pdf_viewer_application_data=pdf_socketInfo_str
                ,checkPDFNeedThumbnail="false" if ThumbnailFileHandler.file_exists(self.pdf_uuid) else "true")
        base_url = QUrl(f"file:///{(BASE_DIR/Path('..')).resolve().as_posix()}/")
        self.browser.setHtml(html, baseUrl=base_url)

    def closeEvent(self, a0:Optional[QCloseEvent]) -> None:
        self.superior.opened_pdfViewer.pop(self.pdf_uuid)
        super().closeEvent(a0)

    def upload_pdf_outline(self,jsonString:str):
        outline_dict = json.loads(jsonString)
        outline_obj = PDFOutlineObject(**outline_dict)
        self.DB[self.pdf_uuid].outline = outline_obj.uuid
        self.outline_DB.set_data(outline_obj)
        self.outline_DB.save_database()
        self.DB.save_database()

        pass