Input::
//// [/lib/lib.d.ts]
/// <reference no-default-lib="true"/>
interface Boolean {}
interface Function {}
interface CallableFunction {}
interface NewableFunction {}
interface IArguments {}
interface Number { toExponential: any; }
interface Object {}
interface RegExp {}
interface String { charAt: any; }
interface Array<T> { length: number; [n: number]: T; }
interface ReadonlyArray<T> {}
declare const console: { log(msg: any): void; };

//// [/src/project/extraFile.ts]
export const extra = 10;

//// [/src/project/main.ts]
import { foo } from "./module";foo();

//// [/src/project/module.ts]
export function foo(): string { return "hello"; }

//// [/src/project/tsconfig.json]
{"compilerOptions":{"assumeChangesAffectShape":true}}



Output::
/lib/tsc --incremental --p src/project
exitCode:: ExitStatus.Success


//// [/src/project/extraFile.js]
"use strict";
exports.__esModule = true;
exports.extra = void 0;
exports.extra = 10;


//// [/src/project/main.js]
"use strict";
exports.__esModule = true;
var module_1 = require("./module");
module_1.foo();


//// [/src/project/module.js]
"use strict";
exports.__esModule = true;
exports.foo = void 0;
function foo() { return "hello"; }
exports.foo = foo;


//// [/src/project/tsconfig.tsbuildinfo]
{
  "program": {
    "fileInfos": {
      "../../lib/lib.d.ts": {
        "version": "3858781397-/// <reference no-default-lib=\"true\"/>\ninterface Boolean {}\ninterface Function {}\ninterface CallableFunction {}\ninterface NewableFunction {}\ninterface IArguments {}\ninterface Number { toExponential: any; }\ninterface Object {}\ninterface RegExp {}\ninterface String { charAt: any; }\ninterface Array<T> { length: number; [n: number]: T; }\ninterface ReadonlyArray<T> {}\ndeclare const console: { log(msg: any): void; };",
        "signature": "3858781397-/// <reference no-default-lib=\"true\"/>\ninterface Boolean {}\ninterface Function {}\ninterface CallableFunction {}\ninterface NewableFunction {}\ninterface IArguments {}\ninterface Number { toExponential: any; }\ninterface Object {}\ninterface RegExp {}\ninterface String { charAt: any; }\ninterface Array<T> { length: number; [n: number]: T; }\ninterface ReadonlyArray<T> {}\ndeclare const console: { log(msg: any): void; };",
        "affectsGlobalScope": true
      },
      "./extrafile.ts": {
        "version": "-13403012629-export const extra = 10;",
        "signature": "-4859189518-export declare const extra = 10;\r\n",
        "affectsGlobalScope": false
      },
      "./module.ts": {
        "version": "-8446458946-export function foo(): string { return \"hello\"; }",
        "signature": "-8035635627-export declare function foo(): string;\r\n",
        "affectsGlobalScope": false
      },
      "./main.ts": {
        "version": "-7083766686-import { foo } from \"./module\";foo();",
        "signature": "-4882119183-export {};\r\n",
        "affectsGlobalScope": false
      }
    },
    "options": {
      "assumeChangesAffectShape": true,
      "incremental": true,
      "project": "./",
      "configFilePath": "./tsconfig.json"
    },
    "referencedMap": {
      "./main.ts": [
        "./module.ts"
      ]
    },
    "exportedModulesMap": {},
    "semanticDiagnosticsPerFile": [
      "../../lib/lib.d.ts",
      "./extrafile.ts",
      "./main.ts",
      "./module.ts"
    ]
  },
  "version": "FakeTSVersion"
}



Change:: Local edit to module
Input::
//// [/src/project/module.ts]
export function foo(): string { return "hello world"; }



Output::
/lib/tsc --incremental --p src/project
exitCode:: ExitStatus.Success


//// [/src/project/module.js]
"use strict";
exports.__esModule = true;
exports.foo = void 0;
function foo() { return "hello world"; }
exports.foo = foo;


