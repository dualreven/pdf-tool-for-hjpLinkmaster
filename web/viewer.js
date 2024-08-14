/* Copyright 2016 Mozilla Foundation
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

import { RenderingStates, ScrollMode, SpreadMode } from "./ui_utils.js";
import { AppOptions } from "./app_options.js";
import { LinkTarget } from "./pdf_link_service.js";
import { PDFViewerApplication } from "./app.js";
import {CONSTANTS} from "./constants.js"
// import Swal from 'sweetalert2';

/* eslint-disable-next-line no-unused-vars */
const pdfjsVersion = "4.3.136"
  //typeof PDFJSDev !== "undefined" ? PDFJSDev.eval("BUNDLE_VERSION") : void 0;
/* eslint-disable-next-line no-unused-vars */
const pdfjsBuild = "fdb3617e0f7ebbefce9a65a87971251e92653d07"
  //typeof PDFJSDev !== "undefined" ? PDFJSDev.eval("BUNDLE_BUILD") : void 0;

/**
 * @typedef {Object} PDFSocketInfo
 * @property {string} pdf_uuid
 * @property {string} pdf_name
 * @property {number} cmd
 */

const AppConstants =
  typeof PDFJSDev === "undefined" || PDFJSDev.test("GENERIC")
    ? { LinkTarget, RenderingStates, ScrollMode, SpreadMode }
    : null;



window.PDFViewerApplication = PDFViewerApplication;
window.PDFViewerApplicationConstants = AppConstants;
window.PDFViewerApplicationOptions = AppOptions;
// function loadPDF(pdfData) {
//   const loadingTask = PDFViewerApplication.getDocument({ data: pdfData });
//   loadingTask.promise.then(pdf => {
//     PDFViewerApplication.pdfDocument = pdf;
//     PDFViewerApplication.load(pdf);
//   }, reason => {
//     console.error(reason);
//   });
// }

/**
 * Initializes a WebSocket connection and sets up event handlers for the 'open', 'message', 'close', and 'error' events.
 *
 * @param {Object} dataobj - An object that will have its 'data' property updated with the received WebSocket data.
 * @return {WebSocket} The WebSocket object that was created.
 */
