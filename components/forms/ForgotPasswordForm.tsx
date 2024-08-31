'use client'
import React, {useState, useTransition} from 'react'
import Link from "next/link";
import Image from "next/image";
import {Button} from "@/components/ui/button";
import {useRouter, useSearchParams} from "next/navigation";
import {useForm} from "react-hook-form";
import {Form,} from "@/components/ui/form"
import {zodResolver} from "@hookform/resolvers/zod";
import {z} from "zod";
import {Loader2} from "lucide-react";
import CustomButton from "@/components/CustomButton";
import {FaGithub, FaGoogle} from "react-icons/fa";
import CustomInput from "@/components/CustomInput";
import {forgotPasswordSchema, loginSchema} from "@/lib/schemas";
import {FormError} from "@/components/forms/form-error";
import {forgotPassword, login} from "@/lib/actions/user.actions";
import {signIn} from "next-auth/react";
import {DEFAULT_LOGIN_REDIRECT} from "@/routes";
import {Alert, AlertDescription, AlertTitle} from "@/components/ui/alert";
import {APP_NAME} from "@/constants";

const ForgotPasswordForm = () => {
    const [error, setError] = useState<string>('')
    const [user, setUser] = useState(null)
    const [isPending, startTransition] = useTransition()
    const router = useRouter()


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
                            router.push(`/forgot-password/confirm?email=${data.email}`)
                        }
                    )
                    .catch(error => {
                        setError(error)
                    })
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
                        <FormError message={error}/>
                        <div className={'flex flex-col gap-4'}>
                            <Button type="submit" className={'form-btn'} disabled={isPending}>
                                {isPending ? (<><Loader2 size={20}
                                                         className={'animate-spin'}/>&nbsp; Loading... </>) : 'Request code'}
                            </Button>
                        </div>
                    </form>
                </Form>
            </>

        </section>
    )
}
export default ForgotPasswordForm
