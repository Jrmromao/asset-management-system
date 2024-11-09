'use client'
import React, {useEffect, useState, useTransition} from 'react'
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
import {assetAssignSchema, loginSchema} from "@/lib/schemas";
import {FormError} from "@/components/forms/form-error";
import {login} from "@/lib/actions/user.actions";
import {signIn} from "next-auth/react";
import {DEFAULT_LOGIN_REDIRECT} from "@/routes";
import {APP_NAME} from "@/constants";
import {assign} from "@/lib/actions/assets.actions";
import CustomSelect from "@/components/CustomSelect";
import {useUserStore} from "@/lib/stores/userStore";
import {useAssetStore} from "@/lib/stores/assetStore";


interface Props {
    assetId: string
}

const AssignAssetForm = ({assetId}: Props) => {



    const [error, setError] = useState<string>('')
    const [isPending, startTransition] = useTransition()
    const form = useForm<z.infer<typeof assetAssignSchema>>({
        resolver: zodResolver(assetAssignSchema),
        defaultValues: {
            userId: '',
            assetId: assetId,
        },
    });

    const [onClose,assignAsset] = useAssetStore((state) => [state.onAssignClose, state.assign])

    const onSubmit = async (data: z.infer<typeof assetAssignSchema>) => {
        startTransition(async () => {
            try {
                const response = await assign(data)
                if (response?.error) {
                    setError(response.error)
                }
                assignAsset(String(data.assetId), data.userId)
            } catch (e) {
                console.error(e)
            } finally {
                onClose()

            }
        })
    }


    const [getAllUsers, users] = useUserStore((state) => [state.getAll, state.users]);

    useEffect(() => {
        getAllUsers()
    }, [])

    return (
        <section className="w-full bg-white z-50 max-h-[700px] overflow-y-auto p-4">


            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <>
                        <CustomSelect control={form.control}
                                      {...form.register("userId")}
                                      label={'Name'}
                                      placeholder={'Select User'}
                                      disabled={isPending}
                                      name={'userId'}
                                      data={[]}
                                      value={form.watch('userId')}
                        />

                    </>
                    <FormError message={error}/>
                    <div className={'flex flex-col gap-4'}>
                        <Button type="submit" className={'form-btn'} disabled={isPending}>
                            {isPending ? (<><Loader2 size={20}
                                                     className={'animate-spin'}/>&nbsp; Assigning... </>) : 'Assign'}
                        </Button>
                    </div>
                </form>
            </Form>


        </section>
    )
}
export default AssignAssetForm
