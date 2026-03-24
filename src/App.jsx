import { useState, useRef, useEffect, useCallback } from "react";

const CATS = [
  { id: "restaurant", label: "Eat & Drink", icon: "🍽️", color: "#E8843C", grad: "linear-gradient(135deg,#E8843C,#C4612E)" },
  { id: "activity", label: "Activities", icon: "⚡", color: "#6FCF97", grad: "linear-gradient(135deg,#6FCF97,#27A05F)" },
  { id: "nature", label: "Nature", icon: "🌿", color: "#27AE60", grad: "linear-gradient(135deg,#66BB6A,#2E7D32)" },
  { id: "culture", label: "Culture", icon: "🎭", color: "#F2994A", grad: "linear-gradient(135deg,#F2994A,#D47B2E)" },
  { id: "daytrip", label: "Day Trips", icon: "🏝️", color: "#2D9CDB", grad: "linear-gradient(135deg,#2D9CDB,#0E7AB3)" },
  { id: "nightlife", label: "Nightlife", icon: "🌙", color: "#9B51E0", grad: "linear-gradient(135deg,#9B51E0,#7536BB)" },
  { id: "wellness", label: "Wellness", icon: "🧘", color: "#56CCF2", grad: "linear-gradient(135deg,#56CCF2,#26ADD8)" },
  { id: "home", label: "Personal", icon: "🏡", color: "#78909C", grad: "linear-gradient(135deg,#90A4AE,#607D8B)" },
  { id: "custom", label: "Custom", icon: "📌", color: "#78909C", grad: "linear-gradient(135deg,#78909C,#546E7A)" },
  { id: "event", label: "Events", icon: "🎪", color: "#E91E63", grad: "linear-gradient(135deg,#E91E63,#C2185B)" },
];

// SLOTS removed — using flexible timeline model

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
  nature: (w, h) => `<rect width="${w}" height="${h}" fill="url(#gn2)"/><defs><linearGradient id="gn2" x1="0" y1="0" x2="${w}" y2="${h}"><stop offset="0%" stop-color="#66BB6A"/><stop offset="100%" stop-color="#2E7D32"/></linearGradient></defs><path d="M${w*0.2},${h} L${w*0.35},${h*0.3} L${w*0.5},${h}" fill="rgba(255,255,255,0.08)"/><path d="M${w*0.5},${h} L${w*0.7},${h*0.2} L${w*0.9},${h}" fill="rgba(255,255,255,0.1)"/><circle cx="${w*0.15}" cy="${h*0.2}" r="${h*0.1}" fill="rgba(255,255,255,0.12)"/><text x="${w*0.5}" y="${h*0.5}" text-anchor="middle" font-size="${h*0.3}" opacity="0.4">🌿</text>`,
  home: (w, h) => `<rect width="${w}" height="${h}" fill="url(#gh)"/><defs><linearGradient id="gh" x1="0" y1="0" x2="${w}" y2="${h}"><stop offset="0%" stop-color="#90A4AE"/><stop offset="100%" stop-color="#607D8B"/></linearGradient></defs><text x="${w*0.5}" y="${h*0.5}" text-anchor="middle" font-size="${h*0.3}" opacity="0.4">🏡</text>`,
  wellness: (w, h) => `<rect width="${w}" height="${h}" fill="url(#gw)"/><defs><linearGradient id="gw" x1="0" y1="0" x2="${w}" y2="${h}"><stop offset="0%" stop-color="#56CCF2"/><stop offset="100%" stop-color="#26ADD8"/></linearGradient></defs><path d="M0,${h*0.6} Q${w*0.15},${h*0.5} ${w*0.3},${h*0.6} Q${w*0.45},${h*0.7} ${w*0.6},${h*0.6} Q${w*0.75},${h*0.5} ${w},${h*0.6}" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="2"/><path d="M0,${h*0.7} Q${w*0.2},${h*0.6} ${w*0.4},${h*0.7} Q${w*0.6},${h*0.8} ${w*0.8},${h*0.7} Q${w*0.9},${h*0.65} ${w},${h*0.7}" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="2"/><text x="${w*0.5}" y="${h*0.45}" text-anchor="middle" font-size="${h*0.3}" opacity="0.4">🧘</text>`,
  custom: (w, h) => `<rect width="${w}" height="${h}" fill="url(#gx)"/><defs><linearGradient id="gx" x1="0" y1="0" x2="${w}" y2="${h}"><stop offset="0%" stop-color="#78909C"/><stop offset="100%" stop-color="#546E7A"/></linearGradient></defs><text x="${w*0.5}" y="${h*0.5}" text-anchor="middle" font-size="${h*0.3}" opacity="0.4">📌</text>`,
};

const Vis = ({ mod, cat, h = 100, br = 0, st = {} }) => {
  const [imgErr, setImgErr] = useState(false);
  const [imgOk, setImgOk] = useState(false);
  if (mod.photo && !imgErr) {
    const isSmall = typeof h === "number" && h <= 100;
    const src = isSmall && mod.thumb ? mod.thumb : mod.photo;
    return (
      <div style={{ height: h, position: "relative", overflow: "hidden", borderRadius: br, background: cat?.grad || "#78909C", ...st }}>
        {!imgOk && <div style={{ position: "absolute", inset: 0, background: cat?.grad || "#78909C", display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ fontSize: isSmall ? 20 : 40, opacity: 0.4 }}>{mod.icon || cat?.icon || "📍"}</span></div>}
        <img src={src} alt="" loading="lazy" onLoad={() => setImgOk(true)} onError={() => setImgErr(true)} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", opacity: imgOk ? 1 : 0, transition: "opacity 0.4s ease-out" }} />
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "50%", background: "linear-gradient(0deg,rgba(0,0,0,0.4) 0%,transparent 100%)" }} />
      </div>
    );
  }
  // Styled placeholder — gradient background with centered icon
  const hN = typeof h === "number" ? h : 100;
  const isSmall = hN <= 100;
  const grad = cat?.grad || "linear-gradient(135deg, #78909C, #546E7A)";
  return (
    <div style={{ height: h, position: "relative", overflow: "hidden", borderRadius: br, background: grad, display: "flex", alignItems: "center", justifyContent: "center", ...st }}>
      <div style={{ textAlign: "center" }}>
        <span style={{ fontSize: isSmall ? 22 : 44, display: "block", opacity: 0.5, filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.2))" }}>{mod.icon || cat?.icon || "📍"}</span>
        {!isSmall && mod.vibe && <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.5)", marginTop: 4 }}>{mod.vibe}</div>}
      </div>
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "50%", background: "linear-gradient(0deg,rgba(0,0,0,0.35) 0%,transparent 100%)" }} />
    </div>
  );
};

const MODS = [
  // ═══ RESTAURANTS & FOOD ═══
  { id:"f1", name:"La Tapa del Coco", category:"restaurant", icon:"🌍", vibe:"Afro-Caribbean", notes:"Chef Isaac Villaverde is rescuing Afro-Panamanian cuisine and putting it on the global map (ranked in Latin America's 50 Best). The One Pot Colonense is the signature: coconut rice with pork ribs, beans, and fresh shrimp. Also try the cod fritters, jerk chicken, and patties de carne. Vibrant atmosphere with Afro-Caribbean music. Come hungry, leave amazed.", rec:"cantmiss", mapsRating:4.7, mapsReviews:"1K", hours:"Tue–Sun 12–10PM", address:"San Francisco", tier:"curated", cost:"$20–35/pp", tags:["history","culture"], photo:"/photos/f1.webp", thumb:"/photos/f1_thumb.webp" },
  { id:"f2", name:"Helados Keene's", category:"restaurant", icon:"🍦", vibe:"Ice Cream", notes:"Panama's best artisanal ice cream — Karyna's shop! Made from scratch with all-local ingredients. 100% gluten-free with excellent vegan options. Flavors rotate monthly. The Via Argentina location is the flagship. A must-stop to show the parents.", rec:"recommended", mapsRating:4.7, mapsReviews:"150", hours:"Via Argentina: Mon/Wed 3:30–10PM, other days vary", address:"Via Argentina, El Cangrejo", tier:"curated", cost:"$4–8", tags:["great-with-kids"], photo:"/photos/f2.webp", thumb:"/photos/f2_thumb.webp" },
  { id:"f3", name:"La Pulpería", category:"restaurant", icon:"🍹", vibe:"Bar & Tapas", notes:"One of Casco Viejo's most popular spots — ranked #3 on TripAdvisor for all of Panama City. Great cocktails, excellent ceviche, octopus tacos, and tapas for sharing. All-day happy hour Mon–Wed. Craft beer brewed in-house. Dinner here with Karyna's parents on Monday evening.", rec:"cantmiss", mapsRating:4.7, mapsReviews:"1.5K", hours:"Mon–Thu 12PM–12AM, Fri–Sat til 2AM, Sun til 10PM", address:"Calle 9na Este, Casco Viejo", tier:"curated", cost:"$15–30/pp", tags:[], photo:"/photos/f3.webp", thumb:"/photos/f3_thumb.webp" },
  { id:"f4", name:"Gamboa Bakery", category:"restaurant", icon:"🥐", vibe:"Bakery & Café", notes:"A charming bakery and café in Ciudad del Saber. Great pastries, bread, and light bites in a peaceful garden setting. Breakfast here Saturday morning with your friend — show parents a piece of your local community. Worth combining with a walk around the Ciudad del Saber campus.", rec:"recommended", mapsRating:4.4, mapsReviews:"200", hours:"Mon–Sat 7AM–5PM", address:"Ciudad del Saber, Clayton", tier:"curated", cost:"$5–12", tags:["great-with-kids"], photo:"/photos/f4.webp", thumb:"/photos/f4_thumb.webp" },
  { id:"f5", name:"Sassi", category:"restaurant", icon:"🥗", vibe:"Lunch Spot", notes:"A popular lunch spot right next to Kianu's school in Marbella. Fresh, health-conscious food with bold flavors. Great salads, bowls, and lighter fare. Planned for Monday lunch with Kianu and the parents — show them the neighborhood.", rec:"worthit", mapsRating:4.3, mapsReviews:"320", hours:"Mon–Fri 11:30AM–3PM", address:"Marbella", tier:"extended", cost:"$12–18/pp", tags:[], photo:"/photos/f5.webp", thumb:"/photos/f5_thumb.webp" },
  { id:"f6", name:"Fonda Lo Que Hay", category:"restaurant", icon:"🐙", vibe:"Ceviche & Seafood", notes:"The best ceviche in Casco Viejo. Intimate spot, menu changes based on what's fresh. Reserve ahead — it's small and fills up fast. Try the pulpo and the ceviche mixto. The wine selection is thoughtful and the atmosphere is warm and unpretentious.", rec:"cantmiss", mapsRating:4.5, mapsReviews:"1.2K", hours:"Tue–Sun 12–10PM, Closed Mon", address:"Calle 11, Casco Viejo", tier:"curated", cost:"$25–40/pp", tags:["date-night"], photo:"https://images.unsplash.com/photo-1535399831218-d5bd36d1a6b3?w=600&h=400&fit=crop" },
  { id:"f7", name:"Mercado de Mariscos", category:"restaurant", icon:"🐟", vibe:"Fish Market & Ceviche", notes:"Panama City's iconic fish market. Go upstairs to the ceviche stands — order a mixed ceviche and a cold Balboa beer. Downstairs is the raw fish market, worth a quick walk through for the experience. Casual, bustling, and authentically Panamanian. Right at the entrance to Casco Viejo — combine with the walking tour.", rec:"cantmiss", mapsRating:4.0, mapsReviews:"6.2K", hours:"Daily 5AM–5PM", address:"Av. Balboa, Casco Viejo", tier:"curated", cost:"$5–12/pp", tags:["great-with-kids","budget"], photo:"/photos/f7.webp", thumb:"/photos/f7_thumb.webp" },
  { id:"f9", name:"Don Caimán", category:"restaurant", icon:"🐊", vibe:"Riverside Dining", notes:"Restaurant at Gamboa Rainforest Resort with an outdoor terrace overlooking the Chagres River where it meets the Canal. The perfect lunch spot after the Monkey Island boat tour. Watch boats navigate the Canal while you eat. Relaxed atmosphere, solid menu — go for the seafood.", rec:"recommended", mapsRating:4.2, mapsReviews:"350", hours:"Daily 12–9PM", address:"Gamboa Rainforest Resort", tier:"curated", cost:"$15–30/pp", tags:["nature"], photo:"/photos/f9.webp", thumb:"/photos/f9_thumb.webp" },
  { id:"f10", name:"Maito", category:"restaurant", icon:"🏆", vibe:"Fine Dining", notes:"Panama's top restaurant — ranked #16 in Latin America's 50 Best. Chef Mario Castrellón showcases Panamanian ingredients with modern technique. The tasting menu is the way to go. This is the splurge night (Saturday). Book NOW — Easter weekend means limited availability.", rec:"cantmiss", mapsRating:4.6, mapsReviews:"2K", bookingUrl:"https://www.maitopanama.com", hours:"Tue–Sat 12–3PM, 7–10:30PM", address:"Calle 50, Bella Vista", tier:"curated", cost:"$60–100/pp", tags:["date-night","splurge"], photo:"/photos/f10.webp", thumb:"/photos/f10_thumb.webp" },

  // ═══ NIGHTLIFE ═══
  { id:"d1", name:"El Olivo Wine Bar", category:"nightlife", icon:"🍷", vibe:"Wine Bar", notes:"A cozy natural wine bar in El Cangrejo. Organic and biodynamic wines, 100+ labels. Great tapas, cheese platters, standout pulpo en palito. Perfect for a relaxed evening out.", rec:"recommended", mapsRating:4.6, mapsReviews:"280", hours:"Tue–Sat 5PM–12AM", address:"Av. 1ab Norte, El Cangrejo", tier:"curated", cost:"$15–30/pp", tags:["date-night"], photo:"https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=600&h=400&fit=crop" },
  { id:"d2", name:"Mangle", category:"nightlife", icon:"🍸", vibe:"Cocktail Bar", notes:"One of Panama City's best cocktail bars. Tropical living room vibes with mangrove-inspired decor. Try the mezcal paloma or Strawberry Letter milk punch. Great food too — birria tacos and Anti Burger sliders. Killer happy hour noon to 7PM.", rec:"cantmiss", mapsRating:4.8, mapsReviews:"180", hours:"Daily 12PM–12AM", address:"C. República de Uruguay", tier:"curated", cost:"$10–15/cocktail", tags:["date-night"], photo:"https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=600&h=400&fit=crop" },
  { id:"d3", name:"CasaCasco Rooftop", category:"nightlife", icon:"🌇", vibe:"Rooftop Bar", notes:"Stunning rooftop in Casco Viejo with panoramic views of old town, skyline, and Pacific Canal entrance. Come at sunset. Cocktails are decent, scenery is the star.", rec:"recommended", mapsRating:4.3, mapsReviews:"1.5K", hours:"Daily 4PM–12AM", address:"Av. A, Casco Viejo", tier:"curated", cost:"$12–18/cocktail", tags:["sunset"], photo:"https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=600&h=400&fit=crop" },

  // ═══ ACTIVITIES — PANAMA CITY ═══
  { id:"a1", name:"Miraflores Visitor Center", category:"activity", icon:"🚢", vibe:"Canal & IMAX", notes:"Watch massive ships transit the locks from the viewing platform. The IMAX film (45 min, Morgan Freeman narration) is excellent — watch it first, then head to the platform for the afternoon transit window (from ~2 PM). Museum exhibits currently closed for renovation — only viewing platform + IMAX open. Still the closest view of the Canal anywhere. ~$17/adult. Budget 1.5–2 hours.", rec:"cantmiss", mapsRating:4.6, mapsReviews:"18K", bookingUrl:"https://visitcanaldepanama.com", hours:"Daily 8AM–5PM, IMAX screenings hourly", address:"Miraflores Locks", tier:"curated", cost:"~$17/adult", tags:["indoor","history","iconic"], photo:"/photos/a1.webp", thumb:"/photos/a1_thumb.webp" },
  { id:"a2", name:"Amador Causeway", category:"activity", icon:"🚗", vibe:"Scenic Drive", notes:"A scenic road connecting three islands at the Pacific Canal entrance. Drive along with stunning views — skyline on one side, Canal on the other. Bridge of the Americas, ships queuing for the Canal. Biomuseo and Punta Culebra are both here. Best late afternoon when the light is golden.", rec:"recommended", mapsRating:4.2, mapsReviews:"1.8K", hours:"Open 24hrs", address:"Amador Causeway", tier:"curated", cost:"Free", tags:["sunset","scenic","great-with-kids"], photo:"/photos/a2.webp", thumb:"/photos/a2_thumb.webp" },
  { id:"a4", name:"Parque Natural Metropolitano", category:"activity", icon:"🌳", vibe:"Urban Rainforest", notes:"265-hectare tropical rainforest right inside the city. Easy trails (El Roble: 0.7 km, 30 min) or moderate (Mono Titi to mirador: ~50 min up). Spot sloths, monkeys, toucans. A unique experience you can't get in any other capital city. Go early morning for best wildlife. $5 adults, $3 children.", rec:"recommended", mapsRating:4.3, mapsReviews:"3.1K", hours:"Daily 6AM–5PM", address:"Av. Juan Pablo II", tier:"curated", cost:"$5 adults / $3 children", tags:["great-with-kids","nature"], photo:"/photos/a4.webp", thumb:"/photos/a4_thumb.webp" },
  { id:"a5", name:"Casco Viejo Walking Tour", category:"activity", icon:"🏛️", vibe:"Historic Walk", notes:"Self-guided ~2 km walk through Panama's UNESCO-listed historic quarter, flat cobblestone. Easter Sunday atmosphere: churches open, possible procession. Route: Plaza Herrera → Plaza de la Independencia (Metropolitan Cathedral) → Plaza Bolívar → Plaza de Francia → Paseo Esteban Huertas along the old defensive wall. Comfortable shoes for cobblestones. Modest dress for churches.", rec:"recommended", mapsRating:4.1, mapsReviews:"340", hours:"Best 8–11AM", address:"Plaza de la Independencia", tier:"curated", cost:"Free", tags:["history","walking","culture"], photo:"" },
  { id:"a6", name:"Monkey Island Boat Tour", category:"activity", icon:"🐒", vibe:"Wildlife & Canal", notes:"Cruise Gatun Lake alongside cargo ships on the Panama Canal. Visit monkey islands — capuchins, howlers, tamarins. Also toucans, herons, kingfishers, possibly crocodiles. Small group, ~4 hours including transport. Depart early (6:30–7:00 AM) from Gamboa for best wildlife. Book in advance — Panama Road Trips or Almiza Tours.", rec:"cantmiss", mapsRating:4.6, mapsReviews:"800", bookingUrl:"https://www.panamaroadtrips.com", hours:"AM departure, ~4 hours", address:"Gamboa", tier:"curated", cost:"$30–60/pp", tags:["nature","adventure","great-with-kids"], photo:"/photos/a6.webp", thumb:"/photos/a6_thumb.webp" },
  { id:"a8", name:"Panama Viejo Ruins", category:"activity", icon:"🏚️", vibe:"Historic Ruins", notes:"The original Panama City, destroyed by pirate Henry Morgan in 1671. UNESCO World Heritage Site. Outdoor walk through the ruins, ~45 min. Stone tower, cathedral remains, and a small museum. Good for a morning visit. Option for Monday or Tuesday.", rec:"worthit", mapsRating:4.3, mapsReviews:"4.5K", hours:"Tue–Sun 8:30AM–4:30PM", address:"Vía Cincuentenario", tier:"extended", cost:"$15 adults", tags:["history","walking"], photo:"/photos/a8.webp", thumb:"/photos/a8_thumb.webp" },
  { id:"a9", name:"Parque Kiwanis Walk", category:"wellness", icon:"🌿", vibe:"Park & Walk", notes:"Flat, shaded park perfect for a gentle late-afternoon walk. Easy and relaxed — a good first-day option while parents are still adjusting after the flight. No elevation, plenty of shade, nice green space.", rec:"worthit", mapsRating:4.0, mapsReviews:"120", hours:"Daily 6AM–8PM", address:"Clayton, near Ciudad del Saber", tier:"extended", cost:"Free", tags:["walking","great-with-kids"], photo:"/photos/a9.webp", thumb:"/photos/a9_thumb.webp" },
  { id:"a10", name:"City Orientation Drive", category:"custom", icon:"🚗", vibe:"Sightseeing Drive", notes:"Drive parents around the city: Cinta Costera waterfront, skyline views, Marbella area. Show them Karyna's ice cream shop. A gentle introduction to Panama City — no walking, just driving and pointing. Drop Kianu at school first.", rec:"worthit", mapsRating:0, mapsReviews:"", hours:"Morning", address:"Panama City", tier:"extended", cost:"Free", tags:[], photo:"/photos/a10.webp", thumb:"/photos/a10_thumb.webp" },

  // ═══ CULTURE ═══
  { id:"c1", name:"Biomuseo", category:"culture", icon:"🎨", vibe:"Biodiversity Museum", notes:"Frank Gehry's only building in Latin America, on the Amador Causeway. Eight galleries on Panama's biodiversity — indoor, air-conditioned. Botanical gardens outside with butterfly and hummingbird areas. $16/senior non-resident (with proof of age). Budget 2 hours. Pair with Punta Culebra nearby.", rec:"cantmiss", mapsRating:4.5, mapsReviews:"5.8K", hours:"Tue–Sun 10AM–4PM", address:"Amador Causeway", tier:"curated", cost:"$16/senior non-resident", tags:["indoor","culture","architecture"], photo:"/photos/c1.webp", thumb:"/photos/c1_thumb.webp" },
  { id:"c2", name:"Punta Culebra (Smithsonian)", category:"culture", icon:"🌊", vibe:"Marine & Wildlife", notes:"Smithsonian's marine exhibits, sloths, iguanas, butterfly dome (LepiDome), touch tank. Same Amador area as Biomuseo — do both. ~$8 entry, ~1 hour.", rec:"recommended", mapsRating:4.2, mapsReviews:"400", hours:"Tue–Sun 10AM–5PM", address:"Amador Causeway", tier:"curated", cost:"~$8", tags:["great-with-kids","indoor"], photo:"/photos/c2.webp", thumb:"/photos/c2_thumb.webp" },

  // ═══ EL VALLE DE ANTÓN ═══
  { id:"v1", name:"E-bike El Valle", category:"activity", icon:"🚲", vibe:"E-bike Exploring", notes:"Rent e-bikes and explore El Valle de Antón. Roads are flat and quiet — very Dutch-friendly. The perfect way to visit the butterfly haven, orchid nursery, and get around town. Rentals at Bodhi Hostel and other spots. Confirm availability, usually same-day okay.", rec:"cantmiss", mapsRating:0, mapsReviews:"", hours:"Daytime", address:"El Valle de Antón", tier:"curated", cost:"~$15–25/half day", tags:["adventure"], photo:"/photos/v1.webp", thumb:"/photos/v1_thumb.webp" },
  { id:"v2", name:"Butterfly Haven", category:"nature", icon:"🦋", vibe:"Butterfly Garden", notes:"El Mariposario — 23 butterfly species in a beautiful garden setting. Guided tour included. One of El Valle's highlights. Combine with the orchid nursery and e-bike exploring.", rec:"recommended", mapsRating:4.5, mapsReviews:"200", hours:"Daily 8AM–4PM", address:"El Valle de Antón", tier:"curated", cost:"$5", tags:["nature","great-with-kids"], photo:"/photos/v2.webp", thumb:"/photos/v2_thumb.webp" },
  { id:"v3", name:"APROVACA Orchid Nursery", category:"nature", icon:"🌺", vibe:"Orchid Garden", notes:"Panama's national flower is the Holy Ghost orchid — see it here along with hundreds of other species. A beautiful, peaceful visit. Quick stop on the e-bike circuit.", rec:"worthit", mapsRating:4.3, mapsReviews:"80", hours:"Daily 8AM–4PM", address:"El Valle de Antón", tier:"extended", cost:"$5", tags:["nature"], photo:"/photos/v3.webp", thumb:"/photos/v3_thumb.webp" },
  { id:"v4", name:"Cerro La Cruz Sunset", category:"activity", icon:"🌅", vibe:"Sunset Viewpoint", notes:"Drive up to the viewpoint for a full panoramic view of the entire valley and surrounding mountains — Pacific Ocean visible on clear days. One of the best sunset spots in the region. Park, walk 2–10 minutes. Higher viewpoint 250m further up has even more dramatic 360° views (short steep 100m walk). Bring a light jacket — wind picks up after 5 PM.", rec:"cantmiss", mapsRating:4.5, mapsReviews:"150", hours:"Best at sunset ~5PM", address:"Cerro La Cruz, El Valle", tier:"curated", cost:"Free", tags:["sunset","nature"], photo:"/photos/v4.webp", thumb:"/photos/v4_thumb.webp" },
  { id:"v5", name:"Cerro La Silla Hike", category:"activity", icon:"🥾", vibe:"Ridge Hike", notes:"Gorgeous grassy ridgeline hike with 360° views. Two peaks: La Cruz (cross) and La Virgen (statue). Walk as far as you like and turn around. $5 entry, opens 6:00 AM. Budget 1.5–2 hours. Completely exposed: hats, sunscreen, water essential. Outback handles the access road. Stretch option: La India Dormida (~4 miles, steep/rocky) — decide on the day based on energy.", rec:"cantmiss", mapsRating:4.6, mapsReviews:"300", hours:"Daily from 6AM", address:"Cerro La Silla, El Valle", tier:"curated", cost:"$5", tags:["adventure","nature"], photo:"/photos/v5.webp", thumb:"/photos/v5_thumb.webp" },
  { id:"v6", name:"Chorro El Macho", category:"activity", icon:"💦", vibe:"Waterfall & Swim", notes:"15–20 min walk across suspension bridges through jungle to a 35m waterfall. Natural swimming pool below the falls — spring-fed, cold, refreshing ($5 extra to swim). Bring swimwear! $5 entry. One of the highlights of El Valle.", rec:"cantmiss", mapsRating:4.4, mapsReviews:"500", hours:"Daily 7AM–5PM", address:"El Valle de Antón", tier:"curated", cost:"$5 entry + $5 swim", tags:["adventure","nature"], photo:"/photos/v6.webp", thumb:"/photos/v6_thumb.webp" },
  { id:"v7", name:"El Valle Hot Springs", category:"wellness", icon:"♨️", vibe:"Hot Springs", notes:"Four pools of different temperatures plus a mud facial. A relaxing way to wind down after a morning hike. $4 entry. Optional afternoon activity — or head back to El Nancito instead.", rec:"worthit", mapsRating:3.8, mapsReviews:"250", hours:"Daily 8AM–5PM", address:"El Valle de Antón", tier:"extended", cost:"$4", tags:["wellness"], photo:"/photos/v7.webp", thumb:"/photos/v7_thumb.webp" },
  { id:"v8", name:"El Nispero Zoo", category:"nature", icon:"🐸", vibe:"Zoo & Gardens", notes:"Animal rescue center, home to the famous golden frog (Panama's national animal). Good botanical garden too. $5 entry, 1–1.5 hours. Optional stop on the e-bike day.", rec:"worthit", mapsRating:4.1, mapsReviews:"180", hours:"Daily 7AM–5PM", address:"El Valle de Antón", tier:"extended", cost:"$5", tags:["nature","great-with-kids"], photo:"/photos/v8.webp", thumb:"/photos/v8_thumb.webp" },

  // ═══ HOME / PERSONAL ═══
  { id:"h1", name:"Airport Pickup", category:"home", icon:"✈️", vibe:"Arrival", notes:"Pick up parents at Tocumen International Airport. Drive to Ciudad del Saber (~40 min).", rec:"worthit", mapsRating:0, mapsReviews:"", hours:"Late afternoon", address:"Tocumen International Airport", tier:"extended", cost:"", tags:[], photo:"/photos/h1.webp", thumb:"/photos/h1_thumb.webp" },
  { id:"h2", name:"Settle In & Meet Django", category:"home", icon:"🐕", vibe:"Home Time", notes:"Arrive home in Ciudad del Saber. Light dinner at home. No agenda — let them decompress after the flight. Meet Django the dog.", rec:"worthit", mapsRating:0, mapsReviews:"", hours:"Evening", address:"Ciudad del Saber", tier:"extended", cost:"", tags:[], photo:"" },
  { id:"h3", name:"Rest / Home Time", category:"home", icon:"🏡", vibe:"Recovery", notes:"Rest at home. Stay out of the heat during midday. Garden, Django, relax. No pressure.", rec:"worthit", mapsRating:0, mapsReviews:"", hours:"", address:"Ciudad del Saber", tier:"extended", cost:"", tags:[], photo:"" },
  { id:"h4", name:"BBQ with Friends", category:"home", icon:"🍖", vibe:"Home BBQ", notes:"BBQ at home with friends. Kianu joins in the evening. A relaxed, social evening after a full day.", rec:"recommended", mapsRating:0, mapsReviews:"", hours:"Late afternoon / evening", address:"Home", tier:"extended", cost:"", tags:[], photo:"" },
  { id:"h5", name:"Farewell & Airport", category:"home", icon:"✈️", vibe:"Departure", notes:"Easy breakfast. Optional: Panama Viejo (if not done Monday), or a final walk around Ciudad del Saber. Afternoon drive to Tocumen. Farewell. ❤️", rec:"worthit", mapsRating:0, mapsReviews:"", hours:"Afternoon", address:"Tocumen International Airport", tier:"extended", cost:"", tags:[], photo:"/photos/h5.webp", thumb:"/photos/h5_thumb.webp" },
  { id:"h6", name:"Bejuco House Visit", category:"home", icon:"🏗️", vibe:"Family Visit", notes:"Quick stop in Bejuco on the way to El Valle to see where Karyna's parents are building their house. Easy detour right off the Pan-American Highway at the Matos de Mayán exit.", rec:"worthit", mapsRating:0, mapsReviews:"", hours:"Morning", address:"Bejuco, Coclé", tier:"extended", cost:"", tags:[], photo:"" },
  { id:"h7", name:"Chamé Beach & Family", category:"home", icon:"🏖️", vibe:"Beach & Family", notes:"Lunch in Chamé with Karyna and her family. Beach time — relax, wade, quality time. Then drive back to Panama City. Home by evening.", rec:"recommended", mapsRating:0, mapsReviews:"", hours:"Midday–afternoon", address:"Chamé", tier:"extended", cost:"", tags:[], photo:"/photos/h7.webp", thumb:"/photos/h7_thumb.webp" },
  { id:"h8", name:"Kianu Time", category:"home", icon:"👶", vibe:"Family Time", notes:"Pick up Kianu from school. Spend time together at home. Relaxed afternoon — no pressure, just family.", rec:"worthit", mapsRating:0, mapsReviews:"", hours:"Afternoon", address:"Home", tier:"extended", cost:"", tags:[], photo:"" },

  // ═══ ADDITIONAL OPTIONS (not in current itinerary but good alternatives) ═══
  { id:"d3", name:"CasaCasco Rooftop", category:"nightlife", icon:"🌇", vibe:"Rooftop Bar", notes:"Stunning rooftop in Casco Viejo with panoramic views. Come at sunset. Cocktails are decent, scenery is the star.", rec:"recommended", mapsRating:4.3, mapsReviews:"1.5K", hours:"Daily 4PM–12AM", address:"Av. A, Casco Viejo", tier:"curated", cost:"$12–18/cocktail", tags:["sunset"], photo:"https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=600&h=400&fit=crop" },
  { id:"d4", name:"Boticario", category:"nightlife", icon:"🧪", vibe:"Speakeasy", notes:"Speakeasy-style cocktail bar in El Cangrejo with an apothecary theme. Intimate space, serious craft cocktails.", rec:"worthit", mapsRating:4.5, mapsReviews:"120", hours:"Wed–Sat 6PM–1AM", address:"El Cangrejo", tier:"extended", cost:"$12–16/cocktail", tags:["date-night"], photo:"https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=600&h=400&fit=crop" },
  { id:"a3", name:"Cerro Ancón Hike", category:"activity", icon:"🥾", vibe:"City Hike", notes:"Short hike to the highest point in Panama City. 360° panoramic views. Paved trail, 30–45 minutes up. Go early for wildlife (toucans, sloths).", rec:"recommended", mapsRating:4.3, mapsReviews:"2.4K", hours:"Daily 6AM–5PM", address:"Cerro Ancón", tier:"curated", cost:"Free", tags:["nature","walking"], photo:"/photos/v5.webp", thumb:"/photos/v5_thumb.webp" },
  { id:"w1", name:"Cinta Costera Walk", category:"wellness", icon:"🌅", vibe:"Waterfront Walk", notes:"Beautiful waterfront promenade along the bay. Perfect for an evening stroll at sunset.", rec:"worthit", mapsRating:4.0, mapsReviews:"950", hours:"Open 24hrs", address:"Cinta Costera", tier:"extended", cost:"Free", tags:["walking","sunset"], photo:"https://images.unsplash.com/photo-1505459668311-8dfac7952bf0?w=600&h=400&fit=crop" },
  { id:"c3", name:"Bahá'í Temple", category:"culture", icon:"🕊️", vibe:"Spiritual Landmark", notes:"One of only eight Bahá'í Houses of Worship in the world. Egg-shaped architecture, sweeping views. Peaceful gardens. 20 min from city center.", rec:"worthit", mapsRating:4.6, mapsReviews:"1.2K", hours:"Daily 9AM–6PM", address:"Las Cumbres", tier:"extended", cost:"Free", tags:["nature"], photo:"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=400&fit=crop" },
];

