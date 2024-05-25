'use client'
import React, {useState} from 'react'
import Link from "next/link";
import Image from "next/image";
import {z} from "zod"
import {zodResolver} from "@hookform/resolvers/zod"
import {useForm} from "react-hook-form"
import {Button} from "@/components/ui/button"
import {
    Form,
} from "@/components/ui/form"
import CustomInput from "@/components/CustomInput";
import {authFormSchema} from "@/lib/utils";
import {Loader2} from "lucide-react";
import {useRouter} from "next/navigation";
// import {getLoggedInUser, signIn, signUp} from "@/lib/actions/user.actions";
import PlaidLink from "@/components/PlaidLink";

const AuthForm = ({type}: { type: string }) => {
    const [isLoading, setIsLoading] = useState(false)
    const [user, setUser] = useState(null)
    const formSchema = authFormSchema(type)
    const router = useRouter()
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            password: '',
            firstName: '',
            lastName: '',
            address1: '',
            city: '',
            state: '',
            postalCode: '',
            dateOfBirth: '',
            ssn: ''
        },
    })

    const onSubmit = async (data: z.infer<typeof formSchema>) => {
        setIsLoading(true)

        try {
            if (type === 'sign-up') {
                const userData = {
                    firstName: data.firstName!,
                    lastName: data.lastName!,
                    address1: data.address1!,
                    city: data.city!,
                    state: data.state!,
                    postalCode: data.postalCode!,
                    dateOfBirth: data.dateOfBirth!,
                    ssn: data.ssn!,
                    email: data.email,
                    password: data.password
                }
                // const newUser = await signUp(userData)
                // setUser(newUser)
            }
            if (type === 'sign-in') {
                const response = false
                // await signIn({
                //     email: data.email,
                //     password: data.password
                // })
                if (response)
                    router.push('/')
            }
        } catch (e) {
            console.error(e)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <section className={'auth-form'}>
            <header className={'flex flex-col gap-5 md:gap-8'}>
                <Link href="/" className="mb-12 cursor-pointer flex items-center gap-1">
                    <Image src='/icons/logo.svg' width={34} height={34} alt="Logo"
                           className="size-[24px] max-xl:size-14"/>
                    <h1 className="sidebar-logo">Peoplez Bank</h1>
                </Link>
                <div className={'flex flex-col gap-1 md:gap-3'}>
                    <h1 className={'text-24 lg:text-36 font-semibold text-gray-900'}>
                        {user ? 'Link Account' : type === 'sign-in' ? 'Sign In' : 'Sign Up'}
                        <p className={'text-16 font-normal text-gray-600'}>
                            {user ? 'Link your account' : 'Please enter your details'}
                        </p>
                    </h1>
                </div>
            </header>
            {user ? (
                <div className={'flex flex-col gap-4'}>
                   <PlaidLink user={user} variant={'primary'}/>
                </div>
            ) : (<>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)}
                              className="space-y-8">
                            {type === 'sign-up' && (
                                <>
                                    <div className={'flex gap-4'}>
                                        <CustomInput control={form.control} name={'firstName'} label={'First Name'}
                                                     placeholder={'ex: Joe'} type={'text'}/>
                                        <CustomInput control={form.control} name={'lastName'} label={'Last Name'}
                                                     placeholder={'ex: Doe'} type={'text'}/>
                                    </div>
                                    <CustomInput control={form.control} name={'address1'} label={'Address'}
                                                 placeholder={'Enter you Address'} type={'text'}/>

                                    <CustomInput control={form.control} name={'city'} label={'City'}
                                                 placeholder={'Enter you City'} type={'text'}/>
                                    <div className={'flex gap-4'}>
                                        <CustomInput control={form.control} name={'state'} label={'State'}
                                                     placeholder={'ex: NY'} type={'text'}/>
                                        <CustomInput control={form.control} name={'postalCode'} label={'Postal Code'}
                                                     placeholder={'ex: 11101'} type={'text'}/>
                                    </div>
                                    <div className={'flex gap-4'}>
                                        <CustomInput control={form.control} name={'dateOfBirth'} label={'Date of Birth'}
                                                     placeholder={'ex: YYYY-MM-DD'} type={'text'}/>
                                        <CustomInput control={form.control} name={'ssn'} label={'SSN'}
                                                     placeholder={'ex: 1234'} type={'text'}/>
                                    </div>
                                </>
                            )}


                            <CustomInput control={form.control} name={'email'} placeholder={'Please enter your email'}
                                         label={'Email'} type={'email'}/>
                            <CustomInput control={form.control} name={'password'}
                                         placeholder={'Please enter your password'}
                                         label={'Password'} type={'password'}/>

                            <div className={'flex flex-col gap-4'}>

                                <Button type="submit" className={'form-btn'} disabled={isLoading}>
                                    {isLoading ? (
                                        <>
                                            <Loader2 size={20} className={'animate-spin'}/>&nbsp;
                                            Loading...
                                        </>
                                    ) : type === 'sign-in'
                                        ? 'Sign In' : 'Sign Up'}
                                </Button>
                            </div>


                        </form>
                    </Form>
                    <footer className={'flex justify-center gap-1'}>
                        <p>{type === 'sign-in' ? 'Don\'t have an account?' : 'Already have an account?'}</p>
                        <Link href={type === 'sign-in' ? '/sign-up' : '/sign-in'} className={'form-link'}>
                            {type === 'sign-up' ? 'Sign In' : 'Sign Up'}
                        </Link>
                    </footer>
                </>
            )}
        </section>
    )
}
export default AuthForm
