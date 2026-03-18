import { useState, useRef, useEffect, useCallback } from "react";

const CATS = [
  { id: "restaurant", label: "Restaurants", icon: "🍽️", color: "#E8843C", grad: "linear-gradient(135deg,#E8843C,#C4612E)" },
  { id: "daytrip", label: "Day Trips", icon: "🏝️", color: "#2D9CDB", grad: "linear-gradient(135deg,#2D9CDB,#0E7AB3)" },
  { id: "activity", label: "Activities", icon: "⚡", color: "#6FCF97", grad: "linear-gradient(135deg,#6FCF97,#27A05F)" },
  { id: "nightlife", label: "Nightlife", icon: "🌙", color: "#9B51E0", grad: "linear-gradient(135deg,#9B51E0,#7536BB)" },
  { id: "culture", label: "Culture", icon: "🎭", color: "#F2994A", grad: "linear-gradient(135deg,#F2994A,#D47B2E)" },
  { id: "wellness", label: "Wellness", icon: "🧘", color: "#56CCF2", grad: "linear-gradient(135deg,#56CCF2,#26ADD8)" },
  { id: "custom", label: "Custom", icon: "📌", color: "#78909C", grad: "linear-gradient(135deg,#78909C,#546E7A)" },
];

const SLOTS = [
  { id: "morning", label: "Morning", icon: "☀️", hint: "Great for sightseeing and outdoor activities" },
  { id: "afternoon", label: "Afternoon", icon: "🌤️", hint: "Culture, museums, or a slower pace" },
  { id: "evening", label: "Evening", icon: "🌙", hint: "Perfect for dinner or nightlife" },
];

const REC = {
  cantmiss: { label: "Can't Miss", color: "#E53935", bg: "#FFEBEE", icon: "🔥" },
  recommended: { label: "Recommended", color: "#F57C00", bg: "#FFF3E0", icon: "👍" },
  worthit: { label: "Worth It", color: "#7CB342", bg: "#F1F8E9", icon: "✓" },
};

const GR = ({ r, rv, sm }) => {
  if (!r) return null;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: sm ? 3 : 4 }}>
      <span style={{ fontSize: sm ? 11 : 13, fontWeight: 800, color: sm ? "#fff" : "#333" }}>{r}</span>
      <span style={{ display: "inline-flex" }}>
        {[1, 2, 3, 4, 5].map(s => {
          const f = Math.min(1, Math.max(0, r - s + 1));
          return (
            <span key={s} style={{ fontSize: sm ? 9 : 11, position: "relative", lineHeight: 1 }}>
              <span style={{ opacity: 0.2, color: sm ? "#fff" : "#FBBC04" }}>★</span>
              <span style={{ position: "absolute", left: 0, top: 0, overflow: "hidden", width: `${f * 100}%`, color: sm ? "#FFD54F" : "#FBBC04" }}>★</span>
            </span>
          );
        })}
      </span>
      {rv && !sm && <span style={{ fontSize: 10, color: "#888" }}>({rv})</span>}
    </div>
  );
};

// Themed SVG scenes per category
const SCENES = {
  restaurant: (w, h) => `<rect width="${w}" height="${h}" fill="url(#gr)"/><defs><linearGradient id="gr" x1="0" y1="0" x2="${w}" y2="${h}"><stop offset="0%" stop-color="#E8843C"/><stop offset="100%" stop-color="#C4612E"/></linearGradient></defs><circle cx="${w*0.3}" cy="${h*0.55}" r="${h*0.18}" fill="rgba(255,255,255,0.1)"/><circle cx="${w*0.7}" cy="${h*0.4}" r="${h*0.22}" fill="rgba(255,255,255,0.08)"/><rect x="${w*0.15}" y="${h*0.65}" width="${w*0.12}" height="${h*0.2}" rx="4" fill="rgba(255,255,255,0.12)"/><rect x="${w*0.32}" y="${h*0.58}" width="${w*0.12}" height="${h*0.27}" rx="4" fill="rgba(255,255,255,0.1)"/><text x="${w*0.5}" y="${h*0.45}" text-anchor="middle" font-size="${h*0.3}" opacity="0.4">🍽️</text>`,
  daytrip: (w, h) => `<rect width="${w}" height="${h}" fill="url(#gb)"/><defs><linearGradient id="gb" x1="0" y1="0" x2="0" y2="${h}"><stop offset="0%" stop-color="#2193B0"/><stop offset="60%" stop-color="#2D9CDB"/><stop offset="100%" stop-color="#1A8BC4"/></linearGradient></defs><ellipse cx="${w*0.5}" cy="${h*0.85}" rx="${w*0.6}" ry="${h*0.15}" fill="rgba(255,255,255,0.08)"/><path d="M0,${h*0.7} Q${w*0.25},${h*0.6} ${w*0.5},${h*0.7} Q${w*0.75},${h*0.8} ${w},${h*0.7} L${w},${h} L0,${h}Z" fill="rgba(255,255,255,0.1)"/><circle cx="${w*0.8}" cy="${h*0.2}" r="${h*0.12}" fill="rgba(255,255,255,0.15)"/><text x="${w*0.5}" y="${h*0.45}" text-anchor="middle" font-size="${h*0.3}" opacity="0.4">🏝️</text>`,
  activity: (w, h) => `<rect width="${w}" height="${h}" fill="url(#gg)"/><defs><linearGradient id="gg" x1="0" y1="0" x2="${w}" y2="${h}"><stop offset="0%" stop-color="#6FCF97"/><stop offset="100%" stop-color="#27A05F"/></linearGradient></defs><path d="M${w*0.1},${h} L${w*0.25},${h*0.4} L${w*0.4},${h}" fill="rgba(255,255,255,0.08)"/><path d="M${w*0.5},${h} L${w*0.7},${h*0.25} L${w*0.9},${h}" fill="rgba(255,255,255,0.1)"/><circle cx="${w*0.15}" cy="${h*0.25}" r="${h*0.08}" fill="rgba(255,255,255,0.12)"/><text x="${w*0.5}" y="${h*0.5}" text-anchor="middle" font-size="${h*0.3}" opacity="0.4">⚡</text>`,
  nightlife: (w, h) => `<rect width="${w}" height="${h}" fill="url(#gn)"/><defs><linearGradient id="gn" x1="0" y1="0" x2="${w}" y2="${h}"><stop offset="0%" stop-color="#1a1a3e"/><stop offset="100%" stop-color="#9B51E0"/></linearGradient></defs><circle cx="${w*0.2}" cy="${h*0.3}" r="2" fill="rgba(255,255,255,0.3)"/><circle cx="${w*0.6}" cy="${h*0.2}" r="1.5" fill="rgba(255,255,255,0.25)"/><circle cx="${w*0.8}" cy="${h*0.4}" r="2.5" fill="rgba(255,255,255,0.2)"/><circle cx="${w*0.4}" cy="${h*0.15}" r="1" fill="rgba(255,255,255,0.35)"/><circle cx="${w*0.9}" cy="${h*0.15}" r="1.5" fill="rgba(255,255,255,0.3)"/><text x="${w*0.5}" y="${h*0.5}" text-anchor="middle" font-size="${h*0.3}" opacity="0.4">🌙</text>`,
  culture: (w, h) => `<rect width="${w}" height="${h}" fill="url(#gc)"/><defs><linearGradient id="gc" x1="0" y1="0" x2="${w}" y2="${h}"><stop offset="0%" stop-color="#F2994A"/><stop offset="100%" stop-color="#D47B2E"/></linearGradient></defs><rect x="${w*0.2}" y="${h*0.3}" width="${w*0.15}" height="${h*0.5}" rx="2" fill="rgba(255,255,255,0.1)"/><rect x="${w*0.42}" y="${h*0.2}" width="${w*0.15}" height="${h*0.6}" rx="2" fill="rgba(255,255,255,0.08)"/><rect x="${w*0.65}" y="${h*0.35}" width="${w*0.15}" height="${h*0.45}" rx="2" fill="rgba(255,255,255,0.1)"/><path d="M${w*0.1},${h*0.25} L${w*0.5},${h*0.08} L${w*0.9},${h*0.25}" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="2"/><text x="${w*0.5}" y="${h*0.55}" text-anchor="middle" font-size="${h*0.25}" opacity="0.4">🎭</text>`,
  wellness: (w, h) => `<rect width="${w}" height="${h}" fill="url(#gw)"/><defs><linearGradient id="gw" x1="0" y1="0" x2="${w}" y2="${h}"><stop offset="0%" stop-color="#56CCF2"/><stop offset="100%" stop-color="#26ADD8"/></linearGradient></defs><path d="M0,${h*0.6} Q${w*0.15},${h*0.5} ${w*0.3},${h*0.6} Q${w*0.45},${h*0.7} ${w*0.6},${h*0.6} Q${w*0.75},${h*0.5} ${w},${h*0.6}" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="2"/><path d="M0,${h*0.7} Q${w*0.2},${h*0.6} ${w*0.4},${h*0.7} Q${w*0.6},${h*0.8} ${w*0.8},${h*0.7} Q${w*0.9},${h*0.65} ${w},${h*0.7}" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="2"/><text x="${w*0.5}" y="${h*0.45}" text-anchor="middle" font-size="${h*0.3}" opacity="0.4">🧘</text>`,
  custom: (w, h) => `<rect width="${w}" height="${h}" fill="url(#gx)"/><defs><linearGradient id="gx" x1="0" y1="0" x2="${w}" y2="${h}"><stop offset="0%" stop-color="#78909C"/><stop offset="100%" stop-color="#546E7A"/></linearGradient></defs><text x="${w*0.5}" y="${h*0.5}" text-anchor="middle" font-size="${h*0.3}" opacity="0.4">📌</text>`,
};

const Vis = ({ mod, cat, h = 100, br = 0, st = {} }) => {
  const [imgErr, setImgErr] = useState(false);
  // Try photo first, fall back to SVG
  if (mod.photo && !imgErr) {
    return (
      <div style={{ height: h, position: "relative", overflow: "hidden", borderRadius: br, background: cat?.grad || "#78909C", ...st }}>
        <img src={mod.photo} alt="" loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} onError={() => setImgErr(true)} />
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "50%", background: "linear-gradient(0deg,rgba(0,0,0,0.4) 0%,transparent 100%)" }} />
      </div>
    );
  }
  const scene = SCENES[mod.category] || SCENES.custom;
  const w = 400;
  const hN = typeof h === "number" ? h : 100;
  return (
    <div style={{ height: h, position: "relative", overflow: "hidden", borderRadius: br, ...st }}>
      <svg viewBox={`0 0 ${w} ${hN}`} preserveAspectRatio="xMidYMid slice" style={{ width: "100%", height: "100%", display: "block" }} dangerouslySetInnerHTML={{ __html: scene(w, hN) }} />
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "50%", background: "linear-gradient(0deg,rgba(0,0,0,0.35) 0%,transparent 100%)" }} />
    </div>
  );
};