// ═══ EVENTS — time-bound cultural happenings during the trip ═══
const EVENTS = [
  { id:"ev1", name:"Semana Santa — Palm Sunday", date:"2026-03-29", endDate:"2026-03-29", icon:"⛪", vibe:"Religious Procession", category:"event", notes:"Palm Sunday marks the beginning of Holy Week (Semana Santa), one of the most important cultural events in Panama. In Casco Viejo and across the city, churches hold special masses and palm-weaving ceremonies. The streets take on a festive, reverent atmosphere. A beautiful introduction to Panamanian religious tradition.", address:"Casco Viejo churches", cost:"Free", photo:"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=400&fit=crop" },
  { id:"ev2", name:"Panama International Film Festival", date:"2026-03-29", endDate:"2026-03-29", icon:"🎬", vibe:"Film Festival", category:"event", notes:"The final day of IFF Panama, one of Central America's most important film festivals. Screenings of Latin American and international independent films at venues across Panama City. Check the schedule for any public screenings or closing events — some are free. A great way to experience Panama's growing creative scene.", address:"Various venues, Panama City", cost:"$5–15/screening", bookingUrl:"https://iffpanama.org", photo:"https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&h=400&fit=crop" },
  { id:"ev3", name:"Holy Week Processions", date:"2026-03-30", endDate:"2026-04-04", icon:"🕯️", vibe:"Cultural Tradition", category:"event", notes:"Throughout Holy Week, Panama comes alive with religious processions, especially in Casco Viejo, La Villa de Los Santos, and smaller towns on the Azuero Peninsula. Elaborate floats, traditional music, purple-robed penitents, and street celebrations blend Catholic tradition with indigenous and Afro-Panamanian cultural elements. The most dramatic processions are on Holy Thursday and Good Friday. Even if you're not religious, it's a powerful cultural experience.", address:"Casco Viejo & citywide", cost:"Free", photo:"https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?w=600&h=400&fit=crop" },
  { id:"ev4", name:"Good Friday", date:"2026-04-03", endDate:"2026-04-03", icon:"✝️", vibe:"Public Holiday", category:"event", notes:"Good Friday is a national holiday in Panama. Most businesses close, and the day is marked by solemn processions through Casco Viejo and other neighborhoods. The largest procession features the Santo Sepulcro (Holy Sepulchre) carried through the streets. Many Panamanians travel to beach towns for the long weekend, so expect the city to be quieter and beach areas busier. Some restaurants may be closed — plan accordingly.", address:"Citywide", cost:"Free", photo:"" },
  { id:"ev5", name:"Easter Sunday", date:"2026-04-05", endDate:"2026-04-05", icon:"🐣", vibe:"Public Holiday", category:"event", notes:"Easter Sunday celebrations across Panama City. Churches hold special sunrise services, and families gather for large meals. The mood shifts from the solemnity of Good Friday to celebration. Many restaurants reopen with special Easter menus. The long weekend means beaches and day trip destinations will be busy — plan accordingly or enjoy a quieter city.", address:"Citywide", cost:"Free", photo:"" },
  { id:"ev6", name:"Live Jazz at Danilo's", date:"2026-03-29", endDate:"2026-04-07", icon:"🎷", vibe:"Live Music", category:"event", notes:"Danilo's Jazz Club in Casco Viejo hosts live jazz performances most evenings. The intimate venue features local and visiting musicians playing Latin jazz, bossa nova, and fusion. Great cocktails and a sophisticated atmosphere. Check their Instagram for the weekly lineup — shows typically start around 8-9 PM. Perfect for a post-dinner nightcap.", address:"Casco Viejo", cost:"$10–20 cover", hours:"Thu–Sat 8PM–12AM", photo:"https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=600&h=400&fit=crop" },
  { id:"ev7", name:"Casco Viejo Art Walk", date:"2026-04-01", endDate:"2026-04-01", icon:"🎨", vibe:"Art & Gallery Night", category:"event", notes:"The first Wednesday of each month, galleries and studios in Casco Viejo open their doors for a free evening art walk. Local and international artists showcase paintings, photography, sculpture, and mixed media. The walk typically covers 6-8 galleries within easy walking distance. Wine and snacks are often served. It's a great way to explore the neighborhood's creative side and meet local artists.", address:"Casco Viejo galleries", cost:"Free", hours:"6PM–9PM", photo:"https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?w=600&h=400&fit=crop" },
  { id:"ev8", name:"Farmers & Artisan Market", date:"2026-03-29", endDate:"2026-04-07", icon:"🧺", vibe:"Weekend Market", category:"event", notes:"Every Saturday and Sunday morning, local farmers and artisans set up at the Mercado de San Felipe Neri in Casco Viejo. Fresh tropical fruits, local honey, artisan chocolate, handmade crafts, and prepared foods. Great for a leisurely morning browse. Arrive early (8-9 AM) for the best selection. A wonderful way to connect with local producers and take home some authentic Panamanian products.", address:"Plaza San Felipe Neri, Casco Viejo", cost:"Free entry", hours:"Sat–Sun 8AM–1PM", photo:"https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=600&h=400&fit=crop" },
];

const TRIP = {
  name: "Panama 2026",
  subtitle: "Visit Pa & Ma",
  startDate: "2026-03-29",
  dayCount: 10,
  brief: "Three blocks: city orientation + Panama Canal, El Valle de Antón nature escape, and Easter weekend in Panama City. Paced for early-70s parents — active but not exhausting.",
  info: {
    climate: "April = end of dry season, 32–34°C in Panama City. Outdoor activities before 10 AM or after 3:30 PM. Midday = indoor activities or rest. El Valle de Antón is noticeably cooler at 600m — the one exception.",
    packing: ["Light breathable clothing", "Reef-safe sunscreen SPF 50+", "Comfortable walking shoes", "Light rain jacket (El Valle evenings)", "Hat and sunglasses", "Insect repellent (DEET)", "Light layer for AC (restaurants are cold)", "Swimwear (Chorro El Macho waterfall)", "Reusable water bottle"],
    tips: ["Tap water is safe in Panama City", "USD is the currency — no need to exchange", "Uber works well and is very affordable", "Tip 10–15% at restaurants", "Spanish helps but English is common in tourist areas", "AC is very cold indoors — carry a light layer", "Gas up before leaving the Pan-American for rural areas", "No gas stations on the Bejuco-Sorá road"],
    getting_there: "Tocumen International Airport (PTY) is ~40 min from Ciudad del Saber. Chris will pick you up. SIM cards available at the airport — Claro or Tigo recommended, ~$10 for 5GB.",
    getting_around: "Chris drives — you're in the Outback, it handles all roads including El Valle access roads and Cerro La Silla trailhead. Uber is the backup option in the city — cheap and reliable. The Metro ($0.35/ride) covers key corridors.",
    safety: "Panama City is generally safe for tourists, especially in Casco Viejo, the banking district, and tourist areas. Use normal precautions — don't flash valuables. Avoid Curundú and El Chorrillo neighborhoods. The tourist police are present in Casco Viejo.",
    emergency: "Emergency: 911 · Tourist police: 211-3654 · Nearest hospital: Hospital Nacional (10 min from Ciudad del Saber)",
    easter: "Public holidays: Maundy Thursday (Apr 2), Good Friday (Apr 3), Holy Saturday (Apr 4). Most Panamanians leave the city — lighter traffic, calmer atmosphere. Confirm restaurant/attraction hours closer to the date. Casco Viejo will be lively with religious events.",
    bookings: "Monkey Island tour (Tue Mar 31): Book in advance — Panama Road Trips or Almiza Tours, AM slot. Saturday dinner (Sat Apr 4): Reserve now at Maito — Easter weekend = limited. Monday dinner (Mon Apr 6): La Pulpería — reserve. E-bike rental El Valle (Wed Apr 1): Confirm availability.",
  },
};

const DAY_META = {
  "2026-03-29": { location: "Panama City", theme: "Arrival", icon: "✈️", brief: "Welcome to Panama! Settling in at Ciudad del Saber and meeting Django." },
  "2026-03-30": { location: "Panama City", theme: "City Orientation", icon: "🚗", brief: "Easy first day — gentle drive around the city, ice cream, and a park stroll." },
  "2026-03-31": { location: "Gamboa → Miraflores", theme: "Canal Day ⭐", icon: "🚢", brief: "The big one — monkeys on Gatun Lake, lunch on the river, and ships at Miraflores." },
  "2026-04-01": { location: "Panama City → El Valle", theme: "Mountain Escape", icon: "⛰️", brief: "Leaving the city behind — e-bikes, butterflies, orchids, and a sunset viewpoint." },
  "2026-04-02": { location: "El Valle de Antón", theme: "Hike & Waterfall ⭐", icon: "🥾", brief: "Active morning on a stunning ridge, then cooling off under a jungle waterfall." },
  "2026-04-03": { location: "El Valle → Chamé → Panama City", theme: "Beach & Family", icon: "🏖️", brief: "Heading back to the coast — beach time and lunch with Karyna's family in Chamé." },
  "2026-04-04": { location: "Panama City", theme: "Recovery + Culture", icon: "🎨", brief: "Taking it easy after a few days on the road — Gehry's Biomuseo and a splurge dinner." },
  "2026-04-05": { location: "Casco Viejo", theme: "Easter Sunday ⭐", icon: "🏛️", brief: "Walking through history on Easter morning, fresh ceviche, then a BBQ with friends." },
  "2026-04-06": { location: "Panama City", theme: "Flexible Day", icon: "👶", brief: "No pressure — Kianu joins, neighbourhood lunch, maybe a rainforest walk if the energy is there." },
  "2026-04-07": { location: "Panama City", theme: "Departure", icon: "✈️", brief: "Last morning together. Optional ruins or a quiet walk, then farewell at the airport." },
};

// New calendar model — ordered array per day with times and travel
const INIT_CAL = {
  "2026-03-29": [
    { modId: "h1", startTime: "16:00", duration: 60, travelNote: "" },
    { modId: "h2", startTime: "18:00", duration: 120, travelMins: 40, travelNote: "40 min drive from airport" },
  ],
  "2026-03-30": [
    { modId: "a10", startTime: "08:30", duration: 120, travelNote: "" },
    { modId: "f2", startTime: "11:00", duration: 30, travelMins: 10, travelNote: "" },
    { modId: "h3", startTime: "12:00", duration: 180, travelNote: "" },
    { modId: "a9", startTime: "16:30", duration: 90, travelMins: 15, travelNote: "" },
  ],
  "2026-03-31": [
    { modId: "a6", startTime: "06:30", duration: 240, travelMins: 45, travelNote: "45 min drive to Gamboa" },
    { modId: "f9", startTime: "12:00", duration: 90, travelNote: "" },
    { modId: "a1", startTime: "14:30", duration: 120, travelMins: 30, travelNote: "30 min to Miraflores" },
    { modId: "h3", startTime: "18:00", duration: 120, travelMins: 25, travelNote: "" },
  ],
  "2026-04-01": [
    { modId: "h6", startTime: "07:30", duration: 60, travelMins: 90, travelNote: "~1.5 hrs on Pan-American Hwy" },
    { modId: "v1", startTime: "10:30", duration: 120, travelMins: 60, travelNote: "Continue to El Valle" },
    { modId: "v2", startTime: "13:00", duration: 60, travelNote: "" },
    { modId: "v3", startTime: "14:30", duration: 45, travelMins: 5, travelNote: "" },
    { modId: "v4", startTime: "17:00", duration: 60, travelMins: 10, travelNote: "" },
    { modId: "h3", startTime: "18:30", duration: 120, travelMins: 30, travelNote: "30 min to El Nancito Airbnb" },
  ],
  "2026-04-02": [
    { modId: "v5", startTime: "06:00", duration: 120, travelMins: 20, travelNote: "Drive to trailhead" },
    { modId: "v6", startTime: "10:00", duration: 120, travelMins: 15, travelNote: "" },
    { modId: "v7", startTime: "14:00", duration: 90, travelMins: 10, travelNote: "" },
  ],
  "2026-04-03": [
    { modId: "h7", startTime: "09:00", duration: 300, travelMins: 60, travelNote: "Drive to Chamé coast" },
    { modId: "h3", startTime: "17:00", duration: 120, travelMins: 75, travelNote: "~1.25 hrs back to Panama City" },
  ],
  "2026-04-04": [
    { modId: "f4", startTime: "08:30", duration: 90, travelNote: "" },
    { modId: "c1", startTime: "10:30", duration: 120, travelMins: 15, travelNote: "Drive to Amador" },
    { modId: "c2", startTime: "13:30", duration: 60, travelMins: 5, travelNote: "" },
    { modId: "a2", startTime: "15:00", duration: 60, travelNote: "" },
    { modId: "f10", startTime: "19:00", duration: 150, travelMins: 20, travelNote: "" },
  ],
  "2026-04-05": [
    { modId: "a5", startTime: "08:00", duration: 150, travelNote: "" },
    { modId: "f7", startTime: "11:00", duration: 60, travelNote: "" },
    { modId: "h3", startTime: "13:00", duration: 240, travelNote: "" },
    { modId: "h4", startTime: "17:00", duration: 180, travelNote: "" },
  ],
  "2026-04-06": [
    { modId: "h3", startTime: "08:00", duration: 180, travelNote: "" },
    { modId: "h8", startTime: "12:00", duration: 60, travelNote: "" },
    { modId: "f5", startTime: "12:30", duration: 90, travelMins: 10, travelNote: "" },
    { modId: "f2", startTime: "14:30", duration: 30, travelMins: 5, travelNote: "" },
    { modId: "a4", startTime: "16:00", duration: 90, travelMins: 15, travelNote: "Optional" },
    { modId: "f3", startTime: "19:00", duration: 120, travelMins: 15, travelNote: "" },
  ],
  "2026-04-07": [
    { modId: "h3", startTime: "08:00", duration: 180, travelNote: "" },
    { modId: "a8", startTime: "09:00", duration: 60, travelMins: 15, travelNote: "Optional" },
    { modId: "h5", startTime: "14:00", duration: 120, travelMins: 30, travelNote: "Drive to Tocumen" },
  ],
};




