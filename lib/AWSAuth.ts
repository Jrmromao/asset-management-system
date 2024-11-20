import { NextAuthUser, UserAttributes } from "@/models/user";
import * as AmazonCognitoIdentity from "amazon-cognito-identity-js";
import { createHmac } from "crypto";

// Custom error class for authentication errors
export class AuthenticationError extends Error {
    constructor(public code: string, message: string) {
        super(message);
        this.name = 'AuthenticationError';
    }
}

// Type for environment variables
interface CognitoConfig {
    userPoolId: string;
    clientId: string;
    clientSecret?: string;
}

// Get and validate environment variables
const getCognitoConfig = (): CognitoConfig => {
    const userPoolId = process.env.COGNITO_POOL_ID;
    const clientId = process.env.COGNITO_CLIENT_ID;

    if (!userPoolId || !clientId) {
        throw new Error(
            'Missing required environment variables: COGNITO_POOL_ID and/or COGNITO_CLIENT_ID'
        );
    }

    return {
        userPoolId,
        clientId,
        clientSecret: process.env.COGNITO_CLIENT_SECRET
    };
};

// Singleton instance of CognitoUserPool
let userPoolInstance: AmazonCognitoIdentity.CognitoUserPool | null = null;

const getUserPool = (): AmazonCognitoIdentity.CognitoUserPool => {
    if (!userPoolInstance) {
        const config = getCognitoConfig();
        userPoolInstance = new AmazonCognitoIdentity.CognitoUserPool({
            UserPoolId: config.userPoolId,
            ClientId: config.clientId,
        });
    }
    return userPoolInstance;
};

export const cognitoSignIn = async (
    email: string,
    password: string
): Promise<NextAuthUser> => {
    if (!email || !password) {
        throw new AuthenticationError(
            'InvalidParameter',
            'Email and password are required'
        );
    }

    const authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails({
        Username: email,
        Password: password,
        ValidationData: {
            // Add any additional validation data if needed
        }
    });

    const userPool = getUserPool();
    const cognitoUser = new AmazonCognitoIdentity.CognitoUser({
        Username: email,
        Pool: userPool
    });

    try {
        const session = await authenticateUser(cognitoUser, authenticationDetails);
        const userAttributes = getUserAttributes(cognitoUser);

        if (!userAttributes?.id || !userAttributes.email) {
            throw new AuthenticationError(
                'MissingAttributes',
                'Required user attributes are missing'
            );
        }

        return {
            id: userAttributes.id,
            name: cognitoUser.getUsername(),
            email: userAttributes.email
        };
    } catch (error) {
        if (error instanceof Error) {
            throw new AuthenticationError(
                'AuthError',
                error.message
            );
        }
        throw error;
    }
};

const authenticateUser = (
    cognitoUser: AmazonCognitoIdentity.CognitoUser,
    authenticationDetails: AmazonCognitoIdentity.AuthenticationDetails
): Promise<AmazonCognitoIdentity.CognitoUserSession> => {
    return new Promise((resolve, reject) => {
        cognitoUser.authenticateUser(authenticationDetails, {
            onSuccess: resolve,
            onFailure: reject,
            newPasswordRequired: (userAttributes, requiredAttributes) => {
                reject(new AuthenticationError(
                    'NewPasswordRequired',
                    'User needs to set a new password'
                ));
            }
        });
    });
};

const getUserAttributes = (
    cognitoUser: AmazonCognitoIdentity.CognitoUser
): UserAttributes | null => {
    const session = cognitoUser.getSignInUserSession();
    const attributes = session?.getIdToken().decodePayload();

    if (!attributes || typeof attributes !== 'object' || !('sub' in attributes)) {
        return null;
    }

    return {
        id: attributes['sub'] as string,
        email: attributes['email'] as string
    };
};

export const calculateSecretHash = (
    username: string,
    clientId: string,
    clientSecret: string
): string => {
    if (!username || !clientId || !clientSecret) {
        throw new Error('Missing required parameters for secret hash calculation');
    }

    const message = `${username}${clientId}`;
    return createHmac("sha256", clientSecret)
        .update(message)
        .digest("base64");
};