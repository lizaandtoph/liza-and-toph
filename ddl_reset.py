import os, psycopg2
DB_URL = os.environ["DATABASE_URL"]
DDL = """
DROP TABLE IF EXISTS products;
CREATE TABLE products (
  id text PRIMARY KEY,
  name text,
  brand text,
  description text,
  price numeric,
  image_url text,
  categories text,
  age_range text,
  rating numeric,
  review_count integer,
  affiliate_url text,
  is_top_pick boolean,
  is_bestseller boolean,
  is_new boolean,
  min_age_months integer,
  max_age_months integer,
  age_range_category text,
  communication_levels text,
  motor_levels text,
  cognitive_levels text,
  social_emotional_levels text,
  play_type_tags text,
  complexity_level text,
  challenge_rating integer,
  attention_duration text,
  stimulation_level text,
  structure_preference text,
  energy_requirement text,
  sensory_compatibility text,
  social_context text,
  cooperation_required boolean,
  safety_considerations text,
  special_needs_support text,
  intervention_focus text,
  noise_level text,
  mess_factor text,
  setup_time text,
  space_requirements text,
  is_liza_toph_certified boolean,
  status text
);
CREATE UNIQUE INDEX IF NOT EXISTS products_id_key ON products (id);
"""
with psycopg2.connect(DB_URL) as conn:
    with conn.cursor() as cur:
        for stmt in [s.strip() for s in DDL.split(";\n") if s.strip()]:
            cur.execute(stmt + ";")
    conn.commit()
print("products table reset on built-in DB.")