const MODS = [
  // ═══ DRINKS ═══
  { id:"d1", name:"El Olivo Wine Bar", category:"nightlife", icon:"🍷", vibe:"Wine Bar", duration:1, notes:"A cozy natural wine bar tucked away in El Cangrejo — Panama's most walkable, bohemian neighborhood. They specialize in organic and biodynamic wines with 100+ labels and 10-15 rotating wines by the glass. The sommelier gives personalized recommendations based on your taste. Pair with their excellent tapas, cheese platters, or the standout pulpo en palito. Perfect for a relaxed evening out.", rec:"recommended", mapsRating:4.6, mapsReviews:"280", hours:"Tue–Sat 5PM–12AM", address:"Av. 1ab Norte, El Cangrejo", tier:"curated", cost:"$15–30/pp", tags:["date-night"], photo:"https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=600&h=400&fit=crop" },
  { id:"d2", name:"Mangle", category:"nightlife", icon:"🍸", vibe:"Cocktail Bar", duration:1, notes:"One of Panama City's best cocktail bars, designed to feel like a tropical friend's living room. The mangrove-inspired decor features aged copper, sea-green wood, and vintage memorabilia. Try the mezcal paloma or the Strawberry Letter milk punch. Great food too — birria tacos, shrimp baguettes, and Anti Burger sliders. Killer happy hour from noon to 7PM with $10 lunch specials.", rec:"cantmiss", mapsRating:4.8, mapsReviews:"180", hours:"Daily 12PM–12AM", address:"C. República de Uruguay", tier:"curated", cost:"$10–15/cocktail", tags:["date-night"], photo:"https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=600&h=400&fit=crop" },
  { id:"d3", name:"CasaCasco Rooftop", category:"nightlife", icon:"🌇", vibe:"Rooftop Bar", duration:1, notes:"A stunning rooftop terrace in Casco Viejo with panoramic views of the old town, the modern skyline, and the Pacific entrance to the Canal. The view alone is worth the visit — come at sunset for golden hour. Cocktails are decent, food is secondary to the scenery. Great for photos and a pre-dinner drink. Can get crowded on weekends.", rec:"recommended", mapsRating:4.3, mapsReviews:"1.5K", hours:"Daily 4PM–12AM", address:"Av. A, Casco Viejo", tier:"curated", cost:"$12–18/cocktail", tags:["sunset"], photo:"https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=600&h=400&fit=crop" },
  { id:"d4", name:"Boticario", category:"nightlife", icon:"🧪", vibe:"Speakeasy", duration:1, notes:"A speakeasy-style cocktail bar in El Cangrejo with an apothecary theme — think vintage bottles, dim lighting, and carefully crafted drinks. The bartenders are serious about their craft and will make recommendations based on your flavor preferences. Intimate space, best for couples or small groups. One of the more sophisticated nights out in the city.", rec:"worthit", mapsRating:4.5, mapsReviews:"120", hours:"Wed–Sat 6PM–1AM", address:"El Cangrejo", tier:"extended", cost:"$12–16/cocktail", tags:["date-night"], photo:"https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=600&h=400&fit=crop" },
  { id:"d5", name:"Colectivo LP", category:"nightlife", icon:"🎵", vibe:"Vinyl Bar", duration:1, notes:"A vinyl-focused bar with a curated collection of records and a laid-back atmosphere. Great for music lovers who want good drinks without the pretension. The crowd skews creative and local. Good cocktails, craft beer, and occasional DJ sets. A neighborhood favorite in the San Francisco district.", rec:"worthit", mapsRating:4.4, mapsReviews:"90", hours:"Thu–Sat 6PM–1AM", address:"San Francisco", tier:"extended", cost:"$8–12/drink", tags:[], photo:"https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=600&h=400&fit=crop" },
  { id:"d6", name:"Sama Rooftop", category:"nightlife", icon:"🌇", vibe:"Rooftop Dining", duration:1, notes:"A sleek rooftop lounge on top of a boutique hotel in Casco Viejo, offering high-end Italian-inspired cuisine alongside panoramic views of the old quarter. Known for its elegant atmosphere and well-crafted cocktails. The sunset views rival CasaCasco but with a more refined, less touristy vibe. Reservations recommended for dinner.", rec:"recommended", mapsRating:4.5, mapsReviews:"650", hours:"Daily 5PM–11PM", address:"Casco Viejo", tier:"curated", cost:"$15–25/cocktail, $30–50 dinner", tags:["date-night","sunset"], photo:"https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&h=400&fit=crop" },

  // ═══ FOOD ═══
  { id:"f1", name:"La Tapa del Coco", category:"restaurant", icon:"🌍", vibe:"Afro-Caribbean", duration:1, notes:"A culinary movement as much as a restaurant — Chef Isaac Villaverde is rescuing Afro-Panamanian cuisine and putting it on the global map (ranked in Latin America's 50 Best). The One Pot Colonense is the signature: coconut rice with pork ribs, beans, and fresh shrimp. Also try the cod fritters, jerk chicken, and patties de carne. Vibrant atmosphere with Afro-Caribbean music. Come hungry, leave amazed.", rec:"cantmiss", mapsRating:4.7, mapsReviews:"1K", hours:"Tue–Sun 12–10PM", address:"San Francisco", tier:"curated", cost:"$20–35/pp", tags:["history"], photo:"https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&h=400&fit=crop" },
  { id:"f2", name:"Keene's Ice Cream", category:"restaurant", icon:"🍦", vibe:"Ice Cream", duration:1, notes:"Panama's best artisanal ice cream, made from scratch with all-local ingredients — Bocas del Toro cacao, Volcán milk, and even ají chombo peppers. 100% gluten-free with excellent vegan and dairy-free options. Flavors rotate monthly so there's always something new. The Via Argentina flagship is the recommended location — outdoor seating, eco-friendly practices, and friendly staff who'll let you taste everything.", rec:"recommended", mapsRating:4.7, mapsReviews:"150", hours:"Via Argentina: Mon/Wed 3:30–10PM, other days vary", address:"Via Argentina, El Cangrejo", tier:"curated", cost:"$4–8", tags:["kid-friendly"], photo:"https://images.unsplash.com/photo-1501443762994-82bd5dace89a?w=600&h=400&fit=crop" },
  { id:"f3", name:"La Pulpería (Casco)", category:"restaurant", icon:"🍹", vibe:"Bar & Tapas", duration:1, notes:"One of Casco Viejo's most popular spots — ranked #3 on TripAdvisor for all of Panama City. Named after the 16th-century Latin American general stores that served as community hubs. Great cocktails (try the house specials in their wild presentation glasses), excellent ceviche, octopus tacos, and tapas for sharing. All-day happy hour Mon–Wed, amazing craft beer brewed in-house. Live music some nights.", rec:"cantmiss", mapsRating:4.7, mapsReviews:"1.5K", hours:"Mon–Thu 12PM–12AM, Fri–Sat til 2AM, Sun til 10PM", address:"Calle 9na Este, Casco Viejo", tier:"curated", cost:"$15–30/pp", tags:[], photo:"https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&h=400&fit=crop" },
  { id:"f4", name:"Gamboa Bakery", category:"restaurant", icon:"🥐", vibe:"Bakery & Café", duration:1, notes:"A charming bakery and café in Ciudad del Saber (City of Knowledge), a repurposed former US military base turned innovation campus. Great pastries, bread, and light bites in a peaceful garden setting. Worth combining with a walk around the Ciudad del Saber campus itself — it's a beautiful, green, walkable area with interesting architecture. Perfect for a relaxed morning.", rec:"worthit", mapsRating:4.4, mapsReviews:"200", hours:"Mon–Sat 7AM–5PM", address:"Ciudad del Saber, Clayton", tier:"extended", cost:"$5–12", tags:["kid-friendly"], photo:"https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&h=400&fit=crop" },
  { id:"f5", name:"Sassy", category:"restaurant", icon:"🥗", vibe:"Healthy Lunch", duration:1, notes:"A popular lunch spot in the Marbella neighborhood known for fresh, health-conscious food with bold flavors. Great salads, bowls, and lighter fare — a welcome change from the heavier Panamanian staples. The vibe is modern and airy. Best visited for a weekday lunch. Gets busy during the noon rush, so arrive before 12:30 or after 1:30.", rec:"worthit", mapsRating:4.3, mapsReviews:"320", hours:"Mon–Fri 11:30AM–3PM", address:"Marbella", tier:"extended", cost:"$12–18/pp", tags:[], photo:"https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&h=400&fit=crop" },
  { id:"f6", name:"Fonda Lo Que Hay", category:"restaurant", icon:"🐙", vibe:"Ceviche & Seafood", duration:1, notes:"The best ceviche in Casco Viejo, hands down. This intimate spot is run by a passionate team and the menu changes based on what's fresh. Reserve ahead — it's small and fills up fast. Try the pulpo and the ceviche mixto. The wine selection is thoughtful and the atmosphere is warm and unpretentious. One of those places that makes you feel like a local took you to their secret spot.", rec:"cantmiss", mapsRating:4.5, mapsReviews:"1.2K", hours:"Tue–Sun 12–10PM, Closed Mon", address:"Calle 11, Casco Viejo", tier:"curated", cost:"$25–40/pp", tags:["date-night"], photo:"https://images.unsplash.com/photo-1535399831218-d5bd36d1a6b3?w=600&h=400&fit=crop" },
  { id:"f7", name:"Mercado de Mariscos", category:"restaurant", icon:"🐟", vibe:"Fish Market", duration:1, notes:"Panama City's iconic fish market with a restaurant upstairs that serves the freshest, cheapest ceviche you'll find anywhere. Go upstairs to the ceviche stands — order a mixed ceviche and a cold Balboa beer. Downstairs is the raw fish market itself, worth a quick walk through for the experience. It's casual, bustling, and authentically Panamanian. Best visited mid-morning before the lunch crowds.", rec:"cantmiss", mapsRating:4.0, mapsReviews:"6.2K", hours:"Daily 5AM–5PM", address:"Av. Balboa, Casco Viejo", tier:"curated", cost:"$5–12/pp", tags:["kid-friendly","budget"], photo:"https://images.unsplash.com/photo-1534482421-64566f976cfa?w=600&h=400&fit=crop" },
  { id:"f8", name:"Farmers Market (Casco)", category:"restaurant", icon:"🧺", vibe:"Farmers Market", duration:1, notes:"A weekend farmers market in or near Casco Viejo selling fresh produce, artisanal goods, local coffee, baked goods, and street food. Great way to experience local food culture and pick up unique Panamanian products. Combine with a Casco Viejo walk for a perfect morning. Check locally for exact location and days as it can move seasonally.", rec:"worthit", mapsRating:0, mapsReviews:"", hours:"Weekends, morning", address:"Near Casco Viejo", tier:"extended", cost:"$5–15", tags:["kid-friendly","walking"], photo:"https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=600&h=400&fit=crop" },

  // ═══ ACTIVITIES ═══
  { id:"a1", name:"Panama Canal (Miraflores)", category:"activity", icon:"🚢", vibe:"Canal & Museum", duration:1, notes:"The must-see of Panama City — watch massive ships transit the locks from the viewing platform at Miraflores. Morning is best when the bigger vessels come through. The museum inside is excellent and explains the Canal's construction and impact. Allow at least 2 hours. The IMAX theater and interactive exhibits make it genuinely engaging even for people who aren't into engineering. Air-conditioned, great for hot days.", rec:"cantmiss", mapsRating:4.6, mapsReviews:"18K", bookingUrl:"https://visitcanaldepanama.com", hours:"Daily 8AM–5PM", address:"Miraflores Locks", tier:"curated", cost:"$20 adults / $10 kids", tags:["kid-friendly","history","indoor"], photo:"https://images.unsplash.com/photo-1578894381163-e72c17f2d45f?w=600&h=400&fit=crop" },
  { id:"a2", name:"Amador Causeway", category:"activity", icon:"🚲", vibe:"Bikes & Playground", duration:1, notes:"A scenic road connecting three islands at the Pacific entrance to the Canal. Rent bikes, walk, or drive along with stunning views of the Panama City skyline on one side and the Canal on the other. There's a playground and green spaces that are great for kids. At the end you'll find the Biodiversity Museum and several restaurants. Best in the late afternoon when the heat drops and the light is golden.", rec:"recommended", mapsRating:4.2, mapsReviews:"1.8K", hours:"Open 24hrs, bike rentals 8AM–6PM", address:"Amador Causeway", tier:"curated", cost:"$5–10 bike rental", tags:["kid-friendly","nature","sunset"], photo:"https://images.unsplash.com/photo-1517649763962-0c623066013b?w=600&h=400&fit=crop" },
  { id:"a3", name:"Cerro Ancón Hike", category:"activity", icon:"🥾", vibe:"City Hike", duration:1, notes:"A short but rewarding hike to the highest point in Panama City with 360-degree panoramic views of the city, the Canal, the Bridge of the Americas, and the Pacific. The trail is paved and takes about 30–45 minutes up. Go early morning to avoid the heat and for the best chance of spotting toucans, sloths, and agoutis. It's surprisingly wild for being in the middle of a capital city.", rec:"recommended", mapsRating:4.3, mapsReviews:"2.4K", hours:"Daily 6AM–5PM", address:"Cerro Ancón", tier:"curated", cost:"Free", tags:["kid-friendly","nature","walking"], photo:"https://images.unsplash.com/photo-1551632811-561732d1e306?w=600&h=400&fit=crop" },
  { id:"a4", name:"Metropolitan Natural Park", category:"activity", icon:"🌳", vibe:"Rainforest Hike", duration:1, notes:"A 265-hectare tropical rainforest right inside the city — one of the only urban national parks in the Americas. Multiple trails ranging from easy to moderate. Early morning is the magic hour: toucans, sloths, monkeys, and incredible birding. The Sendero de los Momótides trail offers the best canopy views. Bring water and insect repellent. A unique experience you can't get in any other capital city.", rec:"recommended", mapsRating:4.3, mapsReviews:"3.1K", hours:"Daily 6AM–5PM", address:"Av. Juan Pablo II", tier:"curated", cost:"$5 entry", tags:["kid-friendly","nature","walking"], photo:"https://images.unsplash.com/photo-1448375240586-882707db888b?w=600&h=400&fit=crop" },
  { id:"a5", name:"Casco Viejo Walking Tour", category:"activity", icon:"🏛️", vibe:"Historic Walk", duration:1, notes:"Explore Panama's UNESCO-listed historic quarter on foot. Start at Plaza de la Independencia and wind through colonial streets, past colorful restoration projects, vibrant street art, and churches dating back to the 1600s. Stop for coffee, browse artisan shops, and end at one of the rooftop bars for a sunset drink. Best in the morning before the heat peaks. Self-guided is free; guided tours add great historical context.", rec:"recommended", mapsRating:4.1, mapsReviews:"340", hours:"Best 8–11AM", address:"Plaza de la Independencia", tier:"curated", cost:"Free self-guided / $20–30 guided", tags:["history","walking"], photo:"https://images.unsplash.com/photo-1569025743873-ea3a9ber09f?w=600&h=400&fit=crop" },
  { id:"a6", name:"Monkey Island (Gamboa)", category:"activity", icon:"🐒", vibe:"Boat Tour", duration:1, notes:"A boat tour on Gatún Lake to see capuchin and howler monkeys up close on the small islands near Gamboa. The monkeys are habituated to boats and come right up to the edge. Absolutely amazing for kids and adults alike. The boat ride through the Canal waterway is scenic on its own. Book through local operators — tours depart from Gamboa and take about 2–3 hours including transport.", rec:"cantmiss", mapsRating:4.6, mapsReviews:"800", hours:"Tours typically 8AM–12PM", address:"Gamboa", tier:"curated", cost:"$60–90/pp", tags:["kid-friendly","nature","adventure"], photo:"https://images.unsplash.com/photo-1540573133985-87b6da6d54a9?w=600&h=400&fit=crop" },
  { id:"a7", name:"Summit Rainforest Park", category:"activity", icon:"🦅", vibe:"Wildlife Park", duration:1, notes:"A botanical garden and wildlife rescue center about 30 minutes from the city. Home to Panama's national bird (the harpy eagle), jaguars, tapirs, monkeys, and over 300 tropical plant species. Manageable for families with small kids — paved paths, shaded areas. Less intense than a full jungle trip but still a real rainforest experience. Great for a half-day outing.", rec:"recommended", mapsRating:4.3, mapsReviews:"2.8K", hours:"Daily 9AM–5PM", address:"Gamboa Road, km 20", tier:"curated", cost:"$10 adults / $5 kids", tags:["kid-friendly","nature"], photo:"https://images.unsplash.com/photo-1440581572325-0bea30075d9d?w=600&h=400&fit=crop" },
  { id:"a8", name:"Rainforest Discovery Center", category:"activity", icon:"🔭", vibe:"Canopy Tower", duration:1, notes:"A canopy tower and observation deck in the heart of Soberanía National Park, one of the world's top birding sites. The 30-meter tower gives you eye-level views into the jungle canopy — spectacular for birdwatching and wildlife photography. Several easy trails at ground level too. Go at dawn for the most active wildlife. About 40 minutes from Panama City on the road to Gamboa.", rec:"worthit", mapsRating:4.5, mapsReviews:"600", hours:"Daily 6AM–4PM", address:"Pipeline Road, Gamboa", tier:"curated", cost:"$30 adults / $15 kids + tower access", tags:["nature","adventure"], photo:"https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=600&h=400&fit=crop" },

  // ═══ CULTURE ═══
  { id:"c1", name:"Biomuseo", category:"culture", icon:"🏗️", vibe:"Architecture & Museum", duration:1, notes:"Frank Gehry's only building in Latin America — and it's spectacular. The museum tells the story of how the Isthmus of Panama rose from the sea and changed the world's climate, ocean currents, and biodiversity forever. Interactive exhibits, vivid colors, and a narrative that connects geology to ecology to human history. The building itself is the art. Allow 2 hours. Air-conditioned — great for a hot afternoon.", rec:"recommended", mapsRating:4.4, mapsReviews:"4.4K", hours:"Tue–Fri 10AM–4PM, Sat–Sun 10AM–5PM", address:"Amador Causeway", tier:"curated", cost:"$22 adults / $11 kids", tags:["kid-friendly","indoor","history"], photo:"https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?w=600&h=400&fit=crop" },
  { id:"c2", name:"Smithsonian Biodiversity Museum", category:"culture", icon:"🌊", vibe:"Marine Science", duration:1, notes:"The Smithsonian Tropical Research Institute's public exhibition space on the Amador Causeway. Focuses on marine biodiversity in the tropical Eastern Pacific. Smaller than Biomuseo but more science-focused with touch tanks, aquariums, and research-grade exhibits. Pair with a Causeway bike ride and Biomuseo for a full Amador day. Great for curious kids who like marine life.", rec:"worthit", mapsRating:4.2, mapsReviews:"400", hours:"Tue–Sun 10AM–5PM", address:"Amador Causeway", tier:"curated", cost:"$10–15", tags:["kid-friendly","indoor","history"], photo:"https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&h=400&fit=crop" },
  { id:"c3", name:"Bahá'í Temple", category:"culture", icon:"🕊️", vibe:"Spiritual Landmark", duration:1, notes:"One of only eight Bahá'í Houses of Worship in the world, set on a hilltop with sweeping views of Panama City. The architecture is egg-shaped and ethereal — genuinely unlike anything else you'll see. The surrounding gardens are peaceful and beautifully maintained. It's a contemplative space, not a tourist attraction, which makes it feel special. About 20 minutes from the city center by car.", rec:"worthit", mapsRating:4.6, mapsReviews:"1.2K", hours:"Daily 9AM–6PM", address:"Las Cumbres", tier:"curated", cost:"Free", tags:["nature"], photo:"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=400&fit=crop" },

  // ═══ DAY TRIPS ═══
  { id:"t1", name:"Isla Contadora", category:"daytrip", icon:"🏖️", vibe:"Beach Escape", duration:4, notes:"A 2-day beach escape in the Pearl Islands, about 1 hour by ferry from Amador Causeway. Crystal-clear water, white sand beaches, and excellent snorkeling. The island is small enough to walk everywhere. Great for families — calm, shallow water at Playa Larga. Book the morning ferry (7:30AM departure). Accommodation ranges from budget guesthouses to boutique hotels. Bring reef-safe sunscreen.", rec:"cantmiss", mapsRating:4.3, mapsReviews:"890", bookingUrl:"https://ferrylasperlaspanama.com", hours:"Ferry daily 7:30AM", address:"Amador Ferry Terminal", tier:"curated", cost:"$120 ferry + $80–200/night", tags:["kid-friendly","nature"], photo:"https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=400&fit=crop" },
  { id:"t2", name:"El Valle de Antón", category:"daytrip", icon:"⛰️", vibe:"Mountain Town", duration:2, notes:"A charming mountain town nestled in the crater of an extinct volcano, about 2 hours from Panama City. Noticeably cooler temperatures — a welcome break from the city heat. Visit the Sunday market for crafts and produce, hike to waterfalls, see the golden frog at El Níspero Zoo, or soak in the hot springs. Can be done as a long day trip or an overnight. Great for families and nature lovers.", rec:"recommended", mapsRating:4.4, mapsReviews:"1.5K", hours:"Best to depart 7–8AM", address:"El Valle de Antón, Coclé", tier:"curated", cost:"$50–80 transport + activities", tags:["kid-friendly","nature","adventure"], photo:"https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop" },
  { id:"t3", name:"Portobelo", category:"daytrip", icon:"🏴‍☠️", vibe:"Colonial Caribbean", duration:2, notes:"A historic Caribbean port town about 1.5 hours from the city. Once the most important Spanish colonial port in the Americas — the ruins of the old fortifications are a UNESCO World Heritage Site. The town has a relaxed Caribbean vibe, with colorful buildings, Afro-colonial culture, and nearby beaches. Visit the customs house museum, snorkel at Playa Blanca, and eat fresh seafood. A different Panama from the city.", rec:"recommended", mapsRating:4.2, mapsReviews:"1.1K", hours:"Day trip — depart 8AM", address:"Portobelo, Colón", tier:"curated", cost:"$60–100 transport + activities", tags:["history","nature","adventure"], photo:"https://images.unsplash.com/photo-1519046904884-53103b34b206?w=600&h=400&fit=crop" },
  { id:"t4", name:"Cerro Azul", category:"daytrip", icon:"🌄", vibe:"Mountain Hiking", duration:1, notes:"A mountain area about 45 minutes east of the city, reaching elevations of 900+ meters. Popular for hiking with trails through cloud forest and good birdwatching. Several waterfalls in the area. The cooler climate and mountain views offer a refreshing contrast to Panama City. Can be done as a half-day trip. Best with a car or organized transport as public transit is limited.", rec:"worthit", mapsRating:4.1, mapsReviews:"300", hours:"Daylight hours", address:"Cerro Azul, Panama Este", tier:"extended", cost:"$30–50 transport", tags:["nature","adventure"], photo:"https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&h=400&fit=crop" },

  // ═══ WELLNESS ═══
  { id:"w1", name:"Cinta Costera Walk", category:"wellness", icon:"🌅", vibe:"Waterfront Walk", duration:1, notes:"Panama City's beautiful waterfront promenade stretching several kilometers along the bay. Perfect for an evening stroll as the sun sets behind the modern skyline. Grab a coconut water from a street vendor and walk at your own pace. There are playgrounds along the route for kids and exercise stations for the active. On weekends it fills with families — a lovely slice of everyday Panamanian life.", rec:"worthit", mapsRating:4.0, mapsReviews:"950", hours:"Open 24hrs", address:"Cinta Costera", tier:"extended", cost:"Free", tags:["kid-friendly","walking","sunset"], photo:"https://images.unsplash.com/photo-1505459668311-8dfac7952bf0?w=600&h=400&fit=crop" },
];

