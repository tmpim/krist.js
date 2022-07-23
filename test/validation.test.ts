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

import { expect } from "chai";

import { isKristV1Address, isValidKristAddress } from "../src/node";

describe("isValidKristAddress", () => {
  it("returns false with no address", () => expect((isValidKristAddress as any)()).to.be.false);
  it("returns false with empty address", () => expect(isValidKristAddress("")).to.be.false);
  it("returns false with short address", () => expect(isValidKristAddress("k12345678")).to.be.false);
  it("returns false with different address prefix", () => expect(isValidKristAddress("t123456789")).to.be.false);
  it("returns false with v1 addresses", () => expect(isValidKristAddress("a5dfb396d3")).to.be.false);

  it("returns true with a valid address", () => expect(isValidKristAddress("k8juvewcui")).to.be.true);
  it("returns true with a valid address with custom prefix", () => expect(isValidKristAddress("t8juvewcui", "t")).to.be.true);
  it("returns true with allowV1", () => expect(isValidKristAddress("a5dfb396d3", undefined, true)).to.be.true);
});

describe("isKristV1Address", () => {
  it("returns false with no address", () => expect((isKristV1Address as any)()).to.be.false);
  it("returns false with empty address", () => expect(isKristV1Address("")).to.be.false);
  it("returns false with short address", () => expect(isKristV1Address("a5dfb396d")).to.be.false);
  it("returns false for v2 addresses", () => expect(isKristV1Address("k8juvewcui")).to.be.false);

  it("returns true for v1 addresses", () => expect(isKristV1Address("a5dfb396d3")).to.be.true);
});
