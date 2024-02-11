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

import { KristWorkDetailed } from "../../types/index.js";
import { KristApi } from "../KristApi.js";

// -----------------------------------------------------------------------------
// GET /work
// -----------------------------------------------------------------------------
export async function getWork(
  this: KristApi
): Promise<number> {
  return (await this.get<{ work: number }>("work")).work;
}

// -----------------------------------------------------------------------------
// GET /work/day
// -----------------------------------------------------------------------------
export async function getWorkOverTime(
  this: KristApi
): Promise<number[]> {
  return (await this.get<{ work: number[] }>("work/day")).work;
}

// -----------------------------------------------------------------------------
// GET /work/detailed
// -----------------------------------------------------------------------------
export async function getDetailedWork(
  this: KristApi
): Promise<KristWorkDetailed> {
  return await this.get<KristWorkDetailed>("work/detailed");
}
