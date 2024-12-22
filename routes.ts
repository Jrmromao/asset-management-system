
/**
 * An array of all the public routes accessible without authentication
 * @type {string[]}
 */
export const publicRoutes: string[] = ['/'];

/**
 * An array of routes that are used for authentication
 * These routes will redirect to the logged-in user to the dashboard
 * @type {string[]}
 */
export const authRoutes: string[] = ["/sign-in", "/sign-up", '/account-verification', '/forgot-password', '/reset-password', '/forgot-password/confirm'];

/**
 * The prefix for API authentication routes.
 * Routes that start with this prefix will are used for API authentication purposes
 * @type {string}
 */
export const apiAuthPrefix: string = "/api/auth";

/**
 * The default redirect path after successful login.
 * @type {string}
 */
export const DEFAULT_LOGIN_REDIRECT: string = "/admin"
