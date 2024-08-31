'use client'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
import {APP_NAME, sidebarLinks} from "@/constants"
import { cn } from "@/lib/utils"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import Footer from "@/components/Footer";


const MobileNav = () => {

  const pathName = usePathname()

  return (
    <section className="w-full max-w-[264px]">
      <Sheet>
        <SheetTrigger >
          <Image src={'/icons/hamburger.svg'} alt="menu item" width={30} height={30} />
        </SheetTrigger>
        <SheetContent side={'left'} className="border-none bg-white">
          <Link href="/" className="cursor-pointer flex items-center gap-1 px-4">
            <Image src='/icons/logo.svg' width={34} height={34} alt="Logo" />
            <h1 className="text-26  font-ibm-plex-serif font-bold text-black-1">{APP_NAME}</h1>
          </Link>
            <SheetClose asChild>
              <nav className="flex h-full flex-col gap-6 pt-16 text-white">
                {sidebarLinks.map((item) => {
                  const isActive = pathName === item.route || pathName.startsWith(`${item.route}/`)
                  return (
                    <SheetClose asChild key={item.label}>
                      <Link href={item.route} id={item.label} className={cn('mobilenav-sheet_close w-full', { 'bg-bank-gradient': isActive })}>
                        <div className="relative size-6">
                          <Image src={item.imgURL} alt={item.label} width={20} height={20}
                            className={cn({ 'brightness-[3] invert-0': isActive })} />
                        </div>
                        <p className={cn('text-16 font-semibold text-black-2', {
                          '!text-white': isActive
                        })}>
                          {item.label}
                        </p>
                      </Link>
                    </SheetClose>
                  )
                })}
                USER
              </nav>
            </SheetClose>
          <Footer type={'mobile'} />
        </SheetContent>
      </Sheet>
    </section>
  )
}

export default MobileNav