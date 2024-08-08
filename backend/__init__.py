from backend.homePage import *

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