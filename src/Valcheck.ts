/**
 * Created on 2015-06-30
 */
'use strict';

let fs: { statSync(file: string): { isFile(): boolean, isDirectory(): boolean } };
let path: { resolve(p1: string, p2: string): string };
// @ts-ignore
if (process) {
  // @ts-ignore
  fs = require('fs');
  // @ts-ignore
  path = require('path');
}

/**
 * @type {function(Array, Array):Array}
 */
import difference = require('lodash.difference');

/**
 * @type {function(Array, Array):Array}
 */
import intersection = require('lodash.intersection');

const HEX6_COLOR_RE = /^#[a-fA-F0-9]{6}$/;
const HEX3_COLOR_RE = /^#[a-fA-F0-9]{3}$/;
// tslint:disable-next-line:max-line-length
const RGB_COLOR_RE = /^rgb\(\s*([01]?\d\d?|2[0-4]\d|25[0-5])\s*,\s*([01]?\d\d?|2[0-4]\d|25[0-5])\s*,\s*([01]?\d\d?|2[0-4]\d|25[0-5])\s*\)$/i;
// tslint:disable-next-line:max-line-length
const RGBA_COLOR_RE = /^rgba\(\s*([01]?\d\d?|2[0-4]\d|25[0-5])\s*,\s*([01]?\d\d?|2[0-4]\d|25[0-5])\s*,\s*([01]?\d\d?|2[0-4]\d|25[0-5])\s*,\s*(?:0|1|0?\.\d+)\s*\)$/i;
const URL_RE = /^([a-zA-Z]{2,8}(?:\+[a-zA-Z]{2,8})?):\/\/([^/\s]+)(\/[^\s]*)?$/i;
const HTTP_URL_RE = /^(https?):\/\/([^/\s]+)(\/[^\s]*)?$/i;
const WS_URL_RE = /^(wss?):\/\/([^/\s]+)(\/[^\s]*)?$/i;
const DEFINITION_FIELDS = [
  'deprecated',
  'required',
  'requiredUnless',
  'requiredIf',
  'values',
  'type',
  'arrayItem', 'arraySize',
  'anyProperty',
  'properties', 'policy',
  'check'
];

/**
 * A validation error handler
 *
 * @callback errorHandler
 * @param {string} the validation error message
 */

/**
 * A library usage error
 *
 * @callback bugHandler
 * @param {string} the library usage error message
 */

const TYPE_ARTICLE: {[key: string]: string} = {
  null: '',
  undefined: '',
  NaN: '',
  array: 'an ',
  object: 'an ',
  boolean: 'a ',
  number: 'a ',
  string: 'a ',
  function: 'a '
};

const CSS_COLORS = [
  'aliceblue', 'antiquewhite', 'aqua', 'aquamarine', 'azure', 'beige', 'bisque', 'black', 'blanchedalmond',
  'blue', 'blueviolet', 'brown', 'burlywood', 'cadetblue', 'chartreuse', 'chocolate', 'coral',
  'cornflowerblue', 'cornsilk', 'crimson', 'cyan', 'darkblue', 'darkcyan', 'darkgoldenrod', 'darkgray',
  'darkgreen', 'darkgrey', 'darkkhaki', 'darkmagenta', 'darkolivegreen', 'darkorange', 'darkorchid',
  'darkred', 'darksalmon', 'darkseagreen', 'darkslateblue', 'darkslategray', 'darkslategrey',
  'darkturquoise', 'darkviolet', 'deeppink', 'deepskyblue', 'dimgray', 'dimgrey', 'dodgerblue',
  'firebrick', 'floralwhite', 'forestgreen', 'fuchsia', 'gainsboro', 'ghostwhite', 'gold', 'goldenrod',
  'gray', 'green', 'greenyellow', 'grey', 'honeydew', 'hotpink', 'indianred', 'indigo', 'ivory', 'khaki',
  'lavender', 'lavenderblush', 'lawngreen', 'lemonchiffon', 'lightblue', 'lightcoral', 'lightcyan',
  'lightgoldenrodyellow', 'lightgray', 'lightgreen', 'lightgrey', 'lightpink', 'lightsalmon',
  'lightseagreen', 'lightskyblue', 'lightslategray', 'lightslategrey', 'lightsteelblue', 'lightyellow',
  'lime', 'limegreen', 'linen', 'magenta', 'maroon', 'mediumaquamarine', 'mediumblue', 'mediumorchid',
  'mediumpurple', 'mediumseagreen', 'mediumslateblue', 'mediumspringgreen', 'mediumturquoise',
  'mediumvioletred', 'midnightblue', 'mintcream', 'mistyrose', 'moccasin', 'navajowhite', 'navy',
  'oldlace', 'olive', 'olivedrab', 'orange', 'orangered', 'orchid', 'palegoldenrod', 'palegreen',
  'paleturquoise', 'palevioletred', 'papayawhip', 'peachpuff', 'peru', 'pink', 'plum', 'powderblue',
  'purple', 'red', 'rosybrown', 'royalblue', 'saddlebrown', 'salmon', 'sandybrown', 'seagreen', 'seashell',
  'sienna', 'silver', 'skyblue', 'slateblue', 'slategray', 'slategrey', 'snow', 'springgreen', 'steelblue',
  'tan', 'teal', 'thistle', 'tomato', 'turquoise', 'violet', 'wheat', 'white', 'whitesmoke', 'yellow',
  'yellowgreen'
];

