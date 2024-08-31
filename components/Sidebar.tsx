'use client'
import {APP_NAME, sidebarLinks} from "@/constants"
import { cn } from "@/lib/utils"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import Footer from "@/components/Footer";
import {useSession} from "next-auth/react";
import {ModeToggle} from "@/components/ModeToggle";
import React from "react";

const Sidebar = () => {

    const pathName = usePathname()
    const {data } = useSession()

    const user: any = {
        role: 'admin'
    }

    return (
        <section className="sidebar">
            <nav className="flex flex-col gap-4">
                <Link href="/" className="mb-12 cursor-pointer flex items-center gap-2">
                    <Image src='/icons/logo.svg' width={34} height={34} alt="Logo" className="size-[24px] max-xl:size-14" />
                    <h1 className="sidebar-logo">{APP_NAME}</h1>
                </Link>

                {sidebarLinks.map((item) => {

                    const isActive = pathName === item.route || pathName.startsWith(`${item.route}/`)

                    if (!item.visibleTo.includes(user.role)) {
                        return null
                    }
                    return (
                        <Link href={item.route} id={item.label} className={cn('sidebar-link',  {'bg-bank-gradient':isActive})} key={item.label} >

                            <div className="relative size-6">
                                <Image src={item.imgURL} alt={item.label} fill  className={cn({'brightness-[3] invert-0': isActive})}/>
                            </div>
                            <p className={cn('sidebar-label', {
                                '!text-white': isActive
                            })}>
                                {item.label}
                            </p>
                        </Link>
                    )
                })}
            </nav>
            <Footer />
        </section>
    )
}

export default Sidebar