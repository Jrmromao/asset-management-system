// app/api/check-employeeId/route.ts
import {NextResponse} from "next/server";
import {PrismaClient} from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
    try {
        const {employeeId} = await req.json();

        const existingUser = await prisma.user.findFirst({
                where: {
                    employeeId: String(employeeId),
                    companyId: 'bf40528b-ae07-4531-a801-ede53fb31f04'
                }
            }
        );

        return NextResponse.json(!!existingUser);
    } catch (error) {
        return NextResponse.json({error: "Error checking employee ID"}, {status: 500});
    }
}