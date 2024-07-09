import {NextAuthUser, UserAttributes} from "@/models/user";
import * as AmazonCognitoIdentity from "amazon-cognito-identity-js";

export const cognitoSignIn = (email: string, password: string): Promise<NextAuthUser> => {
    return new Promise((resolve, reject) => {
        const authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails({
            Username: email,
            Password: password,
        });

        const userPool = new AmazonCognitoIdentity.CognitoUserPool({
            UserPoolId: process.env.COGNITO_POOL_ID!,
            ClientId: process.env.COGNITO_CLIENT_ID!
        });

        const cognitoUser = new AmazonCognitoIdentity.CognitoUser({ Username: email, Pool: userPool });

        cognitoUser.authenticateUser(authenticationDetails, {
            onSuccess: function (result: AmazonCognitoIdentity.CognitoUserSession) {

                const userAttributes = getUserAttributes(cognitoUser);

                const authUser: NextAuthUser = {
                    id: userAttributes?.id!,
                    name: cognitoUser.getUsername(),
                    email: userAttributes?.email
                };
                console.log(authUser)
                resolve(authUser);
            },
            onFailure: function (err) {
                reject(err);
            },
        });
    });
};



const getUserAttributes = (cognitoUser: AmazonCognitoIdentity.CognitoUser): UserAttributes | null => {
    const attributes = cognitoUser.getSignInUserSession()?.getIdToken().decodePayload();
    if (attributes && typeof attributes === 'object' && 'sub' in attributes) {
        return {
            id: attributes['sub'],
            email: attributes['email']
        }
    }
    return null;
};
