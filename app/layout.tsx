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
        <div className="flex justify-center bg-inherit">
            <div className="min-h-screen w-screen max-w-4xl p-3 py-12">
                {children}
            </div>
        </div>
        </body>
        </html>
    )
}
