import p5Types from "p5";
import AudioAnalyzer from "../audio/audiolib";


const LineVisualize = (p5: p5Types, analyzer: AudioAnalyzer) => {
    p5.push();
    const w = p5.width;
    const h = p5.height;

    p5.colorMode(p5.HSB);
    p5.strokeWeight(2);

    const [waves, minValue, maxValue] = analyzer.getTimeDomainData();

    let prevX = 0;
    let prevY = p5.map(waves[0], minValue, maxValue, 0.8 * h, 0.2 * h);
    for (let i = 1; i < waves.length; i++) {
        const x = p5.map(i, 0, waves.length, 0, w);
        const y = p5.map(waves[i], minValue, maxValue, 0.8 * h, 0.2 * h);

        const hue = p5.map(i, 0, waves.length, 0, 360);
        p5.stroke(hue, 100, 100);
        p5.line(prevX, prevY, x, y);

        prevX = x;
        prevY = y;
    }
    p5.pop();
}

const DottedLineVisualize = (p5: p5Types, analyzer: AudioAnalyzer) => {
    p5.push();
    const w = p5.width;
    const h = p5.height;
    p5.colorMode(p5.HSB);

    const [waves, minValue, maxValue] = analyzer.getTimeDomainData();
    for (let i = 0; i < waves.length; i++) {
        const x = p5.map(i, 0, waves.length, 0, w);
        const y = p5.map(waves[i], minValue, maxValue, 0.8 * h, 0.2 * h);

        const hue = p5.map(i, 0, waves.length, 0, 360);
        p5.fill(hue, 100, 100);
        p5.circle(x, y, 5);
    }
    p5.pop();
}

const CirleLineVisualize = (p5: p5Types, analyzer: AudioAnalyzer) => {
    p5.push();
    const w = p5.width;
    const h = p5.height;
    const minR = 0.2 * p5.min(w, h) / 2;
    const maxR = 0.8 * p5.min(w, h) / 2;

    p5.colorMode(p5.HSB);
    p5.strokeWeight(2);

    p5.translate(w / 2, h / 2);
    const [waves, minValue, maxValue] = analyzer.getTimeDomainData();

    const r0 = p5.map(waves[0], minValue, maxValue, minR, maxR);
    const x0 = r0 * p5.cos(0);
    const y0 = r0 * p5.sin(0);

    let prevX = x0;
    let prevY = y0;
    for (let i = 1; i < waves.length; i++) {
        const r = p5.map(waves[i], minValue, maxValue, minR, maxR);
        const angle = p5.map(i, 0, waves.length, 0, p5.TWO_PI);
        let x = r * p5.cos(angle);
        let y = r * p5.sin(angle);

        const hue = p5.map(i, 0, waves.length, 0, 360);
        p5.stroke(hue, 100, 100);
        p5.line(prevX, prevY, x, y);

        prevX = x;
        prevY = y;
    }

    p5.line(prevX, prevY, x0, y0);
    p5.pop();
}

const CirleDottedLineVisualize = (p5: p5Types, analyzer: AudioAnalyzer) => {
    p5.push();
    const w = p5.width;
    const h = p5.height;
    const minR = 0.2 * p5.min(w, h) / 2;
    const maxR = 0.8 * p5.min(w, h) / 2;

    p5.colorMode(p5.HSB);

    p5.translate(w / 2, h / 2);
    const [waves, minValue, maxValue] = analyzer.getTimeDomainData();

    for (let i = 0; i < waves.length; i++) {
        const r = p5.map(waves[i], minValue, maxValue, minR, maxR);
        const angle = p5.map(i, 0, waves.length, 0, p5.TWO_PI);
        let x = r * p5.cos(angle);
        let y = r * p5.sin(angle);

        const hue = p5.map(i, 0, waves.length, 0, 360);
        p5.fill(hue, 100, 100);
        p5.circle(x, y, 5);
    }
    p5.pop();
}

const timeDomainVisualizeFuncs = [
    LineVisualize,
    DottedLineVisualize,
    CirleLineVisualize,
    CirleDottedLineVisualize,
];

export default timeDomainVisualizeFuncs;
export { CirleDottedLineVisualize };
