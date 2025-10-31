// server/storage/seed.ts
import 'dotenv/config';
import { db } from './db'; // your Drizzle/ORM connection
import { milestones, products } from './schema'; // adjust to your tables
import { eq } from 'drizzle-orm';

const ENV = process.env.NODE_ENV ?? 'development';
const ALLOW = process.env.ALLOW_SEED === 'true';

// Hard stop in production
if (ENV === 'production') {
  console.error('[SEED] Refusing to seed in production.');
  process.exit(1);
}
if (!ALLOW) {
  console.error('[SEED] Set ALLOW_SEED=true to run seeding.');
  process.exit(1);
}

async function upsertMilestone(m: {
  id: string; title: string; ageRange: string; domain: string;
}) {
  const existing = await db.select().from(milestones).where(eq(milestones.id, m.id));
  if (existing.length === 0) {
    await db.insert(milestones).values(m);
    console.log('[SEED] milestone inserted', m.id);
  } else {
    await db.update(milestones).set(m).where(eq(milestones.id, m.id));
    console.log('[SEED] milestone updated', m.id);
  }
}

async function upsertProduct(p: {
  id: string;
  name: string;
  brand?: string | null;
  ageRange?: string | null;
  minAgeMonths?: number | null;
  maxAgeMonths?: number | null;
  categories?: string[] | string | null;
  imageUrl?: string | null;
  affiliateUrl?: string | null;
  tpvTier?: 'Platinum'|'Gold'|'Silver'|null;
}) {
  const existing = await db.select().from(products).where(eq(products.id, p.id));
  if (existing.length === 0) {
    await db.insert(products).values(p);
    console.log('[SEED] product inserted', p.id);
  } else {
    await db.update(products).set(p).where(eq(products.id, p.id));
    console.log('[SEED] product updated', p.id);
  }
}

async function main() {
  // 🔽 Replace with your real seed lists
  const demoMilestones = [
    { id: 'ms_demo_36_balance', title: 'Balances on one foot', ageRange: '3-6y', domain: 'Gross Motor' },
  ];
  const demoProducts = [
    { id: 'LT000-DEMO', name: 'Demo Stacking Cups', brand: 'DemoCo', ageRange: '0-1y', minAgeMonths: 0, maxAgeMonths: 12, categories: ['Sensory','Fine Motor'], imageUrl: '', affiliateUrl: '' },
  ];

  for (const m of demoMilestones) await upsertMilestone(m);
  for (const p of demoProducts) await upsertProduct(p);

  console.log('[SEED] complete');
  process.exit(0);
}

main().catch((e) => {
  console.error('[SEED] failed', e);
  process.exit(1);
});
