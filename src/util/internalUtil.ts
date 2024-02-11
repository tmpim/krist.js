/*
 * Copyright 2022 - 2024 Drew Edwards, tmpim
 *
 * This file is part of Krist.js.
 *
 * Krist.js is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Krist.js is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Krist.js. If not, see <http://www.gnu.org/licenses/>.
 *
 * For more project information, see <https://github.com/tmpim/Krist.js>.
 */

/* eslint-disable eqeqeq */

import { Sha256Fn } from "./internalCrypto.js";
import { applyWalletFormat, KristWalletFormatName } from "./walletFormats.js";

export function lut<T extends number | string>(data: T[]): Record<T, true> {
  const out: any = {};
  for (const v of data) out[v] = true;
  return out;
}

/** @group Advanced */
export interface KristAuthOptionsPrivatekey {
  /**
   * Instead of a password, the raw private key to use for authenticating the
   * address. No wallet format will be applied. If a private key or password are
   * not supplied, the request will error.
   *
   * @group Advanced
   */
  privatekey?: string;
}

export interface KristAuthOptionsPassword {
  /**
   * The password to use for authenticating the address. If a password or
   * private key are not supplied, the request will error.
   */
  password?: string;
  /**
   * The username to use for authenticating the address, if the wallet format
   * requires a username.
   */
  username?: string;
  /**
   * The wallet format to use if a password was supplied. Defaults to
   * `kristwallet`.
   */
  walletFormat?: KristWalletFormatName;
  /**
   * The SHA-256 function to use. Defaults to a pure JS implementation. You do
   * not normally need to supply this.
   *
   * @group Advanced
   */
  sha256Fn?: Sha256Fn;
}

export type KristAuthOptions = KristAuthOptionsPassword | KristAuthOptionsPrivatekey;

/** @internal */
export async function calculateAddressFromOptions(
  options?: KristAuthOptions | undefined
): Promise<string | undefined> {
  if (!options) return undefined;

  const pwOpts = options as KristAuthOptionsPassword;
  const pkeyOpts = options as KristAuthOptionsPrivatekey;
  if (pwOpts.password) {
    return await applyWalletFormat(pwOpts.walletFormat, pwOpts.password,
      pwOpts.username, pwOpts.sha256Fn);
  } else if (pkeyOpts.privatekey) {
    return pkeyOpts.privatekey;
  }

  return undefined;
}

// https://github.com/lodash/lodash/blob/master/isNil.js
export const isNil = (value: any): boolean => value == null;

// https://github.com/lodash/lodash/blob/master/isObject.js
export function isObject(value: any): boolean {
  const type = typeof value;
  return value !== null && (type === "object" || type === "function");
}

// https://github.com/lodash/lodash/blob/master/.internal/getTag.js
function getTag(value: any): string {
  if (value == null) {
    return value === undefined ? "[object Undefined]" : "[object Null]";
  }
  return Object.prototype.toString.call(value);
}

// https://github.com/lodash/lodash/blob/master/isSymbol.js
export function isSymbol(value: any): boolean {
  const type = typeof value;
  return value !== null && (type === "object" && value != null && getTag(value) == "[object Symbol]");
}

// https://github.com/lodash/lodash/blob/master/toString.js
const INFINITY = 1 / 0;
export function toString(value: any): string {
  if (value == null) return "";
  // Exit early for strings to avoid a performance hit in some environments.
  if (typeof value === "string") return value;
  if (Array.isArray(value)) {
    // Recursively convert values (susceptible to call stack limits).
    return `${value.map((other) => other == null ? other : toString(other))}`;
  }
  if (isSymbol(value)) return value.toString();
  const result = `${value}`;
  return (result == "0" && (1 / value) == -INFINITY) ? "-0" : result;
}

// https://github.com/lodash/lodash/blob/master/memoize.js
export function memoize<T extends (...args: any) => any>(fn: T): T {
  if (typeof fn !== "function") throw new TypeError("Expected a function");
  const memoized = function(this: any, ...args: any[]) {
    const key = args[0];
    const cache = memoized.cache;

    if (cache.has(key)) {
      return cache.get(key);
    }
    const result = fn.apply(this, args);
    memoized.cache = cache.set(key, result) || cache;
    return result;
  };
  memoized.cache = new (memoize.Cache || Map);
  return memoized as any;
}
memoize.Cache = Map;

// https://github.com/lodash/lodash/blob/master/escapeRegExp.js
// http://ecma-international.org/ecma-262/7.0/#sec-patterns
const reRegExpChar = /[\\^$.*+?()[\]{}|]/g;
const reHasRegExpChar = RegExp(reRegExpChar.source);
export function escapeRegExp(str: string): string {
  return (str && reHasRegExpChar.test(str))
    ? str.replace(reRegExpChar, "\\$&")
    : (str || "");
}

