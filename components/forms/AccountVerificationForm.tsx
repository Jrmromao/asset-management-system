'use client'
import React, {useState, useTransition} from 'react'
import Link from "next/link";
import Image from "next/image";
import {Button} from "@/components/ui/button";
import {useForm} from "react-hook-form";
import {Form,} from "@/components/ui/form"
import {zodResolver} from "@hookform/resolvers/zod";
import {z} from "zod";
import {Loader2} from "lucide-react";
import CustomInput from "@/components/CustomInput";
import {accountVerificationSchema} from "@/lib/schemas";
import {FormError} from "@/components/forms/form-error";
import {forgotPassword, resendCode, verifyAccount} from "@/lib/actions/user.actions";
import {useRouter, useSearchParams} from "next/navigation";
import {Alert, AlertDescription, AlertTitle} from "@/components/ui/alert";
import {hideEmailAddress} from "@/lib/utils";
import {APP_NAME} from "@/constants";


const AuthForm = () => {
    const [error, setError] = useState<string>('')
    const [user, setUser] = useState(null)
    const [isPending, startTransition] = useTransition()
    const [isLoading, setIsLoading] = useState(false)
    const searchParams = useSearchParams()
    const router = useRouter()
    const email = searchParams.get('email')


    const form = useForm<z.infer<typeof accountVerificationSchema>>({
        resolver: zodResolver(accountVerificationSchema),
        defaultValues: {
            code: '',
            email: email || '',
        },
    });
    const onSubmit = async (data: z.infer<typeof accountVerificationSchema>) => {
        startTransition(async () => {
            try {
                await verifyAccount(data)
                    .then(() => {
                        form.reset()
                        router.push('/sign-in')
                    }).catch(error => {
                        setError(error)
                    })

            } catch (e) {
                console.error(e)
            }
        })
    }

    const handleResendCode = async () => {
        try {
            setIsLoading(true)
            await resendCode(email!).then(_ => {
                setIsLoading(false)
            })
        } catch (e) {
            console.error(e)
        }
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
                        <AlertTitle className={'mb-3'}>We send you an email</AlertTitle>
                        <AlertDescription className={''}>
                            Your code is on the way. To log in, enter the code we emailed to {hideEmailAddress(email!)}.
                            It may take a minute to arrive.
                        </AlertDescription>
                    </Alert>


                </div>
            </header>
            {user ? (
                <div className={'flex flex-col gap-4'}>
                    Joao Filipe Romão
                </div>
            ) : (<>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                            <>
                                <CustomInput control={form.control}  {...form.register("email")}
                                             label={'Email'}
                                             placeholder={'Enter your email'} type={'email'}
                                             disabled={isPending || !!email}/>

                                <CustomInput control={form.control}  {...form.register("code")}
                                             label={'Verification code'}
                                             placeholder={'Enter your verification code'} type={'text'}
                                             disabled={isPending}/>
                            </>
                            <FormError message={error}/>
                            <div className={'flex flex-col gap-4'}>
                                <Button type="submit" className={'form-btn'} disabled={isPending}>
                                    {isPending ? (<><Loader2 size={20}
                                                             className={'animate-spin'}/>&nbsp; Loading... </>) : 'Confirm'}
                                </Button>
                                <Button type="button" className={'bg-auto bg-gray-100'} disabled={isPending || isLoading} onClick={handleResendCode}>
                                    {isLoading ? (<><Loader2 size={20}
                                                             className={'animate-spin'}/>&nbsp; Loading... </>) : 'Resend code'}
                                </Button>

                            </div>

                        </form>
                    </Form>
                </>
            )}
        </section>
    )
}
export default AuthForm
