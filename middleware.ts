// // middleware.ts
// import { NextResponse } from 'next/server';
// import type { NextRequest } from 'next/server';
// import { getToken } from 'next-auth/jwt';
// import { getSession } from 'next-auth/react';
//
// const protectedPaths = ['/assets', '/assets/view', '/', '/admin'];
//
// export async function middleware(request: NextRequest) {
//     const {pathname} = request.nextUrl;
//     const secret = process.env.NEXTAUTH_SECRET;
//     const token = await getToken({req: request, secret});
//     // const authorizationHeader = request.headers.get('authorization');
//     // console.log(authorizationHeader)
//     // console.log(pathname)
//     // console.log('TOKEN: ', token)
//
//     // 1. Check if the request is about a protected path
//     if (protectedPaths.includes(pathname)) {
//         // 2. If it is, check if the user is authenticated
//         if (!request.cookies.get('token')) {
//             console.log('NOT AUTHENTICATED')
//             // 3. If not authenticated, redirect to the login page
//             return NextResponse.redirect(new URL('/sign-in', request.url));
//         }
//     }
//
//     // 4. Allow the request if not a protected path or authenticated
//     return NextResponse.next();
// }


export { default } from 'next-auth/middleware'

export const config = { matcher: ['/admin', '/assets', '/assets/view', '/', "/admin"] }