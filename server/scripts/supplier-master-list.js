// Master supplier reference list and matching helpers used by inventory,
// purchase entry, and demo-data refresh scripts.
const OFFICIAL_SUPPLIERS = [
  'ALVIN B LAVENTE',
  'AMULET MARKETING CORP',
  'BELJEM CONSTRUCTION SUPPLIES TRADING',
  'BEST POWER TRADING',
  'BOWMAN BUILDERS CORP',
  'CMA COMMERCIAL TRADING CORP',
  'CRYSTALITE',
  'DGM',
  'EXCELIN MARKETING OPC',
  'FIREFLY',
  'HODIENG',
  'HYZ STEEL TRADING',
  'LPMP TRADING',
  'MAC STEVE MARKETING',
  'ONE SAMEX DEVT CORP',
  'OPTIMAL TRADING',
  'PHT GEN MDSE',
  'PNM MARKETING',
  'QUALISTEEL ENTERPRISES',
  'ROYU',
  'SAKRETE ENTERPRISES INC',
  'THUNDER CRACKER MARKETING CORP',
  'TWINBAR METAL INDUSTRIES INC',
  'WEBERT MARKETING CORP',
  'WINACE TRADING & CONSTRUCTION SUPPLY'
];

const normalizeSupplierName = value =>
  String(value || '').trim().replace(/\s+/g, ' ');

const CATEGORY_SUPPLIERS = {
  Roofing: 'TWINBAR METAL INDUSTRIES INC',
  'PVC Pipe / Fittings': 'OPTIMAL TRADING',
  Steel: 'HYZ STEEL TRADING',
  'Kiln Dry': 'BELJEM CONSTRUCTION SUPPLIES TRADING',
  Plywood: 'BOWMAN BUILDERS CORP',
  Electricals: 'BEST POWER TRADING',
  Paints: 'AMULET MARKETING CORP',
  Other: 'PHT GEN MDSE'
};

const FALLBACK_SUPPLIERS = [
  'PHT GEN MDSE',
  'WINACE TRADING & CONSTRUCTION SUPPLY',
  'CMA COMMERCIAL TRADING CORP',
  'MAC STEVE MARKETING',
  'LPMP TRADING',
  'WEBERT MARKETING CORP'
];

const getOfficialSupplierName = value => {
  const normalized = normalizeSupplierName(value);
  if (!normalized) return '';
  if (OFFICIAL_SUPPLIERS.includes(normalized)) return normalized;
  return '';
};

// Demonstration-only supplier coverage. These are provisional associations
// for existing catalog SKUs, NOT verified vendor contracts or purchase history.
// Keep brand-specific assignments intact; confirm against supplier invoices
// before treating these demo associations as real procurement information.
const DEMO_PRODUCT_SUPPLIER_OVERRIDES = {
  'INSULATION FOAM (per meter) -- SINGLE 5MM (manipis)': 'ALVIN B LAVENTE',
  'INSULATION FOAM (per meter) -- SINGLE 10MM (makapal)': 'ALVIN B LAVENTE',
  'ORDINARY -- 1/4 L-O': 'CMA COMMERCIAL TRADING CORP',
  'ORDINARY -- 1/2 L-O (imp)': 'CMA COMMERCIAL TRADING CORP',
  'PPR PIPE (WHT) -- 1/2"': 'DGM',
  'PPR PIPE (WHT) -- 3/4"': 'DGM',
  'FLOURESCENT HOUSING only -- Philips 10w': 'EXCELIN MARKETING OPC',
  'FLOURESCENT HOUSING only -- Philips 18w': 'EXCELIN MARKETING OPC',
  'PPR PIPE (WHT) -- 1"': 'HODIENG',
  'PVC PIPE -- BLUE 1/2': 'HODIENG',
  'C-PURLINS MANIPIS -- METAL FURRING': 'LPMP TRADING',
  'C-PURLINS MANIPIS -- METAL STUD': 'LPMP TRADING',
  'SENEPA -- 1X4X8': 'MAC STEVE MARKETING',
  'SENEPA -- 1X4X10': 'MAC STEVE MARKETING',
  'INSULATION FOAM (per Roll) - 50M -- SINGLE 5MM (manipis)': 'ONE SAMEX DEVT CORP',
  'INSULATION FOAM (per Roll) - 50M -- SINGLE 10MM (makapal)': 'ONE SAMEX DEVT CORP',
  'ORDINARY -- 3/4 L-O (imp)': 'PHT GEN MDSE',
  'COLORED GUTTER -- BOX TYPE GUTTER RED/GRN': 'PHT GEN MDSE',
  'STEEL MATTING -- #10 MANIPIS': 'SAKRETE ENTERPRISES INC',
  'STEEL MATTING -- #8 SEMI-MAKAPAL': 'SAKRETE ENTERPRISES INC',
  'COLORED GUTTER -- SPANISH GUTTER RED/GRN': 'WEBERT MARKETING CORP',
  'COLORED GUTTER -- FLASHING RED/GRN/BLU': 'WEBERT MARKETING CORP'
};

