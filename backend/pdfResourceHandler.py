from .utils import *
from .protoDataBase import ProtoDataBase




class PDFOutlineItem:
    def __init__(self, title: str, page: int,items:dict):
        self.title = title
        self.page = page
        self.items:list[PDFOutlineItem] = [PDFOutlineItem(**item) for item in items]

    def to_dict(self):
        d= {"title": self.title, "page": self.page, "items": []}
        for child in self.items:
            d["items"].append(child.to_dict())

        return d

@dataclasses.dataclass
class PDFOutlineObject:

    def __init__(self,pdf_uuid,uuid,items,created_at,updated_at):
        self.pdf_uuid:str = pdf_uuid
        self.uuid:str = uuid
        self.items:list[PDFOutlineItem] = [PDFOutlineItem(**item) for item in items]
        self.created_at:int = created_at
        self.updated_at:int = updated_at



    def to_dict(self):
        d= {"pdf_uuid": self.pdf_uuid, "uuid": self.uuid, "created_at": self.created_at, "updated_at": self.updated_at, "items": []}
        for item in self.items:
            d["items"].append(item.to_dict())
        return d



@dataclasses.dataclass
class PDFInfoObject:
    book_name: str
    uuid: str = dataclasses.field(default_factory=lambda: str(uuid.uuid4())[:8])
    alias: str = ""
    page_count: int = 0
    clips_count: int = 0
    reading_progress: float = 0.0
    last_read_page: int = 0
    outline:str = ""
    created_at: int = dataclasses.field(default_factory=lambda: int(time.time()))
    updated_at: int = dataclasses.field(default_factory=lambda: int(time.time()))
    read_at: int = dataclasses.field(default_factory=lambda: int(time.time()))
    stars: int = 0
    tags: List[str] = dataclasses.field(default_factory=list)
    comment: str = ""
    thumbnail: str = ""
    clips: dict[int, list[str]] = dataclasses.field(default_factory=dict)
    # def __post_init__(self):
    #     if isinstance(self.clips, dict):
    #         self.clips = {
    #             int(pagenum): [PDFClipInfoObject(**clip) for clip in clips_list] for pagenum, clips_list in self.clips.items()
    #         }
    def to_dict(self):
        return dataclasses.asdict(self)


class CLIP_TYPE:
    IMAGE=0
    TEXT=1

@dataclasses.dataclass()
class PDFClipInfoObject:
    pdf_uuid: str
    page_num: int
    start: tuple[float, float]
    end: tuple[float, float]
    uuid: str = dataclasses.field(default_factory=lambda: str(uuid.uuid4())[:8])
    created_at: int = dataclasses.field(default_factory=lambda: int(time.time()))
    edit_at: int = dataclasses.field(default_factory=lambda: int(time.time()))
    comment: str = ""
    clip_type:int = CLIP_TYPE.IMAGE
    def to_dict(self):
        return dataclasses.asdict(self)


class PDFViewerObj:
    def __init__(self,pdf_uuid,pdf_name,socket_client=None,viewer=None):
        from .pdfviewer import PDFViewer
        self.pdf_uuid:str = pdf_uuid
        self.pdf_name:str = pdf_name
        self.socket_client:Optional[QWebSocket] = socket_client
        self.viewer:Optional[PDFViewer] = viewer


class PDF_fileHandler:
    # class PdfInfoRecord:
    #     pass
    @staticmethod
    def save_file(pdf_url):
        # if not os.path.exists(PDF_lib_path):
        pdf_name = os.path.basename(pdf_url)
        new_pdf_url = os.path.join(PDF_file_path, pdf_name)
        if not os.path.exists(PDF_file_path):
            os.makedirs(PDF_file_path)
        shutil.copyfile(pdf_url, new_pdf_url)

    @staticmethod
    def file_exists(pdf_url):
        pdf_name = os.path.basename(pdf_url)
        new_pdf_url = os.path.join(PDF_file_path, pdf_name)
        print(f"{new_pdf_url=}")
        return os.path.exists(new_pdf_url)

    @staticmethod
    def save_info(pdf_url) -> str:
        book_name = os.path.basename(pdf_url)[:-4]
        info = PDFInfoObject(book_name=book_name)
        PDFInfoDataBase.save_new_info(info)
        return info.uuid
        pass

    @staticmethod
    def delete_file(book_name):
        if os.path.exists(os.path.join(PDF_file_path, book_name + ".pdf")):
            os.remove(os.path.join(PDF_file_path, book_name + ".pdf"))

    @staticmethod
    def load_file_as_bytes(pdf_url):
        with open(pdf_url, "rb") as f:
            return f.read()


class ThumbnailFileHandler:
    @staticmethod
    def file_exists(pdf_uuid):
        file_path = PDF_file_path / Path("thumbnails/" + pdf_uuid + ".png")
        print(f"thumbnails {file_path=}")
        return os.path.exists(file_path.as_posix())

    @staticmethod
    def file_save(base64_str, pdf_uuid):
        file_path = PDF_file_path / Path("thumbnails/" + pdf_uuid + ".png")
        with open(file_path, "wb") as f:
            f.write(base64.b64decode(base64_str))

class LargeFileServer(QWebSocketServer):
    def __init__(self, superior):
        super().__init__("FileTransferServer", QWebSocketServer.SslMode.NonSecureMode)


class PDFOutLineDataBase(ProtoDataBase):
    @property
    def DBItem(self, *args, **kwargs):
        return PDFOutlineObject

    @property
    def infofile_path(self):
        return outline_infofile_path.resolve()


class PDFClipsDataBase(ProtoDataBase):

    @property
    def DBItem(self, *args, **kwargs):
        return PDFClipInfoObject

    @property
    def infofile_path(self):
        return clips_infofile_path.resolve()




class PDFInfoDataBase(ProtoDataBase):

    def __init__(self):
        self._book_name_data: dict[TYPE_BOOK_NAME, PDFInfoObject] = {}
        super().__init__()

    @property
    def infofile_path(self):
        return PDF_infofile_path.resolve()

    @property
    def DBItem(self, *args, **kwargs):
        return PDFInfoObject

    def __getitem__(self, key):
        if key in self._uuid_data:
            return self._uuid_data[key]
        else:
            return self._book_name_data[key]

    def __contains__(self, key):
        return key in self._uuid_data or key in self._book_name_data

    def __delitem__(self, key):
        if key in self._uuid_data:
            data = self._uuid_data[key]
            del self._uuid_data[key]
            del self._book_name_data[data.book_name]
        elif key in self._book_name_data:
            data = self._book_name_data[key]
            del self._book_name_data[key]
            del self._uuid_data[data.uuid]
        else:
            raise KeyError(f"{key} not in {self.__class__.__name__}")

    def __setitem__(self, key, value: "PDFInfoObject"):
        raise NotImplementedError

    def set_data(self, data: "PDFInfoObject"):
        assert type(data) == PDFInfoObject
        self._book_name_data[data.book_name] = data
        self._uuid_data[data.uuid] = data

    def find_pdf_files(self):
        pdf_files = []
        # 列出目录中的所有文件和文件夹
        for filename in os.listdir(PDF_file_path):
            # 构造完整路径
            full_path = os.path.join(PDF_file_path, filename)
            # 检查是否是文件以及扩展名是否为.pdf
            if os.path.isfile(full_path) and filename.lower().endswith('.pdf'):
                pdf_files.append(filename[:-4])
        return pdf_files


    def save_new_pdf(self, pdf_url):
        PDF_fileHandler.save_file(pdf_url)



if __name__ == "__main__":

    pass