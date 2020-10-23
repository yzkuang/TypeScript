namespace ts {
    describe("unittests:: tsc:: incremental::", () => {
        verifyTscSerializedIncrementalEdits({
            scenario: "incremental",
            subScenario: "when passing filename for buildinfo on commandline",
            fs: () => loadProjectFromFiles({
                "/src/project/src/main.ts": "export const x = 10;",
                "/src/project/tsconfig.json": Utils.dedent`
                    {
                        "compilerOptions": {
                            "target": "es5",
                            "module": "commonjs",
                        },
                        "include": [
                            "src/**/*.ts"
                        ]
                    }`,
            }),
            commandLineArgs: ["--incremental", "--p", "src/project", "--tsBuildInfoFile", "src/project/.tsbuildinfo"],
            incrementalScenarios: noChangeOnlyRuns
        });

        verifyTscSerializedIncrementalEdits({
            scenario: "incremental",
            subScenario: "when passing rootDir from commandline",
            fs: () => loadProjectFromFiles({
                "/src/project/src/main.ts": "export const x = 10;",
                "/src/project/tsconfig.json": Utils.dedent`
                    {
                        "compilerOptions": {
                            "incremental": true,
                            "outDir": "dist",
                        },
                    }`,
            }),
            commandLineArgs: ["--p", "src/project", "--rootDir", "src/project/src"],
            incrementalScenarios: noChangeOnlyRuns
        });

        verifyTscSerializedIncrementalEdits({
            scenario: "incremental",
            subScenario: "with only dts files",
            fs: () => loadProjectFromFiles({
                "/src/project/src/main.d.ts": "export const x = 10;",
                "/src/project/src/another.d.ts": "export const y = 10;",
                "/src/project/tsconfig.json": "{}",
            }),
            commandLineArgs: ["--incremental", "--p", "src/project"],
            incrementalScenarios: [
                noChangeRun,
                {
                    buildKind: BuildKind.IncrementalDtsUnchanged,
                    modifyFs: fs => appendText(fs, "/src/project/src/main.d.ts", "export const xy = 100;")
                }
            ]
        });

        verifyTscSerializedIncrementalEdits({
            scenario: "incremental",
            subScenario: "when passing rootDir is in the tsconfig",
            fs: () => loadProjectFromFiles({
                "/src/project/src/main.ts": "export const x = 10;",
                "/src/project/tsconfig.json": Utils.dedent`
                    {
                        "compilerOptions": {
                            "incremental": true,
                            "outDir": "./built",
                            "rootDir": "./"
                        },
                    }`,
            }),
            commandLineArgs: ["--p", "src/project"],
            incrementalScenarios: noChangeOnlyRuns
        });

        describe("with noEmitOnError", () => {
            let projFs: vfs.FileSystem;
            before(() => {
                projFs = loadProjectFromDisk("tests/projects/noEmitOnError");
            });
            after(() => {
                projFs = undefined!;
            });

            function verifyNoEmitOnError(subScenario: string, fixModifyFs: TscIncremental["modifyFs"], modifyFs?: TscIncremental["modifyFs"]) {
                verifyTscSerializedIncrementalEdits({
                    scenario: "incremental",
                    subScenario,
                    fs: () => projFs,
                    commandLineArgs: ["--incremental", "-p", "src"],
                    modifyFs,
                    incrementalScenarios: [
                        noChangeRun,
                        {
                            buildKind: BuildKind.IncrementalDtsUnchanged,
                            modifyFs: fixModifyFs
                        },
                        noChangeRun,
                    ],
                    baselinePrograms: true
                });
            }
            verifyNoEmitOnError(
                "with noEmitOnError syntax errors",
                fs => fs.writeFileSync("/src/src/main.ts", `import { A } from "../shared/types/db";
const a = {
    lastName: 'sdsd'
};`, "utf-8")
            );

            verifyNoEmitOnError(
                "with noEmitOnError semantic errors",
                fs => fs.writeFileSync("/src/src/main.ts", `import { A } from "../shared/types/db";
const a: string = "hello";`, "utf-8"),
                fs => fs.writeFileSync("/src/src/main.ts", `import { A } from "../shared/types/db";
const a: string = 10;`, "utf-8"),
            );
        });

        describe("when noEmit changes between compilation", () => {
            verifyNoEmitChanges({ incremental: true });
            verifyNoEmitChanges({ incremental: true, declaration: true });
            verifyNoEmitChanges({ composite: true });

            function verifyNoEmitChanges(compilerOptions: CompilerOptions) {
                const noChangeRunWithNoEmit: TscIncremental = {
                    subScenario: "No Change run with noEmit",
                    commandLineArgs: ["--p", "src/project", "--noEmit"],
                    ...noChangeRun,
                };
                const noChangeRunWithEmit: TscIncremental = {
                    subScenario: "No Change run with emit",
                    commandLineArgs: ["--p", "src/project"],
                    ...noChangeRun,
                };
                let optionsString = "";
                for (const key in compilerOptions) {
                    if (hasProperty(compilerOptions, key)) {
                        optionsString += ` ${key}`;
                    }
                }

                verifyTscSerializedIncrementalEdits({
                    scenario: "incremental",
                    subScenario: `noEmit changes${optionsString}`,
                    commandLineArgs: ["--p", "src/project"],
                    fs,
                    incrementalScenarios: [
                        noChangeRunWithNoEmit,
                        noChangeRunWithNoEmit,
                        {
                            subScenario: "Introduce error but still noEmit",
                            commandLineArgs: ["--p", "src/project", "--noEmit"],
                            modifyFs: fs => replaceText(fs, "/src/project/src/class.ts", "prop", "prop1"),
                            buildKind: BuildKind.IncrementalDtsChange
                        },
                        {
                            subScenario: "Fix error and emit",
                            modifyFs: fs => replaceText(fs, "/src/project/src/class.ts", "prop1", "prop"),
                            buildKind: BuildKind.IncrementalDtsChange
                        },
                        noChangeRunWithEmit,
                        noChangeRunWithNoEmit,
                        noChangeRunWithNoEmit,
                        noChangeRunWithEmit,
                        {
                            subScenario: "Introduce error and emit",
                            modifyFs: fs => replaceText(fs, "/src/project/src/class.ts", "prop", "prop1"),
                            buildKind: BuildKind.IncrementalDtsChange
                        },
                        noChangeRunWithEmit,
                        noChangeRunWithNoEmit,
                        noChangeRunWithNoEmit,
                        noChangeRunWithEmit,
                        {
                            subScenario: "Fix error and no emit",
                            commandLineArgs: ["--p", "src/project", "--noEmit"],
                            modifyFs: fs => replaceText(fs, "/src/project/src/class.ts", "prop1", "prop"),
                            buildKind: BuildKind.IncrementalDtsChange
                        },
                        noChangeRunWithEmit,
                        noChangeRunWithNoEmit,
                        noChangeRunWithNoEmit,
                        noChangeRunWithEmit,
                    ],
                });

                verifyTscSerializedIncrementalEdits({
                    scenario: "incremental",
                    subScenario: `noEmit changes with initial noEmit${optionsString}`,
                    commandLineArgs: ["--p", "src/project", "--noEmit"],
                    fs,
                    incrementalScenarios: [
                        noChangeRunWithEmit,
                        {
                            subScenario: "Introduce error with emit",
                            commandLineArgs: ["--p", "src/project"],
                            modifyFs: fs => replaceText(fs, "/src/project/src/class.ts", "prop", "prop1"),
                            buildKind: BuildKind.IncrementalDtsChange
                        },
                        {
                            subScenario: "Fix error and no emit",
                            modifyFs: fs => replaceText(fs, "/src/project/src/class.ts", "prop1", "prop"),
                            buildKind: BuildKind.IncrementalDtsChange
                        },
                        noChangeRunWithEmit,
                    ],
                });

                function fs() {
                    return loadProjectFromFiles({
                        "/src/project/src/class.ts": Utils.dedent`
                            export class classC {
                                prop = 1;
                            }`,
                        "/src/project/src/indirectClass.ts": Utils.dedent`
                            import { classC } from './class';
                            export class indirectClass {
                                classC = new classC();
                            }`,
                        "/src/project/src/directUse.ts": Utils.dedent`
                            import { indirectClass } from './indirectClass';
                            new indirectClass().classC.prop;`,
                        "/src/project/src/indirectUse.ts": Utils.dedent`
                            import { indirectClass } from './indirectClass';
                            new indirectClass().classC.prop;`,
                        "/src/project/src/noChangeFile.ts": Utils.dedent`
                            export function writeLog(s: string) {
                            }`,
                        "/src/project/src/noChangeFileWithEmitSpecificError.ts": Utils.dedent`
                            function someFunc(arguments: boolean, ...rest: any[]) {
                            }`,
                        "/src/project/tsconfig.json": JSON.stringify({ compilerOptions }),
                    });
                }
            }
        });

        verifyTscSerializedIncrementalEdits({
            scenario: "incremental",
            subScenario: "assumeChangesAffectShape",
            fs: () => loadProjectFromFiles({
                "/src/project/main.ts": `import { foo } from "./module";foo();`,
                "/src/project/module.ts": `export function foo(): string { return "hello"; }`,
                "/src/project/extraFile.ts": "export const extra = 10;",
                "/src/project/tsconfig.json": JSON.stringify({
                    compilerOptions: { assumeChangesAffectShape: true }
                })
            }),
            commandLineArgs: ["--incremental", "--p", "src/project"],
            incrementalScenarios: [
                {
                    subScenario: "Local edit to module",
                    modifyFs: fs => replaceText(fs, "/src/project/module.ts", "hello", "hello world"),
                    buildKind: BuildKind.IncrementalDtsUnchanged
                },
                {
                    subScenario: "Api change edit to module",
                    modifyFs: fs => prependText(fs, "/src/project/module.ts", "export const x = 10;"),
                    buildKind: BuildKind.IncrementalDtsUnchanged
                },
            ]
        });

    });
}
