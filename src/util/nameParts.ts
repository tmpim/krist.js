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

import { memoize, escapeRegExp, toString } from "./internalUtil";

export const BARE_NAME_REGEX = /^([a-z0-9]{1,64})$/;
export const MAX_NAME_LENGTH = 64;
export const isValidName =
  (name: string): boolean => BARE_NAME_REGEX.test(name);

// Cheap way to avoid RegExp DoS
const MAX_NAME_SUFFIX_LENGTH = 6;
const _cleanNameSuffix = (
  nameSuffix: string | undefined | null = "kst"
): string => {
  // Ensure the name suffix is safe to put into a RegExp
  const stringSuffix = toString(nameSuffix);
  const shortSuffix = stringSuffix.substring(0, MAX_NAME_SUFFIX_LENGTH);
  const escaped = escapeRegExp(shortSuffix);
  return escaped;
};
export const cleanNameSuffix = memoize(_cleanNameSuffix);

const _getNameRegex = (
  metadata = false,
  nameSuffix: string | undefined | null = "kst"
): RegExp =>
  new RegExp(
    `^(?:([a-z0-9-_]{1,32})@)?([a-z0-9]{1,64})`
    + `(\\.${cleanNameSuffix(nameSuffix)})${metadata ? ";?" : "$"}`,
    "i"
  );
export const getNameRegex = memoize(_getNameRegex);

export interface KristNameParts {
  metaname?: string;
  name?: string;
  nameSuffix?: string;
  nameWithSuffix?: string;
  recipient?: string;
}

export function getNameParts(
  name: string | undefined,
  nameSuffix: string | undefined | null = "kst"
): KristNameParts | undefined {
  if (!nameSuffix || !name) return;

  const nameMatches = getNameRegex(false, nameSuffix).exec(name);
  if (!nameMatches) return undefined;

  const mMetaname = nameMatches[1] || undefined;
  const mName = nameMatches[2] || undefined;
  const nameWithSuffix = mName ? mName + "." + nameSuffix : undefined;
  const recipient = mMetaname
    ? mMetaname + "@" + nameWithSuffix
    : nameWithSuffix;

  return {
    metaname: mMetaname,
    name: mName,
    nameSuffix,
    nameWithSuffix,
    recipient
  };
}

const _stripNameSuffixRegExp = (
  nameSuffix: string | undefined | null = "kst"
): RegExp =>
  new RegExp(`\\.${cleanNameSuffix(nameSuffix)}$`);
export const stripNameSuffixRegExp = memoize(_stripNameSuffixRegExp);

export const stripNameSuffix = (
  inp: string,
  nameSuffix: string | undefined | null = "kst"
): string =>
  inp.replace(stripNameSuffixRegExp(nameSuffix), "");

export const stripNameFromMetadata = (
  metadata: string,
  nameSuffix: string | undefined | null = "kst"
): string =>
  metadata.replace(getNameRegex(true, nameSuffix), "");
