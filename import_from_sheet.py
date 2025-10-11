import os, io, requests, pandas as pd, sys
import psycopg2
from psycopg2.extras import execute_values

# Settings
MULTI_SELECT_AS_ARRAYS = True  # set True only if DB columns are text[] for the 7 multi-select fields
PROMOTE_ON_IMPORT = True  # set imported rows to "live"

CSV_URL = os.environ["SHEET_CSV_URL"]

# Determine which database to use
USE_PRODUCTION = "--production" in sys.argv or "--prod" in sys.argv or os.environ.get(
    "IMPORT_TO_PRODUCTION", "").lower() == "true"

if USE_PRODUCTION:
        # For production database, use PRODUCTION_DATABASE_URL if set, otherwise DATABASE_URL
        DB_URL = os.environ.get("PRODUCTION_DATABASE_URL") or os.environ.get(
            "DATABASE_URL")
        print("🚀 IMPORTING TO PRODUCTION DATABASE")
else:
        # For development database
        DB_URL = os.environ["DATABASE_URL"]
        print("🔧 IMPORTING TO DEVELOPMENT DATABASE")

# Column order (39 fields)
COLS = [
    'id', 'name', 'brand', 'description', 'price', 'image_url', 'categories',
    'age_range', 'rating', 'review_count', 'affiliate_url', 'is_top_pick',
    'is_bestseller', 'is_new', 'min_age_months', 'max_age_months',
    'age_range_category', 'communication_levels', 'motor_levels',
    'cognitive_levels', 'social_emotional_levels', 'play_type_tags',
    'complexity_level', 'challenge_rating', 'attention_duration',
    'stimulation_level', 'structure_preference', 'energy_requirement',
    'sensory_compatibility', 'social_context', 'cooperation_required',
    'safety_considerations', 'special_needs_support', 'intervention_focus',
    'noise_level', 'mess_factor', 'setup_time', 'space_requirements',
    'is_liza_toph_certified', 'status'
]

# Multi-select fields
ARRAY_FIELDS = {
    "categories", "play_type_tags", "sensory_compatibility", "social_context",
    "safety_considerations", "special_needs_support", "intervention_focus"
}

# Allowed enums
AL_DEV = {"emerging", "developing", "proficient", "advanced"}
AL_AGE_CAT = {
    "Newborn to 18 months", "18 months to 3 years", "2 to 5 years",
    "3 to 6 years", "4 to 7 years", "5 to 8 years", "6 to 9 years",
    "7 to 10 years", "8 to 11 years", "9 to 12 years", "10 to Early Teens",
    "Preteens to Older Teens"
}
AL_PLAY = {
    "pretend_play", "building_toys", "art_supplies", "active_play", "puzzles",
    "musical_toys", "sensory_toys", "group_games", "imagination",
    "construction", "crafts", "sports", "logic_games", "rhythm", "textures",
    "social_interaction"
}
AL_COMPLEX = {"simple", "moderate", "complex", "advanced", "expert"}
AL_ATTN = {
    "quick_activities", "medium_activities", "detailed_activities",
    "complex_projects", "advanced_building"
}
AL_STIM = {"low", "moderate", "high"}
AL_STRUCT = {"structured", "flexible", "open_ended"}
AL_ENERGY = {"sedentary", "moderate", "active", "high_energy"}
AL_SENS = {"gentle", "moderate", "intense"}
AL_SOC = {"solo_play", "paired_play", "group_play", "family_play"}
AL_SAFE = {"choking_hazard", "supervision_required", "small_parts"}
AL_NEEDS = {
    "autism_friendly", "sensory_processing", "speech_therapy", "motor_therapy"
}
AL_INT = {"communication", "motor_skills", "social_skills", "behavior_support"}
AL_NOISE = {"quiet", "moderate", "loud"}
AL_MESS = {"minimal", "moderate", "messy"}
AL_SETUP = {"immediate", "quick", "moderate", "extended"}
AL_SPACE = {"small", "medium", "large", "outdoor"}


