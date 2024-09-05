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
        this.clipOperationSubsystem = new ClipOperationSubSystem(this,options.clipOperationButton);
        
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
        let clip_layer = page_el.querySelector(".clip_layer")
        if(!clip_layer){
            clip_layer = create_clipLayer(page_el);
        }

        if (!this.#Clips[pageNum]){
            return;
        }
        for(const clip of this.#Clips[pageNum]){
            clip.redraw();
        }
        if(this.clipOperationSubsystem.isStarted){
            this.clipOperationSubsystem.disable_selection();
            this.clipOperationSubsystem.enable_selection(page_el);
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
    /**
     * Disable the selection of the given clip object in the given page number.
     * @param {number} pageNum - The page number of the clip object to be disabled.
     * @param {string} clip_uuid - The UUID of the clip object to be disabled.
     */
    disable_selection(pageNum,clip_uuid){
        this.#Clips[pageNum].find(clip=>clip.uuid===clip_uuid)?.view.set_unselect();
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
        this.eventBus.dispatch(CONSTANTS.eventName.SOME_MONO_MODE_START,{
            signal:CONSTANTS.eventName.PDF_CREATE_IMGCLIP_START
        });
        this.eventBus.dispatch(CONSTANTS.eventName.PDF_CREATE_IMGCLIP_START,{});
    }
    abort(){
        super.abort();
        this.eventBus.dispatch(CONSTANTS.eventName.PDF_CREATE_IMGCLIP_ABORT,{});
    }
    complete(){
        const clip = new ClipObject(this.mouseMoveInfo.start,this.mouseMoveInfo.end,this.mouseMoveInfo.pageNum,this.mouseMoveInfo.pageDiv);
        this.superior.append_new_clip(clip);
        this.eventBus.dispatch(CONSTANTS.eventName.PDF_CREATE_IMGCLIP_COMPLETED,{clip});
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
        window.addEventListener('keydown', this.#handle_keyDown);
        window.addEventListener('mousedown', this.#handle_mouseDown);
        window.addEventListener('mousemove', this.#handle_mouseMove);
        window.addEventListener('mouseup', this.#handle_mouseUp);
        this.eventBus.on(CONSTANTS.eventName.SOME_MONO_MODE_START,(e)=>{
            if(e.signal !==CONSTANTS.eventName.PDF_CREATE_IMGCLIP_START && this.isStarted){
                this.abort();
            }
        });
    }
    /**
     * Handle keydown events. If the key is 'c' and 'alt' key is pressed, start the create clip system.
     * If the key is 'Escape', abort the create clip system.
     * @param {KeyboardEvent} event - The keydown event.
     */
    #handle_keyDown=(event)=>{
        if (!this.isStarted && event.altKey && event.key === 'c') {
            this.start();
            return ;
        }
        if (event.key === 'Escape' && this.isStarted) {
            this.abort();
            return ;
        }
    }
    /**
     * @param {MouseEvent} event - The keydown event.
     */
    #handle_mouseDown=(event)=>{
        let self = this;
        if(self.isStarted&&event.button!==CONSTANTS.mouseButton.LEFT){
            this.abort();
            return;
        }
        if(!self.isStarted||event.button!==CONSTANTS.mouseButton.LEFT){
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
        
    }
    /**
     * @param {MouseEvent} event - The keydown event.
     */
    #handle_mouseMove=(event)=>{
        let self = this;
        if(!self.mouseMoveInfo||!self.isStarted||event.button!==CONSTANTS.mouseButton.LEFT){
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
        this.eventBus.on(CONSTANTS.eventName.SOME_MONO_MODE_START,(e)=>{
            if(e.signal !==CONSTANTS.eventName.PDF_CLIP_OPERATION_START && this.isStarted){
                this.abort();
            }
        });
        window.addEventListener("mousemove",this.#handle_mouseMove);
        window.addEventListener("keydown",this.#handle_keyDown);
        window.addEventListener("mousedown",this.#handle_mouseDown);
        
    }
    start(){
        super.start();
        this.eventBus.dispatch(CONSTANTS.eventName.SOME_MONO_MODE_START,{
            signal:CONSTANTS.eventName.PDF_CLIP_OPERATION_START
        });
        this.eventBus.dispatch(CONSTANTS.eventName.PDF_CLIP_OPERATION_START,{});
    }
    abort(){
        super.abort();
        this.disable_selection();
        this.eventBus.dispatch(CONSTANTS.eventName.PDF_CLIP_OPERATION_ABORTED,{});
    }
    over(){
        super.over();
        this.disable_selection();
    }
    #handle_keyDown=(event)=>{
        if (event.key === 'Escape' && this.isStarted) {
            this.abort();
            return ;
        }
    }
    #handle_mouseDown=(event)=>{
        if(this.isStarted&&event.button!==CONSTANTS.mouseButton.LEFT){
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
        const pageNum = parseInt(page_element.getAttribute("data-page-number"));
        if(!this.page_selection_hisotry.includes(pageNum)){
            const clip_layer = page_element.querySelector(".clip_layer");
            if(clip_layer){
                clip_layer.classList.remove("clear_pointer_events");
                this.page_selection_hisotry.push(pageNum);
            }
            
        }
    }

    disable_selection(){
        this.page_selection_hisotry.forEach(page_num=>{
            const container = document.querySelector(`div.page[data-page-number="${page_num}"]`)
            const clip_layer = container.querySelector(".clip_layer");
            const clip_selected = clip_layer.querySelector(".clip_item_container.clip-selected")
            if(clip_selected){
                this.superior.disable_selection(page_num,clip_selected.id.split("-")[1]);
            }
           
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
    percentRect
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
        const isSelected = this.view.isSelected?true:false;
        this.view = new ClipObjectView(this,this.uuid,isSelected);
        this.set_dom(this.#parentElement);
        this.#update_view();
    }
    /**
     * Sets the start and end coordinates of the clip frame.
     *
     * @param {POS|null} start - The start coordinates with x and y properties.
     * @param {POS|null} end - The end coordinates with x and y properties.
     * @param {Size} size - The rect object with width and height properties.
     * @return {void}
     */
    set_rect(start,end){

        
        this.percentRect = {
            left :  Math.min(start.x,end.x),
            top:    Math.min(start.y,end.y),
            width:  Math.abs(start.x - end.x),
            height: Math.abs(start.y - end.y),
        }
        
        
        
        this.#update_view();
    }
    #update_view(){
        this.view.update_view({
            left : this.percentRect.left*100 + "%",
            top : this.percentRect.top*100 + "%",
            width : this.percentRect.width*100 + "%",
            height : this.percentRect.height*100 + "%",
        })
    }


    set_pos(x,y){
        this.percentRect.left = x;
        this.percentRect.top = y;
        this.#update_view();
    }
    set_size(w,h){
        this.percentRect.width = w;
        this.percentRect.height = h;
        this.#update_view();
    }
        /**
     * Sets the DOM element for the ClipObject.
     *
     * @param {HTMLElement} parent_element - The parent element to which the ClipObject will be appended.
     * @return {void}
     */
    set_dom(parent_element){
        const page_el = document.querySelector(`div.page[data-page-number="${this.pageNum}"]`);
        const clip_layer = page_el.querySelector(".clip_layer");
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
            x : this.percentRect.left,
            y : this.percentRect.top
        }
        const end = {
            x : this.percentRect.left + this.percentRect.width,
            y : this.percentRect.top + this.percentRect.height
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
    /** @type {HTMLDivElement|null} */
    parent_container = null
    /** @type {Size|null} */
    parent_size = null
    /**
     * Constructor for ClipObjectView.
     * @param {ClipObject} superior The superior ClipObject.
     * @prop {boolean} is_selected Whether the clip is selected.
     * @prop {HTMLDivElement} view The view element for the clip.
     */
    constructor(superior,uuid,isSelected=false){
        this.isSelected=isSelected;
        this.uuid = uuid;
        this.superior = superior;
        this.element = create_div({
            className:"clip_item_container",
            id:`clip-${this.uuid}`,
        })
        const parser = new DOMParser();
        this.toolbar = parser.parseFromString(clip_toolbar_html_str, "text/html").body.firstChild;
        this.control_bar = create_div({
            className:"clip_item_control_bar hidden",
        })
        this.element.appendChild(this.control_bar)
        this.element.appendChild(this.toolbar)
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
            this.set_select();
        })
        
        window.addEventListener("click",(e)=>{
            if (!this.isSelected){
                return;
            }
            const element = ensure_event_contains_class(e.target,"clip_item_container");
            if(!element||element.id !== this.element.id){
                this.set_unselect();
                return 
            }
        })
        if(isSelected){
            this.set_select();
        }

    }


    set_select(){
        this.element.classList.remove("clip-hover");
        this.element.classList.add("clip-selected");
        this.control_bar.classList.remove("hidden");
        this.toolbar.classList.remove("hidden");
        this.isSelected=true;
    }
    set_unselect(){
        this.element.classList.remove("clip-selected");
        this.control_bar.classList.add("hidden");
        this.toolbar.classList.add("hidden");
        this.isSelected=false;
        this.unset_toolbar();
    }

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
    
    set_toolbar(){
        
        toolbar.classList.remove("hidden");
        this.element.appendChild(toolbar);
    }
    unset_toolbar(){
        const toolbar = this.element.querySelector("#clipItemToolBar");
        toolbar?.classList.add("hidden");
    }
    /**
     * Sets the parent element of the ClipObjectView.
     *
     * @param {HTMLElement} p_el - The parent element to which the ClipObjectView will be appended.
     * @return {void}
     */
    set_parent(p_el){
        this.parent_container = p_el;
        this.parent_container.appendChild(this.element);
        const rect = this.parent_container.getBoundingClientRect();
        this.parent_size = {
            width : rect.width,
            height : rect.height
        }
        this.#set_draggable_resizable(p_el);
    }
    remove(){
        this.element.remove();
    }
    #dragMoveListener(event) {
        const target = event.target;
        const x_percent = this.superior.percentRect.left;
        const y_percent = this.superior.percentRect.top;
        const x_new = x_percent + event.dx/this.parent_size.width
        const y_new = y_percent + event.dy/this.parent_size.height
        this.superior.set_pos(x_new,y_new);
      }

    #resizeMoveListener(event) {
        const width = event.rect.width / this.parent_size.width
        const height = event.rect.height / this.parent_size.height
        this.superior.set_size(width,height)
    }

    #set_draggable_resizable(){
        
        interact(this.element)
          .draggable({
            // inertia: true,
            modifiers: [
              interact.modifiers.restrictRect({
                restriction: "parent",
                // endOnly: true,
              }),
            ],
            autoScroll: true,
            listeners: {
              move: this.#dragMoveListener.bind(this),
            },
          })
          .resizable({
            edges: { bottom: ".clip_item_control_bar", right: ".clip_item_control_bar" },
            listeners: {
              move: this.#resizeMoveListener.bind(this),
            },
            modifiers: [
              interact.modifiers.restrictEdges({
                outer: "parent",
                // endOnly: true,
              }),
              interact.modifiers.restrictSize({
                min: { width: 50, height: 50 },
                //   max: { width: 300, height: 300 },
              }),
            ],
            // inertia: true,
          });
    }
}

const clip_toolbar_html_str = `
<div class="toolbar hidden" id="clipItemToolBar">
      <button class="toolbarButton" id="copyClipLink" aria-label="复制链接" data-balloon-pos="down" data-balloon-length="medium" data-l10n-id="pdfjs-clipitem-copylink" data-l10n-attrs="aria-label">
        <svg
          t="1725168474021"
          class="icon"
          viewBox="0 0 1024 1024"
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          p-id="15129"
          width="100%"
          height="100%"
        >
          <path
            d="M607.934444 417.856853c-6.179746-6.1777-12.766768-11.746532-19.554358-16.910135l-0.01228 0.011256c-6.986111-6.719028-16.47216-10.857279-26.930349-10.857279-21.464871 0-38.864146 17.400299-38.864146 38.864146 0 9.497305 3.411703 18.196431 9.071609 24.947182l-0.001023 0c0.001023 0.001023 0.00307 0.00307 0.005117 0.004093 2.718925 3.242857 5.953595 6.03853 9.585309 8.251941 3.664459 3.021823 7.261381 5.997598 10.624988 9.361205l3.203972 3.204995c40.279379 40.229237 28.254507 109.539812-12.024871 149.820214L371.157763 796.383956c-40.278355 40.229237-105.761766 40.229237-146.042167 0l-3.229554-3.231601c-40.281425-40.278355-40.281425-105.809861 0-145.991002l75.93546-75.909877c9.742898-7.733125 15.997346-19.668968 15.997346-33.072233 0-23.312962-18.898419-42.211381-42.211381-42.211381-8.797363 0-16.963347 2.693342-23.725354 7.297197-0.021489-0.045025-0.044002-0.088004-0.066515-0.134053l-0.809435 0.757247c-2.989077 2.148943-5.691629 4.669346-8.025791 7.510044l-78.913281 73.841775c-74.178443 74.229608-74.178443 195.632609 0 269.758863l3.203972 3.202948c74.178443 74.127278 195.529255 74.127278 269.707698 0l171.829484-171.880649c74.076112-74.17435 80.357166-191.184297 6.282077-265.311575L607.934444 417.856853z"
            fill="#5D5D5D"
            p-id="15130"
          ></path>
          <path
            d="M855.61957 165.804257l-3.203972-3.203972c-74.17742-74.178443-195.528232-74.178443-269.706675 0L410.87944 334.479911c-74.178443 74.178443-78.263481 181.296089-4.085038 255.522628l3.152806 3.104711c3.368724 3.367701 6.865361 6.54302 10.434653 9.588379 2.583848 2.885723 5.618974 5.355985 8.992815 7.309476 0.025583 0.020466 0.052189 0.041956 0.077771 0.062422l0.011256-0.010233c5.377474 3.092431 11.608386 4.870938 18.257829 4.870938 20.263509 0 36.68962-16.428158 36.68962-36.68962 0-5.719258-1.309832-11.132548-3.645017-15.95846l0 0c-4.850471-10.891048-13.930267-17.521049-20.210297-23.802102l-3.15383-3.102664c-40.278355-40.278355-24.982998-98.79612 15.295358-139.074476l171.930791-171.830507c40.179095-40.280402 105.685018-40.280402 145.965419 0l3.206018 3.152806c40.279379 40.281425 40.279379 105.838513 0 146.06775l-75.686796 75.737962c-10.296507 7.628748-16.97358 19.865443-16.97358 33.662681 0 23.12365 18.745946 41.87062 41.87062 41.87062 8.048303 0 15.563464-2.275833 21.944801-6.211469 0.048095 0.081864 0.093121 0.157589 0.141216 0.240477l1.173732-1.083681c3.616364-2.421142 6.828522-5.393847 9.529027-8.792247l79.766718-73.603345C929.798013 361.334535 929.798013 239.981676 855.61957 165.804257z"
            fill="#5D5D5D"
            p-id="15131"
          ></path>
        </svg>
      </button>
      <div class="verticalToolbarSeparator"></div>
      <button class="toolbarButton" id="setClipAsCurrentCardFront" aria-label="插入到选中卡片的正面" data-balloon-pos="down" data-balloon-length="medium" data-l10n-id="pdfjs-clipitem-setclipascurrentcardfront" data-l10n-attrs="aria-label">
        Q
      </button>
      <button class="toolbarButton" id="setClipAsCurrentCardBack" aria-label="插入到选中卡片的背面" data-balloon-pos="down" data-balloon-length="medium" data-l10n-id="pdfjs-clipitem-setclipascurrentcardback" data-l10n-attrs="aria-label">A</button>
      <button class="toolbarButton" id="setClipAsNewCardFront" aria-label="插入到新卡片的正面" data-balloon-pos="down" data-balloon-length="medium" data-l10n-id="pdfjs-clipitem-setclipasnewcardfront" data-l10n-attrs="aria-label">Q+</button>
      <button class="toolbarButton" id="setClipAsNewCardBack" aria-label="插入到新卡片的背面" data-balloon-pos="down" data-balloon-length="medium" data-l10n-id="pdfjs-clipitem-setclipasnewcardback" data-l10n-attrs="aria-label">A+</button>
      <div class="verticalToolbarSeparator"></div>
      <button class="toolbarButton" id="setClipName" aria-label="设置当前标注名称" data-balloon-pos="down" data-balloon-length="medium" data-l10n-id="pdfjs-clipitem-setclipname" data-l10n-attrs="aria-label">
        <svg
          t="1725168409529"
          class="icon"
          viewBox="0 0 1024 1024"
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          p-id="14119"
          width="100%"
          height="100%"
        >
          <path
            d="M159.843197 255.027707C107.371246 255.027707 64.207807 298.191146 64.207807 350.663097v255.027707c0 52.471951 43.163439 95.63539 95.63539 95.63539h435.459809l62.736816-63.756927H159.843197a31.432165 31.432165 0 0 1-31.878464-31.878463v-255.027707c0-17.915696 13.962767-31.878463 31.878464-31.878463h637.569267c17.915696 0 31.878463 13.962767 31.878463 31.878463V446.298487h63.756927V350.663097c0-52.471951-43.163439-95.63539-95.63539-95.63539h-637.569267z m746.147313 255.282734a79.951186 79.951186 0 0 0-56.998692 24.036362l-297.362307 302.335346-44.374821 186.552768 186.552768-44.311064 6.248179-6.248179 296.087168-291.177884c31.878463-30.985866 32.197248-83.011519 0.765083-114.379927l-33.472387-33.536143a80.142457 80.142457 0 0 0-57.381234-23.271279z m0.382542 63.246872c4.271714 0 8.543428 1.721437 11.922545 5.100554l33.536143 33.536143a16.321773 16.321773 0 0 1-0.127513 23.781334h-0.127514l-289.902746 284.993462-68.474939 16.321774 16.321773-68.47494 284.993462-289.902745v-0.127514a16.576801 16.576801 0 0 1 11.858789-5.228068z"
            fill=""
            p-id="14120"
          ></path>
        </svg>
      </button>
      <button class="toolbarButton" id="editClipCommnet" aria-label="设置当前标注备注" data-balloon-pos="down" data-balloon-length="medium" data-l10n-id="pdfjs-clipitem-editclipcommnet" data-l10n-attrs="aria-label">
        <svg
          t="1725168050185"
          class="icon"
          viewBox="0 0 1138 1024"
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          p-id="5712"
          width="100%"
          height="100%"
        >
          <path
            d="M1080.883485 853.329066 855.490834 853.329066C855.490834 853.329066 854.040174 918.21052 854.040174 967.988049 854.040174 1000.869663 832.59317 1023.99488 798.204009 1023.99488 781.763202 1023.99488 767.99616 1023.99488 767.99616 1023.99488L570.507369 853.329066 56.888605 853.329066C25.457651 853.329066 0 827.842972 0 796.440462L0 56.888605C0 25.457651 25.457651 0 56.888605 0L1080.883485 0C1112.314438 0 1137.772089 25.457651 1137.772089 56.888605L1137.772089 796.440462C1137.772089 827.842972 1112.314438 853.329066 1080.883485 853.329066ZM1080.883485 56.888605 56.888605 56.888605 56.888605 796.440462 597.330346 796.440462 796.440462 967.106275 796.440462 796.440462 1080.883485 796.440462 1080.883485 56.888605ZM170.665814 540.413298 967.106275 540.413298 967.106275 597.301902 170.665814 597.301902 170.665814 540.413298ZM170.665814 398.220231 967.106275 398.220231 967.106275 455.108835 170.665814 455.108835 170.665814 398.220231ZM170.665814 255.99872 511.99744 255.99872 511.99744 312.887325 170.665814 312.887325 170.665814 255.99872Z"
            fill="#272636"
            p-id="5713"
          ></path>
        </svg>
      </button>
      <div class="verticalToolbarSeparator"></div>
      <button class="toolbarButton" id="deleteClip" aria-label="删除标注" data-balloon-pos="down" data-balloon-length="medium" data-l10n-id="pdfjs-clipitem-deleteclip" data-l10n-attrs="aria-label">
        <svg
          t="1725167180440"
          class="icon"
          viewBox="0 0 1024 1024"
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          p-id="4464"
          width="100%"
          height="100%"
        >
          <path
            d="M993.196 93.802l-260.45 0L732.746 82.489c0-36.405-23.837-76.729-56.237-76.729L348.751 5.76c-32.377 0-56.215 40.323-56.215 76.729l0 11.313L32.086 93.802c-12.128 0-22.01 9.905-22.01 22.01s9.883 22.01 22.01 22.01l961.11 0c12.106 0 22.01-9.905 22.01-22.01S1005.302 93.802 993.196 93.802zM336.557 82.489c0-12.128 1.387-32.708 12.194-32.708l327.78 0c10.807 0 12.194 20.58 12.194 32.708l0 11.313L336.557 93.802 336.557 82.489zM512.641 816.472 512.641 816.472c-12.172 0-22.01-9.861-22.01-22.01L490.631 310.407c0-12.15 9.839-22.01 22.01-22.01l0 0c12.172 0 22.01 9.861 22.01 22.01l0 484.055C534.652 806.634 524.813 816.472 512.641 816.472zM336.888 732.106 336.888 732.106c-12.15 0-22.01-9.861-22.01-22.01l0-315.3c0-12.15 9.861-22.01 22.01-22.01l0 0c12.15 0 22.01 9.861 22.01 22.01l0 315.3C358.898 722.245 349.015 732.106 336.888 732.106zM688.395 732.106 688.395 732.106c-12.15 0-22.01-9.861-22.01-22.01l0-315.3c0-12.15 9.861-22.01 22.01-22.01l0 0c12.15 0 22.01 9.861 22.01 22.01l0 315.3C710.406 722.245 700.545 732.106 688.395 732.106zM886.82 203.854c-12.172 0-22.01 9.861-22.01 22.01 0 5.877 0 9.751 0 14.813l0 649.354c0 46.508-37.704 84.19-84.168 84.19L248.515 974.221c-48.621 0-88.042-39.421-88.042-88.042L160.473 240.678c0-5.062 0-9.465 0-14.813 0-12.15-9.839-22.01-22.01-22.01s-22.01 9.861-22.01 22.01c0 0.264 0.132 0.462 0.154 0.748-0.044 0.044-0.088 0.088-0.154 0.154l0 663.286c0 70.786 57.381 128.189 128.189 128.189l532.126 0c72.921 0 132.063-59.142 132.063-132.063L908.831 225.865C908.83 213.715 898.969 203.854 886.82 203.854z"
            fill="#272636"
            p-id="4465"
          ></path>
        </svg>
      </button>
    </div>
`

class ClipToolBar{

}
class ClipToolBarView{

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