function initializeWebSocket(datainfo) {
  let resolvePromise;
  let rejectPromise;
  const dataPromise = new Promise((resolve, reject) => {
    resolvePromise = resolve;
    rejectPromise = reject;
  });

  const socket = new WebSocket('ws://localhost:1027');

  socket.onopen = function(event) {
    console.log("WebSocket is open now.");
    socket.send(JSON.stringify(datainfo));
  };

  socket.onmessage = async function(event) {
    console.log(event.data);
    const data = await event.data.arrayBuffer()
    console.log(data)
    resolvePromise(data);
  };

  socket.onclose = function(event) {
    console.log("WebSocket is closed now.");
  };

  socket.onerror = function(error) {
    console.error("WebSocket error observed:", error);
    rejectPromise(error);
  };

  return {
    socket: socket,
    dataPromise: dataPromise
  };
}
function getViewerConfiguration() {
  return {
    appContainer: document.body,
    mainContainer: document.getElementById("viewerContainer"),
    viewerContainer: document.getElementById("viewer"),
    toolbar: {
      container: document.getElementById("toolbarViewer"),
      numPages: document.getElementById("numPages"),
      pageNumber: document.getElementById("pageNumber"),
      scaleSelect: document.getElementById("scaleSelect"),
      customScaleOption: document.getElementById("customScaleOption"),
      previous: document.getElementById("previous"),
      next: document.getElementById("next"),
      zoomIn: document.getElementById("zoomIn"),
      zoomOut: document.getElementById("zoomOut"),
      viewFind: document.getElementById("viewFind"),
      print: document.getElementById("print"),
      editorFreeTextButton: document.getElementById("editorFreeText"),
      editorFreeTextParamsToolbar: document.getElementById(
        "editorFreeTextParamsToolbar"
      ),
      editorHighlightButton: document.getElementById("editorHighlight"),
      editorHighlightParamsToolbar: document.getElementById(
        "editorHighlightParamsToolbar"
      ),
      editorHighlightColorPicker: document.getElementById(
        "editorHighlightColorPicker"
      ),
      editorInkButton: document.getElementById("editorInk"),
      editorInkParamsToolbar: document.getElementById("editorInkParamsToolbar"),
      editorStampButton: document.getElementById("editorStamp"),
      editorStampParamsToolbar: document.getElementById(
        "editorStampParamsToolbar"
      ),
      download: document.getElementById("download"),
      createClipButton: document.getElementById("BtnCreateClip"),
    },
    addBookMark:{
      toggleButton: document.getElementById("BtnAddBookMark"),
      cancelButton: document.getElementById("DlgAddBookMark-btn-cancel"),
      submitButton: document.getElementById("DlgAddBookMark-btn-submit"),
      container: document.getElementById("DlgAddBookMark"),
      userInput: document.getElementById("DlgAddBookMark-Name"),
      parentList: document.getElementById("DlgAddBookMark-parentBookmark"),
      
    },
    clipSystem:{
      toggleButton: document.getElementById("BtnCreateClip"),
    },
    secondaryToolbar: {
      toolbar: document.getElementById("secondaryToolbar"),
      toggleButton: document.getElementById("secondaryToolbarToggle"),
      presentationModeButton: document.getElementById("presentationMode"),
      openFileButton:
        typeof PDFJSDev === "undefined" || PDFJSDev.test("GENERIC")
          ? document.getElementById("secondaryOpenFile")
          : null,
      printButton: document.getElementById("secondaryPrint"),
      downloadButton: document.getElementById("secondaryDownload"),
      viewBookmarkButton: document.getElementById("viewBookmark"),
      firstPageButton: document.getElementById("firstPage"),
      lastPageButton: document.getElementById("lastPage"),
      pageRotateCwButton: document.getElementById("pageRotateCw"),
      pageRotateCcwButton: document.getElementById("pageRotateCcw"),
      cursorSelectToolButton: document.getElementById("cursorSelectTool"),
      cursorHandToolButton: document.getElementById("cursorHandTool"),
      scrollPageButton: document.getElementById("scrollPage"),
      scrollVerticalButton: document.getElementById("scrollVertical"),
      scrollHorizontalButton: document.getElementById("scrollHorizontal"),
      scrollWrappedButton: document.getElementById("scrollWrapped"),
      spreadNoneButton: document.getElementById("spreadNone"),
      spreadOddButton: document.getElementById("spreadOdd"),
      spreadEvenButton: document.getElementById("spreadEven"),
      documentPropertiesButton: document.getElementById("documentProperties"),
    },
    sidebar: {
      // Divs (and sidebar button)
      outerContainer: document.getElementById("outerContainer"),
      sidebarContainer: document.getElementById("sidebarContainer"),
      toggleButton: document.getElementById("sidebarToggle"),
      resizer: document.getElementById("sidebarResizer"),
      // Buttons
      thumbnailButton: document.getElementById("viewThumbnail"),
      outlineButton: document.getElementById("viewOutline"),
      attachmentsButton: document.getElementById("viewAttachments"),
      layersButton: document.getElementById("viewLayers"),
      // Views
      thumbnailView: document.getElementById("thumbnailView"),
      outlineView: document.getElementById("outlineView"),
      attachmentsView: document.getElementById("attachmentsView"),
      layersView: document.getElementById("layersView"),
      // View-specific options
      currentOutlineItemButton: document.getElementById("currentOutlineItem"),
    },
    findBar: {
      bar: document.getElementById("findbar"),
      toggleButton: document.getElementById("viewFind"),
      findField: document.getElementById("findInput"),
      highlightAllCheckbox: document.getElementById("findHighlightAll"),
      caseSensitiveCheckbox: document.getElementById("findMatchCase"),
      matchDiacriticsCheckbox: document.getElementById("findMatchDiacritics"),
      entireWordCheckbox: document.getElementById("findEntireWord"),
      findMsg: document.getElementById("findMsg"),
      findResultsCount: document.getElementById("findResultsCount"),
      findPreviousButton: document.getElementById("findPrevious"),
      findNextButton: document.getElementById("findNext"),
    },
    passwordOverlay: {
      dialog: document.getElementById("passwordDialog"),
      label: document.getElementById("passwordText"),
      input: document.getElementById("password"),
      submitButton: document.getElementById("passwordSubmit"),
      cancelButton: document.getElementById("passwordCancel"),
    },
    documentProperties: {
      dialog: document.getElementById("documentPropertiesDialog"),
      closeButton: document.getElementById("documentPropertiesClose"),
      fields: {
        fileName: document.getElementById("fileNameField"),
        fileSize: document.getElementById("fileSizeField"),
        title: document.getElementById("titleField"),
        author: document.getElementById("authorField"),
        subject: document.getElementById("subjectField"),
        keywords: document.getElementById("keywordsField"),
        creationDate: document.getElementById("creationDateField"),
        modificationDate: document.getElementById("modificationDateField"),
        creator: document.getElementById("creatorField"),
        producer: document.getElementById("producerField"),
        version: document.getElementById("versionField"),
        pageCount: document.getElementById("pageCountField"),
        pageSize: document.getElementById("pageSizeField"),
        linearized: document.getElementById("linearizedField"),
      },
    },
    altTextDialog: {
      dialog: document.getElementById("altTextDialog"),
      optionDescription: document.getElementById("descriptionButton"),
      optionDecorative: document.getElementById("decorativeButton"),
      textarea: document.getElementById("descriptionTextarea"),
      cancelButton: document.getElementById("altTextCancel"),
      saveButton: document.getElementById("altTextSave"),
    },
    annotationEditorParams: {
      editorFreeTextFontSize: document.getElementById("editorFreeTextFontSize"),
      editorFreeTextColor: document.getElementById("editorFreeTextColor"),
      editorInkColor: document.getElementById("editorInkColor"),
      editorInkThickness: document.getElementById("editorInkThickness"),
      editorInkOpacity: document.getElementById("editorInkOpacity"),
      editorStampAddImage: document.getElementById("editorStampAddImage"),
      editorFreeHighlightThickness: document.getElementById(
        "editorFreeHighlightThickness"
      ),
      editorHighlightShowAll: document.getElementById("editorHighlightShowAll"),
    },
    printContainer: document.getElementById("printContainer"),
  };
}

