"use client";

import dynamic from 'next/dynamic'

const VisualizerSketch = dynamic(() => import("@/app/visualizer/components/visualizer-sketch").then((mod) => mod.default), {
    ssr: false,
})

function ListenSurroundingPage() {
    return (
        <>
            <VisualizerSketch/>
        </>
    )
}

export default ListenSurroundingPage;
