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

import { KristAddress, KristBlock, KristMotd, KristName, KristTransaction } from "./krist.js";

import { lut } from "../util/internalUtil.js";

/** The current state of a websocket connection. */
export type KristWsConnectionState = "connected" | "disconnected"
  | "connecting";

/**
 * Websocket events that can be subscribed to.
 *
 * | Subscription Name | Events        | Description                                                                               |
 * | ----------------- | ------------- | ----------------------------------------------------------------------------------------- |
 * | `blocks`          | `block`       | Block events whenever a block is mined by anybody on the node.                            |
 * | `ownBlocks`       | `block`       | Block events whenever the authed user mines a block.                                      |
 * | `transactions`    | `transaction` | Transaction events whenever a transaction is made by anybody on the node.                 |
 * | `ownTransactions` | `transaction` | Transaction events whenever a transaction is made to or from the authed user.             |
 * | `names`           | `name`        | Name events whenever a name is purchased, modified or transferred by anybody on the node. |
 * | `ownNames`        | `name`        | Name events whenever the authed user purchases, modifies or transfers a name.             |
 *
 * @see https://krist.dev/docs/#api-WebsocketGroup-WebsocketStart
 */
export type KristWsSubscription = "blocks" | "ownBlocks" | "transactions"
  | "ownTransactions" | "names" | "ownNames" | "motd";
/** Array of valid {@link KristWsSubscription | websocket events} that can be
 * subscribed to. */
export const KRIST_WS_SUBSCRIPTIONS: KristWsSubscription[] = ["blocks",
  "ownBlocks", "transactions", "ownTransactions", "names", "ownNames", "motd"];
/** Lookup table of valid {@link KristWsSubscription | websocket events} that
 * can be subscribed to. */
export const VALID_KRIST_WS_SUBSCRIPTIONS = lut(KRIST_WS_SUBSCRIPTIONS);

/**
 * Valid raw `type` parameters of outgoing (Client -\> Server) websocket
 * messages.
 *
 * @see https://krist.dev/docs/#api-WebsocketGroup
 */
export type KristWsMessageType = "address" | "login" | "logout" | "me"
  | "submit_block" | "subscribe" | "get_subscription_level"
  | "get_valid_subscription_levels" | "unsubscribe" | "make_transaction"
  | "work";
/** Array of valid {@link KristWsMessageType | raw message types} that may be
 * sent to the server. */
export const KRIST_WS_MESSAGE_TYPES: KristWsMessageType[] = ["address",
  "login", "logout", "me", "submit_block", "subscribe",
  "get_subscription_level", "get_valid_subscription_levels", "unsubscribe",
  "make_transaction", "work"];
/** Lookup table of valid {@link KristWsMessageType | raw message types} that
 * may be sent to the server. */
export const VALID_KRIST_WS_MESSAGE_TYPES = lut(KRIST_WS_MESSAGE_TYPES);

/**
 * Valid raw `type` parameters of incoming (Server -\> Client) websocket
 * messages.
 *
 * @see https://krist.dev/docs/#api-WebsocketGroup
 */
export type KristWsS2CMessageType = "keepalive" | "hello" | "event"
  | "response" | "error";

/**
 * Valid event types that may be received from a websocket connection.
 *
 * @see https://krist.dev/docs/#api-WebsocketGroup-WebsocketStart
 */
export type KristWsEventType = "block" | "transaction" | "name";
/** Array of valid {@link KristWsEventType | event types}. */
export const KRIST_WS_EVENT_TYPES: KristWsEventType[] = ["block",
  "transaction", "name"];
/** Lookup table of valid {@link KristWsEventType | event types}. */
export const VALID_KRIST_WS_EVENT_TYPES = lut(KRIST_WS_EVENT_TYPES);

// =============================================================================
// Messages
// =============================================================================
/** An outgoing message sent from a websocket client to the Krist server. */
export interface KristWsRawC2SMessage {
  /** Unique ID to identify this message when the server replies to it. You do
   * not need to specify this, the library will generate it automatically. */
  id: number;

  /** The type of message. */
  type: KristWsMessageType;
}
export type KristWsC2SMessage = Omit<KristWsRawC2SMessage, "id">;

/** An incoming message sent from the Krist server to a websocket client. */
export interface KristWsS2CMessage {
  /** Whether the request succeeded. */
  ok: boolean;

  /** The type of incoming message. */
  type: KristWsS2CMessageType;

  /** If `ok` is `false`, the error code from the Krist API. */
  error?: string;
  /** If `ok` is `false`, a human-readable error message from the Krist API. */
  message?: string;
  /** If `ok` is `false`, the parameter that caused the error (if available). */
  parameter?: string;
}

// =============================================================================
// Hello
// =============================================================================
export type KristWsHelloMessage = KristWsS2CMessage
  & KristMotd & {
    type: "hello";
  }
/** @internal */
export const _isMsgHello = (msg: KristWsS2CMessage):
  msg is KristWsHelloMessage => msg.type === "hello";

// =============================================================================
// Event
// =============================================================================
export interface KristWsEventMessage extends KristWsS2CMessage {
  type: "event";
  event: KristWsEventType;
}
/** @internal */
export const _isMsgEvent = (msg: KristWsS2CMessage):
  msg is KristWsEventMessage => msg.type === "event";

export interface KristWsBlockEvent extends KristWsEventMessage {
  event: "block";
  /** The block that was just mined. */
  block: KristBlock;
  /** The new Krist work (difficulty). */
  new_work: number;
}
/** @internal */
export const _isMsgBlockEvent = (msg: KristWsS2CMessage):
  msg is KristWsBlockEvent => _isMsgEvent(msg) && msg.event === "block";

