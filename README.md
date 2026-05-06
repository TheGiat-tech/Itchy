This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Environment variables

Copy `.env.example` to `.env.local` and fill in the values before running the project.

```bash
cp .env.example .env.local
```

| Variable | Required | Description |
|---|---|---|
| `RESEND_API_KEY` | ✅ | Resend secret API key – get one at [resend.com](https://resend.com). **Server-only; never expose to the browser.** |
| `RESEND_FROM_EMAIL` | ✅ | Verified sender address, e.g. `Itchi <noreply@yourdomain.com>`. The domain must be verified in the Resend dashboard. Use `onboarding@resend.dev` for local testing. |
| `RESEND_TO_EMAIL` | ☑️ optional | Recipient of contact-form leads. Falls back to the hardcoded address when not set. |

### Resend setup (production – Vercel)

1. Sign up at <https://resend.com> and create an API key.
2. Verify your sending domain under **Domains → Add Domain**.
3. Add the three variables above in **Vercel → Project Settings → Environment Variables**.
4. Redeploy for the changes to take effect.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
