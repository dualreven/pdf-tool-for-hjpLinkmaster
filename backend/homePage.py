from .pdfResourceHandler import *
from .protoWindowClass import ProtoWebWindowClass


class HomePageServer(QObject):
    def __init__(self, superior: "PDFReadingHome"):
        super().__init__()
        self.superior: "PDFReadingHome" = superior
        self._server = QWebSocketServer("FileTransferServer", QWebSocketServer.SslMode.NonSecureMode)
        self._server.listen(QHostAddress.SpecialAddress.LocalHost, 1027)
        self._server.newConnection.connect(self._on_new_connection)
        # self._clients:"dict[str,HomeWebsocketServerObj]" = {}

    def _on_new_connection(self):
        client: QWebSocket = self._server.nextPendingConnection()
        client.textMessageReceived.connect(lambda msg: self._on_text_message_received(client, msg))

        pass

    def _on_text_message_received(self, client: QWebSocket, message):
        """

        Args:
            client:
            message: {
                "pdf_uuid": "",
                "pdf_name": "",
                "cmd":"0,1,2,3,4"
            }

        Returns:

        """
        primitive_data = json.loads(message)
        pdf_uuid, pdf_name, cmd = primitive_data["pdf_uuid"], primitive_data["pdf_name"], primitive_data["cmd"]
        if cmd == EnumStatus.Action.FETCH_PDF_FILE:
            self.superior.opened_pdfViewer[pdf_uuid].socket_client = client
            pdf_url: Path = (PDF_file_path / pdf_name)
            client.sendBinaryMessage(PDF_fileHandler.load_file_as_bytes(pdf_url.resolve().__str__()))

        pass


class HomePageJsBridge(QObject):
    def __init__(self, superior: "PDFReadingHome"):
        super().__init__()
        self.superior: "PDFReadingHome" = superior

    @pyqtSlot(result=str)
    def fetch_pdf_list(self):
        result = self.superior.DB.load_all_from_disk()
        return json.dumps(result)

    """_summary_
        get pdf info by uuid from database
        Returns:
            _type_: _description_
    """

    @pyqtSlot(str, result=str)
    def fetch_pdf_info(self, uuid):
        return json.dumps(self.superior.DB[uuid].to_dict())

    @pyqtSlot(str)
    def open_pdf_info(self, uuid):
        self.superior.open_pdf_info(uuid)

    @pyqtSlot(str)
    def open_pdf_clips(self, uuid):
        self.superior.open_pdf_clips(uuid)

    @pyqtSlot(str)
    def open_pdf_viewer(self, pdf_uuid):
        self.superior.open_pdf_viewer(pdf_uuid)

    @pyqtSlot(result=list)
    def import_new_pdf(self):
        file_dialog = QFileDialog()
        file_dialog.setFileMode(QFileDialog.FileMode.ExistingFiles)
        file_dialog.setNameFilter("PDF Files (*.pdf)")
        selected = None
        if file_dialog.exec():
            selected = file_dialog.selectedFiles()
        new_uuids = []
        if selected:
            print(f"selected: {selected}")
            need_add = False
            for pdf_url in selected:
                if not PDF_fileHandler.file_exists(pdf_url):
                    print(f"pdf_url: {pdf_url}")
                    PDF_fileHandler.save_file(pdf_url)
                    need_add = True
                book_name = os.path.basename(pdf_url)[:-4]
                if book_name not in self.superior.DB:
                    new_data = PDFInfoObject(book_name=book_name)
                    self.superior.DB.set_data(new_data)
                    need_add = True
                if need_add:
                    new_uuids.append(new_data.uuid)
                    need_add = False
            if new_uuids:
                self.superior.DB.save_database()
        print(new_uuids)
        return new_uuids

    @pyqtSlot(str, result=str)
    def delete_pdf(self, uuid):
        if uuid in self.superior.DB:
            PDF_fileHandler.delete_file(self.superior.DB[uuid].book_name)
            del self.superior.DB[uuid]
            self.superior.DB.save_database()
            return "ok"
        else:
            return "fail"

    @pyqtSlot()
    def close_window(self):
        self.superior.close()

    def toast(self, msg, title="info", auto_close=True, toast_type=ToastType.INFO):
        self.superior.page.runJavaScript(f"toast.{toast_type}('{title}','{msg}',auto_close={'true' if auto_close else 'false'});")


class PDFReadingHome(ProtoWebWindowClass):
    def __init__(self):
        super().__init__(templates.homepage, HomePageJsBridge)
        from .pdfInfoViewer import PDFInfoViewer
        from .pdfClipsViewer import PdfClipsViewer
        self.opened_pdfInfoViewer: dict[str, PDFInfoViewer] = {}
        self.opened_pdfClipsViewer: dict[str, PdfClipsViewer] = {}
        self.opened_pdfViewer: dict[str, PDFViewerObj] = {}
        self.DB: PDFInfoDataBase = PDFInfoDataBase()
        self.server: HomePageServer = HomePageServer(self)

        self.setWindowTitle("PDF Reading home")
        self.activateWindow()

    def open_pdf_viewer(self, pdf_uuid):
        from .pdfviewer import PDFViewer
        pdfinfo = self.DB[pdf_uuid]
        if pdf_uuid not in self.opened_pdfViewer:
            self.opened_pdfViewer[pdf_uuid] = PDFViewerObj(pdfinfo.uuid, pdfinfo.book_name, viewer=PDFViewer(self, pdf_uuid))
        else:
            jsbridge: HomePageJsBridge = self.js_bridge
            jsbridge.toast(f"the PDF viewer is already opened")
        self.opened_pdfViewer[pdf_uuid].viewer.show()
        self.opened_pdfViewer[pdf_uuid].viewer.activateWindow()

    pass

    def open_pdf_info(self, pdf_uuid):
        from .pdfInfoViewer import PDFInfoViewer
        if pdf_uuid not in self.opened_pdfInfoViewer:
            self.opened_pdfInfoViewer[pdf_uuid] = PDFInfoViewer(pdf_uuid, self)
        else:
            jsbridge: HomePageJsBridge = self.js_bridge
            jsbridge.toast(f"the PDF info is already opened")
        self.opened_pdfInfoViewer[pdf_uuid].show()
        self.opened_pdfInfoViewer[pdf_uuid].activateWindow()

    def open_pdf_clips(self, pdf_uuid):
        from .pdfClipsViewer import PdfClipsViewer
        if pdf_uuid not in self.opened_pdfClipsViewer:
            self.opened_pdfClipsViewer[pdf_uuid] = PdfClipsViewer(pdf_uuid, self)
        else:
            jsbridge: HomePageJsBridge = self.js_bridge
            jsbridge.toast(f"the PDF clips is already opened")
        self.opened_pdfClipsViewer[pdf_uuid].show()
        self.opened_pdfClipsViewer[pdf_uuid].activateWindow()

    def closeEvent(self, event):
        info_keys = list(self.opened_pdfInfoViewer.keys())
        clips_keys = list(self.opened_pdfClipsViewer.keys())
        view_keys = list(self.opened_pdfViewer.keys())
        for pdf_uuid in info_keys:
            self.opened_pdfInfoViewer[pdf_uuid].close()
        for pdf_uuid in clips_keys:
            self.opened_pdfClipsViewer[pdf_uuid].close()
        for pdf_uuid in view_keys:
            self.opened_pdfViewer[pdf_uuid].viewer.close()

        # self.DB.save_database()
        event.accept()
        # return super().close()
