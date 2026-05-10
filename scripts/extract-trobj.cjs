const fs = require('fs');
const src = fs.readFileSync('nethack-c/upstream/src/u_init.c', 'utf8');

const regex = /static const struct trobj ([a-zA-Z0-9_]+)\[\] =\s*\{([\s\S]*?)\{ 0, 0, 0, 0, 0, 0 \}\s*\};/g;

let match;
while ((match = regex.exec(src)) !== null) {
    const name = match[1];
    const body = match[2];

    let arr = [];
    const lineRegex = /\{\s*([A-Za-z0-9_]+|ROLL_FROM\([A-Za-z0-9_]+\))\s*,\s*(-?\d+|UNDEF_SPE)\s*,\s*([A-Za-z0-9_]+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+|UNDEF_BLESS)\s*\}/g;
    let lMatch;
    while ((lMatch = lineRegex.exec(body)) !== null) {
        let trotypStr = lMatch[1];
        let trspeStr = lMatch[2];
        let trclassStr = lMatch[3];
        let quan_minStr = lMatch[4];
        let quan_maxStr = lMatch[5];
        let trblessStr = lMatch[6];

        let trotyp = trotypStr.replace('ROLL_FROM', 'ROLL_FROM'); // not used much
        if (trotypStr.startsWith('ROLL_FROM')) {
           trotyp = '"ROLL_FROM"';
        }

        arr.push(`{ trotyp: ${trotyp}, trspe: ${trspeStr === 'UNDEF_SPE' ? '"UNDEF_SPE"' : trspeStr}, trclass: ${trclassStr}, quan_min: ${quan_minStr}, quan_max: ${quan_maxStr}, trbless: ${trblessStr === 'UNDEF_BLESS' ? '"UNDEF_BLESS"' : trblessStr} }`);
    }
    console.log(`export const ${name} = [\n    ${arr.join(',\n    ')}\n];`);
}
