// Prices come from the shop's two price lists (Photocopying & Printing, Extra Services).
// Edit here and the price list on the home page and the order form both update.

export const GROUPS = [
  { id: 'print', title: 'Photocopying & printing' },
  { id: 'extra', title: 'Extra services' },
];

const bySize = (short, a4, long) => [
  { label: 'Short bond paper', price: short },
  { label: 'A4 paper', price: a4 },
  { label: 'Long bond paper', price: long },
];

export const products = [
  {
    id: 'bw-copy',
    group: 'print',
    name: 'Black & white photocopy / xerox',
    noun: 'page',
    plural: 'pages',
    desc: 'Photocopy of your documents in black and white.',
    opts: bySize(3, 3, 4),
  },
  {
    id: 'color-copy',
    group: 'print',
    name: 'Colored photocopy / xerox',
    noun: 'page',
    plural: 'pages',
    desc: 'Photocopy of your documents in full color.',
    opts: bySize(5, 5, 6),
  },
  {
    id: 'bw-text',
    group: 'print',
    name: 'B&W printing, text only',
    noun: 'page',
    plural: 'pages',
    desc: 'Black and white print, whole page, text only.',
    opts: bySize(4, 4, 6),
  },
  {
    id: 'bw-image',
    group: 'print',
    name: 'B&W printing, with image',
    noun: 'page',
    plural: 'pages',
    desc: 'Black and white print, whole page, with images.',
    opts: bySize(10, 10, 12),
  },
  {
    id: 'color-text',
    group: 'print',
    name: 'Colored printing, text with light image',
    noun: 'page',
    plural: 'pages',
    desc: 'Color print for text with a light image.',
    opts: bySize(7, 7, 9),
  },
  {
    id: 'color-full',
    group: 'print',
    name: 'Colored printing, full-page image',
    noun: 'page',
    plural: 'pages',
    desc: 'Color print with a full-page colored image.',
    opts: bySize(15, 15, 20),
  },
  {
    id: 'egov',
    group: 'extra',
    name: 'E-Gov ID print & resize',
    noun: 'print',
    plural: 'prints',
    desc: 'Colored ID print, resized to 2.13 × 3.37 inches.',
    opts: [
      { label: 'Short / A4 paper', price: 5 },
      { label: 'Long paper', price: 6 },
    ],
  },
  {
    id: 'glossy',
    group: 'extra',
    name: 'A4 glossy paper, full image',
    noun: 'sheet',
    plural: 'sheets',
    desc: 'Printed on A4 glossy paper.',
    opts: [
      { label: 'Certificate', price: 25 },
      { label: 'Full picture only', price: 35 },
      { label: '2 pcs passport ID', price: 50 },
      { label: '2 pcs 2×2 + 4 pcs 1×1', price: 50 },
    ],
  },
];

export const findProduct = (id) => products.find((p) => p.id === id);

// unit price × quantity, minus discount percent, rounded to centavos
export function computeTotal(unit, qty, discountPct = 0) {
  return Math.round(unit * qty * (1 - discountPct / 100) * 100) / 100;
}
