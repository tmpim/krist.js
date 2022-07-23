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

import { KristApi } from "..";
import { KristName } from "../../types";
import {
  KristApiPaginatedResponseBase, KristApiPaginationOptions, OnPageFn,
  paginateCollection, pickPaginationOptions
} from "../../util/apiUtil";
import { calculateAddressFromOptions, KristAuthOptions } from "../../util/internalUtil";

export interface KristApiNameResponse {
  name: KristName;
}
export type NameResponse = KristApiNameResponse;

export interface KristApiNamesResponse extends KristApiPaginatedResponseBase {
  names: KristName[];
}
export type NamesResponse = KristApiNamesResponse;

// -----------------------------------------------------------------------------
// GET /names/check/:name
// -----------------------------------------------------------------------------
/**
 * Checks whether a name is available to be purchased.
 *
 * @see https://krist.dev/docs/#api-NameGroup-CheckName
 *
 * @param name - The name to check the availability of, without the `.kst`
 *   suffix.
 * @returns Whether the name is available.
 */
export async function checkNameAvailability(
  this: KristApi,
  name: string
): Promise<boolean> {
  // TODO: Validation
  return (await this.get<{ available: boolean }>(
    "names/check/" + encodeURIComponent(name)
  )).available;
}

// -----------------------------------------------------------------------------
// GET /names/cost
// -----------------------------------------------------------------------------
/**
 * @deprecated Use {@link KristApi.motd} to get API/currency constants
 * instead.
*/
export async function getNameCost(
  this: KristApi
): Promise<number> {
  // TODO: Validation
  // TODO: Comment that this should probably not be used, OR cache the results
  return (await this.get<{ name_cost: number }>("names/cost")).name_cost;
}

// -----------------------------------------------------------------------------
// GET /names/bonus
// -----------------------------------------------------------------------------
/**
 * Gets the amount of KST that is currently added to the base block reward.
 * Essentially, this is the count of names registered in the last 500 blocks.
 *
 * @deprecated Block submission is currently disabled, so all new names will
 * increase the bonus, but this does not currently mean anything.
 *
 * @returns The name bonus.
 */
export async function getNameBonus(
  this: KristApi
): Promise<number> {
  // TODO: Validation
  return (await this.get<{ name_bonus: number }>("names/bonus")).name_bonus;
}

// -----------------------------------------------------------------------------
// GET /names
// -----------------------------------------------------------------------------
/**
 * Get a list of names, sorted by `name` ascending.
 *
 * This method must be manually paginated, see {@link KristApi.paginateNames} to
 * do this automatically.
 *
 * @see https://krist.dev/docs/#api-NameGroup-GetNames
 *
 * @param options.limit - The maximum amount of results to return. Must be
 *   between 1 and 1000. Defaults to 50.
 * @param options.offset - The amount to offset the results, useful to paginate
 *   results, and in conjunction with `limit`. Defaults to 0.
 * @returns The list of names.
 */
export async function getNames(
  this: KristApi,
  options?: KristApiPaginationOptions
): Promise<NamesResponse> {
  // TODO: Validation
  return await this.get<NamesResponse>("names",
    pickPaginationOptions(options));
}

/**
 * Paginates the list of names, sorted by `name` ascending.
 *
 * The callback `onPageFn` will be called for each page of results. The first
 * argument of the callback will be the array of {@link KristName} results for
 * that page. The second argument of the callback will be the total number of
 * results for the query. If the callback returns `false`, pagination will stop.
 *
 * @see https://krist.dev/docs/#api-NameGroup-GetNames
 *
 * @param initialOptions.limit - The maximum amount of results to return per
 *   page. Must be between 1 and 1000. Defaults to 50.
 * @param initialOptions.offset - The amount to offset the results from the
 *   beginning. Defaults to 0.
 * @param onPageFn - Callback called for each page of results.
 * @returns The total number of results for the query.
 */
export async function paginateNames(
  this: KristApi,
  initialOptions?: KristApiPaginationOptions,
  onPageFn?: OnPageFn<KristName>
): Promise<number> {
  return paginateCollection<KristName, NamesResponse>(
    p => this.getNames(p), "names", initialOptions, onPageFn
  );
}

// -----------------------------------------------------------------------------
// GET /names/new
// -----------------------------------------------------------------------------
/**
 * Get a list of the newest names, sorted by `registered` descending.
 *
 * This method must be manually paginated, see {@link KristApi.paginateNewNames}
 * to do this automatically.
 *
 * @see https://krist.dev/docs/#api-NameGroup-GetNewNames
 *
 * @param options.limit - The maximum amount of results to return. Must be
 *   between 1 and 1000. Defaults to 50.
 * @param options.offset - The amount to offset the results, useful to paginate
 *   results, and in conjunction with `limit`. Defaults to 0.
 * @returns The list of names.
 */
