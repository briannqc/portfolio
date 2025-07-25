import Image from "next/image";
import Link from "next/link";

export default async function Featured() {
    const features = [
        {
            title: "Lotus34 API",
            subtitle: "Vietnam Provincial Data Service 2025",
            background: "/lotus34-vietnam.png",
            link: "/lotus34"
        },
        {
            title: "History of Vietnam",
            subtitle: "Educational videos to learn History of Vietnam since its early days",
            background: "/history-of-vietnam.jpeg",
            link: "/vietnam-history"
        },
        {
            title: "Office Check-in",
            subtitle: "Am I going to office today?",
            background: "/offices-in-hcmc.webp",
            link: "/office-check-in"
        },
    ]
    return (
        <section>
            <h2 className="mt-16 text-2xl font-semibold">Hobby Projects</h2>
            <p>Cool Projects I have developed on Weekends.</p>
            <div className="carousel rounded-box space-x-4 p-4 w-full">
                {features.map(f =>
                    <div className="carousel-item" key={f.link}><FeaturedCard  {...f}/></div>
                )}
            </div>
        </section>
    )
}

async function FeaturedCard(
    {title, subtitle, background, link}: { title: string, subtitle: string, background: string, link: string }
) {
    return (
        <div className="card w-80 md:w-96 bg-base-100 shadow-xl image-full">
            <figure>
                <Image
                    className="object-cover"
                    src={background}
                    alt={title}
                    width={400}
                    height={250}/>
            </figure>
            <div className="card-body">
                <h2 className="card-title">{title}</h2>
                <p>{subtitle}</p>
                <div className="card-actions justify-end">
                    <Link className="btn btn-outline btn-success" href={link}>Go There</Link>
                </div>
            </div>
        </div>
    )
}
