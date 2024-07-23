import {CognitoIdentityProviderClient, SignUpCommand,} from "@aws-sdk/client-cognito-identity-provider";
import {createHmac} from "crypto";
import {AuthenticationDetails, CognitoUser, CognitoUserPool} from "amazon-cognito-identity-js";
import {CognitoIdentityServiceProvider} from "aws-sdk";


export const signUp = async ({clientId, username, password, email, companyId}: {
    clientId: string,
    username: string,
    password: string,
    email: string,
    companyId: number
}) => {

    const client = new CognitoIdentityProviderClient({region: process.env.AWS_REGION!});

    try {
        const command = new SignUpCommand({
            ClientId: clientId,
            Username: email,
            Password: password,
            UserAttributes: [
                {
                    Name: "custom:companyId",
                    Value: companyId.toString(),
                },
                {
                    Name: "email",
                    Value: email,
                },
                {
                    Name: 'preferred_username',
                    Value: username
                },
            ],
        });
        return await client.send(command);
    } catch (error) {
        console.log(error);
        return error
    }
}
