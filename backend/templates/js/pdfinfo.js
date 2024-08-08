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
 * @typedef {Object<string,PDFInfoObject>} PDFINFO_DB
 */

/**
 * @typedef {Object} PDFInfo
 * @property {Viewer} viewer - The viewer elements of the PDF info.
 * @property {PDFInfoButtonGroup} button - The button elements of the PDF info.
 * @property {HTMLElement} container -
 */

/**
 * @typedef {Object} Elements
 * @property {HTMLElement} appContainer - The app container element.
 * @property {HTMLElement} mainContainer - The main container element.
 * @property {PDFInfo} pdfInfo - The PDF info configuration.
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
            pdfInfo:
            {
                container:document.getElementById("pdf-info-container"),
                viewer:
                {
                    body: document.getElementById("pdf-info-viewer"),
                    title: document.getElementById("pdf-info-title"),
                },
                button:
                    {
                        edit: document.getElementById("pdf-info-action-edit"),
                    }
            },
        },
};
/**
 * Parses a JSON string to a PDFInfoObject.
 *
 * @param {PDFInfoObject} pdf_info - The JSON string to parse.
 * @returns {null} The parsed PDFInfoObject.
 */
function create_pdf_info_card(pdf_info) {
    return `<div class="text-center">
        <img id="pdf-info-thumb" src="../pdf_files/thumbnails/${pdf_info.uuid}.png" class="card-img-top rounded" alt="请打开一次PDF获取封面缩略图" srcset="">
        </div>
        <div id="pdf-info-properties" class="card-body">
            <h5  id="pdf-info-title">${pdf_info.book_name}</h5 >
            <p  id="pdf-info-description">${pdf_info.comment}</p >
            <ul class="list-group list-group-flush">
                <li class="list-group-item" id="pdf-info-alias">alias:${pdf_info.alias}</li>
                <li class="list-group-item" id="pdf-info-pagenum">pagenum:${pdf_info.page_count}</li>
                <li class="list-group-item" id="pdf-info-clipsCount">
                    reading progress:
                    <div class="progress">
                    <div class="progress-bar" role="progressbar" style="width: ${Math.round(pdf_info.reading_progress)}%" aria-valuenow="25" aria-valuemin="0" aria-valuemax="100"></div>
                    </div>
                </li>
                <li class="list-group-item" id="pdf-info-clipsCount">clips count:${pdf_info.clips.length}</li>
                <li class="list-group-item" id="pdf-info-createdAt">createdAt:${pdf_info.created_at}</li>
                <li class="list-group-item" id="pdf-info-updatedAt">updatedAt:${pdf_info.updated_at}</li>
                <li class="list-group-item" id="pdf-info-readAt">readAt:${pdf_info.read_at}</li>
                <li class="list-group-item" id="pdf-info-stars">stars:${pdf_info.stars}</li>
                <li class="list-group-item" id="pdf-info-tags">tags:${pdf_info.tags}</li>
            </ul>
        </div>`;

    }





/**
 * Parses a JSON string to a PDFInfoObject.
 *
 * @param {string} jsonString - The JSON string to parse.
 * @returns {PDFInfoObject} The parsed PDFInfoObject.
 */
function parsePDFClipsInfoObject(jsonString) {
    return JSON.parse(jsonString);
  }
  
  

document.addEventListener("loadPDFInfoEvent", async function() {
    const pdf_info_str = await window.qt_js_bridge.fetch_pdf_info()
    const pdf_info = parsePDFClipsInfoObject(pdf_info_str)
    const cfg = homeConfiguration
    cfg.element.pdfInfo.viewer.body.innerHTML = create_pdf_info_card(pdf_info);
    // document.getElementById("pdf-info-container").innerHTML = create_pdf_info_card(pdf_info);
    homeConfiguration.element.pdfInfo.button.edit.addEventListener("click", async function() {

    })
});