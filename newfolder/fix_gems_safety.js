import fs from 'fs';

// Read the districts file
let content = fs.readFileSync('src/data/districts.js', 'utf8');

// Districts that need safetyScore added before gems: []
const districtsWithGems = {
    'ariy': 4.5,
    'cgl': 4.8,
    'chn': 4.2,
    'cbe': 4.6,
    'cud': 4.4,
    'din': 4.7,
    'kan': 4.9,
    'kpk': 4.8,
    'mdu': 4.7,
    'nil': 4.9,
    'ram': 4.6,
    'tha': 4.8
};

// Add safetyScore before gems: [] for each district
Object.keys(districtsWithGems).forEach(id => {
    const score = districtsWithGems[id];

    // Find the pattern: id: "xxx"...gems: [] without safetyScore in between
    const regex = new RegExp(
        `(id:\\s*"${id}"[^}]*?bestTime:[^,\\n]*,\\s*)(\\n\\s*gems:\\s*\\[\\])`,
        'gs'
    );

    const match = content.match(regex);
    if (match) {
        content = content.replace(regex, `$1\n        safetyScore: ${score},$2`);
        console.log(`✓ Added safetyScore to ${id}`);
    } else {
        console.log(`- Skipped ${id} (already has safetyScore or pattern not found)`);
    }
});

// Write back
fs.writeFileSync('src/data/districts.js', content, 'utf8');
console.log('\n✅ All safety scores added!');
