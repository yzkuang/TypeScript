namespace ts {
    export function verifyTscPersistsResolutions(input: "--p" | "--b", outFile?: string) {
        verifyTscSerializedIncrementalEdits({
            scenario: "persistResolutions",
            subScenario: `saves resolution and uses it for new program${outFile ? " with outFile" : ""}`,
            fs: () => loadProjectFromFiles({
                "/src/project/src/main.ts": Utils.dedent`
                    import { something } from "./filePresent";
                    import { something as something1 } from "./filePresent";
                    import { something2 } from "./fileNotFound";`,
                "/src/project/src/anotherFileReusingResolution.ts": Utils.dedent`
                    import { something } from "./filePresent";
                    import { something2 } from "./fileNotFound";`,
                "/src/project/src/filePresent.ts": `export function something() { return 10; }`,
                "/src/project/tsconfig.json": JSON.stringify({
                    compilerOptions: {
                        module: "amd",
                        composite: true,
                        persistResolutions: true,
                        traceResolution: true,
                        outFile
                    },
                    include: ["src/**/*.ts"]
                }),
            }),
            commandLineArgs: [input, "src/project"],
            incrementalScenarios: [
                noChangeRun,
                {
                    subScenario: "Modify main file",
                    buildKind: BuildKind.IncrementalDtsChange,
                    modifyFs: fs => appendText(fs, `/src/project/src/main.ts`, `something();`),
                },
                {
                    subScenario: "Add new module and update main file",
                    buildKind: BuildKind.IncrementalDtsChange,
                    modifyFs: fs => {
                        fs.writeFileSync(`/src/project/src/newFile.ts`, "export function foo() { return 20; }");
                        prependText(fs, `/src/project/src/main.ts`, `import { foo } from "./newFile";`);
                    },
                },
                {
                    subScenario: "Write file that could not be resolved",
                    buildKind: BuildKind.IncrementalDtsChange,
                    modifyFs: fs => fs.writeFileSync(`/src/project/src/fileNotFound.ts`, "export function something2() { return 20; }"),
                    cleanBuildDescripencies: () => {
                        const result = new Map<string, CleanBuildDescripency>();
                        // when doing clean build, fileNotFound.ts would be resolved so the output order in outFile.js would change
                        // In build mode the out is generated only when there are no errors
                        const isBuild = input === "--b";
                        if (outFile) {
                            const descripency = isBuild ? CleanBuildDescripency.CleanFilePresent : CleanBuildDescripency.CleanFileTextDifferent;
                            result.set("/src/project/outFile.tsbuildinfo", CleanBuildDescripency.CleanFileTextDifferent);
                            result.set("/src/project/outFile.js", descripency);
                            result.set("/src/project/outFile.d.ts", descripency);
                            result.set("/src/project/outFile.tsbuildinfo.baseline.txt", descripency);
                        }
                        else if (isBuild) {
                            // Outputs are generated, buildinfo is updated to report no errors
                            result.set(`/src/project/src/filePresent.js`, CleanBuildDescripency.CleanFilePresent);
                            result.set(`/src/project/src/filePresent.d.ts`, CleanBuildDescripency.CleanFilePresent);
                            result.set(`/src/project/src/fileNotFound.js`, CleanBuildDescripency.CleanFilePresent);
                            result.set(`/src/project/src/fileNotFound.d.ts`, CleanBuildDescripency.CleanFilePresent);
                            result.set(`/src/project/src/anotherFileReusingResolution.js`, CleanBuildDescripency.CleanFilePresent);
                            result.set(`/src/project/src/anotherFileReusingResolution.d.ts`, CleanBuildDescripency.CleanFilePresent);
                            result.set(`/src/project/src/main.js`, CleanBuildDescripency.CleanFilePresent);
                            result.set(`/src/project/src/main.d.ts`, CleanBuildDescripency.CleanFilePresent);
                            result.set(`/src/project/src/newFile.js`, CleanBuildDescripency.CleanFilePresent);
                            result.set(`/src/project/src/newFile.d.ts`, CleanBuildDescripency.CleanFilePresent);
                            result.set(`/src/project/tsconfig.tsbuildinfo`, CleanBuildDescripency.CleanFileTextDifferent);
                        }
                        else {
                            result.set(`/src/project/tsconfig.tsbuildinfo`, CleanBuildDescripency.CleanFileTextDifferent);
                        }
                        return result;
                    },
                },
                {
                    subScenario: "Clean resolutions",
                    buildKind: BuildKind.IncrementalDtsChange,
                    modifyFs: noop,
                    commandLineArgs: [input, "src/project", "--cleanPersistedProgram"]
                },
                {
                    subScenario: "Clean resolutions again",
                    buildKind: BuildKind.IncrementalDtsChange,
                    modifyFs: noop,
                    commandLineArgs: [input, "src/project", "--cleanPersistedProgram"]
                },
                noChangeRun,
                {
                    subScenario: "Modify main file",
                    buildKind: BuildKind.IncrementalDtsChange,
                    modifyFs: fs => appendText(fs, `/src/project/src/main.ts`, `something();`),
                },
            ],
            baselinePrograms: true,
        });
    }

    describe("unittests:: tsbuild:: persistResolutions::", () => {
        verifyTscPersistsResolutions("--b");
        verifyTscPersistsResolutions("--b", "outFile.js");
    });
}