function mkDays(sd, c) {
  const days = [], d = new Date(sd + "T12:00:00");
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
// Swipeable bottom sheet wrapper — visually follows finger on drag down
const SwipeSheet = ({ onClose, children, zIndex = 300, maxH = "85vh" }) => {
  const [offset, setOffset] = useState(0);
  const [dragging, setDragging] = useState(false);
  const startY = useRef(null);

  // Lock body scroll when sheet is open
  useEffect(() => {
    const orig = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = orig; };
  }, []);

  const onTS = e => { startY.current = e.touches[0].clientY; setDragging(true); };
  const onTM = e => {
    if (startY.current === null) return;
    const dy = Math.max(0, e.touches[0].clientY - startY.current);
    setOffset(dy);
  };
  const onTE = () => {
    setDragging(false);
    if (offset > 120) { onClose(); }
    else { setOffset(0); }
    startY.current = null;
  };

  return (
    <div
      style={{ position: "fixed", inset: 0, background: `rgba(0,0,0,${Math.max(0, 0.5 - offset * 0.002)})`, zIndex, display: "flex", alignItems: "flex-end", justifyContent: "center", touchAction: "none" }}
      onClick={onClose}
      onTouchMove={e => e.preventDefault()}
    >
      <div onClick={e => e.stopPropagation()} onTouchMove={e => e.stopPropagation()} style={{
        maxWidth: 430, width: "100%", background: "#fff", borderRadius: "24px 24px 0 0",
        maxHeight: maxH, display: "flex", flexDirection: "column",
        animation: !dragging && offset === 0 ? "su 0.25s ease-out" : "none",
        transform: `translateY(${offset}px)`,
        transition: dragging ? "none" : "transform 0.25s ease-out",
        touchAction: "pan-y",
      }}>
        {/* Handle bar */}
        <div
          onTouchStart={onTS} onTouchMove={e => { e.stopPropagation(); onTM(e); }} onTouchEnd={onTE}
          style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "14px 0 10px", cursor: "grab", userSelect: "none", touchAction: "none" }}
        >
          <div style={{ width: 44, height: 5, background: "#bbb", borderRadius: 3 }} />
        </div>
        {children}
      </div>
    </div>
  );
};

// Legacy compat — some components still use DragHandle directly
const DragHandle = ({ onClose }) => {
  const sy = useRef(null);
  return (
    <div
      onTouchStart={e => { sy.current = e.touches[0].clientY; e.preventDefault(); }}
      onTouchMove={e => { if (sy.current !== null && e.touches[0].clientY - sy.current > 40) { onClose(); sy.current = null; } }}
      onTouchEnd={() => { sy.current = null; }}
      style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "14px 0 10px", cursor: "grab", userSelect: "none", touchAction: "none" }}
    >
      <div style={{ width: 44, height: 5, background: "#bbb", borderRadius: 3 }} />
    </div>
  );
};

// ═══ EDIT EXPERIENCE MODAL (Admin) ═══
const EMOJI_PICKS = ["🍽️","🍦","🍹","🥐","🐙","🐟","🏆","🍷","🍸","🌇","🧪","🚢","🚲","🌳","🏛️","🐒","🥾","🏚️","🌿","🎨","🌊","🦋","🌺","🌅","💦","♨️","🐸","✈️","🐕","🏡","🍖","🏗️","🏖️","👶","🚗","📌","🎪","⛪","🎬","🕯️","🎷","🧺"];