export async function getNewNames(
  this: KristApi,
  options?: KristApiPaginationOptions
): Promise<NamesResponse> {
  // TODO: Validation
  return await this.get<NamesResponse>("names/new",
    pickPaginationOptions(options));
}

/**
 * Paginates the list of names, sorted by `registered` descending.
 *
 * The callback `onPageFn` will be called for each page of results. The first
 * argument of the callback will be the array of {@link KristName} results for
 * that page. The second argument of the callback will be the total number of
 * results for the query. If the callback returns `false`, pagination will stop.
 *
 * @see https://krist.dev/docs/#api-NameGroup-GetNewNames
 *
 * @param initialOptions.limit - The maximum amount of results to return per
 *   page. Must be between 1 and 1000. Defaults to 50.
 * @param initialOptions.offset - The amount to offset the results from the
 *   beginning. Defaults to 0.
 * @param onPageFn - Callback called for each page of results.
 * @returns The total number of results for the query.
 */
export async function paginateNewNames(
  this: KristApi,
  initialOptions?: KristApiPaginationOptions,
  onPageFn?: OnPageFn<KristName>
): Promise<number> {
  return paginateCollection<KristName, NamesResponse>(
    p => this.getNewNames(p), "names", initialOptions, onPageFn
  );
}

// -----------------------------------------------------------------------------
// GET /names/:name
// -----------------------------------------------------------------------------
/**
 * Gets a single name.
 *
 * @see https://krist.dev/docs/#api-NameGroup-GetName
 *
 * @param name - The name to get, without the `.kst` suffix.
 * @returns The name.
 */
export async function getName(
  this: KristApi,
  name: string
): Promise<KristName> {
  // TODO: Validation
  return (await this.get<NameResponse>(
    "names/" + encodeURIComponent(name)
  )).name;
}

// -----------------------------------------------------------------------------
// POST /names/:name
// -----------------------------------------------------------------------------
/**
 * Registers a new name. A name costs 500 KST to register.
 *
 * @see https://krist.dev/docs/#api-NameGroup-RegisterName
 *
 * @param name - The name you want to register, without the `.kst` suffix.
 * @param options - The {@link KristAuthOptions} options for the request. If a
 *   password or private key are not supplied, the request will error.
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
 * @returns The {@link KristName} that was made.
 */
export async function registerName(
  this: KristApi,
  name: string,
  options?: KristAuthOptions
): Promise<KristName> {
  // TODO: Validation
  const privatekey = await calculateAddressFromOptions(options);
  // TODO: Better error
  if (!privatekey) throw new Error("No private key provided");

  return (await this.post<NameResponse>(
    "names/" + encodeURIComponent(name),
    { privatekey }
  )).name;
}

// -----------------------------------------------------------------------------
// POST /names/:name/transfer
// -----------------------------------------------------------------------------
/**
 * Transfers the name to another owner. You must be the owner of the name to
 * transfer it.
 *
 * @see https://krist.dev/docs/#api-NameGroup-TransferName
 *
 * @param name - The name you want to transfer, without the `.kst` suffix.
 * @param newOwner - The address you want to transfer the name to.
 * @param options - The {@link KristAuthOptions} options for the request. If a
 *   password or private key are not supplied, the request will error.
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
 * @returns The {@link KristName} that was transferred.
 */
export async function transferName(
  this: KristApi,
  name: string,
  newOwner: string,
  options?: KristAuthOptions
): Promise<KristName> {
  // TODO: Validation
  const privatekey = await calculateAddressFromOptions(options);
  // TODO: Better error
  if (!privatekey) throw new Error("No private key provided");

  return (await this.post<NameResponse>(
    "names/" + encodeURIComponent(name) + "/transfer",
    { address: newOwner, privatekey }
  )).name;
}

// -----------------------------------------------------------------------------
// POST /names/:name/update
// -----------------------------------------------------------------------------
/**
 * Updates the data of a name. You must be the owner of the name to update it.
 *
 * @see https://krist.dev/docs/#api-NameGroup-UpdateNamePOST
 *
 * @param name - The name you want to update, without the `.kst` suffix.
 * @param data - The data you want to set for the name, or `null` to remove the
 *   name's data.
 * @param options - The {@link KristAuthOptions} options for the request. If a
 *   password or private key are not supplied, the request will error.
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
 * @returns The {@link KristName} that was updated.
 */
export async function updateName(
  this: KristApi,
  name: string,
  data?: string | null,
  options?: KristAuthOptions
): Promise<KristName> {
  // TODO: Validation
  const privatekey = await calculateAddressFromOptions(options);
  // TODO: Better error
  if (!privatekey) throw new Error("No private key provided");

  return (await this.post<NameResponse>(
    "names/" + encodeURIComponent(name) + "/update",
    { a: data, privatekey }
  )).name;
}
