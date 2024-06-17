'use client'
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetTrigger,
} from "@/components/ui/sheet"
import {sidebarLinks} from "@/constants"
import {cn} from "@/lib/utils"
import Image from "next/image"
import Link from "next/link"
import {usePathname} from "next/navigation"
import Footer from "@/components/Footer";


const SideDrawer = () => {
    return (
        <section className="w-full">
            <Sheet>
                <SheetTrigger>
                    Add Asset
                </SheetTrigger>
                <SheetContent side={'right'} className="border-none bg-white dark:bg-slate-900">

                </SheetContent>
            </Sheet>
        </section>
    )
}

export default SideDrawer