import React, { useEffect, useRef } from 'react';

// Mercado Pago SDK is loaded via script tag injected once
let sdkPromise = null;
function loadMPSdk() {
  if (sdkPromise) return sdkPromise;
  sdkPromise = new Promise((resolve, reject) => {
    if (window.MercadoPago) { resolve(window.MercadoPago); return; }
    const script = document.createElement('script');
    script.src = 'https://sdk.mercadopago.com/js/v2';
    script.onload = () => resolve(window.MercadoPago);
    script.onerror = reject;
    document.head.appendChild(script);
  });
  return sdkPromise;
}

export default function MercadoPagoWallet({ preferenceId, onError }) {
  const containerRef = useRef(null);
  const brickRef     = useRef(null);

  useEffect(() => {
    if (!preferenceId) return;

    let destroyed = false;
    let activeBrick = null;

    loadMPSdk().then((MercadoPago) => {
      if (destroyed || !containerRef.current) return;

      const mp = new MercadoPago(process.env.NEXT_PUBLIC_MP_PUBLIC_KEY, { locale: 'es-MX' });
      const bricksBuilder = mp.bricks();

      // Clear any previous elements to avoid duplicates/stale state
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }

      bricksBuilder.create('wallet', 'mp-wallet-container', {
        initialization: { preferenceId },
        callbacks: {
          onError: (err) => {
            console.error('MP Wallet error', err);
            if (!destroyed && onError) onError(err);
          },
        },
      }).then((brick) => {
        if (destroyed) {
          brick.unmount();
        } else {
          activeBrick = brick;
          brickRef.current = brick;
        }
      });
    }).catch((err) => {
      console.error('Failed to load MP SDK', err);
      if (!destroyed && onError) onError(err);
    });

    return () => {
      destroyed = true;
      if (activeBrick) {
        activeBrick.unmount();
      }
    };
  }, [preferenceId]);

  if (!preferenceId) return null;

  return (
    <div>
      <div id="mp-wallet-container" ref={containerRef} style={{ minHeight: 60 }} />
    </div>
  );
}
