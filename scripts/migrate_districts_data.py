"""
Migration script to push districts.js data into the SQLite database.
Run: python migrate_districts_data.py
"""

import re
import sys
import os
import sqlite3

DISTRICTS_FILE = os.path.join(os.path.dirname(os.path.dirname(__file__)), "src", "data", "districts.js")
DB_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "backend", "tourism.db")

def extract_json_from_js(js_content):
    match = re.search(r'export const DISTRICTS = (\[[\s\S]*\]);', js_content)
    if match:
        return match.group(1)
    return None

def parse_js_array(js_text):
    result = []
    i = 0
    current = ""
    depth = 0
    in_string = False
    escape_next = False

    while i < len(js_text):
        char = js_text[i]

        if escape_next:
            current += char
            escape_next = False
            i += 1
            continue

        if char == '\\' and in_string:
            escape_next = True
            current += char
            i += 1
            continue

        if char == '"' and not escape_next:
            in_string = not in_string
            current += char
            i += 1
            continue

        if in_string:
            current += char
            i += 1
            continue

        if char in '{[(':
            depth += 1
            current += char
            i += 1
            continue

        if char in '}])':
            depth -= 1
            current += char
            i += 1
            continue

        if char == ',' and depth == 0:
            if current.strip():
                result.append(current.strip())
            current = ""
            i += 1
            continue

        current += char
        i += 1

    if current.strip():
        result.append(current.strip())
    return result

def extract_field(text, field_name):
    pattern = rf'{field_name}:\s*(["\[\{{])(.*?)(?=\n\s*,|\n\s*\}}|\n\s*\])'
    match = re.search(pattern, text, re.DOTALL)
    if not match:
        pattern = rf'{field_name}:\s*([^,\n]+)'
        match = re.search(pattern, text)
    if match:
        value = match.group(1).strip()
        if value.startswith('"') and value.endswith('"'):
            return value[1:-1]
        if value.startswith('['):
            items = re.findall(r'"([^"]+)"', value)
            return items
        if value == 'true':
            return True
        if value == 'false':
            return False
        try:
            if '.' in value:
                return float(value)
            return int(value)
        except:
            return value
    return None

def clean_string(s):
    if s is None:
        return None
    s = s.replace('\\n', ' ').replace('\\"', '"').replace("'", "''")
    return s.strip()

def parse_district(text):
    return {
        'id': extract_field(text, 'id'),
        'name': clean_string(extract_field(text, 'name')),
        'tagline': clean_string(extract_field(text, 'tagline')),
        'region': extract_field(text, 'region'),
        'image': extract_field(text, 'image'),
        'bestPlace': clean_string(extract_field(text, 'bestPlace')),
        'description': clean_string(extract_field(text, 'description')),
        'weather_temp': extract_field(text, 'temp'),
        'bestTime': extract_field(text, 'bestTime'),
        'food': clean_string(extract_field(text, 'food')),
        'safetyScore': extract_field(text, 'safetyScore'),
        'trending': extract_field(text, 'trending'),
        'coordinates': extract_field(text, 'coordinates'),
    }

def parse_place(text, district_name):
    name = clean_string(extract_field(text, 'name'))
    return {
        'name': name,
        'latitude': extract_field(text, 'lat'),
        'longitude': extract_field(text, 'lng'),
        'category': extract_field(text, 'category'),
        'rating': extract_field(text, 'rating'),
        'description': clean_string(extract_field(text, 'description')),
        'address': clean_string(extract_field(text, 'location')),
        'opening_hours': clean_string(extract_field(text, 'timings')),
        'district': district_name,
    }

def run_migration():
    print("Starting migration from districts.js to database...")

    with open(DISTRICTS_FILE, 'r', encoding='utf-8') as f:
        js_content = f.read()

    json_str = extract_json_from_js(js_content)
    if not json_str:
        print("ERROR: Could not find DISTRICTS export in districts.js")
        return

    district_texts = parse_js_array(json_str)
    print(f"Found {len(district_texts)} districts")

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='attractions'")
    if not cursor.fetchone():
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS attractions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name VARCHAR(255),
                latitude FLOAT,
                longitude FLOAT,
                category VARCHAR(100),
                rating FLOAT,
                description TEXT,
                address VARCHAR(500),
                opening_hours VARCHAR(100),
                district VARCHAR(100)
            )
        """)

    cursor.execute("DELETE FROM attractions")
    print("Cleared existing attractions table")

    places_added = 0

    for dt in district_texts:
        district = parse_district(dt)
        if not district['name']:
            continue

        places_match = re.search(r'places:\s*\[([\s\S]*?)\]', dt)
        if places_match:
            places_text = places_match.group(1)
            place_texts = parse_js_array(places_text)

            for pt in place_texts:
                place = parse_place(pt, district['name'])
                if place['name']:
                    cursor.execute("""
                        INSERT INTO attractions (name, latitude, longitude, category, rating, description, address, opening_hours, district)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """, (
                        place['name'],
                        place['latitude'],
                        place['longitude'],
                        place['category'],
                        place['rating'],
                        place['description'],
                        place['address'],
                        place['opening_hours'],
                        place['district'],
                    ))
                    places_added += 1

        cursor.execute("""
            INSERT INTO attractions (name, latitude, longitude, category, rating, description, district)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            district['bestPlace'] or district['name'],
            district['coordinates']['lat'] if district['coordinates'] else None,
            district['coordinates']['lng'] if district['coordinates'] else None,
            'District',
            district['safetyScore'],
            district['description'],
            district['name'],
        ))
        places_added += 1

    conn.commit()
    print(f"Migration complete! Added {places_added} places to the database.")

    cursor.execute("SELECT COUNT(*) FROM attractions")
    count = cursor.fetchone()[0]
    print(f"Total attractions in database: {count}")

    conn.close()

if __name__ == "__main__":
    run_migration()