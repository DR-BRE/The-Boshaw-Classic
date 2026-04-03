import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const COURSE_PARS = {
  "Bear Mountain Ranch": {
    total: 72,
    holes: [4, 4, 3, 5, 4, 4, 3, 4, 5, 4, 3, 4, 5, 4, 3, 4, 5, 4],
  },
  "Desert Canyon": {
    total: 73,
    holes: [4, 4, 5, 3, 4, 4, 5, 3, 4, 5, 4, 4, 4, 3, 5, 4, 4, 4],
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

function generateHoleScores(par: number[], handicap: number): number[] {
  return par.map((holePar) => {
    // Base: play to par + a fraction of handicap spread across 18 holes
    const handicapPerHole = handicap / 18;
    const base = holePar + handicapPerHole;
    // Add variance: -1 to +2 strokes
    const variance = Math.floor(Math.random() * 4) - 1;
    const score = Math.max(1, Math.round(base + variance));
    return score;
  });
}

async function main() {
  // Clear existing data
  await prisma.score.deleteMany();
  await prisma.player.deleteMany();

  const createdPlayers = [];

  for (const p of players) {
    const player = await prisma.player.create({ data: p });
    createdPlayers.push(player);
  }

  // Round 1: All 8 players at Bear Mountain Ranch
  const round1Course = "Bear Mountain Ranch" as const;
  const round1Pars = COURSE_PARS[round1Course];

  for (const player of createdPlayers) {
    const holes = generateHoleScores(round1Pars.holes, player.handicap);
    const totalStrokes = holes.reduce((sum, s) => sum + s, 0);
    const toPar = totalStrokes - round1Pars.total;

    await prisma.score.create({
      data: {
        playerId: player.id,
        round: 1,
        course: round1Course,
        hole1: holes[0], hole2: holes[1], hole3: holes[2],
        hole4: holes[3], hole5: holes[4], hole6: holes[5],
        hole7: holes[6], hole8: holes[7], hole9: holes[8],
        hole10: holes[9], hole11: holes[10], hole12: holes[11],
        hole13: holes[12], hole14: holes[13], hole15: holes[14],
        hole16: holes[15], hole17: holes[16], hole18: holes[17],
        totalStrokes,
        toPar,
      },
    });
  }

  // Round 2: 6 of 8 players at Desert Canyon (tournament in progress)
  const round2Course = "Desert Canyon" as const;
  const round2Pars = COURSE_PARS[round2Course];
  const round2Players = createdPlayers.slice(0, 6);

  for (const player of round2Players) {
    const holes = generateHoleScores(round2Pars.holes, player.handicap);
    const totalStrokes = holes.reduce((sum, s) => sum + s, 0);
    const toPar = totalStrokes - round2Pars.total;

    await prisma.score.create({
      data: {
        playerId: player.id,
        round: 2,
        course: round2Course,
        hole1: holes[0], hole2: holes[1], hole3: holes[2],
        hole4: holes[3], hole5: holes[4], hole6: holes[5],
        hole7: holes[6], hole8: holes[7], hole9: holes[8],
        hole10: holes[9], hole11: holes[10], hole12: holes[11],
        hole13: holes[12], hole14: holes[13], hole15: holes[14],
        hole16: holes[15], hole17: holes[16], hole18: holes[17],
        totalStrokes,
        toPar,
      },
    });
  }

  console.log(`Seeded ${createdPlayers.length} players`);
  console.log(`Seeded ${createdPlayers.length} Round 1 scores + ${round2Players.length} Round 2 scores`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
