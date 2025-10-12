// server/mirror-ids.mjs (ESM)
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.join(__dirname, 'db.json');
const OUT = path.join(__dirname, 'db.runtime.json');

const PK = {
    auto_repairs: 'id_auto_repair',
    locations: 'id_location',
    memberships: 'id_membership',
    notifications: 'id_notification',
    payments: 'id_payment',
    vehicles: 'id_vehicle',
    roles: 'id_role',
    services: 'id_service',
    user_accounts: 'id_user_account',
    users: 'id_user',
    visits: 'id_visit',
};

const raw = await fs.readFile(SRC, 'utf8');
const db = JSON.parse(raw);

for (const [collection, pk] of Object.entries(PK)) {
    const arr = db[collection];
    if (!Array.isArray(arr)) continue;
    db[collection] = arr.map((row) => ({
        ...row,
        id: row?.[pk] ?? row?.id ?? null,
    }));
}

await fs.writeFile(OUT, JSON.stringify(db, null, 2), 'utf8');
console.log('db.runtime.json generated in', OUT);