const EditExperience = ({ mod, onSave, onDelete, onClose }) => {
  const isNew = !mod;
  const [data, setData] = useState(mod ? { ...mod } : { id: "x" + Date.now(), name: "", category: "activity", icon: "📌", vibe: "", notes: "", photo: "", thumb: "", rec: "worthit", mapsRating: 0, mapsReviews: "", hours: "", address: "", cost: "", tier: "extended", tags: [], bookingUrl: "" });
  const [showEmoji, setShowEmoji] = useState(false);
  const u = (k, v) => setData(p => ({ ...p, [k]: v }));
  const IS = { width: "100%", boxSizing: "border-box", padding: "10px 14px", borderRadius: 10, border: "1.5px solid #e0e0e0", fontSize: 13, fontFamily: "inherit" };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 350, display: "flex", alignItems: "flex-end", justifyContent: "center" }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ maxWidth: 430, width: "100%", background: "#fff", borderRadius: "24px 24px 0 0", maxHeight: "90vh", display: "flex", flexDirection: "column", animation: "su 0.25s ease-out" }}>
        <DragHandle onClose={onClose} />
        <div style={{ padding: "4px 20px 10px", borderBottom: "1px solid #f0f0f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>{isNew ? "➕ New Experience" : "✏️ Edit Experience"}</h3>
          <button onClick={onClose} style={{ background: "#f0f0f0", border: "none", borderRadius: 10, padding: "6px 12px", fontSize: 13, fontWeight: 600, color: "#888", cursor: "pointer" }}>Close</button>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "12px 20px 24px" }}>
          {/* Icon + Name row */}
          <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
            <div style={{ position: "relative" }}>
              <button onClick={() => setShowEmoji(!showEmoji)} style={{ width: 48, height: 48, borderRadius: 12, border: "1.5px solid #e0e0e0", background: "#FAFAF8", fontSize: 24, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>{data.icon || "📌"}</button>
              {showEmoji && (
                <div style={{ position: "absolute", top: 52, left: 0, background: "#fff", border: "1.5px solid #e0e0e0", borderRadius: 12, padding: 8, zIndex: 10, boxShadow: "0 4px 16px rgba(0,0,0,0.15)", display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, width: 240 }}>
                  {EMOJI_PICKS.map(e => <button key={e} onClick={() => { u("icon", e); setShowEmoji(false); }} style={{ fontSize: 20, background: "none", border: "none", cursor: "pointer", padding: 4, borderRadius: 6 }}>{e}</button>)}
                </div>
              )}
            </div>
            <input value={data.name} onChange={e => u("name", e.target.value)} placeholder="Experience name" style={{ ...IS, flex: 1 }} />
          </div>
          {/* Vibe + Category */}
          <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
            <input value={data.vibe} onChange={e => u("vibe", e.target.value)} placeholder="Vibe (e.g. Cocktail Bar)" style={{ ...IS, flex: 1 }} />
            <select value={data.category} onChange={e => u("category", e.target.value)} style={{ ...IS, flex: 1 }}>
              {CATS.map(c => <option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
            </select>
          </div>
          {/* Description */}
          <textarea value={data.notes} onChange={e => u("notes", e.target.value)} placeholder="Description..." rows={4} style={{ ...IS, marginBottom: 10, resize: "vertical" }} />
          {/* Photo URL */}
          <input value={data.photo} onChange={e => u("photo", e.target.value)} placeholder="Photo URL (e.g. /photos/f1.webp)" style={{ ...IS, marginBottom: 6 }} />
          <input value={data.thumb || ""} onChange={e => u("thumb", e.target.value)} placeholder="Thumbnail URL (e.g. /photos/f1_thumb.webp)" style={{ ...IS, marginBottom: 10 }} />
          {/* Practical info */}
          <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
            <input value={data.hours || ""} onChange={e => u("hours", e.target.value)} placeholder="Hours" style={{ ...IS, flex: 1 }} />
            <input value={data.cost || ""} onChange={e => u("cost", e.target.value)} placeholder="Cost" style={{ ...IS, flex: 1 }} />
          </div>
          <input value={data.address || ""} onChange={e => u("address", e.target.value)} placeholder="Address" style={{ ...IS, marginBottom: 10 }} />
          <input value={data.bookingUrl || ""} onChange={e => u("bookingUrl", e.target.value)} placeholder="Booking URL (optional)" style={{ ...IS, marginBottom: 10 }} />
          {/* Rating */}
          <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
            <input type="number" step="0.1" value={data.mapsRating || ""} onChange={e => u("mapsRating", parseFloat(e.target.value) || 0)} placeholder="Google rating" style={{ ...IS, flex: 1 }} />
            <input value={data.mapsReviews || ""} onChange={e => u("mapsReviews", e.target.value)} placeholder="Reviews count" style={{ ...IS, flex: 1 }} />
          </div>
          {/* Tier */}
          <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
            {["curated", "extended"].map(t => (
              <button key={t} onClick={() => u("tier", t)} style={{ flex: 1, padding: 10, borderRadius: 10, border: "none", background: data.tier === t ? "#0B4D3B" : "#f0f0f0", color: data.tier === t ? "#fff" : "#888", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>{t === "curated" ? "⭐ Chris's Pick" : "📋 Extended"}</button>
            ))}
          </div>
          {/* Save / Delete */}
          <button disabled={!data.name.trim()} onClick={() => data.name.trim() && onSave(data)} style={{ width: "100%", padding: 14, borderRadius: 14, border: "none", background: data.name.trim() ? "#0B4D3B" : "#ccc", color: "#fff", fontSize: 15, fontWeight: 700, cursor: data.name.trim() ? "pointer" : "default", marginBottom: 8 }}>💾 Save</button>
          {onDelete && mod && <button onClick={() => { if (window.confirm("Delete this experience?")) onDelete(mod.id); }} style={{ width: "100%", padding: 12, borderRadius: 12, border: "1.5px solid #FFCDD2", background: "#FFF5F5", color: "#E53935", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>🗑️ Delete Experience</button>}
        </div>
      </div>
    </div>
  );
};
const EditModal = EditExperience; // alias for Explore component

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
  <SwipeSheet onClose={onClose} zIndex={300} maxH="85vh">
      <div style={{ padding: "4px 20px 14px", borderBottom: "1px solid #f0f0f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>💡 Practical Info</h3>
        <button onClick={onClose} style={{ background: "#f0f0f0", border: "none", borderRadius: 10, padding: "6px 12px", fontSize: 13, fontWeight: 600, color: "#888", cursor: "pointer" }}>Close</button>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px 24px" }}>
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#E8843C", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>🌡️ Climate</div>
          <div style={{ fontSize: 13, color: "#555", lineHeight: 1.6, background: "#FFF8F0", borderRadius: 12, padding: "12px 16px" }}>{info.climate}</div>
        </div>
        {info.getting_there && <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#9B51E0", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>✈️ Getting There</div>
          <div style={{ fontSize: 13, color: "#555", lineHeight: 1.6, background: "#F5F0FF", borderRadius: 12, padding: "12px 16px" }}>{info.getting_there}</div>
        </div>}
        {info.getting_around && <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#2D9CDB", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>🚗 Getting Around</div>
          <div style={{ fontSize: 13, color: "#555", lineHeight: 1.6, background: "#F0F7FF", borderRadius: 12, padding: "12px 16px" }}>{info.getting_around}</div>
        </div>}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#6FCF97", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>🎒 Packing</div>
          <div style={{ background: "#F0FFF4", borderRadius: 12, padding: "12px 16px" }}>
            {info.packing.map((p, i) => <div key={i} style={{ fontSize: 13, color: "#555", padding: "3px 0", display: "flex", gap: 8 }}><span style={{ color: "#6FCF97" }}>✓</span>{p}</div>)}
          </div>
        </div>
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#F2994A", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>💡 Tips</div>
          <div style={{ background: "#FFF8F0", borderRadius: 12, padding: "12px 16px" }}>
            {info.tips.map((t, i) => <div key={i} style={{ fontSize: 13, color: "#555", padding: "3px 0", lineHeight: 1.5, display: "flex", gap: 8 }}><span style={{ color: "#F2994A", flexShrink: 0 }}>•</span>{t}</div>)}
          </div>
        </div>
        {info.safety && <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#546E7A", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>🛡️ Safety</div>
          <div style={{ fontSize: 13, color: "#555", lineHeight: 1.6, background: "#F5F5F5", borderRadius: 12, padding: "12px 16px" }}>{info.safety}</div>
        </div>}
        {info.easter && <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#9B51E0", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>⛪ Easter / Semana Santa</div>
          <div style={{ fontSize: 13, color: "#555", lineHeight: 1.6, background: "#F5F0FF", borderRadius: 12, padding: "12px 16px" }}>{info.easter}</div>
        </div>}
        {info.bookings && <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#E53935", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>📋 Bookings Needed</div>
          <div style={{ fontSize: 13, color: "#555", lineHeight: 1.6, background: "#FFF5F5", borderRadius: 12, padding: "12px 16px" }}>{info.bookings}</div>
        </div>}
        <div style={{ background: "#FFF0F0", borderRadius: 12, padding: "12px 16px", fontSize: 12, color: "#D44", fontWeight: 600 }}>🚨 {info.emergency}</div>
      </div>
  </SwipeSheet>
);

// ═══ OVERVIEW ═══
// Cycling image slider for About Panama hero
const PanamaSlider = ({ photos }) => {
  const [idx, sIdx] = useState(0);
  useEffect(() => {
    if (photos.length <= 1) return;
    const t = setInterval(() => sIdx(i => (i + 1) % photos.length), 4000);
    return () => clearInterval(t);
  }, [photos.length]);
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      {photos.map((p, i) => (
        <img key={i} src={p} alt="" style={{
          position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover",
          opacity: i === idx ? 1 : 0, transition: "opacity 1.2s ease-in-out",
        }} />
      ))}
    </div>
  );
};

const Overview = ({ days, occ, mods, cal, onClose, onJump, trip }) => {
  const totalItems = Object.values(cal).reduce((n, items) => n + (Array.isArray(items) ? items.length : 0), 0);
  const plannedDays = days.filter(d => (cal[d.date] || []).length > 0).length;
    const fmtTime = (t) => { if (!t) return ""; const [h,m] = t.split(":").map(Number); const ap = h>=12?"PM":"AM"; const h12=h>12?h-12:h===0?12:h; return m>0?`${h12}:${m.toString().padStart(2,"0")} ${ap}`:`${h12} ${ap}`; };
  const fmtDur = (m) => { if(!m)return""; const h=Math.floor(m/60); const r=m%60; if(h&&r)return`${h}h${r}m`; if(h)return`${h}h`; return`${r}m`; };

  return (
  <SwipeSheet onClose={onClose} zIndex={300} maxH="92vh">
      <div style={{ padding: "4px 20px 10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "#888" }}>Trip Overview</h3>
        <button onClick={onClose} style={{ background: "#f0f0f0", border: "none", borderRadius: 10, padding: "6px 12px", fontSize: 13, fontWeight: 600, color: "#888", cursor: "pointer" }}>Close</button>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "0 16px 30px" }}>
        {/* Hero header */}
        <div style={{ textAlign: "center", padding: "10px 0 16px" }}>
          <div style={{ fontSize: 28, fontWeight: 900, fontFamily: "'Playfair Display',Georgia,serif", color: "#1B3B32" }}>{trip?.name || "Panama 2026"}</div>
          <div style={{ fontSize: 13, color: "#888", marginTop: 3 }}>{trip?.subtitle || ""}</div>
          <div style={{ fontSize: 11, color: "#aaa", marginTop: 2 }}>📅 {days[0]?.full} — {days[days.length-1]?.full}</div>
        </div>
        {/* Stats row */}
        <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
          <div style={{ flex: 1, background: "#F7F6F3", borderRadius: 10, padding: "10px 8px", textAlign: "center" }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: "#0B4D3B" }}>{plannedDays}<span style={{ fontSize: 11, fontWeight: 600, color: "#aaa" }}>/{days.length}</span></div>
            <div style={{ fontSize: 9, fontWeight: 600, color: "#999" }}>days planned</div>
          </div>
          <div style={{ flex: 1, background: "#F7F6F3", borderRadius: 10, padding: "10px 8px", textAlign: "center" }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: "#2D9CDB" }}>{totalItems}</div>
            <div style={{ fontSize: 9, fontWeight: 600, color: "#999" }}>activities</div>
          </div>
          <div style={{ flex: 1, background: "#F7F6F3", borderRadius: 10, padding: "10px 8px", textAlign: "center" }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: "#E8843C" }}>{mods.filter(m => m.rec === "cantmiss").length}</div>
            <div style={{ fontSize: 9, fontWeight: 600, color: "#999" }}>must-sees</div>
          </div>
        </div>
        {/* Day-by-day timeline */}
        {days.map((day, di) => {
          const items = cal[day.date] || [];
          const meta = DAY_META[day.date] || {};
          // Find best photo for this day — first item with a photo
          const heroMod = items.map(item => mods.find(m => m.id === item.modId)).find(m => m && m.photo);
          return (
            <div key={day.date} style={{ marginBottom: 14 }}>
              <button onClick={() => { onJump(di); onClose(); }} style={{ width: "100%", background: "#1B3B32", borderRadius: 12, color: "#fff", marginBottom: 6, border: "none", cursor: "pointer", textAlign: "left", position: "relative", overflow: "hidden", display: "flex", minHeight: 76 }}>
                {/* Photo strip on right */}
                {heroMod && <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: "28%", overflow: "hidden" }}>
                  <img src={heroMod.photo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, #1B3B32 0%, rgba(27,59,50,0.3) 60%, transparent 100%)" }} />
                </div>}
                {/* Text content */}
                <div style={{ flex: 1, padding: "10px 14px", position: "relative", paddingRight: heroMod ? "30%" : 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <div style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.45)", textTransform: "uppercase", letterSpacing: 1 }}>Day {day.num} · {day.wd}</div>
                      <div style={{ fontSize: 15, fontWeight: 800, fontFamily: "'Playfair Display',Georgia,serif", marginTop: 2 }}>{meta.icon} {meta.theme}</div>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <div style={{ fontSize: 16, fontWeight: 800, lineHeight: 1 }}>{day.md.split(" ")[1]}</div>
                      <div style={{ fontSize: 9, fontWeight: 600, color: "rgba(255,255,255,0.5)" }}>{day.md.split(" ")[0]}</div>
                    </div>
                  </div>
                  {meta.location && <div style={{ fontSize: 9, color: "rgba(255,255,255,0.5)", marginTop: 3 }}>📍 {meta.location} · {items.length} {items.length === 1 ? "stop" : "stops"}</div>}
                </div>
              </button>
              {items.length === 0 && <div style={{ fontSize: 11, color: "#ccc", padding: "2px 14px" }}>Free day</div>}
              {items.map((item, ii) => {
                const mod = mods.find(m => m.id === item.modId);
                if (!mod) return null;
                const ct = CATS.find(c => c.id === mod.category);
                return (
                  <div key={ii} style={{ display: "flex", gap: 8, padding: "3px 4px", alignItems: "center" }}>
                    <div style={{ width: 44, flexShrink: 0, textAlign: "right" }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: "#555" }}>{fmtTime(item.startTime)}</span>
                    </div>
                    <div style={{ width: 3, flexShrink: 0, background: ct?.color || "#ddd", borderRadius: 2, alignSelf: "stretch", minHeight: 20 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ fontSize: 12, fontWeight: 700 }}>{mod.icon || ct?.icon} {mod.name}</span>
                      {item.duration > 0 && <span style={{ fontSize: 9, color: "#aaa", marginLeft: 6 }}>{fmtDur(item.duration)}</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
  </SwipeSheet>
  );
};

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
  const hasSeenSplash = typeof window !== "undefined" && localStorage.getItem("tb_splash_seen");
  const [splashPhase, setSplashPhase] = useState(hasSeenSplash ? "done" : "in");
  const bgPhotos = mods.filter(m => m.photo && m.tier === "curated").map(m => m.photo);
  useEffect(() => { if (bgPhotos.length <= 1) return; const t = setInterval(() => setBgIdx(i => (i + 1) % bgPhotos.length), 5000); return () => clearInterval(t); }, [bgPhotos.length]);
  useEffect(() => {
    if (hasSeenSplash) return;
    const t1 = setTimeout(() => setSplashPhase("dissolve"), 2800);
    const t2 = setTimeout(() => { setSplashPhase("done"); try { localStorage.setItem("tb_splash_seen", "1"); } catch {} }, 4000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <div style={{ fontFamily: "'DM Sans',-apple-system,sans-serif", minHeight: "100vh", position: "relative", overflow: "hidden", maxWidth: 430, margin: "0 auto", background: "#0f1923" }}>
      <style>{`@import url("https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Playfair+Display:wght@700;800;900&display=swap");`}</style>
      <style>{`@keyframes hf{from{opacity:0}to{opacity:1}} @keyframes su{from{transform:translateY(100%)}to{transform:translateY(0)}} @keyframes si{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:none}} @keyframes fi{from{opacity:0}to{opacity:1}} @keyframes ci{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}} @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}} @keyframes popIn{0%{transform:scale(0.9);opacity:0}50%{transform:scale(1.03)}100%{transform:scale(1);opacity:1}} @keyframes slideIn{from{transform:translateX(100%)}to{transform:translateX(0)}} @keyframes slotFill{0%{background:#E8F5E9;transform:scale(0.98)}100%{background:#FEFDFB;transform:scale(1)}} @keyframes bgFade{from{opacity:0}to{opacity:1}} @keyframes heroZoom{from{transform:scale(1.15);opacity:0}to{transform:scale(1);opacity:1}} @keyframes splashIn{0%{opacity:0;transform:scale(0.7)}30%{opacity:1;transform:scale(1.02)}100%{opacity:1;transform:scale(1)}} @keyframes labelAppear{from{opacity:0;letter-spacing:6px}to{opacity:1;letter-spacing:2px}} @keyframes titleRise{from{opacity:0;transform:translateY(40px) scale(0.92)}to{opacity:1;transform:none}} @keyframes subtitleFade{from{opacity:0;transform:translateX(-20px)}to{opacity:1;transform:none}} @keyframes btnPop{from{opacity:0;transform:translateY(30px) scale(0.9)}to{opacity:1;transform:none}} *{-webkit-tap-highlight-color:transparent} ::-webkit-scrollbar{display:none}`}</style>

      {/* Cinematic splash overlay — dissolves into the main page */}
      {splashPhase !== "done" && (
        <div style={{
          position: "absolute", inset: 0, zIndex: 10, display: "flex", alignItems: "center", justifyContent: "center",
          background: "#1B3B32",
          opacity: splashPhase === "dissolve" ? 0 : 1,
          transition: "opacity 1.2s ease-in-out",
          pointerEvents: splashPhase === "dissolve" ? "none" : "auto",
        }}>
          <div style={{ textAlign: "center", padding: "0 30px" }}>
            <div style={{ animation: "splashIn 0.8s cubic-bezier(0.16,1,0.3,1) 0.2s both" }}>
              <div style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 48, fontWeight: 900, color: "#fff", lineHeight: 1.0, textShadow: "0 2px 30px rgba(0,0,0,0.3)" }}>It's almost</div>
              <div style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 52, fontWeight: 900, color: "#fff", lineHeight: 1.0, textShadow: "0 2px 30px rgba(0,0,0,0.3)" }}>time!</div>
              <div style={{ fontSize: 36, marginTop: 8, animation: "fi 0.5s ease-out 0.6s both" }}>✈️</div>
            </div>
            <div style={{ animation: "fi 0.8s ease-out 1.2s both", fontSize: 15, color: "rgba(255,255,255,0.6)", marginTop: 20, fontWeight: 500, lineHeight: 1.5 }}>Your curated travel experience awaits</div>
          </div>
        </div>
      )}

      {/* Full-bleed background photo — starts zooming during dissolve */}
      {bgPhotos.length > 0 && (
        <div key={bgIdx} style={{ position: "absolute", inset: 0, animation: bgIdx === 0 ? "heroZoom 2s ease-out " + (hasSeenSplash ? "0" : "2.5") + "s both" : "bgFade 1.5s ease-out" }}>
          <img src={bgPhotos[bgIdx]} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        </div>
      )}
      {/* Dark overlay for readability */}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.25) 25%, rgba(0,0,0,0.45) 55%, rgba(0,0,0,0.85) 100%)" }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(160deg, rgba(11,77,59,0.4) 0%, rgba(33,147,176,0.2) 50%, rgba(15,76,117,0.3) 100%)" }} />

      <div style={{ position: "relative", zIndex: 1, minHeight: "100vh", display: "flex", flexDirection: "column", padding: "0 24px" }}>
        <div style={{ padding: "20px 0 0", animation: "subtitleFade 0.6s ease-out " + (hasSeenSplash ? "0.1" : "3.6") + "s both" }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: 1.2 }}>🗺️ Trip Builder: Your Curated Travel Experience</span>
        </div>

        <div style={{ flex: 1, minHeight: 60 }} />

        <div>
          <h1 style={{ animation: "titleRise 0.8s cubic-bezier(0.16,1,0.3,1) " + (hasSeenSplash ? "0.2" : "3.8") + "s both", fontFamily: "'Playfair Display',Georgia,serif", fontSize: 44, fontWeight: 900, color: "#fff", margin: "0 0 8px", lineHeight: 1.0, textShadow: "0 2px 20px rgba(0,0,0,0.4)" }}>{trip.name}</h1>
          <div style={{ animation: "subtitleFade 0.6s ease-out " + (hasSeenSplash ? "0.35" : "4.0") + "s both", fontSize: 18, fontWeight: 500, color: "rgba(255,255,255,0.75)", marginBottom: 6, textShadow: "0 1px 8px rgba(0,0,0,0.3)" }}>{trip.subtitle}</div>
          <div style={{ animation: "subtitleFade 0.6s ease-out " + (hasSeenSplash ? "0.45" : "4.15") + "s both", fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.45)", marginBottom: 8 }}>📅 {fmtRange(trip.startDate, trip.dayCount)} · {trip.dayCount} days</div>
        </div>

        {trip.brief && (
          <div style={{ animation: "subtitleFade 0.6s ease-out " + (hasSeenSplash ? "0.55" : "4.3") + "s both", marginBottom: 16 }}>
            <div style={{ fontSize: 14, fontStyle: "italic", color: "rgba(255,255,255,0.55)", lineHeight: 1.6 }}>{trip.brief}</div>
          </div>
        )}

        <div style={{ padding: "4px 0 36px", display: "flex", flexDirection: "column", gap: 10 }}>
          <button onClick={() => onStart("explore")} style={{ animation: "subtitleFade 0.5s cubic-bezier(0.16,1,0.3,1) " + (hasSeenSplash ? "0.65" : "4.5") + "s both", width: "100%", padding: "17px 24px", borderRadius: 16, border: "none", background: "#fff", color: "#1a1a1a", fontSize: 15, fontWeight: 800, cursor: "pointer", boxShadow: "0 4px 24px rgba(0,0,0,0.3)", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>✨ Explore Experiences</button>
          <button onClick={() => onStart("itinerary")} style={{ animation: "subtitleFade 0.5s cubic-bezier(0.16,1,0.3,1) " + (hasSeenSplash ? "0.75" : "4.65") + "s both", width: "100%", padding: "15px 24px", borderRadius: 16, border: "1.5px solid rgba(255,255,255,0.25)", background: "rgba(255,255,255,0.1)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>📅 View Itinerary</button>
        </div>
      </div>
    </div>
  );
};

// ═══ ITINERARY ═══
const Itin = ({ trip, mods, setMods, cal, setCal, onBack, initDay, events, onShowEvent, favs, setFavs, onOverlayChange, isAdmin }) => {
  const [aDay, sDay] = useState(initDay || 0);
  const [lib, sLib] = useState(false);
  const [cust, sCust] = useState(false);
  const [insertIdx, sInsertIdx] = useState(null); // index to insert new item at
  const [fCat, sFCat] = useState("all");
  const [libSort, sLibSort] = useState("favorites");
  const [libSearch, sLibSearch] = useState("");
  const [libPreview, sLibPreview] = useState(null);
  const [showInfo, sInfo] = useState(false);
  const [showOv, sOv] = useState(false);
  const [notes, sNotes] = useState(() => { try { const s = localStorage.getItem("tb_notes"); return s ? JSON.parse(s) : {}; } catch { return {}; } });
  useEffect(() => { try { localStorage.setItem("tb_notes", JSON.stringify(notes)); } catch {} }, [notes]);
  const [mapMod, sMap] = useState(null);
  const [itinDetail, sItinDetail] = useState(null);
  const [dragIdx, sDragIdx] = useState(null);
  const [dragY, sDragY] = useState(0);
  const [dragMod, sDragMod] = useState(null);
  const [editMod, sEditMod] = useState(undefined);
  const [editDay, sEditDay] = useState(false);
  const [travelEdit, sTravelEdit] = useState(null); // index of item being travel-edited
  const dRef = useRef(null);
  const touchRef = useRef(null);

  const days = mkDays(trip.startDate, trip.dayCount);
  useEffect(() => { dRef.current?.children[aDay]?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" }); }, [aDay]);

  const cDay = days[aDay];
  const dayItems = cal[cDay.date] || [];
  const meta = DAY_META[cDay.date] || {};

  // Helper: format duration
  const fmtDur = (m) => { if (!m) return ""; const h = Math.floor(m / 60); const r = m % 60; if (h && r) return `${h}h ${r}m`; if (h) return `${h}h`; return `${r}m`; };

  // Helper: get time-of-day period
  const getPeriod = (time) => {
    if (!time) return "morning";
    const h = parseInt(time.split(":")[0]);
    if (h < 12) return "morning";
    if (h < 17) return "afternoon";
    return "evening";
  };

  // Helper: format time for display
  const fmtTime = (t) => {
    if (!t) return "";
    const [h, m] = t.split(":").map(Number);
    const ampm = h >= 12 ? "PM" : "AM";
    const h12 = h > 12 ? h - 12 : h === 0 ? 12 : h;
    return m > 0 ? `${h12}:${m.toString().padStart(2, "0")} ${ampm}` : `${h12} ${ampm}`;
  };

  // Update a day's items
  const updateDay = (date, newItems) => {
    const nc = { ...cal, [date]: newItems };
    setCal(nc);
  };

  // Remove item at index
  const removeItem = (idx) => {
    const newItems = dayItems.filter((_, i) => i !== idx);
    updateDay(cDay.date, newItems);
  };

  // Move item (drag reorder)
  const moveItem = (fromIdx, toIdx) => {
    if (fromIdx === toIdx) return;
    const items = [...dayItems];
    const [moved] = items.splice(fromIdx, 1);
    items.splice(toIdx, 0, moved);
    updateDay(cDay.date, items);
  };

  // Update travel time for an item
  const updateTravel = (idx, mins, note) => {
    const items = [...dayItems];
    items[idx] = { ...items[idx], travelMins: mins, travelNote: note || "" };
    updateDay(cDay.date, items);
  };

  // Update start time for an item
  const updateTime = (idx, time) => {
    const items = [...dayItems];
    items[idx] = { ...items[idx], startTime: time };
    updateDay(cDay.date, items);
  };

  // Update duration for an item
  const updateDuration = (idx, dur) => {
    const items = [...dayItems];
    items[idx] = { ...items[idx], duration: dur };
    updateDay(cDay.date, items);
  };

  // Add item at position
  const addItem = (modId, atIdx) => {
    const items = [...dayItems];
    const prev = atIdx > 0 ? items[atIdx - 1] : null;
    // Calculate suggested time based on previous item
    let sugTime = "09:00";
    if (prev) {
      const [ph, pm] = prev.startTime.split(":").map(Number);
      const endMin = ph * 60 + pm + (prev.duration || 60) + (prev.travelMins || 0);
      const sh = Math.floor(endMin / 60);
      const sm = endMin % 60;
      sugTime = `${sh.toString().padStart(2, "0")}:${sm.toString().padStart(2, "0")}`;
    } else if (items.length === 0) {
      sugTime = "09:00";
    }
    const newItem = { modId, startTime: sugTime, duration: 90, travelMins: 0, travelNote: "" };
    items.splice(atIdx, 0, newItem);
    updateDay(cDay.date, items);
    sLib(false);
    sInsertIdx(null);
  };

  // All placed mod IDs across entire trip
  const pIds = new Set();
  Object.values(cal).forEach(dayArr => {
    if (Array.isArray(dayArr)) dayArr.forEach(item => pIds.add(item.modId));
  });

  // Library items
  const availRaw = mods.filter(m => !pIds.has(m.id)).filter(m => fCat === "all" || m.category === fCat).filter(m => {
    if (!libSearch.trim()) return true;
    const q = libSearch.toLowerCase();
    const catLabel = (CATS.find(c => c.id === m.category)?.label || "").toLowerCase();
    return (m.name || "").toLowerCase().includes(q) || (m.vibe || "").toLowerCase().includes(q) || (m.notes || "").toLowerCase().includes(q) || (m.category || "").toLowerCase().includes(q) || catLabel.includes(q) || (m.address || "").toLowerCase().includes(q) || (m.tags || []).some(t => t.toLowerCase().includes(q));
  });
  const avail = (() => {
    let list = [...availRaw];
    if (libSort === "favorites") {
      const favList = list.filter(m => favs.includes(m.id));
      const rest = list.filter(m => !favs.includes(m.id));
      list = [...favList, ...rest];
    } else if (libSort === "picks") {
      const picks = list.filter(m => m.tier === "curated");
      const rest = list.filter(m => m.tier !== "curated");
      list = [...picks, ...rest];
    } else if (libSort === "rating") {
      list.sort((a, b) => (b.mapsRating || 0) - (a.mapsRating || 0));
    }
    return list;
  })();

  const addCust = (mod) => {
    setMods(p => [...p, mod]);
    addItem(mod.id, insertIdx != null ? insertIdx : dayItems.length);
    sCust(false);
  };

  return (
    <div style={{ fontFamily: "'DM Sans',-apple-system,sans-serif", minHeight: "100vh", maxWidth: 430, margin: "0 auto", position: "relative" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Playfair+Display:wght@700;800&display=swap" rel="stylesheet" />
      <style>{`@keyframes su{from{transform:translateY(100%)}to{transform:translateY(0)}} @keyframes fi{from{opacity:0}to{opacity:1}} @keyframes ci{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}} @keyframes slideIn{from{transform:translateX(100%)}to{transform:translateX(0)}} *{-webkit-tap-highlight-color:transparent} ::-webkit-scrollbar{display:none}`}</style>

      {/* Day strip */}
      <div style={{ background: "#FEFDFB", padding: "10px 16px 0", borderBottom: "1px solid #eee" }}>
        <div ref={dRef} style={{ display: "flex", gap: 5, overflowX: "auto", paddingBottom: 10, WebkitOverflowScrolling: "touch" }}>
          {days.map((day, i) => {
            const isA = i === aDay;
            const items = cal[day.date] || [];
            const filled = items.length;
            return (
              <button key={day.date} onClick={() => sDay(i)} style={{ flexShrink: 0, padding: "7px 4px", width: 54, borderRadius: 12, border: isA ? "none" : "1.5px solid #eee", cursor: "pointer", background: isA ? "#1B3B32" : filled > 0 ? "#F7F6F3" : "#fff", color: isA ? "#fff" : "#333", transition: "all 0.2s", display: "flex", flexDirection: "column", alignItems: "center", gap: 2, boxShadow: isA ? "0 2px 10px rgba(27,59,50,0.3)" : "none" }}>
                <span style={{ fontSize: 9, fontWeight: 700, opacity: 0.5 }}>{day.wd}</span>
                <span style={{ fontSize: 13, fontWeight: 800, lineHeight: 1 }}>{day.md.split(" ")[1]}</span>
                <span style={{ fontSize: 8, fontWeight: 600, opacity: 0.4 }}>{day.md.split(" ")[0]}</span>
                {filled > 0 && <span style={{ fontSize: 8, fontWeight: 700, color: isA ? "rgba(255,255,255,0.7)" : "#0B4D3B" }}>{filled} stops</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Day content — scrollable */}
      <div style={{ padding: "0 16px 120px", background: "linear-gradient(180deg, #F2F1EE 0%, #CDD5CE 100%)", backgroundAttachment: "fixed", minHeight: "calc(100vh - 120px)" }}>
        
        {/* Day header — white card with green border */}
        <div onClick={() => isAdmin && sEditDay(true)} style={{ margin: "14px 0 14px", background: "#FEFDFB", borderRadius: 18, padding: "16px 18px", border: "2.5px solid #1B3B32", position: "relative", overflow: "hidden", cursor: isAdmin ? "pointer" : "default" }}>
          {/* Subtle pattern overlay */}
          <div style={{ position: "absolute", top: -20, right: -20, fontSize: 80, opacity: 0.04, lineHeight: 1 }}>{meta.icon || "📅"}</div>
          <div style={{ position: "relative" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#0B4D3B", textTransform: "uppercase", letterSpacing: 1, opacity: 0.5 }}>Day {cDay.num} · {cDay.wd}</div>
                <div style={{ fontSize: 20, fontWeight: 800, fontFamily: "'Playfair Display',Georgia,serif", lineHeight: 1.1, marginTop: 3, color: "#1B3B32" }}>{meta.icon} {meta.theme || cDay.full}</div>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0, background: "#1B3B32", borderRadius: 10, padding: "6px 10px", color: "#fff" }}>
                <div style={{ fontSize: 18, fontWeight: 800, lineHeight: 1 }}>{cDay.md.split(" ")[1]}</div>
                <div style={{ fontSize: 9, fontWeight: 600, opacity: 0.6 }}>{cDay.md.split(" ")[0]}</div>
              </div>
            </div>
            {meta.brief && <div style={{ fontSize: 11, color: "#888", lineHeight: 1.5, marginTop: 6, fontStyle: "italic" }}>{meta.brief}</div>}
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              {meta.location && <span style={{ fontSize: 9, fontWeight: 700, color: "#0B4D3B", background: "#0B4D3B12", padding: "3px 10px", borderRadius: 6 }}>📍 {meta.location}</span>}
              {dayItems.length > 0 && <span style={{ fontSize: 9, fontWeight: 700, color: "#0B4D3B", background: "#0B4D3B12", padding: "3px 10px", borderRadius: 6 }}>{dayItems.length} {dayItems.length === 1 ? "stop" : "stops"}</span>}
              {isAdmin && <span style={{ fontSize: 9, fontWeight: 700, color: "#aaa" }}>✏️ tap to edit</span>}
            </div>
          </div>
        </div>

        {/* Add button at top if no items */}
        {dayItems.length === 0 && (
          <button onClick={() => { sInsertIdx(0); sLib(true); sFCat("all"); sLibSearch(""); }} style={{ width: "100%", padding: "24px 14px", background: "#FEFDFB", borderRadius: 16, border: "2px dashed #d5d0c8", cursor: "pointer", marginBottom: 8 }}>
            <div style={{ fontSize: 20, marginBottom: 4 }}>➕</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#555" }}>Add first activity</div>
          </button>
        )}

        {/* Timeline items */}
        {dayItems.map((item, idx) => {
          const mod = mods.find(m => m.id === item.modId);
          if (!mod) return null;
          const cat = CATS.find(c => c.id === mod.category);
          const period = getPeriod(item.startTime);
          const prevPeriod = idx > 0 ? getPeriod(dayItems[idx - 1].startTime) : null;
          const showPeriodLabel = period !== prevPeriod;

          return (
            <div key={idx} style={{ animation: `ci 0.2s ease-out ${idx * 0.03}s both` }}>
              {/* Period label */}
              {showPeriodLabel && (
                <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 0 4px" }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: period === "morning" ? "#FFA000" : period === "afternoon" ? "#1976D2" : "#7C4DFF", textTransform: "uppercase", letterSpacing: 0.8 }}>
                    {period === "morning" ? "☀️ Morning" : period === "afternoon" ? "🌤️ Afternoon" : "🌙 Evening"}
                  </span>
                  <div style={{ flex: 1, height: 1, background: period === "morning" ? "rgba(255,160,0,0.15)" : period === "afternoon" ? "rgba(25,118,210,0.15)" : "rgba(124,77,255,0.15)" }} />
                </div>
              )}

              {/* Travel connector BEFORE activity — tappable to add/edit travel time */}
              <div style={{ display: "flex", alignItems: "center", padding: "2px 0 2px 28px" }}>
                <div style={{ width: 1, height: item.travelMins ? 24 : 12, borderLeft: "2px dotted #d0d0d0", marginRight: 10 }} />
                {travelEdit === idx ? (
                  <div onClick={e => e.stopPropagation()} style={{ display: "flex", alignItems: "center", gap: 6, background: "#fff", border: "1.5px solid #90A4AE", borderRadius: 10, padding: "6px 10px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
                    <span style={{ fontSize: 12 }}>🚗</span>
                    <input type="number" value={item.travelMins || ""} onChange={e => updateTravel(idx, parseInt(e.target.value) || 0, item.travelNote)} placeholder="min" style={{ width: 40, border: "1px solid #ddd", borderRadius: 6, padding: "3px 6px", fontSize: 11, fontWeight: 700, textAlign: "center", fontFamily: "inherit" }} />
                    <span style={{ fontSize: 10, color: "#999" }}>min</span>
                    <input value={item.travelNote || ""} onChange={e => updateTravel(idx, item.travelMins || 0, e.target.value)} placeholder="note (optional)" style={{ width: 100, border: "1px solid #ddd", borderRadius: 6, padding: "3px 6px", fontSize: 10, fontFamily: "inherit" }} />
                    <button onClick={() => sTravelEdit(null)} style={{ background: "#1B3B32", border: "none", borderRadius: 6, padding: "3px 8px", fontSize: 10, fontWeight: 700, color: "#fff", cursor: "pointer" }}>✓</button>
                  </div>
                ) : (
                  <button onClick={e => { e.stopPropagation(); sTravelEdit(idx); }} style={{ background: "none", border: "none", cursor: "pointer", padding: "2px 0", display: "flex", alignItems: "center", gap: 4 }}>
                    {item.travelMins > 0 ? (
                      <span style={{ fontSize: 10, fontWeight: 700, color: "#78909C", background: "#ECEFF1", padding: "3px 10px", borderRadius: 6, display: "inline-flex", alignItems: "center", gap: 4 }}>🚗 {fmtDur(item.travelMins)}{item.travelNote ? ` — ${item.travelNote}` : ""} <span style={{ fontSize: 8, color: "#aaa" }}>✎</span></span>
                    ) : (
                      <span style={{ fontSize: 9, color: "#ccc", fontWeight: 600 }}>+ travel time</span>
                    )}
                  </button>
                )}
              </div>

              {/* Activity card */}
              <div onClick={() => { sItinDetail({ mod, idx, cat }); if (onOverlayChange) onOverlayChange("itinerary"); }} style={{ background: "#FEFDFB", borderRadius: 16, overflow: "hidden", border: "1.5px solid " + (cat?.color || "#ddd") + "20", boxShadow: "0 1px 6px rgba(0,0,0,0.04)", cursor: "pointer", marginBottom: 0, opacity: dragIdx === idx ? 0.5 : 1 }}>
                <div style={{ display: "flex", minHeight: 68 }}>
                  {/* Time column */}
                  <div style={{ width: 56, flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "8px 0", borderRight: "1px solid " + (cat?.color || "#eee") + "15" }}>
                    <span style={{ fontSize: 12, fontWeight: 800, color: "#333" }}>{fmtTime(item.startTime)}</span>
                    {item.duration > 0 && <span style={{ fontSize: 9, fontWeight: 600, color: "#aaa", marginTop: 1 }}>{fmtDur(item.duration)}</span>}
                  </div>
                  {/* Content */}
                  <div style={{ flex: 1, padding: "10px 12px", borderLeft: "3px solid " + (cat?.color || "#888"), display: "flex", flexDirection: "column", justifyContent: "center" }}>
                    <div style={{ fontSize: 14, fontWeight: 700, lineHeight: 1.2, fontFamily: "'Playfair Display',Georgia,serif" }}>{mod.icon || cat?.icon} {mod.name}</div>
                    {mod.vibe && <div style={{ marginTop: 3 }}><span style={{ fontSize: 9, fontWeight: 700, color: cat?.color || "#888", background: (cat?.color || "#888") + "12", padding: "1px 7px", borderRadius: 5 }}>{mod.vibe}</span></div>}
                    {notes[mod.id] && <div style={{ marginTop: 3, fontSize: 10, color: "#999", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>📝 {notes[mod.id]}</div>}
                  </div>
                  {/* Thumbnail */}
                  <div style={{ width: 60, flexShrink: 0, position: "relative" }}><Vis mod={mod} cat={cat} h="100%" st={{ position: "absolute", inset: 0 }} /></div>
                  {/* Drag handle — dark green with white dots */}
                  <div style={{ width: 26, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", cursor: "grab", touchAction: "none", background: "#1B3B32", borderRadius: "0 14px 14px 0" }}
                    onTouchStart={e => {
                      const y = e.touches[0].clientY;
                      touchRef.current = { idx, y, startY: y };
                      sDragIdx(idx); sDragY(y); sDragMod(mod);
                    }}
                    onTouchMove={e => {
                      if (!touchRef.current) return;
                      e.preventDefault();
                      const cy = e.touches[0].clientY;
                      sDragY(cy);
                      const dy = cy - touchRef.current.y;
                      const step = 80;
                      const offset = Math.round(dy / step);
                      if (offset !== 0) {
                        const newIdx = Math.max(0, Math.min(dayItems.length - 1, touchRef.current.idx + offset));
                        if (newIdx !== idx) {
                          moveItem(idx, newIdx);
                          touchRef.current = { idx: newIdx, y: cy, startY: touchRef.current.startY };
                        }
                      }
                    }}
                    onTouchEnd={() => { touchRef.current = null; sDragIdx(null); sDragMod(null); }}
                    onClick={e => e.stopPropagation()}
                  >
                    <svg width="8" height="18" viewBox="0 0 8 18">
                      <circle cx="2" cy="3" r="1.3" fill="rgba(255,255,255,0.7)"/>
                      <circle cx="6" cy="3" r="1.3" fill="rgba(255,255,255,0.7)"/>
                      <circle cx="2" cy="9" r="1.3" fill="rgba(255,255,255,0.7)"/>
                      <circle cx="6" cy="9" r="1.3" fill="rgba(255,255,255,0.7)"/>
                      <circle cx="2" cy="15" r="1.3" fill="rgba(255,255,255,0.7)"/>
                      <circle cx="6" cy="15" r="1.3" fill="rgba(255,255,255,0.7)"/>
                    </svg>
                  </div>
                </div>
              </div>

              {/* Add button between items / at end */}
              <div style={{ display: "flex", alignItems: "center", padding: "3px 0", marginLeft: 28 }}>
                <div style={{ width: 1, height: 12, borderLeft: "2px dotted #d8d8d8", marginRight: 10 }} />
                <button onClick={e => { e.stopPropagation(); sInsertIdx(idx + 1); sLib(true); sFCat("all"); sLibSearch(""); }} style={{ background: "none", border: "1px dashed #d0d0d0", borderRadius: 6, cursor: "pointer", padding: "2px 10px", fontSize: 10, color: "#bbb", fontWeight: 600 }}>+</button>
              </div>
            </div>
          );
        })}

        {/* Floating drag overlay — follows finger */}
        {dragMod && dragIdx !== null && (
          <div style={{
            position: "fixed", left: 16, right: 16, maxWidth: 400,
            top: dragY - 34, zIndex: 300, pointerEvents: "none",
            transform: "scale(1.03)", opacity: 0.92,
          }}>
            <div style={{ background: "#FEFDFB", borderRadius: 16, overflow: "hidden", border: "2px solid #0B4D3B", boxShadow: "0 8px 32px rgba(0,0,0,0.18)", display: "flex", minHeight: 68 }}>
              <div style={{ width: 56, flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "8px 0" }}>
                <span style={{ fontSize: 20 }}>{dragMod.icon || "📍"}</span>
              </div>
              <div style={{ flex: 1, padding: "10px 12px", borderLeft: "3px solid #0B4D3B", display: "flex", alignItems: "center" }}>
                <span style={{ fontSize: 14, fontWeight: 700, fontFamily: "'Playfair Display',Georgia,serif" }}>{dragMod.name}</span>
              </div>
            </div>
          </div>
        )}

        {/* Events for this day */}
        {(() => {
          const dayEvents = events.filter(ev => {
            if (!ev.date) return false;
            const s = new Date(ev.date + "T12:00:00"), e = ev.endDate ? new Date(ev.endDate + "T12:00:00") : s;
            const d = new Date(cDay.date + "T12:00:00");
            if (d < s || d > e) return false;
            if (ev.hours) {
              const dayAbbrs = { 0: "Sun", 1: "Mon", 2: "Tue", 3: "Wed", 4: "Thu", 5: "Fri", 6: "Sat" };
              const wd = dayAbbrs[d.getDay()];
              if (ev.hours.includes("–") && /[A-Z][a-z]{2}/.test(ev.hours)) {
                const parts = ev.hours.match(/([A-Z][a-z]{2})–([A-Z][a-z]{2})/);
                if (parts) {
                  const allDays = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
                  let si = allDays.indexOf(parts[1]), ei = allDays.indexOf(parts[2]);
                  if (si > ei) { const range = [...allDays.slice(si), ...allDays.slice(0, ei + 1)]; if (!range.includes(wd)) return false; }
                  else { if (allDays.indexOf(wd) < si || allDays.indexOf(wd) > ei) return false; }
                }
              }
            }
            return true;
          });
          if (dayEvents.length === 0) return null;
          return (
            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#E91E63", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 6 }}>🎪 Happening today</div>
              <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 4 }}>
                {dayEvents.map(ev => (
                  <button key={ev.id} onClick={() => onShowEvent(ev)} style={{ flexShrink: 0, padding: "8px 12px", borderRadius: 12, background: "#FFF0F3", border: "1px solid #F48FB1", cursor: "pointer", minWidth: 120 }}>
                    <div style={{ fontSize: 16, marginBottom: 2 }}>{ev.icon}</div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#C2185B" }}>{ev.name}</div>
                  </button>
                ))}
              </div>
            </div>
          );
        })()}
      </div>

      {/* Itinerary detail — full screen */}
      {itinDetail && (() => {
        const { mod, idx, cat } = itinDetail;
        const item = dayItems[idx];
        if (!item) { sItinDetail(null); return null; }
        const isFav = favs.includes(mod.id);
        const mUrl = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(mod.name + " " + (mod.address || "") + " Panama");
        return (
          <div style={{ position: "fixed", inset: 0, zIndex: 250, background: "#FEFDFB", animation: "slideIn 0.25s ease-out", overflowY: "auto" }}>
            <button onClick={() => { sItinDetail(null); if (onOverlayChange) onOverlayChange(false); }} style={{ position: "fixed", top: 12, left: 12, width: 36, height: 36, borderRadius: 18, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)", border: "none", color: "#fff", fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 260 }}>←</button>
            <div style={{ position: "relative", height: 260 }}>
              <Vis mod={mod} cat={cat} h={260} />
              <div style={{ position: "absolute", top: 12, right: 12, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(8px)", borderRadius: 8, padding: "4px 10px", fontSize: 10, fontWeight: 700, color: "#fff" }}>{cDay.wd} {cDay.md} · {fmtTime(item.startTime)}</div>
              <button onClick={() => { if (setFavs) setFavs(p => p.includes(mod.id) ? p.filter(x => x !== mod.id) : [...p, mod.id]); }} style={{ position: "absolute", bottom: 12, right: 12, width: 40, height: 40, borderRadius: 20, background: "rgba(0,0,0,0.35)", backdropFilter: "blur(8px)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>{favs.includes(mod.id) ? <svg width="20" height="20" viewBox="0 0 24 24" fill="#E91E63" xmlns="http://www.w3.org/2000/svg"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg> : <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" xmlns="http://www.w3.org/2000/svg"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>}</button>
            </div>
            <div style={{ padding: "18px 20px 120px", maxWidth: 430, margin: "0 auto" }}>
              <h2 style={{ margin: "0 0 6px", fontSize: 24, fontWeight: 800, fontFamily: "'Playfair Display',Georgia,serif", lineHeight: 1.15 }}>{mod.icon || cat?.icon} {mod.name}</h2>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 14 }}>
                {mod.vibe && <span style={{ fontSize: 11, fontWeight: 700, color: cat?.color, background: (cat?.color || "#888") + "12", padding: "3px 10px", borderRadius: 7 }}>{mod.vibe}</span>}
              </div>
              <div style={{ fontSize: 14, color: "#555", lineHeight: 1.7, marginBottom: 18 }}>{mod.notes}</div>
              <div style={{ background: "#F7F6F3", borderRadius: 14, padding: "14px 16px", marginBottom: 16, display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#999", textTransform: "uppercase", letterSpacing: 0.8 }}>Practical info</div>
                {item.startTime && <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}><span>🕐</span><span style={{ color: "#555", fontWeight: 600 }}>{fmtTime(item.startTime)} · {fmtDur(item.duration)}</span></div>}
                {mod.cost && <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}><span>💰</span><span style={{ color: "#555", fontWeight: 600 }}>{mod.cost}</span></div>}
                {mod.address && <button onClick={() => sMap(mod)} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, background: "none", border: "none", cursor: "pointer", padding: 0, textAlign: "left" }}><span>📍</span><span style={{ color: "#2D9CDB", fontWeight: 600 }}>{mod.address}</span></button>}
                {mod.mapsRating > 0 && <a href={mUrl} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, textDecoration: "none" }}><span>⭐</span><GR r={mod.mapsRating} rv={mod.mapsReviews} /><span style={{ fontSize: 9, fontWeight: 700, color: "#4285F4" }}>Google</span></a>}
              </div>
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#999", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 6 }}>📝 Your note</div>
                <textarea value={notes[mod.id] || ""} onChange={e => sNotes(p => ({ ...p, [mod.id]: e.target.value }))} placeholder="Add a personal note..." rows={2} style={{ width: "100%", boxSizing: "border-box", fontSize: 13, padding: "12px 14px", resize: "vertical", borderRadius: 12, border: notes[mod.id] ? "1.5px solid #FFE082" : "1.5px solid #e0e0e0", background: notes[mod.id] ? "#FFFDE7" : "#fff", fontFamily: "inherit" }} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <button onClick={() => {
                  if (mod.id && setFavs) { setFavs(p => p.includes(mod.id) ? p : [...p, mod.id]); }
                  removeItem(idx);
                  sItinDetail(null); if (onOverlayChange) onOverlayChange(false);
                }} style={{ width: "100%", padding: 14, borderRadius: 14, background: isFav ? "#E8F5E9" : "#E91E63", border: "none", fontSize: 14, fontWeight: 700, color: isFav ? "#4CAF50" : "#fff", cursor: "pointer" }}>{isFav ? "❤️ Already in favorites — Remove from itinerary" : "❤️ Remove & save to favorites"}</button>
                <button onClick={() => { removeItem(idx); sItinDetail(null); if (onOverlayChange) onOverlayChange(false); }} style={{ width: "100%", padding: 13, borderRadius: 14, background: "#1a1a1a", border: "none", fontSize: 13, fontWeight: 700, color: "#fff", cursor: "pointer" }}>🗑️ Remove from itinerary</button>
                {isAdmin && <button onClick={() => { sEditMod(mod); sItinDetail(null); if (onOverlayChange) onOverlayChange(false); }} style={{ width: "100%", padding: 12, borderRadius: 12, border: "1.5px solid #E53935", background: "#FFF5F5", color: "#E53935", fontSize: 13, fontWeight: 700, cursor: "pointer", marginTop: 4 }}>✏️ Edit Experience</button>}
              </div>
            </div>
          </div>
        );
      })()}

      {/* Library */}
      {lib && (
        <SwipeSheet onClose={() => { sLib(false); sInsertIdx(null); }} zIndex={200} maxH="85vh">
            <div style={{ padding: "4px 20px 10px" }}>
              <h3 style={{ margin: "0 0 8px", fontSize: 16, fontWeight: 800 }}>Choose experience</h3>
              <input value={libSearch} onChange={e => sLibSearch(e.target.value)} placeholder="Search experiences..." autoFocus style={{ width: "100%", boxSizing: "border-box", padding: "10px 14px", borderRadius: 12, border: "1.5px solid #e0e0e0", fontSize: 13, fontFamily: "inherit", marginBottom: 8, background: "#FAFAF8" }} />
              <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                {["favorites", "picks", "rating"].map(s => (
                  <button key={s} onClick={() => sLibSort(s)} style={{ padding: "5px 10px", borderRadius: 8, border: "none", background: libSort === s ? "#1B3B32" : "#f0f0f0", color: libSort === s ? "#fff" : "#666", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
                    {s === "favorites" ? "❤️ Favorites" : s === "picks" ? "⭐ Chris's Picks" : "📊 Top Rated"}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: "0 16px 24px" }}>
              {/* Section headers for favorites/picks */}
              {libSort === "favorites" && favs.length > 0 && (
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#E91E63", textTransform: "uppercase", letterSpacing: 0.8, padding: "6px 0 4px" }}>❤️ Your favorites</div>
                  {favs.filter(fid => pIds.has(fid) && !avail.some(m => m.id === fid)).map(fid => {
                    const fm = mods.find(m => m.id === fid);
                    if (!fm) return null;
                    const fc = CATS.find(c => c.id === fm.category);
                    return (
                      <div key={fid} style={{ display: "flex", gap: 10, padding: "8px 10px", borderRadius: 14, background: "#f8f8f8", marginBottom: 4, alignItems: "center", opacity: 0.5 }}>
                        <div style={{ width: 40, height: 40, borderRadius: 10, flexShrink: 0, overflow: "hidden" }}><Vis mod={fm} cat={fc} h={40} br={10} /></div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 12, fontWeight: 700, color: "#aaa" }}>{fm.icon || fc?.icon} {fm.name}</div>
                          <div style={{ fontSize: 9, color: "#ccc" }}>Already in itinerary</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              {libSort === "favorites" && favs.length === 0 && (
                <div style={{ textAlign: "center", padding: "16px 10px 8px" }}>
                  <div style={{ fontSize: 11, color: "#999" }}>No favorites yet — heart experiences to save them here</div>
                </div>
              )}
              {libSort === "picks" && (
                <div style={{ fontSize: 10, fontWeight: 700, color: "#0B4D3B", textTransform: "uppercase", letterSpacing: 0.8, padding: "6px 0 4px" }}>⭐ Chris's Picks</div>
              )}
              {avail.map((mod, aIdx) => {
                const mc = CATS.find(c => c.id === mod.category);
                const isFav = favs.includes(mod.id);
                const showDivider = libSort === "favorites" && aIdx > 0 && favs.includes(avail[aIdx-1]?.id) && !favs.includes(mod.id);
                const showPicksDivider = libSort === "picks" && aIdx > 0 && avail[aIdx-1]?.tier === "curated" && mod.tier !== "curated";
                return (
                  <div key={mod.id}>
                    {showDivider && <div style={{ fontSize: 10, fontWeight: 700, color: "#aaa", textTransform: "uppercase", letterSpacing: 0.8, padding: "10px 0 4px" }}>All experiences</div>}
                    {showPicksDivider && <div style={{ fontSize: 10, fontWeight: 700, color: "#aaa", textTransform: "uppercase", letterSpacing: 0.8, padding: "10px 0 4px" }}>More options</div>}
                    <div style={{ display: "flex", gap: 6, marginBottom: 6, alignItems: "stretch" }}>
                      <button onClick={() => sLibPreview(mod)} style={{ flex: 1, display: "flex", gap: 10, padding: "8px 10px", borderRadius: 14, border: "1.5px solid #eee", background: "#fff", cursor: "pointer", textAlign: "left", alignItems: "center" }}>
                        <div style={{ width: 50, height: 50, borderRadius: 12, flexShrink: 0, overflow: "hidden" }}><Vis mod={mod} cat={mc} h={50} br={12} /></div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 700, fontFamily: "'Playfair Display',Georgia,serif" }}>{mod.icon || mc?.icon} {mod.name}</div>
                          <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 3, flexWrap: "wrap" }}>
                            {mod.vibe && <span style={{ fontSize: 9, fontWeight: 700, color: mc?.color || "#888", background: (mc?.color || "#888") + "12", padding: "1px 6px", borderRadius: 4 }}>{mod.vibe}</span>}
                            {mod.tier === "curated" && <span style={{ fontSize: 8, fontWeight: 800, color: "#0B4D3B", background: "#0B4D3B15", padding: "1px 5px", borderRadius: 4 }}>Chris's Pick</span>}
                            {isFav && <span style={{ fontSize: 8, fontWeight: 800, color: "#E91E63", background: "#E91E6315", padding: "1px 5px", borderRadius: 4 }}>Favorite</span>}
                            {mod.mapsRating > 0 && <span style={{ fontSize: 8, fontWeight: 700, color: "#888" }}>Google {mod.mapsRating}★</span>}
                          </div>
                        </div>
                      </button>
                      <button onClick={() => addItem(mod.id, insertIdx != null ? insertIdx : dayItems.length)} style={{ width: 44, borderRadius: 14, border: "none", background: (mc?.color || "#888") + "15", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, color: mc?.color, fontWeight: 700, flexShrink: 0 }}>+</button>
                    </div>
                  </div>
                );
              })}
              {avail.length === 0 && <div style={{ textAlign: "center", padding: "40px 20px", color: "#ccc" }}><div style={{ fontSize: 36, marginBottom: 10 }}>✅</div><div style={{ fontSize: 15, fontWeight: 700, color: "#999" }}>All experiences placed!</div></div>}
            </div>
        </SwipeSheet>
      )}

      {/* Library preview detail */}
      {libPreview && (() => {
        const mod = libPreview;
        const cat = CATS.find(c => c.id === mod.category);
        return (
          <div style={{ position: "fixed", inset: 0, zIndex: 250, background: "#FEFDFB", animation: "slideIn 0.25s ease-out", overflowY: "auto" }}>
            <button onClick={() => sLibPreview(null)} style={{ position: "fixed", top: 12, left: 12, width: 36, height: 36, borderRadius: 18, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)", border: "none", color: "#fff", fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 260 }}>←</button>
            <div style={{ position: "relative", height: 220 }}>
              <Vis mod={mod} cat={cat} h={220} />
              <button onClick={() => { if (setFavs) setFavs(p => p.includes(mod.id) ? p.filter(x => x !== mod.id) : [...p, mod.id]); }} style={{ position: "absolute", bottom: 12, right: 12, width: 40, height: 40, borderRadius: 20, background: "rgba(0,0,0,0.35)", backdropFilter: "blur(8px)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>{favs.includes(mod.id) ? <svg width="20" height="20" viewBox="0 0 24 24" fill="#E91E63" xmlns="http://www.w3.org/2000/svg"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg> : <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" xmlns="http://www.w3.org/2000/svg"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>}</button>
            </div>
            <div style={{ padding: "18px 20px 120px" }}>
              <h2 style={{ margin: "0 0 6px", fontSize: 22, fontWeight: 800, fontFamily: "'Playfair Display',Georgia,serif" }}>{mod.icon || cat?.icon} {mod.name}</h2>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 12 }}>
                {mod.vibe && <span style={{ fontSize: 11, fontWeight: 700, color: cat?.color, background: (cat?.color || "#888") + "12", padding: "3px 10px", borderRadius: 7 }}>{mod.vibe}</span>}
              </div>
              <div style={{ fontSize: 14, color: "#555", lineHeight: 1.7, marginBottom: 16 }}>{mod.notes}</div>
              <button onClick={() => { addItem(mod.id, insertIdx != null ? insertIdx : dayItems.length); sLibPreview(null); }} style={{ width: "100%", padding: 14, borderRadius: 14, border: "none", background: "#0B4D3B", color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>➕ Add to {cDay.wd} {cDay.md}</button>
              {isAdmin && <button onClick={() => { sEditMod(mod); sLibPreview(null); sLib(false); }} style={{ width: "100%", padding: 12, borderRadius: 12, border: "1.5px solid #E53935", background: "#FFF5F5", color: "#E53935", fontSize: 13, fontWeight: 700, cursor: "pointer", marginTop: 8 }}>✏️ Edit Experience</button>}
            </div>
          </div>
        );
      })()}

      {/* Custom event */}
      {cust && <CustomEvent onSave={addCust} onClose={() => sCust(false)} />}

      {/* Practical info */}
      {showInfo && <InfoPanel info={trip.info} onClose={() => sInfo(false)} />}

      {/* Admin edit experience */}
      {isAdmin && editMod !== undefined && (
        <EditExperience
          mod={editMod}
          onSave={(updated) => {
            if (editMod) {
              setMods(prev => prev.map(m => m.id === updated.id ? { ...m, ...updated } : m));
            } else {
              setMods(prev => [...prev, { ...updated, id: "x" + Date.now() }]);
            }
            sEditMod(undefined);
          }}
          onDelete={editMod ? (id) => {
            setMods(prev => prev.filter(m => m.id !== id));
            // Remove from all days
            const nc = { ...cal };
            Object.keys(nc).forEach(d => { if (Array.isArray(nc[d])) nc[d] = nc[d].filter(item => item.modId !== id); });
            setCal(nc);
            sEditMod(undefined);
          } : null}
          onClose={() => sEditMod(undefined)}
        />
      )}

      {/* Admin edit day meta */}
      {isAdmin && editDay && (() => {
        const date = cDay.date;
        const m = DAY_META[date] || {};
        const [theme, setTheme] = useState(m.theme || "");
        const [icon, setIcon] = useState(m.icon || "📅");
        const [loc, setLoc] = useState(m.location || "");
        const [brief, setBrief] = useState(m.brief || "");
        return (
          <SwipeSheet onClose={() => sEditDay(false)} zIndex={350} maxH="70vh">
            <div style={{ padding: "4px 20px 12px", borderBottom: "1px solid #f0f0f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>✏️ Edit Day {cDay.num}</h3>
              <button onClick={() => sEditDay(false)} style={{ background: "#f0f0f0", border: "none", borderRadius: 10, padding: "6px 12px", fontSize: 13, fontWeight: 600, color: "#888", cursor: "pointer" }}>Close</button>
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: "14px 20px 24px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ display: "flex", gap: 8 }}>
                  <div>
                    <label style={{ fontSize: 10, fontWeight: 700, color: "#999", textTransform: "uppercase", letterSpacing: 0.8, display: "block", marginBottom: 4 }}>Icon</label>
                    <input value={icon} onChange={e => setIcon(e.target.value)} style={{ width: 48, padding: "10px 6px", borderRadius: 10, border: "1.5px solid #e0e0e0", fontSize: 20, textAlign: "center", fontFamily: "inherit" }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: 10, fontWeight: 700, color: "#999", textTransform: "uppercase", letterSpacing: 0.8, display: "block", marginBottom: 4 }}>Theme</label>
                    <input value={theme} onChange={e => setTheme(e.target.value)} placeholder="e.g. Canal Day" style={{ width: "100%", boxSizing: "border-box", padding: "10px 14px", borderRadius: 10, border: "1.5px solid #e0e0e0", fontSize: 13, fontFamily: "inherit" }} />
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: 10, fontWeight: 700, color: "#999", textTransform: "uppercase", letterSpacing: 0.8, display: "block", marginBottom: 4 }}>Location</label>
                  <input value={loc} onChange={e => setLoc(e.target.value)} placeholder="e.g. Panama City" style={{ width: "100%", boxSizing: "border-box", padding: "10px 14px", borderRadius: 10, border: "1.5px solid #e0e0e0", fontSize: 13, fontFamily: "inherit" }} />
                </div>
                <div>
                  <label style={{ fontSize: 10, fontWeight: 700, color: "#999", textTransform: "uppercase", letterSpacing: 0.8, display: "block", marginBottom: 4 }}>One-liner</label>
                  <textarea value={brief} onChange={e => setBrief(e.target.value)} placeholder="A sentence about the day..." rows={3} style={{ width: "100%", boxSizing: "border-box", padding: "10px 14px", borderRadius: 10, border: "1.5px solid #e0e0e0", fontSize: 13, fontFamily: "inherit", resize: "vertical" }} />
                </div>
                <button onClick={() => {
                  DAY_META[date] = { ...DAY_META[date], theme, icon, location: loc, brief };
                  try { localStorage.setItem("tb_daymeta", JSON.stringify(DAY_META)); } catch {}
                  sEditDay(false);
                }} style={{ width: "100%", padding: 14, borderRadius: 14, border: "none", background: "#0B4D3B", color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>💾 Save Day</button>
              </div>
            </div>
          </SwipeSheet>
        );
      })()}
    </div>
  );
};



// ═══ EXPLORE TAB ═══
const Explore = ({ mods, setMods, cal, setCal, days, occ, isAdmin, favs, setFavs, events, trip, onShowOverview, onOverlayChange }) => {
  const [detailMod, sDetailMod] = useState(null);
  const [detailList, sDetailList] = useState([]); // list of items for swipe navigation
  const [detailIdx, sDetailIdx] = useState(0);
  const detailSwRef = useRef(null);
  const openDetail = (mod, list) => {
    const idx = list ? list.findIndex(m => m.id === mod.id) : -1;
    sDetailMod(mod);
    sDetailList(list || []);
    sDetailIdx(idx >= 0 ? idx : 0);
    sSlotPicker(null);
    if (onOverlayChange) onOverlayChange("experience");
  };
  const closeDetail = () => {
    sDetailMod(null);
    if (onOverlayChange) onOverlayChange(false);
  };
  const swipeDetail = (dir) => {
    if (detailList.length <= 1) return;
    const next = detailIdx + dir;
    if (next < 0 || next >= detailList.length) return;
    sDetailIdx(next);
    sDetailMod(detailList[next]);
    sSlotPicker(null);
  };
  const [filterCat, sFilter] = useState("all");
  const [filterTags, sFilterTags] = useState([]);
  const [slotPicker, sSlotPicker] = useState(null);
  const [piOpen, sPiOpen] = useState({});
  const [mapMod, sMapMod] = useState(null);
  const [editMod, sEditMod] = useState(undefined);
  const [showAbout, sShowAbout] = useState(false);
  const [search, sSearch] = useState("");
  const pIds = new Set();
  Object.values(cal).forEach(items => { if (Array.isArray(items)) items.forEach(item => pIds.add(item.modId)); });

  const TAG_OPTIONS = [
    { id: "great-with-kids", label: "👶 Great with Kids" },
    { id: "nature", label: "🌿 Nature" },
    { id: "history", label: "📜 History" },
    { id: "indoor", label: "🏠 Indoor" },
    { id: "budget", label: "💰 Budget" },
    { id: "sunset", label: "🌅 Sunset" },
    { id: "adventure", label: "🧗 Adventure" },
  ];

  const toggleTag = (t) => sFilterTags(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);

  const filtered = (() => {
    if (filterCat === "_events") {
      const tripDays = days.map(d => d.date);
      return events.filter(ev => {
        const start = ev.date;
        const end = ev.endDate || ev.date;
        return tripDays.some(d => d >= start && d <= end);
      }).map(ev => ({ ...ev, duration: 1, tier: "curated", mapsRating: 0, tags: [], rec: "recommended" }));
    }
    return mods.filter(m => {
      // Hide personal/custom items from Explore — they only appear in itinerary
      if (["home", "custom"].includes(m.category)) return false;
      if (filterCat === "_picks") { if (m.rec !== "cantmiss") return false; }
      else if (filterCat === "_kids") { if (!(m.tags || []).includes("great-with-kids")) return false; }
      else if (filterCat === "nature") { if (m.category !== "nature" && !(m.tags || []).includes("nature")) return false; }
      else if (filterCat !== "all" && filterCat[0] !== "_" && m.category !== filterCat) return false;
      if (filterTags.length > 0 && (!m.tags || !filterTags.some(t => m.tags.includes(t)))) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const catLabel = (CATS.find(c => c.id === m.category)?.label || "").toLowerCase();
        if (!m.name.toLowerCase().includes(q) && !(m.vibe || "").toLowerCase().includes(q) && !(m.notes || "").toLowerCase().includes(q) && !(m.category || "").toLowerCase().includes(q) && !catLabel.includes(q) && !(m.address || "").toLowerCase().includes(q) && !(m.tags || []).some(t => t.toLowerCase().includes(q))) return false;
      }
      return true;
    });
  })();
  const curated = filtered.filter(m => m.tier === "curated");
  const extended = filtered.filter(m => m.tier === "extended");

  const getSlots = (mod) => {
    const results = [];
    const eventDates = mod.date ? (() => {
      const dates = [];
      const start = new Date(mod.date + "T12:00:00");
      const end = mod.endDate ? new Date(mod.endDate + "T12:00:00") : start;
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        dates.push(d.toISOString().split("T")[0]);
      }
      return dates;
    })() : null;

    days.forEach(day => {
      if (eventDates && !eventDates.includes(day.date)) return;
      const items = cal[day.date] || [];
      const count = items.length;
      // Suggest time based on last item or defaults
      const periods = ["morning", "afternoon", "evening"];
      periods.forEach(period => {
        const timeMap = { morning: "09:00", afternoon: "14:00", evening: "19:00" };
        const sk = day.date + "|" + period;
        results.push({ sk, day, slot: { id: period, label: period.charAt(0).toUpperCase() + period.slice(1), icon: period === "morning" ? "☀️" : period === "afternoon" ? "🌤️" : "🌙" }, existing: null, time: timeMap[period] });
      });
    });
    return results.slice(0, 12);
  };

  const addToSlot = (modId, sk) => {
    const [date, period] = sk.split("|");
    const timeMap = { morning: "09:00", afternoon: "14:00", evening: "19:00" };
    const nc = { ...cal };
    // Remove from any other day first
    Object.keys(nc).forEach(d => {
      if (Array.isArray(nc[d])) nc[d] = nc[d].filter(item => item.modId !== modId);
    });
    // Add to target day
    if (!nc[date]) nc[date] = [];
    nc[date].push({ modId, startTime: timeMap[period] || "12:00", duration: 90, travelMins: 0, travelNote: "" });
    // Sort by time
    nc[date].sort((a, b) => a.startTime.localeCompare(b.startTime));
    setCal(nc);
    sSlotPicker(null);
    closeDetail();
  };

  const renderCard = (mod, isHero, listCtx, cardIdx) => {
    const cat = CATS.find(c => c.id === mod.category);
    const isPlaced = pIds.has(mod.id);
    const tags = mod.tags || [];
    const shortDesc = (mod.notes || "").split(".")[0] + ".";

    if (isHero) {
      // Hero card — photo on one half, text on the other, alternating
      const photoLeft = (cardIdx || 0) % 2 === 0;
      const photoSide = (
        <div style={{ width: "45%", flexShrink: 0, position: "relative" }}>
          <Vis mod={mod} cat={cat} h="100%" st={{ position: "absolute", inset: 0 }} />
        </div>
      );
      const textSide = (
        <div style={{ flex: 1, padding: "14px 16px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 5 }}>
            <span style={{ fontSize: 9, fontWeight: 900, color: "#fff", background: "#0B4D3B", padding: "3px 8px", borderRadius: 5, letterSpacing: 0.3 }}>⭐ CHRIS'S PICK</span>
            {isPlaced && <span style={{ fontSize: 9, fontWeight: 800, color: "#fff", background: "#4CAF50", padding: "3px 8px", borderRadius: 5 }}>✅ Planned</span>}
          </div>
          <div style={{ fontSize: 16, fontWeight: 800, fontFamily: "'Playfair Display',Georgia,serif", lineHeight: 1.2, marginBottom: 4 }}>{mod.name}</div>
          <div style={{ fontSize: 10, color: "#777", lineHeight: 1.4, marginBottom: 6, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{shortDesc}</div>
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
            {mod.vibe && <span style={{ fontSize: 8, fontWeight: 700, color: cat?.color || "#888", background: (cat?.color || "#888") + "15", padding: "2px 6px", borderRadius: 4 }}>{cat?.icon} {mod.vibe}</span>}
            {tags.slice(0, 2).map(t => <span key={t} style={{ fontSize: 8, fontWeight: 600, color: "#999", background: "#f0f0f0", padding: "2px 6px", borderRadius: 4 }}>{t}</span>)}
          </div>
        </div>
      );
      return (
        <div key={mod.id} onClick={() => openDetail(mod, listCtx)} style={{ marginBottom: 10, borderRadius: 16, overflow: "hidden", background: "#FEFDFB", border: "1.5px solid #0B4D3B20", boxShadow: "0 3px 16px rgba(0,0,0,0.08)", cursor: "pointer", display: "flex", minHeight: 140 }}>
          {photoLeft ? <>{photoSide}{textSide}</> : <>{textSide}{photoSide}</>}
        </div>
      );
    }

    // Standard compact card — with planned badge and tags
    return (
      <div key={mod.id} onClick={() => openDetail(mod, listCtx)} style={{
        marginBottom: 8, borderRadius: 16, overflow: "hidden",
        background: "#FEFDFB", border: "1.5px solid " + (cat?.color || "#ddd") + "15",
        boxShadow: "0 1px 6px rgba(0,0,0,0.04)", cursor: "pointer",
      }}>
        <div style={{ display: "flex", minHeight: 74 }}>
          <div style={{ flex: 1, padding: "10px 14px", borderLeft: "4px solid " + (cat?.color || "#888"), display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
              <span style={{ fontSize: 14, fontWeight: 700, lineHeight: 1.2, fontFamily: "'Playfair Display',Georgia,serif" }}>{mod.icon || cat?.icon} {mod.name}</span>
            </div>
            <div style={{ fontSize: 10, color: "#888", lineHeight: 1.3, marginBottom: 4, display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{shortDesc}</div>
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap", alignItems: "center" }}>
              {mod.vibe && <span style={{ fontSize: 8, fontWeight: 700, color: cat?.color || "#888", background: (cat?.color || "#888") + "12", padding: "2px 7px", borderRadius: 4 }}>{mod.vibe}</span>}
              {tags.slice(0, 2).map(t => <span key={t} style={{ fontSize: 8, fontWeight: 600, color: "#999", background: "#f0f0f0", padding: "2px 6px", borderRadius: 4 }}>{t}</span>)}
              {isPlaced && <span style={{ fontSize: 8, fontWeight: 800, color: "#4CAF50", background: "#E8F5E9", padding: "2px 7px", borderRadius: 4 }}>✅ Planned</span>}
            </div>
          </div>
          <div style={{ width: "24%", minWidth: 74, flexShrink: 0, position: "relative" }}>
            <Vis mod={mod} cat={cat} h="100%" st={{ position: "absolute", inset: 0 }} />
          </div>
        </div>
      </div>
    );
  };

  // Full-screen detail view
  const renderDetail = () => {
    if (!detailMod) return null;
    const mod = detailMod;
    const cat = CATS.find(c => c.id === mod.category);
    const isPlaced = pIds.has(mod.id);
    const mUrl = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(mod.name + " " + (mod.address || "") + " Panama");
    const canSwipe = detailList.length > 1;

    return (
      <div
        style={{ position: "fixed", inset: 0, zIndex: 250, background: "#FEFDFB", animation: "slideIn 0.25s ease-out", overflowY: "auto" }}
        onTouchStart={e => { detailSwRef.current = e.touches[0].clientX; }}
        onTouchEnd={e => {
          if (detailSwRef.current === null) return;
          const dx = detailSwRef.current - e.changedTouches[0].clientX;
          if (Math.abs(dx) > 70) { swipeDetail(dx > 0 ? 1 : -1); }
          detailSwRef.current = null;
        }}
      >
        {/* Floating back button — stays visible on scroll */}
        <button onClick={() => closeDetail()} style={{ position: "fixed", top: 12, left: 12, width: 36, height: 36, borderRadius: 18, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)", border: "none", color: "#fff", fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 260 }}>←</button>

        {/* Hero image — itinerary badge + swipe nav only */}
        <div style={{ position: "relative", height: 260 }}>
          <Vis mod={mod} cat={cat} h={260} />
          {isPlaced && <div style={{ position: "absolute", top: 12, right: 12, background: "rgba(76,175,80,0.9)", borderRadius: 8, padding: "4px 10px", fontSize: 11, fontWeight: 800, color: "#fff" }}>✅ In Itinerary</div>}
          <button onClick={e => { e.stopPropagation(); setFavs(p => p.includes(mod.id) ? p.filter(x => x !== mod.id) : [...p, mod.id]); }} style={{ position: "absolute", bottom: canSwipe ? 44 : 12, right: 12, width: 40, height: 40, borderRadius: 20, background: "rgba(0,0,0,0.35)", backdropFilter: "blur(8px)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, zIndex: 2, lineHeight: "40px" }}>{favs.includes(mod.id) ? <svg width="20" height="20" viewBox="0 0 24 24" fill="#E91E63" xmlns="http://www.w3.org/2000/svg"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg> : <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" xmlns="http://www.w3.org/2000/svg"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>}</button>
          {/* Swipe navigation arrows + position */}
          {canSwipe && (
            <div style={{ position: "absolute", bottom: 12, left: 0, right: 0, display: "flex", justifyContent: "center", alignItems: "center", gap: 8 }}>
              {detailIdx > 0 && <button onClick={e => { e.stopPropagation(); swipeDetail(-1); }} style={{ width: 28, height: 28, borderRadius: 14, background: "rgba(0,0,0,0.4)", border: "none", color: "#fff", fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>‹</button>}
              <div style={{ display: "flex", gap: 3 }}>
                {detailList.slice(0, 12).map((_, i) => <div key={i} style={{ width: i === detailIdx ? 12 : 4, height: 4, borderRadius: 2, background: i === detailIdx ? "#fff" : "rgba(255,255,255,0.4)", transition: "all 0.3s" }} />)}
              </div>
              {detailIdx < detailList.length - 1 && <button onClick={e => { e.stopPropagation(); swipeDetail(1); }} style={{ width: 28, height: 28, borderRadius: 14, background: "rgba(0,0,0,0.4)", border: "none", color: "#fff", fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>›</button>}
            </div>
          )}
        </div>

        <div style={{ padding: "18px 20px 120px", maxWidth: 430, margin: "0 auto" }}>
          <h2 style={{ margin: "0 0 6px", fontSize: 24, fontWeight: 800, fontFamily: "'Playfair Display',Georgia,serif", lineHeight: 1.15 }}>{mod.icon || cat?.icon} {mod.name}</h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 14 }}>
            {mod.vibe && <span style={{ fontSize: 11, fontWeight: 700, color: cat?.color, background: (cat?.color || "#888") + "12", padding: "3px 10px", borderRadius: 7 }}>{mod.vibe}</span>}
            {mod.tags && mod.tags.map(t => <span key={t} style={{ fontSize: 10, fontWeight: 600, color: "#888", background: "#f0f0f0", padding: "3px 8px", borderRadius: 5 }}>{t}</span>)}
          </div>

          {/* Description */}
          <div style={{ fontSize: 14, color: "#555", lineHeight: 1.7, marginBottom: 18 }}>{mod.notes}</div>

          {/* Practical info — always visible */}
          <div style={{ background: "#F7F6F3", borderRadius: 14, padding: "14px 16px", marginBottom: 18, display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#999", textTransform: "uppercase", letterSpacing: 0.8 }}>Practical info</div>
            {mod.hours && <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}><span>🕐</span><span style={{ color: "#555", fontWeight: 600 }}>{mod.hours}</span></div>}
            {mod.cost && <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}><span>💰</span><span style={{ color: "#555", fontWeight: 600 }}>{mod.cost}</span></div>}
            {mod.address && <button onClick={() => sMapMod(mod)} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, background: "none", border: "none", cursor: "pointer", padding: 0, textAlign: "left" }}><span>📍</span><span style={{ color: "#2D9CDB", fontWeight: 600 }}>{mod.address}</span><span style={{ fontSize: 9, color: "#aaa" }}>→ Map</span></button>}
            {mod.mapsRating > 0 && <a href={mUrl} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, textDecoration: "none" }}><span>⭐</span><GR r={mod.mapsRating} rv={mod.mapsReviews} /><span style={{ fontSize: 9, fontWeight: 700, color: "#4285F4" }}>Google</span></a>}
            {mod.bookingUrl && <a href={mod.bookingUrl} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "10px 14px", borderRadius: 10, background: cat?.color, color: "#fff", fontSize: 13, fontWeight: 700, textDecoration: "none", marginTop: 4 }}>🔗 Book / Reserve</a>}
          </div>

          {/* Add to itinerary + favorites */}
          {!isPlaced ? (
            <div>
              <button onClick={() => sSlotPicker(mod.id)} style={{
                width: "100%", padding: 14, borderRadius: 14, border: "none",
                background: "#0B4D3B", color: "#fff", fontSize: 15, fontWeight: 700,
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                boxShadow: "0 4px 16px rgba(11,77,59,0.3)",
              }}>➕ Add to Itinerary</button>
              {slotPicker === mod.id && (
                <div style={{ background: "#F7F6F3", borderRadius: 14, padding: 14, marginTop: 10, animation: "fi 0.15s ease-out" }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#555", marginBottom: 8 }}>Choose a day:</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    {days.map((day, di) => {
                      const dayItems = cal[day.date] || [];
                      const meta = DAY_META[day.date] || {};
                      return (
                        <button key={day.date} onClick={() => addToSlot(mod.id, day.date + "|afternoon")} style={{
                          display: "flex", alignItems: "center", gap: 8, padding: "10px 14px",
                          borderRadius: 10, border: "1.5px solid #e0e0e0", background: "#fff",
                          cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#333", textAlign: "left",
                        }}>
                          <div style={{ width: 36, textAlign: "center", flexShrink: 0 }}>
                            <div style={{ fontSize: 9, fontWeight: 700, color: "#aaa" }}>{day.wd}</div>
                            <div style={{ fontSize: 14, fontWeight: 800 }}>{day.md.split(" ")[1]}</div>
                          </div>
                          <div style={{ flex: 1 }}>
                            <div>{meta.icon} {meta.theme || day.md}</div>
                            <div style={{ fontSize: 10, color: "#999", marginTop: 1 }}>{dayItems.length} {dayItems.length === 1 ? "activity" : "activities"} · 📍 {meta.location || "Panama City"}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  <button onClick={() => sSlotPicker(null)} style={{ marginTop: 8, fontSize: 11, color: "#888", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>Cancel</button>
                </div>
              )}
              <button onClick={() => setFavs(p => p.includes(mod.id) ? p.filter(x => x !== mod.id) : [...p, mod.id])} style={{
                width: "100%", padding: 12, borderRadius: 14, marginTop: 8,
                border: favs.includes(mod.id) ? "none" : "1.5px solid #e0e0e0",
                background: favs.includes(mod.id) ? "#FFF0F3" : "#fff",
                color: favs.includes(mod.id) ? "#E91E63" : "#888",
                fontSize: 13, fontWeight: 700, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              }}>{favs.includes(mod.id) ? "❤️ Saved to favorites" : "♡ Save to favorites"}</button>
            </div>
          ) : (
            <div>
              <div style={{ fontSize: 13, color: "#4CAF50", fontWeight: 700, textAlign: "center", padding: "12px 0", background: "#E8F5E9", borderRadius: 14 }}>✅ Already in your itinerary</div>
              <button onClick={() => setFavs(p => p.includes(mod.id) ? p.filter(x => x !== mod.id) : [...p, mod.id])} style={{
                width: "100%", padding: 12, borderRadius: 14, marginTop: 8,
                border: favs.includes(mod.id) ? "none" : "1.5px solid #e0e0e0",
                background: favs.includes(mod.id) ? "#FFF0F3" : "#fff",
                color: favs.includes(mod.id) ? "#E91E63" : "#888",
                fontSize: 13, fontWeight: 700, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              }}>{favs.includes(mod.id) ? "❤️ Saved to favorites" : "♡ Save to favorites"}</button>
            </div>
          )}

          {isAdmin && <button onClick={() => { sEditMod(mod); closeDetail(); }} style={{ width: "100%", padding: 12, borderRadius: 12, border: "1.5px solid #E53935", background: "#FFF5F5", color: "#E53935", fontSize: 13, fontWeight: 700, cursor: "pointer", marginTop: 10 }}>✏️ Edit Experience</button>}
        </div>
      </div>
    );
  };

  // Highlights for carousel — curated "Can't Miss" experiences with photos
  const [hlIdx, setHlIdx] = useState(0);
  const highlights = mods.filter(m => m.rec === "cantmiss" && m.photo && m.tier === "curated");
  const hlSwRef = useRef(null);

  // Planning progress
  const plannedDays = days.filter(d => (cal[d.date] || []).length > 0).length;
  const totalActivities = Object.values(cal).reduce((n, items) => n + (Array.isArray(items) ? items.length : 0), 0);

  return (
    <div style={{ padding: "0 0 100px" }}>
      <div style={{ padding: "12px 16px 0" }}>
      {/* Two action cards */}
      <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
        {/* Discover Panama */}
        <button onClick={() => { sShowAbout(true); if (onOverlayChange) onOverlayChange("explore"); }} style={{ flex: 1, position: "relative", overflow: "hidden", borderRadius: 16, border: "none", cursor: "pointer", height: 120, display: "block", boxShadow: "0 2px 12px rgba(0,0,0,0.1)" }}>
          <img src="https://images.unsplash.com/photo-1566140967404-b8b3932483f5?w=400&h=240&fit=crop" alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(11,77,59,0.8), rgba(33,147,176,0.65))" }} />
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 12 }}>
            <span style={{ fontSize: 28 }}>🇵🇦</span>
            <span style={{ fontSize: 14, fontWeight: 800, color: "#fff", marginTop: 4 }}>Discover Panama</span>
            <span style={{ fontSize: 10, color: "rgba(255,255,255,0.6)", marginTop: 2 }}>Culture, nature & history →</span>
          </div>
        </button>
        {/* Trip Overview */}
        <button onClick={() => onShowOverview && onShowOverview()} style={{ flex: 1, background: "#FEFDFB", borderRadius: 16, border: "1px solid #eee", cursor: "pointer", height: 120, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "10px 14px" }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: "#0B4D3B", marginBottom: 4 }}>📅 {days[0]?.md} — {days[days.length-1]?.md}</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: "#0B4D3B", lineHeight: 1 }}>{plannedDays}<span style={{ fontSize: 14, fontWeight: 600, color: "#aaa" }}>/{days.length}</span></div>
          <div style={{ fontSize: 10, fontWeight: 600, color: "#888", marginTop: 2 }}>days · {totalActivities} activities</div>
          <div style={{ width: "85%", height: 4, borderRadius: 2, background: "#eee", overflow: "hidden", marginTop: 6 }}>
            <div style={{ height: "100%", borderRadius: 2, background: "#0B4D3B", width: Math.round(plannedDays / days.length * 100) + "%" }} />
          </div>
          <span style={{ fontSize: 9, fontWeight: 700, color: "#0B4D3B", marginTop: 5 }}>Full itinerary →</span>
        </button>
      </div>

      {/* Search */}
      <div style={{ marginBottom: 10, position: "relative" }}>
        <input value={search} onChange={e => sSearch(e.target.value)} placeholder="🔍 Search experiences..." style={{
          width: "100%", padding: "10px 14px", borderRadius: 12, border: "1.5px solid #e0e0e0",
          fontSize: 13, fontFamily: "inherit", outline: "none", background: "#FEFDFB", boxSizing: "border-box",
        }} />
        {search.trim() && (() => {
          const q = search.toLowerCase();
          const results = mods.filter(m => { const catLabel = (CATS.find(c => c.id === m.category)?.label || "").toLowerCase(); return (m.name || "").toLowerCase().includes(q) || (m.vibe || "").toLowerCase().includes(q) || (m.notes || "").toLowerCase().includes(q) || (m.address || "").toLowerCase().includes(q) || (m.category || "").toLowerCase().includes(q) || catLabel.includes(q) || (m.tags || []).some(t => t.toLowerCase().includes(q)); }).slice(0, 8);
          if (results.length === 0) return <div style={{ background: "#fff", borderRadius: 14, border: "1.5px solid #eee", padding: "16px 14px", marginTop: 6, boxShadow: "0 4px 16px rgba(0,0,0,0.08)", fontSize: 12, color: "#999", textAlign: "center" }}>No results for "{search}"</div>;
          return (
            <div style={{ background: "#fff", borderRadius: 14, border: "1.5px solid #eee", marginTop: 6, boxShadow: "0 4px 16px rgba(0,0,0,0.08)", overflow: "hidden" }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#aaa", padding: "8px 14px 4px", textTransform: "uppercase", letterSpacing: 0.8 }}>{results.length} result{results.length !== 1 ? "s" : ""}</div>
              {results.map(mod => {
                const cat = CATS.find(c => c.id === mod.category);
                return (
                  <button key={mod.id} onClick={() => { sSearch(""); openDetail(mod, results); }} style={{ width: "100%", display: "flex", gap: 10, padding: "8px 14px", border: "none", borderTop: "1px solid #f5f5f5", background: "none", cursor: "pointer", textAlign: "left", alignItems: "center" }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, overflow: "hidden", flexShrink: 0 }}><Vis mod={mod} cat={cat} h={40} br={10} /></div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 700 }}>{mod.name}</div>
                      <div style={{ fontSize: 10, color: "#888" }}>{mod.vibe}{mod.address ? ` · ${mod.address}` : ""}</div>
                    </div>
                    {pIds.has(mod.id) && <span style={{ fontSize: 9, color: "#4CAF50", fontWeight: 700 }}>✅</span>}
                  </button>
                );
              })}
            </div>
          );
        })()}
      </div>

      {/* Unified filter pills — single scrollable row */}
      <div style={{ display: "flex", gap: 5, overflowX: "auto", marginBottom: 14, paddingBottom: 4, WebkitOverflowScrolling: "touch" }}>
        <button onClick={() => { sFilter("all"); setFilterTags([]); }} style={{ flexShrink: 0, padding: "7px 14px", borderRadius: 10, border: "none", fontSize: 12, fontWeight: 700, cursor: "pointer", background: filterCat === "all" && filterTags.length === 0 ? "#1a1a1a" : "#fff", color: filterCat === "all" && filterTags.length === 0 ? "#fff" : "#777", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>All</button>
        <button onClick={() => { sFilter(filterCat === "_picks" ? "all" : "_picks"); setFilterTags([]); }} style={{ flexShrink: 0, padding: "7px 12px", borderRadius: 10, border: "none", fontSize: 12, fontWeight: 700, cursor: "pointer", background: filterCat === "_picks" ? "#0B4D3B" : "#fff", color: filterCat === "_picks" ? "#fff" : "#777", display: "flex", alignItems: "center", gap: 4, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>⭐ Chris's Picks</button>
        <button onClick={() => { sFilter(filterCat === "_events" ? "all" : "_events"); setFilterTags([]); }} style={{ flexShrink: 0, padding: "7px 12px", borderRadius: 10, border: "none", fontSize: 12, fontWeight: 700, cursor: "pointer", background: filterCat === "_events" ? "#E91E63" : "#fff", color: filterCat === "_events" ? "#fff" : "#777", display: "flex", alignItems: "center", gap: 4, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>🎪 Events</button>
        <button onClick={() => { sFilter(filterCat === "_kids" ? "all" : "_kids"); setFilterTags([]); }} style={{ flexShrink: 0, padding: "7px 12px", borderRadius: 10, border: "none", fontSize: 12, fontWeight: 700, cursor: "pointer", background: filterCat === "_kids" ? "#FF9800" : "#fff", color: filterCat === "_kids" ? "#fff" : "#777", display: "flex", alignItems: "center", gap: 4, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>👶 Great with Kids</button>
        {CATS.filter(c => !["custom", "event", "home"].includes(c.id)).map(c => (
          <button key={c.id} onClick={() => { sFilter(filterCat === c.id ? "all" : c.id); setFilterTags([]); }} style={{
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
          {(() => {
            // Interleave: group into picks and non-picks, then alternate
            const picks = curated.filter(m => m.rec === "cantmiss");
            const others = curated.filter(m => m.rec !== "cantmiss");
            const mixed = [];
            let pi = 0, oi = 0;
            // Pattern: pick, 2 others, pick, 2 others...
            while (pi < picks.length || oi < others.length) {
              if (pi < picks.length) mixed.push(picks[pi++]);
              for (let j = 0; j < 2 && oi < others.length; j++) mixed.push(others[oi++]);
            }
            return mixed.map((m, i) => renderCard(m, m.rec === "cantmiss", curated, i));
          })()}
        </div>
      )}

      {extended.length > 0 && (
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <span style={{ fontSize: 13 }}>📋</span>
            <span style={{ fontSize: 12, fontWeight: 800, color: "#888", textTransform: "uppercase", letterSpacing: 0.8 }}>More Options</span>
            <div style={{ flex: 1, height: 1, background: "#eee" }} />
          </div>
          {extended.map((m, i) => renderCard(m, false, extended, i))}
        </div>
      )}

      {/* Admin: Add new experience */}
      {isAdmin && (
        <div style={{ padding: "10px 0 20px", display: "flex", flexDirection: "column", gap: 8 }}>
          <button onClick={() => sEditMod(null)} style={{
            width: "100%", padding: 14, borderRadius: 14,
            border: "2px dashed #E53935", background: "#FFF5F5",
            color: "#E53935", fontSize: 14, fontWeight: 800, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          }}>➕ Add New Experience</button>
          <button onClick={() => {
            if (window.confirm("Reset all data to defaults? This clears your edits to experiences, itinerary, favorites, and notes.")) {
              localStorage.removeItem("tb_mods"); localStorage.removeItem("tb_cal"); localStorage.removeItem("tb_favs"); localStorage.removeItem("tb_notes"); localStorage.removeItem("tb_trip");
              window.location.reload();
            }
          }} style={{
            width: "100%", padding: 10, borderRadius: 12,
            border: "1px solid #ddd", background: "#f8f8f8",
            color: "#999", fontSize: 11, fontWeight: 600, cursor: "pointer",
          }}>🔄 Reset All Data to Defaults</button>
        </div>
      )}

      {mapMod && <MapPopup mod={mapMod} onClose={() => sMapMod(null)} />}
      {renderDetail()}

      {/* About Panama — full screen */}
      {showAbout && (() => {
        const pPhotos = [
          "https://images.unsplash.com/photo-1566140967404-b8b3932483f5?w=600&h=400&fit=crop",
          "https://images.unsplash.com/photo-1578894381163-e72c17f2d45f?w=600&h=400&fit=crop",
          "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=400&fit=crop",
          "https://images.unsplash.com/photo-1448375240586-882707db888b?w=600&h=400&fit=crop",
          "https://images.unsplash.com/photo-1540573133985-87b6da6d54a9?w=600&h=400&fit=crop",
        ];
        return (
        <div style={{ position: "fixed", inset: 0, zIndex: 250, background: "#FEFDFB", animation: "slideIn 0.25s ease-out", overflowY: "auto" }}>
          <div style={{ position: "relative", height: 280 }}>
            {/* Cycling background photos */}
            <PanamaSlider photos={pPhotos} />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.2) 0%, transparent 30%, rgba(0,0,0,0.6) 100%)" }} />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(11,77,59,0.3), rgba(33,147,176,0.2))" }} />
            <button onClick={() => { sShowAbout(false); if (onOverlayChange) onOverlayChange(false); }} style={{ position: "absolute", top: 12, left: 12, width: 36, height: 36, borderRadius: 18, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(8px)", border: "none", color: "#fff", fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>←</button>
            <div style={{ position: "absolute", bottom: 20, left: 20 }}>
              <div style={{ fontSize: 48, marginBottom: 4 }}>🇵🇦</div>
              <h2 style={{ margin: 0, fontSize: 30, fontWeight: 900, color: "#fff", fontFamily: "'Playfair Display',Georgia,serif", textShadow: "0 2px 12px rgba(0,0,0,0.4)" }}>Panama</h2>
              <div style={{ fontSize: 14, color: "rgba(255,255,255,0.8)", marginTop: 4, fontStyle: "italic" }}>Where two oceans meet</div>
            </div>
          </div>
          <div style={{ padding: "20px 20px 100px", maxWidth: 430, margin: "0 auto" }}>
            <div style={{ fontSize: 14, color: "#555", lineHeight: 1.7, marginBottom: 18 }}>
              Panama is a narrow tropical isthmus connecting Central and South America, bordered by Costa Rica to the west and Colombia to the east. It's one of the most biodiverse places on Earth — home to more bird species than the US and Canada combined, and more tree species than all of Europe.
            </div>

            <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
              {[["☀️", "28–33°C", "Hot & humid"], ["🌧️", "Dry season", "Jan–Apr"], ["💵", "USD", "Official currency"], ["🗣️", "Spanish", "English common"]].map(([icon, val, label]) => (
                <div key={label} style={{ flex: 1, background: "#F7F6F3", borderRadius: 12, padding: "10px 8px", textAlign: "center" }}>
                  <div style={{ fontSize: 20 }}>{icon}</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#333", marginTop: 4 }}>{val}</div>
                  <div style={{ fontSize: 9, color: "#999", marginTop: 2 }}>{label}</div>
                </div>
              ))}
            </div>

            <div style={{ marginBottom: 18 }}>
              <h3 style={{ fontSize: 16, fontWeight: 800, fontFamily: "'Playfair Display',Georgia,serif", marginBottom: 8 }}>🏗️ The Panama Canal</h3>
              <div style={{ fontSize: 13, color: "#555", lineHeight: 1.7 }}>One of the greatest engineering achievements in history. The Canal connects the Atlantic and Pacific oceans, saving ships a 15,000 km journey around South America. Over a million ships have transited since 1914. The Miraflores Locks visitor center is a must-see — you can watch massive cargo ships pass through from just meters away.</div>
            </div>

            <div style={{ marginBottom: 18 }}>
              <h3 style={{ fontSize: 16, fontWeight: 800, fontFamily: "'Playfair Display',Georgia,serif", marginBottom: 8 }}>🏛️ Casco Viejo</h3>
              <div style={{ fontSize: 13, color: "#555", lineHeight: 1.7 }}>The historic quarter of Panama City, founded in 1673 and now a UNESCO World Heritage Site. A mix of restored colonial architecture, bohemian plazas, rooftop bars, and local street life. It's the cultural heart of the city — walkable, photogenic, and home to some of the best restaurants in Panama.</div>
            </div>

            <div style={{ marginBottom: 18 }}>
              <h3 style={{ fontSize: 16, fontWeight: 800, fontFamily: "'Playfair Display',Georgia,serif", marginBottom: 8 }}>🌳 Nature & Biodiversity</h3>
              <div style={{ fontSize: 13, color: "#555", lineHeight: 1.7 }}>Panama has 940+ bird species, over 10,000 plant varieties, and the world's only jaguar corridor connecting two continents. Even within the city, you can hike through rainforest at Metropolitan Natural Park or spot capuchin monkeys on the Amador Causeway. Day trips to cloud forests, beaches, and indigenous communities are all within a few hours.</div>
            </div>

            <div style={{ marginBottom: 18 }}>
              <h3 style={{ fontSize: 16, fontWeight: 800, fontFamily: "'Playfair Display',Georgia,serif", marginBottom: 8 }}>🍽️ Food & Culture</h3>
              <div style={{ fontSize: 13, color: "#555", lineHeight: 1.7 }}>Panama sits at a cultural crossroads — indigenous, Afro-Caribbean, Spanish colonial, and modern cosmopolitan influences blend together. The food scene reflects this: ceviche, patacones, sancocho, fresh seafood, and a growing fine-dining scene led by Latin American-trained chefs. The cocktail culture is excellent, especially in Casco Viejo and El Cangrejo.</div>
            </div>

            <div style={{ background: "linear-gradient(135deg, #E8F5E9, #C8E6C9)", borderRadius: 14, padding: "16px 18px" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#2E7D32", marginBottom: 6 }}>🌡️ What to expect in late March</div>
              <div style={{ fontSize: 12, color: "#555", lineHeight: 1.6 }}>You're visiting at the end of the dry season — perfect timing. Expect warm days (30–33°C), comfortable evenings, and very little rain. The sun is strong, so bring sunscreen, a hat, and light breathable clothing. A light rain jacket is smart just in case. Air-conditioned spaces can be cold — bring a layer for restaurants and malls.</div>
            </div>
          </div>
        </div>
        );
      })()}

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
            closeDetail();
          }}
          onDelete={editMod ? (id) => {
            if (setMods) setMods(prev => prev.filter(m => m.id !== id));
            const nc = { ...cal };
            Object.keys(nc).forEach(k => { if (nc[k] === id) delete nc[k]; });
            setCal(nc);
            sEditMod(undefined);
            closeDetail();
          } : null}
          onClose={() => sEditMod(undefined)}
        />
      )}
      </div>
    </div>
  );
};

// ═══ ROOT ═══
export default function App() {
  const [scr, sScr] = useState("welcome");
  const [tab, sTab] = useState("explore");
  const [jd, sJd] = useState(0);
  // Mods: merge saved overrides onto defaults so new code-added experiences appear
  const [mods, sMods] = useState(() => {
    try {
      const s = localStorage.getItem("tb_mods");
      if (!s) return MODS;
      const saved = JSON.parse(s);
      // Merge: use saved version of each mod if it exists, otherwise use default
      const savedMap = {};
      saved.forEach(m => { savedMap[m.id] = m; });
      const merged = MODS.map(m => savedMap[m.id] ? { ...m, ...savedMap[m.id] } : m);
      // Also include any custom mods that aren't in MODS (user-created)
      const defaultIds = new Set(MODS.map(m => m.id));
      saved.filter(m => !defaultIds.has(m.id)).forEach(m => merged.push(m));
      return merged;
    } catch { return MODS; }
  });
  const [favs, setFavs] = useState(() => { try { const s = localStorage.getItem("tb_favs"); return s ? JSON.parse(s) : []; } catch { return []; } });
  const [cal, sCal] = useState(() => { try { const s = localStorage.getItem("tb_cal"); return s ? JSON.parse(s) : INIT_CAL; } catch { return INIT_CAL; } });

  // Persist to localStorage on change
  useEffect(() => { try { localStorage.setItem("tb_mods", JSON.stringify(mods)); } catch {} }, [mods]);
  useEffect(() => { try { localStorage.setItem("tb_favs", JSON.stringify(favs)); } catch {} }, [favs]);
  useEffect(() => { try { localStorage.setItem("tb_cal", JSON.stringify(cal)); } catch {} }, [cal]);

  // Trip: persist admin edits to trip details
  const [trip, sTrip] = useState(() => { try { const s = localStorage.getItem("tb_trip"); if (!s) return TRIP; return { ...TRIP, ...JSON.parse(s) }; } catch { return TRIP; } });
  useEffect(() => { try { localStorage.setItem("tb_trip", JSON.stringify(trip)); } catch {} }, [trip]);
  const [editTrip, sEditTrip] = useState(false);
  const [showOv, setShowOv] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [showAssist, sAssist] = useState(false);
  const [assistCtx, sAssistCtx] = useState("general");
  const [assistMsgs, sAssistMsgs] = useState([]);
  const [assistInput, sAssistInput] = useState("");
  const [assistLoading, sAssistLoading] = useState(false);
  const openAssist = (ctx) => { sAssistCtx(ctx || "general"); sAssist(true); };
  const [eventDetail, sEventDetail] = useState(null);
  const [evSlotPicker, sEvSlotPicker] = useState(false);
  const [overlayOpen, sOverlayOpen] = useState(false);

  // Admin mode via URL param: ?admin=true
  const isAdmin = typeof window !== "undefined" && new URLSearchParams(window.location.search).get("admin") === "true";

  const days = mkDays(trip.startDate, trip.dayCount);
  // Build compatibility occ object from new array-per-day calendar
  const getOcc = useCallback(() => {
    const o = {};
    Object.entries(cal).forEach(([date, items]) => {
      if (!Array.isArray(items)) return;
      items.forEach((item, idx) => {
        // Create slot-style keys for backwards compat with Explore/Overview
        const period = (() => {
          if (!item.startTime) return "morning";
          const h = parseInt(item.startTime.split(":")[0]);
          if (h < 12) return "morning";
          if (h < 17) return "afternoon";
          return "evening";
        })();
        // Use idx-based key to avoid collisions when multiple items in same period
        const sk = date + "|" + period + (idx > 0 ? "_" + idx : "");
        o[sk] = item.modId;
        // Also put simpler slot keys for the first item in each period
        const simpleSk = date + "|" + period;
        if (!o[simpleSk]) o[simpleSk] = item.modId;
      });
    });
    return o;
  }, [cal]);
  const occ = getOcc();
  // Set of all placed mod IDs for quick lookup
  const allPlacedIds = new Set();
  Object.values(cal).forEach(items => {
    if (Array.isArray(items)) items.forEach(item => allPlacedIds.add(item.modId));
  });

  if (scr === "welcome") return <Welcome trip={trip} days={days} occ={occ} mods={mods} cal={cal} onStart={(t) => { sTab(t || "explore"); sJd(0); sScr("main"); }} onJump={di => { sJd(di); sTab("itinerary"); sScr("main"); }} />;

  // Main screen with tabs
  return (
    <div style={{ fontFamily: "'DM Sans',-apple-system,sans-serif", background: "linear-gradient(180deg, #F2F1EE 0%, #E5EAE6 30%, #D8DED9 60%, #CDD5CE 100%)", backgroundAttachment: "fixed", minHeight: "100vh", maxWidth: 430, margin: "0 auto", position: "relative" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Playfair+Display:wght@700;800&display=swap" rel="stylesheet" />
      <style>{`@keyframes su{from{transform:translateY(100%)}to{transform:translateY(0)}} @keyframes fi{from{opacity:0}to{opacity:1}} @keyframes ci{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}} *{-webkit-tap-highlight-color:transparent} ::-webkit-scrollbar{display:none}`}</style>

      {/* Dark green header — always visible on both tabs */}
      <div style={{ background: "#1B3B32", padding: "12px 16px 10px", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div onClick={() => isAdmin ? sEditTrip(true) : sScr("welcome")} style={{ cursor: "pointer" }}>
            <h1 style={{ margin: 0, fontSize: 16, fontWeight: 800, fontFamily: "'Playfair Display',Georgia,serif", color: "#fff" }}>{trip.name} {isAdmin && <span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>✏️</span>}</h1>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.45)", marginTop: 1 }}>{trip.subtitle}{isAdmin && <span style={{ color: "#FF8A80", fontWeight: 800, marginLeft: 6 }}>ADMIN</span>}</div>
          </div>
          <div style={{ display: "flex", gap: 5 }}>
            <button onClick={() => setShowOv(true)} style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 10, padding: "6px 10px", fontSize: 10, fontWeight: 700, cursor: "pointer", color: "rgba(255,255,255,0.8)" }}>📋 Overview</button>
            <button onClick={() => setShowInfo(true)} style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 10, padding: "6px 10px", fontSize: 10, fontWeight: 700, cursor: "pointer", color: "rgba(255,255,255,0.8)" }}>💡 Info</button>
          </div>
        </div>
      </div>

      {/* Tab content */}
      {tab === "explore" ? (
        <Explore mods={mods} setMods={sMods} cal={cal} setCal={sCal} days={days} occ={occ} isAdmin={isAdmin} favs={favs} setFavs={setFavs} events={EVENTS} trip={trip} onSwitchToDay={di => { sJd(di); sTab("itinerary"); }} onShowOverview={() => setShowOv(true)} onOverlayChange={sOverlayOpen} />
      ) : (
        <Itin trip={trip} mods={mods} setMods={sMods} cal={cal} setCal={sCal} onBack={() => sScr("welcome")} initDay={jd} events={EVENTS} onShowEvent={ev => { sEventDetail(ev); sEvSlotPicker(false); }} favs={favs} setFavs={setFavs} onOverlayChange={sOverlayOpen} isAdmin={isAdmin} />
      )}

      {/* Trip edit modal (admin) */}
      {editTrip && (
        <SwipeSheet onClose={() => sEditTrip(false)} zIndex={350} maxH="80vh">
            <div style={{ padding: "4px 20px 12px", borderBottom: "1px solid #f0f0f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800 }}>✏️ Edit Trip</h3>
              <button onClick={() => sEditTrip(false)} style={{ background: "#f0f0f0", border: "none", borderRadius: 10, padding: "6px 12px", fontSize: 13, fontWeight: 600, color: "#888", cursor: "pointer" }}>Close</button>
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: "14px 20px 24px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div><label style={{ fontSize: 10, fontWeight: 700, color: "#999", textTransform: "uppercase", letterSpacing: 0.8, display: "block", marginBottom: 4 }}>Trip Name</label><input value={trip.name} onChange={e => sTrip(p => ({ ...p, name: e.target.value }))} style={IS} /></div>
                <div><label style={{ fontSize: 10, fontWeight: 700, color: "#999", textTransform: "uppercase", letterSpacing: 0.8, display: "block", marginBottom: 4 }}>Subtitle</label><input value={trip.subtitle} onChange={e => sTrip(p => ({ ...p, subtitle: e.target.value }))} style={IS} /></div>
                <div><label style={{ fontSize: 10, fontWeight: 700, color: "#999", textTransform: "uppercase", letterSpacing: 0.8, display: "block", marginBottom: 4 }}>Start Date</label><input type="date" value={trip.startDate} onChange={e => sTrip(p => ({ ...p, startDate: e.target.value }))} style={{ ...IS, boxSizing: "border-box" }} /></div>
                <div><label style={{ fontSize: 10, fontWeight: 700, color: "#999", textTransform: "uppercase", letterSpacing: 0.8, display: "block", marginBottom: 4 }}>Number of Days</label><input type="number" min="1" max="30" value={trip.dayCount} onChange={e => sTrip(p => ({ ...p, dayCount: parseInt(e.target.value) || 1 }))} style={{ ...IS, boxSizing: "border-box" }} /></div>
                <div><label style={{ fontSize: 10, fontWeight: 700, color: "#999", textTransform: "uppercase", letterSpacing: 0.8, display: "block", marginBottom: 4 }}>Description</label><textarea value={trip.brief} onChange={e => sTrip(p => ({ ...p, brief: e.target.value }))} rows={3} style={{ ...IS, resize: "vertical" }} /></div>
                <button onClick={() => { try { localStorage.setItem("tb_trip", JSON.stringify(trip)); } catch {} sEditTrip(false); }} style={{ width: "100%", padding: 14, borderRadius: 14, border: "none", background: "#0B4D3B", color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer", marginTop: 4 }}>💾 Save Changes</button>
              </div>
            </div>
        </SwipeSheet>
      )}

      {/* Overview + Info panels (shared across both tabs) */}
      {showOv && <Overview days={days} occ={occ} mods={mods} cal={cal} trip={trip} onClose={() => setShowOv(false)} onJump={di => { sJd(di); sTab("itinerary"); setShowOv(false); }} />}
      {showInfo && <InfoPanel info={trip.info} onClose={() => setShowInfo(false)} />}

      {/* Event detail — full screen from itinerary */}
      {eventDetail && (() => {
        const ev = eventDetail;
        const cat = CATS.find(c => c.id === "event");
        const isMultiDay = ev.endDate && ev.endDate !== ev.date;
        const fmtD = (d) => new Date(d + "T12:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
        return (
          <div style={{ position: "fixed", inset: 0, zIndex: 250, background: "#FEFDFB", animation: "slideIn 0.25s ease-out", overflowY: "auto" }}>
            <div style={{ position: "relative", height: 220 }}>
              {ev.photo ? (
                <img src={ev.photo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg, #E91E63, #C2185B)" }} />
              )}
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.2) 0%, transparent 30%, rgba(0,0,0,0.6) 100%)" }} />
              <button onClick={() => sEventDetail(null)} style={{ position: "absolute", top: 12, left: 12, width: 36, height: 36, borderRadius: 18, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(8px)", border: "none", color: "#fff", fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>←</button>
              <div style={{ position: "absolute", top: 12, right: 12, background: "#E91E63", borderRadius: 8, padding: "4px 10px", fontSize: 11, fontWeight: 800, color: "#fff" }}>
                🎪 {isMultiDay ? fmtD(ev.date) + " – " + fmtD(ev.endDate) : fmtD(ev.date)}
              </div>
            </div>
            <div style={{ padding: "18px 20px 120px", maxWidth: 430, margin: "0 auto" }}>
              <h2 style={{ margin: "0 0 6px", fontSize: 24, fontWeight: 800, fontFamily: "'Playfair Display',Georgia,serif" }}>{ev.icon} {ev.name}</h2>
              <div style={{ display: "flex", gap: 5, marginBottom: 14 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#E91E63", background: "#E91E6312", padding: "3px 10px", borderRadius: 7 }}>{ev.vibe}</span>
              </div>
              <div style={{ fontSize: 14, color: "#555", lineHeight: 1.7, marginBottom: 18 }}>{ev.notes}</div>
              {(ev.hours || ev.cost || ev.address) && (
                <div style={{ background: "#F7F6F3", borderRadius: 14, padding: "14px 16px", marginBottom: 18, display: "flex", flexDirection: "column", gap: 10 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#999", textTransform: "uppercase", letterSpacing: 0.8 }}>Details</div>
                  {ev.hours && <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}><span>🕐</span><span style={{ color: "#555", fontWeight: 600 }}>{ev.hours}</span></div>}
                  {ev.cost && <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}><span>💰</span><span style={{ color: "#555", fontWeight: 600 }}>{ev.cost}</span></div>}
                  {ev.address && <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}><span>📍</span><span style={{ color: "#555", fontWeight: 600 }}>{ev.address}</span></div>}
                  {ev.bookingUrl && <a href={ev.bookingUrl} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "10px 14px", borderRadius: 10, background: "#E91E63", color: "#fff", fontSize: 13, fontWeight: 700, textDecoration: "none" }}>🔗 More Info</a>}
                </div>
              )}
              {/* Add to itinerary */}
              {(() => {
                // Build date-filtered slots for this event
                const eventDates = (() => {
                  const dates = [];
                  const start = new Date(ev.date + "T12:00:00");
                  const end = ev.endDate ? new Date(ev.endDate + "T12:00:00") : start;
                  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
                    dates.push(d.toISOString().split("T")[0]);
                  }
                  return dates;
                })();
                const evSlots = [];
                days.forEach(day => {
                  if (!eventDates.includes(day.date)) return;
                  ["morning", "afternoon", "evening"].forEach(sid => {
                    const sk = day.date + "|" + sid;
                    const existingId = occ[sk];
                    const existing = existingId ? mods.find(m => m.id === existingId) : null;
                    evSlots.push({ sk, day, slot: { id: sid, label: sid.charAt(0).toUpperCase() + sid.slice(1), icon: sid === "morning" ? "☀️" : sid === "afternoon" ? "🌤️" : "🌙" }, existing });
                  });
                });
                return (
                  <div style={{ marginBottom: 10 }}>
                    <button onClick={() => sEvSlotPicker(!evSlotPicker)} style={{
                      width: "100%", padding: 14, borderRadius: 14, border: "none",
                      background: "#E91E63", color: "#fff",
                      fontSize: 15, fontWeight: 700, cursor: "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                      boxShadow: "0 4px 16px rgba(233,30,99,0.3)",
                    }}>➕ Add to Itinerary</button>
                    {evSlotPicker && (
                      <div style={{ background: "#F7F6F3", borderRadius: 14, padding: 14, marginTop: 10, animation: "fi 0.15s ease-out" }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: "#555", marginBottom: 8 }}>Choose a slot:</div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                          {evSlots.map(({ sk, day, slot, existing }) => (
                            <button key={sk} onClick={() => {
                              const evMod = { ...ev, duration: 1, tier: "curated", rec: "", mapsRating: 0, tags: [], mapsReviews: "" };
                              sMods(prev => prev.find(m => m.id === ev.id) ? prev : [...prev, evMod]);
                              const nc = { ...cal };
                              const [date, period] = sk.split("|");
                              const timeMap = { morning: "09:00", afternoon: "14:00", evening: "19:00" };
                              if (!nc[date]) nc[date] = [];
                              nc[date] = Array.isArray(nc[date]) ? nc[date] : [];
                              nc[date].push({ modId: ev.id, startTime: timeMap[period] || "12:00", duration: 90, travelMins: 0, travelNote: "" });
                              nc[date].sort((a, b) => a.startTime.localeCompare(b.startTime));
                              sCal(nc);
                              sEvSlotPicker(false); sEventDetail(null);
                            }} style={{
                              display: "flex", alignItems: "center", gap: 8, padding: "10px 14px",
                              borderRadius: 10, border: existing ? "1.5px solid #FFCDD2" : "1.5px solid #e0e0e0",
                              background: existing ? "#FFF8F8" : "#fff",
                              cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#333", textAlign: "left",
                            }}>
                              <span>{slot.icon}</span>
                              <div style={{ flex: 1 }}>
                                <div>{day.wd} {day.md} · {slot.label}</div>
                                {existing && <div style={{ fontSize: 10, color: "#E53935", marginTop: 2 }}>Replaces: {existing.icon || ""} {existing.name}</div>}
                              </div>
                              {!existing && <span style={{ fontSize: 10, color: "#4CAF50", fontWeight: 700 }}>Open</span>}
                              {existing && <span style={{ fontSize: 10, color: "#E53935", fontWeight: 700 }}>Replace</span>}
                            </button>
                          ))}
                          {evSlots.length === 0 && <div style={{ fontSize: 12, color: "#999", padding: 8 }}>This event falls outside your trip dates</div>}
                        </div>
                        <button onClick={() => sEvSlotPicker(false)} style={{ marginTop: 8, fontSize: 11, color: "#888", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>Cancel</button>
                      </div>
                    )}
                  </div>
                );
              })()}
              <button onClick={() => { setFavs(p => p.includes(ev.id) ? p : [...p, ev.id]); }} style={{
                width: "100%", padding: 12, borderRadius: 14, border: favs.includes(ev.id) ? "none" : "1.5px solid #e0e0e0",
                background: favs.includes(ev.id) ? "#E8F5E9" : "#fff", color: favs.includes(ev.id) ? "#4CAF50" : "#888",
                fontSize: 13, fontWeight: 700, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              }}>{favs.includes(ev.id) ? "❤️ Saved" : "🤍 Save to favorites"}</button>
            </div>
          </div>
        );
      })()}

      {/* Bottom tab bar — floating pill */}
      <div style={{
        position: "fixed", bottom: 12, left: "50%", transform: "translateX(-50%)",
        maxWidth: 340, width: "calc(100% - 60px)",
        background: "rgba(27,59,50,0.92)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
        display: "flex", gap: 4, padding: "5px", borderRadius: 20, zIndex: 200,
        boxShadow: "0 4px 24px rgba(0,0,0,0.2)",
      }}>
        <button onClick={() => { sTab("explore"); sAssist(false); }} style={{
          flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
          background: tab === "explore" && !showAssist ? "#fff" : "transparent",
          border: "none", cursor: "pointer", padding: "10px 8px", borderRadius: 16,
          transition: "all 0.2s",
        }}>
          <span style={{ fontSize: 14 }}>✨</span>
          <span style={{ fontSize: 11, fontWeight: 700, color: tab === "explore" && !showAssist ? "#1B3B32" : "rgba(255,255,255,0.6)" }}>Explore</span>
        </button>
        <button onClick={() => { sTab("itinerary"); sAssist(false); }} style={{
          flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
          background: tab === "itinerary" && !showAssist ? "#fff" : "transparent",
          border: "none", cursor: "pointer", padding: "10px 8px", borderRadius: 16,
          transition: "all 0.2s",
        }}>
          <span style={{ fontSize: 14 }}>📅</span>
          <span style={{ fontSize: 11, fontWeight: 700, color: tab === "itinerary" && !showAssist ? "#1B3B32" : "rgba(255,255,255,0.6)" }}>Itinerary</span>
        </button>
        <button onClick={() => openAssist(tab === 'explore' ? 'explore' : 'itinerary')} style={{
          flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
          background: showAssist ? "#fff" : "transparent",
          border: "none", cursor: "pointer", padding: "10px 8px", borderRadius: 16,
          transition: "all 0.2s",
        }}>
          <span style={{ fontSize: 14 }}>🤖</span>
          <span style={{ fontSize: 11, fontWeight: 700, color: showAssist ? "#1B3B32" : "rgba(255,255,255,0.6)" }}>Assistant</span>
        </button>
      </div>

      {/* AI Trip Assistant — chat (root level, accessible from both tabs) */}
      {/* Floating AI assistant button — only on overlay/detail screens where tab bar is hidden */}
      {!showAssist && (showOv || showInfo || eventDetail || overlayOpen) && (
        <button onClick={() => openAssist(showInfo ? "practical" : showOv ? "overview" : eventDetail ? "experience" : overlayOpen || "general")} style={{
          position: "fixed", bottom: 20, right: 16, width: 48, height: 48, borderRadius: 24,
          background: "rgba(27,59,50,0.92)", backdropFilter: "blur(12px)", border: "none",
          boxShadow: "0 4px 16px rgba(11,77,59,0.35)", cursor: "pointer", zIndex: 400,
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
        }}>🤖</button>
      )}

      {/* AI Trip Assistant — context-aware chat panel */}
      {showAssist && (() => {
        const ctxPrompts = {
          general: { title: "Trip Assistant", sub: "I know your full itinerary, all experiences, and Panama inside out.", prompts: ["What should we do on a free day?", "Best restaurants for a special dinner?", "What's great with kids in our itinerary?", "What's the weather like in late March?"] },
          practical: { title: "Travel Questions", sub: "Ask me about getting around, safety, currency, or anything practical.", prompts: ["How do we get from the airport to our hotel?", "Is Uber reliable in Panama?", "Any safety tips for Casco Viejo?", "What SIM card should we get?"] },
          overview: { title: "Planning Help", sub: "I can see your full trip — let me help you optimize it.", prompts: ["Which days are too packed?", "Any must-sees we're missing?", "Suggest a good order for Day 3", "What should we do on empty days?"] },
          explore: { title: "Discover More", sub: "Ask me about any experience or get personalized recommendations.", prompts: ["What's the best ceviche spot?", "Where should we watch the sunset?", "Compare Mangle vs Boticario", "Best experiences for my parents?"] },
          itinerary: { title: "Itinerary Help", sub: "I can help you fine-tune your day-by-day plan.", prompts: ["Is this day too busy?", "What should we do in the evening?", "Best order for today's activities?", "Suggest something nearby for lunch"] },
          experience: { title: "About This Place", sub: "Ask me anything about the experience you're viewing.", prompts: ["Do we need a reservation?", "Is it good for toddlers?", "What should we order?", "How long should we spend here?"] },
        };
        const ctx = ctxPrompts[assistCtx] || ctxPrompts.general;
        return (
        <SwipeSheet onClose={() => sAssist(false)} zIndex={500} maxH="85vh">
            {/* Green header */}
            <div style={{ background: "#1B3B32", padding: "12px 20px 14px", borderRadius: "0", margin: "-1px 0 0" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 16, background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🤖</div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 800, color: "#fff" }}>{ctx.title}</div>
                    <div style={{ fontSize: 9, color: "rgba(255,255,255,0.5)" }}>Ask me anything about your trip</div>
                  </div>
                </div>
                <button onClick={() => sAssist(false)} style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 10, padding: "6px 12px", fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.8)", cursor: "pointer" }}>Close</button>
              </div>
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px" }}>
              {assistMsgs.length === 0 && (
                <div style={{ padding: "4px 0" }}>
                  <div style={{ background: "#F7F6F3", borderRadius: 14, padding: "16px 18px", marginBottom: 14 }}>
                    <div style={{ fontSize: 13, color: "#555", lineHeight: 1.6 }}>👋 I'm your virtual trip assistant for Panama. I know your full itinerary, all {mods.length} experiences, travel tips, weather, restaurants, and everything you need. Just ask!</div>
                  </div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#aaa", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 8 }}>Try asking</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {ctx.prompts.map(q => (
                      <button key={q} onClick={() => sAssistInput(q)} style={{ padding: "11px 14px", borderRadius: 12, border: "1.5px solid #eee", background: "#fff", fontSize: 13, fontWeight: 600, color: "#333", cursor: "pointer", textAlign: "left", display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 11, color: "#0B4D3B" }}>→</span>{q}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {assistMsgs.map((msg, i) => (
                <div key={i} style={{ marginBottom: 10, display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}>
                  <div style={{
                    maxWidth: "85%", padding: "10px 14px", borderRadius: 14,
                    background: msg.role === "user" ? "#1B3B32" : "#F5F5F5",
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
                // Smart pre-generated responses — keyword matching
                const ql = q.toLowerCase();
                const responses = [
                  { keys: ["weather", "climate", "hot", "rain", "temperature"], text: "Late March/early April is the end of dry season — expect 32-34°C in Panama City. It's hot and humid, so schedule outdoor activities before 10 AM or after 3:30 PM. El Valle de Antón (Day 4-5) is noticeably cooler at 600m elevation. Bring sunscreen, hats, and a light layer for AC indoors." },
                  { keys: ["toddler", "kianu", "kid", "child", "baby"], text: "Kianu joins on Day 9 (Monday). The morning is flexible — parents can rest while you pick him up from school. Lunch at Sassi is right next to the school. Afternoon at home together, no pressure. If energy allows, Parque Natural Metropolitano has easy trails (El Roble: 0.7km, 30 min) where you might spot sloths and monkeys." },
                  { keys: ["restaurant", "dinner", "eat", "food", "lunch"], text: "The highlight meals: Don Caimán for riverside lunch after Monkey Island (Day 3), Maito for the splurge dinner (Day 7 — book NOW, Easter weekend!), Mercado de Mariscos for the freshest ceviche (Day 8), and La Pulpería with Karyna's parents (Day 9). For casual, Gamboa Bakery (Day 7) and Sassi (Day 9) are solid." },
                  { keys: ["canal", "miraflores", "lock", "ship"], text: "Canal Day is Tuesday Mar 31. Morning: Monkey Island boat tour (depart 6:30 AM from Gamboa, 4 hours). Afternoon: Miraflores Visitor Center — watch the IMAX film first (Morgan Freeman narration), then the viewing platform for the afternoon transit window from ~2 PM. Museum exhibits are closed for renovation, but the viewing platform + IMAX are worth it. ~$17/adult." },
                  { keys: ["valle", "mountain", "hike", "waterfall", "e-bike", "bike"], text: "El Valle de Antón is Days 4-5. Day 4: drive from the city (~2.5 hrs), stop in Bejuco, then e-bikes around town — Butterfly Haven, Orchid Nursery, sunset at Cerro La Cruz. Day 5: early morning Cerro La Silla ridge hike (360° views, easy trail), then Chorro El Macho waterfall with a swimming hole. Bring swimwear! Optional hot springs in the afternoon." },
                  { keys: ["casco", "viejo", "historic", "old town", "easter"], text: "Casco Viejo is Day 8 (Easter Sunday). Self-guided walk ~2km: Plaza Herrera → Cathedral → Plaza Bolívar → Plaza de Francia → Paseo Esteban Huertas along the old wall. Churches will be open with possible processions. Comfortable shoes for cobblestones, modest dress for churches. After the walk, Mercado de Mariscos for ceviche." },
                  { keys: ["uber", "taxi", "transport", "drive", "airport", "getting"], text: "Chris drives the whole trip in the Outback — handles all roads including El Valle access roads. From the airport to Ciudad del Saber is ~40 min. For backup, Uber works well in Panama City and is cheap. Gas up before leaving the Pan-American Highway for rural areas — no stations on the Bejuco-Sorá road." },
                  { keys: ["safe", "safety", "danger", "crime"], text: "Panama City is generally safe, especially in Casco Viejo, banking district, and tourist areas. Normal precautions — don't flash valuables. Avoid Curundú and El Chorrillo neighborhoods. Tourist police are present in Casco Viejo. Uber is the safest option at night." },
                  { keys: ["book", "reserv", "advance", "maito"], text: "Three bookings needed: 1) Monkey Island tour (Tue Mar 31) — Panama Road Trips or Almiza Tours, AM slot. 2) Maito dinner (Sat Apr 4) — reserve NOW, Easter weekend fills up. 3) La Pulpería (Mon Apr 6) — reserve for dinner with Karyna's parents." },
                  { keys: ["pack", "bring", "clothes", "what to"], text: "Pack: light breathable clothing, reef-safe sunscreen SPF 50+, comfortable walking shoes, light rain jacket (El Valle evenings get cool), hat and sunglasses, insect repellent (DEET), light layer for AC (restaurants are freezing), swimwear for Chorro El Macho waterfall, reusable water bottle." },
                  { keys: ["money", "currency", "tip", "cost", "budget", "dollar"], text: "USD is the currency — no need to exchange anything. Tip 10-15% at restaurants. Budget estimates per person: Monkey Island tour $30-60, Miraflores $17, Biomuseo $16 (senior non-resident), Maito dinner $60-100, most other meals $12-35/pp. Many activities are $5 entry." },
                  { keys: ["day 1", "arrival", "march 29", "first day"], text: "Day 1 (Sun Mar 29): Chris picks you up at Tocumen Airport in the afternoon. ~40 min drive to Ciudad del Saber. Light dinner at home — no agenda, just decompress and meet Django the dog. Palm Sunday events happening in Casco Viejo if you're curious." },
                  { keys: ["flexible", "free", "nothing", "rest", "day off"], text: "Day 9 (Mon Apr 6) is the flexible day. Morning is completely free — rest at home, garden time with Django. Kianu joins at noon. Lunch at Sassi, visit Karyna's ice cream shop. Optional: Parque Natural Metropolitano or Panama Viejo ruins in the late afternoon. Dinner at La Pulpería with the family." },
                  { keys: ["biomuseo", "gehry", "museum", "amador"], text: "Biomuseo is on Day 7 (Sat Apr 4). Frank Gehry's only Latin American building — eight galleries on Panama's biodiversity, air-conditioned. Botanical gardens outside. $16/senior with proof of age. Budget 2 hours. Combine with Punta Culebra (Smithsonian marine center, ~$8, 1 hour) and a drive along the Amador Causeway." },
                  { keys: ["monkey", "gamboa", "boat", "animal", "wildlife"], text: "Monkey Island is Day 3 (Tue Mar 31). Depart 6:30-7 AM, drive ~45 min to Gamboa. Cruise Gatun Lake alongside cargo ships. Visit monkey islands — capuchins, howlers, tamarins. Also toucans, herons, kingfishers, possibly crocodiles. ~4 hours total. Book in advance via Panama Road Trips or Almiza Tours." },
                ];
                const match = responses.find(r => r.keys.some(k => ql.includes(k)));
                const fallback = "I can help with questions about the itinerary, restaurants, activities, weather, packing, transport, safety, and bookings. Try asking about specific days, places, or practical details!";
                setTimeout(() => {
                  sAssistMsgs([...nm, { role: "assistant", text: match ? match.text : fallback }]);
                  sAssistLoading(false);
                }, 600);
              }} style={{ ...IS, fontSize: 14, padding: "12px 16px" }} />
              <button onClick={() => { document.querySelector("input[placeholder='Ask about Panama...']")?.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true })); }} style={{ padding: "12px 18px", borderRadius: 12, border: "none", background: "#1B3B32", color: "#fff", fontWeight: 700, fontSize: 16, cursor: "pointer", flexShrink: 0 }}>→</button>
            </div>
        </SwipeSheet>
        );
      })()}
    </div>
  );
}
