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
import {Loader2} from "lucide-react";
import {registerCompany} from "@/lib/actions/company.actions";
import CustomButton from "@/components/CustomButton";
import {signIn} from "next-auth/react";
import {FaGithub, FaGoogle} from "react-icons/fa";
import CustomInput from "@/components/CustomInput";

const AuthForm = () => {
    const [isLoading, setIsLoading] = useState(false)
    const [user, setUser] = useState(null)

    const authFormSchema = () => z.object({
        email: z.string().email("Invalid email"),
        password: z.string()
            .min(8, {message: "Password must be at least 8 characters long"})
            .max(20, {message: "Password must not exceed 20 characters"}),

    });


    const formSchema = authFormSchema()

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: '',
            password: '',
        },
    });

    const router = useRouter()

    const onSubmit = async (data: z.infer<typeof formSchema>) => {
        setIsLoading(true)

        try {

            if (data.email !== '' && data.password !== '') {
                console.log(data)
                const response = await signIn('credentials', {
                    email: data.email,
                    password: data.password,
                    redirect: false
                })
                if (response?.ok) {
                    form.reset()
                    router.push('/')

                }
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

                        {/*{user ? 'Link Account' : type === 'sign-in' ? 'Sign In' : 'Sign Up'}*/}


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
                            <>

                                <CustomInput control={form.control}  {...form.register("email")}
                                             label={'Email'}
                                             placeholder={'Enter your email'} type={'text'}/>
                                <CustomInput control={form.control}  {...form.register("password")}
                                             label={'Password'}
                                             placeholder={'Password'} type={'password'}/>

                                <Link href={'/auth/forgot-password'} className={'text-12 text-gray-500'}>
                                    Forgot Password
                                </Link>
                            </>

                            <div className={'flex flex-col gap-4'}>
                                <Button type="submit" className={'form-btn'} disabled={isLoading}>
                                    {isLoading ? (<><Loader2 size={20} className={'animate-spin'}/>&nbsp; Loading... </>) :  'Sign In'}
                                </Button>
                            </div>
                        </form>
                    </Form>



                        <>
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                    <div className="w-full border-t border-gray-300"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-2 bg-white text-gray-500">OR</span>
                                </div>
                            </div>

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
                        </>



                    <footer className={'flex justify-center gap-1'}>
                        <p>{'Don\'t have an account?'}</p>
                        <Link href={ '/sign-up'} className={'form-link'}>
                            Register
                        </Link>
                    </footer>
                </>
            )}
        </section>
    )
}
export default AuthForm
