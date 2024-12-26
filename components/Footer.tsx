'use client'
import React, {useEffect, useState} from 'react'
import Image from "next/image";
import {signOut, useSession} from "next-auth/react";


const Footer = ({type = 'desktop'}: { type?: 'desktop' | 'mobile' }) => {
    const {data: session} = useSession();

    const name = session?.user?.name || 'Guest';
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

                </p>
            </div>

            <div className="footer_image" onClick={() => signOut({callbackUrl: '/sign-in'})}>
                <Image src="/icons/logout.svg" fill alt="jsm"/>
            </div>
        </footer>
    );
}

export default Footer;