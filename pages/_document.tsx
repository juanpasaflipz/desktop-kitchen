import Document, { Head, Html, Main, NextScript } from "next/document";

class MyDocument extends Document {
  render() {
    return (
      <Html lang="en">
        <Head>
          <link rel="icon" href="/favicon.ico" />
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link
            rel="preconnect"
            href="https://fonts.gstatic.com"
            crossOrigin="anonymous"
          />
          <link
            href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap"
            rel="stylesheet"
          />
          <meta name="theme-color" content="#DC2626" />
          <meta
            name="description"
            content="JUANBERTO'S — California burritos are coming to Roma Sur, CDMX. Carne asada. Fries inside. No shortcuts. Get on the list."
          />
          <meta property="og:site_name" content="JUANBERTO'S" />
          <meta
            property="og:description"
            content="California burritos are coming to Roma Sur, CDMX. Carne asada. Fries inside. No shortcuts."
          />
          <meta
            property="og:title"
            content="JUANBERTO'S — California Burritos — Roma Sur, CDMX"
          />
          <meta name="twitter:card" content="summary_large_image" />
          <meta
            name="twitter:title"
            content="JUANBERTO'S — California Burritos — Roma Sur, CDMX"
          />
          <meta
            name="twitter:description"
            content="Roma Sur isn't ready. California burritos. Opening soon."
          />
        </Head>
        <body className="bg-white antialiased">
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
