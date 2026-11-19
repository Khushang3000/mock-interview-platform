This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app). Otp verification enabled

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

## Vapi setup

Set these values in `.env.local`:

```env
NEXT_PUBLIC_VAPI_WEB_TOKEN=your_vapi_public_api_key
NEXT_PUBLIC_VAPI_ASSISTANT_ID=your_interview_generation_assistant_id
```

Create the generation assistant in the same Vapi account as the public API key. Configure its API Request tool to send `type`, `role`, `level`, `techstack`, `amount`, and `userid` to `/api/vapi/generate`; use the assistant's `{{userid}}` variable for `userid`, which the app supplies at call start. The app also supplies `username` for a personalized first message. The endpoint must be reachable by Vapi over HTTPS; `localhost` is not reachable from Vapi's servers.

The separate interview-taking assistant is configured inline in `constants/index.ts`; do not create a second permanent Vapi assistant for it. It runs as a transient assistant, so allow transient assistants on the public API key.
The interview-taking assistant uses Vapi-managed transcription; no separate Deepgram API key is required.

## Phone verification for sign-up

Sign-up requires verifying a phone number by SMS before the name, email, and password fields are enabled. Firebase Authentication must have the **Phone** provider enabled, and both `localhost` and the deployed site must be listed under **Authentication → Settings → Authorized domains**. Configure allowed SMS regions in Firebase, and use Firebase's fictional phone numbers/codes for development tests to avoid sending paid SMS.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
