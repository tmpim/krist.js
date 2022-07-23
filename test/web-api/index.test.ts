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

import { KristApi } from "../../src/node";

describe("web api - constructor", () => {
  describe("validates arguments", () => {
    it("throws with an empty sync node", () =>
      expect(() => new KristApi({ syncNode: "" })).to.throw);
    it("throws with a non-string sync node", () =>
      expect(() => new (KristApi as any)({ syncNode: 5 })).to.throw);
    it("throws with an empty user agent", () =>
      expect(() => new KristApi({ userAgent: "" })).to.throw);
  });
});

describe("web api - request", () => {
  const api = new KristApi();

  describe("validates arguments", () => {
    it("rejects with no arguments", async () =>
      expect((api.request as any)()).to.eventually.be.rejected);
    it("rejects with an empty method", async () =>
      expect((api.request as any)("")).to.eventually.be.rejected);
    it("rejects with an empty endpoint", async () =>
      expect((api.request as any)("GET", "")).to.eventually.be.rejected);
  });

  it("makes a request", async () => {
    const data = await api.request("GET", "/motd");
    expect(data).to.be.an("object");
  });
});
