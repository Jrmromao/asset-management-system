'use client'
import React from 'react'
import {signOut, useSession} from "next-auth/react";
import {useRouter} from "next/navigation";
import Image from "next/image";

const Footer = ({ type = 'desktop' }: FooterProps) => {
    const router = useRouter();
    const {data} = useSession()

    const name = data?.user?.name || 'Guest'

    const handleLogOut = async () => {
        // const loggedOut = await logoutAccount();

        // if(loggedOut) router.push('/sign-in')

    }

    return (
        <footer className="footer">
            

            <div className={type === 'mobile' ? 'footer_name-mobile' : 'footer_name'}>
                <p className="text-xl font-bold text-gray-700">
                     {name[0]}
                </p>
            </div>

            <div className={type === 'mobile' ? 'footer_email-mobile' : 'footer_email'}>
                <h1 className="text-14 truncate text-gray-700 font-semibold">
                    {name}
                </h1>
                <p className="text-14 truncate font-normal text-gray-600">
                    {data?.user?.email}
                </p>
            </div>

            <div className="footer_image" onClick={() => signOut({callbackUrl: '/sign-in'})}>
                <Image src="icons/logout.svg" fill alt="jsm" />
            </div>
        </footer>
    )
}

export default Footer