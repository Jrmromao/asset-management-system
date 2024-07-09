import {CognitoUser} from "amazon-cognito-identity-js";

export interface User {
    userName: string;
    cognitoUser: CognitoUser;
    token: string;
    image?: string;
}


export interface NextAuthUser {
    id: string; // Unique user identifier
    name?: string; // User's name
    email?: string; // User's email
    image?: string; // URL to user's profile image
}

export interface UserFormValues {
    email?: string;
    password: string;
    displayName?: string;
    username: string;
}

export interface LoginCredentials{
    email: string
    password: string
    rememberMe: boolean
}


export interface UserAttributes{
    id: string,
    Name?: string,
    Value?: string,
    email: string
}


