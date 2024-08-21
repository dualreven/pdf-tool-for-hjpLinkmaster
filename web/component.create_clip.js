import {CONSTANTS} from "./constants.js"
import {generate8CharUUID} from "./func_tools.js"
/** @typedef {import("./event_utils.js").EventBus} EventBus */

/**
 * @typedef {Object} ClipSystemConstructorOptions
 * @property {HTMLButtonElement} toggleButton
 */

/** @typedef {import("./types.js").Test} Test */


/** 
 * @typedef {Object} POS
 * @property {number} x
 * @property {number} y
 * /

/**
 * @typedef {Object} Rect
 * @property {number} left
 * @property {number} top
 * @property {number} width
 * @property {number} height
 * /

/**
 * @typedef {Object} Size
 * @property {number} width
 * @property {number} height
 */

/**
 * @typedef {Object} MouseMoveInfo
 * @property {POS} start
 * @property {POS} end 
 * @property {number} pageNum
 * @property {HTMLDivElement} pageDiv
 */

/**
 * Represents a PDF clip information object.
 * @typedef {Object} PDFClipInfoObject
 * @property {string} pdf_uuid - The UUID of the PDF document.
 * @property {string} uuid - A unique identifier for this clip, defaulting to an 8-character UUID.
 * @property {number} page_num - The page number of the clip in the PDF.
 * @property {number[]} start - The starting coordinates (x, y) of the clip as a tuple.
 * @property {number[]} end - The ending coordinates (x, y) of the clip as a tuple.
 * @property {number} created_at - The creation timestamp.
 * @property {number} edit_at - The last update timestamp.
 * @property {string} comment - An optional comment for the clip.
 */
/**
 * 
 * @param {HTMLDivElement} eventTarget 
 * @returns {HTMLDivElement}
 */
function ensure_event_contains_class(eventTarget,className="page"){
    let result = null;
    while(eventTarget!==document.body){
        if(eventTarget.classList.contains(className)){
            result = eventTarget;
            break;
        }
        eventTarget = eventTarget.parentElement;
    }
    return result;
}

class ClipSystem{
    

    #opts   
    /**
     * @type {Object<number, ClipObject[]>} 
     */
    #Clips = {}
    /**
     * @type {tempClipObj|null}
     */
    #tempClip = null
    /**
     * Constructor for the AddBookMark class.
     *
     * @param {ClipSystemConstructorOptions} options - Constructor options.
     * @param {EventBus} eventBus - The event bus.
     */
    constructor(options, eventBus){
        this.isStarted = false;
        /**
         * @type {MouseMoveInfo}
         */
        this.mouseMoveInfo = null
        this.#opts = options;
        this.eventBus = eventBus;
        this.toggleButton = options.toggleButton;
        this.init();
    }

    init(){ 
        this.#bindEvents();
    }

    #bindEvents(){
        this.toggleButton.addEventListener("click", this.toggle.bind(this));
        let self = this;
        window.addEventListener('keydown', function(event) {
            if (event.altKey && event.key === 'c') {
                self.start();
            }
            else if (event.key === 'Escape' && self.isStarted) {
                // console.log('Escape key was pressed');
                // 执行相应的操作
                self.abort();
            }
        });

        document.addEventListener("mousedown", function(event) {
            if(!self.isStarted||event.buttons!==CONSTANTS.mouseButton.LEFT){
                return;
            }
            const page_div = ensure_event_contains_class(event.target)
            if(!page_div){
                return;
            }
            const canvas = page_div.querySelector("canvas");
            const rect = canvas.getBoundingClientRect();
            const x = (event.clientX - rect.left)/rect.width; // 鼠标相对于div的X坐标
            const y = (event.clientY - rect.top)/rect.height;  // 鼠标相对于div的Y坐标
            const pageNum= parseInt(page_div.getAttribute("data-page-number"));
            self.mouseMoveInfo = {
                start:{x,y},
                end:{x,y},
                pageNum:pageNum,
                pageDiv:page_div
            }
            self.#tempClip=new tempClipObj(self,self.mouseMoveInfo)
            
            console.log(self.mouseMoveInfo)
            // console.log(x,y,curr_page,self);
        })

        document.addEventListener("mousemove", function(event) {
            if(!self.mouseMoveInfo||!self.isStarted||event.buttons!==CONSTANTS.mouseButton.LEFT){
                return;
            }
            const page_div = ensure_event_contains_class(event.target)
            if(!page_div){
                return;
            }
            const canvas = page_div.querySelector("canvas");
            const rect = canvas.getBoundingClientRect();
            const x = (event.clientX - rect.left)/rect.width; // 鼠标相对于div的X坐标
            const y = (event.clientY - rect.top)/rect.height;  // 鼠标相对于div的Y坐标
            self.mouseMoveInfo.end = {x,y};
            self.#tempClip.update(self.mouseMoveInfo);
        })

