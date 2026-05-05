import { describe, expect, it } from "vitest";

import type { ToolPackConfig } from "../src/config.js";
import { buildMacPackagedConfig } from "../src/mac.js";

function makeConfig(): ToolPackConfig {
  return {
    containerized: false,
    electronBuilderCliPath: "/x/electron-builder/cli.js",
    electronDistPath: "/x/electron/dist",
    electronVersion: "41.3.0",
    macCompression: "normal",
    namespace: "default",
    platform: "mac",
    portable: false,
    removeData: false,
    removeLogs: false,
    removeProductUserData: false,
    removeSidecars: false,
    roots: {
      output: {
        appBuilderRoot: "/work/.tmp/tools-pack/out/mac/namespaces/default/builder",
        namespaceRoot: "/work/.tmp/tools-pack/out/mac/namespaces/default",
        platformRoot: "/work/.tmp/tools-pack/out/mac",
        root: "/work/.tmp/tools-pack/out",
      },
      runtime: {
        namespaceBaseRoot: "/work/.tmp/tools-pack/runtime/mac/namespaces",
        namespaceRoot: "/work/.tmp/tools-pack/runtime/mac/namespaces/default",
      },
      toolPackRoot: "/work/.tmp/tools-pack",
    },
    silent: true,
    signed: false,
    to: "all",
    webOutputMode: "standalone",
    workspaceRoot: "/work",
  };
}

describe("buildMacPackagedConfig", () => {
  it("omits nodeCommandRelative from the packaged config", () => {
    const config = buildMacPackagedConfig(makeConfig(), "0.4.0");

    expect(config).toEqual({
      appVersion: "0.4.0",
      namespace: "default",
      namespaceBaseRoot: "/work/.tmp/tools-pack/runtime/mac/namespaces",
      webOutputMode: "standalone",
    });
    expect(config).not.toHaveProperty("nodeCommandRelative");
  });

  it("omits namespaceBaseRoot when portable is enabled", () => {
    const config = buildMacPackagedConfig({ ...makeConfig(), portable: true }, "0.4.0");

    expect(config).toEqual({
      appVersion: "0.4.0",
      namespace: "default",
      webOutputMode: "standalone",
    });
    expect(config).not.toHaveProperty("namespaceBaseRoot");
  });
});
