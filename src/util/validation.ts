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

const MAX_ADDRESS_PREFIX_LENGTH = 1;
const _cleanAddressPrefix = (addressPrefix: string | undefined | null = "k"): string => {
  // This might be slightly cursed when the max prefix length is 1 character,
  // but let's call it future-proofing.
  const stringPrefix = toString(addressPrefix);
  const shortPrefix = stringPrefix.substring(0, MAX_ADDRESS_PREFIX_LENGTH);
  const escaped = escapeRegExp(shortPrefix);
  return escaped;
};
export const cleanKristAddressPrefix = memoize(_cleanAddressPrefix);

// Supports v1 addresses too
const _getAddressRegex = (addressPrefix: string | undefined | null = "k"): RegExp =>
  new RegExp(`^(?:${cleanKristAddressPrefix(addressPrefix)}[a-z0-9]{9}|[a-f0-9]{10})$`);
export const getKristAddressRegex = memoize(_getAddressRegex);

// Only supports v2 addresses
const _getAddressRegexV2 = (addressPrefix: string | undefined | null = "k"): RegExp =>
  new RegExp(`^${cleanKristAddressPrefix(addressPrefix)}[a-z0-9]{9}$`);
export const getKristAddressRegexV2 = memoize(_getAddressRegexV2);

/**
 * Returns whether or not an address is a valid Krist address.
 *
 * @param address - The address to check for validity.
 * @param addressPrefix - The single-character address prefix provided by the
 *   sync node.
 * @param allowV1 - Whether or not the function should validate v1 addresses.
 *   Note that as of February 2021, the Krist server no longer accepts
 *   any kind of transaction to/from a v1 address, so features that are
 *   validating an address for purpose of a transaction (e.g. the address
 *   picker) should NOT set this to true.
 */
export function isValidKristAddress(
  address: string,
  addressPrefix: string | undefined | null = "k",
  allowV1?: boolean
): boolean {
  if (!address) return false;
  return allowV1
    ? getKristAddressRegex(addressPrefix).test(address)
    : getKristAddressRegexV2(addressPrefix).test(address);
}

export const kristV1AddressRegex = /^[a-f0-9]{10}$/;
export const isKristV1Address = (address: string): boolean =>
  kristV1AddressRegex.test(address);
