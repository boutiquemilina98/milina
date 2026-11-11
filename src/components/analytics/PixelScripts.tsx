"use client";

import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, Suspense } from "react";
import { trackPageView } from "@/lib/pixel";

interface PixelScriptsProps {
  facebookPixelId?: string | null;
  facebookEnabled?: boolean;
  tiktokPixelId?: string | null;
  tiktokEnabled?: boolean;
}

function NavigationTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isFirstLoad = useRef(true);

  useEffect(() => {
    // Skip admin pages
    if (pathname?.startsWith("/admin")) return;

    // Skip the first render because the base pixel snippet already fires the initial PageView
    if (isFirstLoad.current) {
      isFirstLoad.current = false;
      return;
    }

    trackPageView();
  }, [pathname, searchParams]);

  return null;
}

export function PixelScripts({
  facebookPixelId,
  facebookEnabled = true,
  tiktokPixelId,
  tiktokEnabled = true,
}: PixelScriptsProps) {
  const fbId = (facebookPixelId || "").trim();
  const ttId = (tiktokPixelId || "").trim();

  const isFbActive = Boolean(facebookEnabled && fbId);
  const isTtActive = Boolean(tiktokEnabled && ttId);

  return (
    <>
      {/* Route Change Tracker */}
      <Suspense fallback={null}>
        <NavigationTracker />
      </Suspense>

      {/* Meta (Facebook) Pixel */}
      {isFbActive && (
        <>
          <Script
            id="meta-pixel-init"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                !function(f,b,e,v,n,t,s)
                {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                n.queue=[];t=b.createElement(e);t.async=!0;
                t.src=v;s=b.getElementsByTagName(e)[0];
                s.parentNode.insertBefore(t,s)}(window, document,'script',
                'https://connect.facebook.net/en_US/fbevents.js');
                fbq('init', '${fbId}');
                fbq('track', 'PageView');
              `,
            }}
          />
          <noscript>
            <img
              height="1"
              width="1"
              style={{ display: "none" }}
              src={`https://www.facebook.com/tr?id=${fbId}&ev=PageView&noscript=1`}
              alt=""
            />
          </noscript>
        </>
      )}

      {/* TikTok Pixel */}
      {isTtActive && (
        <Script
          id="tiktok-pixel-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              !function (w, d, t) {
                w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var r="https://analytics.tiktok.com/i18n/pixel/events.js",o=n&&n.partner;ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=r,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var a=document.createElement("script");a.type="text/javascript",a.async=!0,a.src=r+"?sdkid="+e+"&lib="+t;var c=document.getElementsByTagName("script")[0];c.parentNode.insertBefore(a,c)};
                ttq.load('${ttId}');
                ttq.page();
              }(window, document, 'ttq');
            `,
          }}
        />
      )}
    </>
  );
}
