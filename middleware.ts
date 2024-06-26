// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const protectedPaths = ['/protected-page', '/admin', '/api/secret-data', 'assets/create-new', 'admin-dashboard']; // Add your protected paths here

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // if (protectedPaths.some((path) => pathname.startsWith(path))) {
    //
    //     console.log('Protected path: ', pathname)
    //     // 2. (Optional) Check for authentication token or session
    //     // const token = request.cookies.get('your_auth_token'); // Replace with your actual token/session handling logic
    //     // if (!token) {
    //     //     // 3. Redirect to login if not authenticated
    //     //     const url = request.nextUrl.clone();
    //     //     url.pathname = '/login';
    //     //     return NextResponse.redirect(url);
    //     }
    // }

    console.log("FROM MIDDLEWARE: ", pathname)

    // 4. Allow the request if not a protected path or authenticated
    return NextResponse.next();
}
