import inspect
from datetime import datetime
from http.server import HTTPServer, SimpleHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
import os,mimetypes,time,uuid
from typing import *
import threading
import cgi
import shutil
from string import Template
import sys,base64,json
import os,dataclasses
from PyQt6.QtWidgets import QApplication, QMainWindow, QVBoxLayout, QWidget,QFileDialog
from PyQt6.QtWebEngineWidgets import QWebEngineView
from PyQt6.QtWebEngineCore import QWebEngineSettings,QWebEnginePage
from PyQt6.QtCore import QUrl,QObject,pyqtSlot,QByteArray,QVariant,Qt
from PyQt6.QtWebChannel import QWebChannel
from PyQt6.QtWebSockets import QWebSocketServer, QWebSocket
from PyQt6.QtNetwork import QHostAddress
from typing import Any
from pathlib import Path
# ANSI 转义码
RED = "\033[31m"
GREEN = "\033[32m"
YELLOW = "\033[33m"
BLUE = "\033[34m"
RESET = "\033[0m"
TYPE_PDF_UUID = TYPE_BOOK_NAME = str

def class_to_dict(cls):
    result = {}
    for key, value in cls.__dict__.items():
        if not key.startswith('__'):
            if isinstance(value, type):
                result[key] = class_to_dict(value)
            else:
                result[key] = value
    return result

"""_summary_
{
    "EnumStatus":{
        "Source":{
            "Role":{
                "PDF_PAGE":0,
                "PDF_HOME":1,
                "PDF_CLIP":2
            }
        },
        "Action":{
            "UP_LOAD_FILE":0,
            "FETCH_PDF_TABLE":1,
            "FETCH_PDF_INFO":2,
            "FETCH_PDF_CLIP":3
        }
    }
}

Returns:
    _type_: _description_
"""
class EnumStatus:
    class Source:
        class Role:
            PDF_PAGE = 0
            PDF_HOME = 1
            PDF_CLIP = 2
    class Action:
        UP_LOAD_FILE=0
        FETCH_PDF_TABLE=1
        FETCH_PDF_INFO=2
        FETCH_PDF_CLIP=3

    class Common:
        SUCCESS = 0
        FAIL = 1
        
    
is_Anki_env = False
try :
    import anki
    is_Anki_env = True
except:
    pass
PORT = 8000
PDF_FUNCTION = "/hjp-linkmaster/pdf-readnclip/"
COMMON_API = "/api/v1/common/"
current_file = inspect.getfile(inspect.currentframe())
BASE_DIR = Path(os.path.dirname(current_file)).as_posix()
PRJ_ROOT_DIR = (BASE_DIR/Path("..")).resolve().as_posix()
PDF_file_path = "backend/pdf_files/"
PDF_info_path = f"./{PDF_file_path[2:-1]}/pdf_list.json"
print(f"current_file={current_file}",f"BASE_DIR={BASE_DIR}")
pdf_map = {
    "1":"sample.pdf",
    "2":"sample2.pdf",
    "3":"sample3.pdf",
    "4":"sample4.pdf",
    "5":"sample5.pdf",
    "6":"sample6.pdf"
}


index_html_path = os.path.join(PRJ_ROOT_DIR, 'index.html')
is_dev_env = os.path.exists(os.path.join(PRJ_ROOT_DIR, 'is_dev.json'))
is_dev_env_inject = '''
<link rel="stylesheet" href="./web/viewer.css">
<link rel="stylesheet" href="./web/simple-notify.css" />
<script>window.is_dev_env=true</script>'''
def get_index_html(pdf_url):
    index_html_str = open(index_html_path,"r",encoding="utf-8").read()
    index_templ = Template(index_html_str)
    return index_templ.safe_substitute(pdf_url=pdf_url,
                                       is_dev_env= is_dev_env_inject if is_dev_env else "",
                                    #    base_url = f"file:///{BASE_DIR}"
                                       )

def print_header(path,headers,method="GET"):
    print(f"{datetime.now()} received {method} info, {path=}")
    print("Headers:")
    for key, value in headers.items():
        print(f"{key}: {value}")
    print("Headers End------------------")


class PDF_fileHandler:
    # class PdfInfoRecord:
    #     pass
    @staticmethod
    def save_file(pdf_url):
        # if not os.path.exists(PDF_lib_path):
        pdf_name = os.path.basename(pdf_url)
        new_pdf_url = os.path.join(PDF_file_path,pdf_name)
        if not os.path.exists(PDF_file_path):
            os.makedirs(PDF_file_path)  
        shutil.copyfile(pdf_url,new_pdf_url)
    @staticmethod
    def file_exists(pdf_url):
        pdf_name = os.path.basename(pdf_url)
        new_pdf_url = os.path.join(PDF_file_path,pdf_name)
        print(f"{new_pdf_url=}")
        return os.path.exists(new_pdf_url)
    @staticmethod
    def save_info(pdf_url)->str:
        book_name = os.path.basename(pdf_url)[:-4]
        info = PDFInfoObject(book_name=book_name)
        PDFInfoDataBase.save_new_info(info)
        return info.uuid
        pass
    
    @staticmethod
    def delete_file(book_name):
        if os.path.exists(os.path.join(PDF_file_path,book_name+".pdf")):
            os.remove(os.path.join(PDF_file_path,book_name+".pdf"))
