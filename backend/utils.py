import inspect
from datetime import datetime
from http.server import HTTPServer, SimpleHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
import os,mimetypes,time,uuid
from typing import *
import threading
import abc
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
RED = "\033[31m"
GREEN = "\033[32m"
YELLOW = "\033[33m"
BLUE = "\033[34m"
RESET = "\033[0m"
TYPE_PDF_UUID = TYPE_BOOK_NAME = TYPE_PDFCLIPS_UUID = str



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
        FETCH_PDF_FILE=4

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
PDF_file_path = (BASE_DIR / Path("./pdf_files/")).resolve()
PDF_infofile_path = PDF_file_path / Path("pdf_info.json")
clips_infofile_path = PDF_file_path / Path("pdfclips_info.json")
clips_imgfile_path = PDF_file_path / Path("clips")
print(f"current_file={current_file}",f"BASE_DIR={BASE_DIR}")

class templates:
    homepage = "./templates/homepage.html"
    pdfInfo = "./templates/pdfInfo.html"
    pdfViewer = Path(os.path.join(BASE_DIR,"../index.html")).resolve().as_posix()
    pdfClips = "./templates/pdfClips.html"



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