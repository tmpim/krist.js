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

import { PickByValue } from "utility-types";

export interface KristApiPaginationOptions {
  /**
   * The maximum number of results to return per page. Must be between 1 and
   * 1000. Defaults to 50.
   */
  limit?: number;
  /**
   * The amount to offset the results, useful to paginate results, and in
   * conjunction with `limit`. Defaults to 0.
   */
  offset?: number;
}

export interface KristApiTransactionPaginationOptions extends KristApiPaginationOptions {
  /** If `true`, mined transactions will not be included in the results. */
  excludeMined?: boolean;
}

export interface KristApiPaginatedResponseBase {
  /** The number of results returned for this page. */
  count: number;
  /** The total number of items in the collection. */
  total: number;
}

export function pickPaginationOptions(
  options?: KristApiPaginationOptions
): KristApiPaginationOptions {
  if (!options) return {};
  return {
    limit: options.limit,
    offset: options.offset,
  };
}

export function pickTransactionPaginationOptions(
  options?: KristApiTransactionPaginationOptions
): KristApiTransactionPaginationOptions {
  if (!options) return {};
  const out: KristApiTransactionPaginationOptions
    = pickPaginationOptions(options);
  if (options.excludeMined) out.excludeMined = true;
  return out;
}

/**
 * Callback for a page of results from a paginated API endpoint. If the
 * callback returns `false`, pagination will stop.
 *
 * @typeParam ItemT - The type of each result.
 *
 * @param data - The array of items for this page.
 * @param total - The total number of results for the query.
 */
export type OnPageFn<ItemT> = (data: ItemT[], total: number) =>
  (boolean | void | undefined) | PromiseLike<boolean | void | undefined>;

/** @internal */
export async function paginateCollection<
  ItemT,
  CollectionT
>(
  apiFn: (paginationOpts: KristApiPaginationOptions) =>
    Promise<KristApiPaginatedResponseBase & PickByValue<CollectionT, ItemT[]>>,
  resultsKey: keyof PickByValue<CollectionT, ItemT[]>,
  initialOptions?: KristApiPaginationOptions,
  onPageFn?: (data: ItemT[], total: number) =>
    (boolean | void | undefined) | PromiseLike<boolean | void | undefined>
): Promise<number> {
  const limit = Math.max(initialOptions?.limit ?? 50, 1);
  let nextOffset = Math.max(initialOptions?.offset ?? 0, 0);
  let total = 0;

  do {
    const response = await apiFn({ limit, offset: nextOffset });
    const data = response[resultsKey] as unknown as ItemT[];
    total = response.total;

    // Allow the callback to return `false` to stop pagination
    const cancelResult = await onPageFn?.(data, total);
    if (cancelResult === false) return total;

    nextOffset += limit;
  } while (nextOffset <= total);

  return total;
}
