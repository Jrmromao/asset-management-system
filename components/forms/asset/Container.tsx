// import React, {useState} from 'react'
// import Stepper from "@/components/forms/Stepper";
// import {useMultistepForm} from "@/components/hooks/useMultistepForm";
// import AssetForm from "@/components/forms/asset/AssetForm";
// import LicenseForm from "@/components/forms/LicenseForm";
// import {Button} from "@/components/ui/button";
// import {Loader2} from "lucide-react";
// import {useForm} from "react-hook-form";
// import {zodResolver} from "@hookform/resolvers/zod";
// import {z} from "zod";
// import {assetFormSchema, licenseSchema} from "@/lib/utils";
// import {Form} from "@/components/ui/form";
//
// const Container = () => {
//     const [isLoading, setIsLoading] = useState(false)
//     const [index, setIndex] = useState(0)
//  const schemas = [assetFormSchema, licenseSchema]
//
//
//
//     const assetForm = useForm({
//         resolver: zodResolver(schemas[index]),
//         defaultValues: {
//             assetName: '',
//             category: '',
//             brand: '',
//             model: '',
//             serialNumber: '',
//             purchasePrice: '',
//             key: '',
//             licenseName: '',
//         },
//     })
//     const {step, next, back, currentStepIndex, steps, isFirstStep, isLastStep}
//         = useMultistepForm([  <AssetForm key={1} form={assetForm}/>, <LicenseForm key={14} form={assetForm}/>])
//
//
//
//     const onSubmit = async (data: z.infer<typeof assetFormSchema>) => {
//         try {
//
//              if (currentStepIndex === 0) {
//                 const result = await assetFormSchema.parseAsync(data);
//                  setIndex(currentStepIndex)
//             } else if (currentStepIndex === 1) {
//
//                  setIndex(currentStepIndex)
//                 const result = await licenseSchema.parseAsync(data);
//             }
//             next()
//         } catch (error) {
//             console.error(error);
//
//         }
//     };
//
//
//     return (
//         <>
//             <Stepper steps={['Asset Info', 'Licenses']} currentStep={currentStepIndex}/>
//
//
//             <Form {...assetForm}>
//                 <form onSubmit={assetForm.handleSubmit(onSubmit)}>
//                     {step}
//                     <div className="flex justify-between mt-4">
//                         {isFirstStep &&
//                           <Button className="bg-gray-500 text-white py-2 px-4 rounded disabled:opacity-50"
//                                   type={'button'}
//                                   onClick={back}>Back</Button>}
//                         {!isLastStep &&
//                           <Button className="bg-blue-600 text-white py-2 px-4 rounded" type={'submit'}>Next</Button>}
//                         {isLastStep &&
//                           <Button type="submit" className={'bg-blue-600 text-white py-2 px-4 rounded'}
//                                   disabled={isLoading}>
//                               {isLoading ? (
//                                       <>
//                                           <Loader2 size={20} className={'animate-spin'}/>&nbsp;
//                                           Loading...
//                                       </>
//                                   ) :
//                                   'Submit'}
//                           </Button>}
//                     </div>
//                 </form>
//             </Form>
//         </ >
//     )
// }
// export default Container
//
