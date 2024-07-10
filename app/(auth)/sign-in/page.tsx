'use client'
import React from 'react'
import AuthForm from "@/components/forms/AuthForm";
import {signIn, useSession} from "next-auth/react";


const SignIn = () => {

    const {data} = useSession()
    return (
        <div className={'flex-center size-full max-sm:px-6'}>

            <AuthForm type={'sign-in'}/>

            <p>{JSON.stringify(data?.user?.name)}</p>

        </div>
    )
}

export default SignIn
