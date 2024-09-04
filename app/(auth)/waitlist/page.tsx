'use client'
import React from 'react'
import Newsletter from "@/components/forms/Newsletter";
import Link from "next/link";
import Image from "next/image";
import {APP_NAME} from "@/constants";


const SignIn = () => {

    return (
        <div
            className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex flex-col justify-center items-center">
            <header className={'flex flex-col gap-5 md:gap-8'}>
                <Link href="/" className="mb-12 cursor-pointer flex items-center gap-1">
                    <Image src='/icons/logo.svg' width={54} height={54} alt="Logo"
                           className="size-[24px] max-xl:size-14"/>
                    <h1 className="sidebar-logo">{APP_NAME}</h1>
                </Link>

            </header>

            <div className="bg-white p-12 rounded-lg shadow-lg max-w-3xl text-center">
                <h1 className="text-3xl md:text-4xl font-bold text-blue-800 mb-4">
                    EcoKeepr: Empowering Sustainable Asset Management
                </h1>
                <p className="text-gray-600 mb-8 leading-relaxed">
                    Streamline your asset tracking, reduce waste, and make informed decisions with EcoKeepr. Our
                    platform is designed to help businesses embrace sustainability and optimize their resource
                    utilization.
                </p>
                <div
                    className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
                    <Newsletter/>
                </div>
            </div>
        </div>
    )
}

export default SignIn
