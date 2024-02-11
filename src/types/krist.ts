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

// =============================================================================
// Addresses
// =============================================================================
export interface KristAddress {
  /** The 10-character v1 or v2 address of this KristAddress, for example
   * (`kre3w0i79j`, `a5dfb396d3`). */
  address: string;
  /** The amount of Krist currently owned by this address. */
  balance: number;
  /**
   * The total amount of Krist that has ever gone into this address.
   * **Note:** Due to changes in the API over time, this value is highly
   * inaccurate.
   */
  totalin: number;
  /**
   * The total amount of Krist that has ever gone out of this address.
   * **Note:** Due to changes in the API over time, this value is highly
   * inaccurate.
   */
  totalout: number;
  /** The date this address was first seen (typically when the first transaction
   * to it was made), as an ISO-8601 string. */
  firstseen: string;
  /** If `fetchNames` was true during an API request, the number of names this
   * address owns. */
  names?: number;
}

// =============================================================================
// Blocks
// =============================================================================
export interface KristBlock {
  /** The height (ID) of this block. */
  height: number;
  /** The address which submitted this block. */
  address: string;
  /**
   * The full-length SHA-256 hash of this block. The hash is calculated by the
   * SHA-256 of the submitter's address, the 12-char hex SHA-256 of the last
   * block, and the nonce.
   * **Note:** For historical reasons some blocks may not have hashes available,
   * in which case this value will be `null`.
   */
  hash: string | null;
  /** The `hash` trimmed to 12 characters, or `null` if the block's hash is not
   * available. */
  short_hash: string | null;
  /** The reward value of this block, in Krist. */
  value: number;
  /** The time this block was submitted, as an ISO-8601 string. */
  time: string;
  /** The difficulty at the time the block was mined. */
  difficulty: number;
}

// =============================================================================
// Names
// =============================================================================
export interface KristName {
  /** The name, without the `.kst` suffix. */
  name: string;
  /** The address that currently owns this name. */
  owner: string;
  /** The address that originally purchased this name, or `null` if this
   * information is not available. */
  original_owner: string | null;
  /** The time that the name was registered, as an ISO-8601 string, or `null` if
   * this information is not available. */
  registered: string | null;
  /** The time that the name was last updated (either the data changed, or it
   * was transferred to a new owner) as an ISO-8601 string, or `null` if this
   * information is not available. */
  updated: string | null;
  /** The time that the name was last transferred to the current owner, as an
   * ISO-8601 string, or `null` if this information is not available. */
  transferred: string | null;
  /** The name's data, or `null` if there is none. */
  a: string | null;
  /** The number of blocks until this name has been paid off. */
  unpaid: number;
}

// =============================================================================
// Transactions
// =============================================================================
/**
 * The type of a transaction. For historical transactions, the `type` field is
 * calculated (by the Krist API) based on the contents of the transaction.
 *
 * - `mined`: The block reward paid to the submitter of this block. `from` will
 *   be `null`.
 * - `transfer`: A transfer of Krist from one address to another.
 * - `name_purchase`: A purchase of a name. `to` will be `"name"`, `name` will
 *   be the name that was purchased, without the `.kst` suffix.
 * - `name_a_record`: An update to a name's data. `to` will be `"a"`, `name`
 *   will be the name that was updated, without the `.kst` suffix.
 * - `name_transfer`: A transfer of a name to a new owner. `to` will be the
 *   name's new owner, `name` will be the name that was transferred, without the
 *   `.kst` suffix.
 * - `unknown`: The transaction type could not be determined.
 */
export type KristTransactionType = "unknown" | "mined" | "name_purchase"
  | "name_a_record" | "name_transfer" | "transfer";