export type Type = 'null' | 'undefined' | 'array' | 'object' | 'number' | 'NaN' | 'boolean' | 'string' | 'function';

export type FieldPolicy = 'strict' | 'strictExist' | 'inclusive';

/**
 * @typedef {object} FieldDefinition
 * @property {boolean|undefined} required Whether the property is required.
 * @property {string|undefined} requiredUnless The property will be required unless another property called `requiredUnless` exists at the same level.
 * @property {string|undefined} requiredIf The property will be required if another property called `requiredIf` exists at the same level.
 * @property {string|undefined} deprecated Whether the property is deprecated (if defined), and for which reason.
 * @property {Array<*>|undefined} values List of allowed values for the property.
 * @property {string|string[]|undefined} type The allowed type(s) of the property.
 * @property {function|string|Array<*>|undefined} check Called with `value` and `key` for specific property validation.
 * @property {FieldDefinition|undefined} arrayItem Validate array items (forces `type` to "array").
 * @property {number|undefined} arraySize Validate array size (forces `type` to "array").
 * @property {FieldDefinition|undefined} anyProperty Validate any nested properties (forces `type` to "object").
 * @property {object.<string, FieldDefinition>|undefined} properties Validate listed nested properties (forces `type` to "object").
 * @property {string|undefined} policy When using `properties`, whether the properties are:
 *                                                - "strict" (default): Only described properties are allowed.
 *                                                - "strictExist": Only described properties are allowed, at least one must be present.
 *                                                - "inclusive": Non-described properties are allowed.
 */
export interface FieldDefinition<E> {
  required?: boolean;
  requiredUnless?: string;
  requiredIf?: string;
  deprecated?: string;
  values?: Array<unknown>;
  type?: string | string[];
  check?: (key: string, value: unknown) => (E | void) | [string, ...Array<unknown>] | keyof Valcheck<E>;
  arrayItem?: FieldDefinition<E>;
  arraySize?: number;
  anyProperty?: FieldDefinition<E>;
  properties?: {
    [key: string]: FieldDefinition<E>;
  };
  policy?: FieldPolicy;
}

/**
 * @class Valcheck
 */
export default class Valcheck<E> {

  public bugHandler: (error: string) => E;
  public errorHandler: (error: string) => E;

  /**
   * A validator.
   *
   * The error and bug handlers MUST return a truthy value or throw.
   * Examples of *non-truthy* values:
   * - 0
   * - "" (an empty string)
   * - NaN
   * - null
   * - undefined
   *
   * @param {function(string):*} errorHandler a function that must handle check-error message
   * @param {function(string):*} bugHandler a function that  must handle code-bug message
   */
  constructor(errorHandler?: (error: string) => E, bugHandler?: (error: string) => E) {
    if (errorHandler !== undefined) {
      this.errorHandler = errorHandler;
    } else {
      this.errorHandler = this.DEFAULT_ERROR_HANDLER;
    }

    if (bugHandler !== undefined) {
      this.bugHandler = bugHandler;
    } else {
      this.bugHandler = this.errorHandler;
    }
  }

  private DEFAULT_ERROR_HANDLER(message: string): E {
    throw new Error(message);
  }

  /**
   * Handle a check failure
   *
   * @param {string} key
   * @param {string} message
   * @return {*} a truthy value in case of error.
   * @private
   */
  public _error(key: string, message: string): E | void {
    return this.errorHandler(`"${key}" ${message}.`);
  }

