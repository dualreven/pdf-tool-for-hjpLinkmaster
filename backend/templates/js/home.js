/**
 * @typedef {Object} PDFInfoObject
 * @property {string} book_name - The name of the book.
 * @property {string} uuid - The UUID of the PDF.
 * @property {string} [alias=""] - An alias for the PDF.
 * @property {number} [page_count=-1] - The number of pages in the PDF.
 * @property {number} [clips_count=-1] - The number of clips in the PDF.
 * @property {number} created_at - The creation timestamp.
 * @property {number} updated_at - The last update timestamp.
 * @property {number} read_at - The last read timestamp.
 * @property {number} [reading_progress=0.0] - The reading progress of the PDF.
 * @property {number} [stars=0] - The number of stars for the PDF.
 * @property {string[]} [tags=[]] - A list of tags associated with the PDF.
 * @property {string} [comment=""] - A comment about the PDF.
 * @property {string} [thumbnail=""] - The thumbnail URL of the PDF.
 * @property {string[]} [clips=[]] - A list of clip UUIDs associated with the PDF.
 */

/**
 * Represents a PDF clip information object.
 * @typedef {Object} PDFClipInfoObject
 * @property {string} pdf_uuid - The UUID of the PDF document.
 * @property {string} uuid - A unique identifier for this clip, defaulting to an 8-character UUID.
 * @property {number} page_num - The page number of the clip in the PDF.
 * @property {number[]} start - The starting coordinates (x, y) of the clip as a tuple.
 * @property {number[]} end - The ending coordinates (x, y) of the clip as a tuple.
 * @property {string} comment - An optional comment for the clip.
 */

/**
 * @typedef {Object<string,PDFInfoObject>} PDFINFO_DB
 */


/**
 * @typedef {Object} Viewer
 * @property {HTMLElement} body - The body element of the viewer.
 * @property {HTMLElement} title - The title element of the viewer.
 */

/**
 * @typedef {Object} PDFTableButtonGroup
 * @property {HTMLElement} import - The import button element.
 * @property {HTMLElement} getInfo - The get info button element.
 * @property {HTMLElement} delete - The delete button element.
 * @property {HTMLElement} getClip - The get clips button element.
 * @property {HTMLElement} read - The read button element.
 */

/**
 * @typedef {Object} PDFTable
 * @property {Viewer} viewer - The viewer elements of the PDF table.
 * @property {PDFTableButtonGroup} button - The button elements of the PDF table.
 */

/**
 * @typedef {Object} PDFInfoButtonGroup
 * @property {HTMLElement} read - The read button element.
 * @property {HTMLElement} clips - The clips button element.
 * @property {HTMLElement} close - The close button element.
 */

/**
 * @typedef {Object} PDFInfo
 * @property {Viewer} viewer - The viewer elements of the PDF info.
 * @property {PDFInfoButtonGroup} button - The button elements of the PDF info.
 * @property {HTMLElement} container -
 */

/**
 * @typedef {Object} PDFClips
 * @property {HTMLElement} container - .
 * @property {Viewer} viewer - The viewer elements of the PDF clips.
 * @property {Object} button - The button elements of the PDF clips.
 * @property {HTMLElement} button.close - The close button element.
 */

/**
 * @typedef {Object} Elements
 * @property {HTMLElement} appContainer - The app container element.
 * @property {HTMLElement} mainContainer - The main container element.
 * @property {PDFTable} pdfTable - The PDF table configuration.
 */

/**
 * @typedef {Object} HomeConfiguration
 * @property {Elements} element - The elements configuration.
 */





const homeConfiguration= {
    element:
        {
            appContainer: document.body,
            mainContainer: document.getElementById("main-container"),
            // rightSideContainer: document.getElementById("rightside-container"),
            pdfTable:
            {
                viewer:{
                    body: document.getElementById("pdf-table-viewer-body"),
//                    title: document.getElementById("pdf-table-title"),
                },
                button:
                    {
                        import: document.getElementById("pdf-table-action-import"),
                        getInfo: document.getElementById("pdf-table-action-getInfo"),
                        delete: document.getElementById("pdf-table-action-delete"),
                        getClip: document.getElementById("pdf-table-action-getClip"),
                        read: document.getElementById("pdf-table-action-read"),
                    }
            },
            
        },


};
/**
 * Retrieves the home configuration from the global window object.
 *
 * @return {HomeConfiguration} The home configuration object.
 */
