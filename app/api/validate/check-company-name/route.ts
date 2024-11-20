import { NextResponse } from "next/server";
import {PrismaClient} from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
    try {
        const { name } = await req.json();

        const existingCompany = await prisma.company.findFirst({
            where: {
                name: { equals: name, mode: 'insensitive' }  // Case-insensitive check
            }
        });

        return NextResponse.json(!!existingCompany);
    } catch (error) {
        return NextResponse.json({ error: "Error checking company name" }, { status: 500 });
    }
}