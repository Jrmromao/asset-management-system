'use client'
import React, {useState} from 'react'
import {z} from "zod"
import {zodResolver} from "@hookform/resolvers/zod"
import {useForm} from "react-hook-form"
import {Button} from "@/components/ui/button"
import {Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage,} from "@/components/ui/form"
// import CustomInput from "@/components/forms/CustomInput";
import {cn, formSchema as categoryFormSchema, formSchema as licenseFormSchema} from "@/lib/utils";
import {useRouter} from "next/navigation";
import {CalendarIcon, Loader2} from "lucide-react";
import {licenseStore, useDialogStore} from "@/lib/stores/store";
import {Calendar} from "@/components/ui/calendar";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {format} from "date-fns";
import {Input} from "@/components/ui/input";
import CustomInput from "@/components/CustomInput";

const LicenseForm = () => {
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()
    const [setLicenses, updateRefresh] = licenseStore((state) => [state.setLicenses, state.updateRefresh])
    const [date, setDate] = useState<Date>();

    const catFormSchema = categoryFormSchema()

    const form = useForm<z.infer<typeof catFormSchema>>({
        resolver: zodResolver(catFormSchema),
        defaultValues: {
            id: '',
            assetName: '',
            category: '',
            brand: '',
            model: '',
            serialNumber: '',
            purchasePrice: '',
            key: '',
            issuedDate: '',
            expirationDate: '',
        },
    })


    const onSubmit = async (data: z.infer<typeof catFormSchema>) => {
        setIsLoading(true)


    }
    return (
        <section className="w-full bg-white z-50">
            <Form {...form}>
                <form>

                    <div className={'flex flex-col md:flex-row gap-4 pt-5'}>
                        <div className={'flex-1'}>

                        </div>
                        <div className={'flex-1'}>

                        </div>
                    </div>

                    <div className={'flex flex-col md:flex-row gap-4 pt-5'}>
                        <div className={'flex-1'}>

                        </div>
                        <div className={'flex-1'}>


                        </div>

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
            </Form>
        </section>
    )
}
// export default LicenseForm
//
// import React, { useState, useRef } from 'react';
// import { useForm, FormProvider } from 'react-hook-form';
// import { FiCheckCircle } from 'react-icons/fi';
//
// const Step = ({ step, title, isActive, isCompleted }: { step: number, title: string, isActive: boolean, isCompleted: boolean }) => (
//     <div className="flex items-center">
//         <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${isCompleted ? 'bg-blue-600 text-white border-blue-600' : isActive ? 'bg-blue-100 text-blue-600 border-blue-600' : 'bg-gray-100 text-gray-600 border-gray-300'}`}>
//             {isCompleted ? <FiCheckCircle /> : step}
//         </div>
//         <div className="ml-2">
//             <div className={`${isActive || isCompleted ? 'text-blue-600' : 'text-gray-600'}`}>{title}</div>
//         </div>
//     </div>
// );
//
// const Stepper = ({ steps, currentStep } : { steps: string[], currentStep: number }) => (
//     <div className="flex justify-between mb-8">
//         {steps.map((step, index) => (
//             <React.Fragment key={index}>
//                 <Step
//                     step={index + 1}
//                     title={step}
//                     isActive={currentStep === index}
//                     isCompleted={currentStep > index}
//                 />
//                 {index < steps.length - 1 && (
//                     <div className={`flex-1 border-t-2 ${currentStep > index ? 'border-blue-600' : 'border-gray-300'}`}></div>
//                 )}
//             </React.Fragment>
//         ))}
//     </div>
// );
//
// const LicenseForm = () => {
//     const methods = useForm();
//     const [currentStep, setCurrentStep] = useState(0);
//     const steps = ['Asset Info', 'Licenses', 'Review'];
//
//     // const contactInfoRef = useRef(null);
//     // const dateTimeRef = useRef(null);
//     // const roomsRef = useRef(null);
//
//     const handleNext = () => {
//         setCurrentStep((prev) => prev + 1);
//     };
//
//     const handleBack = () => {
//         setCurrentStep((prev) => prev - 1);
//     };
//
//     return (
//         <FormProvider {...methods}>
//             <form>
//                 <Stepper steps={steps} currentStep={currentStep} />
//                 {currentStep === 0 && (
//                     <div>
//                         <label>Asset Info</label>
//
//
//                         <input name="contactInfo" className="block border-2 border-gray-300 p-2 rounded w-full" />
//
//                     </div>
//
//
//
//                 )}
//                 {currentStep === 1 && (
//                     <div>
//                         <label>Licenses</label>
//                         <input  name="dateTime" className="block border-2 border-gray-300 p-2 rounded w-full" />
//                     </div>
//                 )}
//                 {currentStep === 2 && (
//                     <div>
//                         <label>Review</label>
//                         <input  name="rooms" className="block border-2 border-gray-300 p-2 rounded w-full" />
//                     </div>
//                 )}
//                 <div className="flex justify-between mt-4">
//                     <button type="button" onClick={handleBack} disabled={currentStep === 0} className="bg-gray-500 text-white py-2 px-4 rounded disabled:opacity-50">
//                         Back
//                     </button>
//                     <button type="button" onClick={handleNext} disabled={currentStep === steps.length - 1} className="bg-blue-600 text-white py-2 px-4 rounded">
//                         Next
//                     </button>
//                 </div>
//             </form>
//         </FormProvider>
//     );
// };
//
// export default LicenseForm;
