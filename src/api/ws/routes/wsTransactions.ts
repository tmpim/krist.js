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

import { KristTransaction, KristWsC2SMakeTransaction, KristWsS2CMakeTransaction } from "../../../types/index.js";
import { calculateAddressFromOptions, KristAuthOptions } from "../../../util/internalUtil.js";
import { KristWsClient } from "../KristWsClient.js";

export type KristWsMakeTransactionOptions = KristAuthOptions & {
  /** Optional metadata to include in the transaction. */
  metadata?: string;

  /** Optional Request ID to use for this transaction. Must be a valid UUIDv4 if provided. */
  requestId?: string;
};

/**
 * Sends a transaction to the given address.
 *
 * @see KristApi.makeTransaction
 * @see https://krist.dev/docs/#api-WebsocketGroup-WSMakeTransaction
 *
 * @param to - The address to send the transaction to. May be a Krist address or
 *   a name.
 * @param amount - The amount to send.
 * @param options - The {@link KristApiMakeTransactionOptions} options for the
 *   request. If a password or private key are not supplied, the request will
 *   error.
 * @param options.password - The password to use for authenticating the address.
 * @param options.username - The username to use for authenticating the address,
 *   if the wallet format requires a username.
 * @param options.walletFormat - The wallet format to use if a password was
 *   supplied. Defaults to `kristwallet`.
 * @param options.sha256Fn - The SHA-256 function to use. Defaults to a pure JS
 *   implementation. You do not normally need to supply this.
 * @param options.privatekey - Instead of a password, the raw private key to use
 *   for authenticating the address. No wallet format will be applied. If a
 *   private key or password are not supplied, the request will error.
 * @param options.metadata - Optional metadata to include in the transaction.
 * @returns The {@link KristTransaction} that was made.
 */
export async function makeTransaction(
  this: KristWsClient,
  to: string,
  amount: number,
  options?: KristWsMakeTransactionOptions
): Promise<KristTransaction> {
  const privatekey = this.privatekey
    ?? await calculateAddressFromOptions(options);

  // TODO: Proper error here
  if (!privatekey) throw new Error("No privatekey provided");

  return (await this.sendAndWait<KristWsS2CMakeTransaction, KristWsC2SMakeTransaction>({
    type: "make_transaction",
    privatekey,
    to,
    amount,
    metadata: options?.metadata,
    requestId: options?.requestId
  })).transaction;
}
