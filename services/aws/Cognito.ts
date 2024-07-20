import AWS from 'aws-sdk';
import {UserAttributes} from "@/models/user";



export default class Cognito {

    public static async signUp(user: UserAttributes) {
        const cognito = new AWS.CognitoIdentityServiceProvider();

        return await cognito.signUp({
            ClientId: process.env.COGNITO_CLIENT_ID!,
            Username: user.email,
            Password: user.email,
            UserAttributes: [
                {
                    Name: 'email',
                    Value: user.email
                }
            ]
        }).promise();
    }
}