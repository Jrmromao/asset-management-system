'use client'
import React, {useState} from 'react'
import {z} from "zod"
import {zodResolver} from "@hookform/resolvers/zod"
import {useForm} from "react-hook-form"
import {Button} from "@/components/ui/button"
import {Form,} from "@/components/ui/form"
import CustomInput from "@/components/CustomInput";
import {assetFormSchema} from "@/lib/utils";
import {Loader2} from "lucide-react";
import {useRouter} from "next/navigation";
// import {getLoggedInUser, signIn, signUp} from "@/lib/actions/user.actions";

const AssetForm = () => {
    const [isLoading, setIsLoading] = useState(false)
    const [user, setUser] = useState(null)
    const formSchema = assetFormSchema()
    const router = useRouter()
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            assetId: '',
            title: '',
            description: '',
            category: '',
            notes: '',
            status: '',
            brand: '',
            purchaseNotes: '',
            serialNumber: '',
            purchasePrice: '',
            purchaseDate: '',
            image: '',
        },
    })

    const onSubmit = async (data: z.infer<typeof formSchema>) => {
        setIsLoading(true)

        try {
            const assetData = {
                assetId: data.assetId,
                title: data.title,
                description: data.description,
                category: data.category,
                status: data.status,
                brand: data.brand,
                purchaseNotes: data.purchaseNotes,
                serialNumber: data.serialNumber,
                purchasePrice: data.purchasePrice,
                purchaseDate: data.purchaseDate,
                image: data.image,
            }
            // const newAsset = await addAsset(assetData)
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

                    <div className={'flex'}>
                        <CustomInput control={form.control} name={'assetId'} label={'Asset ID'}  placeholder={'Auto generate'} type={'text'}/>

                        <CustomInput control={form.control} name={'title'} label={'Title'} placeholder={'title'}  type={'text'}/>
                    </div>
                    <div className={'flex'}>
                        <CustomInput control={form.control} name={'description'} label={'Description'}  placeholder={'description'} type={'textarea'}/>
                        <CustomInput control={form.control} name={'category'} label={'Category'} placeholder={'category'}  type={'text'}/>
                    </div>

                    <div className={'flex w-full-col'}>
                        <CustomInput control={form.control} name={'status'} label={'Status'} placeholder={'status'}
                                     type={'text'}/>
                        <CustomInput control={form.control} name={'brand'} label={'Brand'} placeholder={'brand'}
                                     type={'text'}/>
                    </div>

                        <CustomInput control={form.control} name={'purchaseNotes'} label={'Purchase Notes'}
                                     placeholder={'purchaseNotes'} type={'text'}/>
                        <CustomInput control={form.control} name={'purchasePrice'} label={'Purchase Price'}
                                     placeholder={'purchasePrice'} type={'text'}/>
                        <CustomInput control={form.control} name={'purchaseDate'} label={'Purchase Date'}
                                     placeholder={'purchaseDate'} type={'text'}/>
                        <CustomInput control={form.control} name={'image'} label={'Image'} placeholder={'image'}
                                     type={'upload'}/>

                        <Button type="submit" className={'form-btn'} disabled={isLoading}>
                            {isLoading ? (
                                    <>
                                        <Loader2 size={20} className={'animate-spin'}/>&nbsp;
                                        Loading...
                                    </>
                                ) :
                                'Submit'}
                        </Button>


                </form>
            </Form>


        </section>
)
}
export default AssetForm
