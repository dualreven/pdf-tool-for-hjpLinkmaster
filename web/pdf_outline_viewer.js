/* Copyright 2012 Mozilla Foundation
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

/** @typedef {import("./event_utils.js").EventBus} EventBus */
// eslint-disable-next-line max-len
/** @typedef {import("./download_manager.js").DownloadManager} DownloadManager */
/** @typedef {import("./interfaces.js").IPDFLinkService} IPDFLinkService */
// eslint-disable-next-line max-len
/** @typedef {import("../src/display/api.js").PDFDocumentProxy} PDFDocumentProxy */

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


import { BaseTreeViewer } from "./base_tree_viewer.js";
import { SidebarView } from "./ui_utils.js";
import { PDFOutlineObject } from "./types.js"
import {PDFViewerApplication} from "./app.js"

/**
 * @typedef {Object} PDFOutlineViewerOptions
 * @property {HTMLDivElement} container - The viewer element.
 * @property {EventBus} eventBus - The application event bus.
 * @property {IPDFLinkService} linkService - The navigation/linking service.
 * @property {DownloadManager} downloadManager - The download manager.
 */

/**
 * @typedef {Object} PDFOutlineViewerRenderParameters
 * @property {PDFOutlineObject} outline - An array of outline objects.
 * @property {PDFDocumentProxy} pdfDocument - A {PDFDocument} instance.
 */

class PDFOutlineViewer extends BaseTreeViewer {
  /**
   * @param {PDFOutlineViewerOptions} options
   */
  constructor(options) {
    super(options);
    this.linkService = options.linkService;
    this.downloadManager = options.downloadManager;

    this.eventBus._on("toggleoutlinetree", this._toggleAllTreeItems.bind(this));
    this.eventBus._on(
      "currentoutlineitem",
      this._currentOutlineItem.bind(this)
    );

    this.eventBus._on("pagechanging", evt => {
      this._currentPageNumber = evt.pageNumber;
    });
    this.eventBus._on("pagesloaded", evt => {
      this._isPagesLoaded = !!evt.pagesCount;

      // If the capability is still pending, see the `_dispatchEvent`-method,
      // we know that the `currentOutlineItem`-button can be enabled here.
      this._currentOutlineItemCapability?.resolve(
        /* enabled = */ this._isPagesLoaded
      );
    });
    this.eventBus._on("sidebarviewchanged", evt => {
      this._sidebarView = evt.view;
    });
    // if (!PDFViewerApplication.pdf_info.outline){
    //   this.convert_OldOutline_to_newOutline();
    // }


  }

  reset() {
    super.reset();
    this._outline = null;

    this._pageNumberToDestHashCapability = null;
    this._currentPageNumber = 1;
    this._isPagesLoaded = null;

    this._currentOutlineItemCapability?.resolve(/* enabled = */ false);
    this._currentOutlineItemCapability = null;
  }

  /**
   * @protected
   */
  _dispatchEvent(outlineCount) {
    this._currentOutlineItemCapability = Promise.withResolvers();
    if (
      outlineCount === 0 ||
      this._pdfDocument?.loadingParams.disableAutoFetch
    ) {
      this._currentOutlineItemCapability.resolve(/* enabled = */ false);
    } else if (this._isPagesLoaded !== null) {
      this._currentOutlineItemCapability.resolve(
        /* enabled = */ this._isPagesLoaded
      );
    }

    this.eventBus.dispatch("outlineloaded", {
      source: this,
      outlineCount,
      currentOutlineItemPromise: this._currentOutlineItemCapability.promise,
    });
  }

  /**
   * @protected
   */
  _bindLink(
    element,
    // { url, newWindow, action, attachment, page, setOCGState },
    { page}
  ) {
    const { linkService } = this;

    // if (url) {
    //   linkService.addLinkAttributes(element, url, newWindow);
    //   return;
    // }
    // if (action) {
    //   element.href = linkService.getAnchorUrl("");
    //   element.onclick = () => {
    //     linkService.executeNamedAction(action);
    //     return false;
    //   };
    //   return;
    // }
    // if (attachment) {
    //   element.href = linkService.getAnchorUrl("");
    //   element.onclick = () => {
    //     this.downloadManager.openOrDownloadData(
    //       attachment.content,
    //       attachment.filename
    //     );
    //     return false;
    //   };
    //   return;
    // }
    // if (setOCGState) {
    //   element.href = linkService.getAnchorUrl("");
    //   element.onclick = () => {
    //     linkService.executeSetOCGState(setOCGState);
    //     return false;
    //   };
    //   return;
    // }

    // element.href = linkService.getDestinationHash(dest);
    element.onclick = evt => {
      this._updateCurrentTreeItem(evt.target.parentNode);
      linkService.goToPage(page)
      // if (page) {
      //   linkService.goToDestination(dest);
      // }
      return false;
    };
  };

  /**
   * @private
   */
  _setStyles(element, { bold, italic }) {
    if (bold) {
      element.style.fontWeight = "bold";
    }
    if (italic) {
      element.style.fontStyle = "italic";
    }
  }

  /**
   * @protected
   * @param {object} 
   */
  _addToggleButton(div, hidden ) {
    // let hidden = false;
    // if (count < 0) {
    //   let totalCount = items.length;
    //   if (totalCount > 0) {
    //     const queue = [...items];
    //     while (queue.length > 0) {
    //       const { count: nestedCount, items: nestedItems } = queue.shift();
    //       if (nestedCount > 0 && nestedItems.length > 0) {
    //         totalCount += nestedItems.length;
    //         queue.push(...nestedItems);
    //       }
    //     }
    //   }
    //   if (Math.abs(count) === totalCount) {
    //     hidden = true;
    //   }
    // }
    super._addToggleButton(div, hidden);
  }

