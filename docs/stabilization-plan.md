# Stabilization Plan for Asset Management System

## 1. Project Structure & Import Aliases
- **Decide on a single source of truth for your action files:**
  - **Option A:** Use a top-level `actions/` directory for all server actions. Import as `@/actions/xyz.actions`.
  - **Option B:** Keep actions in `app/actions/` and always import as `@/app/actions/xyz.actions`.
- **Pick one and update all imports and documentation accordingly.**

## 2. Server/Client Boundary
- **Never import server actions (or anything using `next/headers` or `withAuth`) into client components or hooks.**
- **Pattern:**
  - Server actions: Only used in server components, server actions, or API routes.
  - Client components/hooks: Use API routes or Supabase client for data fetching.

## 3. API Routes for Client Data Fetching
- For any CRUD operation needed in the client, create an API route in `app/api/`.
- Example:  
  - `app/api/inventory/route.ts` for inventory CRUD.
  - `app/api/user/route.ts` for user CRUD.
- Client hooks/components should use `fetch` to call these API routes.

## 4. Remove All Unused or Broken Imports
- **Remove all imports and usages of:**
  - `next-auth/react` (if not using NextAuth)
  - Any function that is not exported from its module (e.g., `findById`, `checkin`, `checkout`, `processAssetsCSV`, `resendCode`, `registerUser`).
- **If you need these functions, implement and export them. If not, remove their usage.**

## 5. Implement/Export All Used Server Actions
- For every import like `findById`, `checkin`, `checkout`, etc.:
  - If you need it, implement and export it in the relevant action file.
  - If not, remove the import and all usage.

## 6. Type Safety and Consistency
- Ensure all server actions and API routes return a consistent, serializable response shape (e.g., `{ success, data, error }`).
- Use Zod or similar for input validation on all API routes and server actions.

## 7. Supabase Auth Best Practices
- In client components, use the Supabase client to get the current user/session.
- In server actions, use your `withAuth` middleware to get the authenticated user.

## 8. Linting and Build Warnings
- Run `yarn lint` and `yarn build` regularly.
- Fix all warnings and errors, not just those that break the build.

## 9. Documentation and Comments
- Document your import conventions and server/client boundaries in your README.
- Add comments to any non-obvious code, especially around authentication and data fetching.

## 10. Testing
- Add unit and integration tests for your server actions and API routes.
- Use mocks for Supabase and Prisma in tests.

---

## 11. Stripe Subscription Configuration for Production

To enable production-ready Stripe subscriptions, follow these steps:

### a. Set Stripe Environment Variables
- Add the following to your `.env.production` (or `.env.local` for local testing):
  ```env
  STRIPE_SECRET_KEY=sk_live_...
  STRIPE_PRICE_ID=price_...
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
  NEXT_PUBLIC_APP_URL=https://your-production-domain.com
  ```
- Never commit secret keys to version control.

### b. Configure Stripe Webhooks
- In your Stripe dashboard, add a webhook endpoint:
  - URL: `https://your-production-domain.com/api/stripe/webhook`
  - Events: `checkout.session.completed`, `customer.subscription.updated`, `invoice.paid`, etc.
- Add the webhook secret to your environment:
  ```env
  STRIPE_WEBHOOK_SECRET=whsec_...
  ```

### c. Secure Your Stripe Integration
- Always validate webhook signatures in your API route.
- Never expose secret keys to the client.
- Use the latest Stripe API version and keep dependencies up to date.

### d. Test in Live and Test Modes
- Use Stripe's test mode for development and staging.
- Switch to live keys and endpoints for production.
- Test all flows (checkout, subscription, webhook handling) before launch.

### e. Monitor and Handle Errors
- Log and monitor all Stripe errors and webhook events.
- Set up alerts for failed payments or webhook issues.

---

## Summary Table

| Task                                      | Action/Outcome                                      |
|--------------------------------------------|-----------------------------------------------------|
| Action file location & imports             | Pick one structure, update all imports              |
| Server/client boundary                     | Never import server actions into client code        |
| API routes for client data                 | Use API routes for all client CRUD                  |
| Remove unused/broken imports               | Clean up all imports/usages not implemented/exported|
| Implement/export all used server actions   | Add or remove as needed                             |
| Type safety & consistency                  | Use Zod, return `{ success, data, error }`          |
| Supabase auth best practices               | Use client lib in client, withAuth in server        |
| Linting/build warnings                     | Run/fix regularly                                   |
| Documentation/comments                     | Update README, add code comments                    |
| Testing                                    | Add unit/integration tests                          |
| Stripe subscriptions                       | Configure env, webhooks, and secure integration     |

---

## Next Steps
1. Decide on your action file structure and update all imports.
2. Refactor all client data fetching to use API routes.
3. Remove or implement all missing/broken imports.
4. Run `yarn build` and `yarn lint` until you have zero errors/warnings.
5. Add documentation and tests.
6. Configure and test Stripe subscriptions for production. 