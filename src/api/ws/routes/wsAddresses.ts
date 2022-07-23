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

import { KristAddress, KristWsC2SAddress, KristWsS2CAddress } from "../../../types";
import { KristWsClient } from "../KristWsClient";

/**
 * Gets a single address.
 *
 * @see KristApi.getAddress
 * @see https://krist.dev/docs/#api-WebsocketGroup-WSGetAddress
 *
 * @param address - The address to get.
 * @param fetchNames - When `true`, fetch the count of names owned by the
 *   address. The {@link KristAddress | `address`} object returned will have the
 *   `names` count field available.
 * @returns The address.
 */
export async function getAddress(
  this: KristWsClient,
  address: string,
  fetchNames?: boolean
): Promise<KristAddress> {
  return (await this.sendAndWait<KristWsS2CAddress, KristWsC2SAddress>({
    type: "address",
    address,
    fetchNames
  })).address;
}
