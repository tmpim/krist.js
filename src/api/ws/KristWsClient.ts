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
  KristMotd, KristWsBlockEvent, KristWsEventMessage,
  KristWsS2CMessage, KristWsNameEvent, KristWsC2SMessage,
  KristWsRawC2SMessage, KristWsS2CResponseMessage,
  KristWsSubscription, KristWsTransactionEvent,
  KristWsHelloMessage,
  _isMsgBlockEvent, _isMsgEvent, _isMsgHello, _isMsgKeepalive,
  _isMsgNameEvent, _isMsgResponse, _isMsgTransactionEvent,
} from "../../types/index.js";
import { KristApi } from "../KristApi.js";

import { getAddress } from "./routes/wsAddresses.js";
import { getMe } from "./routes/wsMe.js";
import { submitBlock } from "./routes/wsSubmission.js";
import { getSubscriptions, subscribe, unsubscribe } from "./routes/wsSubscription.js";
import { makeTransaction } from "./routes/wsTransactions.js";
import { getWork } from "./routes/wsWork.js";

import NodeWebSocket from "ws";

import { TypedEmitter } from "tiny-typed-emitter";
import rateLimiter from "limiter";

import { KristWalletFormatName } from "../../util/walletFormats.js";
import { Sha256Fn } from "../../util/internalCrypto.js";
import { calculateAddressFromOptions, isObject } from "../../util/internalUtil.js";

type BrowserWebSocket = WebSocket;

interface KristWsClientEvents {
  "ready": (motd: KristMotd) => void;
  "state": (connectionState: WsConnectionState,
    oldConnectionState: WsConnectionState) => void;

  "event": (msg: KristWsEventMessage) => void;
  "block": (msg: KristWsBlockEvent) => void;
  "transaction": (msg: KristWsTransactionEvent) => void;
  "name": (msg: KristWsNameEvent) => void;

  "keepalive": (serverTime: Date) => void;

  "message": (msg: KristWsS2CMessage) => void;
  "wsOpen": () => void;
  "wsClose": (code: number, reason: string) => void;
  "wsError": (err: Error) => void;

  "errorInvalidMessage": (msg: any) => void;
  "errorUnexpectedResponse": (msg: KristWsS2CResponseMessage) => void;
}

export type WsConnectionState = "connecting" | "connected" | "disconnected";

const DEFAULT_CONNECT_DEBOUNCE_MS = 1000;

export interface KristWsClientOptionsPrivatekey {
  /**
   * Instead of a password, the raw private key to use for authenticating to
   * the websocket. No wallet format will be applied. If a private key or
   * password are not supplied, the connection will be a "guest" connection.
   *
   * @group Advanced
   */
  privatekey?: string;
}

export interface KristWsClientOptionsPassword {
  /**
   * The password to use for authenticating to the websocket. If a password or
   * private key are not supplied, the connection will be a "guest"
   * connection.
   */
  password?: string;
  /**
   * The username to use for authenticating to the websocket, if the wallet
   * format requires a username.
   */
  username?: string;
  /**
   * The wallet format to use if a password was supplied. Defaults to
   * `kristwallet`.
   */
  walletFormat?: KristWalletFormatName;

  /**
   * The SHA-256 function to use. Defaults to a pure JS implementation. You do
   * not normally need to supply this.
   *
   * @group Advanced
   */
  sha256Fn?: Sha256Fn;
}

export interface KristWsClientOptions extends KristWsClientOptionsPassword,
  KristWsClientOptionsPrivatekey {
  /** The events to subscribe to. Defaults to `[]` - no events will be
   * received. */
  initialSubscriptions?: KristWsSubscription[];

  /** The maximum time between reconnection attempts, in seconds. */
  maxReconnectSecs?: number;
}

// Global rate limiter so that multiple KristApi instances will share this
const limiter = new rateLimiter.RateLimiter({
  tokensPerInterval: 120,
  interval: "minute"
});

/**
 * A WebSocket client instance for the Krist API. Must be created with
 * {@link KristApi.createWsClient}.
 *
 * After creating a KristWsClient, you can call {@link KristWsClient#connect} to
 * establish a new connection to the Krist server. After this, the client will
 * automatically attempt to reconnect if the connection is lost.
 *
 * {@link KristWsClient} is a standard event emitter. Events can be listened to
 * with `ws.on(event, callback)`.
 *
 * When disconnecting from the Krist server, the client will automatically try
 * to reconnect, starting with a 1 second delay, doubling with each attempt up
 * to a maximum of 60 seconds (1 minute). The library will not stop attempting
 * to reconnect - this is the responsibility of the caller.
*/
export class KristWsClient extends TypedEmitter<KristWsClientEvents> {
  private connectionState: WsConnectionState = "connecting";

  private messageId = 1;
  private messageResponses: Record<number, {
    resolve: (value?: KristWsS2CResponseMessage) => void;
    reject: (reason?: KristWsS2CResponseMessage) => void;
  }> = {};

