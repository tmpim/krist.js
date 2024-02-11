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

import RateLimiterMemory from "rate-limiter-flexible/lib/RateLimiterMemory.js";
import os from "os";

import { KristApiResponse } from "../types/index.js";

import { coerceKristError, KristErrorRateLimit } from "../errors/index.js";
import { argObject, argStringNonEmpty } from "../util/argValidation.js";
import { isNil } from "../util/internalUtil.js";

import { KristWsClientOptions, KristWsClient } from "./ws/KristWsClient.js";

import {
  getAddress, getAddresses, getAddressNames, getAddressTransactions,
  getRichAddresses, paginateAddresses, paginateAddressNames,
  paginateAddressTransactions, paginateRichAddresses
} from "./routes/addresses.js";
import { motd } from "./routes/motd.js";
import { supply } from "./routes/supply.js";
import {
  getBlocks, getLatestBlocks, getLowestBlocks, getLastBlock, getBlockValue,
  getBlock, paginateBlocks, paginateLatestBlocks, paginateLowestBlocks
} from "./routes/blocks.js";
import { login } from "./routes/login.js";
import {
  checkNameAvailability, getNameCost, getNameBonus, getNames, getNewNames,
  getName, registerName, transferName, updateName, paginateNames,
  paginateNewNames
} from "./routes/names.js";
import { submitBlock } from "./routes/submission.js";
import {
  getTransactions, getLatestTransactions, getTransaction, makeTransaction,
  paginateTransactions, paginateLatestTransactions
} from "./routes/transactions.js";
import { getDetailedWork, getWork, getWorkOverTime } from "./routes/work.js";
import { wsStart } from "./routes/wsStart.js";

/** Options for the Krist API client. */
export interface KristApiOptions {
  /** The Krist API URL to connect to. Defaults to `https://krist.dev/`. */
  syncNode?: string;

  /** The user-agent to send requests as (Node.js). Defaults to
   * `krist.js/VERSION`. */
  userAgent?: string;
}

/** Generates a stringified JSON POST body, with the appropriate Content-Type
 * headers for the request. */
export const buildBody = (value: any): RequestInit => ({
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(value)
});

// Global rate limiter so that multiple KristApi instances will share this
const limiter = new RateLimiterMemory({
  // Slightly lower than server to account for timing differences
  points: 300, // 300 requests per minute
  duration: 60
});

/** Client class for the Krist API. {@link KristApiOptions | Options} may be
 * specified as a constructor parameter. */
export class KristApi {
  private readonly syncNode: string;
  private readonly userAgent: string;

  /**
   * Client class for the Krist API.
   *
   * @param options - Options for the Krist API client.
   * @param options.syncNode - The Krist API URL to connect to. Defaults to
   *   `https://krist.dev/`.
   * @param options.userAgent - The user-agent to send requests as (Node.js).
   *   Defaults to `krist.js/VERSION`.
   */
  constructor({
    syncNode = "https://krist.dev/",
    userAgent = "krist.js",
  }: KristApiOptions = {}) {
    argStringNonEmpty(syncNode, "syncNode");
    argStringNonEmpty(userAgent, "userAgent");

    this.syncNode = syncNode;
    this.userAgent = userAgent;
  }

