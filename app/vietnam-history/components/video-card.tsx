import Image from "next/image";

type VideoCardProps = {
    id: number
    title: string
    url: string
    datetime: string
    thumbnail: {
        url: string
    }
    watched?: boolean
}

export default function VideoCard(props: VideoCardProps) {
    return (
        <div className="card card-compact max-w-xs bg-base-100 shadow-lg">
            <figure className="overflow-hidden rounded-md w-fit h-fit">
                <Image
                    src={props.thumbnail.url}
                    alt={props.title}
                    width={400}
                    height={250}
                    className="object-cover transition-all hover:scale-105"/>
            </figure>
            <div className="card-body">
                <h2 className="card-title text-lg">{props.title}</h2>
                <p>{props.datetime}</p>
                <div className="card-actions justify-end">
                    <button className="btn btn-primary">{props.watched ? "Xem Lại" : "Xem Ngay"}</button>
                </div>
            </div>
        </div>
    )
}