  private reconnectionTimer?: any; // browser returns number, Node returns Timer
  private connectDebounceMs = DEFAULT_CONNECT_DEBOUNCE_MS;
  private forceClosing = false;

  private ws: NodeWebSocket | BrowserWebSocket | null = null;
  private isOpened = false;
  private isClosed = false;

  protected privatekey?: string;
  private readonly initSubscriptions: KristWsSubscription[] = [];
  private readonly maxReconnectSecs: number = 60;

  /**
   * Emitted when the client has connected to the server and is ready to receive
   * messages. The `hello` message from the server will be passed as an argument
   * to the event, containing full {@link KristMotd} information. This event
   * will happen each time the client connects to the server, so it may happen
   * more than once.
   * @event
   */
  static READY = "ready";

  /**
   * Emitted when a block is submitted, if subscribed to the `blocks` or
   * `ownBlocks` events. The whole {@link KristWsBlockEvent} message will be
   * passed to the callback.
   * @event
   */
  static BLOCK = "block";

  /**
   * Emitted when a transaction is made, if subscribed to the `transactions` or
   * `ownTransactions` events. The whole {@link KristWsTransactionEvent}
   * message will be passed to the callback.
   * @event
   */
  static TRANSACTION = "transaction";

  /**
   * Emitted when a name is purchased, if subscribed to the `names` or
   * `ownNames` events. The whole {@link KristWsNameEvent} message will be
   * passed to the callback.
   * @event
   */
  static NAME = "name";

  /**
   * Emitted when the server sends a keepalive ping. The server's time as a
   * Date will be passed to the callback.
   * @event
   */
  static KEEPALIVE = "keepalive";

  /**
   * Emitted when any event is received. The full {@link KristWsEventMessage}
   * will be passed to the callback.
   * @event
   */
  static EVENT = "event";

  /**
   * Emitted when any message is received. The full raw
   * {@link KristWsS2CMessage} will be passed to the callback.
   * @event
   */
  static MESSAGE = "message";

  /**
   * Emitted when the connection state changes. The new and old
   * {@link WsConnectionState | states} respectively will be passed as arguments
   * to the callback.
   * @event
   */
  static STATE = "state";

  /** @internal */
  constructor(
    private api: KristApi,
    private userAgent: string,
    private options?: KristWsClientOptions
  ) {
    super();

    this.initSubscriptions = options?.initialSubscriptions ?? [];
    this.maxReconnectSecs = Math.max(options?.maxReconnectSecs || 60, 1);
  }

  private async _connect(): Promise<void> {
    this.setConnectionState("disconnected");

    // Generate the privatekey if needed
    if (!this.privatekey && this.options) {
      this.privatekey = await calculateAddressFromOptions(this.options);
    }

    // Get a websocket connection URL
    const url = await this.api._wsStart(this.privatekey);

    // Connect to the websocket
    const isBrowser = !!globalThis.WebSocket;

    this.setConnectionState("connecting");

    return new Promise((resolve, reject) => {
      const onOpen = () => {
        this.isOpened = true;
        this.isClosed = false;
        this.emit("wsOpen");
        resolve();
      };

      const onClose = () => {
        this.isOpened = false;
        this.isClosed = true;
        this.handleClose({ code: 1000, reason: "NYI" });
        reject(new Error("WebSocket closed"));
      };

      const onError = (err: Error) => {
        this.isOpened = false;
        this.isClosed = true;
        this.emit("wsError", err);
        reject(err);
      };

      const onMessage = (msg: any) => {
        try {
          const data = JSON.parse(msg) as KristWsS2CMessage;
          console.log(data);
          this.handleMessage(data);
        } catch (err: any) {
          this.emit("errorInvalidMessage", msg);
        }
      };

      if (isBrowser) {
        this.ws = new WebSocket(url, this.userAgent);
        this.ws.onopen = onOpen;
        this.ws.onclose = onClose;
        this.ws.onerror = (e) => onError(new Error(e.toString())); // who knows
        this.ws.onmessage = (e) => onMessage(e.data);
      } else {
        this.ws = new NodeWebSocket(url, { headers: { "User-Agent": this.userAgent } });
        this.ws.on("open", onOpen);
        this.ws.on("close", onClose);
        this.ws.on("error", onError);
        this.ws.on("message", onMessage);
      }

      this.messageId = 1;
      this.connectDebounceMs = DEFAULT_CONNECT_DEBOUNCE_MS;
    });
  }

  /**
   * Initiate a connection to the Krist server. From this point onwards, the
   * client will take over responsibility for auto-reconnecting. Event handlers
   * should be registered **before** calling this method.
   *
   * The promise will be resolved when the connection has been opened (but will
   * not necessarily be ready yet).
   */
  async connect(): Promise<void> {
    try {
      await this._connect();
    } catch (err: any) {
      this.handleDisconnect(err);
    }
  }

