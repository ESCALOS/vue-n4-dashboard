export const SHIPPING_LINES = [
  { code: "CMA", name: "CMA CGM S.A.", gkey: 5 },
  { code: "EVE", name: "Evergreen Marine", gkey: 37254 },
  { code: "MAE", name: "MAERSK LINE", gkey: 1 },
  { code: "MSC", name: "MEDITERRANEAN SHIPPING CO.", gkey: 2 },
  { code: "ONE", name: "Ocean Network Express", gkey: 15 },
  { code: "SML", name: "SEABOARD_MARINE_LTDO", gkey: 36647 },
  { code: "STM", name: "Seatrade Shipping Services", gkey: 37258 },
  { code: "ZIM", name: "Zim Integrated Shipping Services", gkey: 37257 },
] as const;
export type ShippingLine = (typeof SHIPPING_LINES)[number]["code"];
