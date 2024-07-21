import {CognitoIdentityProviderClient, SignUpCommand,} from "@aws-sdk/client-cognito-identity-provider";

import {createHmac} from "crypto";

function calculateSecretHash(username: string, clientId: string, clientSecret: string) {
    const message = `${username}${clientId}`;
    return createHmac("sha256", clientSecret).update(message).digest("base64");
}

export const signUp = async ({clientId, username, password, email, companyId}: {
    clientId: string,
    username: string,
    password: string,
    email: string,
    companyId: number
}) => {
    const client = new CognitoIdentityProviderClient({region: process.env.AWS_REGION!});

    // const command = new SignUpCommand({
    //     ClientId: clientId,
    //     Username: username,
    //     Password: password,
    //     SecretHash: calculateSecretHash(username, clientId, process.env.COGNITO_CLIENT_SECRET!),
    //     UserAttributes: [{ Name: "Username", Value: email }],
    // });

    try {
        const command = new SignUpCommand({
            ClientId: clientId,
            Username: email,
            Password: password,
            SecretHash: calculateSecretHash(email, clientId, process.env.COGNITO_CLIENT_SECRET!),
            UserAttributes: [
                {
                    Name: "email",
                    Value: email,
                },
            ],
        });
        return await client.send(command);
    } catch (error) {
        console.log(error);
        return error
    }
}