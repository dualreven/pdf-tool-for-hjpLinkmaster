import { PDFViewerLoader, PDFViewerApplicationOptions,PDFViewerApplication,PDFViewerApplicationConstants } from "./web/viewer.js";
import {toast_success,toast_info} from './web/notify_system.js'
import {init_inject} from "./web/initializer.js"
import {CONSTANTS} from "./web/constants.js"
toast_info("等待PDF初始化","")
if (!window.is_dev_env){
    import("./web/viewer.css")
    import("./web/simple-notify.css")
}

PDFViewerApplicationOptions.set("workerSrc","./web/src/pdf.worker.js")
window.PDFViewerLoader = PDFViewerLoader;
window.PDFViewerApplicationOptions = PDFViewerApplicationOptions;


function after_init_inject(){
  window.Register_PDFViewerLoader();
  document.addEventListener(CONSTANTS.eventName.VIEWER_LOAD_COMPLETED, function(event) {
    //event.detail.app
    window.PDFViewerApplication.eventBus.on(CONSTANTS.eventName.PDF_SAVE_COMPLETED, function(evt) {
      toast_success('pdf保存成功',evt.filename);
    });
    window.PDFViewerApplication.eventBus.on(CONSTANTS.eventName.PDF_SAVE_START, function(evt) {
      toast_info('pdf保存中',evt.filename);
    });
    PDFViewerApplication.eventBus.on(CONSTANTS.eventName.PDF_LOAD_COMPLETED,(evt)=>{
      console.log(evt.source.documentInfo);
      toast_success("pdf初始化成功","");
    })
  });
}

init_inject(after_init_inject)