def norm_text(s):
        if s is None: return None
        return (str(s).replace("\u2019", "'").replace("\u2018", "'").replace(
            "\u201c", '"').replace("\u201d",
                                   '"').replace("\u2013",
                                                "-").replace("\u2014", "-"))


def to_bool(v):
        s = str(v).strip().lower()
        if s in ("true", "t", "1", "yes", "y"): return True
        if s in ("false", "f", "0", "no", "n"): return False
        return None


def to_num(v, is_int=False):
        if pd.isna(v): return None
        s = str(v).strip().replace("$", "").replace(",", "")
        if s == "": return None
        try:
                return int(float(s)) if is_int else float(s)
        except:
                return None


def norm_multi(s):
        if pd.isna(s) or str(s).strip() == "":
                return ""
        items, seen = [], set()
        for p in str(s).split(","):
                t = p.strip()
                if t and t not in seen:
                        seen.add(t)
                        items.append(t)
        return ", ".join(items)


def filter_multi(value, allowed):
        if value is None or str(value).strip() == "":
                return ""
        kept = []
        for t in str(value).split(","):
                t = t.strip()
                if t in allowed and t not in kept:
                        kept.append(t)
        return ", ".join(kept)


def check_enum(value, allowed):
        if value is None: return ""
        v = str(value).strip()
        return v if v in allowed else ""


def calc_age_category(min_m, max_m):
        if min_m is None or max_m is None:
                return ""
        end_y = max_m / 12.0
        if end_y <= 1.5: return "Newborn to 18 months"
        if end_y <= 3: return "18 months to 3 years"
        if end_y <= 5: return "2 to 5 years"
        if end_y <= 6: return "3 to 6 years"
        if end_y <= 7: return "4 to 7 years"
        if end_y <= 8: return "5 to 8 years"
        if end_y <= 9: return "6 to 9 years"
        if end_y <= 10: return "7 to 10 years"
        if end_y <= 11: return "8 to 11 years"
        if end_y <= 12: return "9 to 12 years"
        if end_y <= 13: return "10 to Early Teens"
        return "Preteens to Older Teens"


def convert_google_drive_url(url):
        """Convert Google Drive share links to direct image URLs."""
        if pd.isna(url) or not url:
                return url
        
        url_str = str(url).strip()
        
        # Skip if not a Google Drive URL
        if 'drive.google.com' not in url_str:
                return url_str
        
        # Already in correct format
        if 'drive.google.com/uc?export=view&id=' in url_str:
                return url_str
        
        # Extract file ID from various Google Drive URL formats
        file_id = None
        
        # Format: https://drive.google.com/file/d/FILE_ID/view
        if '/file/d/' in url_str:
                parts = url_str.split('/file/d/')
                if len(parts) > 1:
                        file_id = parts[1].split('/')[0].split('?')[0]
        
        # Format: https://drive.google.com/open?id=FILE_ID
        elif 'open?id=' in url_str:
                parts = url_str.split('open?id=')
                if len(parts) > 1:
                        file_id = parts[1].split('&')[0].split('#')[0]
        
        # Format: https://drive.google.com/uc?id=FILE_ID
        elif 'uc?id=' in url_str:
                parts = url_str.split('uc?id=')
                if len(parts) > 1:
                        file_id = parts[1].split('&')[0].split('#')[0]
        
        # If we found a file ID, convert to direct image URL
        if file_id:
                return f"https://drive.google.com/uc?export=view&id={file_id}"
        
        # Return original if we couldn't parse it
        return url_str


