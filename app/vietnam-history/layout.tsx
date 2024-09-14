import '@/app/globals.css'
import type {Metadata} from 'next'
import Link from "next/link";

export const metadata: Metadata = {
    title: 'Lịch sử Việt Nam',
    description: 'Phim hoạt hình Lịch sử Việt Nam',
}

export default function Layout({children}: { children: React.ReactNode }) {
    return (
        <>
            <header>
                <Link href="/vietnam-history">
                    <h1 className="text-5xl font-bold">Lịch sử <span className="block md:inline">Việt Nam 🇻🇳</span></h1>
                </Link>
            </header>
            <div className="divider"></div>
            <div>{children}</div>
            <div className="divider"></div>
            <div className="text-center">
                <p className="text-sm">Copyright © Bản quyền toàn bộ video thuộc về{" "}
                    <Link href="https://vtv.vn/" target="_blank" className="underline">VTV.vn</Link>
                </p>
                <p className="text-sm lg:px-">Vì lý do bản quyền, chúng tôi sẽ không phát video trực tiếp tại đây hoặc
                    nhúng video vào trang web này.
                    Thay vào đó, bạn sẽ được điều hướng sang trang web chính thức của VTV.
                </p>
            </div>
        </>
    )
}
