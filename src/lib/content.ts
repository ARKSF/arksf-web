// Loads the content files in src/data, checks them and fills in the shared rules.
// A broken edit (missing field, price typed as text, unknown placeholder) stops the build with a message.
import { z } from 'astro/zod';
import { icons } from '../components/icons';
import siteJson from '../data/site.json';
import rulesJson from '../data/rules.json';
import pricingJson from '../data/pricing.json';
import teamJson from '../data/team.json';
import homeJson from '../data/home.json';
import bookingJson from '../data/booking.json';
import termsJson from '../data/terms.json';
import reviewsJson from '../data/reviews.json';
import photosJson from '../data/photos.json';
import pagesJson from '../data/pages.json';

const iconName = z.string().refine((n) => n in icons, (n) => ({ message: `unknown icon "${n}" (see src/components/icons.ts)` }));

const rulesSchema = z.object({
  cancelHours: z.number(),
  weeksPerMonth: z.string(),
  makeupMonths: z.number(),
  makeupMax: z.number(),
  groupMax: z.number(),
  termsValidFrom: z.string(),
});

const priceItem = z.object({ title: z.string(), meta: z.string(), price: z.number(), details: z.string().optional() });

const pricingSchema = z.object({
  consultations: z.object({ icon: iconName, label: z.string(), title: z.string(), description: z.string(), items: z.array(priceItem) }),
  trainings: z.object({ icon: iconName, badge: z.string(), label: z.string(), title: z.string(), description: z.string(), unit: z.string(), items: z.array(priceItem), footer: z.string() }),
  group: z.object({ icon: iconName, title: z.string(), description: z.string(), price: z.number(), unit: z.string() }),
  basics: z.array(z.string()),
});

const teamSchema = z.array(z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  name: z.string(),
  fullName: z.string(),
  role: z.string(),
  roleFull: z.string(),
  photo: z.string(),
  photoPosition: z.string().optional(),
  tags: z.array(z.string()),
  bio: z.array(z.string()),
}));

function check<T>(name: string, schema: z.ZodType<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    const issues = result.error.issues.map((i) => `  ${i.path.join('.')}: ${i.message}`).join('\n');
    throw new Error(`src/data/${name} is invalid:\n${issues}`);
  }
  return result.data;
}

export const site = siteJson;
export const rules = check('rules.json', rulesSchema, rulesJson);
export const pricing = check('pricing.json', pricingSchema, pricingJson);
export const team = check('team.json', teamSchema, teamJson);
export const home = homeJson;
export const booking = bookingJson;
export const terms = termsJson;
export const pages = pagesJson;
export const photos = photosJson;

const reviewsSchema = z.object({
  googleUrl: z.string(),
  /** Average and number of Google reviews (update by hand, Google does not push changes). */
  rating: z.number().min(1).max(5).optional(),
  count: z.number().int().min(0).optional(),
  items: z.array(z.object({
    name: z.string(),
    text: z.string(),
    rating: z.number().int().min(1).max(5),
    date: z.string().optional(),
    source: z.string().optional(),
  })),
});
export const reviews = check('reviews.json', reviewsSchema, reviewsJson);

/** Replaces {placeholders} with values from rules.json. Unknown names stop the build. */
export function fill(text: string): string {
  return text.replace(/\{(\w+)\}/g, (_, key: string) => {
    if (!(key in rules)) throw new Error(`Unknown placeholder {${key}} in "${text}" (allowed: ${Object.keys(rules).join(', ')})`);
    return String(rules[key as keyof typeof rules]);
  });
}

/** Splits text with [label](href) links into parts for rendering. */
export function parts(text: string): Array<{ text: string; href?: string }> {
  const out: Array<{ text: string; href?: string }> = [];
  let last = 0;
  for (const m of text.matchAll(/\[([^\]]+)\]\(([^)]+)\)/g)) {
    if (m.index! > last) out.push({ text: text.slice(last, m.index) });
    out.push({ text: m[1], href: m[2] });
    last = m.index! + m[0].length;
  }
  if (last < text.length) out.push({ text: text.slice(last) });
  return out;
}

/** 1600 -> "1 600 Kč" */
export function price(value: number): string {
  return `${String(value).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} Kč`;
}
