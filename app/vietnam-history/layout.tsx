import '@/app/globals.css'
import type {Metadata} from 'next'
import {Inter} from 'next/font/google'
import Link from "next/link";

const inter = Inter({subsets: ['latin']})

export const metadata: Metadata = {
    title: 'Lịch sử Việt Nam',
    description: 'Phim hoạt hình Lịch sử Việt Nam',
}

export default function RootLayout({children}: { children: React.ReactNode }) {
    return (
        <html lang="en">
        <body className={inter.className}>
        <main className="p-8 md:p-12 lg:p-24">
            <Link href="/vietnam-history">
                <h1 className="text-5xl font-bold">Lịch sử <span className="block md:inline">Việt Nam 🇻🇳</span></h1>
            </Link>
            <div className="divider"></div>
            <div>
                {children}
            </div>
            <div className="divider"></div>
            <footer className="footer footer-center p-4 bg-base-300 text-base-content">
                <aside>
                    <p>Copyright © 2023 - Bản quyền toàn bộ videos thuộc về{" "}
                        <Link href="https://vtv.vn/" target="_blank" className="underline">VTV.vn</Link>
                    </p>
                </aside>
            </footer>
        </main>
        </body>
        </html>
    )
}
