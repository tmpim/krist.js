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

import { expect } from "chai";

import { createHash } from "crypto";

import { applyWalletFormat, calculateAddress, formatNeedsUsername, makeV2Address } from "../src/node.js";

const sha512 = async (inp: string) =>
  createHash("sha512").update(inp).digest("hex");

describe("calculateAddress", () => {
  describe("validates arguments", () => {
    it("rejects with no arguments", async () =>
      expect((calculateAddress as any)()).to.be.rejected);
    it("rejects with an empty password", async () =>
      expect((calculateAddress as any)("")).to.be.rejected);
    it("rejects non-string passwords", async () =>
      expect((calculateAddress as any)(5)).to.be.rejected);
    it("rejects with an empty username", async () =>
      expect((calculateAddress as any)("a", "")).to.be.rejected);
    it("rejects non-string username", async () =>
      expect((calculateAddress as any)("a", 5)).to.be.rejected);
    it("rejects with an empty format", async () =>
      expect((applyWalletFormat as any)("a", undefined, "")).to.be.rejected);
    it("rejects with an invalid format", async () =>
      expect((applyWalletFormat as any)("a", undefined, "not-exist")).to.be.rejected);
    it("rejects non-string empty address prefixes", async () =>
      expect((calculateAddress as any)("a", undefined, undefined, "")).to.be.rejected);
    it("rejects non-string address prefixes", async () =>
      expect((calculateAddress as any)("a", undefined, undefined, 5)).to.be.rejected);
    it("rejects with a non-function sha256", async () =>
      expect((calculateAddress as any)("a", undefined, undefined, undefined, "")).to.be.rejected);
  });

  it("generates a valid kristwallet address", async () =>
    expect(calculateAddress("a")).to.eventually
      .deep.equal(["kxxk8invlf", "9c61cce6bae9ac864b60238532ac8ce1a73006d943b44e060259e50363f4aebd-000"]));

  it("generates a valid api address", async () =>
    expect(calculateAddress("a", undefined, "api")).to.eventually
      .deep.equal(["k8juvewcui", "a"]));

  it("allows address prefixes", async () =>
    expect(calculateAddress("a", undefined, undefined, "t")).to.eventually
      .deep.equal(["txxk8invlf", "9c61cce6bae9ac864b60238532ac8ce1a73006d943b44e060259e50363f4aebd-000"]));

  it("allows for a custom sha256 impl", async () =>
    expect(calculateAddress("a", undefined, undefined, undefined, sha512)).to.eventually
      .deep.equal(["ktwbide1ca", "69a4645bf85e3019276b11f89b40d1e4671d9a78871b7b63d34acdd17ffbb5e1db3780cd46530ea594e7a9e0b69b15c6f5279fe78a2596e29523ec0f9bc4eebe-000"]));
});

describe("makeV2Address", () => {
  describe("validates arguments", () => {
    it("rejects with no arguments", async () =>
      expect((makeV2Address as any)()).to.be.rejected);
    it("rejects with an empty key", async () =>
      expect((makeV2Address as any)("")).to.be.rejected);
    it("rejects non-string keys", async () =>
      expect((makeV2Address as any)(5)).to.be.rejected);
    it("rejects non-string empty address prefixes", async () =>
      expect((makeV2Address as any)("a", "")).to.be.rejected);
    it("rejects non-string address prefixes", async () =>
      expect((makeV2Address as any)("a", 5)).to.be.rejected);
    it("rejects with a non-function sha256", async () =>
      expect((makeV2Address as any)("a", undefined, "")).to.be.rejected);
  });

  it("generates a valid address", async () =>
    expect(makeV2Address("a")).to.eventually.equal("k8juvewcui"));

  it("allows address prefixes", async () =>
    expect(makeV2Address("a", "t")).to.eventually.equal("t8juvewcui"));

  it("allows for a custom sha256 impl", async () =>
    expect(makeV2Address("a", undefined, sha512)).to.eventually
      .equal("ke4l2o0x0l"));
});

describe("applyWalletFormat", () => {
  describe("validates arguments", () => {
    it("rejects with no arguments", async () =>
      expect((applyWalletFormat as any)()).to.be.rejected);
    it("rejects with an empty format", async () =>
      expect((applyWalletFormat as any)("")).to.be.rejected);
    it("rejects with an invalid format", async () =>
      expect((applyWalletFormat as any)("not-exist")).to.be.rejected);
    it("rejects with an empty password", async () =>
      expect((applyWalletFormat as any)("kristwallet", "")).to.be.rejected);
    it("rejects with an empty username", async () =>
      expect((applyWalletFormat as any)("kristwallet", "a", "")).to.be.rejected);
    it("rejects with a non-function sha256", async () =>
      expect((applyWalletFormat as any)("kristwallet", "a", "", "")).to.be.rejected);
  });

  it("generates a valid kristwallet password", async () =>
    expect(applyWalletFormat("kristwallet", "a")).to.eventually
      .equal("9c61cce6bae9ac864b60238532ac8ce1a73006d943b44e060259e50363f4aebd-000"));

  it("generates a valid kristwallet_username_appendhashes password", async () =>
    expect(applyWalletFormat("kristwallet_username_appendhashes", "b", "a")).to.eventually
      .equal("af7aa6a8186ff93e821048f9eb732de78452d86b6446791370cfd6edfb9e7107-000"));

  it("generates a valid kristwallet_username password", async () =>
    expect(applyWalletFormat("kristwallet_username", "b", "a")).to.eventually
      .equal("e95dbeed8b184533cd8cb81d5993f5e75b0aafd9c76baeab464d3e33f526fd7e"));

  it("generates a valid jwalelset password", async () =>
    expect(applyWalletFormat("jwalelset", "a")).to.eventually
      .equal("d25145544c0c89c7b3e2669ebbb2e73d4eade29a265abf98e1c0e1c64f3356f9"));

  it("returns the same password for the 'api' format", async () =>
    expect(applyWalletFormat("api", "a")).to.eventually.equal("a"));

  it("allows for a custom sha256 impl", async () =>
    expect(applyWalletFormat("kristwallet", "a", undefined, sha512)).to.eventually
      .equal("69a4645bf85e3019276b11f89b40d1e4671d9a78871b7b63d34acdd17ffbb5e1db3780cd46530ea594e7a9e0b69b15c6f5279fe78a2596e29523ec0f9bc4eebe-000"));
});

describe("formatNeedsUsername", () => {
  describe("validates arguments", () => {
    it("rejects with no arguments", () =>
      expect(() => (applyWalletFormat as any)()).to.throw);
    it("rejects with an empty format", () =>
      expect(() => (applyWalletFormat as any)("")).to.throw);
    it("rejects with an invalid format", () =>
      expect(() => (applyWalletFormat as any)("not-exist")).to.throw);
  });

  it("returns false for kristwallet", () =>
    expect(formatNeedsUsername("kristwallet")).to.be.false);
  it("returns true for kristwallet_username_appendhashes", () =>
    expect(formatNeedsUsername("kristwallet_username_appendhashes")).to.be.true);
  it("returns true for kristwallet_username", () =>
    expect(formatNeedsUsername("kristwallet_username")).to.be.true);
  it("returns false for jwalelset", () =>
    expect(formatNeedsUsername("jwalelset")).to.be.false);
  it("returns false for api", () =>
    expect(formatNeedsUsername("api")).to.be.false);
});
