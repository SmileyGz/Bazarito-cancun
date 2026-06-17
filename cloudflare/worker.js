export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // 1. Interceptar SOLO las visitas a la página de producto (/p/:id)
    if (url.pathname.startsWith('/p/')) {
      const parts = url.pathname.split('/');
      const productId = parts[2];

      if (productId) {
        // Credenciales de lectura pública de tu Supabase
        const supabaseUrl = 'https://samwziooqhzohpszyddw.supabase.co';
        const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNhbXd6aW9vcWh6b2hwc3p5ZGR3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEwNDg1MzAsImV4cCI6MjA5NjYyNDUzMH0.EFmRsIARd_oh3tn_eB40J25CRpEU-v91phjwChlGnuw';
        
        try {
          // Consultar el producto específico
          const res = await fetch(`${supabaseUrl}/rest/v1/products?id=eq.${productId}&select=name,description,images`, {
            headers: {
              'apikey': supabaseKey,
              'Authorization': `Bearer ${supabaseKey}`,
              'Content-Type': 'application/json'
            }
          });

          const data = await res.json();
          if (data && data.length > 0) {
            const product = data[0];
            const title = `${product.name} | Bazarito Cancún`;
            // Limpiar descripciones largas y comillas
            const description = product.description 
              ? product.description.substring(0, 160).replace(/"/g, '&quot;') 
              : 'Encuentra los mejores productos con entregas seguras en Región 96 y alrededores.';
            const image = product.images && product.images.length > 0 
              ? product.images[0] 
              : `${url.origin}/Bazarito-cancun/Logo.png`;

            // Obtener el HTML original de tu página
            const originRes = await fetch(request);
            
            // Inyectar las etiquetas maestras para WhatsApp y Facebook
            class MetaRewriter {
              element(element) {
                element.append(`<meta property="og:title" content="${title}" />`, { html: true });
                element.append(`<meta property="og:description" content="${description}" />`, { html: true });
                element.append(`<meta property="og:image" content="${image}" />`, { html: true });
                element.append(`<meta property="og:url" content="${url.href}" />`, { html: true });
                element.append(`<meta property="og:type" content="product" />`, { html: true });
                element.append(`<meta name="twitter:card" content="summary_large_image" />`, { html: true });
                element.append(`<meta name="twitter:title" content="${title}" />`, { html: true });
                element.append(`<meta name="twitter:image" content="${image}" />`, { html: true });
              }
            }

            // Remover las etiquetas antiguas para evitar duplicados que confundan a iMessage/WhatsApp
            class MetaRemover {
              element(e) {
                e.remove();
              }
            }
            
            // Sobreescribir el título de la pestaña
            class TitleRewriter {
              element(element) {
                element.setInnerContent(title);
              }
            }

            // Devolver la respuesta transformada instantáneamente
            return new HTMLRewriter()
              .on('meta[property^="og:"]', new MetaRemover())
              .on('meta[name^="twitter:"]', new MetaRemover())
              .on('head', new MetaRewriter())
              .on('title', new TitleRewriter())
              .transform(originRes);
          }
        } catch (e) {
          console.error("Error consultando producto:", e);
          // Si algo falla, dejamos que pase de largo a la página original
        }
      }
    }

    // Para el resto del tráfico (Inicio, /admin, imágenes), dejar pasar normalmente
    return fetch(request);
  }
};
