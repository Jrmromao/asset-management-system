"use client";
import HeaderBox from "@/components/HeaderBox";
import React from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Link from "next/link";
import { Laptop } from "lucide-react";
import AssetForm from "@/components/forms/AssetForm";

const Create = () => {
  return (
    <div className="p-6 space-y-6">
      <Breadcrumb className="hidden md:flex pb-5">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/assetsx">Assets</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href={`//assets/create`}>Create</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
        </BreadcrumbList>
      </Breadcrumb>

      <HeaderBox
        title="Create new asset"
        subtext="Fill the form to create new asset."
        icon={<Laptop className="h-6 w-6" />}
      />

      <AssetForm />
    </div>
  );
};
export default Create;
