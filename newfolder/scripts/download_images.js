import fs from 'fs';
import https from 'https';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Destination directory
const DEST_DIR = path.join(__dirname, '../public/images');

if (!fs.existsSync(DEST_DIR)) {
    fs.mkdirSync(DEST_DIR, { recursive: true });
}

const DISTRICTS_IMAGES = [
    { id: "ariy", url: "https://images.unsplash.com/photo-1590050752117-238cb0fb23b5?q=80&w=600&auto=format&fit=crop" },
    { id: "cgl", url: "https://images.unsplash.com/photo-1605335832731-50e56616421a?q=80&w=600&auto=format&fit=crop" },
    { id: "chn", url: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?q=80&w=600&auto=format&fit=crop" },
    { id: "cbe", url: "https://images.unsplash.com/photo-1582234032624-814d2328404a?q=80&w=600&auto=format&fit=crop" },
    { id: "cud", url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=600&auto=format&fit=crop" },
    { id: "din", url: "https://images.unsplash.com/photo-1579698547372-bf9754f19b22?q=80&w=600&auto=format&fit=crop" },
    { id: "dro", url: "https://images.unsplash.com/photo-1623949820353-27f999813247?q=80&w=600&auto=format&fit=crop" },
    { id: "kal", url: "https://images.unsplash.com/photo-1604928156633-eadd06d51624?q=80&w=600&auto=format&fit=crop" },
    { id: "kan", url: "https://images.unsplash.com/photo-1621836816999-0ee61111663f?q=80&w=600&auto=format&fit=crop" },
    { id: "kpk", url: "https://images.unsplash.com/photo-1548685913-fe78d6badd69?q=80&w=600&auto=format&fit=crop" },
    { id: "kar", url: "https://images.unsplash.com/photo-1596716037042-491959715ad0?q=80&w=600&auto=format&fit=crop" },
    { id: "kri", url: "https://images.unsplash.com/photo-1619441199324-4f0578893962?q=80&w=600&auto=format&fit=crop" },
    { id: "mdu", url: "https://images.unsplash.com/photo-1598287754388-752163b2f561?q=80&w=600&auto=format&fit=crop" },
    { id: "may", url: "https://images.unsplash.com/photo-1605626889417-3bf751241f32?q=80&w=600&auto=format&fit=crop" },
    { id: "nag", url: "https://images.unsplash.com/photo-1616853941457-30263f3c644d?q=80&w=600&auto=format&fit=crop" },
    { id: "nil", url: "https://images.unsplash.com/photo-1562095646-641575ca29c9?q=80&w=600&auto=format&fit=crop" },
    { id: "per", url: "https://images.unsplash.com/photo-1615556276707-160655325854?q=80&w=600&auto=format&fit=crop" },
    { id: "pud", url: "https://images.unsplash.com/photo-1603565017128-4c91a78ee95a?q=80&w=600&auto=format&fit=crop" },
    { id: "ram", url: "https://images.unsplash.com/photo-1565355604938-1ee460835ca6?q=80&w=600&auto=format&fit=crop" },
    { id: "sal", url: "https://images.unsplash.com/photo-1596716037042-491959715ad0?q=80&w=600&auto=format&fit=crop" },
    { id: "siv", url: "https://images.unsplash.com/photo-1605626889417-3bf751241f32?q=80&w=600&auto=format&fit=crop" },
    { id: "ten", url: "https://images.unsplash.com/photo-1628178652317-063994348270?q=80&w=600&auto=format&fit=crop" },
    { id: "tha", url: "https://images.unsplash.com/photo-1605626889417-3bf751241f32?q=80&w=600&auto=format&fit=crop" },
    { id: "the", url: "https://images.unsplash.com/photo-1616429567994-55f69c542157?q=80&w=600&auto=format&fit=crop" },
    { id: "tir", url: "https://images.unsplash.com/photo-1571616886475-4b130095861b?q=80&w=600&auto=format&fit=crop" },
    { id: "tiru", url: "https://images.unsplash.com/photo-1593348639575-cf0b9f52f3dc?q=80&w=600&auto=format&fit=crop" },
    { id: "tirup", url: "https://images.unsplash.com/photo-1619441199324-4f0578893962?q=80&w=600&auto=format&fit=crop" },
    { id: "tirupp", url: "https://images.unsplash.com/photo-1616853941457-30263f3c644d?q=80&w=600&auto=format&fit=crop" },
    { id: "tiruva", url: "https://images.unsplash.com/photo-1627914046467-b89531502473?q=80&w=600&auto=format&fit=crop" },
    { id: "vel", url: "https://images.unsplash.com/photo-1590422977797-285b73676c8c?q=80&w=600&auto=format&fit=crop" },
    { id: "vil", url: "https://images.unsplash.com/photo-1615556276707-160655325854?q=80&w=600&auto=format&fit=crop" },
    { id: "vir", url: "https://images.unsplash.com/photo-1624867455850-25275817c180?q=80&w=600&auto=format&fit=crop" }
];

const downloadImage = (url, filepath) => {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            if (res.statusCode === 200) {
                res.pipe(fs.createWriteStream(filepath))
                    .on('error', reject)
                    .once('close', () => resolve(filepath));
            } else {
                res.resume();
                reject(new Error(`Request Failed With a Status Code: ${res.statusCode}`));
            }
        });
    });
};

console.log(`Starting download of ${DISTRICTS_IMAGES.length} images...`);

(async () => {
    for (const item of DISTRICTS_IMAGES) {
        const filepath = path.join(DEST_DIR, `${item.id}.jpg`);
        try {
            await downloadImage(item.url, filepath);
            console.log(`Downloaded: ${item.id}`);
        } catch (e) {
            console.error(`Failed: ${item.id}`, e.message);
        }
    }
    console.log('All downloads processed.');
})();
