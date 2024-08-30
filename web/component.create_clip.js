import {CONSTANTS} from "./constants.js"
import {generate8CharUUID} from "./func_tools.js"
import {createDiv as create_div} from "./func_tools.js"
/** @typedef {import("./event_utils.js").EventBus} EventBus */

/**
 * @typedef {Object} ClipSystemConstructorOptions
 * @property {HTMLButtonElement} imageClipCreationButton
 * @property {HTMLButtonElement} clipOperationButton
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
        this.imageClipCreationButton = options.imageClipCreationButton;
        this.clipOperationButton = options.clipOperationButton;
        this.createImageClipSubsystem = new CreateImageClipSubSystem(this,options.imageClipCreationButton); 
        this.clipSelectionSubsystem = new ClipOperationSubSystem(this,options.clipOperationButton);
        
        this.init();
    }

    init(){ 
        this.#bindEvents();
    }

    #bindEvents=()=>{
        this.eventBus.on("pagerendered",(data)=>{
            setTimeout(()=>{
                this.redraw(data.pageNumber)
            },100)
        })
    }
    
    
    redraw(pageNum){
        const page_el = document.querySelector(`div.page[data-page-number="${pageNum}"]`)
        const clip_layer = page_el.querySelector(".clip_layer")
        if(!clip_layer){
            create_clipLayer(page_el);
        }

        if (!this.#Clips[pageNum]){
            return;
        }
        for(const clip of this.#Clips[pageNum]){
            clip.redraw();
        }
    }

    /**
     * Append a new clip object to the given page number.
     * @param {ClipObject} clip
     */
    append_new_clip(clip){
        if(!this.#Clips[clip.pageNum]){
            this.#Clips[clip.pageNum] = [];
        }
        this.#Clips[clip.pageNum].push(clip);
    }
    /**
     * Remove a clip object from the given page number.
     * @param {number} pagenum
     * @param {string} clip_uuid
     */
    remove_clip(pagenum,clip_uuid){
        if(!this.#Clips[pagenum]){
            return;
        }
        this.#Clips[clip.pageNum] = this.#Clips[clip.pageNum].filter(clip=>clip.uuid !== clip_uuid);
    }

    get_clip_info(pagenum,clip_uuid){
        if(!this.#Clips[pagenum]){
            return null;
        }
        for(const clip of this.#Clips[pagenum]){
            if(clip.uuid === clip_uuid){
                return clip;
            }
        }
    }
    /**
     * Update the information of the given clip object in the given page number.
     * @param {ClipObject} clip - The clip object to be updated.
     */
    update_clip_info(clip){
        if(!this.#Clips[clip.pageNum]){
            return;
        }
        for(let i=0;i<this.#Clips[clip.pageNum].length;i++){
            if(this.#Clips[clip.pageNum][i].uuid === clip.uuid){
                this.#Clips[clip.pageNum][i] = clip;
                break;
            }
        }
    }
    build_clip_infoDB(){
        throw new Error("Not Implemented");
    }
    save_clip_infoDB(){
        throw new Error("Not Implemented");
    }

}

class EventRegister{

    constructor(self){
        this.self=self
    }
}

class SubSystem{
    /** 
     * @param {ClipSystem} superior 
     * @param {HTMLElement} triggerBtn
    */
    constructor(superior,triggerBtn){
        this.isStarted=false;
        /** @type {ClipSystem} */
        this.superior = superior;
        /** @type {EventBus} */
        this.eventBus = superior.eventBus;
        /** @type {HTMLElement} */
        this.triggerBtn = triggerBtn;
        
        this.init();
    }
    
    init=()=>{
        this.triggerBtn.addEventListener("click", this.toggle.bind(this));
    }
    
    bindEvents(){
        throw new Error("Not Implemented");
    }

    toggle(){
        if(this.isStarted){
            this.abort();
        }else{
            this.start();
        }
    }

