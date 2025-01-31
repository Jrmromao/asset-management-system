import { auth } from "@/auth";
import { Session } from "next-auth";

type ActionFunction<T, R> = (
  args: T,
  session: Session,
) => Promise<ActionResponse<R>>;

export function withAuth<T, R>(action: ActionFunction<T, R>) {
  return async (args: T): Promise<ActionResponse<R>> => {
    try {
      const session = await auth();

      if (!session) {
        return { error: "Not authenticated" } as ActionResponse<R>;
      }

      if (!session.user?.companyId) {
        return {
          error: "No company associated with user",
        } as ActionResponse<R>;
      }

      return action(args, session);
    } catch (error) {
      console.error("Authentication error:", error);
      return {
        error: error instanceof Error ? error.message : "Authentication failed",
      } as ActionResponse<R>;
    }
  };
}

export function withAuthNoArgs<R>(
  action: (session: Session) => Promise<ActionResponse<R>>,
) {
  return async (): Promise<ActionResponse<R>> => {
    try {
      const session = await auth();

      if (!session) {
        return { error: "Not authenticated" } as ActionResponse<R>;
      }

      if (!session.user?.companyId) {
        return {
          error: "No company associated with user",
        } as ActionResponse<R>;
      }

      return action(session);
    } catch (error) {
      console.error("Authentication error:", error);
      return {
        error: error instanceof Error ? error.message : "Authentication failed",
      } as ActionResponse<R>;
    }
  };
}
