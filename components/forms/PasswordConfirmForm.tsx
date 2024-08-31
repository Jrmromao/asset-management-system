'use client'
import React, {useState, useTransition} from 'react'
import Link from "next/link";
import Image from "next/image";
import {Button} from "@/components/ui/button";
import {useForm} from "react-hook-form";
import {Form,} from "@/components/ui/form"
import {zodResolver} from "@hookform/resolvers/zod";
import {z} from "zod";
import {InfoIcon, Loader2} from "lucide-react";
import CustomInput from "@/components/CustomInput";
import {accountVerificationSchema, forgotPasswordConfirmSchema} from "@/lib/schemas";
import {FormError} from "@/components/forms/form-error";
import {forgetPasswordConfirmDetails, verifyAccount} from "@/lib/actions/user.actions";
import {signIn} from "next-auth/react";
import {DEFAULT_LOGIN_REDIRECT} from "@/routes";
import {useRouter, useSearchParams} from "next/navigation";
import {Alert, AlertDescription, AlertTitle} from "@/components/ui/alert";
import {hideUsername} from "@/lib/utils";
import {toast} from "sonner";


const PasswordConfirmForm = () => {
    const [error, setError] = useState<string>('')
    const [isPending, startTransition] = useTransition()
    const searchParams = useSearchParams()
    const router = useRouter()
    const email = searchParams.get('email')

    const hiddenEmail = hideUsername(email || '')



    const form = useForm<z.infer<typeof forgotPasswordConfirmSchema>>({
        resolver: zodResolver(forgotPasswordConfirmSchema),
        defaultValues: {
            code: '',
            email: hiddenEmail,
            newPassword: '',
            confirmNewPassword: '',
        },
    });

    const handleResend = async () => {


        toast.success('Code resent successfully'+email, {
            position: 'top-right',
        })
    }

    const onSubmit = async (data: z.infer<typeof forgotPasswordConfirmSchema>) => {

        startTransition(async () => {
            try {
                const result = await forgetPasswordConfirmDetails(data)

                if(result.success === true) {
                    toast.message('Password reset successful, please log in!')
                    router.push('/sign-in')
                }else{
                    setError(result.message)
                }


            } catch (e) {
                console.error(e)
            }
        })
    }


    return (
        <section className={'auth-form'}>
            <header className={'flex flex-col gap-5 md:gap-8'}>
                <Link href="/" className="mb-12 cursor-pointer flex items-center gap-1">
                    <Image src='/icons/logo.svg' width={34} height={34} alt="Logo"
                           className="size-[24px] max-xl:size-14"/>
                    <h1 className="sidebar-logo">Asset Sea</h1>
                </Link>
                <div className={'flex flex-col gap-1 md:gap-3'}>


                    <Alert className={'w-full bg-teal-50'}>
                        <AlertTitle className={'mb-3'}>We send you an email</AlertTitle>
                        <AlertDescription className={''}>
                            Your code is on the way. To log in, enter the code we emailed to {hiddenEmail}. It may take a
                            minute to arrive.
                        </AlertDescription>
                    </Alert>


                </div>
            </header>
            <>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <>
                            <CustomInput control={form.control}  {...form.register("email")}
                                         label={'Email'}
                                         placeholder={'Enter your email'} type={'email'}
                                         disabled={!!email}/>

                            <CustomInput control={form.control}  {...form.register("code")}
                                         label={'Verification code'}
                                         placeholder={'Enter your verification code'} type={'text'}
                                         disabled={isPending}/>

                            <CustomInput control={form.control}  {...form.register("newPassword")}
                                         label={'New Password'}
                                         placeholder={'Enter your new password'} type={'password'}
                                         disabled={isPending}/>


                            <CustomInput control={form.control}  {...form.register("confirmNewPassword")}
                                         label={'Confirm Password'}
                                         placeholder={'Confirm your new password'} type={'password'}
                                         disabled={isPending}/>
                        </>
                        <FormError message={error}/>

                        <div className={'flex flex-col'}>
                            <Button type="submit" className={'form-btn'} disabled={isPending}>
                                {isPending ? (<><Loader2 size={20} className={'animate-spin'}/>&nbsp; Loading... </>) : 'Confirm'}
                            </Button>
                        </div>
                    </form>
                </Form>
                <Button className={'bg-auto bg-gray-100'} disabled={isPending} onClick={handleResend}>
                    {isPending ? (<><Loader2 size={20} className={'animate-spin'}/>&nbsp; Loading... </>) : 'Resend'}
                </Button>
            </>

        </section>
    )
}
export default PasswordConfirmForm