const TRIP = {
  name: "Panama 2026",
  subtitle: "Visit Pa & Ma",
  startDate: "2026-03-29",
  dayCount: 10,
  brief: "10 days of the best Panama has to offer — culture, nature, incredible food, and a beach escape to the Pearl Islands.",
  info: {
    climate: "Hot and humid, 28–33°C. Late March is the tail end of dry season — mostly sunny.",
    packing: ["Light breathable clothing", "Reef-safe sunscreen", "Rain jacket", "Walking shoes", "Insect repellent", "Hat and sunglasses"],
    tips: ["Tap water is safe in Panama City", "USD is the currency", "Uber works well", "Tip 10% at restaurants", "Spanish helps but English is common"],
    emergency: "Panama emergency: 911"
  },
};

const INIT_CAL = {
  "2026-03-29|morning": "a1", "2026-03-29|evening": "f6",
  "2026-03-30|morning": "a4", "2026-03-30|afternoon": "c1", "2026-03-30|evening": "d2",
  "2026-03-31|morning": "t1",
  "2026-04-01|evening": "f1",
  "2026-04-02|morning": "a5", "2026-04-02|afternoon": "f7",
};

function mkDays(sd, c) {
  const days = [], d = new Date(sd);
  for (let i = 0; i < c; i++) {
    const dt = new Date(d);
    dt.setDate(dt.getDate() + i);
    days.push({
      date: dt.toISOString().split("T")[0],
      wd: dt.toLocaleDateString("en-US", { weekday: "short" }),
      md: dt.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      full: dt.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }),
      num: i + 1,
    });
  }
  return days;
}

function fmtRange(sd, dc) {
  const s = new Date(sd + "T12:00:00");
  const e = new Date(s);
  e.setDate(e.getDate() + dc - 1);
  return s.toLocaleDateString("en-US", { month: "long", day: "numeric" }) + " – " + e.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

const IS = { padding: "10px 14px", borderRadius: 10, border: "1.5px solid #e0e0e0", fontSize: 14, fontFamily: "inherit", outline: "none", width: "100%", boxSizing: "border-box", background: "#fff" };

// Swipe-down-to-close drag handle for bottom sheets
const DragHandle = ({ onClose }) => {
  const sy = useRef(null);
  const handleTS = e => { sy.current = e.touches[0].clientY; e.preventDefault(); };
  const handleTM = e => {
    if (sy.current !== null) {
      const dy = e.touches[0].clientY - sy.current;
      if (dy > 40) { onClose(); sy.current = null; }
    }
  };
  const handleTE = () => { sy.current = null; };
  return (
    <div
      onTouchStart={handleTS} onTouchMove={handleTM} onTouchEnd={handleTE}
      style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "14px 0 10px", cursor: "grab", userSelect: "none", touchAction: "none" }}
    >
      <div style={{ width: 44, height: 5, background: "#bbb", borderRadius: 3 }} />
      <div style={{ fontSize: 9, color: "#ccc", marginTop: 6, fontWeight: 600 }}>swipe down to close</div>
    </div>
  );
};

// ═══ MAP POPUP ═══
const MapPopup = ({ mod, onClose }) => {
  const q = encodeURIComponent(mod.name + " " + (mod.address || "") + " Panama");
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 350, display: "flex", alignItems: "flex-end", justifyContent: "center" }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ maxWidth: 430, width: "100%", background: "#fff", borderRadius: "24px 24px 0 0", animation: "su 0.25s ease-out", overflow: "hidden" }}>
        <DragHandle onClose={onClose} />
        <div style={{ padding: "4px 20px 10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800 }}>{mod.name}</div>
            {mod.address && <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>📍 {mod.address}</div>}
          </div>
          <button onClick={onClose} style={{ background: "#f0f0f0", border: "none", borderRadius: 10, padding: "6px 12px", fontSize: 13, fontWeight: 600, color: "#888", cursor: "pointer" }}>Close</button>
        </div>
        <div style={{ height: 250, background: "#eee" }}>
          <iframe title="map" src={`https://maps.google.com/maps?q=${q}&z=15&output=embed`} style={{ width: "100%", height: "100%", border: "none" }} loading="lazy" />
        </div>
        <div style={{ padding: "14px 20px 24px", display: "flex", gap: 10 }}>
          <a href={`https://www.google.com/maps/search/?api=1&query=${q}`} target="_blank" rel="noopener noreferrer" style={{ flex: 1, padding: 13, borderRadius: 14, background: "#4285F4", color: "#fff", fontSize: 14, fontWeight: 700, textDecoration: "none", textAlign: "center" }}>📍 Google Maps</a>
          <a href={`https://waze.com/ul?q=${q}&navigate=yes`} target="_blank" rel="noopener noreferrer" style={{ flex: 1, padding: 13, borderRadius: 14, background: "#33CCFF", color: "#fff", fontSize: 14, fontWeight: 700, textDecoration: "none", textAlign: "center" }}>🚗 Waze</a>
        </div>
      </div>
    </div>
  );
};

