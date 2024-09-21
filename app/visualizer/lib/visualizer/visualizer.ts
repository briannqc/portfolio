import p5Types from "p5";

import TimeVisualizeFuncs from "./time-domain-visualizer";
import FrequencyVisualizeFuncs from "./frequency-visualizer";
import AudioAnalyzer from "../audio/audiolib";

type VisualizeFunc = (p5: p5Types, analyzer: AudioAnalyzer) => void

function nextVisualizeFunc(): VisualizeFunc {
    const shuffle = () => Math.random() - 0.5
    return [
        ...TimeVisualizeFuncs,
        ...FrequencyVisualizeFuncs,
    ].sort(shuffle)[0];
}

export default nextVisualizeFunc;
export type { VisualizeFunc };
