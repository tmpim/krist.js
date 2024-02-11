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

import { Sha256 } from "@aws-crypto/sha256-js";

export const toHex = (input: ArrayBufferLike | Uint8Array): string =>
  [...(input instanceof Uint8Array ? input : new Uint8Array(input))]
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");

/**
 * Utility function to return the hexadecimal SHA-256 digest of an input string.
 *
 * @param input - The input string to hash.
 * @returns The hexadecimal SHA-256 digest of <code>input</code>.
 */
export const sha256: Sha256Fn = async (input: string): Promise<string> => {
  // Note that this is not actually an asynchronous operation currently (due to
  // difficulties shimming between browser and Node environments), but the API
  // is implemented as a Promise for future extensibility.
  const hash = new Sha256();
  hash.update(input);
  return toHex(await hash.digest());
};
export type Sha256Fn = (input: string) => Promise<string>;

/**
 * Utility function to return the double hexadecimal SHA-256 digest of an input
 * string.
 *
 * This is equivalent to <code>sha256(sha256(input))</code>.
 *
 * @param input - The input string to hash.
 * @param sha256Fn - The SHA-256 function to use. Defaults to a pure JS
 *   implementation. You do not normally need to supply this.
 * @returns The double hexadecimal SHA-256 digest of <code>input</code>.
 */
export async function doubleSha256(
  input: string,
  sha256Fn: Sha256Fn = sha256
): Promise<string> {
  return await sha256Fn(await sha256Fn(input));
}