async function checkPDFThumbnailsCreated() {
  if(window.PDFNeedThumbnail){
    const pageNum = 1
    const page = await PDFViewerApplication.pdfDocument.getPage(pageNum)
    const viewport = page.getViewport({ scale: 0.5 })
    const canvas = document.createElement('canvas')
    canvas.id="test_thumbnail"
    const context = canvas.getContext('2d')
    canvas.height = viewport.height
    canvas.width = viewport.width
    const renderContext = {
      canvasContext: context,
      viewport: viewport
    }
    // document.body.appendChild(canvas);
    await page.render(renderContext).promise;
    const base64String = canvas.toDataURL("image/png");
    const result = await window.backend.save_thumbnail(base64String);
    console.log("thumbnail save",result)
    window.PDFNeedThumbnail = false
  }
}

async function webViewerLoad() {
  /**
   * @type {PDFSocketInfo}
   */
  const pdfsocketinfo = window.PDFViewerApplicationDataInfo
  const config = getViewerConfiguration();
  const pdf_data = {data:null,filename:pdfsocketinfo.pdf_name};
  const { socket, dataPromise } = initializeWebSocket(pdfsocketinfo);
  pdf_data.data = await dataPromise;
  await PDFViewerApplication.run(config);
  await PDFViewerApplication.open(pdf_data);
  PDFViewerApplication.eventBus.on('pagesinit', checkPDFThumbnailsCreated);

  const event = new CustomEvent("webviewerloaded", {
    bubbles: true,
    cancelable: true,
    detail: {
      source: window,
      app: PDFViewerApplication,
    },
  });
  document.dispatchEvent(event);
  window.PDFViewerApplication.eventBus.on(CONSTANTS.eventName.PDF_SAVE_START,(evt)=>{
    console.log(evt,"save start")
  })
  window.PDFViewerApplication.eventBus.on(CONSTANTS.eventName.PDF_SAVE_COMPLETED,(evt)=>{
    console.log(evt,"save completed")
  })

}
function Register_PDFViewerLoader(){
  if (document.readyState === "interactive" || document.readyState === "complete") {
    webViewerLoad();
  } else {
      document.addEventListener("DOMContentLoaded", webViewerLoad, true);
  }
}
// Block the "load" event until all pages are loaded, to ensure that printing
// works in Firefox; see https://bugzilla.mozilla.org/show_bug.cgi?id=1618553
document.blockUnblockOnload?.(true);
window.Register_PDFViewerLoader=Register_PDFViewerLoader
// if (
//   document.readyState === "interactive" ||
//   document.readyState === "complete"
// ) {
//   webViewerLoad();
// } else {
//   document.addEventListener("DOMContentLoaded", webViewerLoad, true);
// }

export {
  webViewerLoad as PDFViewerLoader,
  PDFViewerApplication,
  AppConstants as PDFViewerApplicationConstants,
  AppOptions as PDFViewerApplicationOptions,
};
