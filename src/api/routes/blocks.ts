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

import { KristBlock, KristBlockValue } from "../../types/index.js";
import {
  KristApiPaginatedResponseBase, KristApiPaginationOptions, OnPageFn,
  paginateCollection, pickPaginationOptions
} from "../../util/apiUtil.js";
import { KristApi } from "../KristApi.js";

export interface KristApiBlockResponse {
  block: KristBlock;
}
export type BlockResponse = KristApiBlockResponse;

export interface KristApiBlocksResponse extends KristApiPaginatedResponseBase {
  blocks: KristBlock[];
}
export type BlocksResponse = KristApiBlocksResponse;

// -----------------------------------------------------------------------------
// GET /blocks
// -----------------------------------------------------------------------------
export async function getBlocks(
  this: KristApi,
  options?: KristApiPaginationOptions
): Promise<BlocksResponse> {
  // TODO: Validation
  return await this.get<BlocksResponse>("blocks",
    pickPaginationOptions(options));
}

export async function paginateBlocks(
  this: KristApi,
  initialOptions?: KristApiPaginationOptions,
  onPageFn?: OnPageFn<KristBlock>
): Promise<number> {
  return paginateCollection<KristBlock, BlocksResponse>(
    p => this.getBlocks(p), "blocks", initialOptions, onPageFn
  );
}

// -----------------------------------------------------------------------------
// GET /blocks/latest
// -----------------------------------------------------------------------------
export async function getLatestBlocks(
  this: KristApi,
  options?: KristApiPaginationOptions
): Promise<BlocksResponse> {
  // TODO: Validation
  return await this.get<BlocksResponse>("blocks/latest",
    pickPaginationOptions(options));
}

export async function paginateLatestBlocks(
  this: KristApi,
  initialOptions?: KristApiPaginationOptions,
  onPageFn?: OnPageFn<KristBlock>
): Promise<number> {
  return paginateCollection<KristBlock, BlocksResponse>(
    p => this.getLatestBlocks(p), "blocks", initialOptions, onPageFn
  );
}

// -----------------------------------------------------------------------------
// GET /blocks/lowest
// -----------------------------------------------------------------------------
export async function getLowestBlocks(
  this: KristApi,
  options?: KristApiPaginationOptions
): Promise<BlocksResponse> {
  // TODO: Validation
  return await this.get<BlocksResponse>("blocks/lowest",
    pickPaginationOptions(options));
}

export async function paginateLowestBlocks(
  this: KristApi,
  initialOptions?: KristApiPaginationOptions,
  onPageFn?: OnPageFn<KristBlock>
): Promise<number> {
  return paginateCollection<KristBlock, BlocksResponse>(
    p => this.getLowestBlocks(p), "blocks", initialOptions, onPageFn
  );
}

// -----------------------------------------------------------------------------
// GET /blocks/last
// -----------------------------------------------------------------------------
export async function getLastBlock(
  this: KristApi
): Promise<KristBlock> {
  // TODO: Validation
  return (await this.get<BlockResponse>("blocks/last")).block;
}

// -----------------------------------------------------------------------------
// GET /blocks/value
// -----------------------------------------------------------------------------
export async function getBlockValue(
  this: KristApi
): Promise<KristBlockValue> {
  // TODO: Validation
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const { value, base_value } = (await this.get<KristBlockValue>("blocks/value"));
  return { value, base_value };
}

// -----------------------------------------------------------------------------
// GET /blocks/:height
// -----------------------------------------------------------------------------
export async function getBlock(
  this: KristApi,
  height: number
): Promise<KristBlock> {
  // TODO: Validation
  return (await this.get<BlockResponse>(
    "blocks/" + encodeURIComponent(height)
  )).block;
}
