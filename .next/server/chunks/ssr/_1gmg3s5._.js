module.exports=[8174,a=>{"use strict";a.s(["default",()=>b]);let b=(0,a.i(11857).registerClientReference)(function(){throw Error("Attempted to call the default export of [project]/node_modules/lucide-react/dist/esm/Icon.mjs <module evaluation> from the server, but it's on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.")},"[project]/node_modules/lucide-react/dist/esm/Icon.mjs <module evaluation>","default")},90697,a=>{"use strict";a.s(["default",()=>b]);let b=(0,a.i(11857).registerClientReference)(function(){throw Error("Attempted to call the default export of [project]/node_modules/lucide-react/dist/esm/Icon.mjs from the server, but it's on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.")},"[project]/node_modules/lucide-react/dist/esm/Icon.mjs","default")},53808,a=>{"use strict";a.i(8174);var b=a.i(90697);a.n(b)},64240,(a,b,c)=>{"use strict";function d(a){if("function"!=typeof WeakMap)return null;var b=new WeakMap,c=new WeakMap;return(d=function(a){return a?c:b})(a)}c._=function(a,b){if(!b&&a&&a.__esModule)return a;if(null===a||"object"!=typeof a&&"function"!=typeof a)return{default:a};var c=d(b);if(c&&c.has(a))return c.get(a);var e={__proto__:null},f=Object.defineProperty&&Object.getOwnPropertyDescriptor;for(var g in a)if("default"!==g&&Object.prototype.hasOwnProperty.call(a,g)){var h=f?Object.getOwnPropertyDescriptor(a,g):null;h&&(h.get||h.set)?Object.defineProperty(e,g,h):e[g]=a[g]}return e.default=a,c&&c.set(a,e),e}},790,(a,b,c)=>{let{createClientModuleProxy:d}=a.r(11857);a.n(d("[project]/node_modules/next/dist/client/app-dir/link.js <module evaluation>"))},84707,(a,b,c)=>{let{createClientModuleProxy:d}=a.r(11857);a.n(d("[project]/node_modules/next/dist/client/app-dir/link.js"))},97647,a=>{"use strict";a.i(790);var b=a.i(84707);a.n(b)},95936,(a,b,c)=>{"use strict";Object.defineProperty(c,"__esModule",{value:!0});var d={default:function(){return i},useLinkStatus:function(){return h.useLinkStatus}};for(var e in d)Object.defineProperty(c,e,{enumerable:!0,get:d[e]});let f=a.r(64240),g=a.r(7997),h=f._(a.r(97647));function i(a){let b=a.legacyBehavior,c="string"==typeof a.children||"number"==typeof a.children||"string"==typeof a.children?.type,d=a.children?.type?.$$typeof===Symbol.for("react.client.reference");return!b||c||d||(a.children?.type?.$$typeof===Symbol.for("react.lazy")?console.error("Using a Lazy Component as a direct child of `<Link legacyBehavior>` from a Server Component is not supported. If you need legacyBehavior, wrap your Lazy Component in a Client Component that renders the Link's `<a>` tag."):console.error("Using a Server Component as a direct child of `<Link legacyBehavior>` is not supported. If you need legacyBehavior, wrap your Server Component in a Client Component that renders the Link's `<a>` tag.")),(0,g.jsx)(h.default,{...a})}("function"==typeof c.default||"object"==typeof c.default&&null!==c.default)&&void 0===c.default.__esModule&&(Object.defineProperty(c.default,"__esModule",{value:!0}),Object.assign(c.default,c),b.exports=c.default)},72123,(a,b,c)=>{let{createClientModuleProxy:d}=a.r(11857);a.n(d("[project]/node_modules/next/dist/client/script.js <module evaluation>"))},44536,(a,b,c)=>{let{createClientModuleProxy:d}=a.r(11857);a.n(d("[project]/node_modules/next/dist/client/script.js"))},11153,a=>{"use strict";a.i(72123);var b=a.i(44536);a.n(b)},71618,(a,b,c)=>{b.exports=a.r(11153)},98421,a=>{"use strict";var b=a.i(7997),c=a.i(717);let d=a=>{let b=a.replace(/^([A-Z])|[\s-_]+(\w)/g,(a,b,c)=>c?c.toUpperCase():b.toLowerCase());return b.charAt(0).toUpperCase()+b.slice(1)};var e=a.i(53808);let f=(a,b)=>{let f=(0,c.forwardRef)(({className:f,...g},h)=>(0,c.createElement)(e.default,{ref:h,iconNode:b,className:((...a)=>a.filter((a,b,c)=>!!a&&""!==a.trim()&&c.indexOf(a)===b).join(" ").trim())(`lucide-${d(a).replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase()}`,`lucide-${a}`,f),...g}));return f.displayName=d(a),f},g=f("message-circle",[["path",{d:"M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719",key:"1sd12s"}]]);var h=a.i(95936);function i(){return(0,b.jsxs)("nav",{className:"navbar",children:[(0,b.jsxs)("div",{className:"container navbar-inner",children:[(0,b.jsx)(h.default,{href:"/",className:"navbar-logo",children:(0,b.jsx)("img",{src:"/Logo.png",alt:"Bazarito Cancún",style:{height:44}})}),(0,b.jsx)("div",{className:"navbar-actions",children:(0,b.jsxs)("a",{href:"https://m.me/61574976372140",target:"_blank",rel:"noopener noreferrer",className:"btn btn-primary btn-sm navbar-chat-btn","aria-label":"Habla con nosotros por Messenger",children:[(0,b.jsx)(g,{size:16}),(0,b.jsx)("span",{className:"hide-mobile",children:"Chat"})]})})]}),(0,b.jsx)("style",{children:`
        .navbar {
          position: sticky;
          top: 0;
          z-index: 100;
          background: rgba(255,251,238,0.92);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-bottom: 1.5px solid var(--border);
          box-shadow: 0 2px 12px rgba(26,18,8,0.06);
          padding-top: env(safe-area-inset-top);
        }
        .navbar-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 64px;
        }
        .navbar-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
        }
        .logo-icon {
          width: 40px;
          height: 40px;
          background: var(--yellow);
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.3rem;
          box-shadow: 0 2px 8px rgba(255,208,0,0.3);
          flex-shrink: 0;
        }
        .logo-text {
          display: flex;
          flex-direction: column;
          line-height: 1.1;
        }
        .logo-bazarito {
          font-family: var(--font-display);
          font-weight: 900;
          font-size: 1.1rem;
          color: var(--teal);
          letter-spacing: -0.01em;
        }
        .logo-cancun {
          font-family: var(--font-display);
          font-weight: 900;
          font-size: 1.1rem;
          color: var(--orange);
          letter-spacing: -0.01em;
        }
        .navbar-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        @media (max-width: 480px) {
          .hide-mobile { display: none; }
        }
      `})]})}function j(){return(0,b.jsxs)("footer",{className:"global-footer",children:[(0,b.jsxs)("div",{className:"container",style:{textAlign:"center",paddingTop:40,paddingLeft:20,paddingRight:20,paddingBottom:"calc(40px + env(safe-area-inset-bottom))"},children:[(0,b.jsx)("img",{src:"/Logo.png",alt:"Bazarito Cancún",style:{height:50,display:"block",margin:"0 auto 16px auto"}}),(0,b.jsx)("p",{style:{fontSize:"0.85rem",color:"var(--text-secondary)",fontWeight:600,marginBottom:4},children:"Productos reales · Entregas seguras · Región 96, Cancún, México"}),(0,b.jsxs)("p",{style:{fontSize:"0.82rem",color:"var(--text-muted)"},children:["© ",new Date().getFullYear()," Bazarito Cancun. Todos los derechos reservados"]}),(0,b.jsx)("div",{style:{marginTop:24},children:(0,b.jsx)("a",{href:"#",target:"_blank",rel:"noopener noreferrer",style:{fontSize:"0.75rem",color:"var(--teal)",textDecoration:"none",fontWeight:700,letterSpacing:"0.05em",textTransform:"uppercase",opacity:.8},children:"⚡ Powered by Jonla Agencia"})})]}),(0,b.jsx)("style",{children:`
        .global-footer {
          background: var(--bg-muted);
          border-top: 1.5px solid var(--border);
          margin-top: auto;
        }
      `})]})}a.i(36177),f("package",[["path",{d:"M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z",key:"1a0edw"}],["path",{d:"M12 22V12",key:"d0xqtd"}],["polyline",{points:"3.29 7 12 12 20.71 7",key:"ousv84"}],["path",{d:"m7.5 4.27 9 5.15",key:"1c824w"}]]),f("house",[["path",{d:"M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8",key:"5wwlr5"}],["path",{d:"M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z",key:"r6nss1"}]]),f("plug",[["path",{d:"M12 22v-5",key:"1ega77"}],["path",{d:"M15 8V2",key:"18g5xt"}],["path",{d:"M17 8a1 1 0 0 1 1 1v4a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1z",key:"1xoxul"}],["path",{d:"M9 8V2",key:"14iosj"}]]),f("paw-print",[["circle",{cx:"11",cy:"4",r:"2",key:"vol9p0"}],["circle",{cx:"18",cy:"8",r:"2",key:"17gozi"}],["circle",{cx:"20",cy:"16",r:"2",key:"1v9bxh"}],["path",{d:"M9 10a5 5 0 0 1 5 5v3.5a3.5 3.5 0 0 1-6.84 1.045Q6.52 17.48 4.46 16.84A3.5 3.5 0 0 1 5.5 10Z",key:"1ydw1z"}]]),f("sparkles",[["path",{d:"M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z",key:"1s2grr"}],["path",{d:"M20 2v4",key:"1rf3ol"}],["path",{d:"M22 4h-4",key:"gwowj6"}],["circle",{cx:"4",cy:"20",r:"2",key:"6kqj1y"}]]),f("shirt",[["path",{d:"M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z",key:"1wgbhj"}]]);var k=a.i(71618);a.s(["default",0,function({children:a}){return(0,b.jsxs)("html",{lang:"es-MX",children:[(0,b.jsxs)("head",{children:[(0,b.jsx)("script",{type:"application/ld+json",dangerouslySetInnerHTML:{__html:JSON.stringify({"@context":"https://schema.org","@type":"LocalBusiness",name:"Bazarito Cancún",description:"Bazar local en Cancún con entrega a domicilio. Gadgets, hogar, mascotas, bienestar y más a precios locales en Región 96 y alrededores.",url:"https://bazaritocancun.com",logo:"https://bazaritocancun.com/Logo.png",image:"https://bazaritocancun.com/Logo.png",telephone:"+52-954-338-8332",priceRange:"$$",currenciesAccepted:"MXN",paymentAccepted:"Cash, Credit Card, MercadoPago",address:{"@type":"PostalAddress",addressLocality:"Cancún",addressRegion:"Quintana Roo",addressCountry:"MX"},geo:{"@type":"GeoCoordinates",latitude:"21.1619",longitude:"-86.8515"},openingHoursSpecification:[{"@type":"OpeningHoursSpecification",dayOfWeek:["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],opens:"09:00",closes:"18:00"}],sameAs:["https://www.facebook.com/bazaritocancun","https://www.tiktok.com/@bazaritocancun"],areaServed:{"@type":"GeoCircle",geoMidpoint:{"@type":"GeoCoordinates",latitude:"21.1619",longitude:"-86.8515"},geoRadius:"10000"},hasOfferCatalog:{"@type":"OfferCatalog",name:"Catálogo Bazarito",itemListElement:[{"@type":"Offer",itemOffered:{"@type":"Product",name:"Gadgets y Tecnología"}},{"@type":"Offer",itemOffered:{"@type":"Product",name:"Hogar y Decoración"}},{"@type":"Offer",itemOffered:{"@type":"Product",name:"Mascotas"}},{"@type":"Offer",itemOffered:{"@type":"Product",name:"Bienestar y Personal"}}]}})}}),(0,b.jsx)(k.default,{id:"gtm-script",strategy:"afterInteractive",dangerouslySetInnerHTML:{__html:`
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','GTM-T2GGQLP7');
            `}}),(0,b.jsx)(k.default,{id:"meta-pixel",strategy:"afterInteractive",dangerouslySetInnerHTML:{__html:`
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
            `}})]}),(0,b.jsxs)("body",{style:{display:"flex",flexDirection:"column",minHeight:"100vh"},children:[(0,b.jsx)("noscript",{children:(0,b.jsx)("iframe",{src:"https://www.googletagmanager.com/ns.html?id=GTM-T2GGQLP7",height:"0",width:"0",style:{display:"none",visibility:"hidden"}})}),(0,b.jsx)("noscript",{children:(0,b.jsx)("img",{height:"1",width:"1",style:{display:"none"},src:"https://www.facebook.com/tr?id=933683316366381&ev=PageView&noscript=1",alt:""})}),(0,b.jsx)(i,{}),(0,b.jsx)("main",{style:{flex:1},children:a}),(0,b.jsx)(j,{})]})]})},"metadata",0,{title:"Bazarito Cancún ☀️ — Productos útiles a precios locales",description:"Organización, gadgets, hogar, mascotas y más. Productos reales, precios locales y entregas seguras en Cancún (Región 96 y alrededores).",manifest:"/manifest.json",appleWebApp:{capable:!0,statusBarStyle:"default",title:"Bazarito"},icons:{icon:"/Logo.png",apple:"/icon-192.png"},openGraph:{type:"website",url:"https://bazaritocancun.com/",title:"Bazarito Cancún ☀️ — Tu bazar local",description:"¡Ofertas, gadgets y más en un solo lugar! Encuentra lo que necesitas con entrega rápida en Cancún.",images:[{url:"https://bazaritocancun.com/Logo.png"}],locale:"es_MX",siteName:"Bazarito Cancún"},twitter:{card:"summary_large_image",title:"Bazarito Cancún ☀️ — Tu bazar local",description:"¡Ofertas, gadgets y más en un solo lugar! Encuentra lo que necesitas con entrega rápida en Cancún.",images:["https://bazaritocancun.com/Logo.png"]}},"viewport",0,{themeColor:"#FFD000"}],98421)},46122,a=>{a.n(a.i(98421))}];

//# sourceMappingURL=_1gmg3s5._.js.map