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
        <div className="card card-compact max-w-[16rem] md:max-w-xs bg-base-100 shadow-lg">
            <figure className="overflow-hidden rounded-md w-fit h-fit">
                <Image
                    src={props.thumbnail.url}
                    alt={props.title}
                    width={400}
                    height={250}
                    className="object-cover transition-all hover:scale-105"/>
            </figure>
            <div className="card-body">
                <h2 className="card-title text-base xl:text-lg">{props.title}</h2>
                <p className="text-xs md:text-base">{props.datetime}</p>
                <div className="card-actions justify-end">
                    <button className="btn btn-sm btn-primary">{props.watched ? "Xem Lại" : "Xem Ngay"}</button>
                </div>
            </div>
        </div>
    )
}

export function VideoCardSkeleton() {
    return (
        <div className="card card-compact bg-base-100 shadow-lg animate-pulse">
            <figure className="overflow-hidden rounded-md w-fit h-fit">
                <div className="w-72 md:w-80 h-56 bg-gray-200 rounded dark:bg-gray-700"></div>
            </figure>
            <div className="card-body">
                <h2 className="card-title w-3/4 h-6 bg-gray-200 rounded dark:bg-gray-700"></h2>
                <p className="w-1/3 h-5 bg-gray-200 rounded dark:bg-gray-700"></p>
                <div className="card-actions justify-end">
                    <button className="btn btn-outline border-none w-1/3 bg-gray-200 rounded dark:bg-gray-700"></button>
                </div>
            </div>
        </div>
    )
}
