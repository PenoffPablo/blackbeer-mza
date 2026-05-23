import { storeConfig } from "@/config/store.config";

export interface MenuItem {
  id: string;
  category: string;
  name: string;
  description: string;
  priceSingle: number;
  priceDouble?: number | null;
  isAvailable: boolean;
  image?: string;
}

export interface DeliveryZone {
  name: string;
  cost: number;
  isAvailable: boolean;
}

// Datos locales reales extraídos de las imágenes de carta estática de BlackBeer Mza
const FALLBACK_MENU: MenuItem[] = [
  // ═══ BURGERS (Vienen con papas) ═══
  {
    id: "b-black",
    category: "BURGERS",
    name: "BLACK",
    description: "Doble medallón de carne, cheddar, panceta, cebolla caramelizada y barbacoa.",
    priceSingle: 12000,
    priceDouble: null,
    isAvailable: true,
  },
  {
    id: "b-club",
    category: "BURGERS",
    name: "CLUB",
    description: "Doble medallón de carne, muzzarella, jamón, queso, tomate, lechuga y huevo.",
    priceSingle: 12000,
    priceDouble: null,
    isAvailable: true,
  },
  {
    id: "b-crispy",
    category: "BURGERS",
    name: "CRISPY",
    description: "Doble medallón de carne, cheddar, panceta, bacon cream y cebolla crispy.",
    priceSingle: 12000,
    priceDouble: null,
    isAvailable: true,
  },
  {
    id: "b-cheese",
    category: "BURGERS",
    name: "CHESSEBURGUER",
    description: "Doble medallón de carne, cheddar x 4, ketchup y cebolla brunoise.",
    priceSingle: 12000,
    priceDouble: null,
    isAvailable: true,
  },
  {
    id: "b-simo",
    category: "BURGERS",
    name: "SIMO",
    description: "Doble medallón de carne, cheddar, panceta, salsa BB, tomate, lechuga y cebolla brunoise.",
    priceSingle: 12000,
    priceDouble: null,
    isAvailable: true,
  },
  {
    id: "b-chicken",
    category: "BURGERS",
    name: "CHICKEN BLACK",
    description: "Pollo crispy, cheddar, panceta, BBQ, cheddar, lechuga y mayo.",
    priceSingle: 12000,
    priceDouble: null,
    isAvailable: true,
  },
  {
    id: "b-mexa",
    category: "BURGERS",
    name: "MEXA",
    description: "Doble medallón de carne, nachos, guacamole y muzzarella.",
    priceSingle: 12000,
    priceDouble: null,
    isAvailable: true,
  },
  {
    id: "b-patty",
    category: "BURGERS",
    name: "PATTY MELT",
    description: "2 medallones de carne + cheddar y cebolla caramelizada o 2 medallones + cheddar + panceta + bacon cream.",
    priceSingle: 12000,
    priceDouble: null,
    isAvailable: true,
  },
  {
    id: "b-veggie",
    category: "BURGERS",
    name: "VEGGIE",
    description: "Medallón a elección, lechuga, tomate y huevo.",
    priceSingle: 12000,
    priceDouble: null,
    isAvailable: true,
  },
  {
    id: "b-big",
    category: "BURGERS",
    name: "BIG BLACK",
    description: "Cuatro medallones de carne, panceta, cheddar, aros de cebolla y barbacoa.",
    priceSingle: 13500,
    priceDouble: null,
    isAvailable: true,
  },
  {
    id: "b-stunt",
    category: "BURGERS",
    name: "STUNTBURGUER",
    description: "Triple medallón de carne, cheddar, panceta y mayonesa Heinz.",
    priceSingle: 13500,
    priceDouble: null,
    isAvailable: true,
  },
  {
    id: "b-bruta",
    category: "BURGERS",
    name: "LA BRUTA",
    description: "Cinco medallones de carne, cheddar x 10, panceta y barbacoa.",
    priceSingle: 16500,
    priceDouble: null,
    isAvailable: true,
  },

  // ═══ LOMOS (Vienen con papas) ═══
  {
    id: "l-black",
    category: "LOMOS",
    name: "BLACK",
    description: "Bife de lomo, cheddar, panceta y cebolla caramelizada.",
    priceSingle: 15500,
    priceDouble: 26500,
    isAvailable: true,
  },
  {
    id: "l-club",
    category: "LOMOS",
    name: "CLUB",
    description: "Bife de lomo, jamón, muzzarella, tomate, lechuga, huevo y mayo casera.",
    priceSingle: 15500,
    priceDouble: 26500,
    isAvailable: true,
  },
  {
    id: "l-mexa",
    category: "LOMOS",
    name: "MEXA",
    description: "Bife de lomo, guacamole, nachos y muzzarella.",
    priceSingle: 15500,
    priceDouble: 26500,
    isAvailable: true,
  },

  // ═══ PAPAS ═══
  {
    id: "p-clasicas",
    category: "PAPAS",
    name: "CLASICAS",
    description: "Pocion de papas fritas clásicas, crocantes y doradas.",
    priceSingle: 6500,
    isAvailable: true,
  },
  {
    id: "p-black",
    category: "PAPAS",
    name: "BLACK",
    description: "Con salsa cheddar, panceta picada y cebollita de verdeo.",
    priceSingle: 7500,
    isAvailable: true,
  },
  {
    id: "p-club",
    category: "PAPAS",
    name: "CLUB",
    description: "Con muzzarella fundida y huevo revuelto o frito.",
    priceSingle: 7500,
    isAvailable: true,
  },
  {
    id: "p-convertida",
    category: "PAPAS",
    name: "PAPA CONVERTIDA",
    description: "Convertí las papas de tu combo en versión BLACK o CLUB.",
    priceSingle: 1500,
    priceDouble: 2500,
    isAvailable: true,
  },
  {
    id: "p-pela",
    category: "PAPAS",
    name: "PAPA PELA",
    description: "Papas cargadas con muzzarella, medallón de carne desmenuzado, panceta y huevo.",
    priceSingle: 10000,
    isAvailable: true,
  },

  // ═══ PIZZAS ═══
  {
    id: "z-muzarella",
    category: "PIZZAS",
    name: "MUZARELLA",
    description: "Salsa de tomate, muzzarella con aceitunas.",
    priceSingle: 10000,
    isAvailable: true,
  },
  {
    id: "z-doble",
    category: "PIZZAS",
    name: "DOBLE MUZARELLA",
    description: "Doble porción de muzzarella, aceitunas.",
    priceSingle: 12500,
    isAvailable: true,
  },
  {
    id: "z-fugazza",
    category: "PIZZAS",
    name: "FUGAZZA",
    description: "Muzzarella y cebolla cocida o cruda en juliana.",
    priceSingle: 12000,
    isAvailable: true,
  },
  {
    id: "z-napolitana",
    category: "PIZZAS",
    name: "NAPOLITANA",
    description: "Muzzarella y rodajas de tomates frescos con ajo y perejil.",
    priceSingle: 12000,
    isAvailable: true,
  },
  {
    id: "z-especial",
    category: "PIZZAS",
    name: "ESPECIAL",
    description: "Muzzarella, jamón cocido y aceitunas verdes.",
    priceSingle: 12000,
    isAvailable: true,
  },
  {
    id: "z-esp-morron",
    category: "PIZZAS",
    name: "ESPECIAL CON MORRON",
    description: "Muzzarella, jamón cocido y morrones asados en tiras.",
    priceSingle: 12500,
    isAvailable: true,
  },
  {
    id: "z-esp-huevo",
    category: "PIZZAS",
    name: "ESPECIAL CON MORRON Y HUEVO",
    description: "Muzzarella, jamón cocido, morrones y huevo duro picado.",
    priceSingle: 13000,
    isAvailable: true,
  },
  {
    id: "z-muz-morrones",
    category: "PIZZAS",
    name: "MUZARELLA CON MORRONES",
    description: "Muzzarella, aceitunas y morrones asados.",
    priceSingle: 11000,
    isAvailable: true,
  },
  {
    id: "z-peperoni",
    category: "PIZZAS",
    name: "PEPERONI",
    description: "Muzzarella con rodajas de peperoni picante.",
    priceSingle: 14000,
    isAvailable: true,
  },
  {
    id: "z-panceta",
    category: "PIZZAS",
    name: "PANCETA",
    description: "Muzzarella, panceta crocante, cebolla de verdeo y aceitunas.",
    priceSingle: 14000,
    isAvailable: true,
  },
  {
    id: "z-palmitos",
    category: "PIZZAS",
    name: "PALMITOS CON S. GOLF",
    description: "Muzzarella, jamón cocido, palmitos tiernos y salsa golf.",
    priceSingle: 13000,
    isAvailable: true,
  },
  {
    id: "z-tropical",
    category: "PIZZAS",
    name: "TROPICAL",
    description: "Muzzarella, jamón cocido, trozos de ananá y azúcar negro espolvoreado.",
    priceSingle: 13000,
    isAvailable: true,
  },
  {
    id: "z-rucula",
    category: "PIZZAS",
    name: "RÚCULA",
    description: "Muzzarella, jamón crudo, hojas de rúcula fresca y queso parmesano rallado.",
    priceSingle: 14000,
    isAvailable: true,
  },
  {
    id: "z-cuatro",
    category: "PIZZAS",
    name: "CUATRO QUESOS",
    description: "Muzzarella, queso sardo, roquefort y provolone fundidos.",
    priceSingle: 13000,
    isAvailable: true,
  },

  // ═══ EXTRAS ═══
  {
    id: "e-medallon",
    category: "EXTRAS",
    name: "Medallón de carne + cheddar",
    description: "Agregá un medallón de carne extra con una feta de queso cheddar.",
    priceSingle: 2500,
    isAvailable: true,
  },
  {
    id: "e-cheddar",
    category: "EXTRAS",
    name: "Dip de cheddar",
    description: "Salsa de queso cheddar fundido para untar.",
    priceSingle: 1500,
    isAvailable: true,
  },
  {
    id: "e-palta",
    category: "EXTRAS",
    name: "Dip de palta",
    description: "Guacamole casero o crema de palta suave.",
    priceSingle: 500,
    isAvailable: true,
  },
  {
    id: "e-barbacoa",
    category: "EXTRAS",
    name: "Dip de barbacoa",
    description: "Salsa barbacoa ahumada dulce.",
    priceSingle: 1500,
    isAvailable: true,
  },
  {
    id: "e-mayo",
    category: "EXTRAS",
    name: "Dip de mayo casera",
    description: "Mayonesa casera condimentada de la casa.",
    priceSingle: 500,
    isAvailable: true,
  },
];

