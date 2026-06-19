import React from "react";
import { Composition } from "remotion";
import { DynamicExportComposition } from "./DynamicExportComposition";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="DynamicExportComposition"
        component={DynamicExportComposition}
        durationInFrames={300} // Default, will be overridden by inputProps
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          code: "",
          themeConfig: {},
        }}
      />
    </>
  );
};
