import { getAuth } from "@clerk/nextjs/server";
import { prisma } from "@/app/db";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { userId } = getAuth(request);
  if (!userId)
    return new Response(JSON.stringify({ error: "Not authenticated" }), {
      status: 401,
    });
  const user = await prisma.user.findUnique({
    where: { oauthId: userId },
    include: { role: true },
  });
  if (!user)
    return new Response(JSON.stringify({ error: "User not found" }), {
      status: 404,
    });
  return new Response(
    JSON.stringify({
      ...user,
      isAdmin: user.role?.isAdmin,
      role: user.role?.name,
    }),
    { status: 200 },
  );
}
