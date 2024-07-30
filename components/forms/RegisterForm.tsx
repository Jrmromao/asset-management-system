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

const RegisterForm = () => {
    const [isLoading, setIsLoading] = useState(false)
    const [user, setUser] = useState(null)

    const authFormSchema = () => z.object({
        email: z.string().email("Invalid email"),
        password: z.string()
            .min(8, {message: "Password must be at least 8 characters long"})
            .max(20, {message: "Password must not exceed 20 characters"}),
        repeatPassword: z.string().min(1, "Password is required"),
        firstName: z.string().min(1, "First name is required"),
        lastName: z.string().min(1, "Last name is required"),
        phoneNumber: z.string().min(1, "Phone number is required"),
        companyName: z.string().min(1, "Company name is required"),

    });


    const formSchema = authFormSchema()

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
    });

    const router = useRouter()

    const onSubmit = async (data: z.infer<typeof formSchema>) => {
        setIsLoading(true)

        try {

            if (data) {
                await registerCompany({
                    companyName: data?.companyName || '',
                    email: data.email || '',
                    password: data.password || '',
                    phoneNumber: data.phoneNumber || '',
                    firstName: data.firstName || '',
                    lastName: data.lastName || '',
                }).then(() => {
                    form.reset()
                    router.push('/')
                })
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
                                <div className={''}>

                                    <CustomInput
                                        label="Company Name"
                                        placeholder={'ex: Qlientel'}
                                        control={form.control}
                                        {...form.register("companyName")}
                                        type={'text'}
                                    />


                                    <div className={'text-12 text-gray-500 mt-4'}>
                                        The company name will be used as a domain for your account. For example,
                                        your account might be qlientel.pdfintel.com
                                    </div>
                                </div>
                                <div className={'flex gap-4'}>

                                    <CustomInput
                                        label="First Name"
                                        placeholder={'ex: Joe'}
                                        control={form.control}
                                        {...form.register("firstName")}
                                        type={'text'}
                                    />
                                    <CustomInput control={form.control}
                                                 label={'Last Name'}
                                                 {...form.register("lastName")}
                                                 placeholder={'ex: Doe'}
                                                 type={'text'}/>
                                </div>
                                <div className={'flex gap-4'}>
                                    <CustomInput control={form.control}
                                                 label={'Password'}
                                                 {...form.register("password")}
                                                 placeholder={''}
                                                 type={'text'}/>

                                    <CustomInput control={form.control}  {...form.register("repeatPassword")}
                                                 label={'Repeat Password'} placeholder={''} type={'text'}/>
                                </div>
                                <div className={'gap-4'}>
                                    <CustomInput control={form.control}  {...form.register("email")}
                                                 label={'Email address'}
                                                 placeholder={'Enter your email'} type={'text'}/>
                                </div>
                                <div className={'gap-4'}>
                                    <CustomInput control={form.control}  {...form.register("phoneNumber")}
                                                 label={'Phone Number'}
                                                 placeholder={'Enter your phone number'} type={'text'}/>
                                </div>
                            </>

                            <div className={'flex flex-col gap-4'}>
                                <Button type="submit" className={'form-btn'} disabled={isLoading}>
                                    {isLoading ? (<><Loader2 size={20}
                                                             className={'animate-spin'}/>&nbsp; Loading... </>) : 'Sign Up'}
                                </Button>
                            </div>
                        </form>
                    </Form>
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                    <div className="w-full border-t border-gray-300"></div>
                                </div>
                            </div>
                        </>
                    )}


                    <footer className={'flex justify-center gap-1'}>
                        <p>{'Already have an account?'}</p>
                        <Link href={'/sign-in'} className={'form-link'}>
                            Sign In
                        </Link>
                    </footer>

        </section>
    )
}
export default RegisterForm
