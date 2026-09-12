import {
  Product,
  ProductCategory,
  SiteSettings,
  DEFAULT_SITE_SETTINGS,
  SITE_SETTINGS_ID,
  isSiteSettingsItem,
} from '../types';

export function parseSiteSettingsRow(items: unknown[]): {
  settings: SiteSettings;
  products: Product[];
} {
  const rows = (items || []) as (Product & { siteSettings?: SiteSettings })[];
  const settingsRow = rows.find((item) => isSiteSettingsItem(item));
  const settings: SiteSettings = settingsRow?.siteSettings
    ? {
        ...DEFAULT_SITE_SETTINGS,
        ...settingsRow.siteSettings,
        categoryLabels: {
          ...DEFAULT_SITE_SETTINGS.categoryLabels,
          ...settingsRow.siteSettings.categoryLabels,
        },
        brandLabels: {
          ...DEFAULT_SITE_SETTINGS.brandLabels,
          ...settingsRow.siteSettings.brandLabels,
        },
      }
    : DEFAULT_SITE_SETTINGS;
  return {
    settings,
    products: rows.filter((item) => !isSiteSettingsItem(item)),
  };
}

export function buildSiteSettingsItem(next: SiteSettings) {
  return {
    id: SITE_SETTINGS_ID,
    sku: 'JR-SITE-SETTINGS',
    name: '__SITE_SETTINGS__',
    slug: 'site-settings',
    brand: 'JARRO',
    category: 'kurtis' as ProductCategory,
    subtitle: 'Internal storefront settings',
    description: 'Not a sellable product.',
    story: '',
    price: 0,
    images: ['https://placehold.co/800x1000/FBE8E4/241A1E?text=JARRO'],
    variants: [],
    stock: 0,
    rating: 0,
    reviewCount: 0,
    tags: ['__settings__'],
    siteSettings: next,
  };
}

export function categoryLabelOf(settings: SiteSettings, id: ProductCategory | 'all'): string {
  if (id === 'all') return 'All Catalog';
  return settings.categoryLabels[id] || DEFAULT_SITE_SETTINGS.categoryLabels[id] || id;
}

export function brandLabelOf(settings: SiteSettings, name: string): string {
  return settings.brandLabels[name] || name;
}