  /**
   * Handle library usage bugs.
   *
   * @param {string} message
   * @returns {*} a truthy value in case of bug.
   * @private
   */
  public _bug(message: string): E | void {
    return this.bugHandler('Library usage error: ' + message + '.');
  }

  /**
   * Checks if 'value' is a non-empty string
   *
   * @param {string} key value key
   * @param {*} value tested value
   * @returns {*} error, if any
   */
  public nonEmpty(key: string, value: unknown): E | void {
    return this.string(key, value, true);
  }

  /**
   * Checks if 'value' is a string
   *
   * @param {string} key value key
   * @param {*} value tested value
   * @param {boolean} [nonEmpty=false] whether to fail id the string is empty
   * @param {boolean} [noSpace=false] whether to fail if the string contains spaces
   * @param {number} [minSize]
   * @param {number} [maxSize]
   * @returns {*} error, if any
   */
  public string(
    key: string,
    value: unknown,
    nonEmpty: boolean = false,
    noSpace: boolean = false,
    minSize?: number,
    maxSize?: number
  ): E | void {
    let error;
    if ((error = this.type(key, value, 'string'))) { return error; }

    if (nonEmpty && value === '') {
      return this._error(key, 'must be a non-empty string');
    }
    if (noSpace && (value as string).indexOf(' ') > -1) {
      return this._error(key, 'must not contain spaces');
    }
    if ((error = this._checkInterval(key, (value as string).length, 'length must be', minSize, maxSize))) {
      return error;
    }
  }

  /**
   * Checks if `value` starts with `prefix`.
   *
   * @param {string} key value name
   * @param {*} value tested value
   * @param {string} prefix
   * @param {boolean} [needSuffix=true] Whether the value must be longer than the given prefix.
   * @returns {*} error, if any
   */
  public startsWith(key: string, value: unknown, prefix: string, needSuffix: boolean = true): E | void {
    let error;
    if ((error = this.string(key, value))) { return error; }

    if ((value as string).indexOf(prefix) !== 0) {
      return this._error(key, `must start with "${prefix}"`);
    }
    if (needSuffix !== false && (value as string).length <= prefix.length) {
      return this._error(key, `must be longer than "${prefix}"`);
    }
  }

  /**
   * Checks if `value` is a hexadecimal color string.
   *
   * @param {string} key name of the value
   * @param {*} value tested value
   * @param {boolean} [allowShort=true] Whether to allow short hex colors (#ABC)
   * @returns {*} error, if any
   */
  public hexColor(key: string, value: unknown, allowShort: boolean = true): E | void {
    allowShort = allowShort === undefined ? true : allowShort;

    let error;
    if ((error = this.string(key, value, true))) { return error; }

    if (HEX6_COLOR_RE.test(value as string)) { return; }

    if (allowShort && HEX3_COLOR_RE.test(value as string)) { return; }

    return this._error(
      key, `must be an hexadecimal color (e.g., ${allowShort ? '#aa00f8 or #a1f' : '#aa00f8'})`
    );
  }

  /**
   * Checks if `value` is a rgb/rgba color expression.
   *
   * @param {string} key
   * @param {*} value
   * @returns {*} error, if any
   */
  public rgbColor(key: string, value: unknown): E | void {
    let error;
    if ((error = this.string(key, value, true))) { return error; }

    if (RGB_COLOR_RE.test(value as string)) { return; }

    if (RGBA_COLOR_RE.test(value as string)) { return; }

    return this._error(
      key, 'must be an rgb/rgba color (e.g., "rgb(0, 170, 200)" or "rgba(255, 30, 255, 0.5)")'
    );
  }

  /**
   * Checks if `value` is a CSS color expression (hexadecimal, rgb, rgba or colorname)
   *
   * @param {string} key
   * @param {*} value
   * @returns {*} error, if any
   */
  public cssColor(key: string, value: unknown): E | void {
    let error;
    if ((error = this.string(key, value, true))) { return error; }

    if (CSS_COLORS.indexOf(value as string) >= 0) { return; }

    if (HEX6_COLOR_RE.test(value as string)) { return; }

    if (HEX3_COLOR_RE.test(value as string)) { return; }

    if (RGB_COLOR_RE.test(value as string)) { return; }

    if (RGBA_COLOR_RE.test(value as string)) { return; }

    return this._error(
      key, 'must be a CSS color (e.g., "#ff0081", "rgb(0, 170, 10)", "rgba(255, 30, 255, 0.5)" or "red")'
    );
  }

