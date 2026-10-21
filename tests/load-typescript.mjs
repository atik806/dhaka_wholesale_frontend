import { readFile } from "node:fs/promises";
import ts from "typescript";
import { runInNewContext } from "node:vm";

// Test the actual source with the installed compiler and Node's stable runner.
// These utility modules have no runtime imports; type-only imports are erased.
export async function loadTypeScriptModule(url) {
  const source = await readFile(url, "utf8");
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
  });
  return import(`data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`);
}

export async function loadComponentWithMocks(url, dependencies, globals = {}) {
  const source = await readFile(url, "utf8");
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.CommonJS,
      jsx: ts.JsxEmit.ReactJSX,
      esModuleInterop: true,
    },
  });
  const testModule = { exports: {} };
  runInNewContext(outputText, {
    ...globals,
    module: testModule,
    exports: testModule.exports,
    require(name) {
      if (!(name in dependencies)) throw new Error(`Unmocked component dependency: ${name}`);
      return dependencies[name];
    },
  });
  return testModule.exports;
}
