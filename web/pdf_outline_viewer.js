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
/// <reference path="../types.pdf_viewer.d.ts" />
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
import { PDFOutlineObject,PDFOutlineItem } from "./types.js"
import {PDFViewerApplication} from "./app.js"
import { CONSTANTS } from "./constants.js";

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

/**
 * @typedef {Object} jstreeNode
 * @property {jstreeNode[]} children
 * @property {string[]} parents
 * @property {string} text
 * @property {string} id
 * @property {Object} data
 * @property {Object} state
 */

/**
 * @typedef {Object} jstreeMoveNodeEvent
 * @property {HTMLElement} currentTarget
 * @property {HTMLElement} delegateTarget
 * @property {HTMLElement} target
 * @property {Object} handleObj
 * @property {number} timeStamp
 * @property {Object} data
 * @property {Object} result
 */

/**
 * @typedef {Object} jstreeMoveNodeEventData
 * @property {Object} instance
 * @property {Object} new_instance
 * @property {Object} old_instance
 * @property {string} parent
 * @property {string} old_parent
 * @property {number} position
 * @property {number} old_position 
 * @property {jstreeNode} node
 * @property {boolean} is_multi
 * @property {boolean} is_foreign
 */


/**
 * @typedef {Object} jstreeSelectNodeEvent
 * @property {HTMLElement} currentTarget
 * @property {HTMLElement} delegateTarget
 * @property {HTMLElement} target
 * @property {Object} handleObj
 * @property {number} timeStamp
 * @property {Object} data
 * @property {Object} result
 */

