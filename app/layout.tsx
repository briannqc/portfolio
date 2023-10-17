import './globals.css'
import type {Metadata} from 'next'
import {Inter} from 'next/font/google'
import Script from "next/script";

const inter = Inter({subsets: ['latin']})

export const metadata: Metadata = {
    title: "BrianNQC's website",
    description: "Brian NQC Personal Website",
}

export default function RootLayout(
    {children}: { children: React.ReactNode }
) {
    return (
        <html lang="en">
        <head>
            <Script
                src="https://kit.fontawesome.com/46304f4f2d.js"
                crossOrigin="anonymous"
            />
            <Script
                src="https://code.iconify.design/iconify-icon/1.0.7/iconify-icon.min.js"
                crossOrigin="anonymous"
            />
        </head>
        <body className={inter.className}>
        <main className="bg-inherit min-h-screen w-screen p-8 md:p-12 lg:p-24">
            {children}
        </main>
        </body>
        </html>
    )
}
