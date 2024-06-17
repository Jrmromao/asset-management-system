'use client'
import React, {useState} from 'react'
import Link from "next/link";
import Image from "next/image";
import {z} from "zod"
import {zodResolver} from "@hookform/resolvers/zod"
import {useForm} from "react-hook-form"
import {Button} from "@/components/ui/button"
import {
    Form, FormControl, FormField, FormLabel, FormMessage,
} from "@/components/ui/form"
import CustomInput from "@/components/CustomInput";
import {assetFormSchema} from "@/lib/utils";
import {Loader2} from "lucide-react";
import {useRouter} from "next/navigation";
// import {getLoggedInUser, signIn, signUp} from "@/lib/actions/user.actions";
import PlaidLink from "@/components/PlaidLink";
import {Input} from "@/components/ui/input";

const AuthForm = ({type= 'sign-up'}: { type: string }) => {
    const [isLoading, setIsLoading] = useState(false)
    const [user, setUser] = useState(null)
    const formSchema = assetFormSchema(type)
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
        <section className={''}>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}
                      className="flex flex-col gap-4">
                    <FormField
                        control={form.control}
                        name={'state'}
                        render={({field}) => (
                            <div className={'form-item'}>
                                <FormLabel className={'form-label'}>
                                    Yesy
                                </FormLabel>
                                <div className={'flex w-full flex-col'}>
                                    <FormControl>
                                        <Input
                                            placeholder={'placeholder'}
                                            className={'input-class'} {...field}
                                            type={type}
                                        />
                                    </FormControl>
                                    <FormMessage className={'form-message mt-2'}/>
                                </div>
                            </div>
                        )}
                    />
                        <CustomInput control={form.control} name={'firstName'} label={'First Name'} placeholder={'ex: Joe'} type={'text'}/>
                        <CustomInput control={form.control} name={'lastName'} label={'Last Name'} placeholder={'ex: Doe'} type={'text'}/>



                    <Button type="submit" className={'form-btn'} disabled={isLoading}>
                        {isLoading ? (
                            <>
                                <Loader2 size={20} className={'animate-spin'}/>&nbsp;
                                Loading...
                            </>
                        ) : type === 'sign-in'
                            ? 'Sign In' : 'Sign Up'}
                    </Button>


                </form>
            </Form>
            <footer className={'flex justify-center gap-1'}>
                <p>{type === 'sign-in' ? 'Don\'t have an account?' : 'Already have an account?'}</p>
                <Link href={type === 'sign-in' ? '/sign-up' : '/sign-in'} className={'form-link'}>
                    {type === 'sign-up' ? 'Sign In' : 'Sign Up'}
                </Link>
            </footer>

        </section>
    )
}
export default AuthForm
