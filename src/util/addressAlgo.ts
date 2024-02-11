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

import { isNil } from "./internalUtil.js";
import { argFunction, argOneOf, argStringNonEmpty } from "./argValidation.js";
import { doubleSha256, sha256, Sha256Fn } from "./internalCrypto.js";
import {
  applyWalletFormat, KristWalletFormatName, KRIST_WALLET_FORMAT_NAMES
} from "./walletFormats";

/**
 * Generates a Krist address from a password. This will also apply the given
 * wallet format to the password to convert it to a private key, before passing
 * it to the address algorithm.
 *
 * @param password - The password to calculate the address for.
 * @param username - The username to calculate the address for, if the wallet
 *   format requires one. This is usually not required.
 * @param walletFormat - The wallet format to apply to the password to convert
 *   it into a private key, defaults to `"kristwallet"`.
 * @param addressPrefix - The address prefix to use, defaults to `"k"`.
 * @param sha256Fn - The SHA-256 function to use. Defaults to a pure JS
 *   implementation. You do not normally need to supply this.
 *
 * @returns A tuple containing the generated address and the private key with
 *   the wallet format applied.
 *
 * @example
 * Get just the address:
 * ```
 * const [address] = await calculateAddress("myPassword");
 * ```
 *
 * @example
 * Get both the address and the private key:
 * ```
 * const [address, privatekey] = await calculateAddress("myPassword");
 * ```
 *
 * @example
 * Get an address, using a different wallet format:
 * ```
 * // The "api" format is just the raw password with no additional security
 * const [address] = await calculateAddress("myPassword", undefined, "api");
 * ```
 */
export async function calculateAddress(
  password: string,
  username?: string,
  walletFormat: KristWalletFormatName = "kristwallet",
  addressPrefix = "k",
  sha256Fn: Sha256Fn = sha256
): Promise<[string, string]> {
  argStringNonEmpty(password, "password");
  if (!isNil(username)) argStringNonEmpty(username, "username");
  argOneOf(walletFormat, "walletFormat", KRIST_WALLET_FORMAT_NAMES);
  argStringNonEmpty(addressPrefix, "addressPrefix");
  argFunction(sha256Fn, "sha256Fn");

  const privatekey = await applyWalletFormat(walletFormat, password, username,
    sha256Fn);
  const address = await makeV2Address(privatekey, addressPrefix, sha256Fn);

  return [address, privatekey];
}

const hexToBase36 = (input: number): string => {
  const byte = 48 + Math.floor(input / 7);
  return String.fromCharCode(byte + 39 > 122 ? 101 : byte > 57 ? byte + 39 : byte);
};

/**
 * Generates a Krist address from a private key. Typically, you will convert
 * a password to a private key first by applying a wallet format. You most
 * likely want to just use {@link calculateAddress} instead.
 *
 * @see {@link calculateAddress} to convert a password to a Krist address.
 *
 * @param key - The private key to generate the address from.
 * @param addressPrefix - The address prefix to use, defaults to `"k"`.
 * @param sha256Fn - The SHA-256 function to use. Defaults to a pure JS
 *   implementation. You do not normally need to supply this.
 *
 * @returns The generated address
 *
 * @internal
 */
export async function makeV2Address(
  key: string,
  addressPrefix = "k",
  sha256Fn: Sha256Fn = sha256
): Promise<string> {
  argStringNonEmpty(key, "key");
  argStringNonEmpty(addressPrefix, "addressPrefix");
  argFunction(sha256Fn, "sha256Fn");

  const chars = ["", "", "", "", "", "", "", "", ""];
  let chain = addressPrefix;
  let hash = await doubleSha256(key, sha256Fn);

  for (let i = 0; i <= 8; i++) {
    chars[i] = hash.substring(0, 2);
    hash = await doubleSha256(hash, sha256Fn);
  }

  for (let i = 0; i <= 8;) {
    const index = parseInt(hash.substring(2 * i, 2 + (2 * i)), 16) % 9;

    if (chars[index] === "") {
      hash = await sha256Fn(hash);
    } else {
      chain += hexToBase36(parseInt(chars[index], 16));
      chars[index] = "";
      i++;
    }
  }

  return chain;
}
