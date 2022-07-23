/*
 * Copyright 2022 - 2022 Drew Edwards, tmpim
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

import { isNil } from "./internalUtil";
import { argOneOf, argStringNonEmpty, argFunction } from "./argValidation";
import { sha256, Sha256Fn } from "./internalCrypto";

// import ow from "ow";

export interface KristWalletFormat {
  (sha256Fn: Sha256Fn, password: string, username?: string): Promise<string>;
}

export type KristWalletFormatName = "kristwallet"
  | "kristwallet_username_appendhashes" | "kristwallet_username"
  | "jwalelset" | "api";

export const KRIST_WALLET_FORMATS: Record<KristWalletFormatName, KristWalletFormat> = {
  "kristwallet": async (sha256Fn = sha256, password) =>
    await sha256Fn("KRISTWALLET" + password) + "-000",

  "kristwallet_username_appendhashes": async (sha256Fn = sha256, password, username) =>
    await sha256Fn(
      "KRISTWALLETEXTENSION"
      + await sha256Fn(
        await sha256Fn(username || "")
        + "^"
        + await sha256Fn(password)
      )
    ) + "-000",

  "kristwallet_username": async (sha256Fn = sha256, password, username) =>
    await sha256Fn(
      await sha256Fn(username || "")
      + "^"
      + await sha256Fn(password)
    ),

  "jwalelset": async (sha256Fn = sha256, password) =>
    await sha256Fn(await sha256Fn(await sha256Fn(await sha256Fn(
      await sha256Fn(await sha256Fn(await sha256Fn(await sha256Fn(
        await sha256Fn(await sha256Fn(await sha256Fn(await sha256Fn(
          await sha256Fn(await sha256Fn(await sha256Fn(await sha256Fn(
            await sha256Fn(await sha256Fn(password)))))))))))))))))),

  "api": async (_, password) => password
};

export const KRIST_WALLET_FORMAT_NAMES: KristWalletFormatName[] = [
  "kristwallet", "api", "kristwallet_username_appendhashes",
  "kristwallet_username", "jwalelset"
];

export const KRIST_WALLET_ADVANCED_FORMATS: KristWalletFormatName[] = [
  "kristwallet_username_appendhashes", "kristwallet_username", "jwalelset"
];

/**
 * Applies a wallet format to a password, converting it to a private key. This
 * is commonly done before passing it to <code>makeV2Address</code>. You most
 * likely want to just use {@link calculateAddress} instead.
 *
 * @see {@link calculateAddress} to convert a password to a Krist address.
 *
 * @param format - The wallet format to apply to this private key
 * @param password - The password to convert to a private key
 * @param username - The username to use when generating the private key if the
 *   format requires it (e.g. <code>kristwallet_username_appendhashes</code>
 *   and <code>kristwallet_username</code>)
 * @param sha256 - The SHA-256 function to use. Defaults to a pure JS
 *   implementation. You do not normally need to supply this.
 *
 * @returns The generated private key
 *
 * @internal
 */
export async function applyWalletFormat(
  format: KristWalletFormatName | null | undefined = "kristwallet",
  password: string,
  username?: string,
  sha256Fn: Sha256Fn = sha256
): Promise<string> {
  if (!format) format = "kristwallet";
  argOneOf(format, "format", KRIST_WALLET_FORMAT_NAMES);
  argStringNonEmpty(password, "password");
  if (!isNil(username)) argStringNonEmpty(username, "username");
  argFunction(sha256Fn, "sha256Fn");
  return KRIST_WALLET_FORMATS[format](sha256Fn, password, username);
}

/**
 * Returns whether the given wallet format requires a username.
 *
 * @param format - The format to check
 * @returns Whether the format requires a username
 */
export function formatNeedsUsername(format: KristWalletFormatName): boolean {
  argOneOf(format, "format", KRIST_WALLET_FORMAT_NAMES);
  return KRIST_WALLET_FORMATS[format].length === 3;
}
