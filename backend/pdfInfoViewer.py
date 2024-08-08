from .pdfResourceHandler import *
from .protoWindowClass import ProtoWebWindowClass


class PdfInfoJsBridge(QObject):
    def __init__(self, superior: "PDFInfoViewer"):
        super().__init__()
        self.superior: "PDFInfoViewer" = superior

    @pyqtSlot(result=str)
    def fetch_pdf_info(self):
        return json.dumps(self.superior.DB[self.superior.uuid].to_dict())

    @pyqtSlot(str,result=str)
    def upload_pdf_info(self,pdf_info_str):
        pdf_info = json.loads(pdf_info_str)
        self.superior.DB.set_data(PDFInfoObject(**pdf_info))
        return "ok"

class PDFInfoViewer(ProtoWebWindowClass):
    def __init__(self,uuid, superior):
        super().__init__(templates.pdfInfo, PdfInfoJsBridge)
        from .homePage import PDFReadingHome
        self.uuid = uuid 
        self.superior:PDFReadingHome = superior
        self.DB: PDFInfoDataBase = PDFInfoDataBase()
        self.setWindowTitle("PDF info viewer")

    def closeEvent(self, event):
        self.superior.opened_pdfInfoViewer.pop(self.uuid)
        super().closeEvent(event)


    def get_dict(self):
        return self.DB[self.uuid].to_dict()