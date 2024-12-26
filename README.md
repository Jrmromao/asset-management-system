This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
yarn dev
```


For the climate data and Carbon footprint I'm going to use chatGPT 
Just need to request the result in a template and the API will return the way i want:
 

```json lines
{
  "model": "gpt-4",
  "messages": [
    {
      "role": "user",
      "content": "What is the CO2e of a desktop computer? Please provide the answer in the following JSON format: {\"CO2e\": \"value\", \"details\": \"short explanation\"}"
    }
  ],
  "temperature": 0.2
}

```
Then I can save this result in a DB



[//]: # (Forget about the below API)
[//]: # (Climate API [here]&#40;https://www.climatiq.io/docs/guides/tutorials/cloud#memory-example-serverless-functions&#41;)



Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/_page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