    start(){
        this.isStarted = true;
        this.triggerBtn.classList.toggle("toggled",true);
    }
    abort(){
        this.over();
    }
    complete(){
        throw new Error("Not Implemented");
    }
    over(){
        this.isStarted = false;
        this.triggerBtn.classList.toggle("toggled",false);
    }
}

class CreateImageClipSubSystem extends SubSystem{
    /** @type {HTMLElement|null} */
    #curr_clip_layer = null
    /** @type {tempClipObj|null} */
    #tempClip = null
    /** @type {MouseMoveInfo|null} */
    mouseMoveInfo = null
    viewer_container = document.querySelector("#viewer");
    constructor(superior, triggerBtn) {
        super(superior, triggerBtn);
        // 如果需要，在这里添加额外的初始化代码
        this.#bindEvents();
    }

    start(){
        super.start();
        this.mouseMoveInfo = null;
        this.#curr_clip_layer = null;
        this.#tempClip = null;
        this.viewer_container.style.cursor = 'crosshair';
        this.eventBus.dispatch(CONSTANTS.eventName.PDF_CREATE_CLIP_START,{});
    }
    abort(){
        super.abort();
        this.eventBus.dispatch(CONSTANTS.eventName.PDF_CREATE_CLIP_ABORT,{});
    }
    complete(){
        const clip = new ClipObject(this.mouseMoveInfo.start,this.mouseMoveInfo.end,this.mouseMoveInfo.pageNum,this.mouseMoveInfo.pageDiv);
        this.superior.append_new_clip(clip);
        this.eventBus.dispatch(CONSTANTS.eventName.PDF_CREATE_CLIP_COMPLETED,{clip});
        this.abort();
    }

    over(){
        super.over();
        this.viewer_container.style.cursor = 'default';
        this.#curr_clip_layer?.classList.add("clear_pointer_events")
        this.#curr_clip_layer=null;
        this.#tempClip?.close();
        this.#tempClip = null;
        this.mouseMoveInfo = null;
    }

    #bindEvents=()=>{
        // console.log(this);
        window.addEventListener('keydown', this.#handle_keyDown);
        window.addEventListener('mousedown', this.#handle_mouseDown);
        window.addEventListener('mousemove', this.#handle_mouseMove);
        window.addEventListener('mouseup', this.#handle_mouseUp);
        this.eventBus.on(CONSTANTS.eventName.PDF_CLIP_OPERATION_START,this.abort.bind(this));
    }
    /**
     * Handle keydown events. If the key is 'c' and 'alt' key is pressed, start the create clip system.
     * If the key is 'Escape', abort the create clip system.
     * @param {KeyboardEvent} event - The keydown event.
     */
    #handle_keyDown=(event)=>{
        // console.log(this,event, event.key === 'Escape' ?true:false,self.isStarted?true:false);
        if (!this.isStarted && event.altKey && event.key === 'c') {
            this.start();
            return ;
        }
        if (event.key === 'Escape' && this.isStarted) {
            console.log("over")
            this.abort();
            return ;
        }
    }
    /**
     * @param {MouseEvent} event - The keydown event.
     */
    #handle_mouseDown=(event)=>{
        let self = this;
        if(self.isStarted&&event.buttons!==CONSTANTS.mouseButton.LEFT){
            this.abort();
            return;
        }
        if(!self.isStarted||event.buttons!==CONSTANTS.mouseButton.LEFT){
            return;
        }
        const page_div = ensure_event_contains_class(event.target)
        if(!page_div){
            return;
        }
        const canvas = page_div.querySelector("canvas");
        self.#curr_clip_layer = page_div.querySelector(".clip_layer");
        self.#curr_clip_layer.classList.remove("clear_pointer_events")
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
        
        // console.log(self.mouseMoveInfo)
    }
    /**
     * @param {MouseEvent} event - The keydown event.
     */
    #handle_mouseMove=(event)=>{
        let self = this;
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
    }
    /**
     * @param {MouseEvent} event - The keydown event.
     */
    #handle_mouseUp=(event)=>{
        let self = this;
        if(!self.#tempClip){
            return ; 
        }
        self.complete();
    }

}