class PDFUUID:
    def __init__(self,uuid,book_name) -> None:
        self.uuid=uuid
        self.book_name=book_name
    def __str__(self) -> str:
        return f"({self.uuid},{self.book_name})"
    def __repr__(self) -> str:
        return self.__str__()
    def __hash__(self) -> int:
        return hash(self.book_name)

    def __eq__(self, __o: "PDFUUID|str") -> bool:
        print(f"__eq__:{self=},{__o=}")
        if not isinstance(__o, PDFUUID):
            return self.uuid == __o or self.book_name == __o
        return self.uuid == __o.uuid or self.book_name == __o.book_name
    
# class PDFInfoDataBase:
#     _instance = None

#     def __new__(cls, *args, **kwargs):
#         if cls._instance is None:
#             cls._instance = super().__new__(cls)
#         return cls._instance
#     def __init__(self):
#         if not hasattr(self, '_initialized'):
#             self._book_name_data:dict[TYPE_BOOK_NAME,PDFInfoObject] = {}
#             self._uuid_data:dict[TYPE_PDF_UUID,PDFInfoObject] = {}
#             primitive_data = self.load_all_from_disk()
#             need_save = False
#             for key,value in primitive_data.items():
#                 pdf_info = PDFInfoObject(**value)
#                 if os.path.exists(os.path.join(PDF_file_path,pdf_info.book_name+".pdf"))\
#                     and pdf_info.book_name not in self:
#                     self.set_data(pdf_info)
#                 else:
#                     need_save = True
                
            
#             # 判断是否有遗漏
#             for filename in os.listdir(PDF_file_path): # 读取遗漏的文件
#                 # 构造完整路径
#                 full_path = os.path.join(PDF_file_path, filename)
#                 # 检查是否是文件以及扩展名是否为.pdf
#                 if os.path.isfile(full_path) and filename.lower().endswith('.pdf'):
#                     book_name = filename[:-4]
#                     if book_name not in self:
#                         need_save = True
#                         new_data = PDFInfoObject(book_name=book_name)
#                         self.set_data(new_data)
            
            
#             if need_save:
#                 self.save_database()
#             self._initialized = True
#     def __getitem__(self, key):
#         if key in self._uuid_data:
#             return self._uuid_data[key]
#         else:
#             return self._book_name_data[key]
#     def __contains__(self, key):
#         return key in self._uuid_data or key in self._book_name_data
#     def __delitem__(self, key):
#         if key in self._uuid_data:
#             data = self._uuid_data[key]
#             del self._uuid_data[key]
#             del self._book_name_data[data.book_name]
#         elif key in self._book_name_data:
#             data = self._book_name_data[key]
#             del self._book_name_data[key]
#             del self._uuid_data[data.uuid]
#         else:
#             raise KeyError(f"{key} not in {self.__class__.__name__}")
#     # def __setitem__(self, key, value:"PDFInfoObject"):
#     #     assert type(key)==str and type(value)==PDFInfoObject
#     #     self._book_name_data[key] = value
#     #     self._uuid_data[key] = value
#     def set_data(self,data:"PDFInfoObject"):
#         assert type(data)==PDFInfoObject
#         self._book_name_data[data.book_name] = data
#         self._uuid_data[data.uuid] = data
        
#     def find_pdf_files(self):
#         pdf_files = []
#         # 列出目录中的所有文件和文件夹
#         for filename in os.listdir(PDF_file_path):
#             # 构造完整路径
#             full_path = os.path.join(PDF_file_path, filename)
#             # 检查是否是文件以及扩展名是否为.pdf
#             if os.path.isfile(full_path) and filename.lower().endswith('.pdf'):
#                 pdf_files.append(filename[:-4])
#         return pdf_files
#     def save_database(self):
#         data = {}
#         for key,value in self._uuid_data.items():
#             data[key] = value.to_dict()
#         with open(PDF_info_path, 'w') as file:
#             json.dump(data, file)
    
#     def save_new_pdf(self, pdf_url):
#         PDF_fileHandler.save_file(pdf_url)
        
    
#     @staticmethod
#     def load_all_from_disk()->dict:
#         with open(PDF_info_path, 'r') as file:
#             if file =="":
#                 file = "{}"
#             pdf_info_list = json.load(file)
#         return pdf_info_list
    

