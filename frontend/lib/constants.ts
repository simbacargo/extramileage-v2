// Filter option lists mirrored from the Django model choices.
export const FUELS: [string, string][] = [
  ["Petrol", "Petrol"],
  ["Diesel", "Diesel"],
  ["Hybrid", "Hybrid"],
  ["Electric", "Electric"],
  ["Plug-in Hybrid", "Plug-in Hybrid"],
];

export const TRANSMISSIONS: [string, string][] = [
  ["Automatic", "Automatic"],
  ["Manual", "Manual"],
  ["CVT", "CVT"],
  ["AMT", "AMT"],
];

export const CONDITIONS: [string, string][] = [
  ["new", "New"],
  ["used", "Used"],
  ["certified", "Certified Pre-Owned"],
];

export const CAR_SORTS: [string, string][] = [
  ["newest", "Newest"],
  ["price_low", "Price ↑"],
  ["price_high", "Price ↓"],
  ["year_new", "Year"],
  ["mileage_low", "Lowest km"],
  ["popular", "Most viewed"],
];

export const PRODUCT_SORTS: [string, string][] = [
  ["newest", "Newest"],
  ["price_low", "Price ↑"],
  ["price_high", "Price ↓"],
  ["popular", "Most viewed"],
];
