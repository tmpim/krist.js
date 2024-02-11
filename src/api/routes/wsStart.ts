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

import { KristErrorWebSocketStart } from "../../errors";
import { KristApi } from "../KristApi.js";

export async function wsStart(
  this: KristApi,
  privatekey?: string
): Promise<string> {
  // TODO: Validation
  const { url } = await this.post<{ url: string }>("ws/start", { privatekey });
  if (!url) throw new KristErrorWebSocketStart();
  return url;
}