// ═══ AI GUIDE ═══
const AiGuide = ({ mod, onClose }) => {
  const [resp, setResp] = useState("");
  const [loading, setLoading] = useState(true);
  const [question, setQuestion] = useState("");
  const [followUp, setFollowUp] = useState("");
  const cat = CATS.find(c => c.id === mod.category);

  useEffect(() => {
    let cancelled = false;
    const prompt = "You are a friendly local guide in Panama. Brief engaging guide for " + mod.name + ": overview, 2-3 facts, one insider tip. Under 200 words, no markdown headers, flowing text with emoji.";
    fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1000, messages: [{ role: "user", content: prompt }] })
    }).then(r => r.json()).then(d => {
      if (!cancelled) setResp(d.content?.map(b => b.type === "text" ? b.text : "").join("") || "Couldn't load.");
    }).catch(() => {
      if (!cancelled) setResp("Couldn't connect right now.");
    }).finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => { cancelled = true; };
  }, [mod.name]);

  const ask = () => {
    if (!question.trim()) return;
    const q = question;
    setQuestion("");
    fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1000, messages: [{ role: "user", content: "Local guide Panama. At " + mod.name + ". Answer 2-3 sentences: " + q }] })
    }).then(r => r.json()).then(d => {
      setFollowUp(d.content?.map(b => b.type === "text" ? b.text : "").join("") || "Couldn't answer.");
    }).catch(() => setFollowUp("Couldn't connect."));
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 300, display: "flex", alignItems: "flex-end", justifyContent: "center" }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ maxWidth: 430, width: "100%", background: "#fff", borderRadius: "24px 24px 0 0", maxHeight: "85vh", display: "flex", flexDirection: "column", animation: "su 0.25s ease-out" }}>
        <DragHandle onClose={onClose} />
        <div style={{ padding: "4px 20px 14px", borderBottom: "1px solid #f0f0f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: cat?.color, textTransform: "uppercase", letterSpacing: 1 }}>🎙️ Local Guide</div>
            <div style={{ fontSize: 17, fontWeight: 800, marginTop: 2 }}>{mod.name}</div>
          </div>
          <button onClick={onClose} style={{ background: "#f0f0f0", border: "none", borderRadius: 10, padding: "6px 12px", fontSize: 13, fontWeight: 600, color: "#888", cursor: "pointer" }}>Close</button>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px 20px" }}>
          {loading ? (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>🎙️</div>
              <div style={{ fontSize: 14, color: "#999", fontWeight: 600 }}>Getting the local scoop...</div>
            </div>
          ) : (
            <>
              <div style={{ fontSize: 14, color: "#444", lineHeight: 1.7, background: "#FAFAF8", borderRadius: 16, padding: "16px 18px", whiteSpace: "pre-wrap" }}>{resp}</div>
              {followUp && <div style={{ marginTop: 14, fontSize: 13, color: "#555", lineHeight: 1.6, background: (cat?.color || "#888") + "08", borderRadius: 14, padding: "14px 16px", borderLeft: "4px solid " + (cat?.color || "#888") }}>{followUp}</div>}
              <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
                <input value={question} onChange={e => setQuestion(e.target.value)} placeholder="Ask a question..." onKeyDown={e => e.key === "Enter" && ask()} style={{ ...IS, fontSize: 13 }} />
                <button onClick={ask} style={{ padding: "10px 16px", borderRadius: 10, border: "none", background: cat?.color || "#888", color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer", flexShrink: 0 }}>Ask</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// ═══ INFO PANEL ═══
const InfoPanel = ({ info, onClose }) => (
  <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 300, display: "flex", alignItems: "flex-end", justifyContent: "center" }} onClick={onClose}>
    <div onClick={e => e.stopPropagation()} style={{ maxWidth: 430, width: "100%", background: "#fff", borderRadius: "24px 24px 0 0", maxHeight: "80vh", display: "flex", flexDirection: "column", animation: "su 0.25s ease-out" }}>
      <DragHandle onClose={onClose} />
      <div style={{ padding: "4px 20px 14px", borderBottom: "1px solid #f0f0f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>🧳 Travel Info</h3>
        <button onClick={onClose} style={{ background: "#f0f0f0", border: "none", borderRadius: 10, padding: "6px 12px", fontSize: 13, fontWeight: 600, color: "#888", cursor: "pointer" }}>Close</button>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px 24px" }}>
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#E8843C", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>🌡️ Climate</div>
          <div style={{ fontSize: 13, color: "#555", lineHeight: 1.6, background: "#FFF8F0", borderRadius: 12, padding: "12px 16px" }}>{info.climate}</div>
        </div>
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#2D9CDB", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>🎒 Packing</div>
          <div style={{ background: "#F0F7FF", borderRadius: 12, padding: "12px 16px" }}>
            {info.packing.map((p, i) => <div key={i} style={{ fontSize: 13, color: "#555", padding: "3px 0", display: "flex", gap: 8 }}><span style={{ color: "#2D9CDB" }}>✓</span>{p}</div>)}
          </div>
        </div>
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#6FCF97", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>💡 Tips</div>
          <div style={{ background: "#F0FFF4", borderRadius: 12, padding: "12px 16px" }}>
            {info.tips.map((t, i) => <div key={i} style={{ fontSize: 13, color: "#555", padding: "3px 0", lineHeight: 1.5, display: "flex", gap: 8 }}><span style={{ color: "#6FCF97", flexShrink: 0 }}>•</span>{t}</div>)}
          </div>
        </div>
        <div style={{ background: "#FFF0F0", borderRadius: 12, padding: "12px 16px", fontSize: 12, color: "#D44", fontWeight: 600 }}>🚨 {info.emergency}</div>
      </div>
    </div>
  </div>
);

// ═══ OVERVIEW ═══
const Overview = ({ days, occ, mods, onClose, onJump }) => (
  <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 300, display: "flex", alignItems: "flex-end", justifyContent: "center" }} onClick={onClose}>
    <div onClick={e => e.stopPropagation()} style={{ maxWidth: 430, width: "100%", background: "#fff", borderRadius: "24px 24px 0 0", maxHeight: "85vh", display: "flex", flexDirection: "column", animation: "su 0.25s ease-out" }}>
      <DragHandle onClose={onClose} />
      <div style={{ padding: "4px 20px 14px", borderBottom: "1px solid #f0f0f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>📋 Trip Overview</h3>
        <button onClick={onClose} style={{ background: "#f0f0f0", border: "none", borderRadius: 10, padding: "6px 12px", fontSize: 13, fontWeight: 600, color: "#888", cursor: "pointer" }}>Close</button>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px 24px" }}>
        {days.map((day, di) => {
          const sl = SLOTS.map(s => { const mid = occ[day.date + "|" + s.id]; return mid ? mods.find(m => m.id === mid) : null; });
          const fl = sl.filter(Boolean).length;
          return (
            <button key={day.date} onClick={() => { onJump(di); onClose(); }} style={{ width: "100%", textAlign: "left", padding: "10px 14px", borderRadius: 14, border: "none", background: fl === 3 ? "#F1F8E9" : "#fff", marginBottom: 5, cursor: "pointer", display: "flex", gap: 12, alignItems: "flex-start", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
              <div style={{ width: 44, textAlign: "center", flexShrink: 0 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#aaa" }}>{day.wd}</div>
                <div style={{ fontSize: 14, fontWeight: 800 }}>{day.md}</div>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                {sl.map((mod, si) => {
                  if (!mod) return <div key={si} style={{ fontSize: 11, color: "#ddd", padding: "1px 0" }}>— {SLOTS[si].label}</div>;
                  const ct = CATS.find(c => c.id === mod.category);
                  return <div key={si} style={{ fontSize: 12, fontWeight: 600, color: "#333", padding: "1px 0", display: "flex", alignItems: "center", gap: 4, overflow: "hidden" }}><span style={{ fontSize: 11 }}>{ct?.icon}</span><span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{mod.name}</span></div>;
                })}
              </div>
              <div style={{ fontSize: 11, color: fl === 3 ? "#4CAF50" : "#ccc", fontWeight: 700, flexShrink: 0 }}>{fl}/3</div>
            </button>
          );
        })}
      </div>
    </div>
  </div>
);

// ═══ CUSTOM MODAL ═══
const CustomModal = ({ onSave, onClose }) => {
  const [n, sN] = useState("");
  const [no, sNo] = useState("");
  const [ic, sIc] = useState("📌");
  const [url, sUrl] = useState("");
  const [d, sD] = useState(1);
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 300, display: "flex", alignItems: "flex-end", justifyContent: "center" }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ maxWidth: 430, width: "100%", background: "#fff", borderRadius: "24px 24px 0 0", padding: "0 20px 24px", animation: "su 0.25s ease-out" }}>
        <DragHandle onClose={onClose} />
        <h3 style={{ margin: "0 0 16px", fontSize: 18, fontWeight: 800 }}>📌 Custom Event</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", gap: 10 }}>
            <div style={{ width: 56 }}><label style={{ fontSize: 10, fontWeight: 700, color: "#999", textTransform: "uppercase", letterSpacing: 0.8, display: "block", marginBottom: 4 }}>Icon</label><input value={ic} onChange={e => sIc(e.target.value)} style={{ ...IS, textAlign: "center", fontSize: 20, padding: "6px" }} /></div>
            <div style={{ flex: 1 }}><label style={{ fontSize: 10, fontWeight: 700, color: "#999", textTransform: "uppercase", letterSpacing: 0.8, display: "block", marginBottom: 4 }}>Name</label><input value={n} onChange={e => sN(e.target.value)} placeholder="Jazz concert at Teatro" style={IS} autoFocus /></div>
          </div>
          <textarea value={no} onChange={e => sNo(e.target.value)} placeholder="Details, notes..." rows={2} style={{ ...IS, resize: "vertical" }} />
          <input value={url} onChange={e => sUrl(e.target.value)} placeholder="Link (optional) — https://..." style={IS} />
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={onClose} style={{ flex: 1, padding: 13, borderRadius: 12, border: "none", background: "#f2f2f2", color: "#555", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Cancel</button>
            <button disabled={!n.trim()} onClick={() => n.trim() && onSave({ id: "c" + Date.now(), name: n.trim(), category: "custom", icon: ic, vibe: "Custom", duration: d, notes: no, bookingUrl: url || undefined, mapsRating: 0 })} style={{ flex: 1, padding: 13, borderRadius: 12, border: "none", background: n.trim() ? "#1a1a1a" : "#ccc", color: "#fff", fontSize: 14, fontWeight: 700, cursor: n.trim() ? "pointer" : "default" }}>Add</button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ═══ WELCOME ═══
const Welcome = ({ trip, days, occ, mods, cal, onStart, onJump }) => {
  const [bgIdx, setBgIdx] = useState(0);
  // Cycle through curated experience photos for background
  const bgPhotos = mods.filter(m => m.photo && m.tier === "curated").map(m => m.photo);
  useEffect(() => { if (bgPhotos.length <= 1) return; const t = setInterval(() => setBgIdx(i => (i + 1) % bgPhotos.length), 5000); return () => clearInterval(t); }, [bgPhotos.length]);

  return (
    <div style={{ fontFamily: "'DM Sans',-apple-system,sans-serif", minHeight: "100vh", position: "relative", overflow: "hidden", maxWidth: 430, margin: "0 auto", background: "#0f1923" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Playfair+Display:wght@700;800;900&display=swap" rel="stylesheet" />
      <style>{`@keyframes hf{from{opacity:0}to{opacity:1}} @keyframes su{from{transform:translateY(100%)}to{transform:translateY(0)}} @keyframes si{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:none}} @keyframes fi{from{opacity:0}to{opacity:1}} @keyframes ci{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}} @keyframes bgFade{from{opacity:0}to{opacity:1}} *{-webkit-tap-highlight-color:transparent} ::-webkit-scrollbar{display:none}`}</style>

      {/* Full-bleed background photo */}
      {bgPhotos.length > 0 && (
        <div key={bgIdx} style={{ position: "absolute", inset: 0, animation: "bgFade 1.5s ease-out" }}>
          <img src={bgPhotos[bgIdx]} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        </div>
      )}
      {/* Dark overlay for readability — heavier in bottom half */}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.25) 25%, rgba(0,0,0,0.45) 55%, rgba(0,0,0,0.85) 100%)" }} />
      {/* Subtle color tint */}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(160deg, rgba(11,77,59,0.4) 0%, rgba(33,147,176,0.2) 50%, rgba(15,76,117,0.3) 100%)" }} />

      <div style={{ position: "relative", zIndex: 1, minHeight: "100vh", display: "flex", flexDirection: "column", padding: "0 24px" }}>
        <div style={{ padding: "20px 0 0", animation: "si 0.5s ease-out" }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: 1.5 }}>🗺️ Trip Builder</span>
        </div>

        <div style={{ flex: 1, minHeight: 60 }} />

        <div style={{ animation: "si 0.6s ease-out 0.1s both" }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.45)", textTransform: "uppercase", letterSpacing: 2, marginBottom: 10 }}>You're invited</div>
          <h1 style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 44, fontWeight: 900, color: "#fff", margin: "0 0 8px", lineHeight: 1.0, textShadow: "0 2px 20px rgba(0,0,0,0.4)" }}>{trip.name}</h1>
          <div style={{ fontSize: 18, fontWeight: 500, color: "rgba(255,255,255,0.75)", marginBottom: 6, textShadow: "0 1px 8px rgba(0,0,0,0.3)" }}>{trip.subtitle}</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.45)", marginBottom: 8 }}>📅 {fmtRange(trip.startDate, trip.dayCount)} · {trip.dayCount} days</div>
        </div>

        {trip.brief && (
          <div style={{ animation: "si 0.6s ease-out 0.2s both", marginBottom: 16 }}>
            <div style={{ fontSize: 14, fontStyle: "italic", color: "rgba(255,255,255,0.55)", lineHeight: 1.6 }}>{trip.brief}</div>
          </div>
        )}

        <div style={{ padding: "4px 0 36px", animation: "si 0.6s ease-out 0.3s both", display: "flex", flexDirection: "column", gap: 10 }}>
          <button onClick={() => onStart("explore")} style={{ width: "100%", padding: "17px 24px", borderRadius: 16, border: "none", background: "#fff", color: "#1a1a1a", fontSize: 15, fontWeight: 800, cursor: "pointer", boxShadow: "0 4px 24px rgba(0,0,0,0.3)", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>✨ Explore Experiences</button>
          <button onClick={() => onStart("itinerary")} style={{ width: "100%", padding: "15px 24px", borderRadius: 16, border: "1.5px solid rgba(255,255,255,0.25)", background: "rgba(255,255,255,0.1)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>📅 View Itinerary</button>
        </div>
      </div>
    </div>
  );
};

// ═══ ITINERARY ═══
const Itin = ({ trip, mods, setMods, cal, setCal, onBack, initDay }) => {
  const [aDay, sDay] = useState(initDay || 0);
  const [exp, sExp] = useState(null);
  const [lib, sLib] = useState(false);
  const [cust, sCust] = useState(false);
  const [aSlot, sSlot] = useState(null);
  const [fCat, sFCat] = useState("all");
  const [guide, sGuide] = useState(null);
  const [showInfo, sInfo] = useState(false);
  const [showOv, sOv] = useState(false);
  const [notes, sNotes] = useState({});
  const [noteFor, sNoteFor] = useState(null);
  const [mapMod, sMap] = useState(null);
  const [pInfo, sPInfo] = useState({});
  const [confRm, sConfRm] = useState(null);
  const [skipConf, sSkipConf] = useState(false);
  const [sw, sSw] = useState(null);
  const [showAssist, sAssist] = useState(false);
  const [assistMsgs, sAssistMsgs] = useState([]);
  const [assistInput, sAssistInput] = useState("");
  const [assistLoading, sAssistLoading] = useState(false);
  const dRef = useRef(null);

  const days = mkDays(trip.startDate, trip.dayCount);
  useEffect(() => { dRef.current?.children[aDay]?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" }); }, [aDay]);

  const getOcc = useCallback(() => {
    const o = {};
    Object.entries(cal).forEach(([sk, mid]) => {
      const mod = mods.find(m => m.id === mid);
      if (!mod) return;
      o[sk] = mid;
      if (mod.duration > 1) {
        const [ds, tid] = sk.split("|");
        const di = days.findIndex(d => d.date === ds);
        const si = SLOTS.findIndex(s => s.id === tid);
        let left = mod.duration - 1, cd = di, cs = si + 1;
        while (left > 0 && cd < days.length) {
          if (cs >= SLOTS.length) { cd++; cs = 0; }
          if (cd < days.length) o[days[cd].date + "|" + SLOTS[cs].id] = mid;
          cs++; left--;
        }
      }
    });
    return o;
  }, [cal, mods, days]);

  const occ = getOcc();
  const cDay = days[aDay];
  const pIds = new Set(Object.values(cal));

  const place = (mid) => {
    if (!aSlot) return;
    const mod = mods.find(m => m.id === mid);
    if (!mod) return;
    const nc = { ...cal };
    Object.keys(nc).forEach(k => { if (nc[k] === mid) delete nc[k]; });
    nc[aSlot] = mid;
    setCal(nc);
    sLib(false);
    sSlot(null);
  };

  const rmSlot = (sk) => {
    const mid = occ[sk];
    if (!mid) return;
    const originKey = Object.keys(cal).find(k => cal[k] === mid) || sk;
    if (!skipConf) { sConfRm(originKey); return; }
    doRm(originKey);
  };

  const doRm = (sk) => {
    const mid = cal[sk] || occ[sk];
    if (!mid) return;
    const nc = { ...cal };
    Object.keys(nc).forEach(k => { if (nc[k] === mid) delete nc[k]; });
    setCal(nc);
    sConfRm(null);
    sExp(null);
  };

  const addCust = (mod) => {
    setMods(p => [...p, mod]);
    if (aSlot) { const nc = { ...cal }; nc[aSlot] = mod.id; setCal(nc); }
    sCust(false);
    sSlot(null);
  };

  const slots = SLOTS.map(s => {
    const sk = cDay.date + "|" + s.id;
    const mid = occ[sk];
    const mod = mid ? mods.find(m => m.id === mid) : null;
    const cat = mod ? CATS.find(c => c.id === mod.category) : null;
    return { s, sk, mid, mod, cat };
  });

  const getSug = (sid) => {
    const cm = { morning: ["activity", "daytrip"], afternoon: ["culture", "activity"], evening: ["restaurant", "nightlife"] };
    const cs = cm[sid] || [];
    return mods.filter(m => !pIds.has(m.id) && cs.includes(m.category) && m.tier === "curated").sort((a, b) => (a.rec === "cantmiss" ? 0 : 1) - (b.rec === "cantmiss" ? 0 : 1))[0] || null;
  };

  const getPos = (sk) => {
    const mid = occ[sk];
    if (!mid) return null;
    const mod = mods.find(m => m.id === mid);
    if (!mod || mod.duration <= 1) return null;
    const ok = Object.keys(cal).find(k => cal[k] === mid);
    if (!ok) return null;
    const [ds, tid] = ok.split("|");
    const di = days.findIndex(d => d.date === ds);
    const si = SLOTS.findIndex(s2 => s2.id === tid);
    const all = [];
    let cd = di, cs2 = si;
    for (let i = 0; i < mod.duration; i++) { if (cd >= days.length) break; all.push(days[cd].date + "|" + SLOTS[cs2].id); cs2++; if (cs2 >= SLOTS.length) { cd++; cs2 = 0; } }
    return { cur: all.indexOf(sk) + 1, tot: mod.duration };
  };

  const avail = mods.filter(m => !pIds.has(m.id)).filter(m => fCat === "all" || m.category === fCat);

  return (
    <div style={{ fontFamily: "'DM Sans',-apple-system,sans-serif", minHeight: "100vh", maxWidth: 430, margin: "0 auto", position: "relative" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Playfair+Display:wght@700;800&display=swap" rel="stylesheet" />
      <style>{`@keyframes su{from{transform:translateY(100%)}to{transform:translateY(0)}} @keyframes fi{from{opacity:0}to{opacity:1}} @keyframes ci{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}} *{-webkit-tap-highlight-color:transparent} ::-webkit-scrollbar{display:none}`}</style>

      {/* Day strip with teal background */}
      <div style={{ background: "linear-gradient(180deg, #1B3B32 0%, #244A3F 100%)", padding: "12px 16px 0" }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 8 }}>📅 Itinerary</div>
        {/* Day strip — scrollable */}
        <div ref={dRef} style={{ display: "flex", gap: 5, overflowX: "auto", paddingBottom: 12, WebkitOverflowScrolling: "touch" }}>
          {days.map((day, i) => {
            const isA = i === aDay;
            const ds = SLOTS.map(s => occ[day.date + "|" + s.id]).filter(Boolean);
            return (
              <button key={day.date} onClick={() => sDay(i)} style={{ flexShrink: 0, padding: "7px 4px", width: 54, borderRadius: 12, border: "none", cursor: "pointer", background: isA ? "#fff" : ds.length === 3 ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.08)", color: isA ? "#1B3B32" : "#fff", transition: "all 0.2s", display: "flex", flexDirection: "column", alignItems: "center", gap: 2, boxShadow: isA ? "0 2px 10px rgba(0,0,0,0.2)" : "none" }}>
                <span style={{ fontSize: 9, fontWeight: 700, opacity: isA ? 0.6 : 0.4 }}>{day.wd}</span>
                <span style={{ fontSize: 13, fontWeight: 800, lineHeight: 1 }}>{day.md.split(" ")[1]}</span>
                <span style={{ fontSize: 8, fontWeight: 600, opacity: isA ? 0.5 : 0.3 }}>{day.md.split(" ")[0]}</span>
                <div style={{ display: "flex", gap: 2, marginTop: 1 }}>
                  {[0, 1, 2].map(si => <div key={si} style={{ width: 4, height: 4, borderRadius: "50%", background: ds[si] ? (isA ? "#0B4D3B" : "rgba(255,255,255,0.6)") : (isA ? "rgba(27,59,50,0.2)" : "rgba(255,255,255,0.15)") }} />)}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Day Content */}
      <div onTouchStart={e => sSw(e.touches[0].clientX)} onTouchEnd={e => { if (sw === null) return; const d = sw - e.changedTouches[0].clientX; if (Math.abs(d) > 60) { if (d > 0 && aDay < days.length - 1) sDay(aDay + 1); if (d < 0 && aDay > 0) sDay(aDay - 1); } sSw(null); }} style={{ padding: "14px 16px 100px", minHeight: "55vh" }}>
        <div style={{ marginBottom: 14, animation: "fi 0.2s ease-out" }}>
          <div style={{ fontSize: 15, fontWeight: 800 }}>Day {cDay.num} · {cDay.full}</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {slots.map(({ s: slot, sk, mid, mod, cat }, idx) => {
            const isX = exp === sk;
            const pos = mid ? getPos(sk) : null;

            return (
              <div key={sk} style={{ animation: `ci 0.2s ease-out ${idx * 0.05}s both` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <span style={{ fontSize: 15 }}>{slot.icon}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#aaa", textTransform: "uppercase", letterSpacing: 0.8 }}>{slot.label}</span>
                  {pos && <span style={{ fontSize: 10, color: cat?.color, fontWeight: 700 }}>Slot {pos.cur}/{pos.tot}</span>}
                </div>

                {mod ? (
                  <div onClick={() => sExp(isX ? null : sk)} style={{ background: "#fff", borderRadius: 16, overflow: "hidden", border: "1.5px solid " + (cat?.color || "#ddd") + "20", boxShadow: isX ? "0 6px 24px " + (cat?.color || "#000") + "10" : "0 1px 6px rgba(0,0,0,0.04)", cursor: "pointer" }}>
                    {/* Header */}
                    <div style={{ display: "flex", minHeight: isX ? 42 : 78 }}>
                      <div style={{ flex: 1, padding: isX ? "9px 14px" : "10px 14px", borderLeft: "4px solid " + (cat?.color || "#888"), display: "flex", flexDirection: "column", justifyContent: "center" }}>
                        <div style={{ fontSize: isX ? 13 : 14, fontWeight: 700, lineHeight: 1.25 }}>{mod.icon || cat?.icon} {mod.name}</div>
                        {!isX && mod.vibe && <div style={{ marginTop: 4 }}><span style={{ fontSize: 9, fontWeight: 700, color: cat?.color || "#888", background: (cat?.color || "#888") + "12", padding: "2px 8px", borderRadius: 5 }}>{mod.icon || cat?.icon} {mod.vibe}</span></div>}
                      </div>
                      {!isX && <div style={{ width: "28%", minWidth: 82, flexShrink: 0, position: "relative" }}><Vis mod={mod} cat={cat} h="100%" st={{ position: "absolute", inset: 0 }} /><div style={{ position: "absolute", top: 5, right: 5, background: "rgba(0,0,0,0.3)", borderRadius: 6, width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ fontSize: 9, color: "#fff" }}>▼</span></div></div>}
                      {isX && <div style={{ display: "flex", alignItems: "center", padding: "0 12px" }}><span style={{ fontSize: 11, color: "#ccc", transform: "rotate(180deg)" }}>▼</span></div>}
                    </div>

                    {/* Expanded */}
                    {isX && (() => {
                      const mUrl = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(mod.name + " " + (mod.address || "") + " Panama");
                      const piO = pInfo[mod.id];
                      return (
                        <div style={{ padding: "0 14px 14px", animation: "fi 0.15s ease-out" }}>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 10 }}>
                            {mod.vibe && <span style={{ fontSize: 10, fontWeight: 700, color: cat?.color, background: (cat?.color || "#888") + "12", padding: "3px 9px", borderRadius: 7 }}>{mod.icon || cat?.icon} {mod.vibe}</span>}
                            {mod.duration > 1 && <span style={{ fontSize: 10, fontWeight: 700, color: cat?.color, background: (cat?.color || "#888") + "10", padding: "3px 9px", borderRadius: 7 }}>📅 {mod.duration} slots</span>}
                          </div>

                          {/* Image */}
                          <div style={{ borderRadius: 12, overflow: "hidden", marginBottom: 10 }}><Vis mod={mod} cat={cat} h={140} br={12} /></div>

                          {/* Description */}
                          <div style={{ background: "#FAFAF8", borderRadius: 12, padding: "12px 14px", marginBottom: 10 }}><div style={{ fontSize: 13, color: "#555", lineHeight: 1.6 }}>{mod.notes}</div></div>

                          {/* Tour Guide (3/4) + Notes icon (1/4) */}
                          <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
                            <button onClick={e => { e.stopPropagation(); sGuide(mod); }} style={{ flex: 3, padding: 12, borderRadius: 12, border: "none", background: "#1a1a1a", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>🎙️ Tour Guide</button>
                            <button onClick={e => { e.stopPropagation(); sNoteFor(noteFor === mod.id ? null : mod.id); }} style={{ flex: 1, padding: 12, borderRadius: 12, border: "1.5px solid " + (notes[mod.id] ? "#FFE082" : "#eee"), background: notes[mod.id] ? "#FFFDE7" : "#fff", fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>📝</button>
                          </div>
                          {noteFor === mod.id && <div style={{ marginBottom: 10 }} onClick={e => e.stopPropagation()}><textarea value={notes[mod.id] || ""} onChange={e => sNotes(p => ({ ...p, [mod.id]: e.target.value }))} placeholder="Your note..." rows={2} autoFocus style={{ ...IS, fontSize: 12, padding: "10px 14px", resize: "vertical", borderRadius: 10, border: "1.5px solid " + (cat?.color || "#888") + "40" }} /></div>}

                          {/* Practical info — collapsible, includes cost, booking, maps */}
                          <div style={{ marginBottom: 10 }}>
                            <button onClick={e => { e.stopPropagation(); sPInfo(p => ({ ...p, [mod.id]: !p[mod.id] })); }} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 12px", borderRadius: piO ? "10px 10px 0 0" : 10, background: "#F0F0F0", border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, color: "#666" }}>
                              <span>📋 Practical Info</span>
                              <span style={{ fontSize: 9, color: "#aaa", transform: piO ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>▼</span>
                            </button>
                            {piO && (
                              <div style={{ background: "#F0F0F0", borderRadius: "0 0 10px 10px", padding: "6px 12px 12px", display: "flex", flexDirection: "column", gap: 7, animation: "fi 0.12s ease-out" }}>
                                {mod.hours && <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12 }}><span style={{ fontSize: 13 }}>🕐</span><span style={{ color: "#555", fontWeight: 600 }}>{mod.hours}</span></div>}
                                {mod.cost && <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12 }}><span style={{ fontSize: 13 }}>💰</span><span style={{ color: "#555", fontWeight: 600 }}>{mod.cost}</span></div>}
                                {mod.address && <button onClick={e => { e.stopPropagation(); sMap(mod); }} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12, background: "none", border: "none", cursor: "pointer", padding: 0, textAlign: "left" }}><span style={{ fontSize: 13 }}>📍</span><span style={{ color: "#2D9CDB", fontWeight: 600 }}>{mod.address}</span><span style={{ fontSize: 9, color: "#aaa" }}>→ Map</span></button>}
                                {mod.mapsRating > 0 && <a href={mUrl} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12, textDecoration: "none" }}><span style={{ fontSize: 13 }}>⭐</span><GR r={mod.mapsRating} rv={mod.mapsReviews} /><span style={{ fontSize: 9, fontWeight: 700, color: "#4285F4" }}>Google</span></a>}
                                {mod.bookingUrl && <a href={mod.bookingUrl} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "9px 12px", borderRadius: 8, background: cat?.color, color: "#fff", fontSize: 12, fontWeight: 700, textDecoration: "none", marginTop: 2 }}>🔗 Book / Reserve</a>}
                              </div>
                            )}
                          </div>

                          {/* Remove + Shortlist only */}
                          <div style={{ display: "flex", gap: 6 }}>
                            <button onClick={e => { e.stopPropagation(); rmSlot(sk); }} style={{ flex: 1, padding: 9, borderRadius: 10, background: "#FFF5F5", border: "1.5px solid #FFCDD2", fontSize: 11, fontWeight: 700, color: "#E53935", cursor: "pointer" }}>🗑️ Remove</button>
                            <button onClick={e => { e.stopPropagation(); const mid2 = occ[sk]; if (mid2) { const nc = { ...cal }; Object.keys(nc).forEach(k => { if (nc[k] === mid2) delete nc[k]; }); setCal(nc); } sExp(null); }} style={{ flex: 1, padding: 9, borderRadius: 10, background: "#FFF8E1", border: "1.5px solid #FFE082", fontSize: 11, fontWeight: 700, color: "#F57F17", cursor: "pointer" }}>📋 Shortlist</button>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                ) : (
                  <button onClick={() => { sSlot(sk); sLib(true); sFCat("all"); }} style={{ width: "100%", padding: "20px 14px", background: "#fff", borderRadius: 16, border: "2px dashed #ddd", cursor: "pointer" }}>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 20, opacity: 0.2, marginBottom: 3 }}>+</div>
                      <div style={{ fontSize: 11, fontWeight: 600, color: "#bbb" }}>Add experience</div>
                    </div>
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Nav */}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 24 }}>
          <button disabled={aDay === 0} onClick={() => { sDay(aDay - 1); sExp(null); }} style={{ padding: "10px 16px", borderRadius: 12, border: "none", background: aDay > 0 ? "#fff" : "#f0f0f0", color: aDay > 0 ? "#1a1a1a" : "#ccc", fontSize: 13, fontWeight: 700, cursor: aDay > 0 ? "pointer" : "default" }}>← {aDay > 0 ? days[aDay - 1].md : ""}</button>
          <button disabled={aDay >= days.length - 1} onClick={() => { sDay(aDay + 1); sExp(null); }} style={{ padding: "10px 16px", borderRadius: 12, border: "none", background: aDay < days.length - 1 ? "#0B4D3B" : "#f0f0f0", color: aDay < days.length - 1 ? "#fff" : "#ccc", fontSize: 13, fontWeight: 700, cursor: aDay < days.length - 1 ? "pointer" : "default" }}>{aDay < days.length - 1 ? days[aDay + 1].md : ""} →</button>
        </div>
      </div>

      {/* Library */}
      {lib && (
        <div onClick={() => { sLib(false); sSlot(null); }} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 200, animation: "fi 0.12s ease-out" }}>
          <div onClick={e => e.stopPropagation()} style={{ position: "absolute", bottom: 0, left: 0, right: 0, maxWidth: 430, margin: "0 auto", background: "#fff", borderRadius: "24px 24px 0 0", height: "85vh", display: "flex", flexDirection: "column", animation: "su 0.25s ease-out" }}>
            <div style={{ display: "flex", justifyContent: "center", padding: "12px 0 6px" }}><div style={{ width: 40, height: 4, background: "#ddd", borderRadius: 2 }} /></div>
            <div style={{ padding: "6px 20px 12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800 }}>Choose Experience</h3>
              <button onClick={() => { sLib(false); sSlot(null); }} style={{ background: "#f0f0f0", border: "none", borderRadius: 10, padding: "6px 12px", fontSize: 13, fontWeight: 600, color: "#888", cursor: "pointer" }}>Cancel</button>
            </div>
            <div style={{ padding: "0 16px 8px", display: "flex", gap: 5, overflowX: "auto" }}>
              <button onClick={() => sFCat("all")} style={{ flexShrink: 0, padding: "7px 14px", borderRadius: 10, border: "none", fontSize: 12, fontWeight: 700, cursor: "pointer", background: fCat === "all" ? "#1a1a1a" : "#f0f0f0", color: fCat === "all" ? "#fff" : "#777" }}>All</button>
              {CATS.filter(c => c.id !== "custom").map(c => <button key={c.id} onClick={() => sFCat(fCat === c.id ? "all" : c.id)} style={{ flexShrink: 0, padding: "7px 12px", borderRadius: 10, border: "none", fontSize: 12, fontWeight: 700, cursor: "pointer", background: fCat === c.id ? c.color : "#f0f0f0", color: fCat === c.id ? "#fff" : "#777", display: "flex", alignItems: "center", gap: 4 }}><span style={{ fontSize: 13 }}>{c.icon}</span>{c.label}</button>)}
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: "6px 16px 24px" }}>
              <button onClick={() => { sLib(false); sCust(true); }} style={{ width: "100%", textAlign: "left", display: "flex", gap: 12, padding: "10px 14px", borderRadius: 14, border: "2px dashed #B0BEC5", background: "#FAFAFA", marginBottom: 10, cursor: "pointer", alignItems: "center" }}>
                <div style={{ width: 42, height: 42, borderRadius: 10, background: "#ECEFF1", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>📌</div>
                <div><div style={{ fontSize: 13, fontWeight: 700, color: "#546E7A" }}>Custom Event</div></div>
              </button>
              {avail.map(mod => {
                const mc = CATS.find(c => c.id === mod.category);
                return (
                  <button key={mod.id} onClick={() => place(mod.id)} style={{ width: "100%", textAlign: "left", display: "flex", gap: 12, padding: "10px 12px", borderRadius: 14, border: "none", background: "#FAFAF8", marginBottom: 6, cursor: "pointer", alignItems: "center" }}>
                    <div style={{ width: 46, height: 46, borderRadius: 10, flexShrink: 0, overflow: "hidden" }}><Vis mod={mod} cat={mc} h={46} br={10} /></div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 700 }}>{mod.name}</div>
                      <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 2 }}>
                        {mod.rec && REC[mod.rec] && <span style={{ fontSize: 9, fontWeight: 800, color: REC[mod.rec].color }}>{REC[mod.rec].icon} {REC[mod.rec].label}</span>}
                        {mod.mapsRating > 0 && <GR r={mod.mapsRating} sm />}
                      </div>
                    </div>
                    <div style={{ width: 30, height: 30, borderRadius: 8, background: (mc?.color || "#888") + "15", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, color: mc?.color, fontWeight: 700 }}>+</div>
                  </button>
                );
              })}
              {avail.length === 0 && <div style={{ textAlign: "center", padding: "40px 20px", color: "#ccc" }}><div style={{ fontSize: 36, marginBottom: 10 }}>✅</div><div style={{ fontSize: 15, fontWeight: 700, color: "#999" }}>All placed!</div></div>}
            </div>
          </div>
        </div>
      )}

      {cust && <CustomModal onSave={addCust} onClose={() => { sCust(false); sSlot(null); }} />}
      {guide && <AiGuide mod={guide} onClose={() => sGuide(null)} />}
      {showInfo && <InfoPanel info={trip.info} onClose={() => sInfo(false)} />}
      {showOv && <Overview days={days} occ={occ} mods={mods} onClose={() => sOv(false)} onJump={di => { sDay(di); sOv(false); }} />}
      {mapMod && <MapPopup mod={mapMod} onClose={() => sMap(null)} />}

      {/* Confirm Remove */}
      {confRm && (() => {
        const mid = cal[confRm];
        const mod = mods.find(m => m.id === mid);
        return (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 400, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }} onClick={() => sConfRm(null)}>
            <div onClick={e => e.stopPropagation()} style={{ background: "#fff", borderRadius: 20, padding: "24px 28px", maxWidth: 340, width: "100%", boxShadow: "0 16px 48px rgba(0,0,0,0.2)", animation: "fi 0.15s ease-out" }}>
              <div style={{ fontSize: 28, textAlign: "center", marginBottom: 12 }}>🗑️</div>
              <div style={{ fontSize: 16, fontWeight: 800, textAlign: "center", marginBottom: 6 }}>Remove?</div>
              <div style={{ fontSize: 13, color: "#666", textAlign: "center", lineHeight: 1.5, marginBottom: 20 }}><strong>{mod?.name}</strong> will be removed.</div>
              <button onClick={() => doRm(confRm)} style={{ width: "100%", padding: 12, borderRadius: 12, border: "none", background: "#E53935", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", marginBottom: 8 }}>Yes, Remove</button>
              <button onClick={() => { sSkipConf(true); doRm(confRm); }} style={{ width: "100%", padding: 10, borderRadius: 12, border: "none", background: "transparent", color: "#999", fontSize: 12, fontWeight: 600, cursor: "pointer", marginBottom: 4 }}>Don't ask again</button>
              <button onClick={() => sConfRm(null)} style={{ width: "100%", padding: 10, borderRadius: 12, border: "1.5px solid #eee", background: "#fff", color: "#555", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Cancel</button>
            </div>
          </div>
        );
      })()}

      {/* AI Trip Assistant — floating button (above tab bar) */}
      {!showAssist && !lib && !cust && !guide && !showInfo && !showOv && !mapMod && (
        <button onClick={() => sAssist(true)} style={{
          position: "fixed", bottom: 80, right: 16, width: 52, height: 52, borderRadius: 26,
          background: "linear-gradient(135deg, #1a1a1a, #333)", border: "none",
          boxShadow: "0 4px 20px rgba(0,0,0,0.3)", cursor: "pointer", zIndex: 150,
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22,
        }}>🤖</button>
      )}

      {/* AI Trip Assistant — chat */}
      {showAssist && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 300, display: "flex", alignItems: "flex-end", justifyContent: "center" }} onClick={() => sAssist(false)}>
          <div onClick={e => e.stopPropagation()} style={{ maxWidth: 430, width: "100%", background: "#fff", borderRadius: "24px 24px 0 0", height: "85vh", display: "flex", flexDirection: "column", animation: "su 0.25s ease-out" }}>
            <DragHandle onClose={() => sAssist(false)} />
            <div style={{ padding: "4px 20px 14px", borderBottom: "1px solid #f0f0f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#9B51E0", textTransform: "uppercase", letterSpacing: 1 }}>🤖 Trip Assistant</div>
                <div style={{ fontSize: 15, fontWeight: 800, marginTop: 2 }}>Ask me anything</div>
              </div>
              <button onClick={() => sAssist(false)} style={{ background: "#f0f0f0", border: "none", borderRadius: 10, padding: "6px 12px", fontSize: 13, fontWeight: 600, color: "#888", cursor: "pointer" }}>Close</button>
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px" }}>
              {assistMsgs.length === 0 && (
                <div style={{ textAlign: "center", padding: "20px 10px" }}>
                  <div style={{ fontSize: 36, marginBottom: 10 }}>🤖</div>
                  <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 6 }}>Panama trip assistant</div>
                  <div style={{ fontSize: 12, color: "#888", lineHeight: 1.5, marginBottom: 18 }}>I know your itinerary, the experience library, and Panama. Ask me anything.</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {["What should we do with a toddler?", "Best restaurants for a special dinner?", "Help me plan a free day", "What's the weather like in late March?"].map(q => (
                      <button key={q} onClick={() => sAssistInput(q)} style={{ padding: "9px 14px", borderRadius: 10, border: "1.5px solid #eee", background: "#FAFAF8", fontSize: 12, fontWeight: 600, color: "#555", cursor: "pointer", textAlign: "left" }}>{q}</button>
                    ))}
                  </div>
                </div>
              )}
              {assistMsgs.map((msg, i) => (
                <div key={i} style={{ marginBottom: 10, display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}>
                  <div style={{
                    maxWidth: "85%", padding: "10px 14px", borderRadius: 14,
                    background: msg.role === "user" ? "#1a1a1a" : "#F5F5F5",
                    color: msg.role === "user" ? "#fff" : "#333",
                    fontSize: 13, lineHeight: 1.6,
                    borderBottomRightRadius: msg.role === "user" ? 4 : 14,
                    borderBottomLeftRadius: msg.role === "user" ? 14 : 4,
                  }}>{msg.text}</div>
                </div>
              ))}
              {assistLoading && <div style={{ marginBottom: 10 }}><div style={{ display: "inline-block", padding: "10px 14px", borderRadius: 14, background: "#F5F5F5", fontSize: 13, color: "#999" }}>Thinking...</div></div>}
            </div>
            <div style={{ padding: "10px 20px 20px", borderTop: "1px solid #f0f0f0", display: "flex", gap: 8 }}>
              <input value={assistInput} onChange={e => sAssistInput(e.target.value)} placeholder="Ask about Panama..." onKeyDown={e => {
                if (e.key !== "Enter" || !assistInput.trim() || assistLoading) return;
                const q = assistInput.trim(); sAssistInput("");
                const nm = [...assistMsgs, { role: "user", text: q }]; sAssistMsgs(nm); sAssistLoading(true);
                const ctx = "Trip assistant for Panama trip Mar 29–Apr 7 2026. Travelers: parents (60s) + sometimes a 2.5yr toddler. Planned: " + Object.entries(cal).map(([sk, mid]) => { const m = mods.find(x => x.id === mid); return m ? m.name : ""; }).filter(Boolean).join(", ") + ". Available: " + mods.filter(m => !pIds.has(m.id)).map(m => m.name).join(", ") + ". Be concise, under 150 words.";
                fetch("https://api.anthropic.com/v1/messages", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1000, messages: [{ role: "user", content: ctx + "\n\n" + q }] }) })
                  .then(r => r.json()).then(d => { sAssistMsgs([...nm, { role: "assistant", text: d.content?.map(b => b.type === "text" ? b.text : "").join("") || "Couldn't respond." }]); })
                  .catch(() => { sAssistMsgs([...nm, { role: "assistant", text: "Couldn't connect." }]); })
                  .finally(() => sAssistLoading(false));
              }} style={{ ...IS, fontSize: 14, padding: "12px 16px" }} />
              <button onClick={() => { document.querySelector("input[placeholder='Ask about Panama...']")?.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true })); }} style={{ padding: "12px 18px", borderRadius: 12, border: "none", background: "#1a1a1a", color: "#fff", fontWeight: 700, fontSize: 16, cursor: "pointer", flexShrink: 0 }}>→</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ═══ EDIT MODAL (Admin) ═══
const ALL_TAGS = ["kid-friendly","nature","history","indoor","budget","sunset","adventure","walking","date-night","fine-dining","adults-only"];

const EditModal = ({ mod, onSave, onDelete, onClose }) => {
  const [f, sF] = useState({
    name: mod?.name || "", category: mod?.category || "activity", icon: mod?.icon || "", vibe: mod?.vibe || "", notes: mod?.notes || "",
    rec: mod?.rec || "", hours: mod?.hours || "", address: mod?.address || "",
    cost: mod?.cost || "", bookingUrl: mod?.bookingUrl || "", tier: mod?.tier || "curated",
    duration: mod?.duration || 1, mapsRating: mod?.mapsRating || 0, mapsReviews: mod?.mapsReviews || "",
    tags: mod?.tags || [], photo: mod?.photo || "",
  });
  const set = (k, v) => sF(p => ({ ...p, [k]: v }));
  const toggleTag = (t) => sF(p => ({ ...p, tags: p.tags.includes(t) ? p.tags.filter(x => x !== t) : [...p.tags, t] }));
  const LS = { fontSize: 10, fontWeight: 700, color: "#999", textTransform: "uppercase", letterSpacing: 0.8, display: "block", marginBottom: 4 };
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 350, display: "flex", alignItems: "flex-end", justifyContent: "center" }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ maxWidth: 430, width: "100%", background: "#fff", borderRadius: "24px 24px 0 0", maxHeight: "90vh", display: "flex", flexDirection: "column", animation: "su 0.25s ease-out" }}>
        <DragHandle onClose={onClose} />
        <div style={{ padding: "4px 20px 12px", borderBottom: "1px solid #f0f0f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800 }}>{mod ? "✏️ Edit" : "➕ New Experience"}</h3>
          <button onClick={onClose} style={{ background: "#f0f0f0", border: "none", borderRadius: 10, padding: "6px 12px", fontSize: 13, fontWeight: 600, color: "#888", cursor: "pointer" }}>Cancel</button>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "14px 20px 24px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div><label style={LS}>Name</label><input value={f.name} onChange={e => set("name", e.target.value)} style={IS} /></div>
            <div style={{ display: "flex", gap: 10 }}>
              <div style={{ width: 70 }}><label style={LS}>Icon</label><input value={f.icon} onChange={e => set("icon", e.target.value)} placeholder="🍸" style={{ ...IS, textAlign: "center", fontSize: 20, padding: "6px" }} /></div>
              <div style={{ flex: 1 }}><label style={LS}>Vibe / Type</label><input value={f.vibe} onChange={e => set("vibe", e.target.value)} placeholder="Cocktail Bar" style={IS} /></div>
            </div>
            <div><label style={LS}>Category</label><div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>{CATS.filter(c => c.id !== "custom").map(c => <button key={c.id} onClick={() => set("category", c.id)} style={{ padding: "5px 10px", borderRadius: 8, border: f.category === c.id ? "2px solid " + c.color : "1.5px solid #e0e0e0", background: f.category === c.id ? c.color + "15" : "#fff", fontSize: 11, fontWeight: 700, cursor: "pointer", color: f.category === c.id ? c.color : "#888" }}>{c.icon} {c.label}</button>)}</div></div>
            <div><label style={LS}>Description</label><textarea value={f.notes} onChange={e => set("notes", e.target.value)} rows={3} style={{ ...IS, resize: "vertical" }} /></div>
            <div><label style={LS}>Recommendation</label><div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>{[["cantmiss", "🔥 Can't Miss"], ["recommended", "👍 Recommended"], ["worthit", "✓ Worth It"], ["", "None"]].map(([v, l]) => <button key={v} onClick={() => set("rec", v)} style={{ padding: "5px 10px", borderRadius: 8, border: f.rec === v ? "2px solid #1a1a1a" : "1.5px solid #e0e0e0", background: f.rec === v ? "#1a1a1a" : "#fff", fontSize: 10, fontWeight: 700, cursor: "pointer", color: f.rec === v ? "#fff" : "#888" }}>{l}</button>)}</div></div>
            <div style={{ display: "flex", gap: 10 }}>
              <div style={{ flex: 1 }}><label style={LS}>Tier</label><div style={{ display: "flex", gap: 4 }}>{[["curated", "⭐ Curated"], ["extended", "📋 Extended"]].map(([v, l]) => <button key={v} onClick={() => set("tier", v)} style={{ flex: 1, padding: "6px", borderRadius: 8, border: f.tier === v ? "2px solid #1a1a1a" : "1.5px solid #e0e0e0", background: f.tier === v ? "#1a1a1a" : "#fff", fontSize: 10, fontWeight: 700, cursor: "pointer", color: f.tier === v ? "#fff" : "#888" }}>{l}</button>)}</div></div>
              <div style={{ width: 90 }}><label style={LS}>Slots</label><div style={{ display: "flex", gap: 3 }}>{[1, 2, 3, 4].map(n => <button key={n} onClick={() => set("duration", n)} style={{ width: 30, height: 30, borderRadius: 8, border: f.duration === n ? "2px solid #1a1a1a" : "1.5px solid #e0e0e0", background: f.duration === n ? "#1a1a1a" : "#fff", color: f.duration === n ? "#fff" : "#888", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>{n}</button>)}</div></div>
            </div>
            <div style={{ display: "flex", gap: 10 }}><div style={{ flex: 1 }}><label style={LS}>Hours</label><input value={f.hours} onChange={e => set("hours", e.target.value)} placeholder="Daily 9AM–5PM" style={IS} /></div><div style={{ flex: 1 }}><label style={LS}>Cost</label><input value={f.cost} onChange={e => set("cost", e.target.value)} placeholder="$20/pp" style={IS} /></div></div>
            <div><label style={LS}>Address</label><input value={f.address} onChange={e => set("address", e.target.value)} placeholder="Calle 50, Panama" style={IS} /></div>
            <div style={{ display: "flex", gap: 10 }}><div style={{ flex: 1 }}><label style={LS}>Google Rating</label><input type="number" step="0.1" min="0" max="5" value={f.mapsRating} onChange={e => set("mapsRating", parseFloat(e.target.value) || 0)} style={IS} /></div><div style={{ flex: 1 }}><label style={LS}>Reviews</label><input value={f.mapsReviews} onChange={e => set("mapsReviews", e.target.value)} placeholder="1.2K" style={IS} /></div></div>
            <div><label style={LS}>Booking URL</label><input value={f.bookingUrl} onChange={e => set("bookingUrl", e.target.value)} placeholder="https://..." style={IS} /></div>
            <div><label style={LS}>Photo URL</label><input value={f.photo} onChange={e => set("photo", e.target.value)} placeholder="https://images.unsplash.com/..." style={IS} /></div>
            <div><label style={LS}>Tags</label><div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>{ALL_TAGS.map(t => <button key={t} onClick={() => toggleTag(t)} style={{ padding: "4px 10px", borderRadius: 16, border: f.tags.includes(t) ? "2px solid #1a1a1a" : "1.5px solid #e0e0e0", background: f.tags.includes(t) ? "#1a1a1a" : "#fff", fontSize: 10, fontWeight: 700, cursor: "pointer", color: f.tags.includes(t) ? "#fff" : "#888" }}>{t}</button>)}</div></div>
          </div>
          <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 8 }}>
            <button disabled={!f.name.trim()} onClick={() => onSave({ ...f, id: mod?.id || ("exp-" + Date.now()), mapsRating: f.mapsRating || 0 })} style={{ width: "100%", padding: 14, borderRadius: 12, border: "none", background: f.name.trim() ? "#1a1a1a" : "#ccc", color: "#fff", fontSize: 15, fontWeight: 800, cursor: f.name.trim() ? "pointer" : "default" }}>{mod ? "Save Changes" : "Add Experience"}</button>
            {mod && onDelete && <button onClick={() => onDelete(mod.id)} style={{ width: "100%", padding: 12, borderRadius: 12, border: "1.5px solid #FFCDD2", background: "#FFF5F5", color: "#E53935", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>🗑️ Delete</button>}
          </div>
        </div>
      </div>
    </div>
  );
};

// ═══ EXPLORE TAB ═══
const Explore = ({ mods, setMods, cal, setCal, days, occ, isAdmin }) => {
  const [expandId, sExpand] = useState(null);
  const [filterCat, sFilter] = useState("all");
  const [filterTags, sFilterTags] = useState([]);
  const [slotPicker, sSlotPicker] = useState(null);
  const [piOpen, sPiOpen] = useState({});
  const [mapMod, sMapMod] = useState(null);
  const [editMod, sEditMod] = useState(undefined);
  const pIds = new Set(Object.values(cal));

  const TAG_OPTIONS = [
    { id: "kid-friendly", label: "👶 Kid-Friendly" },
    { id: "nature", label: "🌿 Nature" },
    { id: "history", label: "📜 History" },
    { id: "indoor", label: "🏠 Indoor" },
    { id: "budget", label: "💰 Budget" },
    { id: "sunset", label: "🌅 Sunset" },
    { id: "adventure", label: "🧗 Adventure" },
  ];

  const toggleTag = (t) => sFilterTags(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);

  const filtered = mods.filter(m => {
    if (filterCat !== "all" && m.category !== filterCat) return false;
    if (filterTags.length > 0 && (!m.tags || !filterTags.some(t => m.tags.includes(t)))) return false;
    return true;
  });
  const curated = filtered.filter(m => m.tier === "curated");
  const extended = filtered.filter(m => m.tier === "extended");

  const getOpenSlots = (mod) => {
    const best = mod.category === "restaurant" ? ["evening", "afternoon", "morning"]
      : mod.category === "nightlife" ? ["evening"]
      : ["morning", "afternoon", "evening"];
    const open = [];
    days.forEach(day => {
      best.forEach(sid => {
        const sk = day.date + "|" + sid;
        if (!occ[sk]) {
          let fits = true;
          if (mod.duration > 1) {
            const di = days.findIndex(d => d.date === day.date);
            const si = SLOTS.findIndex(s => s.id === sid);
            let cd = di, cs = si;
            for (let i = 0; i < mod.duration; i++) {
              if (cd >= days.length) { fits = false; break; }
              if (occ[days[cd].date + "|" + SLOTS[cs].id]) { fits = false; break; }
              cs++; if (cs >= SLOTS.length) { cd++; cs = 0; }
            }
          }
          if (fits) open.push({ sk, day, slot: SLOTS.find(s => s.id === sid) });
        }
      });
    });
    return open.slice(0, 6);
  };

  const addToSlot = (modId, sk) => {
    const nc = { ...cal };
    Object.keys(nc).forEach(k => { if (nc[k] === modId) delete nc[k]; });
    nc[sk] = modId;
    setCal(nc);
    sSlotPicker(null);
    sExpand(null);
  };

  const renderCard = (mod) => {
    const cat = CATS.find(c => c.id === mod.category);
    const isExp = expandId === mod.id;
    const isPlaced = pIds.has(mod.id);
    const mUrl = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(mod.name + " " + (mod.address || "") + " Panama");

    return (
      <div key={mod.id} style={{ marginBottom: 10 }}>
        <div onClick={() => sExpand(isExp ? null : mod.id)} style={{
          background: "#fff", borderRadius: 16, overflow: "hidden",
          border: "1.5px solid " + (cat?.color || "#ddd") + "20",
          boxShadow: isExp ? "0 6px 24px " + (cat?.color || "#000") + "10" : "0 1px 6px rgba(0,0,0,0.04)",
          cursor: "pointer",
        }}>
          {/* Collapsed header */}
          <div style={{ display: "flex", minHeight: isExp ? 42 : 78 }}>
            <div style={{ flex: 1, padding: isExp ? "9px 14px" : "10px 14px", borderLeft: "4px solid " + (cat?.color || "#888"), display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: isExp ? 13 : 14, fontWeight: 700, lineHeight: 1.25 }}>{mod.icon || cat?.icon} {mod.name}</span>
                {isPlaced && <span style={{ fontSize: 12, color: "#4CAF50", flexShrink: 0 }}>✅</span>}
              </div>
              {!isExp && mod.vibe && (
                <div style={{ marginTop: 4 }}>
                  <span style={{ fontSize: 9, fontWeight: 700, color: cat?.color || "#888", background: (cat?.color || "#888") + "12", padding: "2px 8px", borderRadius: 5 }}>{mod.icon || cat?.icon} {mod.vibe}</span>
                </div>
              )}
            </div>
            {!isExp && (
              <div style={{ width: "28%", minWidth: 82, flexShrink: 0, position: "relative" }}>
                <Vis mod={mod} cat={cat} h="100%" st={{ position: "absolute", inset: 0 }} />
                {isPlaced && <div style={{ position: "absolute", top: 5, left: 5, background: "rgba(76,175,80,0.9)", borderRadius: 6, padding: "2px 6px", fontSize: 9, fontWeight: 800, color: "#fff" }}>IN ITINERARY</div>}
              </div>
            )}
            {isExp && <div style={{ display: "flex", alignItems: "center", padding: "0 12px" }}><span style={{ fontSize: 11, color: "#ccc", transform: "rotate(180deg)" }}>▼</span></div>}
          </div>

          {/* Expanded */}
          {isExp && (
            <div style={{ padding: "0 14px 14px", animation: "fi 0.15s ease-out" }}>
              {/* Vibe + tags */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 10 }}>
                {mod.vibe && <span style={{ fontSize: 10, fontWeight: 700, color: cat?.color, background: (cat?.color || "#888") + "12", padding: "3px 9px", borderRadius: 7 }}>{mod.icon || cat?.icon} {mod.vibe}</span>}
                {mod.duration > 1 && <span style={{ fontSize: 10, fontWeight: 700, color: cat?.color, background: (cat?.color || "#888") + "10", padding: "3px 9px", borderRadius: 7 }}>📅 {mod.duration} slots</span>}
                {mod.tags && mod.tags.map(t => <span key={t} style={{ fontSize: 9, fontWeight: 600, color: "#888", background: "#f0f0f0", padding: "2px 7px", borderRadius: 5 }}>{t}</span>)}
              </div>

              {/* Visual */}
              <div style={{ borderRadius: 12, overflow: "hidden", marginBottom: 10 }}><Vis mod={mod} cat={cat} h={140} br={12} /></div>

              {/* Description */}
              <div style={{ background: "#FAFAF8", borderRadius: 12, padding: "12px 14px", marginBottom: 10 }}>
                <div style={{ fontSize: 13, color: "#555", lineHeight: 1.6 }}>{mod.notes}</div>
              </div>

              {/* Practical info — collapsible */}
              <div style={{ marginBottom: 10 }}>
                <button onClick={e => { e.stopPropagation(); sPiOpen(p => ({ ...p, [mod.id]: !p[mod.id] })); }} style={{
                  width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "9px 12px", borderRadius: piOpen[mod.id] ? "10px 10px 0 0" : 10,
                  background: "#F0F0F0", border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, color: "#666",
                }}>
                  <span>📋 Practical Info</span>
                  <span style={{ fontSize: 9, color: "#aaa", transform: piOpen[mod.id] ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>▼</span>
                </button>
                {piOpen[mod.id] && (
                  <div style={{ background: "#F0F0F0", borderRadius: "0 0 10px 10px", padding: "6px 12px 12px", display: "flex", flexDirection: "column", gap: 7, animation: "fi 0.12s ease-out" }}>
                    {mod.hours && <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12 }}><span style={{ fontSize: 13 }}>🕐</span><span style={{ color: "#555", fontWeight: 600 }}>{mod.hours}</span></div>}
                    {mod.cost && <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12 }}><span style={{ fontSize: 13 }}>💰</span><span style={{ color: "#555", fontWeight: 600 }}>{mod.cost}</span></div>}
                    {mod.address && <button onClick={e => { e.stopPropagation(); sMapMod(mod); }} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12, background: "none", border: "none", cursor: "pointer", padding: 0, textAlign: "left" }}><span style={{ fontSize: 13 }}>📍</span><span style={{ color: "#2D9CDB", fontWeight: 600 }}>{mod.address}</span><span style={{ fontSize: 9, color: "#aaa" }}>→ Map</span></button>}
                    {mod.mapsRating > 0 && <a href={mUrl} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12, textDecoration: "none" }}><span style={{ fontSize: 13 }}>⭐</span><GR r={mod.mapsRating} rv={mod.mapsReviews} /><span style={{ fontSize: 9, fontWeight: 700, color: "#4285F4" }}>Google</span></a>}
                    {mod.bookingUrl && <a href={mod.bookingUrl} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "9px 12px", borderRadius: 8, background: cat?.color, color: "#fff", fontSize: 12, fontWeight: 700, textDecoration: "none", marginTop: 2 }}>🔗 Book / Reserve</a>}
                  </div>
                )}
              </div>

              {/* Add to itinerary / Already planned */}
              {!isPlaced ? (
                <button onClick={e => { e.stopPropagation(); sSlotPicker(mod.id); }} style={{
                  width: "100%", padding: 12, borderRadius: 12, border: "none",
                  background: cat?.color, color: "#fff", fontSize: 14, fontWeight: 700,
                  cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                  boxShadow: "0 3px 10px " + (cat?.color || "#888") + "30",
                }}>➕ Add to Itinerary</button>
              ) : (
                <div style={{ fontSize: 12, color: "#4CAF50", fontWeight: 700, textAlign: "center", padding: "10px 0", background: "#E8F5E9", borderRadius: 12 }}>✅ Already in your itinerary</div>
              )}
              {isAdmin && <button onClick={e => { e.stopPropagation(); sEditMod(mod); }} style={{ width: "100%", padding: 10, borderRadius: 10, border: "1.5px solid #E53935", background: "#FFF5F5", color: "#E53935", fontSize: 12, fontWeight: 700, cursor: "pointer", marginTop: 6 }}>✏️ Edit Experience</button>}
            </div>
          )}
        </div>

        {/* Slot picker dropdown */}
        {slotPicker === mod.id && (
          <div style={{ background: "#fff", borderRadius: 12, padding: 12, marginTop: 6, border: "1.5px solid #eee", animation: "fi 0.15s ease-out" }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#555", marginBottom: 8 }}>
              {mod.category === "restaurant" ? "🍽️ Best for evenings — choose a slot:" : "Choose a slot:"}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {getOpenSlots(mod).map(({ sk, day, slot }) => (
                <button key={sk} onClick={e => { e.stopPropagation(); addToSlot(mod.id, sk); }} style={{
                  display: "flex", alignItems: "center", gap: 8, padding: "8px 12px",
                  borderRadius: 10, border: "1.5px solid #eee", background: "#FAFAF8",
                  cursor: "pointer", fontSize: 12, fontWeight: 600, color: "#333",
                }}>
                  <span>{slot.icon}</span>
                  <span>{day.wd} {day.md}</span>
                  <span style={{ color: "#aaa" }}>·</span>
                  <span style={{ color: "#888" }}>{slot.label}</span>
                </button>
              ))}
              {getOpenSlots(mod).length === 0 && <div style={{ fontSize: 12, color: "#999", padding: 8 }}>No open slots — try removing something first</div>}
            </div>
            <button onClick={e => { e.stopPropagation(); sSlotPicker(null); }} style={{ marginTop: 8, fontSize: 11, color: "#888", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>Cancel</button>
          </div>
        )}
      </div>
    );
  };

  // Highlights for carousel — curated "Can't Miss" experiences with photos
  const [hlIdx, setHlIdx] = useState(0);
  const highlights = mods.filter(m => m.rec === "cantmiss" && m.photo && m.tier === "curated");
  const hlSwRef = useRef(null);

  return (
    <div style={{ padding: "16px 16px 100px" }}>
      <div style={{ marginBottom: 14 }}>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, fontFamily: "'Playfair Display',Georgia,serif" }}>Experiences</h2>
        <div style={{ fontSize: 12, color: "#888", marginTop: 4 }}>Browse, learn more, and add to your itinerary</div>
      </div>

      {/* Highlights carousel */}
      {highlights.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", gap: 10, overflowX: "auto", scrollSnapType: "x mandatory", WebkitOverflowScrolling: "touch", paddingBottom: 8 }}
            ref={hlSwRef}
            onScroll={() => {
              if (hlSwRef.current) {
                const idx = Math.round(hlSwRef.current.scrollLeft / (hlSwRef.current.offsetWidth * 0.78));
                if (idx !== hlIdx && idx >= 0 && idx < highlights.length) setHlIdx(idx);
              }
            }}
          >
            {highlights.map((mod, i) => {
              const cat = CATS.find(c => c.id === mod.category);
              const isPlcd = pIds.has(mod.id);
              return (
                <div key={mod.id} onClick={() => sExpand(sExpand === mod.id ? null : mod.id)} style={{
                  flexShrink: 0, width: "78%", scrollSnapAlign: "start",
                  borderRadius: 16, overflow: "hidden", position: "relative",
                  height: 160, cursor: "pointer",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
                }}>
                  <img src={mod.photo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(0deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.1) 50%, transparent 100%)" }} />
                  <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "14px 16px" }}>
                    <div style={{ display: "flex", gap: 5, marginBottom: 4 }}>
                      {mod.vibe && <span style={{ fontSize: 9, fontWeight: 700, color: "#fff", background: "rgba(255,255,255,0.2)", padding: "2px 7px", borderRadius: 5 }}>{mod.icon || cat?.icon} {mod.vibe}</span>}
                      {isPlcd && <span style={{ fontSize: 9, fontWeight: 800, color: "#fff", background: "rgba(76,175,80,0.8)", padding: "2px 7px", borderRadius: 5 }}>✅ Planned</span>}
                    </div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: "#fff", textShadow: "0 1px 4px rgba(0,0,0,0.4)" }}>{mod.icon || cat?.icon} {mod.name}</div>
                  </div>
                </div>
              );
            })}
          </div>
          {/* Dots */}
          <div style={{ display: "flex", justifyContent: "center", gap: 4, marginTop: 6 }}>
            {highlights.slice(0, 10).map((_, i) => <div key={i} style={{ width: i === hlIdx ? 14 : 5, height: 5, borderRadius: 3, background: i === hlIdx ? "#1a1a1a" : "#ccc", transition: "all 0.3s" }} />)}
          </div>
        </div>
      )}

      {/* Interest tags */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: "#aaa", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 6 }}>I'm interested in</div>
        <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
          {TAG_OPTIONS.map(t => (
            <button key={t.id} onClick={() => toggleTag(t.id)} style={{
              padding: "6px 12px", borderRadius: 20, border: "1.5px solid " + (filterTags.includes(t.id) ? "#1a1a1a" : "#e0e0e0"),
              background: filterTags.includes(t.id) ? "#1a1a1a" : "#fff", color: filterTags.includes(t.id) ? "#fff" : "#666",
              fontSize: 11, fontWeight: 700, cursor: "pointer",
            }}>{t.label}</button>
          ))}
        </div>
      </div>

      {/* Category filters */}
      <div style={{ display: "flex", gap: 5, overflowX: "auto", marginBottom: 16, paddingBottom: 4, WebkitOverflowScrolling: "touch" }}>
        <button onClick={() => sFilter("all")} style={{ flexShrink: 0, padding: "7px 14px", borderRadius: 10, border: "none", fontSize: 12, fontWeight: 700, cursor: "pointer", background: filterCat === "all" ? "#1a1a1a" : "#fff", color: filterCat === "all" ? "#fff" : "#777", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>All</button>
        {CATS.filter(c => c.id !== "custom").map(c => (
          <button key={c.id} onClick={() => sFilter(filterCat === c.id ? "all" : c.id)} style={{
            flexShrink: 0, padding: "7px 12px", borderRadius: 10, border: "none", fontSize: 12, fontWeight: 700, cursor: "pointer",
            background: filterCat === c.id ? c.color : "#fff", color: filterCat === c.id ? "#fff" : "#777",
            display: "flex", alignItems: "center", gap: 4, boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
          }}><span style={{ fontSize: 13 }}>{c.icon}</span>{c.label}</button>
        ))}
      </div>

      {curated.length === 0 && extended.length === 0 && (
        <div style={{ textAlign: "center", padding: "40px 20px", color: "#ccc" }}>
          <div style={{ fontSize: 32, marginBottom: 10 }}>🔍</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#999" }}>No experiences match your filters</div>
          <button onClick={() => { sFilter("all"); sFilterTags([]); }} style={{ marginTop: 10, padding: "8px 16px", borderRadius: 10, border: "none", background: "#f0f0f0", color: "#666", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Clear filters</button>
        </div>
      )}

      {curated.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <span style={{ fontSize: 13 }}>⭐</span>
            <span style={{ fontSize: 12, fontWeight: 800, color: "#1a1a1a", textTransform: "uppercase", letterSpacing: 0.8 }}>Chris's Picks</span>
            <div style={{ flex: 1, height: 1, background: "#eee" }} />
          </div>
          {curated.map(renderCard)}
        </div>
      )}

      {extended.length > 0 && (
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <span style={{ fontSize: 13 }}>📋</span>
            <span style={{ fontSize: 12, fontWeight: 800, color: "#888", textTransform: "uppercase", letterSpacing: 0.8 }}>More Options</span>
            <div style={{ flex: 1, height: 1, background: "#eee" }} />
          </div>
          {extended.map(renderCard)}
        </div>
      )}

      {/* Admin: Add new experience */}
      {isAdmin && (
        <div style={{ padding: "10px 0 20px" }}>
          <button onClick={() => sEditMod(null)} style={{
            width: "100%", padding: 14, borderRadius: 14,
            border: "2px dashed #E53935", background: "#FFF5F5",
            color: "#E53935", fontSize: 14, fontWeight: 800, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          }}>➕ Add New Experience</button>
        </div>
      )}

      {mapMod && <MapPopup mod={mapMod} onClose={() => sMapMod(null)} />}

      {/* Admin edit modal */}
      {isAdmin && editMod !== undefined && (
        <EditModal
          mod={editMod}
          onSave={(updated) => {
            if (setMods) {
              setMods(prev => {
                const exists = prev.find(m => m.id === updated.id);
                if (exists) return prev.map(m => m.id === updated.id ? updated : m);
                return [...prev, updated];
              });
            }
            sEditMod(undefined);
            sExpand(null);
          }}
          onDelete={editMod ? (id) => {
            if (setMods) setMods(prev => prev.filter(m => m.id !== id));
            const nc = { ...cal };
            Object.keys(nc).forEach(k => { if (nc[k] === id) delete nc[k]; });
            setCal(nc);
            sEditMod(undefined);
            sExpand(null);
          } : null}
          onClose={() => sEditMod(undefined)}
        />
      )}
    </div>
  );
};

// ═══ ROOT ═══
export default function App() {
  const [scr, sScr] = useState("welcome");
  const [tab, sTab] = useState("explore");
  const [jd, sJd] = useState(0);
  const [mods, sMods] = useState(MODS);
  const [cal, sCal] = useState(INIT_CAL);
  const [trip, sTrip] = useState(TRIP);
  const [editTrip, sEditTrip] = useState(false);
  const [showOv, setShowOv] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  // Admin mode via URL param: ?admin=true
  const isAdmin = typeof window !== "undefined" && new URLSearchParams(window.location.search).get("admin") === "true";

  const days = mkDays(trip.startDate, trip.dayCount);
  const getOcc = useCallback(() => {
    const o = {};
    Object.entries(cal).forEach(([sk, mid]) => {
      const mod = mods.find(m => m.id === mid);
      if (!mod) return;
      o[sk] = mid;
      if (mod.duration > 1) {
        const [ds, tid] = sk.split("|");
        const di = days.findIndex(d => d.date === ds);
        const si = SLOTS.findIndex(s => s.id === tid);
        let left = mod.duration - 1, cd = di, cs = si + 1;
        while (left > 0 && cd < days.length) { if (cs >= SLOTS.length) { cd++; cs = 0; } if (cd < days.length) o[days[cd].date + "|" + SLOTS[cs].id] = mid; cs++; left--; }
      }
    });
    return o;
  }, [cal, mods, days]);
  const occ = getOcc();

  if (scr === "welcome") return <Welcome trip={trip} days={days} occ={occ} mods={mods} cal={cal} onStart={(t) => { sTab(t || "explore"); sJd(0); sScr("main"); }} onJump={di => { sJd(di); sTab("itinerary"); sScr("main"); }} />;

  // Main screen with tabs
  return (
    <div style={{ fontFamily: "'DM Sans',-apple-system,sans-serif", background: "linear-gradient(180deg, #F2F1EE 0%, #E5EAE6 30%, #D8DED9 60%, #CDD5CE 100%)", backgroundAttachment: "fixed", minHeight: "100vh", maxWidth: 430, margin: "0 auto", position: "relative" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Playfair+Display:wght@700;800&display=swap" rel="stylesheet" />
      <style>{`@keyframes su{from{transform:translateY(100%)}to{transform:translateY(0)}} @keyframes fi{from{opacity:0}to{opacity:1}} @keyframes ci{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}} *{-webkit-tap-highlight-color:transparent} ::-webkit-scrollbar{display:none}`}</style>

      {/* Shared fixed header — always visible on both tabs */}
      <div style={{ background: "#fff", padding: "10px 16px 10px", borderBottom: "1px solid #eee", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div onClick={() => isAdmin ? sEditTrip(true) : sScr("welcome")} style={{ cursor: "pointer" }}>
            <h1 style={{ margin: 0, fontSize: 15, fontWeight: 800, fontFamily: "'Playfair Display',Georgia,serif" }}>{trip.name} {isAdmin && <span style={{ fontSize: 10, color: "#aaa" }}>✏️</span>}</h1>
            <div style={{ fontSize: 10, color: "#999", marginTop: 1 }}>{trip.subtitle}{isAdmin && <span style={{ color: "#E53935", fontWeight: 800, marginLeft: 6 }}>ADMIN</span>}</div>
          </div>
          <div style={{ display: "flex", gap: 5 }}>
            <button onClick={() => setShowOv(true)} style={{ background: "#f0f0f0", border: "none", borderRadius: 10, padding: "6px 10px", fontSize: 10, fontWeight: 700, cursor: "pointer", color: "#555" }}>📋 Trip Overview</button>
            <button onClick={() => setShowInfo(true)} style={{ background: "linear-gradient(135deg,#E8F5E9,#C8E6C9)", border: "none", borderRadius: 10, padding: "6px 10px", fontSize: 10, fontWeight: 800, cursor: "pointer", color: "#2E7D32" }}>💡 Practical Info</button>
          </div>
        </div>
      </div>

      {/* Tab content */}
      {tab === "explore" ? (
        <Explore mods={mods} setMods={sMods} cal={cal} setCal={sCal} days={days} occ={occ} isAdmin={isAdmin} onSwitchToDay={di => { sJd(di); sTab("itinerary"); }} />
      ) : (
        <Itin trip={trip} mods={mods} setMods={sMods} cal={cal} setCal={sCal} onBack={() => sScr("welcome")} initDay={jd} />
      )}

      {/* Trip edit modal (admin) */}
      {editTrip && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 350, display: "flex", alignItems: "flex-end", justifyContent: "center" }} onClick={() => sEditTrip(false)}>
          <div onClick={e => e.stopPropagation()} style={{ maxWidth: 430, width: "100%", background: "#fff", borderRadius: "24px 24px 0 0", maxHeight: "80vh", display: "flex", flexDirection: "column", animation: "su 0.25s ease-out" }}>
            <DragHandle onClose={() => sEditTrip(false)} />
            <div style={{ padding: "4px 20px 12px", borderBottom: "1px solid #f0f0f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800 }}>✏️ Edit Trip</h3>
              <button onClick={() => sEditTrip(false)} style={{ background: "#f0f0f0", border: "none", borderRadius: 10, padding: "6px 12px", fontSize: 13, fontWeight: 600, color: "#888", cursor: "pointer" }}>Done</button>
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: "14px 20px 24px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div><label style={{ fontSize: 10, fontWeight: 700, color: "#999", textTransform: "uppercase", letterSpacing: 0.8, display: "block", marginBottom: 4 }}>Trip Name</label><input value={trip.name} onChange={e => sTrip(p => ({ ...p, name: e.target.value }))} style={IS} /></div>
                <div><label style={{ fontSize: 10, fontWeight: 700, color: "#999", textTransform: "uppercase", letterSpacing: 0.8, display: "block", marginBottom: 4 }}>Subtitle</label><input value={trip.subtitle} onChange={e => sTrip(p => ({ ...p, subtitle: e.target.value }))} style={IS} /></div>
                <div style={{ display: "flex", gap: 10 }}>
                  <div style={{ flex: 1 }}><label style={{ fontSize: 10, fontWeight: 700, color: "#999", textTransform: "uppercase", letterSpacing: 0.8, display: "block", marginBottom: 4 }}>Start Date</label><input type="date" value={trip.startDate} onChange={e => sTrip(p => ({ ...p, startDate: e.target.value }))} style={IS} /></div>
                  <div style={{ width: 80 }}><label style={{ fontSize: 10, fontWeight: 700, color: "#999", textTransform: "uppercase", letterSpacing: 0.8, display: "block", marginBottom: 4 }}>Days</label><input type="number" min="1" max="30" value={trip.dayCount} onChange={e => sTrip(p => ({ ...p, dayCount: parseInt(e.target.value) || 1 }))} style={IS} /></div>
                </div>
                <div><label style={{ fontSize: 10, fontWeight: 700, color: "#999", textTransform: "uppercase", letterSpacing: 0.8, display: "block", marginBottom: 4 }}>Description</label><textarea value={trip.brief} onChange={e => sTrip(p => ({ ...p, brief: e.target.value }))} rows={3} style={{ ...IS, resize: "vertical" }} /></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Overview + Info panels (shared across both tabs) */}
      {showOv && <Overview days={days} occ={occ} mods={mods} onClose={() => setShowOv(false)} onJump={di => { sJd(di); sTab("itinerary"); setShowOv(false); }} />}
      {showInfo && <InfoPanel info={trip.info} onClose={() => setShowInfo(false)} />}

      {/* Bottom tab bar */}
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0, maxWidth: 430, margin: "0 auto",
        background: "#fff", borderTop: "1px solid #eee",
        display: "flex", gap: 8, padding: "8px 12px 20px", zIndex: 200,
        boxShadow: "0 -2px 10px rgba(0,0,0,0.05)",
      }}>
        <button onClick={() => sTab("explore")} style={{
          flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
          background: tab === "explore" ? "#0B4D3B" : "#f5f5f5",
          border: "none", cursor: "pointer", padding: "11px 8px", borderRadius: 12,
        }}>
          <span style={{ fontSize: 16 }}>✨</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: tab === "explore" ? "#fff" : "#999" }}>Explore</span>
        </button>
        <button onClick={() => sTab("itinerary")} style={{
          flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
          background: tab === "itinerary" ? "#0B4D3B" : "#f5f5f5",
          border: "none", cursor: "pointer", padding: "11px 8px", borderRadius: 12,
        }}>
          <span style={{ fontSize: 16 }}>📅</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: tab === "itinerary" ? "#fff" : "#999" }}>Itinerary</span>
        </button>
      </div>
    </div>
  );
}