function getHomeConfiguration(){
    return homeConfiguration;
}
class PDFDB {
    #data;
    #recent_added;
    #cfg;
    constructor(data) {
        if (PDFDB.instance) {
            return PDFDB.instance;
        }
        PDFDB.instance = this;
        this.#data = data;
        /**
         * @type{HomeConfiguration}
         */
        this.#cfg = window.homeConfiguration;
        /**
         * @type {PDFINFO_DB}
         */
        this.#recent_added = {};

    }
    /**
     * Retrieves a PDF information object by UUID.
     *
     * @param {string} uuid - The UUID of the PDF information object to retrieve.
     * @return {PDFInfoObject} The PDF information object corresponding to the UUID.
     */
    get(uuid) {
        return this.#data[uuid];
    }
    /**
     * Retrieves all the data stored in the internal data store.
     *
     * @return {PDFINFO_DB} The internal data store.
     */
    getAll() {
        return this.#data;
    }
    getRecent(){
        return this.#recent_added
    }
    clearRecent(){
        this.#recent_added = {};
    }
    /**
     * Adds a PDF information object to the internal data store.
     *
     * @param {PDFInfoObject} pdf_info - The PDF information object to be added.
     * @return {void}
     */
    add(pdf_info) {
        this.#data[pdf_info.uuid] = pdf_info;
        this.#recent_added[pdf_info.uuid] = pdf_info;
    }

    async delete(uuid) {
        await window.qt_js_bridge.delete_pdf(uuid);
        delete this.#data[uuid];
    }
}


/**
 *
 * @param {PDFInfoObject}pdf_info
 * @param {number}rownum
 * @returns {HTMLTableRowElement}
 */
function create_pdf_table_row(pdf_info,rownum=0) {
    const row = document.createElement("tr");
    row.id = pdf_info.uuid;
    row.innerHTML = `
        <th scope="row">-</th>
        <td class="col">${pdf_info.book_name}</td>
        <td class="col">${pdf_info.stars}</td>
        <td class="col"><span class="badge bg-primary">${pdf_info.tags.join(" ")}</span></td>
    `;
    return row;
}

/**
 *
 * @param {PDFInfoObject}pdf_info
 * @returns {string}
 */
// function create_pdf_info_card(pdf_info) {
// return `<div class="text-center">
//     <img id="pdf-info-thumb" src="./test.jpg" class="card-img-top rounded" alt="" srcset="">
//     </div>
//     <div id="pdf-info-properties" class="card-body">
//         <h5  id="pdf-info-title">${pdf_info.book_name}</h5 >
//         <p  id="pdf-info-description">${pdf_info.comment}</p >
//         <ul class="list-group list-group-flush">
//             <li class="list-group-item" id="pdf-info-alias">alias:${pdf_info.alias}</li>
//             <li class="list-group-item" id="pdf-info-pagenum">pagenum:${pdf_info.page_count}</li>
//             <li class="list-group-item" id="pdf-info-clipsCount">
//                 reading progress:
//                 <div class="progress">
//                 <div class="progress-bar" role="progressbar" style="width: ${Math.round(pdf_info.reading_progress)}%" aria-valuenow="25" aria-valuemin="0" aria-valuemax="100"></div>
//                 </div>
//             </li>
//             <li class="list-group-item" id="pdf-info-clipsCount">clips count:${pdf_info.clips_count}</li>
//             <li class="list-group-item" id="pdf-info-createdAt">createdAt:${pdf_info.created_at}</li>
//             <li class="list-group-item" id="pdf-info-updatedAt">updatedAt:${pdf_info.updated_at}</li>
//             <li class="list-group-item" id="pdf-info-readAt">readAt:${pdf_info.read_at}</li>
//             <li class="list-group-item" id="pdf-info-stars">stars:${pdf_info.stars}</li>
//             <li class="list-group-item" id="pdf-info-tags">tags:${pdf_info.tags}</li>
//         </ul>
//     </div>`;
// }

/**
 *
 * @param {PDFClipInfoObject}clip_info
 * @returns {string}
 */
