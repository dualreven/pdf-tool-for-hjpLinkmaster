from .utils import *

class ProtoJsBridge(QObject):
    def __init__(self, superior):
        super().__init__()
        self.superior = superior


class ProtoWebWindowClass(QMainWindow):
    def __init__(self, src: str, js_bridge: Type[QObject]):
        super().__init__()
        self.setGeometry(100, 100, 800, 600)
        self.browser = QWebEngineView()
        # self.setWindowFlags(Qt.WindowType.CustomizeWindowHint)
        central_widget = QWidget()
        central_widget.setStyleSheet("margin: 0px; padding: 0px;")
        layout = QVBoxLayout(central_widget)
        layout.setContentsMargins(0, 0, 0, 0)
        layout.setSpacing(0)
        self.setStyleSheet("background-color:  rgba(255, 255, 255, 0); margin: 0px; padding: 1px;")
        self.setCentralWidget(central_widget)
        self.page = self.browser.page()
        self.dev_tools = QWebEngineView()
        self.dev_tools_page = QWebEnginePage(self)
        self.dev_tools.setPage(self.dev_tools_page)
        self.page.setDevToolsPage(self.dev_tools_page)
        layout.addWidget(self.browser)
        layout.addWidget(self.dev_tools)
        setting = self.browser.settings()
        setting.setAttribute(QWebEngineSettings.WebAttribute.LocalStorageEnabled, True)
        setting.setAttribute(QWebEngineSettings.WebAttribute.LocalContentCanAccessRemoteUrls, True)
        setting.setAttribute(QWebEngineSettings.WebAttribute.LocalContentCanAccessFileUrls, True)
        self.set_web(src)
        self.channel = QWebChannel(self)
        self.js_bridge = js_bridge(self)
        self.channel.registerObject(BACKEND_NAME, self.js_bridge)
        self.browser.page().setWebChannel(self.channel)
        self.dev_tools.hide()

    # @abc.abstractmethod
    def set_web(self, src: str):
        abs_url = (BASE_DIR / Path(src)).resolve().as_posix()

        self.browser.setUrl(QUrl(f"file:///{abs_url}"))
        pass
