import crypto from "crypto";
import * as jose from "jose";
import dotenv from "dotenv";
//
// // Define types for function parameters and options
// interface EncodeOptions {
//   token?: Record<string, unknown>;
//   maxAge?: number;
//   signingOptions?: {
//     expiresIn?: string;
//   };
// }
//
// interface DecodeOptions {
//   token: string;
//   maxAge?: number;
//   verificationOptions?: {
//     maxTokenAge?: string;
//     algorithms?: string[];
//   };
// }
//
// const DEFAULT_SIGNATURE_ALGORITHM = 'HS512';
// const DEFAULT_MAX_AGE = 15 * 60; // 15 minutes
//
// dotenv.config({
//   path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env.local'
// });
//
// export async function encode({
//                                token = {},
//                                maxAge = DEFAULT_MAX_AGE,
//                                signingOptions = {
//                                  expiresIn: `${maxAge}s`
//                                }
//                              }: EncodeOptions = {}): Promise<string> {
//   // Signing Key
//   const _signingKey = await getSigningKey();
//
//   return await new jose.SignJWT(token)
//       .setProtectedHeader({
//         alg: DEFAULT_SIGNATURE_ALGORITHM
//       })
//       .setIssuedAt()
//       .setExpirationTime(signingOptions.expiresIn || `${maxAge}s`)
//       .sign(_signingKey);
// }
//
// export async function decode({
//                                token,
//                                maxAge = DEFAULT_MAX_AGE,
//                                verificationOptions = {
//                                  maxTokenAge: `${maxAge}s`,
//                                  algorithms: [DEFAULT_SIGNATURE_ALGORITHM]
//                                }
//                              }: DecodeOptions): Promise<Record<string, unknown> | null> {
//   if (!token) return null;
//
//   // Signing Key
//   const _signingKey = await getSigningKey();
//
//   // Verify token
//   const { payload } = await jose.jwtVerify(token, _signingKey, {
//     maxTokenAge: verificationOptions.maxTokenAge || `${maxAge}s`,
//     algorithms: verificationOptions.algorithms || [DEFAULT_SIGNATURE_ALGORITHM]
//   });
//
//   return payload;
// }

// async function getSigningKey(): Promise<Uint8Array | any> {
//   const buffer = crypto.hkdfSync(
//       'sha256',
//       process.env.NEXT_AUTH_SECRET as string,
//       '',
//       'my secret',
//       64
//   );
//
//   return await jose.importJWK(
//       {
//         ...crypto.createSecretKey(buffer as Uint8Array).export({ format: 'jwk' }),
//         alg: DEFAULT_SIGNATURE_ALGORITHM,
//         use: 'sig',
//         kid: 'hmp-generated-signing-key'
//       },
//       DEFAULT_SIGNATURE_ALGORITHM
//   );
// }
