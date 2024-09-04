'use client'
import React, {useState, useTransition} from 'react'
import Link from "next/link";
import Image from "next/image";
import {Button} from "@/components/ui/button";
import {useRouter} from "next/navigation";
import {useForm} from "react-hook-form";
import {Form,} from "@/components/ui/form"
import {zodResolver} from "@hookform/resolvers/zod";
import {z} from "zod";
import {Loader2} from "lucide-react";
import CustomButton from "@/components/CustomButton";
import {FaGithub, FaGoogle} from "react-icons/fa";
import CustomInput from "@/components/CustomInput";
import {loginSchema, waitlistSchema} from "@/lib/schemas";
import {FormError} from "@/components/forms/form-error";
import {login, waitlist} from "@/lib/actions/user.actions";
import {signIn} from "next-auth/react";
import {DEFAULT_LOGIN_REDIRECT} from "@/routes";
import {APP_NAME} from "@/constants";
import sweetalert2 from "sweetalert2";
import Swal from "sweetalert2";

const AuthForm = () => {
    const [error, setError] = useState<string>('')

    const [isPending, startTransition] = useTransition()
    const form = useForm<z.infer<typeof waitlistSchema>>({
        resolver: zodResolver(waitlistSchema),
        defaultValues: {
            email: '',

        },
    });
    const onSubmit = async (data: z.infer<typeof waitlistSchema>) => {
        startTransition(async () => {
            try {
                await waitlist(data).then(_ =>{
                    form.reset()
                    form.clearErrors()
                    Swal.fire({
                        icon: 'success',
                        title: 'Success',
                        text: 'You have been added to the waitlist',
                    })
                });
            } catch (e) {
                console.error(e)
            } finally {


            }
        })
    }


    return (
        <section className={'auth-form'}>
            <>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <>
                            <CustomInput control={form.control}  {...form.register("email")}
                                         label={''}
                                         placeholder={'Enter your email'} type={'email'}
                                         disabled={isPending}/>

                        </>
                        <FormError message={error}/>
                        <div className={'flex flex-col gap-4'}>
                            <Button type="submit" className={'form-btn'} disabled={isPending}>
                                {isPending ? (<><Loader2 size={20}
                                                         className={'animate-spin'}/>&nbsp; Loading... </>) : ' Join the Waitlist'}
                            </Button>
                        </div>
                    </form>
                </Form>

            </>

        </section>
    )
}
export default AuthForm
