/* Copyright 2018 Mozilla Foundation
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

class GlobalWorkerOptions {
  static #port = null;

  static #src = "../pdf.worker.js";

  /**
   * @type {Worker | null}
   */
  static get workerPort() {
    return this.#port;
  }

  /**
   * @param {Worker | null} workerPort - Defines global port for worker process.
   *   Overrides the `workerSrc` option.
   */
  static set workerPort(val) {
    if (
      !(typeof Worker !== "undefined" && val instanceof Worker) &&
      val !== null
    ) {
      throw new Error("Invalid `workerPort` type.");
    }
    this.#port = val;
  }

  /**
   * @type {string}
   */
  static get workerSrc() {
    return this.#src;
  }

  /**
   * @param {string} workerSrc - A string containing the path and filename of
   *   the worker file.
   *
   *   NOTE: The `workerSrc` option should always be set, in order to prevent
   *         any issues when using the PDF.js library.
   */
  static set workerSrc(val) {
    if (typeof val !== "string") {
      throw new Error("Invalid `workerSrc` type.");
    }
    this.#src = val;
  }
}

export { GlobalWorkerOptions };
