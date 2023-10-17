import {Icon} from "@iconify-icon/react";
import Link from "next/link";

export default async function Testimonial() {
    const persons = [
        {
            name: "Dr. Jay, Fan Qi",
            title: "Engineering Manager",
            company: "ByteDance",
            link: "https://www.linkedin.com/in/jay-qi-fan-0ba64b28/",
            feedback: "Brian is an experienced engineer with a good engineering taste. He has maintained a very high engineering standards to himself and to his team. He is also an adopter for DDD and increases the testability in Bytehouse APIs. In the next, I think Brian can spread the good engineering practices to other services too.",
        },
        {
            name: "Aurora Fang",
            title: "Product Manager",
            company: "ByteDance",
            link: "https://www.linkedin.com/in/aurorafang/",
            feedback: "It's a great honor to work with Brian, he is reliable and conscientious, he also produces a stable outcome for the last 6 months. As PM, I'll try my best to support developers' team and clarify requirements with clear PRDs. Hope we can keep collaborating and get more achievements in the future."
        },
        {
            name: "Yilun Zhu",
            title: "Software Engineer",
            company: "ByteDance",
            link: "https://www.linkedin.com/in/yilun-zhu/",
            feedback: "Thank you for the feedback and guidance over the past year, its great to get your advice on best practises and standards. Looking forward to learning more from you!"
        }
    ]

    return (
        <div>
            <h2 className="mt-16 text-2xl font-semibold">Testimonials</h2>
            <p>What my coworkers say about me</p>
            <div className="mt-2 grid text-center md:grid-cols-3 md:text-left">
                {persons.map(p => <TestimonialCard key={p.link} {...p}/>)}
            </div>
        </div>
    )
}

type TestimonialCardProps = {
    name: string
    title: string
    company: string
    link: string
    feedback: string
}

function TestimonialCard(props: TestimonialCardProps) {
    return (
        <div
            className="card rounded-lg border border-transparent p-3 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30">
            <div className="flex w-full justify-center md:justify-start">
                <Icon icon="fa6-solid:quote-right" height={38} width={38}/>
            </div>

            <div className="card-body p-0">
                <p> {props.feedback}</p>
                <div className="card-actions">
                    <p>
                        <Link
                            href={props.link}
                            className="link-primary underline dark:link-info"
                        >
                            {props.name}
                        </Link>
                        {", "}
                        <span className="italic text-gray-500">{props.title}, {props.company}</span>
                    </p>
                </div>
            </div>
        </div>
    );
}
