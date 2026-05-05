"""
Travel AI Tamil Nadu — Data Migration Script v2
Extracts ALL district and attraction data from the frontend districts.js
and inserts it into the SQLite/PostgreSQL database.

Handles both:
- Chennai-style detailed places (with lat/lng per place)
- Other districts with only coordinates + gems

Usage:
    cd backend
    python migrate_districts.py
"""
import sqlite3
import os
import re

DB_PATH = os.path.join(os.path.dirname(__file__), "tourism.db")
DISTRICTS_JS = os.path.join(os.path.dirname(__file__), "..", "src", "data", "districts.js")


def migrate_to_db(db_path: str, districts_file: str):
    """Main migration: extract districts.js data and insert into SQLite."""
    print(f"Reading districts from: {districts_file}")

    if not os.path.exists(districts_file):
        print(f"ERROR: {districts_file} not found!")
        return

    with open(districts_file, "r", encoding="utf-8") as f:
        content = f.read()

    # Connect to database
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    # Ensure attractions table exists
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS attractions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            latitude REAL,
            longitude REAL,
            category TEXT,
            rating REAL,
            description TEXT,
            address TEXT,
            opening_hours TEXT,
            district TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # Also create a districts table for the top-level district metadata
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS districts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            district_id TEXT UNIQUE,
            name TEXT NOT NULL,
            tagline TEXT,
            region TEXT,
            image TEXT,
            best_place TEXT,
            description TEXT,
            best_time TEXT,
            food TEXT,
            safety_score REAL,
            trending INTEGER DEFAULT 0,
            trend_reason TEXT,
            latitude REAL,
            longitude REAL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # ─── Parse district blocks ────────────────────────────────────────────
    # Each district starts with { id: "xxx",
    district_blocks = re.split(r'\n\s*\{[\s\n]*id\s*:', content)
    
    inserted_places = 0
    inserted_districts = 0
    skipped_places = 0

    for block in district_blocks[1:]:  # skip preamble before first district
        # Extract district-level fields
        dist_id = _extract(r'^\s*"([^"]+)"', block) or "unknown"
        name = _extract(r'name\s*:\s*"([^"]+)"', block) or "Unknown"
        tagline = _extract(r'tagline\s*:\s*"([^"]*)"', block) or ""
        region = _extract(r'region\s*:\s*"([^"]*)"', block) or ""
        image = _extract(r'image\s*:\s*"([^"]*)"', block) or ""
        best_place = _extract(r'bestPlace\s*:\s*"([^"]*)"', block) or ""
        description = _extract(r'description\s*:\s*"((?:[^"\\]|\\.)*)"', block) or ""
        best_time = _extract(r'bestTime\s*:\s*"([^"]*)"', block) or ""
        food = _extract(r'food\s*:\s*"([^"]*)"', block) or ""
        safety_str = _extract(r'safetyScore\s*:\s*([\d.]+)', block)
        safety = float(safety_str) if safety_str else None
        trending = 1 if re.search(r'trending\s*:\s*true', block) else 0
        trend_reason = _extract(r'trendReason\s*:\s*"([^"]*)"', block) or ""

        # Coordinates
        lat_str = _extract(r'coordinates\s*:\s*\{[^}]*lat\s*:\s*([\d.]+)', block)
        lng_str = _extract(r'coordinates\s*:\s*\{[^}]*lng\s*:\s*([\d.]+)', block)
        lat = float(lat_str) if lat_str else None
        lng = float(lng_str) if lng_str else None

        # Insert district
        cursor.execute("SELECT id FROM districts WHERE name = ?", (name,))
        if not cursor.fetchone():
            cursor.execute("""
                INSERT INTO districts (district_id, name, tagline, region, image, best_place,
                    description, best_time, food, safety_score, trending, trend_reason, latitude, longitude)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (dist_id, name, tagline, region, image, best_place,
                  description[:1000], best_time, food, safety, trending, trend_reason, lat, lng))
            inserted_districts += 1

        # ─── Extract places (Chennai-style detailed places) ───────────────
        # Find all places within this district's "places: [...]" array
        places_section = re.search(r'places\s*:\s*\[', block)
        if places_section:
            place_iter = re.finditer(
                r'\{\s*\n?\s*name\s*:\s*"([^"]+)".*?'
                r'lat\s*:\s*([\d.]+).*?'
                r'lng\s*:\s*([\d.]+).*?'
                r'category\s*:\s*"([^"]*)".*?'
                r'description\s*:\s*"((?:[^"\\]|\\.)*)"',
                block[places_section.start():],
                re.DOTALL,
            )

            for pm in place_iter:
                p_name = pm.group(1)
                p_lat = float(pm.group(2))
                p_lng = float(pm.group(3))
                p_cat = pm.group(4)
                p_desc = pm.group(5)[:500]

                # Get optional rating
                rating_match = re.search(
                    r'name\s*:\s*"' + re.escape(p_name) + r'".*?rating\s*:\s*([\d.]+)',
                    block, re.DOTALL
                )
                p_rating = float(rating_match.group(1)) if rating_match else None

                # Check duplicate
                cursor.execute(
                    "SELECT id FROM attractions WHERE name = ? AND district = ?",
                    (p_name, name)
                )
                if cursor.fetchone():
                    skipped_places += 1
                    continue

                cursor.execute("""
                    INSERT INTO attractions (name, latitude, longitude, category, rating, description, district)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                """, (p_name, p_lat, p_lng, p_cat, p_rating, p_desc, name))
                inserted_places += 1

        # ─── Extract gems (simpler format for non-Chennai districts) ──────
        gems_section = re.search(r'gems\s*:\s*\[', block)
        if gems_section:
            gem_iter = re.finditer(
                r'\{\s*name\s*:\s*"([^"]+)"\s*,\s*type\s*:\s*"([^"]+)"\s*,\s*desc\s*:\s*"((?:[^"\\]|\\.)*)"',
                block[gems_section.start():],
                re.DOTALL,
            )

            for gm in gem_iter:
                g_name = gm.group(1)
                g_type = gm.group(2)
                g_desc = gm.group(3)[:500]

                # Check duplicate
                cursor.execute(
                    "SELECT id FROM attractions WHERE name = ? AND district = ?",
                    (g_name, name)
                )
                if cursor.fetchone():
                    skipped_places += 1
                    continue

                # Use district coordinates (gems don't have individual coords)
                cursor.execute("""
                    INSERT INTO attractions (name, latitude, longitude, category, description, district)
                    VALUES (?, ?, ?, ?, ?, ?)
                """, (g_name, lat, lng, g_type, g_desc, name))
                inserted_places += 1

        # Also insert the "bestPlace" as an attraction if it's not already there
        if best_place and lat and lng:
            cursor.execute(
                "SELECT id FROM attractions WHERE name = ? AND district = ?",
                (best_place, name)
            )
            if not cursor.fetchone():
                cursor.execute("""
                    INSERT INTO attractions (name, latitude, longitude, category, description, district)
                    VALUES (?, ?, ?, ?, ?, ?)
                """, (best_place, lat, lng, "Highlight", f"The top attraction of {name}: {tagline}", name))
                inserted_places += 1

    conn.commit()

    # Print summary
    cursor.execute("SELECT COUNT(*) FROM attractions")
    total_places = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM districts")
    total_districts = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(DISTINCT district) FROM attractions")
    unique_dists = cursor.fetchone()[0]

    print(f"\n[OK] Migration Complete!")
    print(f"   Districts inserted:    {inserted_districts}")
    print(f"   Places inserted:       {inserted_places}")
    print(f"   Places skipped (dups): {skipped_places}")
    print(f"   Total districts in DB: {total_districts}")
    print(f"   Total attractions:     {total_places}")
    print(f"   Unique districts:      {unique_dists}")

    conn.close()


def _extract(pattern: str, text: str) -> str:
    """Extract a single regex match from text, or return None."""
    m = re.search(pattern, text)
    return m.group(1) if m else None


if __name__ == "__main__":
    migrate_to_db(DB_PATH, DISTRICTS_JS)