  /**
   * Check if 'value' is neither null nor undefined
   *
   * @param {string} key value key
   * @param {*} value tested value
   * @returns {*} error, if any
   */
  public exist(key: string, value: unknown): E | void {
    if (value === undefined) {
      return this._error(key, 'must not be undefined');
    }
    if (value === null) {
      return this._error(key, 'must not be null');
    }
  }

  /**
   * Check that value is null.
   *
   * @param {string} key
   * @param {*} value
   * @returns {*} error, if any
   */
  public 'null'(key: string, value: unknown): E | void {
    if (value !== null) {
      return this._error(key, 'must be null');
    }
  }

  /**
   * Check if 'value' is a defined object
   *
   * @param {string} key value key
   * @param {*} value tested value
   * @returns {*} error, if any
   */
  public object(key: string, value: unknown): E | void {
    return this.type(key, value, 'object');
  }

  /**
   * Check if `value` is an array (with length between `minLength` and `maxLength`)
   *
   * @param {string} key
   * @param {*} value
   * @param {number} [minLength]
   * @param {number} [maxLength]
   * @returns {*} error, if any
   */
  public array(key: string, value: unknown, minLength?: number, maxLength?: number): E | void {
    let error;
    if ((error = this.type(key, value, 'array'))) { return error; }

    if ((error = this._checkInterval(key, (value as Array<unknown>).length, 'length must be', minLength, maxLength))) {
      return error;
    }
  }

  /**
   * Check if  number is in an interval.
   *
   * @param {string} key Main value key.
   * @param {number} value Number to validate interval for.
   * @param {string} errorPrefix Error prefix string.
   * @param {number} [min] Minimum value.
   * @param {number} [max] Maximum value.
   * @returns {*} error, if any
   * @private
   */
  public _checkInterval(key: string, value: number, errorPrefix: string, min?: number, max?: number): E | void {
    if (
      min !== undefined && max !== undefined &&
      min !== -Infinity && max !== Infinity &&
      (value < min || value > max)
    ) {
      if (min === max) {
        return this._error(key, `${errorPrefix} ${min}`);
      } else {
        return this._error(key, `${errorPrefix} between ${min} and ${max}`);
      }
    } else if (min === 0 && value < min) {
      return this._error(key, `${errorPrefix} positive`);
    } else if (min !== undefined && min !== -Infinity && value < min) {
      return this._error(key, `${errorPrefix} at least ${min}`);
    } else if (max !== undefined && max !== Infinity && value > max)  {
      return this._error(key, `${errorPrefix} at most ${max}`);
    }
  }

  /**
   * Check if 'value' is a positive integer (excluding: NaN, Infinity).
   *
   * @param {string} key value key
   * @param {*} value tested value
   */
  public posInt(key: string, value: unknown): E | void {
    return this.integer(key, value, 0);
  }

  /**
   * Check if `value` is an array of integers.
   *
   * @param {string} key
   * @param {*}      value
   * @param {number} [minSize]
   * @param {number} [maxSize]
   * @returns {*} error, if any
   */
  public intArray(key: string, value: unknown, minSize?: number, maxSize?: number): E | void {
    let error;
    if ((error = this.array(key, value, minSize, maxSize))) { return error; }
    for (let i = 0, len = (value as Array<unknown>).length ; i < len ; i++) {
      if ((error = this.integer(key + '[' + i + ']', (value as Array<unknown>)[i]))) { return error; }
    }
  }

  /**
   * Check if `value` is an array of strings.
   *
   * @param {String} key
   * @param {*} value
   * @param {number} [minSize]
   * @param {number} [maxSize]
   * @param {boolean} [nonEmpty=false] check that no string in the array is empty
   * @returns {*} error, if any
   */
  public stringArray(
    key: string, value: unknown, minSize?: number, maxSize?: number, nonEmpty: boolean = false
  ): E | void {
    let error;
    if ((error = this.array(key, value, minSize, maxSize))) { return error; }
    for (let i = 0, len = (value as Array<unknown>).length ; i < len ; i++) {
      if ((error = this.string(key + '[' + i + ']', (value as Array<unknown>)[i], nonEmpty))) { return error; }
    }
  }

  /**
   * Check if 'value' is an integer (excluding: NaN, Infinity).
   *
   * @param {string} key value key
   * @param {*} value tested value
   * @param {number} [minValue=-Infinity] the minimum accepted value
   * @param {number} [maxValue=+Infinity] the maximum accepted value
   * @returns {*} error, if any
   */
  public integer(key: string, value: unknown, minValue: number = -Infinity, maxValue: number = +Infinity): E | void {
    let error;
    if ((error = this.number(key, value, minValue, maxValue))) { return error; }
    if (!Valcheck._isInt(value as number)) {
      return this._error(key, 'must be an integer');
    }
  }

