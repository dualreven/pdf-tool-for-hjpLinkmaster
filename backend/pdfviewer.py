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





class PDFViewer(ProtoWebWindowClass):
    def __init__(self,superior,pdf_uuid:str):
        from .homePage import PDFReadingHome
        self.superior: PDFReadingHome = superior
        self.pdf_uuid = pdf_uuid
        super().__init__(templates.pdfViewer,PDFViewerJsBridge)
        self.setWindowTitle(f"PDF viewer of {self.superior.DB[self.pdf_uuid].book_name}")



    def set_web(self, src: str):
        html_template = Template(open(src, "r", encoding="utf-8").read())
        pdfinfo = self.superior.DB[self.pdf_uuid]
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