function create_pdf_clips_card(clip_info) {
    return`
    <div class="card mb-3">
        <div class="text-center">
            <img src="../pdf_files/clips/${clip_info.pdf_uuid}-${clip_info.uuid}.png" id="pdfcode-pagenum-clipcode" alt="" srcset="" class="card-img-top">
        </div>
        <p class="card-footer">${clip_info.comment}</p>
        <p class="card-footer">at page:${clip_info.page_num}</p>
    </div>`
}

/**
 * Parses a JSON string to a PDFInfoObject.
 *
 * @param {string} jsonString - The JSON string to parse.
 * @returns {PDFINFO_DB} The parsed PDFInfoObject.
 */
function parsePDFClipsInfoObject(jsonString) {
  return JSON.parse(jsonString);
}
/**
 *
 * @param {string} jsonString
 * @returns {PDFClipInfoObject}
 */
function  parseClipInfoObject(jsonString) {
    return JSON.parse(jsonString);
}

/**
 * @param {HomeConfiguration} cfg
 * @param {PDFINFO_DB} pdfDB
 * @returns {null} The parsed PDFInfoObject.
 */
function renderPDFList(cfg,pdfDB) {
    const pdfTableViewerBody = cfg.element.pdfTable.viewer.body;
    let i = pdfTableViewerBody.childElementCount;
    Object.keys(pdfDB).forEach(uuid => {
        i++;
        const pdf_info = pdfDB[uuid];
        const row = create_pdf_table_row(pdf_info,i);
        pdfTableViewerBody.appendChild(row);
    });
}

/**
 *
 * @param {HomeConfiguration} cfg
 */
function get_table_selected_pdf_uuid(cfg) {
    const table_selected = cfg.element.pdfTable.viewer.body.querySelector(".table-row-selected");
    console.log(table_selected.id);
}

// const right_side_op = {
//     show_pdf_info: (cfg=window.homeConfiguration) => {
//         cfg.element.rightSideContainer.classList.remove("display-none");
//         cfg.element.pdfInfo.container.classList.remove("display-none");
//     },
//     hide_pdf_info: (cfg=window.homeConfiguration) => {
//         cfg.element.rightSideContainer.classList.add("display-none");
//         cfg.element.pdfInfo.container.classList.add("display-none");
//         cfg.element.pdfClips.container.classList.add("display-none");
//     },
//     show_pdf_clips: (cfg=window.homeConfiguration) => {
//         cfg.element.pdfClips.container.classList.remove("display-none");
//     },
//     /**
//      * Hides the PDF clips.
//      *
//      * @param {HomeConfiguration} cfg - The configuration object. Defaults to window.homeConfiguration if not provided.
//      */
//     hide_pdf_clips: (cfg=window.homeConfiguration) => {
//         cfg.element.pdfClips.container.classList.add("display-none");
//     },
//     hide_right_side: (cfg=window.homeConfiguration) => {
//         cfg.element.rightSideContainer.classList.add("display-none");
//         cfg.element.pdfInfo.container.classList.add("display-none");
//         cfg.element.pdfClips.container.classList.add("display-none");
//     }
// }

// function update_selected(table_selected,event){
//     if(table_selected){
//         table_selected.classList.remove("table-active");
//         table_selected.classList.remove("table-row-selected")
//     }
//     let target = event.target;
//     while (target && target.nodeName !== 'TR') {
//         target = target.parentNode;
//     }
//     if (target && target == table_selected) {
//         table_selected.classList.remove("table-active");
//         table_selected.classList.remove("table-row-selected")
//         table_selected=null;
//     }
//     else if (target && target.nodeName === 'TR') {
//         target.classList.add("table-active");
//         target.classList.add("table-row-selected");
//         table_selected=target;
//     }
// }


