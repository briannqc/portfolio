const DEFAULT_FFT_SIZE = 1024;

type LogarithmicScaleRange = {
    start: number,
    end: number
}

/**
 * Divides the range [start, end) into sub-ranges using logarithmic scale.
 *
 * This function is useful in dividing frequency bin range of [0, fftSize) into
 *  sub-ranges using logarithmic scale without caring the actual sample rate. The
 *  output of this function could look like [[0, 1], [2, 4], [4, 8], ...].
 *
 * @returns LogarithmicScaleRange[] of length: numOfRanges.
 *
 * @param min Lower boundary, inclusive, must be smaller than (end)
 * @param max Higher boundary, exclusive, must be bigger than (start).
 * @param N How many sub-ranges we want to divide into.
 */
function getLogarithmicRanges(
    min: number,
    max: number,
    N: number,
): LogarithmicScaleRange[] {
    const key = `${min}_${max}_${N}`
    const cachedValue = logarithmicScaleRangesCache[key];
    if (cachedValue) {
        return cachedValue;
    }

    const logMin = Math.log2(min + 1);
    const logMax = Math.log2(max + 1);
    const logDelta = (logMax - logMin) / N;

    const ranges: LogarithmicScaleRange[] = [];
    for (let i = 0; i < N; i++) {
        const logStart = Math.pow(2, logMin + i * logDelta) - 1;
        const logEnd = Math.pow(2, logMin + (i + 1) * logDelta) - 1;

        const start = Math.floor(logStart);
        const end = Math.floor(logEnd);
        ranges.push({start, end});
    }

    logarithmicScaleRangesCache[key] = ranges;
    return ranges;
}

const logarithmicScaleRangesCache: {
    [key: string]: LogarithmicScaleRange[]
} = {}

interface AudioAnalyzer {
    close(): Promise<void>

    state(): AudioContextState

    getFrequencyData(): [data: number[], maxValue: number]

    getTimeDomainData(): [data: number[], minValue: number, maxValue: number]

    getLogarithmicScaleEnergies(numOfRanges: number): [energies: number[], maxValue: number]
}

class StreamAudioAnalyzer implements AudioAnalyzer {

    private readonly fftSize: number;

    private readonly freqData: Uint8Array;

    private readonly zeroFreqData: number[];

    private readonly timeDomainData: Uint8Array;

    private readonly zeroTimeDomainData: number[];

    private audioCtx: AudioContext;

    private analyzer: AnalyserNode;

    private stream: MediaStream;

    constructor(audioCtx: AudioContext, stream: MediaStream, analyzer: AnalyserNode) {
        this.audioCtx = audioCtx;
        this.analyzer = analyzer;
        this.stream = stream;
        this.fftSize = analyzer.fftSize;

        this.freqData = new Uint8Array(this.fftSize / 2);
        this.zeroFreqData = new Array(this.fftSize / 2).fill(0);

        this.timeDomainData = new Uint8Array(this.fftSize);
        this.zeroTimeDomainData = new Array(this.fftSize).fill(0);
    }

    public async close(): Promise<void> {
        for (const track of this.stream.getTracks()) {
            track.stop();
        }
        return this.audioCtx.close()
    }

    public state = (): AudioContextState => {
        return this.audioCtx.state;
    }

    /**
     * Returns frequency data, a.k.a. spectrum, of current audio frame if the
     * AudioAnalyzer is running, otherwise, returns the data array is full of 0.
     *
     * @returns Frequency data in an array of fftSize/2 length, on a scale from 0 to maxValue.
     *      Each item in the array represents the decibel value for a specific frequency
     */
    public getFrequencyData(): [data: number[], maxValue: number] {
        const maxValue = 255;
        if (this.state() !== "running") {
            return [this.zeroFreqData, maxValue]
        }

        this.analyzer.getByteFrequencyData(this.freqData);
        return [
            Array.from(this.freqData, (value) => value),
            maxValue,
        ]
    }

    public getLogarithmicScaleEnergies(numOfRanges: number): [energies: number[], maxValue: number] {
        const [freqData, maxValue] = this.getFrequencyData()
        const ranges = getLogarithmicRanges(0, this.fftSize, numOfRanges);
        const energies: number[] = []
        for (const {start, end} of ranges) {
            const endInclusive = Math.min(end + 1, freqData.length);
            const totalEnergy = freqData.slice(start, endInclusive).reduce((e1, e2) => e1 + e2, 0);
            const avgEnergy = totalEnergy / (end - start + 1)
            energies.push(avgEnergy);
        }
        return [energies, maxValue]
    }

    /**
     * Returns time domain data, a.k.a. waveform, of current audio frame if the
     * AudioAnalyzer is running, otherwise, returns the data array is full of 0.
     *
     * @returns Time domain data in an array of fftSize length, on a scale from
     *          minValue to maxValue.
     */
    public getTimeDomainData(): [data: number[], minValue: number, maxValue: number] {
        const minValue = -1;
        const maxValue = 1;
        if (this.state() !== "running") {
            return [this.zeroTimeDomainData, minValue, maxValue]
        }

        this.analyzer.getByteTimeDomainData(this.timeDomainData);
        return [
            Array.from(this.timeDomainData, (value) => (value - 128) / 128),
            minValue,
            maxValue,
        ]
    }
}

function isMicrophoneSupported(): boolean {
    return navigator.mediaDevices !== undefined
        && navigator.mediaDevices.getUserMedia !== undefined
}

async function startMicrophoneAnalyzer(): Promise<AudioAnalyzer> {
    if (!isMicrophoneSupported()) {
        return Promise.reject(new Error("Microphone is likely not supported on this device"));
    }
    const audioCtx = new AudioContext();
    const onfulfilled = (stream: MediaStream) => {
        const audioSource = audioCtx.createMediaStreamSource(stream);
        const analyzer = audioCtx.createAnalyser();
        analyzer.fftSize = DEFAULT_FFT_SIZE;
        audioSource.connect(analyzer);
        return Promise.resolve(new StreamAudioAnalyzer(audioCtx, stream, analyzer));
    }
    const onRejected = (err: any) => {
        audioCtx.close();
        return Promise.reject(err);
    }

    return navigator.mediaDevices
        .getUserMedia({audio: true})
        .then(onfulfilled, onRejected);
}

export default AudioAnalyzer;
export {isMicrophoneSupported};
export {startMicrophoneAnalyzer};
