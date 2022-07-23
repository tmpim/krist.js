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

import { getNameParts } from "./nameParts";

/**
 * Container interface for parsed CommonMeta data.
 *
 * @see https://docs.krist.dev/docs/commonmeta.html
 */
export interface CommonMeta {
  /**
   * For a transaction sent to a name, the "metaname" of the transaction
   * recipient (`foo` in `foo@bar.kst`).
   */
  metaname?: string;

  /**
   * For a transaction sent to a name, the name of the transaction recipient
   * (`bar.kst` in `foo@bar.kst`). The name suffix will be included.
   *
   * @see https://docs.krist.dev/docs/commonmeta.html
   */
  name?: string;

  /**
   * For a transaction sent to a name, the full recipient of the transaction
   * (e.g. `foo@bar.kst`). The name suffix will be included.
   *
   * The recipient is the part of the transaction meta before the first
   * semicolon (`;`). When attempting to send a transaction to a name such as
   * `bar.kst` or `foo@bar.kst`, the Krist server will automatically prepend
   * this whole name to the transaction meta, separating it from the original
   * meta with a semicolon if it existed.
   *
   * @see https://docs.krist.dev/docs/commonmeta.html
   */
  recipient?: string;

  /**
   * The whole `return` CommonMeta field if it was supplied (e.g.
   * `foo@bar.kst`).
   *
   * @see https://docs.krist.dev/docs/commonmeta.html
   */
  return?: string;

  /**
   * If the `return` CommonMeta field was supplied, the "metaname" of the
   * transaction sender (`foo` in `foo@bar.kst`).
   */
  returnMetaname?: string;

  /**
   * If the `return` CommonMeta field was supplied, the name of the transaction
   * sender (`bar.kst` in `foo@bar.kst`). The name suffix will be included.
   */
  returnName?: string;

  /**
   * If the `return` CommonMeta field was supplied, and was a valid Krist name
   * or metaname, the full sender of the transaction (e.g. `foo@bar.kst`). The
   * name suffix will be included.
   */
  returnRecipient?: string;

  /**
   * All the parsed CommonMeta fields, as
   * `{ "key1": "value", "key2": "value"... }`.
   *
   * @see https://docs.krist.dev/docs/commonmeta.html
   */
  custom: Record<string, string>;
}

/**
 * Parse [CommonMeta](https://docs.krist.dev/docs/commonmeta.html) data from a
 * transaction meta string. The parser will extract all `key=value` fields from
 * the string and add them to the `custom` map.
 *
 * If a transaction recipient is available (prepended to the meta string before
 * the semicolon), the `recipient` field will be set. If it matches a valid
 * Krist name or metaname (e.g. `bar.kst` or `foo@bar.kst`), `name` and
 * `metaname` will be set respectively.
 *
 * If a transaction sender is available via the standard `return=` field, the
 * `return` field will be set. Similarly to the recipient, if it matches a valid
 * Krist name or metaname, `returnRecipient`, `returnName` and `returnMetaname`
 * will be set.
 *
 * @see https://docs.krist.dev/docs/commonmeta.html
 * @see {@link CommonMeta}
 *
 * @param metadata - The full transaction metadata to parse.
 * @param nameSuffix - The name suffix to use when parsing the name, without the
 *   dot. Defaults to `kst`.
 * @returns The parsed CommonMeta data, or null if `metadata` is null or no data
 *   could be parsed.
 */
export function parseCommonMeta(
  metadata: string | undefined | null,
  nameSuffix: string | undefined | null = "kst"
): CommonMeta | null {
  if (!metadata) return null;

  const custom: Record<string, string> = {};
  const out: CommonMeta = { custom };

  const metaParts = metadata.split(";");
  if (metaParts.length <= 0) return null;

  const nameParts = getNameParts(metaParts[0], nameSuffix);
  if (nameParts) {
    out.metaname = nameParts.metaname;
    out.name = nameParts.nameWithSuffix;

    out.recipient = nameParts.metaname
      ? nameParts.metaname + "@" + nameParts.nameWithSuffix
      : nameParts.nameWithSuffix;
  }

  for (let i = 0; i < metaParts.length; i++) {
    const metaPart = metaParts[i];
    const kv = metaPart.split("=", 2);

    if (i === 0 && nameParts) continue;

    if (kv.length === 1) {
      custom[i.toString()] = kv[0];
    } else {
      custom[kv[0]] = kv.slice(1).join("=");
    }
  }

  const rawReturn = out.return = custom.return;
  if (rawReturn) {
    const returnParts = getNameParts(rawReturn, nameSuffix);
    if (returnParts) {
      out.returnMetaname = returnParts.metaname;
      out.returnName = returnParts.nameWithSuffix;

      out.returnRecipient = returnParts.metaname
        ? returnParts.metaname + "@" + returnParts.nameWithSuffix
        : returnParts.nameWithSuffix;
    }
  }

  return out;
}