  /**
   * Check if 'value' is a finite number (excluding: NaN, Infinity).
   *
   * @param {string} key value key
   * @param {*} value tested value
   * @param {number} [minValue=-Infinity] Minimum accepted value
   * @param {number} [maxValue=+Infinity] Maximum accepted value
   * @returns {*} error, if any
   */
  public number(key: string, value: unknown, minValue: number = -Infinity, maxValue: number = +Infinity): E | void {
    let error;
    if ((error = this.type(key, value, 'number'))) { return error; }

    // isFinite: checks for NaN, +Infinity and -Infinity
    if (!isFinite(value as number)) {
      return this._error(key, 'must be a finite number');
    }
    if ((error = this._checkInterval(key, value as number, 'must be', minValue, maxValue))) { return error; }
  }

  /**
   * Check if 'value' exists in 'legalValues'
   *
   * @param {string} key value key
   * @param {*} value tested value
   * @param {Array<*>} legalValues accepted values
   * @param {boolean} [showInvalidValue=false] whether to display the invalid value in case of error
   * @returns {*} error, if any
   */
  public values(key: string, value: unknown, legalValues: Array<unknown>, showInvalidValue: boolean = false): E | void {
    if (!Array.isArray(legalValues) || legalValues.length === 0) {
      return this._bug('values must be a non-empty array');
    }
    for (let i = 0; i < legalValues.length; ++i) {
      if (value === legalValues[i]) { return; }
      // check if value is NaN itself
      if (Valcheck._isNaN(value) && Valcheck._isNaN(legalValues[i])) { return; }
    }
    let suffix = '';
    if (showInvalidValue) {
      suffix = ` (was ${JSON.stringify(value)})`;
    }
    return this._error(key, legalValues.length > 1
      ? `must be one of: ${Valcheck._array2string(legalValues)}${suffix}`
      : `must be ${Valcheck._array2string(legalValues)}${suffix}`
    );
  }

  /**
   * @param {Array<*>} list
   * @returns {string}
   * @private
   */
  private static _array2string(list: Array<unknown>): string {
    return list.map(v => v === undefined ? 'undefined' : JSON.stringify(v)).join(', ');
  }

  /**
   * Check if all keys in `object` are in `acceptedKeys`
   *
   * @param {string} key object key.
   * @param {object} object object to check.
   * @param {string[]} [acceptedKeys] array of properties keys that are authorized on `object`.
   * @param {string[]|boolean} [mandatoryKeys] Array of property keys that are mandatory on `object` (or `true` if all accepted keys are mandatory).
   * @param {string[]} [forbiddenKeys] Array of property keys that are forbidden on `object`.
   * @returns {*} error, if any
   */
  public objectKeys(
    key: string,
    object: object,
    acceptedKeys?: string[],
    mandatoryKeys?: string[] | boolean,
    forbiddenKeys?: string[]
  ): E | void {
    let error;
    if ((error = this.object(key, object))) { return error; }

    const objectKeys = Object.keys(object);
    if (acceptedKeys) {
      const unauthorized = difference(objectKeys, acceptedKeys);
      if (unauthorized.length > 0) {
        return this._error(key, `has unexpected properties (${Valcheck._array2string(unauthorized)})`);
      }
    }
    if (mandatoryKeys) {
      if (mandatoryKeys === true) {
        mandatoryKeys = acceptedKeys;
      }
      const missing = difference(mandatoryKeys, objectKeys);
      if (missing.length > 0) {
        return this._error(key, `misses mandatory properties (${Valcheck._array2string(missing)})`);
      }
    }
    if (forbiddenKeys) {
      const present = intersection(forbiddenKeys, objectKeys);
      if (present.length > 0) {
        return this._error(key, `has forbidden properties (${Valcheck._array2string(present)})`);
      }
    }
  }

