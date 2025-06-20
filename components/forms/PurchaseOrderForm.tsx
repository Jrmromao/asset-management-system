"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  createPurchaseOrder,
  updatePurchaseOrder,
} from "@/lib/actions/purchaseOrder.actions";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useEffect, useState } from "react";
import { Supplier } from "@prisma/client";
import { getAllSuppliers } from "@/lib/actions/supplier.actions";
import CustomDatePicker from "@/components/CustomDatePicker";

const formSchema = z.object({
  poNumber: z.string().min(1, "PO Number is required"),
  supplierId: z.string().optional(),
  purchaseDate: z.date(),
  status: z.string().min(1, "Status is required"),
  notes: z.string().optional(),
  totalAmount: z.coerce.number().min(0),
  document: z.any().optional(),
  companyId: z.string(),
});

type PurchaseOrderFormValues = z.infer<typeof formSchema>;

interface PurchaseOrderFormProps {
  purchaseOrder?: any;
  companyId: string;
}

export function PurchaseOrderForm({
  purchaseOrder,
  companyId,
}: PurchaseOrderFormProps) {
  const router = useRouter();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);

  useEffect(() => {
    async function fetchSuppliers() {
      const response = await getAllSuppliers();
      if (response.success && response.data) {
        setSuppliers(response.data);
      }
    }
    fetchSuppliers();
  }, [companyId]);

  const form = useForm<PurchaseOrderFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: purchaseOrder
      ? {
          ...purchaseOrder,
          purchaseDate: new Date(purchaseOrder.purchaseDate),
          companyId,
        }
      : {
          poNumber: "",
          status: "draft",
          totalAmount: 0,
          notes: "",
          companyId,
        },
  });

  const onSubmit = async (values: PurchaseOrderFormValues) => {
    const formData = new FormData();
    Object.keys(values).forEach((key) => {
      const value = values[key as keyof typeof values];
      if (key === "document" && value instanceof FileList) {
        if (value.length > 0) {
          formData.append(key, value[0]);
        }
      } else if (value !== undefined && value !== null) {
        formData.append(key, value.toString());
      }
    });

    try {
      if (purchaseOrder) {
        formData.append("existingDocumentUrl", purchaseOrder.documentUrl || "");
        await updatePurchaseOrder(purchaseOrder.id, formData);
        router.push(`/admin/purchase-orders/${purchaseOrder.id}`);
      } else {
        await createPurchaseOrder(formData);
        router.push("/admin/purchase-orders");
      }
      router.refresh();
    } catch (error) {
      console.error("Failed to save purchase order:", error);
      // Handle error, e.g., show a toast message
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="poNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Purchase Order Number</FormLabel>
              <FormControl>
                <Input placeholder="PO12345" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="supplierId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Supplier</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a supplier" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {suppliers.map((supplier) => (
                    <SelectItem key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <CustomDatePicker
          label="Purchase Date"
          name="purchaseDate"
          form={form}
          required
        />
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="submitted">Submitted</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="received">Received</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="totalAmount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Total Amount</FormLabel>
              <FormControl>
                <Input type="number" placeholder="0.00" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea placeholder="Notes about the PO" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="document"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Document</FormLabel>
              <FormControl>
                <Input
                  type="file"
                  onChange={(e) => field.onChange(e.target.files)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit">
          {purchaseOrder ? "Update" : "Create"} Purchase Order
        </Button>
      </form>
    </Form>
  );
}
