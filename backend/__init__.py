from backend.homePage import *
from backend.pdfResourceHandler import PDFInfoObject,PDFClipInfoObject


def run_main():
    try:
        app = QApplication(sys.argv)
        window = PDFReadingHome()
        window.show()
        sys.exit(app.exec())
    except KeyboardInterrupt:
        print("\nServer is shutting down.")

if __name__ == "__main__":
    run_main()
    # print(BASE_DIR)
    # 主线程可以继续执行其他任务
    # try:
    #     app = QApplication(sys.argv)
    #     window = PDFReadingHome()
    #     window.show()
    #     sys.exit(app.exec())
    # except KeyboardInterrupt:
    #     print("\nServer is shutting down.")