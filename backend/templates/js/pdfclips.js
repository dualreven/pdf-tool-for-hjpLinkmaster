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
 * Creates a card element for displaying PDF clip information.
 *
 * @param {PDFClipInfoObject} clip_info - Information about the PDF clip.
 * @return {string} The HTML content for the card element.
 */
function create_pdf_clips_card(clip_info) {
    return`
    <div class="card mb-3">
        <div class="text-center">
            <img src="../pdf_files/clips/${clip_info.uuid}.jpg" id="pdfcode-pagenum-clipcode" alt="" srcset="" class="card-img-top">
        </div>
        <p class="card-footer">comment:${clip_info.comment}</p>
        <p class="card-footer">at page:${clip_info.page_num}</p>
    </div>`
}


/**
 * Parses a JSON string to a PDFInfoObject.
 *
 * @param {string} jsonString - The JSON string to parse.
 * @returns {Object<string,PDFClipInfoObject>} The parsed PDFInfoObject.
 */
function parsePDFClipsInfoObject(jsonString) {
    return JSON.parse(jsonString);
}
  

async function render_clips(){
    const pdfclips_info_str = await window.backend.fetch_pdfclips_info();
    console.log(pdfclips_info_str);
    const pdfclips_info_obj = parsePDFClipsInfoObject(pdfclips_info_str);
    const cardContainer = document.getElementById("pdf-clips-viewer");
    cardContainer.innerHTML = "";
    Object.keys(pdfclips_info_obj).forEach(key => {
        const clip_info = pdfclips_info_obj[key];
        const card_html = create_pdf_clips_card(clip_info);
        cardContainer.innerHTML += card_html;
    })
    // pdfclips_info_obj.forEach(clip_info => {
    //     console.log(clip_info);
    //     const card = create_pdf_clips_card(clip_info);
    //     cardContainer.innerHTML += card;
    // })
}

document.addEventListener("loadPDFClipsEvent", async function() {
    //console.log("load pdf clips event")
    render_clips();
})