# @dataclasses.dataclass
# class PDFInfoObject:
#     book_name: str
#     uuid: str = dataclasses.field(default_factory=lambda: str(uuid.uuid4())[:8])
#     alias:str = ""
#     page_count:int= 0
#     clips_count:int = 0
#     reading_progress:float = 0.0 
#     last_read_page:int=0
#     created_at:int = dataclasses.field(default_factory=lambda: int(time.time()))
#     updated_at:int = dataclasses.field(default_factory=lambda: int(time.time()))
#     read_at:int = dataclasses.field(default_factory=lambda: int(time.time()))
#     stars:int =0
#     tags:List[str] = dataclasses.field(default_factory=list)
#     comment:str = ""
#     thumbnail:str = ""
#     clips:list[str]=dataclasses.field(default_factory=list) # list[PDFClipInfoObject.uuid]
    
#     def to_dict(self):
#         return dataclasses.asdict(self)
# @dataclasses.dataclass()    
# class PDFClipInfoObject:
#     pdf_uuid:str
#     page_num:int
#     start:tuple[float,float]
#     end:tuple[float,float]
#     uuid:str = dataclasses.field(default_factory=lambda: str(uuid.uuid4())[:8])
#     comment:str = ""
#     def to_dict(self):
#         return dataclasses.asdict(self)
    
    
class JsBridge(QObject):
    def __init__(self,superior:"QMainWindow"):
        super().__init__()
        self.superior = superior
        self.pdf_url = None
        self.DB:PDFInfoDataBase=PDFInfoDataBase()
        
    @pyqtSlot(str, result=str)
    def save_file_info(self, url):
        self.save_file_url = url
        return "ok"
    
    @pyqtSlot('QByteArray', result=str)
    def save_pdf(self, json_data_str:QByteArray):
        # 这个函数已经废弃,没有再使用
        try:
            print(f"{json_data_str.count()=}")
            # json_data =json.loads(json_data_str)
            # print(f"Received data (length: {len(json_data['data'])} bytes)")
            # byte_data = base64.b64decode(json_data['data'])
            # url = json_data['url']
            # with open(url, 'wb') as file:
            #     file.write(byte_data)
            return "ok"
        except Exception as e:
            print(f"Error saving data: {e}")
            
            return f"Error saving data: {e}"
    @pyqtSlot(str, result=str)
    def console_log(self,msg):
        print(msg)
        return "ok"
    
    @pyqtSlot(result=str)
    def fetch_pdf_list(self):
        result = PDFInfoDataBase.load_all_from_disk()
        return json.dumps(result)
    
    """_summary_
        get pdf info by uuid from database
        Returns:
            _type_: _description_
    """
    @pyqtSlot(str, result=str)
    def fetch_pdf_info(self, uuid):
        return json.dumps(self.DB[uuid].to_dict())
    
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
            need_add =False
            for pdf_url in selected:
                if not PDF_fileHandler.file_exists(pdf_url):
                    print(f"pdf_url: {pdf_url}")
                    PDF_fileHandler.save_file(pdf_url)
                    need_add = True
                book_name = os.path.basename(pdf_url)[:-4]
                if book_name not in self.DB:
                    new_data = PDFInfoObject(book_name=book_name)
                    # self.DB[PDFUUID(new_data.uuid,new_data.book_name)]=new_data
                    self.DB.set_data(new_data)
                    need_add = True
                if need_add:
                    new_uuids.append(new_data.uuid)
                    need_add = False
            if new_uuids:
                self.DB.save_database()
        print(new_uuids)
        return new_uuids
    
    @pyqtSlot(str, result=str)
    def delete_pdf(self, uuid):
        if uuid in self.DB:
            PDF_fileHandler.delete_file(self.DB[uuid].book_name)
            del self.DB[uuid]
            self.DB.save_database()
            return "ok"
        else:
            return "fail"

    @pyqtSlot()
    def close_window(self):
        self.superior.close()
    
