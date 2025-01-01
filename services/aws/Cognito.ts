import {
  AuthFlowType,
  CognitoIdentityProviderClient,
  ConfirmForgotPasswordCommand,
  ConfirmSignUpCommand,
  ForgotPasswordCommand,
  InitiateAuthCommand,
  SignUpCommand,
} from "@aws-sdk/client-cognito-identity-provider";

const getClient = () => {
  return new CognitoIdentityProviderClient({ region: process.env.AWS_REGION! });
};

export const signUp = async ({
  password,
  email,
  companyId,
}: {
  password: string;
  email: string;
  companyId: string;
}) => {
  const command = new SignUpCommand({
    ClientId: String(process.env.NEXT_PUBLIC_USER_POOL_CLIENT_ID),
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
  return await getClient().send(command);
};

export const signIn = async (email: string, password: string) => {
  const params = {
    AuthFlow: AuthFlowType.USER_PASSWORD_AUTH,
    ClientId: String(process.env.NEXT_PUBLIC_USER_POOL_CLIENT_ID),
    AuthParameters: {
      USERNAME: email,
      PASSWORD: password,
    },
  };
  const command = new InitiateAuthCommand(params);
  return await getClient().send(command);
};

export const forgetPasswordRequestCode = async (
  email: string,
): Promise<APICallResponse> => {
  const result = await getClient().send(
    new ForgotPasswordCommand({
      ClientId: process.env.NEXT_PUBLIC_USER_POOL_CLIENT_ID,
      Username: email,
    }),
  );

  if (result.$metadata.httpStatusCode !== 200) {
    return { success: false, message: "Failed to send code" };
  }

  return { success: true, message: "Code successfully sent" };
};

export const forgetPasswordConfirm = async (
  email: string,
  newPassword: string,
  confirmationCode: string,
): Promise<APICallResponse> => {
  const result = await getClient().send(
    new ConfirmForgotPasswordCommand({
      ClientId: String(process.env.NEXT_PUBLIC_USER_POOL_CLIENT_ID),
      Username: email,
      Password: newPassword,
      ConfirmationCode: confirmationCode,
    }),
  );

  console.log(result);
  return { success: true, message: "Password successfully changed" };
};

export const verifyCognitoAccount = async (
  email: string,
  confirmationCode: string,
): Promise<APICallResponse> => {
  const result = await getClient().send(
    new ConfirmSignUpCommand({
      ClientId: String(process.env.NEXT_PUBLIC_USER_POOL_CLIENT_ID),
      Username: email,
      ConfirmationCode: confirmationCode,
    }),
  );
  console.log(result);

  return { success: true, message: "Account successfully verified" };
};
