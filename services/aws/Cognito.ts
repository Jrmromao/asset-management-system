import {
  AuthError,
  confirmResetPassword,
  confirmSignUp,
  deleteUser,
  getCurrentUser,
  resetPassword,
  signIn,
  signUp,
} from "@aws-amplify/auth";
import { Amplify } from "aws-amplify";

// Custom error types for better error handling
export class CognitoError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode?: number,
  ) {
    super(message);
    this.name = "CognitoError";
  }
}

// Type definitions
export interface CognitoResponse {
  success: boolean;
  message: string;
  data?: any;
}

interface SignUpParams {
  password: string;
  email: string;
  companyId: string;
}

interface CognitoConfig {
  region: string;
  userPoolClientId: string;
  userPoolId: string;
}

// Configuration validation
function validateConfig(): CognitoConfig {
  const region = process.env.AWS_REGION;
  const userPoolClientId = process.env.NEXT_PUBLIC_USER_POOL_CLIENT_ID;
  const userPoolId = process.env.NEXT_PUBLIC_USER_POOL_ID;

  if (!region || !userPoolClientId || !userPoolId) {
    throw new Error(
      "Missing required AWS configuration. Check AWS_REGION, NEXT_PUBLIC_USER_POOL_CLIENT_ID, and NEXT_PUBLIC_USER_POOL_ID.",
    );
  }

  return { region, userPoolClientId, userPoolId };
}

// Error handler wrapper
async function handleCognitoOperation<T>(
  operation: () => Promise<T>,
  context: Record<string, any> = {},
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.name) {
        case "UserNotFoundException":
          throw new CognitoError("User not found", "UserNotFound", 404);
        case "CodeMismatchException":
          throw new CognitoError(
            "Invalid verification code",
            "CodeMismatch",
            400,
          );
        case "ExpiredCodeException":
          throw new CognitoError(
            "Verification code has expired",
            "ExpiredCode",
            400,
          );
        case "UsernameExistsException":
          throw new CognitoError(
            "Email already registered",
            "UsernameExists",
            409,
          );
        case "InvalidPasswordException":
          throw new CognitoError(
            "Invalid password format",
            "InvalidPassword",
            400,
          );
        case "TooManyRequestsException":
          throw new CognitoError(
            "Too many requests, please try again later",
            "TooManyRequests",
            429,
          );
        case "NotAuthorizedException":
          throw new CognitoError("Invalid credentials", "NotAuthorized", 401);
        case "UserNotConfirmedException":
          throw new CognitoError(
            "User is not confirmed",
            "UserNotConfirmed",
            403,
          );
        default:
          throw new CognitoError(
            "An unexpected error occurred",
            "UnknownError",
            500,
          );
      }
    }
    throw error;
  }
}

// Configure Amplify
const { region, userPoolId, userPoolClientId } = validateConfig();
Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: userPoolId,
      userPoolClientId: userPoolClientId,
      loginWith: {
        username: true,
        email: true,
        phone: false,
      },
    },
  },
});

export async function signUpUser({
  password,
  email,
  companyId,
}: SignUpParams): Promise<CognitoResponse> {
  return handleCognitoOperation(
    async () => {
      const result = await signUp({
        username: email,
        password,
        options: {
          userAttributes: {
            "custom:companyId": companyId,
            email,
          },
        },
      });

      return {
        success: true,
        message: "User registered successfully",
        data: result,
      };
    },
    { email, companyId },
  );
}

export async function signInUser(
  email: string,
  password: string,
): Promise<CognitoResponse> {
  return handleCognitoOperation(
    async () => {
      try {
        const result = await signIn({
          username: email,
          password,
          options: {
            authFlowType: "USER_PASSWORD_AUTH",
          },
        });

        return {
          success: true,
          message: "Successfully authenticated",
          data: result,
        };
      } catch (error) {
        throw error; // This will be caught by handleCognitoOperation
      }
    },
    { email },
  );
}

export async function forgetPasswordRequestCode(
  email: string,
): Promise<CognitoResponse> {
  return handleCognitoOperation(
    async () => {
      await resetPassword({ username: email });

      return {
        success: true,
        message: "Reset code sent successfully",
      };
    },
    { email },
  );
}

export async function forgetPasswordConfirm(
  email: string,
  newPassword: string,
  confirmationCode: string,
): Promise<CognitoResponse> {
  return handleCognitoOperation(
    async () => {
      await confirmResetPassword({
        username: email,
        newPassword,
        confirmationCode,
      });

      return {
        success: true,
        message: "Password changed successfully",
      };
    },
    { email },
  );
}

export async function verifyCognitoAccount(
  email: string,
  confirmationCode: string,
): Promise<CognitoResponse> {
  return handleCognitoOperation(
    async () => {
      await confirmSignUp({
        username: email,
        confirmationCode,
      });

      return {
        success: true,
        message: "Account verified successfully",
      };
    },
    { email },
  );
}

export async function deleteCognitoUser(
  email: string,
): Promise<CognitoResponse> {
  return handleCognitoOperation(
    async () => {
      try {
        // Check if user exists by trying to get current user
        const user = await getCurrentUser();
        if (!user) {
          return {
            success: true,
            message: "User not found in Cognito",
          };
        }

        // Proceed with deletion if user exists
        await deleteUser();

        return {
          success: true,
          message: "User deleted successfully.",
        };
      } catch (error) {
        if (
          error instanceof AuthError &&
          error.name === "UserNotFoundException"
        ) {
          return {
            success: true,
            message: "User not found in Cognito",
          };
        }
        throw error;
      }
    },
    { email },
  );
}

// Initialize configuration when the module loads
validateConfig();