  /**
   * Make a raw request to the Krist API. The methods for a specific API request
   * should be used instead of this function.
   *
   * @group Advanced
   *
   * @typeParam T - The type of the response body when parsed as JSON.
   *
   * @param method - The HTTP method to use for the request.
   * @param endpoint - The endpoint to request, starting with `/`.
   * @param qs - The query string to use for the request. May be an object or a
   *   string.
   * @param options - The
   *   [fetch](https://developer.mozilla.org/en-US/docs/Web/API/fetch) options
   *   to use for the request.
   *
   * @returns The response of the request.
   */
  async request<T extends Record<string, any>>(
    method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH",
    endpoint: string,
    qs?: any,
    options?: RequestInit
  ): Promise<KristApiResponse<T>> {
    argStringNonEmpty(method, "method");
    argStringNonEmpty(endpoint, "endpoint");
    if (!isNil(options)) argObject(options, "options");

    // Let the fetch bubble its error upwards
    const qss = qs ? "?" + new URLSearchParams(qs).toString() : "";
    const url = new URL(endpoint.replace(/^\//, "") + qss, this.syncNode);

    // Apply rate limiting
    await limiter.consume("krist-api", 1);

    const browserHeaders: any = typeof window !== "undefined" ? {
      "Library-Agent": "krist.js",
    } : {};
    const nodeHeaders: any = typeof window === "undefined" ? {
      "Library-Agent": `${this.userAgent} (${os.platform()} ${os.release()}; Node ${process.version})`,
    } : {};

    const res = await fetch(url.toString(), {
      method,
      headers: {
        "Library-Agent": "krist.js",
        "Accept": "application/json",
        ...browserHeaders,
        ...nodeHeaders,
        ...options?.headers,
      },
      ...options
    });

    if (res.status === 429) throw new KristErrorRateLimit();

    const data: KristApiResponse<T> = await res.json();
    if (!data.ok || data.error) throw coerceKristError(data);

    return data;
  }

  /**
   * Make a raw GET request to the Krist API. The methods for a specific API
   * request should be used instead of this function.
   *
   * @group Advanced
   *
   * @typeParam T - The type of the response body when parsed as JSON.
   *
   * @param endpoint - The endpoint to request, starting with `/`.
   * @param qs - The query string to use for the request. May be an object or a
   *   string.
   * @param options - The
   *   [fetch](https://developer.mozilla.org/en-US/docs/Web/API/fetch) options
   *   to use for the request.
   *
   * @returns The response of the request.
   */
  async get<T extends Record<string, any>>(
    endpoint: string,
    qs?: any,
    options?: RequestInit
  ): Promise<KristApiResponse<T>> {
    return this.request<T>("GET", endpoint, qs, options);
  }

  /**
   * Make a raw POST request to the Krist API. The methods for a specific API
   * request should be used instead of this function.
   *
   * @group Advanced
   *
   * @typeParam T - The type of the response body when parsed as JSON.
   *
   * @param endpoint - The endpoint to request, starting with `/`.
   * @param body - The body to send with the request. May be an object or a
   *   string.
   * @param qs - The query string to use for the request. May be an object or a
   *   string.
   * @param options - The
   *   [fetch](https://developer.mozilla.org/en-US/docs/Web/API/fetch) options
   *   to use for the request.
   *
   * @returns The response of the request.
   */
  async post<T extends Record<string, any>>(
    endpoint: string,
    body?: any,
    qs?: any,
    options?: RequestInit
  ): Promise<KristApiResponse<T>> {
    return this.request<T>("POST", endpoint, qs, {
      ...buildBody(body),
      ...options
    });
  }

  /**
   * Creates a new Krist {@link KristWsClient | WebSocket client} with the
   * specified options. If a password or private key are not supplied, the
   * connection will be a "guest" connection. The WebSocket client will
   * automatically reconnect if the connection is lost. See
   * {@link KristWsClient} for more information.
   *
   * After calling `createWsClient`, you can register event listeners with
   * `ws.on(event, listener)`.
   *
   * After registering the event listeners, you must call `ws.connect();` to
   * begin the connection to the Krist server.
   *
   * See {@link KristWsClient} for a full list of supported events and methods.
   *
   * @example
   * Connecting to the Krist API and listening for *global* transaction events:
   * ```ts
   * import { KristApi } from "krist";
   * const api = new KristApi();
   *
   * // Create a new websocket client. Subscribe to all transaction events
   * const ws = api.createWsClient({
   *   initialSubscriptions: ["transactions"]
   * });
   *
   * // Set up the event listeners before connecting
   * ws.on("transaction", transaction => {
   *   console.log("New transaction received:", transaction);
   * });
   *
   * ws.on("ready", async () => {
   *   // Connected! Requests can now be made to the websocket server:
   *   const me = await ws.getMe();
   *   console.log("Websocket client now ready! I am:", me);
   * });
   *
   * ws.connect(); // Connect to the websocket server
   * ```
   *
   * @see {@link KristWsClient}
   *
   * @param options - The {@link KristWsClientOptions} options for the WebSocket
   *   client. If a password or private key are not supplied, the connection
   *   will be a "guest" connection.
   * @param options.password - The password to use for authenticating to the
   *   websocket.
   * @param options.username - The username to use for authenticating to the
   *   websocket, if the wallet format requires a username.
   * @param options.walletFormat - The wallet format to use if a password was
   *   supplied. Defaults to `kristwallet`.
   * @param options.sha256Fn - The SHA-256 function to use. Defaults to a pure
   *   JS implementation. You do not normally need to supply this.
   * @param options.privatekey - Instead of a password, the raw private key to
   *   use for authenticating to the websocket. No wallet format will be
   *   applied. If a private key or password are not supplied, the connection
   *   will be a "guest" connection.
   * @param options.initialSubscriptions - The events to subscribe to. Defaults
   *   to `[]` - no events will be received.
   * @returns A new {@link KristWsClient} instance.
   */
  createWsClient(options?: KristWsClientOptions): KristWsClient {
    return new KristWsClient(
      this,
      this.userAgent,
      options
    );
  }

  // ===========================================================================
  // API methods
  // ===========================================================================

  // ---------------------------------------------------------------------------
  // Addresses
  // ---------------------------------------------------------------------------
  /** @group API Fetch - Addresses */ public getAddresses = getAddresses;
  /** @group API Fetch - Addresses */ public getAddress = getAddress;
  /** @group API Fetch - Addresses */ public getAddressNames = getAddressNames;
  /** @group API Fetch - Addresses */ public getAddressTransactions = getAddressTransactions;
  /** @group API Fetch - Addresses */ public getRichAddresses = getRichAddresses;

  /** @group API Fetch - Addresses */ public paginateAddresses = paginateAddresses;
  /** @group API Fetch - Addresses */ public paginateRichAddresses = paginateRichAddresses;
  /** @group API Fetch - Addresses */ public paginateAddressNames = paginateAddressNames;
  /** @group API Fetch - Addresses */ public paginateAddressTransactions = paginateAddressTransactions;

  // ---------------------------------------------------------------------------
  // Blocks
  // ---------------------------------------------------------------------------
  /** @internal */ public getBlocks = getBlocks;
  /** @internal */ public getLowestBlocks = getLowestBlocks;
  /** @internal */ public getLastBlock = getLastBlock;
  /** @internal */ public getBlockValue = getBlockValue;
  /** @internal */ public getBlock = getBlock;
  /** @internal */ public getLatestBlocks = getLatestBlocks;

  /** @internal */ public paginateBlocks = paginateBlocks;
  /** @internal */ public paginateLatestBlocks = paginateLatestBlocks;
  /** @internal */ public paginateLowestBlocks = paginateLowestBlocks;

  /** @internal */ public getWork = getWork;
  /** @internal */ public getWorkOverTime = getWorkOverTime;
  /** @internal */ public getDetailedWork = getDetailedWork;

  /** @internal */ public submitBlock = submitBlock;

  // ---------------------------------------------------------------------------
  // Names
  // ---------------------------------------------------------------------------
  /** @group API Fetch - Names */ public checkNameAvailability = checkNameAvailability;
  /** @group API Fetch - Names */ public getNameCost = getNameCost;
  /** @group API Fetch - Names */ public getNameBonus = getNameBonus;
  /** @group API Fetch - Names */ public getNames = getNames;
  /** @group API Fetch - Names */ public getNewNames = getNewNames;
  /** @group API Fetch - Names */ public getName = getName;

  /** @group API Fetch - Names */ public paginateNames = paginateNames;
  /** @group API Fetch - Names */ public paginateNewNames = paginateNewNames;

  /** @group API Submit - Names */ public registerName = registerName;
  /** @group API Submit - Names */ public transferName = transferName;
  /** @group API Submit - Names */ public updateName = updateName;

  // ---------------------------------------------------------------------------
  // Transactions
  // ---------------------------------------------------------------------------
  /** @group API Fetch - Transactions */ public getTransactions = getTransactions;
  /** @group API Fetch - Transactions */ public getLatestTransactions = getLatestTransactions;
  /** @group API Fetch - Transactions */ public getTransaction = getTransaction;

  /** @group API Fetch - Transactions */ public paginateTransactions = paginateTransactions;
  /** @group API Fetch - Transactions */ public paginateLatestTransactions = paginateLatestTransactions;

  /** @group API Submit - Transactions */ public makeTransaction = makeTransaction;

  // ---------------------------------------------------------------------------
  // Miscellaneous
  // ---------------------------------------------------------------------------
  /** @group API Miscellaneous */ public login = login;
  /** @group API Miscellaneous */ public motd = motd;
  /** @group API Miscellaneous */ public supply = supply;

  /** @internal */
  public _wsStart = wsStart;
}
