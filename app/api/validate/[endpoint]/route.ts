
import { NextResponse } from "next/server";
import { prisma } from "@/app/db";

export async function POST(
    req: Request,
    { params }: { params: { endpoint: string } }
) {
    try {
        const body = await req.json();
        const [field, value] = Object.entries(body)[0];


        console.log("----email--->>", field, value)


        if (!value) {
            return NextResponse.json(
                { error: `${field} is required` },
                { status: 400 }
            );
        }

        let exists = false;

        switch (params.endpoint) {
            case 'company':
                const company = await prisma.company.findFirst({
                    where: {
                        name: {
                            equals: value as string,
                            mode: 'insensitive'
                        }
                    }
                });
                exists = company !== null;
                break;

            case 'email':
                const user = await prisma.user.findFirst({
                    where: {
                        email: {
                            equals: value as string,
                            mode: 'insensitive'
                        }
                    }
                });
                exists = user !== null;
                break;

            default:
                return NextResponse.json(
                    { error: "Invalid endpoint" },
                    { status: 400 }
                );
        }

        return NextResponse.json({ exists });

    } catch (error) {
        console.error('Validation error:', error);
        return NextResponse.json(
            { error: "Error during validation" },
            { status: 500 }
        );
    }
}

//
// import { NextResponse } from "next/server";
// import { prisma } from "@/app/db";
// import { auth } from "@/auth";
//
// export async function POST(
//     req: Request,
//     { params }: { params: { endpoint: string } }
// ) {
//     try {
//         const body = await req.json();
//
//         const [field, value] = Object.entries(body)[0];
//
//         console.log(field, value)
//
//         if (!value) {
//             return NextResponse.json(
//                 { error: `${field} is required` },
//                 { status: 400 }
//             );
//         }
//
//         let exists = false;
//         switch (params.endpoint) {
//             case 'company':
//                 exists = await prisma.company.findFirst({
//                     where: {
//                         name: {
//                             mode: 'insensitive',
//                             equals: value as string
//                         }
//                     }
//                 }) !== null;
//                 break;
//             case 'email':
//                 exists = await prisma.user.findFirst({
//                     where: {
//                         email: {
//                             mode: 'insensitive',
//                             equals: value as string
//                         }
//                     }
//                 }) !== null;
//                 break;
//             default:
//                 return NextResponse.json(
//                     { error: "Invalid endpoint" },
//                     { status: 400 }
//                 );
//         }
//
//         return NextResponse.json({ exists });
//     } catch (error) {
//         console.error('Validation error:', error);
//         return NextResponse.json(
//             { error: "Error during validation" },
//             { status: 500 }
//         );
//     }
// }