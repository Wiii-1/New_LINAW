import Script from "next/script";

interface GoogleTagManagerProps {
  gtmId: string;
  nonce?: string;
}

export function GoogleTagManager({
  gtmId,
  nonce,
}: Readonly<GoogleTagManagerProps>) {
  return (
    <>
      <Script
        id="_next-gtm-init"
        strategy="afterInteractive"
        nonce={nonce}
        dangerouslySetInnerHTML={{
          __html: `
            (function(w,l){
              w[l]=w[l]||[];
              w[l].push({'gtm.start': new Date().getTime(),event:'gtm.js'});
            })(window,'dataLayer');
          `,
        }}
      />
      <Script
        id="_next-gtm"
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(gtmId)}`}
        nonce={nonce}
      />
      <noscript>
        <iframe
          src={`https://www.googletagmanager.com/ns.html?id=${encodeURIComponent(gtmId)}`}
          height="0"
          width="0"
          title="Google Tag Manager"
          hidden
          aria-hidden="true"
        />
      </noscript>
    </>
  );
}
