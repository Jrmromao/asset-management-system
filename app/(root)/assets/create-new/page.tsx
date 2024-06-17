'use client'
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import HeaderBox from "@/components/HeaderBox";
import RecentTransactions from "@/components/RecentTransactions";
import React from "react";
import CustomInput from "@/components/CustomInput";
import {Form} from "@/components/ui/form";
import {useForm} from "react-hook-form";
import {z} from "zod";
import {zodResolver} from "@hookform/resolvers/zod";
import {assetFormSchema} from "@/lib/utils";
import AssetForm from "@/components/AssetForm";


const CreateNew = () => {

    return (
        <div className="transactions">
            <div className="transactions-header">
                <HeaderBox
                    title="Create new asset"
                    subtext="Fill the form to create new asset."
                />
            </div>
            <div className="space-y-6">
                <section className="flex w-full flex-col gap-6">
                    <AssetForm />
                </section>
            </div>
        </div>

    )
}
export default CreateNew
