import {
  AdminDeleteUserCommand,
  AdminGetUserCommand,
  AuthFlowType,
  CodeMismatchException,
  CognitoIdentityProviderClient,
  CognitoIdentityProviderServiceException,
  ConfirmForgotPasswordCommand,
  ConfirmSignUpCommand,
  ExpiredCodeException,
  ForgotPasswordCommand,
  InitiateAuthCommand,
  InvalidPasswordException,
  NotAuthorizedException,
  SignUpCommand,
  TooManyRequestsException,
  UsernameExistsException,
  UserNotConfirmedException,
  UserNotFoundException,
} from "@aws-sdk/client-cognito-identity-provider";
import logger from "@/lib/logger";

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

// Singleton client instance
let cognitoClient: CognitoIdentityProviderClient | null = null;

function getClient(): CognitoIdentityProviderClient {
  if (!cognitoClient) {
    const { region } = validateConfig();
    cognitoClient = new CognitoIdentityProviderClient({ region });
  }
  return cognitoClient;
}

// Error handler wrapper
async function handleCognitoOperation<T>(
  operation: () => Promise<T>,
  context: Record<string, any> = {},
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (error instanceof CognitoIdentityProviderServiceException) {
      logger.error("Cognito operation failed", {
        errorType: error.name,
        errorMessage: error.message,
        ...context,
      });

      switch (error.constructor) {
        case UserNotFoundException:
          throw new CognitoError("User not found", "UserNotFound", 404);
        case CodeMismatchException:
          throw new CognitoError(
            "Invalid verification code",
            "CodeMismatch",
            400,
          );
        case ExpiredCodeException:
          throw new CognitoError(
            "Verification code has expired",
            "ExpiredCode",
            400,
          );
        case UsernameExistsException:
          throw new CognitoError(
            "Email already registered",
            "UsernameExists",
            409,
          );
        case InvalidPasswordException:
          throw new CognitoError(
            "Invalid password format",
            "InvalidPassword",
            400,
          );
        case TooManyRequestsException:
          throw new CognitoError(
            "Too many requests, please try again later",
            "TooManyRequests",
            429,
          );
        case NotAuthorizedException:
          throw new CognitoError("Invalid credentials", "NotAuthorized", 401);
        case UserNotConfirmedException:
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

    logger.error("Unexpected error in Cognito operation", {
      error: error instanceof Error ? error.stack : String(error),
      ...context,
    });
    throw error;
  }
}

export async function signUp({
  password,
  email,
  companyId,
}: SignUpParams): Promise<CognitoResponse> {
  const { userPoolClientId } = validateConfig();

  return handleCognitoOperation(
    async () => {
      const command = new SignUpCommand({
        ClientId: userPoolClientId,
        Username: email,
        Password: password,
        UserAttributes: [
          {
            Name: "custom:companyId",
            Value: companyId,
          },
          {
            Name: "email",
            Value: email,
          },
        ],
      });

      const result = await getClient().send(command);

      logger.info("User signed up successfully", { email });

      return {
        success: true,
        message: "User registered successfully",
        data: result,
      };
    },
    { email, companyId },
  );
}

export async function signIn(
  email: string,
  password: string,
): Promise<CognitoResponse> {
  const { userPoolClientId } = validateConfig();

  return handleCognitoOperation(
    async () => {
      const command = new InitiateAuthCommand({
        AuthFlow: AuthFlowType.USER_PASSWORD_AUTH,
        ClientId: userPoolClientId,
        AuthParameters: {
          USERNAME: email,
          PASSWORD: password,
        },
      });

      const result = await getClient().send(command);

      logger.info("User signed in successfully", { email });

      return {
        success: true,
        message: "Successfully authenticated",
        data: result.AuthenticationResult,
      };
    },
    { email },
  );
}

export async function forgetPasswordRequestCode(
  email: string,
): Promise<CognitoResponse> {
  const { userPoolClientId } = validateConfig();

  return handleCognitoOperation(
    async () => {
      const command = new ForgotPasswordCommand({
        ClientId: userPoolClientId,
        Username: email,
      });

      await getClient().send(command);

      logger.info("Password reset code sent", { email });

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
  const { userPoolClientId } = validateConfig();

  return handleCognitoOperation(
    async () => {
      const command = new ConfirmForgotPasswordCommand({
        ClientId: userPoolClientId,
        Username: email,
        Password: newPassword,
        ConfirmationCode: confirmationCode,
      });

      await getClient().send(command);

      logger.info("Password reset confirmed", { email });

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
  const { userPoolClientId } = validateConfig();

  return handleCognitoOperation(
    async () => {
      const command = new ConfirmSignUpCommand({
        ClientId: userPoolClientId,
        Username: email,
        ConfirmationCode: confirmationCode,
      });

      await getClient().send(command);

      logger.info("Account verified successfully", { email });

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
  const userPoolId = process.env.COGNITO_USER_POOL_ID;

  if (!userPoolId) {
    logger.error("Cognito User Pool ID not configured");
    throw new Error("AWS Cognito User Pool ID is not configured");
  }

  return handleCognitoOperation(
    async () => {
      // First check if the user exists
      const getUserCommand = new AdminGetUserCommand({
        UserPoolId: userPoolId,
        Username: email,
      });

      try {
        await getClient().send(getUserCommand);
      } catch (error) {
        if (error instanceof UserNotFoundException) {
          logger.info("User not found in Cognito, skipping deletion", {
            email,
          });
          return {
            success: true,
            message: "User not found in Cognito",
          };
        }
        throw error;
      }

      // Proceed with deletion if user exists
      const deleteCommand = new AdminDeleteUserCommand({
        UserPoolId: userPoolId,
        Username: email,
      });

      await getClient().send(deleteCommand);

      logger.info("User deleted from Cognito successfully", { email });

      return {
        success: true,
        message: "User deleted successfully",
      };
    },
    { email },
  );
}

// Initialize and validate configuration when the module loads
validateConfig();
