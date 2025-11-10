import Head from 'next/head';

type Props = {
  title?: string;
  description?: string;
  children: JSX.Element | JSX.Element[];
};

const PageContainer = ({ title, description, children }: Props) => (
  <>
    <Head>
        <title>Hashdle — Crypto Guessing Game</title>
        <meta name="description" content="Guess a five-letter sequence in three tries to win up to $5." />
        <meta property="og:title" content="Hashdle — Crypto Guessing Game" />
        <meta property="og:description" content="Guess a five-letter sequence in three tries to win up to $5." />
        <meta property="og:image" content="https://www.hashdle.com/images/preview.png" />
        <meta property="og:url" content="https://https://www.hashdle.com" />
        <meta property="og:type" content="website" />
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />   
    </Head>
    {children}
  </>
);

export default PageContainer;
