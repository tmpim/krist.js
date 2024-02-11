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

import pluginTypescript from "@rollup/plugin-typescript";
import pluginJson from "@rollup/plugin-json";
import pluginDts from "rollup-plugin-dts";
import { nodeResolve as pluginNodeResolve } from "@rollup/plugin-node-resolve";
import pluginNodePolyfills from "rollup-plugin-polyfill-node";
import pluginCommonjs from "@rollup/plugin-commonjs";
import pluginTerser from "@rollup/plugin-terser";
import { visualizer as pluginVisualizer } from "rollup-plugin-visualizer";

export default [
  {
    // Node bundle
    input: "src/node.ts",
    output: {
      dir: "lib",
      format: "es",
      esModule: true,
      name: "krist",
      plugins: [
        pluginTerser(),
      ]
    },
    plugins: [
      pluginNodeResolve({ browser: false }),
      pluginCommonjs({ defaultIsModuleExports: true }),
      pluginTypescript({ tsconfig: "./tsconfig.json" }),
      pluginJson()
    ]
  },
  {
    // Declarations: node.d.ts
    input: "lib/src/node.d.ts",
    output: [{ file: "lib/node.d.ts", format: "es" }],
    plugins: [pluginDts()]
  },
  {
    // Browser bundle
    input: "src/browser.ts",
    output: {
      dir: "lib",
      format: "es",
      esModule: true,
      name: "krist",
      globals: {
        "krist": "krist"
      },
      plugins: [
        pluginTerser(),
      ]
    },
    external: ["ws"],
    plugins: [
      pluginNodePolyfills(),
      pluginCommonjs({ defaultIsModuleExports: true }),
      pluginNodeResolve({ browser: true }),
      pluginTypescript({ sourceMap: true, tsconfig: "./tsconfig.json" }),
      pluginJson(),
      pluginVisualizer({ gzipSize: true })
    ]
  },
  {
    // Declarations: browser.d.ts
    input: "lib/src/browser.d.ts",
    output: [{ file: "lib/browser.d.ts", format: "es" }],
    plugins: [pluginDts()]
  },
];
