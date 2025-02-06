"use client";
import React from "react";
import HeaderBox from "@/components/HeaderBox";
import AccessoryForm from "@/components/forms/AccessoryForm";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Link from "next/link";

const Create = () => {
  return (
    <div className="p-6 space-y-6">
      <Breadcrumb className="hidden md:flex pb-5">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/accessories">Accessories</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href={`/accessories/create`}>Create</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
        </BreadcrumbList>
      </Breadcrumb>

      <HeaderBox
        title="Create an Accessory"
        subtext="Fill the form to create an Accessory."
      />

      <AccessoryForm />
    </div>
  );
};
export default Create;