const FALLBACK_ZONES: DeliveryZone[] = [
  { name: "Las Heras Este / Centro", cost: 1200, isAvailable: true },
  { name: "Las Heras Oeste", cost: 1500, isAvailable: true },
  { name: "Ciudad Mendoza Centro", cost: 1800, isAvailable: true },
  { name: "Ciudad Mendoza Sur (Quinta Sección)", cost: 2000, isAvailable: true },
  { name: "Godoy Cruz Norte", cost: 2500, isAvailable: true },
  { name: "Guaymallén Oeste", cost: 2500, isAvailable: true },
];

/**
 * Función auxiliar para parsear líneas de CSV contemplando separador de coma o punto y coma
 */
function parseCSV(text: string): string[][] {
  const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
  if (lines.length === 0) return [];

  // Detectar delimitador basado en la primera fila (encabezado)
  const firstLine = lines[0];
  const separator = firstLine.includes(";") ? ";" : ",";

  return lines.map(line => {
    const result: string[] = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === separator && !inQuotes) {
        result.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  });
}

/**
 * Servicio dinámico para sincronizar menú y zonas con Google Sheets (publicado como CSV)
 * Soporta ISR mediante fetch revalidation.
 */
export async function getMenuFromSheet(): Promise<MenuItem[]> {
  const url = storeConfig.googleSheets.menuUrl;
  if (!url) {
    return FALLBACK_MENU;
  }

  try {
    const res = await fetch(url, { next: { revalidate: 60 } });
    if (!res.ok) throw new Error("Fetch fallido para hoja de Google Sheets de menú.");
    
    const text = await res.text();
    const rows = parseCSV(text);
    if (rows.length <= 1) return FALLBACK_MENU; // Solo el header

    // Detectamos encabezados para mapear columnas dinámicamente por nombre
    const headers = rows[0].map(h => h.toLowerCase());
    const idxCategory = headers.indexOf("category");
    const idxName = headers.indexOf("name");
    const idxDesc = headers.indexOf("description");
    const idxPriceSingle = headers.indexOf("pricesingle");
    const idxPriceDouble = headers.indexOf("pricedouble");
    const idxAvailable = headers.indexOf("isavailable");
    const idxImage = headers.indexOf("image");

    if (idxCategory === -1 || idxName === -1 || idxPriceSingle === -1) {
      console.warn("Faltan columnas requeridas en el CSV. Usando fallback.");
      return FALLBACK_MENU;
    }

    const items: MenuItem[] = [];

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (row.length < Math.max(idxCategory, idxName, idxPriceSingle)) continue;

      const category = row[idxCategory]?.toUpperCase() || "OTROS";
      const name = row[idxName] || "";
      const description = idxDesc !== -1 ? row[idxDesc] : "";
      
      const priceSingle = parseFloat(row[idxPriceSingle]?.replace(/[^0-9.-]+/g, "") || "0");
      const priceDoubleStr = idxPriceDouble !== -1 ? row[idxPriceDouble] : "";
      const priceDouble = priceDoubleStr ? parseFloat(priceDoubleStr.replace(/[^0-9.-]+/g, "")) : null;

      const availableStr = idxAvailable !== -1 ? row[idxAvailable].toLowerCase() : "true";
      const isAvailable = availableStr === "true" || availableStr === "1" || availableStr === "si" || availableStr === "sí";
      
      const image = idxImage !== -1 ? row[idxImage] : undefined;

      // Generar slug/id único basado en categoría y nombre
      const id = `${category.toLowerCase().substring(0, 3)}-${name.toLowerCase().replace(/\s+/g, "-")}`;

      items.push({
        id,
        category,
        name,
        description,
        priceSingle,
        priceDouble: priceDouble || null,
        isAvailable,
        image,
      });
    }

    return items.length > 0 ? items : FALLBACK_MENU;
  } catch (error) {
    console.error("⚠️ Error sincronizando menú de Google Sheets, usando local fallback:", error);
    return FALLBACK_MENU;
  }
}

