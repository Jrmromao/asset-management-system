'use client'
import HeaderBox from "@/components/HeaderBox";
import React from "react";
import AssetForm from "@/components/forms/AssetForm";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbSeparator
} from "@/components/ui/breadcrumb";
import Link from "next/link";


const Create = () => {

    return (
        <div className="">
            <Breadcrumb className="hidden md:flex pb-5">
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink asChild>
                            <Link href="/assets">Assets</Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator/>
                    <BreadcrumbItem>
                        <BreadcrumbLink asChild>
                            <Link href={`/assets/create`}>Create</Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator/>
                </BreadcrumbList>
            </Breadcrumb>

            <div>
                <HeaderBox
                    title="Create new asset"
                    subtext="Fill the form to create new asset."
                />
            </div>
            <AssetForm/>
        </div>

    )
}
export default Create
