'use client'
import React, {useEffect, useState, useTransition} from 'react'
import Link from "next/link";
import Image from "next/image";
import {Button} from "@/components/ui/button";
import {useRouter, useSearchParams} from "next/navigation";
import {useForm} from "react-hook-form";
import {Form,} from "@/components/ui/form"
import {zodResolver} from "@hookform/resolvers/zod";
import {z} from "zod";
import {Loader2} from "lucide-react";
import CustomInput from "@/components/CustomInput";
import {forgotPasswordSchema} from "@/lib/schemas";
import {FormError} from "@/components/forms/form-error";
import {forgotPassword} from "@/lib/actions/user.actions";
import {Alert, AlertDescription, AlertTitle} from "@/components/ui/alert";
import {APP_NAME} from "@/constants";
import useEmailStore from "@/lib/stores/emailStore";

const ForgotPasswordForm = () => {
    const [error, setError] = useState<string>('')
    const [errorForm, setErrorForm] = useState('')
    const [isPending, startTransition] = useTransition()
    const router = useRouter()
    const searchParams = useSearchParams()
    const pathError = searchParams.get('error')

    const { setEmail } = useEmailStore()

    const form = useForm<z.infer<typeof forgotPasswordSchema>>({
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: {
            email: '',
        },
    });



    const onSubmit = async (data: z.infer<typeof forgotPasswordSchema>) => {
        startTransition(async () => {
            try {
                await forgotPassword(data)
                    .then((_) => {
                            form.reset()
                            router.push(`/forgot-password/confirm`)
                        }
                    )
                    .catch(error => {
                        setError(error)
                    })
                setEmail(data.email)
            } catch (e) {
                console.error(e)
            }
        })
    }

    useEffect(() => {
        if (pathError) {
            setErrorForm(pathError)
        }else
            setErrorForm('')
    }, []);

    return (
        <section className={'auth-form'}>
            <header className={'flex flex-col gap-5 md:gap-8'}>
                <Link href="/" className="mb-12 cursor-pointer flex items-center gap-1">
                    <Image src='/icons/logo.svg' width={34} height={34} alt="Logo"
                           className="size-[24px] max-xl:size-14"/>
                    <h1 className="sidebar-logo">{APP_NAME}</h1>
                </Link>
                <div className={'flex flex-col gap-1 md:gap-3'}>
                    <Alert className={'w-full bg-teal-50'}>
                        <AlertTitle className={'mb-3'}>Request a password reset code</AlertTitle>
                        <AlertDescription className={''}>
                            If we find an account with the email you entered, your password reset code is going to be
                            sent to your email.
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
                                         disabled={isPending}/>

                        </>
                        <FormError message={error || errorForm}/>
                        <div className={'flex flex-col gap-4'}>
                            <Button type="submit" className={'form-btn'} disabled={isPending}>
                                {isPending ? (<><Loader2 size={20} className={'animate-spin'}/>&nbsp; Loading... </>) : 'Request code'}
                            </Button>
                        </div>
                    </form>
                </Form>
            </>

        </section>
    )
}
export default ForgotPasswordForm