export async function getZonesFromSheet(): Promise<DeliveryZone[]> {
  const url = storeConfig.googleSheets.zonesUrl;
  if (!url) {
    return FALLBACK_ZONES;
  }

  try {
    const res = await fetch(url, { next: { revalidate: 60 } });
    if (!res.ok) throw new Error("Fetch fallido para hoja de Google Sheets de zonas.");

    const text = await res.text();
    const rows = parseCSV(text);
    if (rows.length <= 1) return FALLBACK_ZONES;

    const headers = rows[0].map(h => h.toLowerCase());
    const idxName = headers.indexOf("zonename");
    const idxCost = headers.indexOf("cost");
    const idxAvailable = headers.indexOf("isavailable");

    if (idxName === -1 || idxCost === -1) {
      console.warn("Faltan columnas requeridas en el CSV de zonas. Usando fallback.");
      return FALLBACK_ZONES;
    }

    const zones: DeliveryZone[] = [];

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (row.length < Math.max(idxName, idxCost)) continue;

      const name = row[idxName] || "";
      const cost = parseFloat(row[idxCost]?.replace(/[^0-9.-]+/g, "") || "0");
      const availableStr = idxAvailable !== -1 ? row[idxAvailable].toLowerCase() : "true";
      const isAvailable = availableStr === "true" || availableStr === "1" || availableStr === "si" || availableStr === "sí";

      zones.push({
        name,
        cost,
        isAvailable,
      });
    }

    return zones.length > 0 ? zones : FALLBACK_ZONES;
  } catch (error) {
    console.error("⚠️ Error sincronizando zonas de Google Sheets, usando local fallback:", error);
    return FALLBACK_ZONES;
  }
}
