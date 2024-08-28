import {PDFInfoObject} from "./types.js";


/**
 * Retrieves the PDF info object from the backend.
 *
 * @return {Promise<PDFInfoObject>} The PDF info object.
 */
async function get_PDFInfoObj(){
    const json_string  = await window.backend.fetch_pdf_info();
    const PDFInfoObj = new PDFInfoObject(JSON.parse(json_string));
    return PDFInfoObj;
}




function uint8ArrayToBase64(uint8Array) {
    return new Promise((resolve, reject) => {
        // 创建一个 Blob 对象
        const blob = new Blob([uint8Array]);
  
        // 创建 FileReader 对象
        const reader = new FileReader();
        reader.onloadend = () => {
            // 获取 Data URL 并移除前缀部分
            const dataUrl = reader.result;
            const base64String = dataUrl.split(',')[1];
            resolve(base64String);
        };
        reader.onerror = reject;
  
        // 将 Blob 对象读取为 Data URL
        reader.readAsDataURL(blob);
    });
}

function generate8CharUUID() {
    return Math.random().toString(36).substring(2, 10);
}

function createDiv(options) {
    // 创建一个新的 div 元素
    const div = document.createElement('div');
  
    // 如果 options 对象包含 id 属性，则设置 div 的 id
    if (options.id) {
      div.id = options.id;
    }
  
    // 如果 options 对象包含 className 属性，则设置 div 的 class
    if (options.className) {
      div.className = options.className;
    }
  
    // 如果 options 对象包含 cssStyles 属性，则设置 div 的内联样式
    if (options.cssStyle) {
      for (const style in options.cssStyle) {
          div.style[style] = options.cssStyle[style];
      }
    }
  
    // 返回配置好的 div 元素
    return div;
}



export {uint8ArrayToBase64,generate8CharUUID,get_PDFInfoObj,createDiv}