/**
 * @typedef {Object} jstreeSelectNodeEventData
 * @property {jstreeSelectNodeEvent} event
 * @property {Object} instance
 * @property {jstreeNode} node
 * @property {string[]} selected
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
    // this.eventBus._on(
    //   "currentoutlineitem",
    //   this._currentOutlineItem.bind(this)
    // );

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
  render({ outline, pdfDocument,needSave=false }) {
    console.log("jstree",outline)
    if (this._outline) {
      this.reset();
    }
    this._outline = outline;
    this._pdfDocument = pdfDocument || null;

    if (!outline) {
      this._dispatchEvent(/* outlineCount = */ 0);
      return;
    }
    const { linkService ,saveOutline} = this;
    const self = this
    const fragment = document.createElement("div");
    $(function () {
      $(fragment).jstree({
        core: {
          themes: {
            icons: false,
          },
          check_callback: true,
          data: outline.children,
        },
        plugins: ["dnd", "contextmenu"],
        contextmenu: {
            items: function (node) {
              return {
                Create: {
                  label: "创建子节点",
                  action: function (data) {
                    selectedNode = data.reference;
                    $("#node-dialog").show();
                  },
                },
                Rename: {
                  label: "重命名",
                  action: function (data) {
                    var inst = $.jstree.reference(data.reference);
                    var obj = inst.get_node(data.reference);
                    inst.edit(obj);
                  },
                },
                Delete: {
                  label: "删除",
                  action: function (data) {
                    var inst = $.jstree.reference(data.reference);
                    var obj = inst.get_node(data.reference);
                    if (inst.is_selected(obj)) {
                      inst.delete_node(inst.get_selected());
                    } else {
                      inst.delete_node(obj);
                    }
                  },
                },
                toggle:{
                  label:"展开/折叠",
                  action:function(data){
                    console.log(data);
                    var inst = $.jstree.reference(data.reference);
                    var obj = inst.get_node(data.reference);
                    inst.toggle_node(obj);
                  }
                },
                openAll:{
                  label:"展开所有",
                  action:function(data){
                    console.log(data);
                    var inst = $.jstree.reference(data.reference);
                    inst.open_all();
                  }
                },
                closeAll:{
                  label:"折叠所有",
                  action:function(data){
                    console.log(data);
                    var inst = $.jstree.reference(data.reference);
                    inst.close_all();
                  }
                }
              };
            },
          },
      });
      $(fragment).on("ready.jstree", function (e, data) {
        if(needSave){
          self.saveOutline();
        }      
      });
      $(fragment).on("select_node.jstree", function (e, data) {
        var node = data.node;
        var nodeData = node.data;
        console.log(e,data);
        if (data.event.button === CONSTANTS.mouseButton.LEFT){
          linkService.goToDestination(nodeData.dest);
        }
        // if (nodeData) {
        //   $("#node-data").html(
        //     "选中节点数据: ID = " +
        //       nodeData.id +
        //       ", 自定义字段 = " +
        //       nodeData.custom_field
        //   );
        // } else {
        //   $("#node-data").html("该节点没有附加数据");
        // }
        

      });

      $(fragment).on("move_node.jstree", function (e, data) {
        var movedNode = data.node;
        var oldParent = data.old_parent;
        var newParent = data.parent;
        var oldPosition = data.old_position;
        var newPosition = data.position;
        // var moveInfo =
        //   "节点移动信息:<br>" +
        //   "移动的节点: " +
        //   movedNode.text +
        //   "<br>" +
        //   "节点ID: " +
        //   (movedNode.data ? movedNode.data.id : "无ID") +
        //   "<br>" +
        //   "自定义字段: " +
        //   (movedNode.data ? movedNode.data.custom_field : "无自定义字段") +
        //   "<br>" +
        //   "原父节点: " +
        //   oldParent +
        //   "<br>" +
        //   "新父节点: " +
        //   newParent +
        //   "<br>" +
        //   "原位置: " +
        //   oldPosition +
        //   "<br>" +
        //   "新位置: " +
        //   newPosition;

        // $("#move-info").html(moveInfo);
        console.log(e,data);
        saveOutline.bind(self)();
      });
      $("#cancel-create").on("click", function () {
        $("#node-dialog").hide();
        $("#node-name").val("");
        $("#custom-field").val("");
      });
      setTimeout(() => {
        console.log("outline rendered" ,$(fragment).jstree(true).get_json());
      }, 100);
      $(fragment).on('ready.jstree', function() {
        $(this).jstree('open_all');
      });
    });
    
    // const queue = [{ parent: fragment, children: outline.children }];
    // let outlineCount = 0,
    //   hasAnyNesting = false;
    
    // while (queue.length > 0) {
    //   const levelData = queue.shift();
    //   for (const item of levelData.children) {
    //     const div = document.createElement("div");
    //     div.className = "treeItem";
    //     const element = document.createElement("a");
    //     this._bindLink(element, item);
    //     element.textContent = item.title;
    //     div.append(element);
    //     if (item.children.length > 0) {
    //       hasAnyNesting = true;
    //       this._addToggleButton(div, true);
    //       const itemsDiv = document.createElement("div");
    //       itemsDiv.className = "treeItems";
    //       div.append(itemsDiv);
    //       queue.push({ parent: itemsDiv, items: item.items });
    //     }
    //     levelData.parent.append(div);
    //     outlineCount++;
    //   }
    // }

    this._finishRendering(fragment, 0, false);

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

  /**
   * Convert the old outline to the new one.
   * @returns {Promise<PDFOutlineObject|null>} The new outline object, or null if the conversion failed.
   */
  async convert_OldOutline_to_newOutline(){
    /**
     * @type {OldPDFOutline|null}
     */
    const old_outline = await PDFViewerApplication.pdfDocument.getOutline()
    const new_outline  = await PDFOutlineObject.from_oldOutline(PDFViewerApplication.pdf_info.uuid,old_outline);
    return new_outline;
  }
  
  saveOutline(){
    /** @type{jstreeNode[]} */
    const _saveData = $(document.querySelector(".jstree")).jstree(true).get_json();
    // console.log("saveData = ", _saveData,"this._outline=",this._outline,"this=",this);
    this._outline.children = _saveData.map((item)=>new PDFOutlineItem(item));
    this._outline.updated_at = Number(new Date());
    // console.log("this._outline=",this._outline.toDict());
    window.backend.upload_pdf_outline(this._outline.toString());
  }

}

export { PDFOutlineViewer };
