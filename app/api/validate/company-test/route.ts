import { NextResponse } from "next/server";
import { prisma } from "@/app/db";

export async function POST(
  req: Request,
  { params }: { params: { endpoint: string } },
) {
  try {
    console.log(req.body);

    // const { searchParams } = new URL(req.url);
    // const entity = searchParams.get('entity');
    // const body = await req.json();
    // const [field, value] = Object.entries(body)[0];
    //
    // if (!value) {
    //     return NextResponse.json(
    //         { error: `${field} is required` },
    //         { status: 400 }
    //     );
    // }
    //
    // let exists = false;
    //
    // switch (params.endpoint) {
    //     case 'company':
    //         exists = await validateCompany(field, 'jrm3r3333o3mao@gmail.com');
    //         break;
    //     // Add other cases as needed
    //     default:
    //         return NextResponse.json(
    //             { error: "Invalid endpoint" },
    //             { status: 400 }
    //         );
    // }

    return NextResponse.json({ isValid: true });
  } catch (error) {
    console.error("Validation error:", error);
    return NextResponse.json(
      { error: "Error during validation" },
      { status: 500 },
    );
  }
}

async function validateCompany(field: string, value: string): Promise<boolean> {
  if (field !== "companyName") {
    return false;
  }

  const existingCompany = await prisma.company.findFirst({
    where: {
      name: {
        equals: value,
        mode: "insensitive",
      },
    },
  });

  return !!existingCompany;
}