async function initHome() {

    const pdfList_str = await window.qt_js_bridge.fetch_pdf_list();
    /**
     * @type {PDFDB}
     */
    const pdfDB = new PDFDB(parsePDFClipsInfoObject(pdfList_str));
    /**
     * @type {PDFDB}
     */
    window.PDF_DB = pdfDB;
    /**
     * @type {HTMLTableRowElement}
     */
    let table_selected = null;
    const cfg = homeConfiguration;
    renderPDFList(cfg,pdfDB.getAll());
    cfg.element.pdfTable.viewer.body.addEventListener("click",async (event)=>{
        if(table_selected){
            table_selected.classList.remove("table-active");
            table_selected.classList.remove("table-row-selected")
        }
        let target = event.target;
        while (target && target.nodeName !== 'TR') {
            target = target.parentNode;
        }
        if (target && target == table_selected) {
            table_selected.classList.remove("table-active");
            table_selected.classList.remove("table-row-selected")
            table_selected=null;
        }
        else if (target && target.nodeName === 'TR') {
            target.classList.add("table-active");
            target.classList.add("table-row-selected");
            table_selected=target;
        }
        
        // console.log(event.target, table_selected);
    })
    cfg.element.pdfTable.viewer.body.addEventListener("dblclick",async (event)=>{
        // if(table_selected){
        //     table_selected.classList.remove("table-active");
        //     table_selected.classList.remove("table-row-selected")
        // }
        let target = event.target;
        while (target && target.nodeName !== 'TR') {
            target = target.parentNode;
        }
        if(target){
            window.qt_js_bridge.open_pdf_viewer(target.id);
        }
        // if (target && target == table_selected) {
        //     table_selected.classList.remove("table-active");
        //     table_selected.classList.remove("table-row-selected")
        //     table_selected=null;
        // }
        // else if (target && target.nodeName === 'TR') {
        //     target.classList.add("table-active");
        //     target.classList.add("table-row-selected");
        //     table_selected=target;
        // }
        // if(table_selected){
        //     window.qt_js_bridge.open_pdf_info(table_selected.id);
        // }
    })
    cfg.element.pdfTable.button.import.addEventListener("click",async ()=>{
      /**
       * @type {string[]}
       */
      const result = await window.qt_js_bridge.import_new_pdf();
        if(result.length>0){

            for(const pdf_uuid of result){
              /**
               * @type {string}
               */
              const pdf_info_str = await window.qt_js_bridge.fetch_pdf_info(pdf_uuid);
              pdfDB.add(parsePDFClipsInfoObject(pdf_info_str));
            }
            renderPDFList(cfg,pdfDB.getRecent());
            pdfDB.clearRecent()
        }
    });
    cfg.element.pdfTable.button.getInfo.addEventListener("click",async ()=>{
        if(table_selected){
            window.qt_js_bridge.open_pdf_info(table_selected.id);
        }
        
    })
    cfg.element.pdfTable.button.delete.addEventListener("click",async ()=>{
        if(!table_selected){
            return;
        }
        const pdf_uuid = table_selected.id;
        await pdfDB.delete(pdf_uuid);
        table_selected.remove();
        table_selected=null;
    })
    cfg.element.pdfTable.button.getClip.addEventListener("click",async ()=>{
        if(table_selected){
            window.qt_js_bridge.open_pdf_clips(table_selected.id);
        }
    })
    cfg.element.pdfTable.button.read.addEventListener("click",async ()=>{
        if(table_selected){
            window.qt_js_bridge.open_pdf_viewer(table_selected.id);
        }
    })
    // cfg.element.pdfInfo.button.close.addEventListener("click",async ()=>{
    //     right_side_op.hide_pdf_info(cfg);
    // })

    // cfg.element.pdfInfo.button.clips.addEventListener("click",async ()=>{
    //     const pdf_uuid = cfg.element.pdfInfo.viewer.body.getAttribute("data-pdf-uuid");
    //     const pdf_info = pdfDB.get(pdf_uuid);
    //     right_side_op.show_pdf_clips(cfg);
    //     cfg.element.pdfClips.viewer.body.innerHTML=""
    //     cfg.element.pdfClips.viewer.body.setAttribute("data-pdf-uuid",pdf_uuid);
    //     for (const uuid of pdf_info.clips) {
    //         const clip_info_str = await window.qt_js_bridge.fetch_clip_info(uuid);
    //         const clip_info = parseClipInfoObject(clip_info_str);
    //         cfg.element.pdfClips.viewer.body.innerHTML += create_pdf_clips_card(clip_info);
    //     }
    // })
    // cfg.element.pdfClips.button.close.addEventListener("click",async ()=>{
    //     right_side_op.hide_pdf_clips(cfg);
    // })
}

window.addEventListener("load", ()=>{
    setTimeout(()=>{
        initHome();
    },200)
});

