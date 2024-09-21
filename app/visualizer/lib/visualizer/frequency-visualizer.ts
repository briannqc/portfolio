import p5Types from "p5";
import AudioAnalyzer from "../audio/audiolib";

function barVisualizeOf(numOfBars: number) {
    return (p5: p5Types, analyzer: AudioAnalyzer) => {
        p5.push();
        const lowestH = p5.height * 0.8;
        const highestH = p5.height * 0.2;

        p5.colorMode(p5.HSB);
        const [energies, maxValue] = analyzer.getLogarithmicScaleEnergies(numOfBars);
        const barWidth = p5.width / numOfBars;

        for (let i = 0; i < numOfBars; i++) {
            const hue = p5.map(i, 0, numOfBars, 0, 360);
            p5.fill(hue, 100, 100);

            const x = p5.map(i, 0, numOfBars, 0, p5.width);
            const y = p5.map(energies[i], 0, maxValue, lowestH, highestH);
            p5.rect(x, y, barWidth, lowestH - y)
        }
        p5.pop();
    }
}

function pieVisualizeOf(numOfPies: number) {
    return (p: p5Types, analyzer: AudioAnalyzer) => {
        p.push();
        const w = p.width;
        const h = p.height;
        p.colorMode(p.HSB);
        p.translate(w / 2, h / 2);

        const minR = 0;
        const maxR = p.min(w, h);
        const [energies, maxValue] = analyzer.getLogarithmicScaleEnergies(numOfPies);
        let angleDelta = p.TWO_PI / numOfPies;
        for (let i = 0; i < numOfPies; i++) {
            const angle = p.map(i, 0, numOfPies, 0, p.TWO_PI);
            const r = p.map(energies[i], 0, maxValue, minR, maxR);

            const hue = p.map(i, 0, numOfPies, 0, 360);
            p.fill(hue, 100, 100);
            p.arc(0, 0, r, r, angle, angle + angleDelta);
        }
        p.pop();
    }
}

const frequencyVisualizeFuncs = [
    barVisualizeOf(16),

    pieVisualizeOf(16),
];

const BarVisualizer10 = barVisualizeOf(10);
const PieVisualizer10 = pieVisualizeOf(10);

export default frequencyVisualizeFuncs;
export { BarVisualizer10, PieVisualizer10 };
