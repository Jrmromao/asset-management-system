# NextAuth modifications

As of 03-22-22, this project uses NextAuth 3.29.0.

## Purpose of this directory

The purpose of this directory is two-fold. First, it is to enable authentication without going through the OAuth flow. This will make it possible to "authenticate" in instances where doing real authentication is practically impossible, such as E2E tests. Second, the massive amount of 502 errors that happened in this project shortly after launch will be prevented because sessions will be produced uniformly.

This directory includes a script to create an explicit secret (`createSecret.sh`) and a module called `jwt.mjs` that has a function to create a JWT signing key and custom `encode` and `decode` functions for JWTs. These custom functions allow us to stub a JWT and session token that is compatible with our app. The custom functions are passed into the `[...nextauth].js` file to be used by Next Auth.

## Explicit secret and JWT signing key

An explicit secret and signing key enables consistent and predictable JWT generation. The [NextAuth docs](https://next-auth.js.org/v3/configuration/options#secret) mention how the default NextAuth secret behavior is volatile and can lead to errors in validating user sessions. With a random secret, the JWT signing key that is produced is random as well. In fact, in NextAuth 4.x, an explicit secret is mandatory in production. With an explicit secret and JWT signing key user sessions will be produced uniformly.

Each environment of the project has its own secret that is passed in through a environmental variable (`NEXT_AUTH_SECRET`). These secrets should be regenerated at a consistent interval in order to have stronger security.
