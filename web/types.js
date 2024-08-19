import {generate8CharUUID} from "./func_tools.js";

class PDFInfoObject {
    constructor({
      book_name,
      uuid = generate8CharUUID(),
      alias = "",
      page_count = 0,
      clips_count = 0,
      reading_progress = 0.0,
      last_read_page = 0,
      outline = "",
      created_at = Date.now(),
      updated_at = Date.now(),
      read_at = Date.now(),
      stars = 0,
      tags = [],
      comment = "",
      thumbnail = "",
      clips = []
    }) {
      this.book_name = book_name;
      this.uuid = uuid;
      this.alias = alias;
      this.page_count = page_count;
      this.clips_count = clips_count;
      this.reading_progress = reading_progress;
      this.last_read_page = last_read_page;
      this.outline = outline;
      this.created_at = created_at;
      this.updated_at = updated_at;
      this.read_at = read_at;
      this.stars = stars;
      this.tags = tags;
      this.comment = comment;
      this.thumbnail = thumbnail;
      this.clips = clips;
    }
  
  }

/**
 * @typedef {Object} OldOutline_Destination
 * @property {number} num
 * @property {number} gen
 * @property {string} name
 */

/**
 * @typedef {Object} OldOutline_Color
 * @property {number} 0
 * @property {number} 1
 * @property {number} 2
 */

/**
 * @typedef {Object} PDFOutlineItem
 * @property {string} title
 * @property {OldOutline_Destination[]} dest
 * @property {string|null} action
 * @property {string|null} url
 * @property {OldOutline_Color} color
 * @property {boolean} bold
 * @property {boolean} italic
 * @property {PDFOutlineItem[]} items
 */

/**
 * @typedef {PDFOutlineItem[]} OldPDFOutline
 */



class PDFOutlineItem {
    constructor(title, page, items=[]) {
        this.title = title;
        this.page = page;
        this.items = items;
    }

    toDict() {
        return {
            title: this.title,
            page: this.page,
            items: this.items.map(child => child.toDict())
        };
    }
}

class PDFOutlineObject {
    /**
     * Represents a PDF outline.
     * @param {Object} params - The parameters for the outline.
     * @param {string} params.pdf_uuid - The UUID of the PDF.
     * @param {string} [params.uuid=null] - The UUID of the outline. Defaults to a generated UUID.
     * @param {PDFOutlineItem[]} [params.items=[]] - The list of outline items.
     * @param {number|null} [params.created_at=null] - The creation timestamp. Defaults to the current time.
     * @param {number|null} [params.updated_at=null] - The update timestamp. Defaults to the current time.
     * @param {number} [params.offSpring_count=0] - The count of offspring.
     */
    constructor({pdf_uuid, uuid=null, items=[], created_at=null, updated_at=null}) {
        this.pdf_uuid = pdf_uuid;
        this.uuid = uuid?uuid:generate8CharUUID();
        this.items = items;
        this.created_at = created_at?created_at:Date.now();
        this.updated_at = updated_at?updated_at:Date.now();
    }

    toDict() {
        return {
            pdf_uuid: this.pdf_uuid,
            uuid: this.uuid,
            items: this.items.map(item => item.toDict()),
            created_at:this.created_at,
            updated_at:this.updated_at,
        };
    }
    /**
     * 
     * @param {string} pdf_uuid 
     * @param {OldPDFOutline} outline 
     * @returns {Promise<PDFOutlineObject>}
     */
    static async from_oldOutline(pdf_uuid,oldOutline) {
        const newOutline = new PDFOutlineObject({pdf_uuid});
        for(let i=0;i<oldOutline.length;i++) {
            const old_item = oldOutline[i];
            const new_item = await convertItem(old_item);
            newOutline.items.push(new_item);
        }
        return newOutline;
    }

    static async from_backend(outline_uuid){
        const outline_str = await window.backend.fetch_pdf_outline(outline_uuid)
        const outline_obj = new PDFOutlineObject(JSON.parse(outline_str))
        return outline_obj
    }
}

// async function convertOutline(pdfUuid,oldOutline) {
//     const newOutline = new PDFOutlineObject(pdfUuid);
//     for(let i=0;i<oldOutline.length;i++) {
//         const old_item = oldOutline[i];
//         const new_item = await convertItem(old_item);
//         newOutline.items.push(new_item);
//     }

//     return newOutline;
// }

async function convertItem(oldItem) {
    // 获取页码
    const [ref] = oldItem.dest;
    const page = await window.PDFViewerApplication.pdfDocument.getPageIndex(ref) + 1;
    const items = await Promise.all(oldItem.items.map(async (item) => await convertItem(item)))

    // 创建新的 PDFOutlineItem
    return new PDFOutlineItem(oldItem.title,page,items);
}




// const outline = await PDFViewerApplication.pdfDocument.getOutline()

// const new_outline = await convertOutline(outline, "pdfUuid")

// console.log(new_outline)


export {PDFOutlineObject,PDFInfoObject}