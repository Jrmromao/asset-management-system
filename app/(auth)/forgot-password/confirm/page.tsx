'use client'
import React from 'react'
import LoginForm from "@/components/forms/LoginForm";
import AccountVerificationForm from "@/components/forms/AccountVerificationForm";
import {useRouter, useSearchParams} from "next/navigation";
import PasswordConfirmForm from "@/components/forms/PasswordConfirmForm";


const ConfirmPasswordReset = () => {
    const searchParams = useSearchParams()
    const router = useRouter()
    const email = searchParams.get('email')
    return (
        <div className={'flex-center size-full max-sm:px-6'}>
            <PasswordConfirmForm />
        </div>
    )
}

export default ConfirmPasswordReset