def load_csv(url):
        r = requests.get(url, timeout=30, allow_redirects=True)
        r.raise_for_status()
        df = pd.read_csv(io.StringIO(r.text))

        # keep rows with status approved or live
        s = df["status"].astype(str).str.lower().str.strip()
        df = df[s.isin({"approved", "live"})].copy()

        # normalize text fields
        text_cols = [
            "id", "name", "brand", "description", "image_url", "age_range",
            "affiliate_url", "age_range_category", "communication_levels",
            "motor_levels", "cognitive_levels", "social_emotional_levels",
            "complexity_level", "attention_duration", "stimulation_level",
            "structure_preference", "energy_requirement", "noise_level",
            "mess_factor", "setup_time", "space_requirements", "status",
            "categories", "play_type_tags", "sensory_compatibility",
            "social_context", "safety_considerations", "special_needs_support",
            "intervention_focus"
        ]
        for c in text_cols:
                if c in df.columns:
                        df[c] = df[c].apply(lambda x: ""
                                            if pd.isna(x) else norm_text(x))

        # Convert Google Drive URLs to direct image URLs
        if "image_url" in df.columns:
                df["image_url"] = df["image_url"].apply(convert_google_drive_url)

        # clean multi selects then enforce allowlists
        for c in [
            "categories", "play_type_tags", "sensory_compatibility",
            "social_context", "safety_considerations", "special_needs_support",
            "intervention_focus"
        ]:
                if c in df.columns:
                        df[c] = df[c].apply(norm_multi)

        df["communication_levels"] = df["communication_levels"].apply(
            lambda v: check_enum(v, AL_DEV))
        df["motor_levels"] = df["motor_levels"].apply(
            lambda v: check_enum(v, AL_DEV))
        df["cognitive_levels"] = df["cognitive_levels"].apply(
            lambda v: check_enum(v, AL_DEV))
        df["social_emotional_levels"] = df["social_emotional_levels"].apply(
            lambda v: check_enum(v, AL_DEV))
        df["complexity_level"] = df["complexity_level"].apply(
            lambda v: check_enum(v, AL_COMPLEX))
        df["attention_duration"] = df["attention_duration"].apply(
            lambda v: check_enum(v, AL_ATTN))
        df["stimulation_level"] = df["stimulation_level"].apply(
            lambda v: check_enum(v, AL_STIM))
        df["structure_preference"] = df["structure_preference"].apply(
            lambda v: check_enum(v, AL_STRUCT))
        df["energy_requirement"] = df["energy_requirement"].apply(
            lambda v: check_enum(v, AL_ENERGY))
        df["noise_level"] = df["noise_level"].apply(
            lambda v: check_enum(v, AL_NOISE))
        df["mess_factor"] = df["mess_factor"].apply(
            lambda v: check_enum(v, AL_MESS))
        df["setup_time"] = df["setup_time"].apply(
            lambda v: check_enum(v, AL_SETUP))
        df["space_requirements"] = df["space_requirements"].apply(
            lambda v: check_enum(v, AL_SPACE))

        df["play_type_tags"] = df["play_type_tags"].apply(
            lambda v: filter_multi(v, AL_PLAY))
        df["safety_considerations"] = df["safety_considerations"].apply(
            lambda v: filter_multi(v, AL_SAFE))
        df["special_needs_support"] = df["special_needs_support"].apply(
            lambda v: filter_multi(v, AL_NEEDS))
        df["intervention_focus"] = df["intervention_focus"].apply(
            lambda v: filter_multi(v, AL_INT))

        # age sanity and auto age_range_category if missing
        def fix_row(row):

                def to_int_or_none(x):
                        if pd.isna(x): return None
                        sx = str(x).strip()
                        if sx == "": return None
                        try:
                                return int(float(sx))
                        except:
                                return None

                minm = to_int_or_none(row.get("min_age_months"))
                maxm = to_int_or_none(row.get("max_age_months"))
                if minm is not None and maxm is not None and maxm < minm:
                        maxm = minm
                row["min_age_months"] = minm
                row["max_age_months"] = maxm
                if not row.get("age_range_category") or row[
                    "age_range_category"] not in AL_AGE_CAT:
                        row["age_range_category"] = calc_age_category(
                            minm, maxm)
                return row

        df = df.apply(fix_row, axis=1)

        if PROMOTE_ON_IMPORT:
                df.loc[:, "status"] = "live"

        # ensure all required columns exist
        missing = [c for c in COLS if c not in df.columns]
        if missing:
                raise SystemExit(f"Missing columns in sheet: {missing}")

        # keep only the expected columns in order
        df = df[COLS].copy()
        return df


