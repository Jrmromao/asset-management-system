import {
    AuthFlowType,
    CognitoIdentityProviderClient,
    ConfirmForgotPasswordCommand,
    ConfirmSignUpCommand,
    ForgotPasswordCommand,
    InitiateAuthCommand,
    SignUpCommand,
} from "@aws-sdk/client-cognito-identity-provider";

function getClient() {
    return new CognitoIdentityProviderClient({region: process.env.AWS_REGION!});
}

export const signUp = async ({password, email, companyId}: {
    password: string,
    email: string,
    companyId: string
}) => {
    try {
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
    } catch (error) {
        console.error(error);
        return error
    }
}

export const signIn = async (email: string, password: string) => {
    try {
        const params = {
            AuthFlow: AuthFlowType.USER_PASSWORD_AUTH,
            ClientId: String(process.env.NEXT_PUBLIC_USER_POOL_CLIENT_ID),
            AuthParameters: {
                USERNAME: email,
                PASSWORD: password
            }
        };

        const command = new InitiateAuthCommand(params);

        return await getClient().send(command)
    } catch (error) {
        console.log('error');
        return null

    }
}

export const forgetPasswordRequestCode = async (email: string) => {
    try {

        await getClient().send(new ForgotPasswordCommand({
            ClientId: String(process.env.NEXT_PUBLIC_USER_POOL_CLIENT_ID),
            Username: email
        }))

    } catch (error) {
        console.error(error);
    }
}

export const forgetPasswordConfirm = async (email: string, newPassword: string, confirmationCode: string) => {
    try {

        await getClient().send(new ConfirmForgotPasswordCommand({
            ClientId: String(process.env.NEXT_PUBLIC_USER_POOL_CLIENT_ID),
            Username: email,
            Password: newPassword,
            ConfirmationCode: confirmationCode
        }))
        return {success: true};

    } catch (error) {
        return {error:  error ?? 'Invalid email, password or confirmation code'}
    }
}




export const verifyCognitoAccount =  async (email: string, confirmationCode: string) => {
    try {
        await getClient().send(new ConfirmSignUpCommand({
            ClientId: String(process.env.NEXT_PUBLIC_USER_POOL_CLIENT_ID),
            Username: email,
            ConfirmationCode: confirmationCode
        }))



    } catch (error) {
        console.error(error);
    }
}