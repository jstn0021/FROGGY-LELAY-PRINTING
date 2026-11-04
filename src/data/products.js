// Single source of truth for the service cards and the quote estimator.
// Edit names, prices and turnaround here and both update.
//   bulk: quantity that earns 10% off (null = no bulk discount)

export const BULK_DISCOUNT = 0.1;

export const products = [
  {
    id: 'doc',
    name: 'Documents & photocopy',
    noun: 'page',
    plural: 'pages',
    bulk: 100,
    lead: 'Same day',
    desc: 'School requirements, reports and forms. Bring a file or a hard copy.',
    opts: [
      { label: 'B&W, Short or A4', price: 2 },
      { label: 'B&W, Legal', price: 3 },
      { label: 'Full color, Short or A4', price: 8 },
      { label: 'Full color, Legal', price: 10 },
    ],
  },
  {
    id: 'tarp',
    name: 'Tarpaulin',
    noun: 'piece',
    plural: 'pieces',
    bulk: null,
    lead: '1 to 2 days',
    desc: 'Banners for events, sales and greetings. Eyelets and hemmed edges included.',
    opts: [
      { label: '2 × 3 ft', price: 96 },
      { label: '3 × 5 ft', price: 240 },
      { label: '4 × 6 ft', price: 384 },
      { label: '5 × 8 ft', price: 640 },
    ],
  },
  {
    id: 'cards',
    name: 'Business cards',
    noun: 'card',
    plural: 'cards',
    bulk: 300,
    lead: '1 to 2 days',
    desc: 'Standard 90 × 55 mm, printed on both sides.',
    opts: [
      { label: 'Matte, 300 gsm', price: 4 },
      { label: 'Glossy, 300 gsm', price: 4 },
      { label: 'Soft-touch laminated', price: 7 },
    ],
  },
  {
    id: 'stickers',
    name: 'Stickers & labels',
    noun: 'sheet',
    plural: 'sheets',
    bulk: 20,
    lead: '1 to 2 days',
    desc: 'Product labels, logo stickers and packaging seals on A4 sheets.',
    opts: [
      { label: 'A4 glossy sticker paper', price: 35 },
      { label: 'A4 waterproof vinyl', price: 55 },
      { label: 'A4 vinyl, die-cut', price: 80 },
    ],
  },
  {
    id: 'flyers',
    name: 'Flyers & posters',
    noun: 'piece',
    plural: 'pieces',
    bulk: 100,
    lead: 'Same day to 1 day',
    desc: 'Full color, single or double sided. Cut to size on request.',
    opts: [
      { label: 'A5 flyer, 120 gsm', price: 4 },
      { label: 'A4 flyer, 120 gsm', price: 7 },
      { label: 'A3 poster, 150 gsm', price: 35 },
      { label: 'A2 poster, 150 gsm', price: 120 },
    ],
  },
  {
    id: 'id',
    name: 'ID & lamination',
    noun: 'piece',
    plural: 'pieces',
    bulk: null,
    lead: 'Same day',
    desc: 'Protect certificates and IDs, or print a new PVC ID card.',
    opts: [
      { label: 'ID lamination', price: 15 },
      { label: 'Short or A4 lamination', price: 30 },
      { label: 'PVC ID card, printed', price: 80 },
    ],
  },
  {
    id: 'thesis',
    name: 'Thesis binding',
    noun: 'copy',
    plural: 'copies',
    bulk: null,
    lead: '2 to 3 days',
    desc: 'Clean binding for thesis, capstone and research manuscripts.',
    opts: [
      { label: 'Softbound', price: 120 },
      { label: 'Hardbound, black cover', price: 450 },
      { label: 'Hardbound, gold lettering', price: 550 },
    ],
  },
  {
    id: 'custom',
    name: 'Mugs & shirts',
    noun: 'piece',
    plural: 'pieces',
    bulk: 12,
    lead: '2 to 3 days',
    desc: 'Custom prints for events, teams and gifts.',
    opts: [
      { label: 'Sublimation mug, 11 oz', price: 180 },
      { label: 'T-shirt, front print', price: 280 },
    ],
  },
];
