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

import { KristAddress } from "../../types/index.js";
import { calculateAddressFromOptions, KristAuthOptions } from "../../util/internalUtil.js";
import { KristApi } from "../KristApi.js";

export interface KristLoginResponse {
  authed: boolean;
  address?: KristAddress;
}

// -----------------------------------------------------------------------------
// POST /login
// -----------------------------------------------------------------------------
export async function login(
  this: KristApi,
  options?: KristAuthOptions
): Promise<KristLoginResponse> {
  // TODO: Validation
  const privatekey = await calculateAddressFromOptions(options);
  // TODO: Better error
  if (!privatekey) throw new Error("No private key provided");

  return await this.post<KristLoginResponse>("login", {
    privatekey
  });
}