//// [/src/project/tsconfig.tsbuildinfo]
{
  "program": {
    "fileInfos": {
      "../../lib/lib.d.ts": {
        "version": "3858781397-/// <reference no-default-lib=\"true\"/>\ninterface Boolean {}\ninterface Function {}\ninterface CallableFunction {}\ninterface NewableFunction {}\ninterface IArguments {}\ninterface Number { toExponential: any; }\ninterface Object {}\ninterface RegExp {}\ninterface String { charAt: any; }\ninterface Array<T> { length: number; [n: number]: T; }\ninterface ReadonlyArray<T> {}\ndeclare const console: { log(msg: any): void; };",
        "signature": "3858781397-/// <reference no-default-lib=\"true\"/>\ninterface Boolean {}\ninterface Function {}\ninterface CallableFunction {}\ninterface NewableFunction {}\ninterface IArguments {}\ninterface Number { toExponential: any; }\ninterface Object {}\ninterface RegExp {}\ninterface String { charAt: any; }\ninterface Array<T> { length: number; [n: number]: T; }\ninterface ReadonlyArray<T> {}\ndeclare const console: { log(msg: any): void; };",
        "affectsGlobalScope": true
      },
      "./extrafile.ts": {
        "version": "-13403012629-export const extra = 10;",
        "signature": "-4859189518-export declare const extra = 10;\r\n",
        "affectsGlobalScope": false
      },
      "./module.ts": {
        "version": "-4300970970-export function foo(): string { return \"hello world\"; }",
        "signature": "-8035635627-export declare function foo(): string;\r\n",
        "affectsGlobalScope": false
      },
      "./main.ts": {
        "version": "-7083766686-import { foo } from \"./module\";foo();",
        "signature": "-4882119183-export {};\r\n",
        "affectsGlobalScope": false
      }
    },
    "options": {
      "assumeChangesAffectShape": true,
      "incremental": true,
      "project": "./",
      "configFilePath": "./tsconfig.json"
    },
    "referencedMap": {
      "./main.ts": [
        "./module.ts"
      ]
    },
    "exportedModulesMap": {},
    "semanticDiagnosticsPerFile": [
      "../../lib/lib.d.ts",
      "./extrafile.ts",
      "./main.ts",
      "./module.ts"
    ]
  },
  "version": "FakeTSVersion"
}



Change:: Api change edit to module
Input::
//// [/src/project/module.ts]
export const x = 10;export function foo(): string { return "hello world"; }



Output::
/lib/tsc --incremental --p src/project
exitCode:: ExitStatus.Success


//// [/src/project/main.js] file written with same contents
//// [/src/project/module.js]
"use strict";
exports.__esModule = true;
exports.foo = exports.x = void 0;
exports.x = 10;
function foo() { return "hello world"; }
exports.foo = foo;


//// [/src/project/tsconfig.tsbuildinfo]
{
  "program": {
    "fileInfos": {
      "../../lib/lib.d.ts": {
        "version": "3858781397-/// <reference no-default-lib=\"true\"/>\ninterface Boolean {}\ninterface Function {}\ninterface CallableFunction {}\ninterface NewableFunction {}\ninterface IArguments {}\ninterface Number { toExponential: any; }\ninterface Object {}\ninterface RegExp {}\ninterface String { charAt: any; }\ninterface Array<T> { length: number; [n: number]: T; }\ninterface ReadonlyArray<T> {}\ndeclare const console: { log(msg: any): void; };",
        "signature": "3858781397-/// <reference no-default-lib=\"true\"/>\ninterface Boolean {}\ninterface Function {}\ninterface CallableFunction {}\ninterface NewableFunction {}\ninterface IArguments {}\ninterface Number { toExponential: any; }\ninterface Object {}\ninterface RegExp {}\ninterface String { charAt: any; }\ninterface Array<T> { length: number; [n: number]: T; }\ninterface ReadonlyArray<T> {}\ndeclare const console: { log(msg: any): void; };",
        "affectsGlobalScope": true
      },
      "./extrafile.ts": {
        "version": "-13403012629-export const extra = 10;",
        "signature": "-4859189518-export declare const extra = 10;\r\n",
        "affectsGlobalScope": false
      },
      "./module.ts": {
        "version": "-1237933216-export const x = 10;export function foo(): string { return \"hello world\"; }",
        "signature": "1387636182-export declare const x = 10;\r\nexport declare function foo(): string;\r\n",
        "affectsGlobalScope": false
      },
      "./main.ts": {
        "version": "-7083766686-import { foo } from \"./module\";foo();",
        "signature": "-4882119183-export {};\r\n",
        "affectsGlobalScope": false
      }
    },
    "options": {
      "assumeChangesAffectShape": true,
      "incremental": true,
      "project": "./",
      "configFilePath": "./tsconfig.json"
    },
    "referencedMap": {
      "./main.ts": [
        "./module.ts"
      ]
    },
    "exportedModulesMap": {},
    "semanticDiagnosticsPerFile": [
      "../../lib/lib.d.ts",
      "./extrafile.ts",
      "./main.ts",
      "./module.ts"
    ]
  },
  "version": "FakeTSVersion"
}