export interface KristTransaction {
  /** The ID of this transaction. */
  id: number;
  /** The sender of this transaction. This may be `null` if the transaction was
   * a block mining reward. */
  from: string;
  /** The recipient of this transaction. This may be `"name"` if the transaction
   * was a name purchase, or `"a"` if it was a name's data change. */
  to: string;
  /** The amount of Krist transferred in this transaction. Can be `0`, notably
   * if the transaction was a name's data change. */
  value: number;
  /** The time this transaction was made, as an ISO-8601 string. */
  time: string;
  /** The name associated with this transaction, without the `.kst` suffix, or
   * `null`. */
  name: string | null;
  /** Transaction metadata, or `null`. */
  metadata: string | null;
  /** The "metaname" (part before the `"@"`) of the recipient of this
   * transaction, if it was sent to a name. */
  sent_metaname: string | null;
  /** The name this transaction was sent to, without the `.kst` suffix, if it
   * was sent to a name. */
  sent_name: string | null;
  /** The inferred type of this transaction. */
  type: KristTransactionType;
}

// =============================================================================
// Miscellaneous
// =============================================================================
export interface KristMotd {
  /** The current server time, as an ISO-8601 string. */
  server_time: string;

  /** The message of the day. */
  motd: string;
  /** The date the MOTD was last changed, as an ISO-8601 string. */
  motd_set: string | null;

  /** @deprecated The Krist API returns this for backwards compatibility. Use
   * the `motd_set` field instead. */
  set: string | null;

  /** The public URL of this Krist node. */
  public_url: string;
  /** If mining is enabled on the server, this will be set to `true`. */
  mining_enabled: boolean;
  /** If the server is running in debug mode, this will be set to `true`. */
  debug_mode: boolean;

  /** The current Krist work (difficulty). */
  work: number;
  /** The last block mined on the Krist node. May be `null`. */
  last_block: KristBlock | null;

  /** Information related to this build of the Krist source code. */
  package: {
    /** The name of the package (always `krist`). */
    name: string;
    /** The version of the Krist server, typically semver. */
    version: string;
    /** The author of the Krist server (always `Lemmmy`). */
    author: string;
    /** The license of the Krist server (always `GPL-3.0`). */
    licence: string;
    /** The repository of the Krist server source code. */
    repository: string;
  };

  /** Constants related to the Krist server configuration. */
  constants: {
    /** The latest version of KristWallet. */
    wallet_version: number;
    /** The maximum size, in bytes, of a block nonce. */
    nonce_max_size: number;
    /** The cost, in KST, of purchasing a new name. */
    name_cost: number;
    /** The minimum work (block difficulty) value. The work will not
     * automatically go below this. */
    min_work: number;
    /** The maximum work (block difficulty) value. The work will not
     * automatically go above this. */
    max_work: number;
    /** Work adjustment rate per block, where 1 means immediate adjustment to
     * target work and 0 means constant work. */
    work_factor: number;
    /** The ideal time between mined blocks. The Krist server will adjust the
     * difficulty to match this value. */
    seconds_per_block: number;
  };

  /** Constants related to the currency that this server represents. */
  currency: {
    /** The character that each address starts with (e.g. `k`). */
    address_prefix: string;
    /** The suffix that each name ends with after the dot (e.g. `kst`). */
    name_suffix: string;

    /** The full long name of this currency (e.g. `Krist`). */
    currency_name: string;
    /** The shorthand symbol for this currency (e.g. `KST`). */
    currency_symbol: string;
  };

  /** Required copyright notice for the Krist server. */
  notice: string;
}

export interface KristBlockValue {
  /** The current block reward, including the unpaid name bonus (calculated as
   * base + unpaid). */
  value: number;
  /** The base block reward. */
  base_value: number;
}

export interface KristWorkDetailed {
  /** The current Krist work (difficulty). */
  work: number;
  /** The current number of unpaid names. */
  unpaid: number;

  /** The base block reward. */
  base_value: number;
  /** The current block reward, including the unpaid name bonus (calculated as
   * base + unpaid). */
  block_value: number;

  /** Information about the next block value decrease. */
  decrease: {
    /** How much Krist the block value will decrease by when the next name(s)
     * expired. */
    value: number;
    /** How many blocks before the next block value decrease. */
    blocks: number;
    /** How many blocks before the block value will completely reset to the base
     * value. */
    reset: number;
  };
}
