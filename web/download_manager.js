/* Copyright 2013 Mozilla Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/** @typedef {import("./interfaces").IDownloadManager} IDownloadManager */

import { createValidAbsoluteUrl, isPdfFile } from "pdfjs-lib";
import {uint8ArrayToBase64} from "./func_tools.js"
if (typeof PDFJSDev !== "undefined" && !PDFJSDev.test("CHROME || GENERIC")) {
  throw new Error(
    'Module "pdfjs-web/download_manager" shall not be used ' +
      "outside CHROME and GENERIC builds."
  );
}

async function download(blobUrl, filename) {
  await savePDF(blobUrl, filename);
  // const a = document.createElement("a");
  // if (!a.click) {
  //   throw new Error('DownloadManager: "a.click()" is not supported.');
  // }
  // a.href = blobUrl;
  // a.target = "_parent";
  // // Use a.download if available. This increases the likelihood that
  // // the file is downloaded instead of opened by another PDF plugin.
  // if ("download" in a) {
  //   a.download = filename;
  // }
  // // <a> must be in the document for recent Firefox versions,
  // // otherwise .click() is ignored.
  // (document.body || document.documentElement).append(a);
  // a.click();
  // a.remove();
}

async function savePDF(blob, url){
  // const formData = new FormData();
  // formData.append('file', blob,url);
  await window.backend.save_file_info(url);
  const save_return = await window.backend.save_pdf(blob);
  // const result = await fetch('/api/v1/common/upload-pdf', {
  //   method: 'POST',
  //   body: formData
  // })
  console.log(save_return);
}

/**
 * @implements {IDownloadManager}
 */
class DownloadManager {
  #openBlobUrls = new WeakMap();

  downloadUrl(url, filename, _options) {
    if (!createValidAbsoluteUrl(url, "http://example.com")) {
      console.error(`downloadUrl - not a valid URL: ${url}`);
      return; // restricted/invalid URL
    }
    download(url + "#pdfjs.action=download", filename);
  }

  downloadData(data, filename, contentType) {
    const blobUrl = URL.createObjectURL(
      new Blob([data], { type: contentType })
    );
    download(blobUrl, filename);
  }

  /**
   * @returns {boolean} Indicating if the data was opened.
   */
  openOrDownloadData(data, filename, dest = null) {
    const isPdfData = isPdfFile(filename);
    const contentType = isPdfData ? "application/pdf" : "";

    if (
      (typeof PDFJSDev === "undefined" || !PDFJSDev.test("COMPONENTS")) &&
      isPdfData
    ) {
      let blobUrl = this.#openBlobUrls.get(data);
      if (!blobUrl) {
        blobUrl = URL.createObjectURL(new Blob([data], { type: contentType }));
        this.#openBlobUrls.set(data, blobUrl);
      }
      let viewerUrl;
      if (typeof PDFJSDev === "undefined" || PDFJSDev.test("GENERIC")) {
        // The current URL is the viewer, let's use it and append the file.
        viewerUrl = "?file=" + encodeURIComponent(blobUrl + "#" + filename);
      } else if (PDFJSDev.test("CHROME")) {
        // In the Chrome extension, the URL is rewritten using the history API
        // in viewer.js, so an absolute URL must be generated.
        viewerUrl =
          // eslint-disable-next-line no-undef
          chrome.runtime.getURL("/content/web/viewer.html") +
          "?file=" +
          encodeURIComponent(blobUrl + "#" + filename);
      }
      if (dest) {
        viewerUrl += `#${escape(dest)}`;
      }

      try {
        window.open(viewerUrl);
        return true;
      } catch (ex) {
        console.error(`openOrDownloadData: ${ex}`);
        // Release the `blobUrl`, since opening it failed, and fallback to
        // downloading the PDF file.
        URL.revokeObjectURL(blobUrl);
        this.#openBlobUrls.delete(data);
      }
    }

    this.downloadData(data, filename, contentType);
    return false;
  }

  async download(u8array, url, filename, _options) {
    const worker = new Worker("./web/download.worker.js");
    worker.onmessage = (event) => {
      console.log('Received from worker:', event.data);
    };
    const msg = {
      data: u8array,
      url: url,
      filename: filename
    }
    worker.postMessage(msg,[u8array.buffer]);
    

  }
}

// function uint8ArrayToBase64(uint8Array) {
//   return new Promise((resolve, reject) => {
//       // 创建一个 Blob 对象
//       const blob = new Blob([uint8Array]);

//       // 创建 FileReader 对象
//       const reader = new FileReader();
//       reader.onloadend = () => {
//           // 获取 Data URL 并移除前缀部分
//           const dataUrl = reader.result;
//           const base64String = dataUrl.split(',')[1];
//           resolve(base64String);
//       };
//       reader.onerror = reject;

//       // 将 Blob 对象读取为 Data URL
//       reader.readAsDataURL(blob);
//   });
// }

export { DownloadManager };
