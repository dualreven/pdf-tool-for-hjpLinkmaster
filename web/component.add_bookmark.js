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
            if(e.signal!==CONSTANTS.eventName.PDF_ADD_BOOKMARK_START && this.opened){
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
            signal:CONSTANTS.eventName.PDF_ADD_BOOKMARK_START
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

export {AddBookMark}