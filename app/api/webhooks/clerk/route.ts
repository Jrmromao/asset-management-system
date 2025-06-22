import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { createUser, deleteUser, updateUser } from "@/lib/actions/user.actions";
import { clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  // You can find this in the Clerk Dashboard -> Webhooks -> choose the webhook
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  console.log("WEBHOOK_SECRET", WEBHOOK_SECRET);

  console.log("req", req);

  if (!WEBHOOK_SECRET) {
    throw new Error(
      "Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local",
    );
  }

  // Get the headers
  const headerPayload = headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error occured -- no svix headers", {
      status: 400,
    });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret.
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Error occured", {
      status: 400,
    });
  }

  // Get the ID and type
  const { id } = evt.data;
  const eventType = evt.type;

  if (eventType === "user.created") {
    const { data } = evt;
    const user = {
      clerkId: data.id,
      email: data.email_addresses[0].email_address,
      username:
        data.username ?? (data.unsafe_metadata.username as string | null),
      firstName:
        data.first_name ?? (data.unsafe_metadata.firstName as string | null),
      lastName:
        data.last_name ?? (data.unsafe_metadata.lastName as string | null),
      photo: data.image_url,
    };

    const newUser = await createUser(user);

    if (newUser) {
      const clerk = await clerkClient();
      await clerk.users.updateUserMetadata(data.id, {
        publicMetadata: {
          userId: newUser.id,
          // companyId removed from public metadata for security
        },
        privateMetadata: {
          companyId: newUser.companyId, // companyId in private metadata only
        },
      });
      return NextResponse.json({ message: "OK", user: newUser });
    } else {
      // User creation was skipped (likely no company ID yet)
      return NextResponse.json({
        message: "User creation skipped - no company ID found",
        user: null,
      });
    }
  }

  if (eventType === "user.updated") {
    const { data } = evt;
    const user = {
      firstName:
        data.first_name ?? (data.unsafe_metadata.firstName as string | null),
      lastName:
        data.last_name ?? (data.unsafe_metadata.lastName as string | null),
      username:
        data.username ?? (data.unsafe_metadata.username as string | null),
      photo: data.image_url,
    };

    const updatedUser = await updateUser(data.id, user);

    return NextResponse.json({ message: "OK", user: updatedUser });
  }

  if (eventType === "user.deleted") {
    const { id } = evt.data;

    const deletedUser = await deleteUser(id!);

    return NextResponse.json({ message: "OK", user: deletedUser });
  }

  return new Response("", { status: 200 });
}
