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

import { KristApi } from "../KristApi.js";
import {
  KristApiPaginatedResponseBase, KristApiPaginationOptions,
  KristApiTransactionPaginationOptions, OnPageFn, paginateCollection,
  pickPaginationOptions, pickTransactionPaginationOptions
} from "../../util/apiUtil";
import { KristAddress, KristName, KristTransaction } from "../../types";
import { NamesResponse } from "./names.js";
import { TransactionsResponse } from "./transactions.js";

export interface KristApiAddressResponse {
  address: KristAddress;
}
export type AddressResponse = KristApiAddressResponse;

export interface KristApiAddressesResponse extends KristApiPaginatedResponseBase {
  addresses: KristAddress[];
}
export type AddressesResponse = KristApiAddressesResponse;

// -----------------------------------------------------------------------------
// GET /addresses
// -----------------------------------------------------------------------------
/**
 * Get a list of addresses, sorted by `firstseen` ascending.
 *
 * This method must be manually paginated, see
 * {@link KristApi.paginateAddresses} to do this automatically.
 *
 * @see https://krist.dev/docs/#api-AddressGroup-GetAddresses
 *
 * @param options.limit - The maximum amount of results to return. Must be
 *   between 1 and 1000. Defaults to 50.
 * @param options.offset - The amount to offset the results, useful to paginate
 *   results, and in conjunction with `limit`. Defaults to 0.
 * @returns The list of addresses.
 */
export async function getAddresses(
  this: KristApi,
  options?: KristApiPaginationOptions
): Promise<AddressesResponse> {
  // TODO: Validation
  return await this.get<AddressesResponse>("addresses",
    pickPaginationOptions(options));
}

/**
 * Paginates the list of addresses, sorted by `firstseen` ascending.
 *
 * The callback `onPageFn` will be called for each page of results. The first
 * argument of the callback will be the array of {@link KristAddress} results
 * for that page. The second argument of the callback will be the total number
 * of results for the query. If the callback returns `false`, pagination will
 * stop.
 *
 * @see https://krist.dev/docs/#api-AddressGroup-GetAddresses
 *
 * @param initialOptions.limit - The maximum amount of results to return per
 *   page. Must be between 1 and 1000. Defaults to 50.
 * @param initialOptions.offset - The amount to offset the results from the
 *   beginning. Defaults to 0.
 * @param onPageFn - Callback called for each page of results.
 * @returns The total number of results for the query.
 */
export function paginateAddresses(
  this: KristApi,
  initialOptions?: KristApiPaginationOptions,
  onPageFn?: OnPageFn<KristAddress>
): Promise<number> {
  return paginateCollection<KristAddress, AddressesResponse>(
    p => this.getAddresses(p), "addresses", initialOptions, onPageFn
  );
}

// -----------------------------------------------------------------------------
// GET /addresses/rich
// -----------------------------------------------------------------------------
/**
 * Get a list of the richest addresses, sorted by `balance` descending.
 *
 * This method must be manually paginated, see
 * {@link KristApi.paginateRichAddresses} to do this automatically.
 *
 * @see https://krist.dev/docs/#api-AddressGroup-GetRichAddresses
 *
 * @param options.limit - The maximum amount of results to return. Must be
 *   between 1 and 1000. Defaults to 50.
 * @param options.offset - The amount to offset the results, useful to paginate
 *   results, and in conjunction with `limit`. Defaults to 0.
 * @returns The list of addresses.
 */
export async function getRichAddresses(
  this: KristApi,
  options?: KristApiPaginationOptions
): Promise<AddressesResponse> {
  // TODO: Validation
  return await this.get<AddressesResponse>("addresses/rich",
    pickPaginationOptions(options));
}

/**
 * Paginates the list of the richest addresses, sorted by `balance` descending.
 * The callback `onPageFn` will be called for each page of results.
 *
 * The first argument of the callback will be the array of {@link KristAddress}
 * results for that page. The second argument of the callback will be the total
 * number of results for the query. If the callback returns `false`, pagination
 * will stop.
 *
 * @see https://krist.dev/docs/#api-AddressGroup-GetRichAddresses
 *
 * @param initialOptions.limit - The maximum amount of results to return per
 *   page. Must be between 1 and 1000. Defaults to 50.
 * @param initialOptions.offset - The amount to offset the results from the
 *   beginning. Defaults to 0.
 * @param onPageFn - Callback called for each page of results.
 * @returns The total number of results for the query.
 */
export async function paginateRichAddresses(
  this: KristApi,
  initialOptions?: KristApiPaginationOptions,
  onPageFn?: OnPageFn<KristAddress>
): Promise<number> {
  return paginateCollection<KristAddress, AddressesResponse>(
    p => this.getRichAddresses(p), "addresses", initialOptions, onPageFn
  );
}

