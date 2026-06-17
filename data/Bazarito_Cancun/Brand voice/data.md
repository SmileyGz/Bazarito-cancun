# Bazarito Cancún — Brand & Design Guidelines

## 1. Brand Identity & Strategy

### Vision & Positioning
**"Useful finds for everyday life in Cancún."** (*"Finds útiles para tu día a día en Cancún"*)

Bazarito Cancún is a local discovery-commerce experience combining the excitement of "treasure hunting" with a curated catalog of highly useful, everyday products. It is **not** a generic online store or dropshipper; it thrives on conversational commerce, local trust, and fast delivery from Región 96.

**The desired customer thought:** *"I wonder what Bazarito has today."*

### Tone of Voice
- **Vibrant & Friendly:** Conversational, helpful, and deeply rooted in local Cancún culture without being cliché.
- **Direct & Honest:** No corporate jargon. Straightforward product descriptions, honest stock updates ("Única" vs "Stock").
- **Emoji-Forward:** Uses emojis expressively but purposefully to break up text and add visual flair (e.g., 🌮, 🌴, 🛵, 📦).

---

## 2. Design Tokens

### Color Palette

| Color Name | Hex Code | Usage / Context |
| :--- | :--- | :--- |
| **Brand Yellow** | `#FFD000` | Primary accents, interactive highlights, hover borders, active chips. |
| **Brand Teal** | `#1A7A6D` | Trust signals, primary typography highlights, stock badges, secondary buttons. |
| **Brand Orange** | `#E84B09` | High-urgency elements, primary buttons, "Sold" overlays, one-off badges. |
| **Deep Black** | `#1A1208` | Primary text, high-contrast UI elements. |
| **Warm White** | `#FFFBEE` | Main application background (Base). |
| **Card White** | `#FFFFFF` | Background for cards, modal boxes, and inputs. |
| **Warm Border** | `#F0E6B0` | Default borders for cards, inputs, and dividers. |

*Note: Vibrant colors are often accompanied by matching soft-colored drop shadows (e.g., teal shadows for teal buttons).*

### Typography
- **Display / Headings:** `Outfit` (Weights: 400, 500, 600, 700, 800, 900)
  - Used for titles, badges, buttons, and anything requiring high impact and playful geometry.
- **Body:** `Inter` (Weights: 400, 500, 600)
  - Used for paragraphs, product descriptions, and utility text for maximum legibility.

### Radii & Borders
- **Pills / Buttons / Badges:** `--radius-full` (`999px`) — Bazarito relies heavily on fully rounded pill shapes for interactive elements.
- **Cards & Modals:** `--radius-lg` (`20px`) to `--radius-xl` (`28px`) — Soft, friendly, large border radii for containers.

---

## 3. Visual Patterns & UI Components

### The "Sticker & Confetti" Aesthetic
To emulate the fun, local "Bazaar" feel, the UI utilizes floating emoji stickers and angled confetti dashes.
- **Execution:** Emojis are scaled up (`2rem` - `2.8rem`), slightly rotated (`-12deg` to `15deg`), and set to slowly float using CSS animations.
- **Context:** Used heavily in hero sections and marketing materials to create a lively atmosphere.

### Ambient Glassmorphism (Blobs)
Backgrounds shouldn't feel flat. The brand uses large, blurred colored orbs (Blobs) behind content to create a vibrant, warm glow.
- **Execution:** Absolute positioned circles (`300px` - `500px`), heavily blurred (`filter: blur(70px)`), using low-opacity brand colors (Yellow, Teal, Orange).

### Colored Shadows
Instead of harsh gray drop shadows, interactive elements use vibrant, tinted shadows.
- **Example:** Primary Orange button uses `box-shadow: 0 4px 20px rgba(232,75,9,0.25)`.

### Conversational CTA
The primary conversion mechanism is **Messenger / WhatsApp**, not a traditional shopping cart checkout.
- Buttons feature a distinct gradient (`linear-gradient(135deg, #0099FF, #A033FF)`) to signify social/chat interaction, always paired with a chat icon and conversational copy ("Pregunta lo que necesitas").

---

## 4. Strategic Application & Best Practices

### The Web Application
- **Keep it fast and skimmable:** Ensure the "Sticker" aesthetic doesn't clutter mobile views. Hide non-essential decorative elements on screens `< 640px`.
- **Clear Inventory Signifiers:** Heavily utilize the Pill UI to distinguish between unique finds (`Única`) and repeatable products (`Stock`).
- **Engaging Loading States:** Use the branded golden skeleton shimmer (`linear-gradient(90deg, #f0e8c8 25%, #fff8d6 50%, #f0e8c8 75%)`) instead of standard gray loaders.

### Social Media (Facebook, Instagram, TikTok)
- **Visual Continuity:** Apply the "ambient blob" backgrounds and "sticker tape" overlays directly to social media graphics.
- **Typography:** Always use `Outfit` (Bold/ExtraBold) for text overlays on Reels/TikToks to maintain brand recognition.
- **Content Style:** Emphasize the "Treasure Hunt." Post quick, fast-paced videos showcasing "What's new today at Bazarito." Highlight local delivery via motorcycle (🛵).

### WhatsApp & Conversational Commerce
- **Tone:** Friendly, immediate, and helpful. Treat the customer like a neighbor.
- **Formatting:** Break up text with bullet points and emojis.
- **Visuals:** When sending product photos via chat, add a small digital "sticker" or the product price in the `Outfit` font directly on the image to keep the branded experience intact.

### Physical Touchpoints (Packaging & Delivery)
- **The "Unboxing":** Translate the digital sticker aesthetic into the physical world. Seal bags or boxes with literal custom stickers featuring the brand's signature emojis and phrases.
- **Thank You Cards:** Include a small card with the `Outfit` font, heavy rounded corners, and a QR code linking directly to the Messenger/WhatsApp chat for their next purchase.
- **Colors:** Use bright Yellow or Teal tape for packaging to make local deliveries instantly recognizable on the streets of Cancún.
