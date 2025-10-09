import os, psycopg2

DB_URL = os.environ["DATABASE_URL"]

DDL = [
"CREATE TABLE IF NOT EXISTS products (id text PRIMARY KEY);",
"ALTER TABLE products ADD COLUMN IF NOT EXISTS name text;",
"ALTER TABLE products ADD COLUMN IF NOT EXISTS brand text;",
"ALTER TABLE products ADD COLUMN IF NOT EXISTS description text;",
"ALTER TABLE products ADD COLUMN IF NOT EXISTS price numeric;",
"ALTER TABLE products ADD COLUMN IF NOT EXISTS image_url text;",
"ALTER TABLE products ADD COLUMN IF NOT EXISTS categories text;",
"ALTER TABLE products ADD COLUMN IF NOT EXISTS age_range text;",
"ALTER TABLE products ADD COLUMN IF NOT EXISTS rating numeric;",
"ALTER TABLE products ADD COLUMN IF NOT EXISTS review_count integer;",
"ALTER TABLE products ADD COLUMN IF NOT EXISTS affiliate_url text;",
"ALTER TABLE products ADD COLUMN IF NOT EXISTS is_top_pick boolean;",
"ALTER TABLE products ADD COLUMN IF NOT EXISTS is_bestseller boolean;",
"ALTER TABLE products ADD COLUMN IF NOT EXISTS is_new boolean;",
"ALTER TABLE products ADD COLUMN IF NOT EXISTS min_age_months integer;",
"ALTER TABLE products ADD COLUMN IF NOT EXISTS max_age_months integer;",
"ALTER TABLE products ADD COLUMN IF NOT EXISTS age_range_category text;",
"ALTER TABLE products ADD COLUMN IF NOT EXISTS communication_levels text;",
"ALTER TABLE products ADD COLUMN IF NOT EXISTS motor_levels text;",
"ALTER TABLE products ADD COLUMN IF NOT EXISTS cognitive_levels text;",
"ALTER TABLE products ADD COLUMN IF NOT EXISTS social_emotional_levels text;",
"ALTER TABLE products ADD COLUMN IF NOT EXISTS play_type_tags text;",
"ALTER TABLE products ADD COLUMN IF NOT EXISTS complexity_level text;",
"ALTER TABLE products ADD COLUMN IF NOT EXISTS challenge_rating integer;",
"ALTER TABLE products ADD COLUMN IF NOT EXISTS attention_duration text;",
"ALTER TABLE products ADD COLUMN IF NOT EXISTS stimulation_level text;",
"ALTER TABLE products ADD COLUMN IF NOT EXISTS structure_preference text;",
"ALTER TABLE products ADD COLUMN IF NOT EXISTS energy_requirement text;",
"ALTER TABLE products ADD COLUMN IF NOT EXISTS sensory_compatibility text;",
"ALTER TABLE products ADD COLUMN IF NOT EXISTS social_context text;",
"ALTER TABLE products ADD COLUMN IF NOT EXISTS cooperation_required boolean;",
"ALTER TABLE products ADD COLUMN IF NOT EXISTS safety_considerations text;",
"ALTER TABLE products ADD COLUMN IF NOT EXISTS special_needs_support text;",
"ALTER TABLE products ADD COLUMN IF NOT EXISTS intervention_focus text;",
"ALTER TABLE products ADD COLUMN IF NOT EXISTS noise_level text;",
"ALTER TABLE products ADD COLUMN IF NOT EXISTS mess_factor text;",
"ALTER TABLE products ADD COLUMN IF NOT EXISTS setup_time text;",
"ALTER TABLE products ADD COLUMN IF NOT EXISTS space_requirements text;",
"ALTER TABLE products ADD COLUMN IF NOT EXISTS is_liza_toph_certified boolean;",
"ALTER TABLE products ADD COLUMN IF NOT EXISTS status text;",
"CREATE UNIQUE INDEX IF NOT EXISTS products_id_key ON products (id);"
]

with psycopg2.connect(DB_URL) as conn:
    with conn.cursor() as cur:
        for stmt in DDL:
            cur.execute(stmt)
    conn.commit()
print("products table ready.")
