import '../src/index.css';
import Navbar from '../src/components/Navbar';
import Footer from '../src/components/Footer';
import Script from 'next/script';

export const viewport = {
  themeColor: '#FFD000',
};

export const metadata = {
  title: 'Bazarito Cancún ☀️ — Productos útiles a precios locales',
  description: 'Organización, gadgets, hogar, mascotas y más. Productos reales, precios locales y entregas seguras en Cancún (Región 96 y alrededores).',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Bazarito',
  },
  icons: {
    icon: '/Logo.png',
    apple: '/icon-192.png',
  },
  openGraph: {
    type: 'website',
    url: 'https://bazaritocancun.com/',
    title: 'Bazarito Cancún ☀️ — Tu bazar local',
    description: '¡Ofertas, gadgets y más en un solo lugar! Encuentra lo que necesitas con entrega rápida en Cancún.',
    images: [{ url: 'https://bazaritocancun.com/Logo.png' }],
    locale: 'es_MX',
    siteName: 'Bazarito Cancún',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bazarito Cancún ☀️ — Tu bazar local',
    description: '¡Ofertas, gadgets y más en un solo lugar! Encuentra lo que necesitas con entrega rápida en Cancún.',
    images: ['https://bazaritocancun.com/Logo.png'],
  },
};

export default function RootLayout({ children }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "Bazarito Cancún",
    "description": "Bazar local en Cancún con entrega a domicilio. Gadgets, hogar, mascotas, bienestar y más a precios locales en Región 96 y alrededores.",
    "url": "https://bazaritocancun.com",
    "logo": "https://bazaritocancun.com/Logo.png",
    "image": "https://bazaritocancun.com/Logo.png",
    "telephone": "+52-954-338-8332",
    "priceRange": "$$",
    "currenciesAccepted": "MXN",
    "paymentAccepted": "Cash, Credit Card, MercadoPago",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Cancún",
      "addressRegion": "Quintana Roo",
      "addressCountry": "MX"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "21.1619",
      "longitude": "-86.8515"
    },
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],
        "opens": "09:00",
        "closes": "18:00"
      }
    ],
    "sameAs": [
      "https://www.facebook.com/bazaritocancun",
      "https://www.tiktok.com/@bazaritocancun"
    ],
    "areaServed": {
      "@type": "GeoCircle",
      "geoMidpoint": {
        "@type": "GeoCoordinates",
        "latitude": "21.1619",
        "longitude": "-86.8515"
      },
      "geoRadius": "10000"
    },
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Catálogo Bazarito",
      "itemListElement": [
        { "@type": "Offer", "itemOffered": { "@type": "Product", "name": "Gadgets y Tecnología" } },
        { "@type": "Offer", "itemOffered": { "@type": "Product", "name": "Hogar y Decoración" } },
        { "@type": "Offer", "itemOffered": { "@type": "Product", "name": "Mascotas" } },
        { "@type": "Offer", "itemOffered": { "@type": "Product", "name": "Bienestar y Personal" } }
      ]
    }
  };

  return (
    <html lang="es-MX">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {/* GTM */}
        <Script
          id="gtm-script"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','GTM-T2GGQLP7');
            `,
          }}
        />
        {/* Meta Pixel */}
        <Script
          id="meta-pixel"
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
              fbq('init', '933683316366381');
              fbq('track', 'PageView');
            `,
          }}
        />
      </head>
      <body style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-T2GGQLP7"
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          ></iframe>
        </noscript>
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: 'none' }}
            src="https://www.facebook.com/tr?id=933683316366381&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>

        <Navbar />
        <main style={{ flex: 1 }}>
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