  /**
   * Check if the properties of `value` match their description.
   *
   * @param {string} key Object key.
   * @param {*} value Object to check.
   * @param {object.<string, FieldDefinition>} properties Description of allowed properties.
   * @param {string} [policy="strict"] "strict", "strictExist" or "inclusive".
   * @returns {*} error, if any
   */
  public properties(
    key: string, value: object, properties: {[key: string]: FieldDefinition<E>}, policy: FieldPolicy = 'strict'
  ): E | void {
    let error;
    if ((error = this.object(key, value))) { return error; }

    const legalKeys = Object.keys(properties);
    if (policy === undefined) { policy = 'strict'; }

    if (policy === 'strict') {
      const unauthorized = difference(Object.keys(value), legalKeys);
      if (unauthorized.length > 0) {
        return this._error(key, `has unexpected properties (${Valcheck._array2string(unauthorized)})`);
      }
    }

    let definedCount = 0;
    for (let i = 0, l = legalKeys.length, subKey = legalKeys[0]; i < l; subKey = legalKeys[++i]) {
      // @ts-ignore generic object read
      definedCount += Valcheck._notSet(value[subKey]) ? 0 : 1;
      // @ts-ignore generic object read
      if ((error = this.property(`${key}.${subKey}`, value[subKey], properties[subKey], value))) {
        return error;
      }
    }

    if (policy === 'strictExist' && definedCount === 0) {
      return this._error(key,
        `must have at least one of these properties defined (${Valcheck._array2string(legalKeys)})`
      );
    }
  }

  /**
   * @param {string} key
   * @param {*} value
   * @param {FieldDefinition} definition
   * @param {object|array} [parent] Reference of parent object for `requiredUnless` and `requiredIf`.
   * @returns {*} error, if any
   */
  public property(key: string, value: object, definition: FieldDefinition<E>, parent?: object): E | void {
    let error;

    const illegalDefFields = difference(Object.keys(definition), DEFINITION_FIELDS);
    if (illegalDefFields.length) {
      return this._bug(
        '"definition" has unexpected properties: ' + Valcheck._array2string(illegalDefFields)
      );
    }

    if (definition.deprecated !== undefined && value !== null && value !== undefined) {
      return this._error(key, `is deprecated: ${definition.deprecated}`);
    }

    let required = definition.required;

    // make the value required if the property at parent[requiredUnless] is not set
    if (definition.requiredUnless !== undefined) {
      if (!parent) {
        return this._bug('"definition.requiredUnless" required "parent" to be set');
      }
      // @ts-ignore generic object read
      required = Valcheck._notSet(parent[definition.requiredUnless]);
    }

    // make the value required if the property at parent[requiredIf] is set
    if (definition.requiredIf !== undefined) {
      if (!parent) {
        return this._bug('"definition.requiredIf" required "parent" to be set');
      }
      // @ts-ignore generic object read
      required = !Valcheck._notSet(parent[definition.requiredIf]);
    }

    // if "required", check if not null or undefined
    if (required === true) {
      if ((error = this.exist(key, value))) { return error; }
    } else if (Valcheck._notSet(value)) {
      // don't validate non-required missing properties further
      return;
    }

    // if "type" is defined, check if the type matches
    if (definition.type !== undefined) {
      if ((error = this.type(key, value, definition.type))) { return error; }
    }

    // if "check" function exists, run specific check function
    if (definition.check) {
      const t = this.getType(definition.check);

      if (t === 'array' || t === 'string') {
        // @ts-ignore make "check" an array
        if (t === 'string') { definition.check = [definition.check]; }

        // @ts-ignore "check" is an array of [functionName, arguments...] where functionName exists for Check
        const fName = definition.check.length ? definition.check[0] : undefined;
        if (typeof fName !== 'string') {
          return this._bug('"definition.check[0]" must be a function name');
          // @ts-ignore
        } else if (typeof this[fName] !== 'function') {
          return this._bug(`"definition.check[0]" (${fName}) must be a valid Check function name`);
        }
        // @ts-ignore "check" is an array, the first entry is a function name, the rest is parameters
        const args = [key, value].concat(definition.check.slice(1));
        // @ts-ignore calling
        if ((error = this[fName].apply(this, args))) { return error; }
      } else if (t === 'function') {
        // @ts-ignore "check" is a function that takes (key, value) as parameters
        if ((error = definition.check(key, value))) { return error; }
      } else {
        return this._bug('"definition.check" must be an array or a function');
      }
    }

    // if "values" is defined, validate per value
    if (definition.values) {
      // only validate per value, don't check for type or sub-properties
      return this.values(key, value, definition.values);
    }

    // if "properties" is defined, check if propertyValue is an object an validate listed properties
    if (definition.properties) {
      if ((error = this.type(key, value, 'object'))) { return error; }
      // type has been checked already, we can stop here
      return this.properties(key, value, definition.properties, definition.policy);
    }

    // if "anyProperty" is defined, check if propertyValue is an object an validate any properties
    if (definition.anyProperty) {
      if ((error = this.type(key, value, 'object'))) { return error; }
      const keys = Object.keys(value);
      for (let i = 0, l = keys.length, subKey = keys[0]; i < l; subKey = keys[++i]) {
        if (
          // @ts-ignore generic object read
          (error = this.property(`${key}.${subKey}`, value[subKey], definition.anyProperty, value))
        ) {
          return error;
        }
      }
      return;
    }

    // if "arraySize" is set, check if type is array and check for size
    if (definition.arraySize !== undefined) {
      if ((error = this.array(key, value, definition.arraySize, definition.arraySize))) {
        return error;
      }
    }

    // if "property" is defined, check if propertyValue is an array and validate its items
    if (definition.arrayItem) {
      // array items must e defined by default
      if (definition.arrayItem.required === undefined) {
        definition.arrayItem.required = true;
      }

      if ((error = this.type(key, value, 'array'))) { return error; }
      // @ts-ignore using value as an array
      for (let i = 0, l = value.length, item = value[0]; i < l; item = value[++i]) {
        // @ts-ignore using value as an array
        if ((error = this.property(`${key}[${i}]`, value[i], definition.arrayItem, value))) {
          return error;
        }
      }
      // type has been checked already, we can stop here
      // return;
    }
  }