class PDFViewer(QMainWindow):
    def __init__(self):
        super().__init__()
        self.pdf_url = None
        self.setWindowTitle("Load Local HTML with JS and DevTools")
        self.setGeometry(100, 100, 800, 600)
        self.channel = QWebChannel(self)
        self.js_bridge = JsBridge(self)
        self.channel.registerObject("qt_js_bridge", self.js_bridge)
        
        self.server = QWebSocketServer("FileTransferServer", QWebSocketServer.SslMode.NonSecureMode)
        self.server.listen(QHostAddress.SpecialAddress.LocalHost,1027)
        self.server.newConnection.connect(self.on_new_connection)
        # Create a central widget and a layout
        central_widget = QWidget()
        layout = QVBoxLayout(central_widget)
        self.setCentralWidget(central_widget)
        # self.html = get_index_html(pdf_url=f"./pdf_files/{pdf_map['1']}")
        
        # Create a QWebEngineView
        self.browser = QWebEngineView()
        self.browser.page().setWebChannel(self.channel)
        # Enable developer tools
        self.page = self.browser.page()
        self.dev_tools = QWebEngineView()
        self.dev_tools_page = QWebEnginePage(self)
        self.dev_tools.setPage(self.dev_tools_page)
        self.page.setDevToolsPage(self.dev_tools_page)

        # Add the browser and dev tools to the layout
        layout.addWidget(self.browser)
        layout.addWidget(self.dev_tools)

    def set_pdf(self, pdf_url):
        self.pdf_url = pdf_url
        self.html = get_index_html(pdf_url=pdf_url)
        self.browser.setHtml(self.html, baseUrl=QUrl(f"file:///{BASE_DIR}/"))
    
    def on_new_connection(self):
        self.socket = self.server.nextPendingConnection()
        self.socket.binaryMessageReceived.connect(self.on_binary_message_received)
        self.socket.textMessageReceived.connect(self.on_text_message_received)

    @pyqtSlot()
    def initiateFileTransfer(self):
        self.browser.page().runJavaScript("qt_js_bridge.startWebSocket('ws://localhost:12345');")
    def on_text_message_received(self, message):
        data = json.loads(message)
        
        # filename = data['filename']
        # content = data['content'].split(',')[1]  # 去掉 base64 前缀
        # with open(filename, "wb") as f:
        #     f.write(base64.b64decode(content))
        print(f"File {message} uploaded successfully!")

    def on_binary_message_received(self, message):
        # with open("received_file.pdf", "wb") as f:
        #     f.write(message)
        print(f"File received {message=}")

# class Server(QWebSocketServer):
#     def __init__(self,superior):
#         super().__init__("FileTransferServer", QWebSocketServer.SslMode.NonSecureMode)



# class PDFReadingHome(QMainWindow):
#     def __init__(self,):
#         super().__init__()
#         self.DB:PDFInfoDataBase=PDFInfoDataBase()
#         self.setWindowTitle("PDF Reading Home")
#         self.setGeometry(100, 100, 800, 600)
#         self.browser = QWebEngineView()
#         # 设置窗口标志以移除标题栏但保留其他功能
#         self.setWindowFlags(Qt.WindowType.CustomizeWindowHint 
#                             # |Qt.WindowType.WindowSystemMenuHint 
#                             # |Qt.WindowType.WindowMinimizeButtonHint |
#                             # |Qt.WindowType.WindowMaximizeButtonHint |
#                             # |Qt.WindowType.WindowCloseButtonHint
#                             )
#         central_widget = QWidget()
#         central_widget.setStyleSheet("margin: 0px; padding: 0px;")
#         layout = QVBoxLayout(central_widget)
#         layout.setContentsMargins(0, 0, 0, 0)
#         layout.setSpacing(0)
#         self.setStyleSheet("background-color:  rgba(255, 255, 255, 0); margin: 0px; padding: 1px;")
#         self.setCentralWidget(central_widget)
#         self.page = self.browser.page()
#         self.dev_tools = QWebEngineView()
#         self.dev_tools_page = QWebEnginePage(self)
#         self.dev_tools.setPage(self.dev_tools_page)
#         self.page.setDevToolsPage(self.dev_tools_page)

#         # Add the browser and dev tools to the layout
#         layout.addWidget(self.browser)
#         layout.addWidget(self.dev_tools)
#         setting = self.browser.settings()
#         setting.setAttribute(QWebEngineSettings.WebAttribute.LocalStorageEnabled, True)
#         setting.setAttribute(QWebEngineSettings.WebAttribute.LocalContentCanAccessRemoteUrls, True)
#         setting.setAttribute(QWebEngineSettings.WebAttribute.LocalContentCanAccessFileUrls, True)
#         self.browser.setUrl(QUrl(f"file:///{BASE_DIR}/home/home.html"))
#         # self.dev_tools.hide()
#         self.server = QWebSocketServer("FileTransferServer", QWebSocketServer.SslMode.NonSecureMode)
#         self.server.listen(QHostAddress.SpecialAddress.LocalHost,1027)
#         self.channel = QWebChannel(self)
#         self.js_bridge = JsBridge(self)
#         self.channel.registerObject("qt_js_bridge", self.js_bridge)
#         self.browser.page().setWebChannel(self.channel)

from backend.homePage import PDFReadingHome
    
if __name__ == "__main__":
    
    print(BASE_DIR)
    # 主线程可以继续执行其他任务
    try:
        app = QApplication(sys.argv)
        window = PDFReadingHome()
        # window.set_pdf(pdf_url=f"./pdf_files/{pdf_map['2']}")
        window.show()
        sys.exit(app.exec())
    except KeyboardInterrupt:
        print("\nServer is shutting down.")