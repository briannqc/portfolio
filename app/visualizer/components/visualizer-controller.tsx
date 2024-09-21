import Image from "next/image";

type VisualizerControllerProps = {
    isRunning: boolean;
    isFullScreen: boolean;

    onClickStartStop: () => void;
    onClickToggleFullscreen: () => void;
}

function VisualizerController(props: VisualizerControllerProps) {
    const startStopIcon = props.isRunning ? "/icon/microphone-on.svg" : "/icon/microphone-off.svg";
    const toggleFullscreenIcon = props.isFullScreen ? "/icon/fullscreen-on.svg" : "/icon/fullscreen-off.svg";
    return (
        <div className="position-fixed bottom-0 start-50 translate-middle mb-3">
            <button className="btn btn-outline btn-primary me-3 p-0" onClick={props.onClickStartStop}>
                <Image src={startStopIcon}
                       className="btn-controller-icon"
                       width={10} height={10}
                       alt="Start/Stop"/>
            </button>
            <button className="btn btn-outline btn-primary ms-3 p-0" onClick={props.onClickToggleFullscreen}>
                <Image src={toggleFullscreenIcon}
                       className="btn-controller-icon"
                       width={10} height={10}
                       alt="Toggle fullscreen"/>
            </button>
        </div>
    )
}

export default VisualizerController;
