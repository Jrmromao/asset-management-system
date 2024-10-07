'use client'
import React, {useState} from 'react'
import {z} from "zod"
import {zodResolver} from "@hookform/resolvers/zod"
import {useForm} from "react-hook-form"
import {Button} from "@/components/ui/button"
import {Loader2} from "lucide-react";
import {kitItemSchema} from "@/lib/schemas";
import CustomSelect from "@/components/CustomSelect";
import {useStatusLabelStore} from "@/lib/stores/statusLabelStore";
import {useKitStore} from "@/lib/stores/kitStore";
import {useAssetStore} from "@/lib/stores/assetStore";
import {useLicenseStore} from "@/lib/stores/licenseStore";
import {useAccessoryStore} from "@/lib/stores/accessoryStore";


interface KitItemFormProps {
    data: Asset[] | License[] | Category[]
    name: string
    placeholder: string
    value: any
    label: string
    onClose: () => void

}


const KitItemForm = ({data, name, placeholder, value, label, onClose}: KitItemFormProps) => {
    const [isLoading, setIsLoading] = useState(false)
    const form1 = useForm<z.infer<typeof kitItemSchema>>({
        resolver: zodResolver(kitItemSchema),
        defaultValues: {
            itemID: '',
        },
    });

    const [appendItem] = useKitStore((state) => [state.appendItem]);
    const [assets] = useAssetStore((state) => [state.assets]);
    const [licenses] = useLicenseStore((state) => [state.licenses]);
    const [accessories] = useAccessoryStore(state => [state.accessories])


    const onSubmit = async (data: z.infer<typeof kitItemSchema>) => {

        if(name === 'assetId')
            console.log(assets)
        if (name === 'accessoryId')
            console.log(accessories)
        if(name === 'licenseId')
            console.log(licenses)
        // appendItem(String(data)).then(
        //     _ => onClose()
        // )
    }

    return (
        <section className={''}>
            <form {...form1} onSubmit={form1.handleSubmit(onSubmit)}>
                    <div className={'flex flex-col md:flex-col gap-4 pt-5'}>
                        <CustomSelect control={form1.control}
                                      {...form1.register("itemID")}
                                      label={label}
                                      data={data}
                                      placeholder={placeholder}
                                      value={form1.watch('itemID')}
                        />
                    </div>


                <Button type="submit" className={'form-btn mt-6 w-full md:w-auto'} disabled={isLoading}>
                    {isLoading ? (
                            <>
                                <Loader2 size={20} className={'animate-spin'}/>&nbsp;
                                Loading...
                            </>
                        ) :
                        'Submit'}
                </Button>
            </form>


        </section>
    )
}
export default KitItemForm
