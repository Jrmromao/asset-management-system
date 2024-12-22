import {NextResponse} from "next/server";
import {PrismaClient} from "@prisma/client";
import {auth} from "@/auth";

const prisma = new PrismaClient();

export async function POST(req: Request) {
    try {
        const {employeeId} = await req.json();


        console.log("\n\n------------------------>>>",employeeId)

        const session = await auth();
        const existingUser = await prisma.user.findFirst({
                where: {
                    employeeId: String(employeeId),
                    companyId: session?.user.companyId
                }
            }
        );

        return NextResponse.json(!!existingUser);
    } catch (error) {
        return NextResponse.json({error: "Error checking employee ID"}, {status: 500});
    }
}