# -*- coding: utf-8 -*-
"""
__project_ = 'pdf-tool-for-hjpLinkmaster'
__file_name__ = 'protoDataBase.py.py'
__author__ = '十五'
__email__ = '564298339@qq.com'
__time__ = '2024/8/14 16:37'
"""
from .utils import *


class ProtoDataBase:
    _instance = None

    def __new__(cls, *args, **kwargs):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    def __init__(self):
        if not hasattr(self, '_initialized'):
            self._uuid_data: dict = {}
            primitive_data = self.load_all_from_disk()
            for key, value in primitive_data.items():
                info = self.DBItem(**value)
                self.set_data(info)
            self._initialized = True

    def load_all_from_disk(self) -> dict:

        if os.path.exists(self.infofile_path):
            f = open(self.infofile_path.resolve(), 'r', encoding='utf-8')
            file = f.read()
        else:
            with open(self.infofile_path.resolve(), 'w', encoding='utf-8') as f:
                f.write("{}")
                file = "{}"
        pdf_info_dict = json.loads(file)
        return pdf_info_dict

    def __getitem__(self, key):
        if key in self._uuid_data:
            return self._uuid_data[key]
        else:
            raise KeyError(f"{key} not in {self.__class__.__name__}")

    def __contains__(self, key):
        return key in self._uuid_data

    def __delitem__(self, key):
        if key in self._uuid_data:
            del self._uuid_data[key]
        else:
            raise KeyError(f"{key} not in {self.__class__.__name__}")

    def __setitem__(self, key, value):
        raise NotImplementedError

    def set_data(self, data):
        assert type(data) == self.DBItem
        self._uuid_data[data.uuid] = data

    @property
    def DBItem(self, *args, **kwargs):
        raise NotImplementedError

    @property
    def infofile_path(self):
        raise NotImplementedError

    def save_database(self):
        data = {}
        for key, value in self._uuid_data.items():
            data[key] = value.to_dict()
        with open(self.infofile_path, 'w') as file:
            json.dump(data, file)