  /**
   * @private
   */
  _toggleAllTreeItems() {
    if (!this._outline) {
      return;
    }
    super._toggleAllTreeItems();
  }

  /**
   * @param {PDFOutlineViewerRenderParameters} params
   */
  render({ outline, pdfDocument }) {
    console.log("开始加载outline",outline,pdfDocument)
    if (this._outline) {
      this.reset();
    }
    this._outline = outline || null;
    this._pdfDocument = pdfDocument || null;

    if (!outline) {
      this._dispatchEvent(/* outlineCount = */ 0);
      return;
    }

    const fragment = document.createDocumentFragment();
    const queue = [{ parent: fragment, items: outline.items }];
    let outlineCount = 0,
      hasAnyNesting = false;
    console.log("outline_render 变量准备工作完成")
    while (queue.length > 0) {
      const levelData = queue.shift();

      for (const item of levelData.items) {
        const div = document.createElement("div");
        div.className = "treeItem";

        const element = document.createElement("a");
        this._bindLink(element, item);
        // this._setStyles(element, item);
        element.textContent = item.title;//this._normalizeTextContent(item.title);

        div.append(element);

        if (item.items.length > 0) {
          hasAnyNesting = true;
          this._addToggleButton(div, true);

          const itemsDiv = document.createElement("div");
          itemsDiv.className = "treeItems";
          div.append(itemsDiv);

          queue.push({ parent: itemsDiv, items: item.items });
        }
        
        levelData.parent.append(div);
        outlineCount++;
      }
    }
    console.log("outline_render 循环工作完成")

    this._finishRendering(fragment, outlineCount, hasAnyNesting);
    console.log("结束加载outline")

  }

  /**
   * Find/highlight the current outline item, corresponding to the active page.
   * @private
   */
  async _currentOutlineItem() {
    if (!this._isPagesLoaded) {
      throw new Error("_currentOutlineItem: All pages have not been loaded.");
    }
    if (!this._outline || !this._pdfDocument) {
      return;
    }

    const pageNumberToDestHash = await this._getPageNumberToDestHash(
      this._pdfDocument
    );
    if (!pageNumberToDestHash) {
      return;
    }
    this._updateCurrentTreeItem(/* treeItem = */ null);

    if (this._sidebarView !== SidebarView.OUTLINE) {
      return; // The outline view is no longer visible, hence do nothing.
    }
    // When there is no destination on the current page, always check the
    // previous ones in (reverse) order.
    for (let i = this._currentPageNumber; i > 0; i--) {
      const destHash = pageNumberToDestHash.get(i);
      if (!destHash) {
        continue;
      }
      const linkElement = this.container.querySelector(`a[href="${destHash}"]`);
      if (!linkElement) {
        continue;
      }
      this._scrollToCurrentTreeItem(linkElement.parentNode);
      break;
    }
  }

  /**
   * To (significantly) simplify the overall implementation, we will only
   * consider *one* destination per page when finding/highlighting the current
   * outline item (similar to e.g. Adobe Reader); more specifically, we choose
   * the *first* outline item at the *lowest* level of the outline tree.
   * @private
   */
  async _getPageNumberToDestHash(pdfDocument) {
    if (this._pageNumberToDestHashCapability) {
      return this._pageNumberToDestHashCapability.promise;
    }
    this._pageNumberToDestHashCapability = Promise.withResolvers();

    const pageNumberToDestHash = new Map(),
      pageNumberNesting = new Map();
    const queue = [{ nesting: 0, items: this._outline }];
    while (queue.length > 0) {
      const levelData = queue.shift(),
        currentNesting = levelData.nesting;
      for (const { dest, items } of levelData.items) {
        let explicitDest, pageNumber;
        if (typeof dest === "string") {
          explicitDest = await pdfDocument.getDestination(dest);

          if (pdfDocument !== this._pdfDocument) {
            return null; // The document was closed while the data resolved.
          }
        } else {
          explicitDest = dest;
        }
        if (Array.isArray(explicitDest)) {
          const [destRef] = explicitDest;

          if (destRef && typeof destRef === "object") {
            // The page reference must be available, since the current method
            // won't be invoked until all pages have been loaded.
            pageNumber = pdfDocument.cachedPageNumber(destRef);
          } else if (Number.isInteger(destRef)) {
            pageNumber = destRef + 1;
          }

          if (
            Number.isInteger(pageNumber) &&
            (!pageNumberToDestHash.has(pageNumber) ||
              currentNesting > pageNumberNesting.get(pageNumber))
          ) {
            const destHash = this.linkService.getDestinationHash(dest);
            pageNumberToDestHash.set(pageNumber, destHash);
            pageNumberNesting.set(pageNumber, currentNesting);
          }
        }

        if (items.length > 0) {
          queue.push({ nesting: currentNesting + 1, items });
        }
      }
    }

    this._pageNumberToDestHashCapability.resolve(
      pageNumberToDestHash.size > 0 ? pageNumberToDestHash : null
    );
    return this._pageNumberToDestHashCapability.promise;
  }

  async convert_OldOutline_to_newOutline(){
    /**
     * @type {OldPDFOutline|null}
     */
    const old_outline = await PDFViewerApplication.pdfDocument.getOutline()
    const new_outline  = await PDFOutlineObject.from_oldOutline(PDFViewerApplication.pdf_info.uuid,old_outline);
    return new_outline;
  }
}

export { PDFOutlineViewer };
