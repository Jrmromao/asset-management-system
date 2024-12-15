import {NextResponse} from "next/server";
import {prisma} from "@/app/db";


export async function POST(req: Request) {
    try {
        const {companyName} = await req.json();

        const existingCompany = await prisma.company.findFirst({
            where: {
                name: {equals: companyName, mode: 'insensitive'}
            }
        });

        console.log(existingCompany)

        return NextResponse.json(!!existingCompany);
    } catch (error) {
        return NextResponse.json({error: "Error checking company name"}, {status: 500});
    }
}
