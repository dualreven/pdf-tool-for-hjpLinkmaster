from .pdfResourceHandler import *
from .protoWindowClass import ProtoWebWindowClass

class PdfClipsJsBridge(QObject):
    def __init__(self, superior: "PdfClipsViewer"):
        super().__init__()
        self.superior: "PdfClipsViewer" = superior

    @pyqtSlot(result=str)
    def fetch_pdfclips_info(self):
        clips = {}
        for clips_uuid in self.superior.DB[self.superior.uuid].clips:
            clips[clips_uuid]=self.superior.Clips_DB[clips_uuid].to_dict()
        return json.dumps(clips)

    # @pyqtSlot(str,result=str)
    # def upload_pdf_info(self,pdf_info_str):
    #     return json.dumps(PDFInfoDataBase.load_all_from_disk())


class PdfClipsViewer(ProtoWebWindowClass):
    def __init__(self,uuid, superior):
        super().__init__(templates.pdfClips, PdfClipsJsBridge)
        from .homePage import PDFReadingHome
        self.uuid = uuid
        self.superior:PDFReadingHome = superior
        self.DB: PDFInfoDataBase = PDFInfoDataBase()
        self.Clips_DB:PDFClipsDataBase = PDFClipsDataBase()
        self.setWindowTitle("PDF info viewer")

    def closeEvent(self, event):
        self.superior.opened_pdfClipsViewer.pop(self.uuid)
        self.Clips_DB.save_database()
        super().closeEvent(event)


    def get_dict(self):
        return self.DB[self.uuid].to_dict()