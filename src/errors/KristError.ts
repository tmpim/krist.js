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

export class KristError extends Error {
  constructor(
    public error: string,
    public serverMessage?: string,
    public parameter?: string
  ) {
    super(serverMessage ?? error);
  }
}

// Common Krist API errors
export class KristErrorMissingParameter extends KristError {}
export class KristErrorInvalidParameter extends KristError {}
export class KristErrorNotFound extends KristError {}
export class KristErrorAddressNotFound extends KristErrorNotFound {}
export class KristErrorBlockNotFound extends KristErrorNotFound {}
export class KristErrorTransactionNotFound extends KristErrorNotFound {}
export class KristErrorNameNotFound extends KristErrorNotFound {}
export class KristErrorNameTaken extends KristError {}
export class KristErrorNotNameOwner extends KristError {}
export class KristErrorInvalidWebSocketToken extends KristError {}
export class KristErrorAuthFailed extends KristError {}
export class KristErrorServerError extends KristError {}
export class KristErrorRateLimit extends KristError {
  constructor() { super("rate_limit_hit", "Rate limit hit!"); }
}

// Custom errors
export class KristErrorWebSocketStart extends KristError {
  constructor() { super("websocket_start", "Could not start a WebSocket connection!"); }
}

/** Attempts to convert a Krist API error to an instance of KristError. */
export function coerceKristError(e: any): KristError | Error {
  if (e instanceof KristError) return e;

  const { error, message, parameter } = e;
  if (!error || typeof error !== "string") return e;

  switch (error) {
  case "missing_parameter":
    return new KristErrorMissingParameter(error, message, parameter);
  case "invalid_parameter":
    return new KristErrorInvalidParameter(error, message, parameter);
  case "not_found":
    return new KristErrorNotFound(error, message);
  case "address_not_found":
    return new KristErrorAddressNotFound(error, message);
  case "block_not_found":
    return new KristErrorBlockNotFound(error, message);
  case "transaction_not_found":
    return new KristErrorTransactionNotFound(error, message);
  case "name_not_found":
    return new KristErrorNameNotFound(error, message);
  case "name_taken":
    return new KristErrorNameTaken(error, message);
  case "not_name_owner":
    return new KristErrorNotNameOwner(error, message);
  case "rate_limit_hit":
    return new KristErrorRateLimit();
  case "invalid_websocket_token":
    return new KristErrorInvalidWebSocketToken(error, message);
  case "auth_failed":
    return new KristErrorAuthFailed(error, message);
  case "server_error":
    return new KristErrorServerError(error, message);
  }

  return new KristError(message);
}