def row_to_tuple(row):
        out = []
        for c in COLS:
                v = row[c]
                if c in ("price", "rating"):
                        out.append(to_num(v, is_int=False))
                elif c in ("review_count", "min_age_months", "max_age_months",
                           "challenge_rating"):
                        out.append(to_num(v, is_int=True))
                elif c in ("is_top_pick", "is_bestseller", "is_new",
                           "cooperation_required", "is_liza_toph_certified"):
                        out.append(to_bool(v))
                elif c in ARRAY_FIELDS:
                        if MULTI_SELECT_AS_ARRAYS:
                                if pd.isna(v) or str(v).strip() == "":
                                        out.append([])
                                else:
                                        out.append([
                                            p.strip()
                                            for p in str(v).split(",")
                                            if p.strip()
                                        ])
                        else:
                                out.append("" if pd.isna(v) else str(v))
                else:
                        s = None if (pd.isna(v)
                                     or str(v) == "") else norm_text(v)
                        out.append(s)
        return tuple(out)


def upsert(df):
        if df.empty:
                print("No approved rows to import.")
                return
        rows = [row_to_tuple(r) for _, r in df.iterrows()]
        col_list = ", ".join(f'"{c}"' for c in COLS)
        set_clause = ", ".join(f'"{c}" = EXCLUDED."{c}"' for c in COLS
                               if c != "id")
        sql = f'INSERT INTO products ({col_list}) VALUES %s ON CONFLICT ("id") DO UPDATE SET {set_clause};'

        print(f"Connecting to database...")
        try:
                with psycopg2.connect(DB_URL) as conn:
                        with conn.cursor() as cur:
                                execute_values(cur, sql, rows)
                        conn.commit()
                print(
                    f"✅ Successfully upserted {len(rows)} rows to {'PRODUCTION' if USE_PRODUCTION else 'DEVELOPMENT'} database."
                )
        except Exception as e:
                print(f"❌ Error connecting to database: {e}")
                if USE_PRODUCTION:
                        print("\nℹ️  To import to production, you need to:")
                        print(
                            "   1. Get production database credentials from your Replit App"
                        )
                        print(
                            "   2. Set PRODUCTION_DATABASE_URL secret with the production connection string"
                        )
                        print(
                            "   3. Run: python import_from_sheet.py --production"
                        )
                raise


def ensure_unique_id():
        q = 'CREATE UNIQUE INDEX IF NOT EXISTS products_id_key ON products (id);'
        with psycopg2.connect(DB_URL) as conn:
                with conn.cursor() as cur:
                        cur.execute(q)
                conn.commit()


if __name__ == "__main__":
        print("\n" + "=" * 60)
        print(f"📦 PRODUCT IMPORT SCRIPT")
        print("=" * 60)
        print(
            f"Target: {'PRODUCTION' if USE_PRODUCTION else 'DEVELOPMENT'} database"
        )

        if USE_PRODUCTION and not os.environ.get("PRODUCTION_DATABASE_URL"):
                print("\n⚠️  WARNING: PRODUCTION_DATABASE_URL not set!")
                print(
                    "This will attempt to use DATABASE_URL (development database)."
                )
                print(
                    "To import to production, set PRODUCTION_DATABASE_URL secret."
                )
                response = input("\nContinue anyway? (yes/no): ")
                if response.lower() not in ['yes', 'y']:
                        print("❌ Aborted.")
                        sys.exit(0)

        print(f"\nFetching data from CSV...")
        ensure_unique_id()
        df = load_csv(CSV_URL)
        print(f"Found {len(df)} approved/live products to import")
        upsert(df)
        print("\n" + "=" * 60)
        print("✅ IMPORT COMPLETE")
        print("=" * 60 + "\n")