  /**
   * Check if `value` matches the given regular expression.
   *
   * @param {string} key
   * @param {*} value
   * @param {RegExp} regexp
   * @returns {*} error, if any
   */
  public regexp(key: string, value: unknown, regexp: RegExp): E | void {
    let error;
    if ((error = this.string(key, value))) { return error; }
    if (regexp.test(value as string)) { return; }

    return this._error(key, `must match pattern ${regexp.toString()}`);
  }

  /**
   * Check if value is a valid URL
   *
   * @param {string} key
   * @param {*} value
   * @param {string} [scheme]
   * @return {*} error, if any
   */
  public url(key: string, value: unknown, scheme?: string): E | void {
    let err;
    if ((err = this.nonEmpty(key, value))) { return err; }

    let re;
    if (scheme === undefined) {
      re = URL_RE;
    } else if (scheme === 'http') { // allows https
      scheme = 'http(s)';
      re = HTTP_URL_RE;
    } else if (scheme === 'ws') { // allows wss
      scheme = 'ws(s)';
      re = WS_URL_RE;
    } else {
      re = new RegExp(`^${Valcheck._escapeRegExp(scheme)}://([^/\\s]+)(/[^\\s]*)?$`, 'i');
    }

    if (!re.test(value as string)) {
      const sScheme = scheme ? ` (starting with ${scheme}://)` : '';
      return this._error(key, 'must be a valid URL' + sScheme);
    }
  }

  /**
   * Check if value is an http(s) URL.
   *
   * @param {string} key
   * @param {*} value
   * @return {*} error, if any
   */
  public httpUrl(key: string, value: unknown): E | void {
    return this.url(key, value, 'http');
  }

  /**
   * Check if the value is a valid port number
   *
   * @param {string} key
   * @param {*} value
   * @returns {*} error, if any
   */
  public port(key: string, value: unknown): E | void {
    return this.integer(key, value, 11, 65535);
  }

  /**
   * Check if the type of `value` matches allowed `type`.
   *
   * @param {string} key Object key.
   * @param {*} value Object to check.
   * @param {string|string[]} type Allowed type(s) (use "null" type for null values).
   * @returns {*} error, if any
   */
  public type(key: string, value: unknown, type: string | string[]): E | void {
    const valueType: Type = this.getType(value);
    type = this._itemOrList(type, []);
    if (type.length === 0) {
      return this._bug('check.type: type array must have at least one type');
    }
    let found = false;
    for (let i = 0; i < type.length && !found; ++i) {
      found = type[i] === valueType;
      if (found) { break; }
    }
    if (!found) {
      return this._error(key, type.length > 1
        ? `type must be one of: ${Valcheck._array2string(type)}`
        : `must be ${TYPE_ARTICLE[type[0]]}${type[0]}`
      );
    }
  }

  /**
   * Extract the type of `value`.
   * Returns "null" for null, "array" for Arrays and 'NaN' for NaN.
   *
   * @param {*} value
   * @returns {string} "null", "undefined", "array", "object", "number", "NaN", "boolean", "string", "function".
   */
  public getType(value: unknown): Type {
    if (value === null) { return 'null'; }
    if (Array.isArray(value)) { return 'array'; }
    if (value !== value) { return 'NaN'; }
    return (typeof value) as Type;
  }

