export interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price?: number;
  priceHalf?: number;
  priceFull?: number;
  allergens?: number[];
  available: boolean;
  badges?: string[];
}

export interface Section {
  id: string;
  name: string;
  icon: string;
  order: number;
  visible: boolean;
  hasDualPricing?: boolean;
  priceLabelSmall?: string;
  priceLabelFull?: string;
  items: MenuItem[];
}

export interface Allergen {
  id: number;
  name: string;
  icon: string;
}

export interface MenuConfig {
  barName: string;
  subtitle: string;
  adminPasswordHash: string;
  footerNote?: string;
  allergenNote?: string;
}

export interface MenuData {
  config: MenuConfig;
  allergens: Allergen[];
  sections: Section[];
}
