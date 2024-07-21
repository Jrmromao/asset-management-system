'use client'
import React, {useState} from 'react'
import Link from "next/link";
import Image from "next/image";
import {Button} from "@/components/ui/button";
import {useRouter} from "next/navigation";
import {useForm} from "react-hook-form";
import {Form,} from "@/components/ui/form"
import {zodResolver} from "@hookform/resolvers/zod";
import {z} from "zod";
import {formSchema as authFormSchema} from "@/lib/utils";
import CustomInput from "@/components/forms/CustomInput";
import {Loader2} from "lucide-react";
import {registerCompany} from "@/lib/actions/company.actions";
import CustomButton from "@/components/CustomButton";
import {signIn} from "next-auth/react";
import {FaGithub, FaGoogle} from "react-icons/fa";

const AuthForm = ({type}: { type: string }) => {
    const [isLoading, setIsLoading] = useState(false)
    const [user, setUser] = useState(null)

    const formSchema = authFormSchema(type)
    const router = useRouter()
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: '',
            password: '',
            firstName: '',
            lastName: '',
            phoneNumber: '',
            companyName: '',
            repeatPassword: ''
        },
    })




    const onSubmit = async (data: z.infer<typeof formSchema>) => {
        setIsLoading(true)

        console.log(data)
        try {
            if (type === 'sign-up') {

                if (data) {
                    await registerCompany({
                        companyName: data?.companyName || '',
                        email: data.email || '',
                        password: data.password || '',
                        phoneNumber: data.phoneNumber || '',
                        firstName: data.firstName || '',
                        lastName: data.lastName || '',
                    }).then(() => {
                        router.push('/')
                    })
                }
            }
            if (type === 'sign-in') {
                const response = true
                console.log(data)
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
                    <h1 className="sidebar-logo">Asset Sea</h1>
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
                    Joao Filipe Romão
                </div>
            ) : (<>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                            {type === 'sign-up' && (
                                <>
                                    <div className={''}>
                                        <CustomInput control={form.control} name={'companyName'} label={'Company Name'}
                                                     placeholder={'ex: Qlientel'} type={'text'}/>
                                        <div className={'text-12 text-gray-500 mt-4'}>
                                            The company name will be used as a domain for your account. For example,
                                            your account might be qlientel.pdfintel.com
                                        </div>
                                    </div>
                                    <div className={'flex gap-4'}>
                                        <CustomInput control={form.control} name={'firstName'} label={'First Name'}
                                                     placeholder={'ex: Joe'} type={'text'}/>
                                        <CustomInput control={form.control} name={'lastName'} label={'Last Name'}
                                                     placeholder={'ex: Doe'} type={'text'}/>
                                    </div>
                                    <div className={'flex gap-4'}>
                                        <CustomInput control={form.control} name={'password'} label={'Password'}
                                                     placeholder={''} type={'text'}/>
                                        <CustomInput control={form.control} name={'repeatPassword'}
                                                     label={'Repeat Password'} placeholder={''} type={'text'}/>
                                    </div>
                                    <div className={'gap-4'}>
                                        <CustomInput control={form.control} name={'email'} label={'Email address'}
                                                     placeholder={'Enter your email'} type={'text'}/>
                                    </div>
                                    <div className={'gap-4'}>
                                        <CustomInput control={form.control} name={'phoneNumber'} label={'Phone Number'}
                                                     placeholder={'Enter your phone number'} type={'text'}/>
                                    </div>
                                </>
                            )}

                            {type === 'sign-in' && (
                                <>
                                    <CustomInput control={form.control} name={'email'}
                                                 placeholder={'Please enter your email'} label={'Email'} type={'text'}/>
                                    <CustomInput control={form.control} name={'password'}
                                                 placeholder={'Please enter your password'} label={'Password'}
                                                 type={'password'}/>
                                </>
                            )}
                            <div className={'flex flex-col gap-4'}>
                                <Button type="submit" className={'form-btn'} disabled={isLoading}>
                                    {isLoading ? (<><Loader2 size={20}
                                                             className={'animate-spin'}/>&nbsp; Loading... </>) : type === 'sign-in' ? 'Sign In' : 'Sign Up'}
                                </Button>
                            </div>
                        </form>
                    </Form>


                    {type === 'sign-in' && (
                        <div className={'flex flex-col gap-4'}>
                            <CustomButton
                                className={'bg-white border border-gray-300 rounded-md py-2 px-4 flex items-center hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-black-1 w-full'}
                                size="lg"
                                variant="outline"
                                action={() => signIn('google', {callbackUrl: '/'})}
                                value="Sign In with Google"
                                Icon={FaGoogle}
                            />

                            <CustomButton
                                className={'bg-[#24292F] text-white border border-gray-600 rounded-md py-2 px-4 flex items-center hover:bg-[#333] focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 w-full'}
                                size="lg"
                                variant="default"
                                action={() => signIn('github', {callbackUrl: '/'})}
                                value="Sign In with Github"
                                Icon={FaGithub}
                            />
                        </div>
                    )}


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
