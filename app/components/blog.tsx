import Link from "next/link";
import {fetchMediumStats} from "@/app/components/blog-api";

export default async function BlogStats() {
    return (
        <section className="mt-2 grid text-center md:grid-cols-2 md:text-left">
            <LinkedInSummary/>
            <MediumSummary/>
        </section>
    );
};

function LinkedInSummary() {
    return (
        <Link
            href="https://www.linkedin.com/in/briannqc/"
            target="_blank"
            rel="noopener noreferrer"
        >
            <div
                className="group rounded-lg border border-transparent px-4 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30">
                <h2 className="mb-3 text-xl font-semibold">
                    Linked
                    <i className="fa-brands fa-linkedin fa-lg text-[#0072b1]"></i>
                    <ArrowIcon/>
                </h2>
                <p className="m-0 text-sm opacity-50">1400+ Engagements ○ 172K+ Impressions</p>
            </div>
        </Link>
    );
}

async function MediumSummary() {
    const {followersCount, articlesCount} = await fetchMediumStats()
    return (
        <Link
            href="https://medium.com/@briannqc"
            target="_blank"
            rel="noopener noreferrer"
        >
            <div
                className="group rounded-lg border border-transparent px-4 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30">
                <h2 className="mb-3 text-xl font-semibold">
                    <i className="fa-brands fa-medium fa-lg"></i>
                    Medium
                    <ArrowIcon/>
                </h2>
                <p className="m-0 text-sm opacity-50">{followersCount} followers ○ {articlesCount} articles</p>
            </div>
        </Link>
    );
}

function ArrowIcon() {
    return (
        <div
            className="inline-block transition-transform group-hover:-translate-y-1 group-hover:translate-x-1 motion-reduce:transform-none">
            <svg
                className="mr-2"
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    d="M2.07102 11.3494L0.963068 10.2415L9.2017 1.98864H2.83807L2.85227 0.454545H11.8438V9.46023H10.2955L10.3097 3.09659L2.07102 11.3494Z"
                    fill="currentColor"
                />
            </svg>
        </div>
    );
}