  /**
   * Convert an (item or list of items) into a (list of items).
   *
   * @param {*|Array<*>|null|undefined} item
   * @param {Array<*>} defaultValue Alternative return value if item is null or undefined.
   * @returns {Array<*>|null|undefined}
   * @private
   */
  public _itemOrList <T>(item: T | T[] | null | undefined, defaultValue: T[]): T[] {
    if (Valcheck._notSet(item) && defaultValue !== undefined) {
      item = defaultValue;
    }
    if (!Array.isArray(item)) {
      return ([item]) as T[];
    }
    return item;
  }

  /**
   * @param {*} v
   * @returns {boolean} true if v is null or undefined
   * @private
   */
  private static _notSet(v: unknown): boolean {
    return v === undefined || v === null;
  }

  /**
   * Fail if `value` is not a boolean.
   *
   * @param {string} key
   * @param {*} value
   * @param {boolean} [optional=false] Whether to tolerate undefined values
   * @param {boolean} [wantedValue] exact required value for `value`.
   * @returns {*} error, if any
   */
  public boolean(key: string, value: unknown, optional: boolean = false, wantedValue?: boolean): E | void {
    let error;
    if ((error = this.type(key, value, optional ? ['boolean', 'undefined'] : 'boolean'))) {
      return error;
    }
    if (wantedValue !== undefined) {
      return this.values(key, value, [wantedValue]);
    }
  }

  /**
   * Fail if more than of property listed in `exclusiveKeys` exists in `object`.
   *
   * @param {string} key object key
   * @param {object} object object to check
   * @param {string[]} exclusiveKeys array of properties that are mutually exclusive
   * @param {boolean} [required=false] whether at least one of the properties must be set
   * @returns {*} error, if any
   */
  public exclusive(key: string, object: object, exclusiveKeys: string[], required: boolean = false): E | void {
    // extract the keys with defined values (null included).
    // @ts-ignore generic object read
    const keys = Object.keys(object).filter((k: string) => (object[k] !== undefined));

    const intersect = intersection(keys, exclusiveKeys);
    if (intersect.length > 1) {
      return this._error(
        key,
        `cannot have these properties set at the same time: ${Valcheck._array2string(intersect)}`
      );
    }
    if (intersect.length === 0 && required) {
      return this._error(
        key,
        `must have one of these properties set: ${Valcheck._array2string(exclusiveKeys)}`
      );
    }
    if (intersect.length === 1 && required) {
      // check that the value is not null (we only filtered out keys of undefined values)
      // @ts-ignore generic object read
      return this.exist(key + '.' + intersect[0], object[intersect[0]]);
    }
  }

  /**
   * Check if the object is a function
   *
   * @param {string} key object key
   * @param {*} value object to check
   * @returns {*} error, if any
   */
  public 'function'(key: string, value: unknown): E | void {
    return this.type(key, value, 'function');
  }

  /**
   * Check if the given file path points to a readable file.
   *
   * @param {string} key
   * @param {*} value A file path
   * @param {string} [rootPath] Will resolve `value` in `rootPath` instead of current working directory.
   * @returns {*} error, if any
   */
  public file(key: string, value: unknown, rootPath?: string): E | void {
    if (fs === undefined || path === undefined) { return this._bug('Can only be used in NodeJS'); }

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
    if (fs === undefined || path === undefined) { return this._bug('Can only be used in NodeJS'); }

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

  /**
   * If value is a Date, check if valid.
   *
   * @param {string} key
   * @param {*} value
   * @param {boolean} [acceptIsoString=false] whether to fail if the value is a date in the ISO-8601 format.
   *
   * @returns {*} error, if any
   */
  public date(key: string, value: unknown, acceptIsoString: boolean): E | void {
    const type = this.getType(value);

    if (type === 'string' && acceptIsoString && new Date(value as string).toISOString() === value) { return; }

    if (!(value instanceof Date) || !isFinite(value.getTime())) {
      return this._error(key, 'must be a valid date');
    }
  }

  /**
   * Escapes a string for sage usage in a regular expression
   *
   * @param {string} str
   * @return {string}
   * @private
   */
  private static _escapeRegExp(str: string): string {
    return str.replace(/[\-\[\]\/{}()*+?.\\^$|]/g, '\\$&');
  }

  private static _isNaN(n: unknown): boolean {
    return n !== n;
  }

  private static _isInt(n: number): boolean {
    return Math.floor(n) === n;
  }
}
