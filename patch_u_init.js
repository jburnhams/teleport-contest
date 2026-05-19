import fs from 'fs';

const content = fs.readFileSync('js/u_init.js', 'utf8');

const updatedContent = content.replace(
    /export function knows_object\(obj, override_pauper\) \{\}\nexport function knows_class\(sym\) \{\}/,
    `export function discover_object(obj, a, b, c) {
    // stub for now as we don't have discover_object yet
}

export function knows_object(obj, override_pauper) {
    if (game.u.uroleplay && game.u.uroleplay.pauper && !override_pauper) return;
    discover_object(obj, true, false, false);
}

export function knows_class(sym) {
    let odummy = { oclass: sym };
    let o = odummy;

    if (game.u.uroleplay && game.u.uroleplay.pauper) return;

    for (let ct = bases[sym]; ct < bases[sym + 1]; ct++) {
        if (ct === CORNUTHAUM || ct === DUNCE_CAP || ct === SMALL_SHIELD) continue;
        if (sym === WEAPON_CLASS) {
            odummy.otyp = ct;

            // is_pole -> we need to map oc_subtyp
            let oc_skill = objects[ct].oc_subtyp;
            let is_pole = (oc_skill === P_POLEARMS || oc_skill === P_LANCE);
            let is_launcher = (oc_skill >= -P_CROSSBOW && oc_skill <= -P_BOW);
            let is_ammo = (oc_skill >= -P_CROSSBOW && oc_skill <= -P_BOW) && (objects[ct].oc_class === WEAPON_CLASS || objects[ct].oc_class === GEM_CLASS);
            let is_spear = (oc_skill === P_SPEAR || oc_skill === P_JAVELIN); // P_JAVELIN is missing in const.js? Actually in nethack 5.0 javelin is spear skill. Wait, is_spear macro!

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
