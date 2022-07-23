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

import { KristTransaction } from "../../types";
import {
  KristApiPaginatedResponseBase, KristApiTransactionPaginationOptions, OnPageFn,
  paginateCollection, pickTransactionPaginationOptions
} from "../../util/apiUtil";
import { calculateAddressFromOptions, KristAuthOptions } from "../../util/internalUtil";
import { KristApi } from "../KristApi";

export interface KristApiTransactionResponse {
  transaction: KristTransaction;
}
export type TransactionResponse = KristApiTransactionResponse;

export interface KristApiTransactionsResponse extends KristApiPaginatedResponseBase {
  transactions: KristTransaction[];
}
export type TransactionsResponse = KristApiTransactionsResponse;

// -----------------------------------------------------------------------------
// GET /transactions
// -----------------------------------------------------------------------------
/**
 * Get a list of transactions, sorted by `id` ascending.
 *
 * This method must be manually paginated, see
 * {@link KristApi.paginateTransactions} to do this automatically.
 *
 * @see https://krist.dev/docs/#api-TransactionGroup-GetTransactions
 *
 * @param options.excludeMined - If true, transactions from mining will be
 *   excluded.
 * @param options.limit - The maximum amount of results to return. Must be
 *   between 1 and 1000. Defaults to 50.
 * @param options.offset - The amount to offset the results, useful to paginate
 *   results, and in conjunction with `limit`. Defaults to 0.
 * @returns The list of transactions.
 */
export async function getTransactions(
  this: KristApi,
  options?: KristApiTransactionPaginationOptions
): Promise<TransactionsResponse> {
  // TODO: Validation
  return await this.get<TransactionsResponse>("transactions",
    pickTransactionPaginationOptions(options));
}

/**
 * Paginates the list of transactions, sorted by `id` ascending.
 *
 * The callback `onPageFn` will be called for each page of results. The first
 * argument of the callback will be the array of {@link KristTransaction}
 * results for that page. The second argument of the callback will be the total
 * number of results for the query. If the callback returns `false`, pagination
 * will stop.
 *
 * @see https://krist.dev/docs/#api-TransactionGroup-GetTransactions
 *
 * @param initialOptions.excludeMined - If true, transactions from mining will
 *   be excluded.
 * @param initialOptions.limit - The maximum amount of results to return per
 *   page. Must be between 1 and 1000. Defaults to 50.
 * @param initialOptions.offset - The amount to offset the results from the
 *   beginning. Defaults to 0.
 * @param onPageFn - Callback called for each page of results.
 * @returns The total number of results for the query.
 */
export async function paginateTransactions(
  this: KristApi,
  initialOptions?: KristApiTransactionPaginationOptions,
  onPageFn?: OnPageFn<KristTransaction>
): Promise<number> {
  const { excludeMined } = pickTransactionPaginationOptions(initialOptions);
  return paginateCollection<KristTransaction, TransactionsResponse>(
    p => this.getTransactions({ ...p, excludeMined }),
    "transactions", initialOptions, onPageFn
  );
}

// -----------------------------------------------------------------------------
// GET /transactions/latest
// -----------------------------------------------------------------------------
/**
 * Get a list of transactions, sorted by `id` descending.
 *
 * This method must be manually paginated, see
 * {@link KristApi.paginateLatestTransactions} to do this automatically.
 *
 * @see https://krist.dev/docs/#api-TransactionGroup-GetLatestTransactions
 *
 * @param options.excludeMined - If true, transactions from mining will be
 *   excluded.
 * @param options.limit - The maximum amount of results to return. Must be
 *   between 1 and 1000. Defaults to 50.
 * @param options.offset - The amount to offset the results, useful to paginate
 *   results, and in conjunction with `limit`. Defaults to 0.
 * @returns The list of transactions.
 */
export async function getLatestTransactions(
  this: KristApi,
  options?: KristApiTransactionPaginationOptions
): Promise<TransactionsResponse> {
  // TODO: Validation
  return await this.get<TransactionsResponse>("transactions/latest",
    pickTransactionPaginationOptions(options));
}

/**
 * Paginates the list of transactions, sorted by `id` descending.
 *
 * The callback `onPageFn` will be called for each page of results. The first
 * argument of the callback will be the array of {@link KristTransaction}
 * results for that page. The second argument of the callback will be the total
 * number of results for the query. If the callback returns `false`, pagination
 * will stop.
 *
 * @see https://krist.dev/docs/#api-TransactionGroup-GetLatestTransactions
 *
 * @param initialOptions.excludeMined - If true, transactions from mining will
 *   be excluded.
 * @param initialOptions.limit - The maximum amount of results to return per
 *   page. Must be between 1 and 1000. Defaults to 50.
 * @param initialOptions.offset - The amount to offset the results from the
 *   beginning. Defaults to 0.
 * @param onPageFn - Callback called for each page of results.
 * @returns The total number of results for the query.
 */
export async function paginateLatestTransactions(
  this: KristApi,
  initialOptions?: KristApiTransactionPaginationOptions,
  onPageFn?: OnPageFn<KristTransaction>
): Promise<number> {
  const { excludeMined } = pickTransactionPaginationOptions(initialOptions);
  return paginateCollection<KristTransaction, TransactionsResponse>(
    p => this.getLatestTransactions({ ...p, excludeMined }),
    "transactions", initialOptions, onPageFn
  );
}

// -----------------------------------------------------------------------------
// GET /transactions/:id
// -----------------------------------------------------------------------------
/**
 * Gets a single transaction by its ID.
 *
 * @see https://krist.dev/docs/#api-TransactionGroup-GetTransaction
 *
 * @param id - The ID of the transaction to get.
 * @returns The transaction.
 */
export async function getTransaction(
  this: KristApi,
  id: number
): Promise<KristTransaction> {
  // TODO: Validation
  return (await this.get<TransactionResponse>(
    "transactions/" + encodeURIComponent(id)
  )).transaction;
}

// -----------------------------------------------------------------------------
// POST /transactions
// -----------------------------------------------------------------------------
export type KristApiMakeTransactionOptions = KristAuthOptions & {
  /** Optional metadata to include in the transaction. */
  metadata?: string;
};

/**
 * Sends a transaction to the given address.
 *
 * @see https://krist.dev/docs/#api-TransactionGroup-MakeTransaction
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
  this: KristApi,
  to: string,
  amount: number,
  options?: KristApiMakeTransactionOptions
): Promise<KristTransaction> {
  // TODO: Validation
  const privatekey = await calculateAddressFromOptions(options);
  // TODO: Better error
  if (!privatekey) throw new Error("No private key provided");

  return (await this.post<TransactionResponse>("transactions", {
    privatekey,
    to,
    amount,
    metadata: options?.metadata
  })).transaction;
}
