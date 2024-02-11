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

import { isObject } from "./internalUtil";

export class ArgumentError extends Error {
  constructor(message: string, public argument: string) {
    super(message);
  }
}

// =============================================================================
// String
// =============================================================================
export function argString(val: any, name: string): val is string {
  if (typeof val !== "string") {
    throw new ArgumentError(`Expected \`${name}\` to be type \`string\`, got \`${typeof val}\``, name);
  }
  return true;
}

export function argStringNonEmpty(val: any, name: string): val is string {
  argString(val, name);
  if (!val.length) {
    throw new ArgumentError(`Expected \`${name}\` to be non-empty string`, name);
  }
  return true;
}

export function argStringMinLength(val: any, name: string, len: number): val is string {
  argString(val, name);
  if (val.length < len) {
    throw new ArgumentError(`Expected \`${name}\` to have minimum length of ${len}`, name);
  }
  return true;
}

export function argStringMaxLength(val: any, name: string, len: number): val is string {
  argString(val, name);
  if (val.length > len) {
    throw new ArgumentError(`Expected \`${name}\` to have maximum length of ${len}`, name);
  }
  return true;
}

export function argStringLength(val: any, name: string, len: number): val is string {
  argString(val, name);
  if (val.length !== len) {
    throw new ArgumentError(`Expected \`${name}\` to have length of ${len}`, name);
  }
  return true;
}

// =============================================================================
// Number
// =============================================================================
export function argNumber(val: any, name: string): val is number {
  if (typeof val !== "number") {
    throw new ArgumentError(`Expected \`${name}\` to be type \`number\`, got \`${typeof val}\``, name);
  }
  return true;
}

// =============================================================================
// Function
// =============================================================================
// eslint-disable-next-line @typescript-eslint/ban-types
export function argFunction(val: any, name: string): val is Function {
  if (typeof val !== "function") {
    throw new ArgumentError(`Expected \`${name}\` to be type \`function\`, got \`${typeof val}\``, name);
  }
  return true;
}


// =============================================================================
// Object
// =============================================================================
export function argObject(val: any, name: string): val is object {
  if (!isObject(val)) {
    throw new ArgumentError(`Expected \`${name}\` to be type \`object\`, got \`${typeof val}\``, name);
  }
  return true;
}

// =============================================================================
// One of values
// =============================================================================
export function argOneOf<T>(val: any, name: string, values: T[]): val is T {
  if (!values.includes(val)) {
    throw new ArgumentError(`Expected \`${name}\` to be one of [${values.join(", ")}], got \`${val}\``, name);
  }
  return true;
}
