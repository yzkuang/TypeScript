namespace ts.tscWatch {
    describe("unittests:: tsc-watch:: persistResolutions", () => {
        verifyTscWatchPersistentResolutions("--p");
        verifyTscWatchPersistentResolutions("--p", "outFile.js");
    });
}