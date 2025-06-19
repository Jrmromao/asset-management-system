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
    <div className="p-6 space-y-6 bg-white dark:bg-gray-900 min-h-screen">
      <Breadcrumb className="hidden md:flex pb-5">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/assets" className="text-slate-600 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white">
                Assets
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator className="text-slate-400 dark:text-gray-600" />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href={`/assets/create`} className="text-slate-600 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white">
                Create
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator className="text-slate-400 dark:text-gray-600" />
        </BreadcrumbList>
      </Breadcrumb>

      <HeaderBox
        title="Create new asset"
        subtitle="Fill the form to create new asset."
        icon={<Laptop className="h-6 w-6" />}
        className="dark:bg-gray-800 dark:border-gray-700"
      />

      <AssetForm />
    </div>
  );
};

export default Create;
