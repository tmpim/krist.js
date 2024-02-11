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

/**
 * An API response from the Krist server.
 *
 * @typeParam T - The properties specific to this response type.
 */
export type KristApiResponse<T extends Record<string, any>> = T & {
  /** Whether the request succeeded. */
  ok: boolean;
  /** If `ok` is `false`, the error code from the Krist API. */
  error?: string;
  /** If `ok` is `false`, a human-readable error message from the Krist API. */
  message?: string;
  /** If `ok` is `false`, the parameter that caused the error (if available). */
  parameter?: string;
}
