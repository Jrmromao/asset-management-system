import {
    AuthFlowType,
    CognitoIdentityProviderClient,
    InitiateAuthCommand,
    SignUpCommand
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
        console.log(error);
        return error
    }
}

export const signIn = async (email: string, password: string) => {
    try {
        // ALLOW_CUSTOM_AUTH
        // ALLOW_REFRESH_TOKEN_AUTH
        // ALLOW_USER_SRP_AUTH
        const params = {
            AuthFlow: AuthFlowType.USER_PASSWORD_AUTH,
            ClientId: String(process.env.NEXT_PUBLIC_USER_POOL_CLIENT_ID),
            AuthParameters: {
                USERNAME: email,
                PASSWORD: password
            }
        };
        const command = new InitiateAuthCommand(params);
        return await getClient().send(command);
    } catch (error) {
        console.log('error');
       return null

    }
}
