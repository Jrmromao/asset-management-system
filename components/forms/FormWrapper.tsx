import React from "react";
import { Form } from "@/components/ui/form";

type FormWrapperProps = {
  title: string;
  children: React.ReactNode;
  form: any;
  onSubmit: (data: any) => void;
};

export const FormWrapper = ({
  title,
  children,
  form,
  onSubmit,
}: FormWrapperProps) => {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        {/*<h3 className={'text-lg font-semibold'}>{title}</h3>*/}
        {children}
      </form>
    </Form>
  );
};
