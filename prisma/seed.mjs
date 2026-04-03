import 'dotenv/config';
import pg from 'pg';
const { Client } = pg;

const client = new Client({ connectionString: process.env.DATABASE_URL });
await client.connect();

const COURSE_PARS = {
  "Bear Mountain Ranch": {
    total: 72,
    holes: [4, 4, 3, 4, 5, 4, 3, 5, 4, 4, 3, 4, 4, 5, 4, 4, 3, 5],
  },
  "Desert Canyon": {
    total: 72,
    holes: [4, 4, 5, 3, 4, 4, 5, 3, 4, 5, 4, 4, 4, 3, 5, 3, 4, 4],
  },
};

const players = [
  { displayName: "Ryan B.", firstName: "Ryan", lastName: "Boshaw", handicap: 14, group: 1 },
  { displayName: "Brett F.", firstName: "Brett", lastName: "Francoeur", handicap: 8, group: 1 },
  { displayName: "Jake M.", firstName: "Jake", lastName: "Mitchell", handicap: 22, group: 1 },
  { displayName: "Cole D.", firstName: "Cole", lastName: "Dawson", handicap: 18, group: 1 },
  { displayName: "Nate H.", firstName: "Nate", lastName: "Harrison", handicap: 6, group: 2 },
  { displayName: "Tyler K.", firstName: "Tyler", lastName: "Krueger", handicap: 25, group: 2 },
  { displayName: "Dustin W.", firstName: "Dustin", lastName: "Walsh", handicap: 11, group: 2 },
  { displayName: "Matt S.", firstName: "Matt", lastName: "Sullivan", handicap: 16, group: 2 },
];

function generateHoleScores(par, handicap) {
  return par.map((holePar) => {
    const handicapPerHole = handicap / 18;
    const base = holePar + handicapPerHole;
    const variance = Math.floor(Math.random() * 4) - 1;
    return Math.max(1, Math.round(base + variance));
  });
}

function cuid() {
  return 'c' + Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
}

// Clear existing data
await client.query('DELETE FROM "Score"');
await client.query('DELETE FROM "Player"');

const createdPlayers = [];
for (const p of players) {
  const id = cuid();
  const now = new Date();
  await client.query(
    `INSERT INTO "Player" (id, "displayName", "firstName", "lastName", handicap, "group", "createdAt", "updatedAt") VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
    [id, p.displayName, p.firstName, p.lastName, p.handicap, p.group, now, now]
  );
  createdPlayers.push({ ...p, id });
}

// Round 1: Bear Mountain Ranch
const r1 = COURSE_PARS["Bear Mountain Ranch"];
for (const player of createdPlayers) {
  const holes = generateHoleScores(r1.holes, player.handicap);
  const total = holes.reduce((s, h) => s + h, 0);
  const toPar = total - r1.total;
  const id = cuid();
  const now = new Date();
  await client.query(
    `INSERT INTO "Score" (id, "playerId", round, course, hole1,hole2,hole3,hole4,hole5,hole6,hole7,hole8,hole9,hole10,hole11,hole12,hole13,hole14,hole15,hole16,hole17,hole18, "totalStrokes", "toPar", "createdAt", "updatedAt") VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26)`,
    [id, player.id, 1, "Bear Mountain Ranch", ...holes, total, toPar, now, now]
  );
}

// Round 2: Desert Canyon (6 of 8 players)
const r2 = COURSE_PARS["Desert Canyon"];
const round2Players = createdPlayers.slice(0, 6);
for (const player of round2Players) {
  const holes = generateHoleScores(r2.holes, player.handicap);
  const total = holes.reduce((s, h) => s + h, 0);
  const toPar = total - r2.total;
  const id = cuid();
  const now = new Date();
  await client.query(
    `INSERT INTO "Score" (id, "playerId", round, course, hole1,hole2,hole3,hole4,hole5,hole6,hole7,hole8,hole9,hole10,hole11,hole12,hole13,hole14,hole15,hole16,hole17,hole18, "totalStrokes", "toPar", "createdAt", "updatedAt") VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26)`,
    [id, player.id, 2, "Desert Canyon", ...holes, total, toPar, now, now]
  );
}

console.log(`Seeded ${createdPlayers.length} players`);
console.log(`Seeded ${createdPlayers.length} Round 1 scores + ${round2Players.length} Round 2 scores`);

await client.end();