class ClipOperationSubSystem extends SubSystem{
    /**@type {number|null} */
    current_page_num = null;
    /**@type {Array<number>} */
    page_selection_hisotry = [];
    constructor(superior,triggerBtn){
        super(superior,triggerBtn);
        this.#bindEvents();
    }
    
    complete(){}
    #bindEvents=()=>{
        this.eventBus.on(CONSTANTS.eventName.PDF_CREATE_CLIP_START,this.abort.bind(this));
        window.addEventListener("mousemove",this.#handle_mouseMove);
        window.addEventListener("keydown",this.#handle_keyDown);
        window.addEventListener("mousedown",this.#handle_mouseDown);
        
    }
    start(){
        super.start();
        this.eventBus.dispatch(CONSTANTS.eventName.PDF_CLIP_OPERATION_START,{});
    }
    abort(){
        super.abort();
        this.disable_selection();
        this.eventBus.dispatch(CONSTANTS.eventName.PDF_CLIP_OPERATION_ABORTED,{});
    }
    over(){
        super.over();
        // console.log(this.page_selection_hisotry)
        this.disable_selection();
        // console.log("this.disable_selection");
    }
    #handle_keyDown=(event)=>{
        if (event.key === 'Escape' && this.isStarted) {
            this.abort();
            return ;
        }
    }
    #handle_mouseDown=(event)=>{
        if(this.isStarted&&event.buttons!==CONSTANTS.mouseButton.LEFT){
            this.abort();
            return;
        }
    }
    /**
     * @param {MouseEvent} event - The keydown event.
     */
    #handle_mouseMove=(event)=>{
        if (!this.isStarted){
            return;
        }
        const page_div = ensure_event_contains_class(event.target)
        if(!page_div){
            return;
        }
        const pageNum= parseInt(page_div.getAttribute("data-page-number"));
        if(pageNum!==this.current_page_num){
            this.current_page_num = pageNum;
            this.enable_selection(page_div);
        }
    }

    /**
     * Enables the page selection mode for the given page element.
     * If the page is not already in the selection history, it will be added.
     * @param {HTMLElement} page_element - The page element to enable selection mode for.
     */
    enable_selection(page_element){
        if(!this.page_selection_hisotry.includes(this.current_page_num)){
            const clip_layer = page_element.querySelector(".clip_layer");
            if(clip_layer){
                clip_layer.classList.remove("clear_pointer_events");
                this.page_selection_hisotry.push(this.current_page_num);
            }
            
        }
    }

    disable_selection(){
        console.log("disable_selection",this.page_selection_hisotry)
        this.page_selection_hisotry.forEach(page_num=>{
            const container = document.querySelector(`div.page[data-page-number="${page_num}"]`)
            const clip_layer = container.querySelector(".clip_layer");
            console.log(container,clip_layer)
            clip_layer?.classList.add("clear_pointer_events");
        })
        this.page_selection_hisotry = [];
        this.current_page_num=null;
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
        this.clipObj.view.element.style.borderColor = "green";
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
    /** @type {HTMLElement} */
    #clipLayerElement


    constructor(start,end,pageNum,parentElement,uuid=null,comment=null,created_at=null,edit_at=null){
        this.uuid = uuid?uuid:generate8CharUUID()
        this.pageNum = pageNum
        this.view = new ClipObjectView(this,this.uuid);
        this.set_dom(parentElement);
        this.set_rect(start,end);
        this.comment = comment?comment:""
        this.#created_at = created_at?created_at:Date.now()
        this.#edit_at = edit_at?edit_at:Date.now()
        
    }
    redraw(){
        this.view = new ClipObjectView(this,this.uuid);
        this.set_dom(this.#parentElement);
        this.#update_view();
    }
    // create_div(){
    //     this.view = create_div({
    //         className:"clip_item_container",
    //         id:`clip-${this.uuid}`,
    //         cssStyle:{
    //             position:"absolute",
    //             borderColor:"red",
    //             borderStyle:"dashed",
    //             borderWidth:"3px",
    //         }
    //     })
    //     this.view.addEventListener("click",this.onClick.bind(this));
        
    // }
    onClick(){
        console.log(this.uuid,this.pageNum,"clicked")
        
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
        this.view.update_view({
            left : this.#percentRect.left*100 + "%",
            top : this.#percentRect.top*100 + "%",
            width : this.#percentRect.width*100 + "%",
            height : this.#percentRect.height*100 + "%",
        })
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
        const page_el = document.querySelector(`div.page[data-page-number="${this.pageNum}"]`)
        const clip_layer = page_el.querySelector(".clip_layer")
        this.#parentElement = clip_layer;
        this.view.set_parent(clip_layer);
        // if(clip_layer){
        //     this.#clipLayerElement = clip_layer
        // }
        // else{
        //     this.#clipLayerElement =create_clipLayer(this.#parentElement);
        // }
        // this.#clipLayerElement.appendChild(this.view);
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
class ClipObjectView{
    
    /** @type {boolean} */
    isSelected=false
    /**
     * Constructor for ClipObjectView.
     * @param {ClipObject} superior The superior ClipObject.
     * @prop {boolean} is_selected Whether the clip is selected.
     * @prop {HTMLDivElement} view The view element for the clip.
     */
    constructor(superior,uuid){
        this.uuid = uuid;
        this.superior = superior;
        this.element = create_div({
            className:"clip_item_container",
            id:`clip-${this.uuid}`,
        })
        const self = this
        this.element.addEventListener("mouseenter",(e)=>{
            if(this.isSelected){
                return;
            }
            this.element.classList.add("clip-hover");
        })
        this.element.addEventListener("mouseleave",(e)=>{
            if(this.isSelected){
                return;
            }
            this.element.classList.remove("clip-hover");
        })

        this.element.addEventListener("click",(e)=>{
            if(this.isSelected){
                return;
            }
            this.element.classList.add("clip-select");
            this.isSelected=true;
        })
        
        window.addEventListener("click",(e)=>{
            if (!this.isSelected){
                return;
            }
            const element = ensure_event_contains_class(e.target,"clip_item_container");
            if(!element||element !== this.element){
                this.isSelected=false;
                return 
            }
        })

    }
    set_select(){
        
    }
    set_unselect(){}

    /**
     * Update the position and size of the view based on the given parameters.
     * 
     * @param {Object} update_info - An object containing the left, top, width, and height of the view.
     */
    update_view({left,top,width,height}){
        this.element.style.left =left;
        this.element.style.top = top;
        this.element.style.width = width;
        this.element.style.height =height;
    }

    /**
     * Sets the parent element of the ClipObjectView.
     *
     * @param {HTMLElement} p_el - The parent element to which the ClipObjectView will be appended.
     * @return {void}
     */
    set_parent(p_el){
        p_el.appendChild(this.element);
    }
    remove(){
        this.element.remove();
    }
}
/**
 * 
 * @param {HTMLElement} parentElement 
 * @returns 
 */
function create_clipLayer(parentElement){
    const clip_layer = create_div({
        className:"clip_layer clear_pointer_events",
        cssStyle:{
            position:"absolute",
            top:"0px",
            left:"0px",
            width:"100%",
            height:"100%",
        }
    })
    parentElement.appendChild(clip_layer)
    // const canvas_layer = parentElement.querySelector(".canvasWrapper")
    // canvas_layer.insertAdjacentElement("afterend",clip_layer);
    return clip_layer
}

export {ClipSystem}