import { CONSTANTS } from "./constants.js";
import {toggleExpandedBtn} from "./ui_utils.js"

/**
 * @typedef {Object} AddBookMarkConstructorOptions
 * @property {HTMLButtonElement} toggleButton
 * @property {HTMLButtonElement} cancelButton
 * @property {HTMLButtonElement} submitButton
 * @property {HTMLDivElement} container
 * @property {HTMLInputElement} userInput
 * @property {HTMLSelectElement} parentList
 */

/** @typedef {import("./event_utils.js").EventBus} EventBus */


class AddBookMark{
    #opts
        /**
     * Constructor for the AddBookMark class.
     *
     * @param {AddBookMarkConstructorOptions} options - Constructor options.
     * @param {EventBus} eventBus - The event bus.
     */
    constructor(options, eventBus){
        this.opened = false;
        this.#opts = options;
        this.eventBus = eventBus;
        this.toggleButton = options.toggleButton;
        this.cancelButton = options.cancelButton;
        this.submitButton = options.submitButton;
        this.container = options.container;
        this.userInput = options.userInput;
        this.parentList = options.parentList;
        this.init();
    }

    init(){ 
        this.#load_parent_list();
        this.#bindEvents();
    }

    #bindEvents(){
        this.toggleButton.addEventListener("click", this.toggleContainer.bind(this));
        this.cancelButton.addEventListener("click", this.close.bind(this));
        this.submitButton.addEventListener("click", this.submit.bind(this));
        this.eventBus.on(CONSTANTS.eventName.SOME_MONO_MODE_START,(e)=>{
            if(e.signal!==CONSTANTS.eventName.ADD_BOOKMARK_START && this.opened){
                this.close();
            }
        })
    }

    toggleContainer(){
        if(this.opened){
            this.close();
        }else{
            this.open();
        }
    }
    
    open(){
        toggleExpandedBtn(this.toggleButton, true, this.container);
        this.userInput.value = "";
        this.parentList.selectedIndex = 0;
        this.opened = true;
        this.eventBus.dispatch(CONSTANTS.eventName.SOME_MONO_MODE_START,{
            signal:CONSTANTS.eventName.ADD_BOOKMARK_START
        })
    }

    close(){
        toggleExpandedBtn(this.toggleButton, false, this.container);
        this.opened = false;
    }
    
    submit(){
        console.log("addbookmark submit")
        this.close();
    }

    #load_parent_list(){
        
    }

    
}
/**
 * 获取当前 PDFViewer 的 dest
 * @param {PDFViewer} pdfViewer PDFViewer 实例
 * @returns {Array} dest 参数
 */
function getCurrentDest(pdfViewer) {
    // 获取当前页面
    const currentPageIndex = pdfViewer.currentPageNumber - 1;
    const currentPageView = pdfViewer._pages[currentPageIndex];
    
    // 获取视图信息
    const viewport = currentPageView.viewport;
    const container = pdfViewer.container;
    const containerRect = container.getBoundingClientRect();
    const pageRect = currentPageView.div.getBoundingClientRect();
    
    // 计算相对位置
    const relativeTop = (containerRect.top - pageRect.top) / viewport.scale;
    const relativeLeft = (containerRect.left - pageRect.left) / viewport.scale;
    
    // 创建 dest 参数
    const dest = [
      currentPageView.pdfPage.ref,
      { name: 'XYZ' },
      relativeLeft,
      viewport.height - relativeTop,
      null
    ];
    
    return dest;
  }
export {AddBookMark}