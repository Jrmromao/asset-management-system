import { prisma } from "@/app/db";
import { NextApiRequest, NextApiResponse } from "next";
import { get } from "node:http";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { method } = req;
  if (method === "GET") {
    return "hello";
  }
}
