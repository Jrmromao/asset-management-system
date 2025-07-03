# User Limit Reached: Upgrade & Add-User Flow

## Overview
When a company reaches its active user quota (e.g., 3/3 for Starter), the system should provide a premium, user-centric experience that:
- Clearly informs the admin/user of the limit
- Offers actionable options to upgrade their plan or purchase additional user seats
- Never leaves the user at a dead end

## UX Flow
1. **Trigger:**
   - User attempts to invite or activate a new user, but the backend returns `allowed: false` from `/api/user/can-add-active-user`.
2. **Dialog/Modal Opens:**
   - Title: "Active User Limit Reached"
   - Message: "You've reached your active user limit (X of Y used). Upgrade your plan or buy additional users to continue."
   - Show current plan, usage, and next available options.
   - Buttons:
     - [Upgrade Plan] → Navigates to billing/upgrade page
     - [Buy Additional User] → (If supported) Initiates per-user add-on purchase
     - [Contact Sales] → Opens contact form or mailto link (for Enterprise/custom)
   - Optionally, show pricing and plan comparison.
3. **Action:**
   - User selects an option and is guided through the upgrade or purchase flow.
   - On success, the dialog closes and the user can proceed with their action.

## Backend/Frontend Integration
- **Backend:**
  - `/api/user/can-add-active-user` returns `{ allowed: false, limit, used }` when the limit is reached.
- **Frontend:**
  - In the invite/activation UI, if `allowed` is false, open the `UserLimitDialog` instead of just showing a toast.
  - Pass current usage and plan info to the dialog.

## Extensibility
- **Per-User Add-Ons:**
  - If you support buying extra users beyond the plan, add a [Buy Additional User] button and integrate with your billing provider.
- **Plan Upgrades:**
  - Link to your self-serve billing/upgrade page or Stripe Customer Portal.
- **Enterprise/Custom:**
  - Show a [Contact Sales] option for high-touch upgrades.

## Example Dialog Design
```
+---------------------------------------------+
| Active User Limit Reached                   |
|---------------------------------------------|
| You've reached your active user limit (3/3) |
|                                             |
| Upgrade your plan or buy more users to      |
| continue inviting team members.             |
|                                             |
| [Upgrade Plan] [Buy Additional User]        |
| [Contact Sales]                             |
+---------------------------------------------+
```

## Implementation Notes
- Use a reusable modal/dialog component (e.g., `UserLimitDialog.tsx`).
- Make the dialog accessible and mobile-friendly.
- Track dialog opens and upgrade attempts for analytics.
- Consider showing plan comparison or pricing in the dialog for transparency.

---

**This spec is ready for engineering and design.** 