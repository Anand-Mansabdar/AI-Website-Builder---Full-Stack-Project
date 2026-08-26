import React, { useMemo, useState } from "react";
import { detectDependencies } from "../utils/sandpackUtils";
import SandpackErrorMonitor from "./SandpackErrorMonitor";
import {
  SandpackLayout,
  SandpackPreview,
  SandpackProvider,
} from "@codesandbox/sandpack-react";

const FullPagePreview = ({ files }) => {
  const [showErrorOverlay, setshowErrorOverlay] = useState(true);
  const sandpackFiles = useMemo(() => {
    if (!files) return {};
    const spFiles = {};
    for (const [path, content] of Object.entries(files)) {
      spFiles[path] = {
        code: content,
      };
    }
    return spFiles;
  }, [files]);

  const dependencies = useMemo(() => {
    return detectDependencies(files);
  }, [files]);
  return (
    <div className="h-screen w-screen bg-white overflow-hidden">
      <SandpackProvider
        className="h-full w-full"
        template="react"
        files={sandpackFiles}
        options={{
          externalResources: [
            "https://cdn.tailwindcss.com",
            "https://cdn.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css",
          ],
          logLevel: 0,
        }}
        customSetup={{ dependencies }}
      >
        <SandpackErrorMonitor onErrorChange={setshowErrorOverlay} />

        <SandpackLayout className="w-full h-full border-none! bg-transparent!">
          <SandpackPreview
            showNavigator={false}
            showRefreshButton={false}
            showOpenInCodeSandbox={false}
            showSandpackErrorOverlay={showErrorOverlay}
            className="h-full w-full"
          />
        </SandpackLayout>
      </SandpackProvider>
    </div>
  );
};

export default FullPagePreview;