  private handleMessage(msg: KristWsS2CMessage): void {
    if (!this.ws || !this.isOpened || this.isClosed || this.forceClosing) return;

    if (!msg.type) {
      this.emit("errorInvalidMessage", msg);
      return;
    }

    this.emit("message", msg);

    if (_isMsgHello(msg)) {
      this.handleHello(msg);
    } else if (_isMsgEvent(msg)) {
      this.emit("event", msg);

      if (_isMsgBlockEvent(msg)) this.emit("block", msg);
      if (_isMsgTransactionEvent(msg)) this.emit("transaction", msg);
      if (_isMsgNameEvent(msg)) this.emit("name", msg);
    } else if (_isMsgResponse(msg)) {
      const handler = this.messageResponses[msg.id];
      if (!handler) {
        this.emit("errorUnexpectedResponse", msg);
        return;
      }
      delete this.messageResponses[msg.id];

      if (msg.ok && !msg.error) {
        handler.resolve(msg);
      } else {
        handler.reject(msg);
      }
    } else if (_isMsgKeepalive(msg)) {
      this.emit("keepalive", new Date(msg.server_time));
    }
  }

  private async handleHello(msg: KristWsHelloMessage): Promise<void> {
    // Sync the subscriptions. The Krist server subscribes to `ownTransactions`
    // and `blocks` by default, but the default for KristWsClient is `[]`, so
    // unsubscribe from anything we don't need, and subscribe to anything we do.
    const { subscription_level: haveSubs } = await this.getSubscriptions();

    const wantSubs = new Set(this.initSubscriptions || []);
    const removeSubs = haveSubs.filter(s => !wantSubs.has(s));
    const addSubs = [...wantSubs].filter(s => !haveSubs.includes(s));

    await Promise.all([
      ...removeSubs.map(s => this.unsubscribe(s)),
      ...addSubs.map(s => this.subscribe(s)),
    ]);

    // Send the MOTD via the `ready` event
    this.setConnectionState("connected");
    this.emit("ready", msg);
  }

  private handleDisconnect(_err?: Error) {
    if (this.reconnectionTimer) clearTimeout(this.reconnectionTimer);

    this.setConnectionState("disconnected");

    this.reconnectionTimer = setTimeout(() => {
      this.connectDebounceMs = Math.min(this.connectDebounceMs * 2, this.maxReconnectSecs * 1000);
      this._connect().catch(err => this.handleDisconnect(err));
    }, this.connectDebounceMs);
  }

  private handleClose(event: { code: number; reason: string }): void {
    this.emit("wsClose", event.code, event.reason);
    this.handleDisconnect();
  }

  /** Forcibly close the websocket connection. */
  forceClose(): void {
    if (this.forceClosing) return;
    this.forceClosing = true;

    if (!this.ws || !this.isOpened || this.isClosed) return;
    this.ws.close();
  }

  private setConnectionState(state: WsConnectionState): void {
    const old = this.connectionState;
    this.connectionState = state;
    this.emit("state", state, old);
  }

  private async sendRaw(msg: KristWsRawC2SMessage): Promise<void> {
    // TODO: arg validation
    if (!msg || !isObject(msg)) return;
    if (typeof msg.id !== "number") return;

    // Apply rate limiting
    await limiter.removeTokens(1);

    // TODO: Catch here
    this.ws?.send(JSON.stringify(msg));
  }

  /**
   * Sends a raw message to the Krist server and waits for a response. The
   * methods for a specific API request should be used instead of this function.
   *
   * @group Advanced
   *
   * @param data - The full message to send to the server. The message ID will
   *   be generated automatically.
   * @returns The response from the server.
   */
  sendAndWait<
    // eslint-disable-next-line @typescript-eslint/naming-convention
    S2C_T extends KristWsS2CResponseMessage = KristWsS2CResponseMessage,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    C2S_T extends KristWsC2SMessage = KristWsC2SMessage
  >(
    data: C2S_T
  ): Promise<S2C_T> {
    return new Promise((resolve, reject) => {
      const id = ++this.messageId;
      const msg = {
        ...data,

        // Typically I allow the user to override the ID of messages, but I
        // really don't see any good reason to do that. Feel free to patch this
        // if you have a VERY good reason to do so - simply move this line above
        // `...msg`
        id
      };

      this.messageResponses[id] = {
        resolve: resolve as (d: any) => void,
        reject
      };

      this.sendRaw(msg).catch(reject);
    });
  }

  /** @group API Fetch */ public getAddress = getAddress;
  /** @group API Fetch */ public getMe = getMe;
  /** @group API Fetch */ public getSubscriptions = getSubscriptions;
  /** @group API Fetch */ public getWork = getWork;
  /** @group API Submit */ public makeTransaction = makeTransaction;
  /** @group API Miscellaneous */ public subscribe = subscribe;
  /** @group API Miscellaneous */ public unsubscribe = unsubscribe;
  /** @internal */ public submitBlock = submitBlock;
}