export interface KristWsTransactionEvent extends KristWsEventMessage {
  event: "transaction";
  /** The transaction that was just made. */
  transaction: KristTransaction;
}
/** @internal */
export const _isMsgTransactionEvent = (msg: KristWsS2CMessage):
  msg is KristWsTransactionEvent => _isMsgEvent(msg)
    && msg.event === "transaction";

export interface KristWsNameEvent extends KristWsEventMessage {
  event: "name";
  /** The name that was just purchased, modified or transferred. */
  name: KristName;
}
/** @internal */
export const _isMsgNameEvent = (msg: KristWsS2CMessage):
  msg is KristWsNameEvent => _isMsgEvent(msg) && msg.event === "name";

// =============================================================================
// Keepalive
// =============================================================================
export interface KristWsKeepaliveMessage
  extends KristWsS2CMessage {
  type: "keepalive";
  /** The server's current time, as an ISO-8601 string. */
  server_time: string;
}
/** @internal */
export const _isMsgKeepalive = (msg: KristWsS2CMessage):
  msg is KristWsKeepaliveMessage => msg.type === "keepalive";

// =============================================================================
// Response
// =============================================================================
export interface KristWsS2CResponseMessage extends KristWsS2CMessage {
  type: "response";

  /** The message ID that this is in response to. You typically do not need to
   * do anything with this, the library will handle message replies
   * automatically. */
  id: number;

  /** The type of message that the server is responding to. */
  responding_to_type: KristWsMessageType;
}
/** @internal */
export const _isMsgResponse = (msg: KristWsS2CMessage):
  msg is KristWsS2CResponseMessage => msg.type === "response" || msg.type === "error";

// -----------------------------------------------------------------------------
// Messages - Addresses
// -----------------------------------------------------------------------------
export interface KristWsC2SAddress extends KristWsC2SMessage {
  type: "address";
  /** The address to fetch data for. */
  address: string;
  /** When `true`, fetch the count of names owned by the address. The
   * {@link KristAddress | `address`} object in the response will have the
   * `names` count field available. */
  fetchNames?: boolean;
}

export interface KristWsS2CAddress extends KristWsS2CResponseMessage {
  responding_to_type: "address";
  /** The address that was fetched. */
  address: KristAddress;
}

// -----------------------------------------------------------------------------
// Messages - Me
// -----------------------------------------------------------------------------
export interface KristWsS2CMeBase extends KristWsS2CResponseMessage {
  responding_to_type: "me";
  /** Whether the websocket connection is currently a guest, `false` if
   * authenticated. */
  isGuest: boolean;
}

export interface KristWsS2CMeGuest extends KristWsS2CResponseMessage {
  /** Whether the websocket connection is currently a guest, `false` if
   * authenticated. */
  isGuest: true;
}

export interface KristWsS2CMeAuthed extends KristWsS2CResponseMessage {
  /** Whether the websocket connection is currently a guest, `false` if
   * authenticated. */
  isGuest: false;
  /** The address the websocket connection is authenticated as. */
  address: KristAddress;
}

export type KristWsS2CMe = KristWsS2CMeGuest
  | KristWsS2CMeAuthed;

// -----------------------------------------------------------------------------
// Messages - Submission
// -----------------------------------------------------------------------------
/** @internal */
export interface KristWsC2SSubmitBlock
  extends KristWsC2SMessage {
  type: "submit_block";
  address: string;
  nonce: number[] | string;
}

/** @internal */
export interface KristWsS2CSubmitBlock
  extends KristWsS2CResponseMessage {
  responding_to_type: "submit_block";
  address: KristAddress;
  block: KristBlock;
}

// -----------------------------------------------------------------------------
// Messages - Subscription
// -----------------------------------------------------------------------------
export interface KristWsS2CSubscriptionBase
  extends KristWsS2CResponseMessage {
  /**
   * The current {@link KristWsSubscription | subscription levels} of the
   * websocket connection.
   */
  subscription_level: KristWsSubscription[];
}

export interface KristWsS2CGetSubscriptionLevel
  extends KristWsS2CSubscriptionBase {
  responding_to_type: "get_subscription_level";
}

export interface KristWsC2SSubscribe
  extends KristWsC2SMessage {
  event: KristWsSubscription;
}
export interface KristWsS2CSubscribe
  extends KristWsS2CSubscriptionBase {
  responding_to_type: "subscribe";
}

export interface KristWsS2CUnsubscribe
  extends KristWsS2CSubscriptionBase {
  responding_to_type: "unsubscribe";
}
export type KristWsC2SUnsubscribe = KristWsC2SSubscribe;

export interface KristWsS2CGetValidSubscriptionLevels
  extends KristWsS2CResponseMessage {
  responding_to_type: "get_valid_subscription_levels";
  /**
   * The list of {@link KristWsSubscription | subscription levels} accepted by
   * the server.
   */
  valid_subscription_levels: KristWsSubscription[];
}

// -----------------------------------------------------------------------------
// Messages - Transactions
// -----------------------------------------------------------------------------
export interface KristWsC2SMakeTransaction extends KristWsC2SMessage {
  type: "make_transaction";
  privatekey: string;
  to: string;
  amount: number;
  metadata?: string;
  requestId?: string;
}

export interface KristWsS2CMakeTransaction extends KristWsS2CResponseMessage {
  responding_to_type: "make_transaction";
  /** The transaction that was just made. */
  transaction: KristTransaction;
}

// -----------------------------------------------------------------------------
// Messages - Work
// -----------------------------------------------------------------------------
export interface KristWsS2CWork extends KristWsS2CResponseMessage {
  responding_to_type: "work";
  /** The current Krist work (difficulty). */
  work: number;
}
