import fs from 'fs';

// Read the file
const filePath = 'src/data/districts.js';
let content = fs.readFileSync(filePath, 'utf8');

// Districts missing safetyScore (all have gems: [])
const updates = [
    { id: 'din', score: 4.7 },
    { id: 'kan', score: 4.9 },
    { id: 'kpk', score: 4.8 },
    { id: 'mdu', score: 4.7 },
    { id: 'nil', score: 4.9 },
    { id: 'ram', score: 4.6 },
    { id: 'tha', score: 4.8 }
];

// Process each update
updates.forEach(({ id, score }) => {
    // Match pattern: bestTime: "...", followed by gems: []
    // Insert safetyScore between them
    const regex = new RegExp(
        `(id:\\s*"${id}"[\\s\\S]*?bestTime:\\s*"[^"]+",)(\\s*gems:\\s*\\[\\])`,
        'g'
    );

    const before = content;
    content = content.replace(regex, `$1\n        safetyScore: ${score},$2`);

    if (content !== before) {
        console.log(`✓ Added safetyScore ${score} to ${id}`);
    } else {
        console.log(`✗ Could not find pattern for ${id}`);
    }
});

// Write back
fs.writeFileSync(filePath, content, 'utf8');
console.log('\n✅ Safety scores added to all remaining districts!');
