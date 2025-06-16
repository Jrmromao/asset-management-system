# Project Overview: Asset Management & Carbon Footprint Tracking SaaS

## Purpose & Context
This application is a modern SaaS platform designed to help organizations manage their physical and digital assets while accurately tracking the carbon footprint associated with each asset. The goal is to empower companies to meet ESG (Environmental, Social, Governance) requirements, optimize asset usage, and drive sustainability initiatives—all in one unified system.

### Business Problem
- Companies need to track assets for operational efficiency, compliance, and cost control.
- Increasing regulatory and market pressure to measure and reduce carbon emissions (ESG, CSRD, SEC, etc.).
- Most asset management tools do not offer integrated, accurate carbon tracking or easy ESG reporting.

### Solution
- Unified platform for asset management and carbon footprint tracking.
- Automated CO₂ estimation using LLMs and best-practice emission factors.
- ESG-ready reporting and dashboards.
- Scalable, secure, and easy to use for SMBs and enterprises.

## Main Features
- **Asset Management:** CRUD, lifecycle, assignment, and status tracking.
- **Carbon Footprint Tracking:** Automated CO₂ calculations per asset, with audit trail and transparency.
- **ESG Reporting:** Generate and export reports for compliance and stakeholder communication.
- **Authentication & Onboarding:** Secure user registration, sign-in, and company setup.
- **Dashboard & Analytics:** Visualize asset data, carbon trends, and actionable insights.
- **File Storage:** Upload and manage asset documents/images via AWS S3.
- **Email Notifications:** Transactional emails (e.g., invites, password reset) via Resend.

## Tech Stack
- **Package Manager:** [Yarn](https://yarnpkg.com/) (for dependency management and scripts)
- **Database ORM:** [Prisma](https://www.prisma.io/) (type-safe database access)
- **Authentication:** [Clerk](https://clerk.com/) (user management, sign-in, invite, etc.)
- **Database:** [AWS RDS PostgreSQL](https://aws.amazon.com/rds/postgresql/) (managed, scalable SQL database)
- **Email:** [Resend](https://resend.com/) (transactional email delivery)
- **UI Framework:** [Tailwind CSS](https://tailwindcss.com/) (utility-first CSS)
- **UI Components:** [shadcn/ui](https://ui.shadcn.com/) (accessible, customizable React components)
- **File Storage:** [AWS S3](https://aws.amazon.com/s3/) (secure, scalable object storage)

## Developer Notes
- Use `yarn` for all package management and scripts.
- Database migrations and type safety are managed via Prisma.
- Clerk handles all authentication, user invites, and session management.
- All asset and user files are stored in AWS S3 buckets.
- Transactional emails (invites, password resets, notifications) are sent via Resend.
- UI is built with Tailwind CSS and shadcn/ui for rapid, accessible development.
- The app is designed for easy deployment to cloud infrastructure (AWS, Vercel, etc.).

## Intended Audience
- **Developers:** For onboarding, maintenance, and future feature development.
- **Stakeholders:** For understanding the business value and technical foundation.
- **AI Assistants (e.g., Cursor):** For context-aware code suggestions and refactoring.

---

**For more details, see the MVP plan and go-to-market strategy in the `docs/` folder.** 