        document.addEventListener("mouseup", function(event) {
            if(!self.#tempClip){
                return ; 
            }
            self.complete();
        })
        // this.eventBus.on(CONSTANTS.eventName.PDF_PAGE_CHANGED,({pageNumber, pageLabel})=>console.log(pageNumber, pageLabel))
        this.eventBus.on("pagerendered",(data)=>{
            setTimeout(()=>{
                self.redraw(data.pageNumber)
            },100)
        })
    }
    
    toggle(){
        if(this.isStarted){
            this.abort();
        }else{
            this.start();
        }
    }

    redraw(pageNum){
        console.log("redraw system",pageNum)
        if (!this.#Clips[pageNum]){
            return;
        }
        for(const clip of this.#Clips[pageNum]){
            clip.redraw();
        }
    }

    start(){
        this.isStarted = true;
        this.toggleButton.classList.toggle("toggled",true);
        document.body.style.cursor = 'crosshair';
        this.eventBus.dispatch(CONSTANTS.eventName.PDF_CREATE_CLIP_START,{});
    }

    abort(){
        this.#over()
        this.eventBus.dispatch(CONSTANTS.eventName.PDF_CREATE_CLIP_ABORT,{});
    }
    
    complete(){
        const clip = new ClipObject(this.mouseMoveInfo.start,this.mouseMoveInfo.end,this.mouseMoveInfo.pageNum,this.mouseMoveInfo.pageDiv);
        // console.log(clip.to_dict())
        if(this.#Clips[clip.pageNum]){
            this.#Clips[clip.pageNum].push(clip);
        }
        else{
            this.#Clips[clip.pageNum] = [clip]
        }
        
        this.#over()    
        this.eventBus.dispatch(CONSTANTS.eventName.PDF_CREATE_CLIP_COMPLETED,{});
    }

    #over(){
        this.isStarted = false;
        this.toggleButton.classList.toggle("toggled",false);
        document.body.style.cursor = 'default';
        this.#tempClip?.close();
        this.#tempClip = null;
        this.mouseMoveInfo = null;

    }
    

}


class tempClipObj{

    /**
     * Initializes a new instance of the ClipController class.
     *
     * @param {ClipSystem} system - The system object associated with the clip controller.
     * @param {MouseMoveInfo} mouseMoveInfo - The mouse move information.
     */
    constructor(system,mouseMoveInfo){
        this.system = system
        this.clipObj=new ClipObject(mouseMoveInfo.start,mouseMoveInfo.end,mouseMoveInfo.pageNum,mouseMoveInfo.pageDiv);
        this.clipObj.view.style.borderColor = "green";
    }
    
    close(){
        this.clipObj.close();
    }
    /**
     *@param {MouseMoveInfo} mouseMoveInfo
     */
    update(mouseMoveInfo){
        this.clipObj.set_rect(mouseMoveInfo.start,mouseMoveInfo.end);
    }
    upload(){

    }
    
}

class ClipObject{
    
    /** @type {Rect} */
    #percentRect
    #created_at
    #edit_at
    /** @type {HTMLElement} */
    #parentElement


    constructor(start,end,pageNum,parentElement,uuid=null,comment=null,created_at=null,edit_at=null){
        this.create_div();
        this.pageNum = pageNum
        this.set_dom(parentElement);
        this.set_rect(start,end);
        this.uuid = uuid?uuid:generate8CharUUID()
        this.comment = comment?comment:""
        this.#created_at = created_at?created_at:Date.now()
        this.#edit_at = edit_at?edit_at:Date.now()
        
    }
    redraw(){
        this.create_div();
        // console.log(this.#parentElement);
        this.set_dom(this.#parentElement);
        this.#update_view();
    }
    create_div(){
        this.view = document.createElement("div");
        this.view.style.borderColor = "red";
        this.view.style.borderStyle = "dashed";
        this.view.style.borderWidth = "3px";
        this.view.style.position = "absolute";
    }
        /**
     * Sets the start and end coordinates of the clip frame.
     *
     * @param {POS} start - The start coordinates with x and y properties.
     * @param {POS} end - The end coordinates with x and y properties.
     * @return {void}
     */
    set_rect(start,end){
        
        this.#percentRect = {
            left :  Math.min(start.x,end.x),
            top:    Math.min(start.y,end.y),
            width:  Math.abs(start.x - end.x),
            height: Math.abs(start.y - end.y),
        }
        
        this.#update_view();
    }
    #update_view(){
        this.view.style.left = this.#percentRect.left*100 + "%";
        this.view.style.top = this.#percentRect.top*100 + "%";
        this.view.style.width = this.#percentRect.width*100 + "%";
        this.view.style.height = this.#percentRect.height*100 + "%";
    }


    set_pos(x,y){
        this.#percentRect.left = x;
        this.#percentRect.top = y;
        this.#update_view();
    }
    set_size(w,h){
        this.#percentRect.width = w;
        this.#percentRect.height = h;
        this.#update_view();
    }
        /**
     * Sets the DOM element for the ClipObject.
     *
     * @param {HTMLElement} parent_element - The parent element to which the ClipObject will be appended.
     * @return {void}
     */
    set_dom(parent_element){
        this.#parentElement = parent_element;
        this.#parentElement.appendChild(this.view);
    }

    close(){
        this.view.remove();
    }
    /**
     * Retrieves information about the ClipObject.
     *
     * @return {PDFClipInfoObject} An object containing the ClipObject's properties, including its UUID, page number, start and end coordinates, comment, creation and edit timestamps.
     */
    to_dict(){
        const start = {
            x : this.#percentRect.left,
            y : this.#percentRect.top
        }
        const end = {
            x : this.#percentRect.left + this.#percentRect.width,
            y : this.#percentRect.top + this.#percentRect.height
        }
        return {
            pdf_uuid:null,
            uuid : this.uuid,
            page_num : this.pageNum,
            start : [start.x,start.y],
            end : [end.x,end.y],
            comment:this.comment,
            created_at:this.#created_at,
            edit_at:this.#edit_at
        }
    }

}

export {ClipSystem}