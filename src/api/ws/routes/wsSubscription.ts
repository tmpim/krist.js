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

import {
  KristWsSubscription, KristWsS2CSubscribe,
  KristWsC2SSubscribe, KristWsS2CUnsubscribe,
  KristWsC2SUnsubscribe, KristWsS2CGetSubscriptionLevel
} from "../../../types";

import { KristWsClient } from "../KristWsClient.js";

export async function getSubscriptions(
  this: KristWsClient
): Promise<KristWsS2CGetSubscriptionLevel> {
  return this.sendAndWait<KristWsS2CGetSubscriptionLevel>({
    type: "get_subscription_level"
  });
}

export async function subscribe(
  this: KristWsClient,
  event: KristWsSubscription
): Promise<KristWsS2CSubscribe> {
  // TODO: arg validation
  return this.sendAndWait<KristWsS2CSubscribe, KristWsC2SSubscribe>({
    type: "subscribe",
    event
  });
}

export async function unsubscribe(
  this: KristWsClient,
  event: KristWsSubscription
): Promise<KristWsS2CUnsubscribe> {
  // TODO: arg validation
  return this.sendAndWait<KristWsS2CUnsubscribe, KristWsC2SUnsubscribe>({
    type: "unsubscribe",
    event
  });
}
