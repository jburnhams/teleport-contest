import fs from 'fs';

const content = fs.readFileSync('js/u_init.js', 'utf8');

const updatedContent = content.replace(
    /export function knows_class\(sym\) \{[\s\S]*\}\n/,
    `export function knows_class(sym) {
    if (game.u.uroleplay && game.u.uroleplay.pauper) return;

    for (let ct = bases[sym]; ct < bases[sym + 1]; ct++) {
        if (ct === CORNUTHAUM || ct === DUNCE_CAP || ct === SMALL_SHIELD) continue;
        if (sym === WEAPON_CLASS) {

            let oc_skill = objects[ct].oc_subtyp;
            let oclass = objects[ct].oc_class;

            // is_pole -> we need to map oc_subtyp
            let is_pole = (oclass === WEAPON_CLASS || oclass === TOOL_CLASS) && (oc_skill === P_POLEARMS || oc_skill === P_LANCE);
            let is_launcher = (oclass === WEAPON_CLASS) && (oc_skill >= P_BOW && oc_skill <= P_CROSSBOW);
            let is_ammo = (oclass === WEAPON_CLASS || oclass === GEM_CLASS) && (oc_skill >= -P_CROSSBOW && oc_skill <= -P_BOW);
            let is_spear = (oclass === WEAPON_CLASS) && (oc_skill === P_SPEAR);

            if ((game.urole.mnum !== PM_KNIGHT && game.urole.mnum !== PM_SAMURAI) && is_pole) continue;

            if (game.urole.mnum === PM_RANGER && (!is_launcher && !is_ammo && !is_spear)) continue;

            if (game.urole.mnum === PM_ROGUE && oc_skill !== P_DAGGER) continue;
        }

        if (objects[ct].oc_class === sym && !objects[ct].oc_magic) {
            knows_object(ct, false);
        }
    }
}
`
);

fs.writeFileSync('js/u_init.js', updatedContent);
