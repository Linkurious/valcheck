'use strict';

import fs = require('fs');
import path = require('path');

import { Valcheck } from './Valcheck';

export class ValcheckNode<E> extends Valcheck<E> {

  /**
   * Check if the given file path points to a readable file.
   *
   * @param {string} key
   * @param {*} value A file path
   * @param {string} [rootPath] Will resolve `value` in `rootPath` instead of current working directory.
   * @returns {*} error, if any
   */
  public file(key: string, value: unknown, rootPath?: string): E | void {
    let error;
    if ((error = this.string(key, value, true))) { return error; }

    let stat;
    try {
      if (rootPath) {
        value = path.resolve(rootPath, value as string);
      }
      stat = fs.statSync(value as string);
    } catch (e) {
      return this._error(key, `must be an existing/readable file (${value})`);
    }
    if (!stat.isFile()) {
      return this._error(key, `must be a file (${value})`);
    }
  }

  /**
   * Check if `value` is a directory.
   *
   * @param {string} key
   * @param {*} value
   * @param {string} [rootPath] Will resolve `value` in `rootPath` instead of current working directory.
   * @returns {*} error, if any
   */
  public dir(key: string, value: unknown, rootPath?: string): E | void {
    let error;
    if ((error = this.string(key, value, true))) { return error; }

    let stat;
    try {
      if (rootPath) {
        value = path.resolve(rootPath, value as string);
      }
      stat = fs.statSync(value as string);
    } catch (e) {
      return this._error(key, `must be an existing/readable directory (${value})`);
    }
    if (!stat.isDirectory()) {
      return this._error(key, `must be a directory (${value})`);
    }
  }
}
