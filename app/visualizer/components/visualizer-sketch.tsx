"use client";

import {useEffect, useState} from "react";
import Sketch from "react-p5";
import p5Types from "p5";
import NoSleep from "nosleep.js";
import AudioAnalyzer, {isMicrophoneSupported, startMicrophoneAnalyzer} from "../lib/audio/audiolib";
import nextVisualizeFunc from "../lib/visualizer/visualizer";
import VisualizerController from "./visualizer-controller";
import MicInaccessibleError from "./mic-inaccessible-error";

const noSleep = new NoSleep();

let analyzer: AudioAnalyzer | undefined = undefined;

let currentP5: p5Types | undefined = undefined;

let visualize = nextVisualizeFunc();
setInterval(
    () => {
        visualize = nextVisualizeFunc();
    },
    30_000
);


type VisualizerSketchState = {
    micAccessible: boolean;
    running: boolean;
    fullscreen: boolean;
}

function VisualizerSketch() {

    const [state, setState] = useState({
        micAccessible: false,
        running: false,
        fullscreen: false,
    } as VisualizerSketchState);

    const setup = (p5: p5Types, canvasParentRef: Element) => {
        currentP5 = p5;
        p5.frameRate(60);
        p5.pixelDensity(2.0);
        const canvas = p5.createCanvas(p5.windowWidth, p5.windowHeight).parent(canvasParentRef);
        canvas.touchStarted(() => {
            visualize = nextVisualizeFunc();
        });
    };

    const draw = (p5: p5Types) => {
        p5.background("#212529");
        if (analyzer) {
            visualize(p5, analyzer);
        }
    };

    const windowResized = (p5: p5Types) => {
        p5.resizeCanvas(p5.windowWidth, p5.windowHeight)
    }

    const keyPressed = (p5: p5Types) => {
        const SPACE_BAR = 32;
        if (p5.keyCode === SPACE_BAR) {
            visualize = nextVisualizeFunc();
        }
        return false; // prevent default
    }

    function toggleStartStop() {
        if (!analyzer) {
            const onfulfilled = (a: AudioAnalyzer) => {
                console.log("Successfully access microphone");
                analyzer = a;
                setState((prev) => {
                    return {
                        ...prev,
                        micAccessible: true,
                        running: true,
                    }
                })
                noSleep.enable();
            }
            const onrejected = (reason: any) => {
                console.log("Accessing microphone failed", reason);
                setState((prev) => {
                    return {
                        ...prev,
                        micAccessible: false,
                        running: false,
                    }
                })
                noSleep.disable();
            }

            startMicrophoneAnalyzer().then(onfulfilled, onrejected);
        } else {
            analyzer.close().then(() => {
                analyzer = undefined;
                setState((prev) => {
                    return {
                        ...prev,
                        running: false,
                    }
                })
                noSleep.disable();
            });
        }
    }

    function toggleFullScreen() {
        if (currentP5 === undefined) {
            return;
        }
        currentP5.fullscreen(!currentP5.fullscreen());
    }

    useEffect(() => {
        setState({
            micAccessible: isMicrophoneSupported(),
            running: analyzer !== undefined && analyzer.state() === "running",
            fullscreen: document.fullscreenElement !== null,
        })
        document.addEventListener("fullscreenchange", () => {
            setState((prev) => {
                return {
                    ...prev,
                    fullscreen: document.fullscreenElement !== null,
                }
            })
        })
    }, []);

    return (
        <div className="visualizer-sketch-container">
            {!state.micAccessible ?
                <MicInaccessibleError/> :
                <Sketch
                    className="vh-100 d-flex align-items-center justify-content-center"
                    setup={setup}
                    draw={draw}
                    windowResized={windowResized}
                    keyPressed={keyPressed}/>
            }
            <VisualizerController
                isRunning={state.running}
                isFullScreen={state.fullscreen}
                onClickStartStop={toggleStartStop}
                onClickToggleFullscreen={toggleFullScreen}
            />
        </div>
    )
}

export default VisualizerSketch;
