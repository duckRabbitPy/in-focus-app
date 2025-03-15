import Head from "next/head";

interface PageHeadProps {
  title: string;
  description: string;
}

export function PageHead({ title, description }: PageHeadProps) {
  return (
    <Head>
      <title>{title} - In-focus</title>
      <meta name="description" content={description} />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link rel="icon" href="/favicon.ico" />
    </Head>
  );
}