// -----------------------------------------------------------------------------
// GET /addresses/:address
// -----------------------------------------------------------------------------
/**
 * Gets a single address.
 *
 * @see https://krist.dev/docs/#api-AddressGroup-GetAddress
 *
 * @param address - The address to get.
 * @param fetchNames - When `true`, fetch the count of names owned by the
 *   address. The {@link KristAddress | `address`} object returned will have the
 *   `names` count field available.
 * @returns The address.
 */
export async function getAddress(
  this: KristApi,
  address: string,
  fetchNames = false
): Promise<KristAddress> {
  // TODO: Validation
  return (await this.get<AddressResponse>(
    "addresses/" + encodeURIComponent(address),
    (fetchNames ? { fetchNames: true } : undefined)
  )).address;
}

// -----------------------------------------------------------------------------
// GET /addresses/:address/names
// -----------------------------------------------------------------------------
/**
 * Gets a list of names owned by the address, sorted by `name` ascending.
 *
 * This method must be manually paginated, see
 * {@link KristApi.paginateAddressNames} to do this automatically.
 *
 * @see https://krist.dev/docs/#api-AddressGroup-GetAddressNames
 *
 * @param address - The address to get names for.
 * @param options.limit - The maximum amount of results to return. Must be
 *   between 1 and 1000. Defaults to 50.
 * @param options.offset - The amount to offset the results, useful to paginate
 *   results, and in conjunction with `limit`. Defaults to 0.
 * @returns The list of names.
 */
export async function getAddressNames(
  this: KristApi,
  address: string,
  options?: KristApiPaginationOptions
): Promise<NamesResponse> {
  // TODO: Validation
  return await this.get<NamesResponse>(
    "addresses/" + encodeURIComponent(address) + "/names",
    pickPaginationOptions(options)
  );
}

/**
 * Paginates the list of names owned by an address, sorted by `name` ascending.
 * The callback `onPageFn` will be called for each page of results.
 *
 * The first argument of the callback will be the array of {@link KristName}
 * results for that page. The second argument of the callback will be the total
 * number of results for the query. If the callback returns `false`, pagination
 * will stop.
 *
 * @see https://krist.dev/docs/#api-AddressGroup-GetAddressNames
 *
 * @param address - The address to get names for.
 * @param initialOptions.limit - The maximum amount of results to return per
 *   page. Must be between 1 and 1000. Defaults to 50.
 * @param initialOptions.offset - The amount to offset the results from the
 *   beginning. Defaults to 0.
 * @param onPageFn - Callback called for each page of results.
 * @returns The total number of results for the query.
 */
export async function paginateAddressNames(
  this: KristApi,
  address: string,
  initialOptions?: KristApiPaginationOptions,
  onPageFn?: OnPageFn<KristName>
): Promise<number> {
  return paginateCollection<KristName, NamesResponse>(
    p => this.getAddressNames(address, p), "names", initialOptions, onPageFn
  );
}

// -----------------------------------------------------------------------------
// GET /addresses/:address/transactions
// -----------------------------------------------------------------------------
/**
 * Get a list of recent transactions involving an address, sorted by `id`
 * descending.
 *
 * This method must be manually paginated, see
 * {@link KristApi.paginateAddressTransactions} to do this automatically.
 *
 * @see https://krist.dev/docs/#api-AddressGroup-GetAddressTransactions
 *
 * @param options.limit - The maximum amount of results to return. Must be
 *   between 1 and 1000. Defaults to 50.
 * @param options.offset - The amount to offset the results, useful to paginate
 *   results, and in conjunction with `limit`. Defaults to 0.
 * @returns The list of addresses.
 */
export async function getAddressTransactions(
  this: KristApi,
  address: string,
  options?: KristApiTransactionPaginationOptions
): Promise<TransactionsResponse> {
  // TODO: Validation
  return await this.get<TransactionsResponse>(
    "addresses/" + encodeURIComponent(address) + "/transactions",
    pickTransactionPaginationOptions(options)
  );
}

/**
 * Paginates the list of recent transactions involving an address, sorted by
 * `id` descending.
 *
 * The callback `onPageFn` will be called for each page of results. The first
 * argument of the callback will be the array of {@link KristTransaction}
 * results for that page. The second argument of the callback will be the total
 * number of results for the query. If the callback returns `false`, pagination
 * will stop.
 *
 * @see https://krist.dev/docs/#api-AddressGroup-GetAddressTransactions
 *
 * @param address - The address to get recent transactions for.
 * @param initialOptions.limit - The maximum amount of results to return per
 *   page. Must be between 1 and 1000. Defaults to 50.
 * @param initialOptions.offset - The amount to offset the results from the
 *   beginning. Defaults to 0.
 * @param onPageFn - Callback called for each page of results.
 * @returns The total number of results for the query.
 */
export async function paginateAddressTransactions(
  this: KristApi,
  address: string,
  initialOptions?: KristApiPaginationOptions,
  onPageFn?: OnPageFn<KristTransaction>
): Promise<number> {
  return paginateCollection<KristTransaction, TransactionsResponse>(
    p => this.getAddressTransactions(address, p), "transactions",
    initialOptions, onPageFn
  );
}