const getOfficialSupplierForProduct = (item, index = 0) => {
  const demoSupplier = DEMO_PRODUCT_SUPPLIER_OVERRIDES[String(item?.name || '').trim()];
  if (demoSupplier) return demoSupplier;
  const name = String(item?.name || '').toUpperCase();
  const category = item?.category || 'Other';

  if (name.includes('ROYU')) return 'ROYU';
  if (name.includes('FIREFLY')) return 'FIREFLY';
  if (name.includes('NELTEX')) return 'OPTIMAL TRADING';
  if (name.includes('THUNDERBOLT')) return 'THUNDER CRACKER MARKETING CORP';
  if (name.includes('BOYSEN')) return 'AMULET MARKETING CORP';
  if (name.includes('PHELPS DODGE')) return 'PNM MARKETING';
  if (name.includes('CRYSTALITE') || name.includes('POLYCARBONATE') || name.includes('FIBER GLASS')) return 'CRYSTALITE';
  if (name.includes('SAKRETE') || name.includes('CEMENT')) return 'SAKRETE ENTERPRISES INC';
  if (name.includes('C-PURLINS') || name.includes('ANGLE BAR') || name.includes('FLAT BAR') || name.includes('TUBULAR')) return 'HYZ STEEL TRADING';
  if (name.includes('WIRE') || name.includes('STEEL MATTING') || name.includes('GI PIPE')) return 'QUALISTEEL ENTERPRISES';
  if (name.includes('PANEL BOX') || name.includes('BREAKER') || name.includes('FUSE') || name.includes('NEMA')) return 'BEST POWER TRADING';
  if (name.includes('LAMP') || name.includes('FLOURESCENT') || name.includes('CIRCULAR')) return 'FIREFLY';
  if (name.includes('PVC PIPE') || name.includes('ELBOW') || name.includes('COUPLING') || name.includes('TEE') || name.includes('WYE')) return 'OPTIMAL TRADING';
  if (name.includes('COCO') || name.includes('ECO 4')) return 'WINACE TRADING & CONSTRUCTION SUPPLY';
  if (name.includes('PLYWOOD') || name.includes('MARINE') || name.includes('PHENOLIC') || name.includes('SHERA')) return 'BOWMAN BUILDERS CORP';
  if (name.includes('LONG SPAN') || name.includes('CORRUGATED') || name.includes('GUTTER') || name.includes('PLAIN SHEET')) return 'TWINBAR METAL INDUSTRIES INC';

  return CATEGORY_SUPPLIERS[category] || FALLBACK_SUPPLIERS[index % FALLBACK_SUPPLIERS.length];
};

module.exports = {
  DEMO_PRODUCT_SUPPLIER_OVERRIDES,
  OFFICIAL_SUPPLIERS,
  getOfficialSupplierName,
  getOfficialSupplierForProduct,
  normalizeSupplierName
};
