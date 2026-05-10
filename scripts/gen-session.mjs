#!/usr/bin/env node

/**
 * Generates a session stub for fuzzing.
 */

const ROLES = [
  { key: 'arc', name: 'Archeologist', races: ['hum', 'dwa'], aligns: ['neu', 'law'] },
  { key: 'bar', name: 'Barbarian', races: ['hum', 'orc'], aligns: ['neu', 'cha'] },
  { key: 'cav', name: 'Caveman', races: ['hum', 'dwa', 'gno'], aligns: ['neu', 'law'] },
  { key: 'hea', name: 'Healer', races: ['hum', 'gno'], aligns: ['neu'] },
  { key: 'kni', name: 'Knight', races: ['hum'], aligns: ['law'] },
  { key: 'mon', name: 'Monk', races: ['hum'], aligns: ['neu', 'law', 'cha'] },
  { key: 'pri', name: 'Priest', races: ['hum', 'elf'], aligns: ['neu', 'law', 'cha'] },
  { key: 'ran', name: 'Ranger', races: ['hum', 'elf', 'gno', 'orc'], aligns: ['neu', 'cha'] },
  { key: 'rog', name: 'Rogue', races: ['hum', 'orc'], aligns: ['cha'] },
  { key: 'sam', name: 'Samurai', races: ['hum'], aligns: ['law'] },
  { key: 'tou', name: 'Tourist', races: ['hum'], aligns: ['neu'] },
  { key: 'val', name: 'Valkyrie', races: ['hum', 'dwa'], aligns: ['neu', 'cha'] },
  { key: 'wiz', name: 'Wizard', races: ['hum', 'elf', 'gno', 'orc'], aligns: ['neu', 'cha'] }
];

const RACE_NAMES = {
  hum: 'human',
  elf: 'elf',
  dwa: 'dwarf',
  gno: 'gnome',
  orc: 'orc'
};

const MOVE_SETS = {
  move: 'hjklyubn',
  explore: 'hjklyubn. s',
  all: 'hjklyubn. si,@'
};

function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pad(n, len = 2) {
  return String(n).padStart(len, '0');
}

function randomDatetime() {
  const year = randomInt(1990, 2020);
  const month = randomInt(1, 12);
  // simplified max days
  let maxDays = 31;
  if (month === 2) {
    maxDays = 28;
  } else if ([4, 6, 9, 11].includes(month)) {
    maxDays = 30;
  }
  const day = randomInt(1, maxDays);
  const hour = randomInt(0, 23);
  return `${year}${pad(month)}${pad(day)}${pad(hour)}0000`;
}

function randomMoves(count, moveSet) {
  const chars = MOVE_SETS[moveSet] || MOVE_SETS.move;
  let result = '';
  for (let i = 0; i < count; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

function buildNethackrc({ role, race, gender, align }) {
  const roleName = role.name;
  const raceName = RACE_NAMES[race];
  return `OPTIONS=name:Fuzz,role:${roleName},race:${raceName},gender:${gender},align:${align}
OPTIONS=!autopickup,!tutorial
OPTIONS=suppress_alert:3.4.3
OPTIONS=symset:DECgraphics
OPTIONS=disclose:yi ya yv yg yc yo
`;
}

function printHelp() {
  console.log(`
Usage: node gen-session.mjs [options] > stub.json

Options:
  --seed N          PRNG seed (default: random 1–9999)
  --moves N         number of random moves to include (default: 0)
  --move-set TYPE   what moves to use: move | explore | all (default: move)
  --role ROLE       force a role (default: random)
  --race RACE       force a race (default: random valid for role)
  --gender GENDER   male|female (default: random)
  --align ALIGN     law|neu|cha (default: random valid for role)
  --datetime STR    YYYYMMDDHHMMSS (default: random date 1990–2010)
  --out FILE        write to file instead of stdout
  --help            show this help
`);
}

async function main() {
  const args = process.argv.slice(2);
  const opts = {
    seed: null,
    moves: 0,
    moveSet: 'move',
    roleKey: null,
    race: null,
    gender: null,
    align: null,
    datetime: null,
    outFile: null
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--help') {
      printHelp();
      return;
    } else if (arg === '--seed') {
      opts.seed = parseInt(args[++i], 10);
    } else if (arg === '--moves') {
      opts.moves = parseInt(args[++i], 10);
    } else if (arg === '--move-set') {
      opts.moveSet = args[++i];
    } else if (arg === '--role') {
      opts.roleKey = args[++i].toLowerCase().substring(0, 3);
    } else if (arg === '--race') {
      opts.race = args[++i].toLowerCase().substring(0, 3);
    } else if (arg === '--gender') {
      opts.gender = args[++i].toLowerCase();
    } else if (arg === '--align') {
      opts.align = args[++i].toLowerCase().substring(0, 3);
    } else if (arg === '--datetime') {
      opts.datetime = args[++i];
    } else if (arg === '--out') {
      opts.outFile = args[++i];
    }
  }

  if (opts.seed === null) {
    opts.seed = randomInt(1, 9999);
  }

  if (opts.datetime === null) {
    opts.datetime = randomDatetime();
  }

  let role = randomChoice(ROLES);
  if (opts.roleKey) {
    role = ROLES.find(r => r.key === opts.roleKey);
    if (!role) {
      console.error(`Invalid role: ${opts.roleKey}`);
      process.exit(1);
    }
  }

  let race = opts.race || randomChoice(role.races);
  if (!role.races.includes(race)) {
    console.error(`Invalid/incompatible race ${race} for role ${role.name}`);
    process.exit(1);
  }

  const ALIGN_NAMES = {
    law: 'lawful',
    neu: 'neutral',
    cha: 'chaotic'
  };

  let align = opts.align || randomChoice(role.aligns);
  if (!role.aligns.includes(align)) {
    console.error(`Invalid/incompatible alignment ${align} for role ${role.name}`);
    process.exit(1);
  }

  let gender = opts.gender || randomChoice(['male', 'female']);
  // Valkyries are always female
  if (role.key === 'val') gender = 'female';
  // Knights are always male (in some versions, check NetHack 5.0)
  // Actually, in 5.0, Knights can be female.
  // Samurai are always male? No, can be female.

  const moves = randomMoves(opts.moves, opts.moveSet);
  const nethackrc = buildNethackrc({ role, race, gender, align: ALIGN_NAMES[align] });

  const stub = {
    version: 5,
    segments: [
      {
        seed: opts.seed,
        datetime: opts.datetime,
        nethackrc,
        moves
      }
    ]
  };

  const jsonStr = JSON.stringify(stub, null, 2);

  if (opts.outFile) {
    const fs = await import('fs/promises');
    await fs.writeFile(opts.outFile, jsonStr);
  } else {
    process.stdout.write(jsonStr);
  }

  console.error(`seed=${opts.seed} role=${role.name}/${race}/${align} moves=${opts.moves}`);
}

main().catch(console.error);
