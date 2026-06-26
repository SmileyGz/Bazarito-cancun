import React, { useState, useEffect } from 'react';
import { supabase } from '../data/store';

export default function CompressPage() {
  const [status, setStatus] = useState('Iniciando...');
  const [progress, setProgress] = useState(0);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    async function run() {
      try {
        const { data: session } = await supabase.auth.getSession();
        if (!session?.session) {
          setStatus('Por favor inicia sesión en /admin primero y luego regresa aquí.');
          return;
        }

        setStatus('Obteniendo productos...');
        const { data: products, error } = await supabase.from('products').select('id');
        if (error) throw error;

        setTotal(products.length);
        setStatus(`Encontrados ${products.length} productos. Comprimiendo fotos grandes...`);

        let done = 0;
        for (const p of products) {
          const { data: prod } = await supabase.from('products').select('images').eq('id', p.id).single();
          if (prod && prod.images && prod.images.length > 0) {
            let modified = false;
            const newImages = [];
            
            for (const img of prod.images) {
              if (img.startsWith('data:image/') && img.length > 50000) {
                // Compress it
                const compressed = await compressBase64Image(img, 400, 0.6);
                newImages.push(compressed);
                modified = true;
              } else {
                newImages.push(img);
              }
            }

            if (modified) {
              await supabase.from('products').update({ images: newImages }).eq('id', p.id);
            }
          }
          done++;
          setProgress(done);
        }
        setStatus('¡Compresión terminada exitosamente! Ya puedes volver a usar la aplicación.');
      } catch (err) {
        setStatus(`Error: ${err.message}`);
      }
    }
    run();
  }, []);

  return (
    <div style={{ padding: 40, fontFamily: 'sans-serif' }}>
      <h1>Herramienta de Compresión</h1>
      <p>{status}</p>
      {total > 0 && <p>Progreso: {progress} / {total}</p>}
    </div>
  );
}

function compressBase64Image(base64Str, maxWidth = 400, quality = 0.6) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/webp', quality));
    };
    img.src = base64Str;
  });
}
