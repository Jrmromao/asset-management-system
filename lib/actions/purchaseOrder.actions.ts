"use server";

import { prisma } from "@/app/db";
import S3Service from "@/services/aws/S3";
import { revalidatePath } from "next/cache";

export async function createPurchaseOrder(formData: FormData) {
  const s3 = S3Service.getInstance();
  const companyId = formData.get("companyId") as string;
  const file = formData.get("document") as File;

  let documentUrl: string | undefined = undefined;

  if (file && file.size > 0) {
    const buffer = Buffer.from(await file.arrayBuffer());
    const key = `purchase-orders/${Date.now()}-${file.name}`;
    const result = await s3.uploadFile(companyId, key, buffer, file.type);
    if (result.Location) {
      documentUrl = result.Location;
    } else if (result.Key) {
      const region = process.env.AWS_REGION;
      documentUrl = `https://s3.${region}.amazonaws.com/${s3.mainBucketName}/${result.Key}`;
    }
  }

  const poNumber = formData.get("poNumber") as string;
  const supplierId = formData.get("supplierId") as string;
  const purchaseDate = new Date(formData.get("purchaseDate") as string);
  const status = formData.get("status") as string;
  const notes = formData.get("notes") as string;
  const totalAmount = parseFloat(formData.get("totalAmount") as string);

  await prisma.purchaseOrder.create({
    data: {
      poNumber,
      companyId,
      supplierId: supplierId || null,
      purchaseDate,
      status,
      notes,
      totalAmount,
      documentUrl,
    },
  });

  revalidatePath("/admin/purchase-orders"); // or wherever you list POs
}

export async function updatePurchaseOrder(id: string, formData: FormData) {
  const s3 = S3Service.getInstance();
  const companyId = formData.get("companyId") as string;
  const file = formData.get("document") as File;

  let documentUrl: string | undefined = formData.get(
    "existingDocumentUrl",
  ) as string;

  if (file && file.size > 0) {
    const buffer = Buffer.from(await file.arrayBuffer());
    const key = `purchase-orders/${Date.now()}-${file.name}`;
    const result = await s3.uploadFile(companyId, key, buffer, file.type);
    if (result.Location) {
      documentUrl = result.Location;
    } else if (result.Key) {
      const region = process.env.AWS_REGION;
      documentUrl = `https://s3.${region}.amazonaws.com/${s3.mainBucketName}/${result.Key}`;
    }
  }

  const poNumber = formData.get("poNumber") as string;
  const supplierId = formData.get("supplierId") as string;
  const purchaseDate = new Date(formData.get("purchaseDate") as string);
  const status = formData.get("status") as string;
  const notes = formData.get("notes") as string;
  const totalAmount = parseFloat(formData.get("totalAmount") as string);

  await prisma.purchaseOrder.update({
    where: { id },
    data: {
      poNumber,
      companyId,
      supplierId: supplierId || null,
      purchaseDate,
      status,
      notes,
      totalAmount,
      documentUrl,
    },
  });

  revalidatePath(`/admin/purchase-orders/${id}`);
}

export async function getPurchaseOrders(companyId: string) {
  try {
    const purchaseOrders = await prisma.purchaseOrder.findMany({
      where: { companyId },
      orderBy: {
        createdAt: "desc",
      },
    });
    return purchaseOrders;
  } catch (error) {
    console.error("Failed to fetch purchase orders:", error);
    return [];
  }
}
