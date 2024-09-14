import './globals.css'
import type {Metadata} from 'next'
import {Inter} from 'next/font/google'
import Script from "next/script";
import Link from "next/link";
import React from "react";

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
        <NavBar/>
        <main className="bg-inherit min-h-screen w-screen p-8 md:p-12 lg:p-24">
            {children}
        </main>
        </body>
        </html>
    )
}

function NavBar() {
    return (
        <div className="navbar bg-inherit">
            <div className="flex-1">
                <Link href="/" className="btn btn-ghost normal-case text-xl">Brian NQC</Link>
            </div>
            <div className="flex-none">
                <ul className="menu menu-horizontal px-1">
                    <li><Link href="https://www.linkedin.com/in/briannqc/">Hire me</Link></li>
                    <li>
                        <details>
                            <summary>
                                Projects
                            </summary>
                            <ul className="p-2 bg-base-100">
                                <li><Link href="/vietnam-history">History of Vietnam</Link></li>
                                <li><Link href="/office-check-in">Office Check-in</Link></li>
                            </ul>
                        </details>
                    </li>
                </ul>
            </div>
        </div>
    )
}
