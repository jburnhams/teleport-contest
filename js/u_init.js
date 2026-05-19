import { objects } from './objects.js';
// u_init.js — Hero Initialization
// C ref: u_init.c

import { rn2, rnd } from './rng.js';
import {
    P_NONE, P_DAGGER, P_KNIFE, P_AXE, P_PICK_AXE, P_SHORT_SWORD, P_BROAD_SWORD,
    P_LONG_SWORD, P_TWO_HANDED_SWORD, P_SABER, P_CLUB, P_MACE, P_MORNING_STAR,
    P_FLAIL, P_HAMMER, P_QUARTERSTAFF, P_POLEARMS, P_SPEAR, P_TRIDENT, P_LANCE,
    P_BOW, P_SLING, P_CROSSBOW, P_DART, P_SHURIKEN, P_BOOMERANG, P_WHIP,
    P_UNICORN_HORN, P_ATTACK_SPELL, P_HEALING_SPELL, P_DIVINATION_SPELL,
    P_ENCHANTMENT_SPELL, P_CLERIC_SPELL, P_ESCAPE_SPELL, P_MATTER_SPELL,
    P_BARE_HANDED_COMBAT, P_TWO_WEAPON_COMBAT, P_RIDING, P_NUM_SKILLS,
    P_MARTIAL_ARTS, P_ISRESTRICTED, P_UNSKILLED, P_BASIC, P_SKILLED,
    P_EXPERT, P_MASTER, P_GRAND_MASTER, PM_ARCHEOLOGIST, PM_BARBARIAN,
    PM_CAVE_DWELLER, PM_HEALER, PM_KNIGHT, PM_MONK, PM_CLERIC,
    PM_ROGUE, PM_RANGER, PM_SAMURAI, PM_TOURIST, PM_VALKYRIE, PM_WIZARD
} from './const.js';
import { bases } from './o_init.js';
import { CORNUTHAUM, DUNCE_CAP } from './objects.js';
import { PM_PONY } from './monst.js';
import {
    WEAPON_CLASS, ARMOR_CLASS, POTION_CLASS, SCROLL_CLASS, WAND_CLASS,
    SPBOOK_CLASS, FOOD_CLASS, TOOL_CLASS, GEM_CLASS, RING_CLASS, COIN_CLASS
} from './const.js';
import { invent } from './decl.js';
import { game } from './gstate.js';
import {
    SPBOOK_CLASS, POTION_CLASS, SCROLL_CLASS, RING_CLASS,
    SPE_FORCE_BOLT, POT_HEALING, SCR_LIGHT, RIN_SEARCHING
} from './const.js';
import { init_attr, vary_init_attr, acurrstr } from './attrib.js';
import { newhp, newpw, adjabil } from './exper.js';
import { next_ident, mkobj, mksobj } from './mkobj.js';

import {
    BULLWHIP, LEATHER_JACKET, FEDORA, FOOD_RATION,
    PICK_AXE, TINNING_KIT, TOUCHSTONE, SACK, TWO_HANDED_SWORD, AXE,
    RING_MAIL, BATTLE_AXE, SHORT_SWORD, CLUB, SLING, FLINT, ROCK, LEATHER_ARMOR, SCALPEL,
    LEATHER_GLOVES, STETHOSCOPE, POT_HEALING, POT_EXTRA_HEALING, WAN_SLEEP,
    SPE_HEALING, SPE_EXTRA_HEALING, SPE_STONE_TO_FLESH, APPLE,
    LONG_SWORD, LANCE, HELMET, SMALL_SHIELD, CARROT, ROBE, POT_WATER, CLOVE_OF_GARLIC,
    SPRIG_OF_WOLFSBANE, DAGGER, BOW, ARROW, CLOAK_OF_DISPLACEMENT, CRAM_RATION, POT_SICKNESS,
    LOCK_PICK, KATANA, YUMI, YA, SPLINT_MAIL, DART, SCR_MAGIC_MAPPING,
    HAWAIIAN_SHIRT, EXPENSIVE_CAMERA, CREDIT_CARD, SPEAR, QUARTERSTAFF, CLOAK_OF_MAGIC_RESISTANCE,
    SPE_FORCE_BOLT, MAGIC_MARKER, SPE_PROTECTION, SPE_CONFUSE_MONSTER, TIN_OPENER, ORANGE, FORTUNE_COOKIE, MACE, GOLD_PIECE,
    OIL_LAMP, BLINDFOLD, LEASH, TOWEL, WAN_WISHING, SHURIKEN,
    RIN_LEVITATION, POT_HALLUCINATION, POT_ACID, SCR_AMNESIA, SCR_FIRE,
    SCR_BLANK_PAPER, SPE_BLANK_PAPER, RIN_AGGRAVATE_MONSTER, RIN_HUNGER,
    WAN_NOTHING, PANCAKE
} from './objects.js';

// Also UNDEF_TYP is 0
const UNDEF_TYP = 0;


export function u_init_role() {
    game.moves = 1;

    switch (game.urole.mnum) {
        case 0: // Archeologist
            ini_inv(Archeologist);
            if (!rn2(10)) ini_inv(Tinopener);
            else if (!rn2(4)) ini_inv(Lamp);
            else if (!rn2(5)) ini_inv(Magicmarker);
            knows_object("SACK", false);
            knows_object("TOUCHSTONE", false);
            break;
        case 1: // Barbarian
            if (rn2(100) >= 50) ini_inv(Barbarian_0);
            else ini_inv(Barbarian_1);
            if (!rn2(6)) ini_inv(Lamp);
            knows_class("WEAPON_CLASS");
            knows_class("ARMOR_CLASS");
            break;
        case 2: // Caveman
            ini_inv(Cave_man);
            break;
        case 3: // Healer

            game.u.umoney0 = 1001 + rn2(1000);
            ini_inv(Healer);
            if (!rn2(25)) ini_inv(Lamp);
            knows_object("POT_FULL_HEALING", false);
            break;
        case 4: // Knight
            ini_inv(Knight);
            knows_class("WEAPON_CLASS");
            knows_class("ARMOR_CLASS");
            break;
        case 5: // Monk
            ini_inv(Monk);
            ini_inv(M_spell[Math.floor(rn2(90) / 30)]);
            if (!rn2(4)) ini_inv(Magicmarker);
            else if (!rn2(10)) ini_inv(Lamp);
            knows_class("ARMOR_CLASS");
            knows_object("SHURIKEN", false);
            break;
        case 6: // Priest
            ini_inv(Priest);
            if (!rn2(5)) ini_inv(Magicmarker);
            else if (!rn2(10)) ini_inv(Lamp);
            knows_object("POT_WATER", true);
            break;
        case 7: // Ranger
            ini_inv(Ranger);
            knows_class("WEAPON_CLASS");
            break;
        case 8: // Rogue
            game.u.umoney0 = 0;
            ini_inv(Rogue);
            if (!rn2(5)) ini_inv(Blindfold);
            knows_object("SACK", false);
            knows_class("WEAPON_CLASS");
            break;
        case 9: // Samurai
            ini_inv(Samurai);
            if (!rn2(5)) ini_inv(Blindfold);
            knows_class("WEAPON_CLASS");
            knows_class("ARMOR_CLASS");
            // samurai knows all non-magic japanese items, skip exact port for rng unless needed
            break;
        case 10: // Tourist
            game.u.umoney0 = rnd(1000);
            ini_inv(Tourist);
            if (!rn2(25)) ini_inv(Tinopener);
            else if (!rn2(25)) ini_inv(Leash);
            else if (!rn2(25)) ini_inv(Towel);
            else if (!rn2(20)) ini_inv(Magicmarker);
            break;
        case 11: // Valkyrie
            ini_inv(Valkyrie);
            if (!rn2(6)) ini_inv(Lamp);
            knows_class("WEAPON_CLASS");
            knows_class("ARMOR_CLASS");
            break;
        case 12: // Wizard
            ini_inv(Wizard);
            if (!rn2(5)) ini_inv(Blindfold);
            break;
    }
}

export function u_init_race() {
    switch (game.urace.mnum) {
        case 0: // Human
            break;
        case 1: // Elf
            if (game.urole.mnum === 6 || game.urole.mnum === 12) {
                ini_inv([{ trotyp: "ROLL_FROM", _is_instrument: true }]);
            }
            break;
        case 2: // Dwarf
            break;
        case 3: // Gnome
            break;
        case 4: // Orc
            if (game.urole.mnum !== 12) ini_inv(Xtra_food);
            break;
    }
}

export function u_init_carry_attr_boost() {
    // Only rng here is to make sure we don't consume any if not needed.
    // In C, it boosts str/con but there is no rng.
}

export function u_init_misc() {
    game.flags.female = game.flags.initgend;
    game.flags.beginner = true;

    game.u.uz = { dnum: 0, dlevel: 1 };
    game.u.uz0 = { dnum: 0, dlevel: 0 };
    game.u.utolev = { dnum: 0, dlevel: 1 };

    game.u.umoved = false;
    game.u.umortality = 0;

    game.u.umonnum = game.u.umonster = game.urole.mnum;
    game.u.ulycn = -1; // NON_PM

    game.u.ulevel = 0;
    game.u.uhp = game.u.uhpmax = game.u.uhppeak = newhp();
    game.u.uen = game.u.uenmax = game.u.uenpeak = newpw();
    game.u.uspellprot = 0;
    adjabil(0, 1);
    game.u.ulevel = game.u.ulevelmax = 1;

    game.u.ublesscnt = 300;
    // ualignbase is set in u_init_misc
    // nv_range etc
    game.u.nv_range = 1;
    game.u.xray_range = -1;

    game.u.uhandedness = rn2(10) ? 1 : 0; // RIGHT_HANDED : LEFT_HANDED
}

export function u_init_inventory_attrs() {
    game.u.umoney0 = 0;
    u_init_role();
    u_init_race();

    if (game.u.umoney0) ini_inv(Money);

    init_attr(75);
    vary_init_attr();
    u_init_carry_attr_boost();
}

export function u_init_skills_discoveries() {
    // We do skill init here, but we can stub it out since it only consumes rng
    // if there is some randomization. `skill_init` does not call `rn2`.
    skill_init(skills_for_role());
}


export const Skill_A = [
    { skill: P_DAGGER, skmax: P_BASIC },
    { skill: P_KNIFE, skmax: P_BASIC },
    { skill: P_PICK_AXE, skmax: P_EXPERT },
    { skill: P_SHORT_SWORD, skmax: P_BASIC },
    { skill: P_SABER, skmax: P_EXPERT },
    { skill: P_CLUB, skmax: P_SKILLED },
    { skill: P_QUARTERSTAFF, skmax: P_SKILLED },
    { skill: P_SLING, skmax: P_SKILLED },
    { skill: P_DART, skmax: P_BASIC },
    { skill: P_BOOMERANG, skmax: P_EXPERT },
    { skill: P_WHIP, skmax: P_EXPERT },
    { skill: P_UNICORN_HORN, skmax: P_SKILLED },
    { skill: P_ATTACK_SPELL, skmax: P_BASIC },
    { skill: P_HEALING_SPELL, skmax: P_BASIC },
    { skill: P_DIVINATION_SPELL, skmax: P_EXPERT },
    { skill: P_MATTER_SPELL, skmax: P_BASIC },
    { skill: P_RIDING, skmax: P_BASIC },
    { skill: P_TWO_WEAPON_COMBAT, skmax: P_BASIC },
    { skill: P_BARE_HANDED_COMBAT, skmax: P_EXPERT },
    { skill: P_NONE, skmax: 0 }
];

export const Skill_B = [
    { skill: P_DAGGER, skmax: P_BASIC },
    { skill: P_AXE, skmax: P_EXPERT },
    { skill: P_PICK_AXE, skmax: P_SKILLED },
    { skill: P_SHORT_SWORD, skmax: P_EXPERT },
    { skill: P_BROAD_SWORD, skmax: P_SKILLED },
    { skill: P_LONG_SWORD, skmax: P_SKILLED },
    { skill: P_TWO_HANDED_SWORD, skmax: P_EXPERT },
    { skill: P_SABER, skmax: P_SKILLED },
    { skill: P_CLUB, skmax: P_SKILLED },
    { skill: P_MACE, skmax: P_SKILLED },
    { skill: P_MORNING_STAR, skmax: P_SKILLED },
    { skill: P_FLAIL, skmax: P_BASIC },
    { skill: P_HAMMER, skmax: P_EXPERT },
    { skill: P_QUARTERSTAFF, skmax: P_BASIC },
    { skill: P_SPEAR, skmax: P_SKILLED },
    { skill: P_TRIDENT, skmax: P_SKILLED },
    { skill: P_BOW, skmax: P_BASIC },
    { skill: P_ATTACK_SPELL, skmax: P_BASIC },
    { skill: P_ESCAPE_SPELL, skmax: P_BASIC },
    { skill: P_RIDING, skmax: P_BASIC },
    { skill: P_TWO_WEAPON_COMBAT, skmax: P_BASIC },
    { skill: P_BARE_HANDED_COMBAT, skmax: P_MASTER },
    { skill: P_NONE, skmax: 0 }
];

export const Skill_C = [
    { skill: P_DAGGER, skmax: P_BASIC },
    { skill: P_KNIFE, skmax: P_SKILLED },
    { skill: P_AXE, skmax: P_SKILLED },
    { skill: P_PICK_AXE, skmax: P_BASIC },
    { skill: P_CLUB, skmax: P_EXPERT },
    { skill: P_MACE, skmax: P_EXPERT },
    { skill: P_MORNING_STAR, skmax: P_BASIC },
    { skill: P_FLAIL, skmax: P_SKILLED },
    { skill: P_HAMMER, skmax: P_SKILLED },
    { skill: P_QUARTERSTAFF, skmax: P_EXPERT },
    { skill: P_POLEARMS, skmax: P_SKILLED },
    { skill: P_SPEAR, skmax: P_EXPERT },
    { skill: P_TRIDENT, skmax: P_SKILLED },
    { skill: P_BOW, skmax: P_SKILLED },
    { skill: P_SLING, skmax: P_EXPERT },
    { skill: P_ATTACK_SPELL, skmax: P_BASIC },
    { skill: P_MATTER_SPELL, skmax: P_BASIC },
    { skill: P_BOOMERANG, skmax: P_EXPERT },
    { skill: P_UNICORN_HORN, skmax: P_BASIC },
    { skill: P_BARE_HANDED_COMBAT, skmax: P_MASTER },
    { skill: P_NONE, skmax: 0 }
];

export const Skill_H = [
    { skill: P_DAGGER, skmax: P_SKILLED },
    { skill: P_KNIFE, skmax: P_EXPERT },
    { skill: P_SHORT_SWORD, skmax: P_SKILLED },
    { skill: P_SABER, skmax: P_BASIC },
    { skill: P_CLUB, skmax: P_SKILLED },
    { skill: P_MACE, skmax: P_BASIC },
    { skill: P_QUARTERSTAFF, skmax: P_EXPERT },
    { skill: P_POLEARMS, skmax: P_BASIC },
    { skill: P_SPEAR, skmax: P_BASIC },
    { skill: P_TRIDENT, skmax: P_BASIC },
    { skill: P_SLING, skmax: P_SKILLED },
    { skill: P_DART, skmax: P_EXPERT },
    { skill: P_SHURIKEN, skmax: P_SKILLED },
    { skill: P_UNICORN_HORN, skmax: P_EXPERT },
    { skill: P_HEALING_SPELL, skmax: P_EXPERT },
    { skill: P_BARE_HANDED_COMBAT, skmax: P_BASIC },
    { skill: P_NONE, skmax: 0 }
];

export const Skill_K = [
    { skill: P_DAGGER, skmax: P_BASIC },
    { skill: P_KNIFE, skmax: P_BASIC },
    { skill: P_AXE, skmax: P_SKILLED },
    { skill: P_PICK_AXE, skmax: P_BASIC },
    { skill: P_SHORT_SWORD, skmax: P_SKILLED },
    { skill: P_BROAD_SWORD, skmax: P_SKILLED },
    { skill: P_LONG_SWORD, skmax: P_EXPERT },
    { skill: P_TWO_HANDED_SWORD, skmax: P_SKILLED },
    { skill: P_SABER, skmax: P_SKILLED },
    { skill: P_CLUB, skmax: P_BASIC },
    { skill: P_MACE, skmax: P_SKILLED },
    { skill: P_MORNING_STAR, skmax: P_SKILLED },
    { skill: P_FLAIL, skmax: P_BASIC },
    { skill: P_HAMMER, skmax: P_BASIC },
    { skill: P_POLEARMS, skmax: P_EXPERT },
    { skill: P_SPEAR, skmax: P_SKILLED },
    { skill: P_TRIDENT, skmax: P_BASIC },
    { skill: P_LANCE, skmax: P_EXPERT },
    { skill: P_BOW, skmax: P_BASIC },
    { skill: P_CROSSBOW, skmax: P_SKILLED },
    { skill: P_ATTACK_SPELL, skmax: P_SKILLED },
    { skill: P_HEALING_SPELL, skmax: P_SKILLED },
    { skill: P_CLERIC_SPELL, skmax: P_SKILLED },
    { skill: P_RIDING, skmax: P_EXPERT },
    { skill: P_TWO_WEAPON_COMBAT, skmax: P_SKILLED },
    { skill: P_BARE_HANDED_COMBAT, skmax: P_EXPERT },
    { skill: P_NONE, skmax: 0 }
];

export const Skill_Mon = [
    { skill: P_QUARTERSTAFF, skmax: P_BASIC },
    { skill: P_SPEAR, skmax: P_BASIC },
    { skill: P_CROSSBOW, skmax: P_BASIC },
    { skill: P_SHURIKEN, skmax: P_BASIC },
    { skill: P_ATTACK_SPELL, skmax: P_BASIC },
    { skill: P_HEALING_SPELL, skmax: P_EXPERT },
    { skill: P_DIVINATION_SPELL, skmax: P_BASIC },
    { skill: P_ENCHANTMENT_SPELL, skmax: P_BASIC },
    { skill: P_CLERIC_SPELL, skmax: P_SKILLED },
    { skill: P_ESCAPE_SPELL, skmax: P_SKILLED },
    { skill: P_MATTER_SPELL, skmax: P_BASIC },
    { skill: P_MARTIAL_ARTS, skmax: P_GRAND_MASTER },
    { skill: P_NONE, skmax: 0 }
];

export const Skill_P = [
    { skill: P_CLUB, skmax: P_EXPERT },
    { skill: P_MACE, skmax: P_EXPERT },
    { skill: P_MORNING_STAR, skmax: P_EXPERT },
    { skill: P_FLAIL, skmax: P_EXPERT },
    { skill: P_HAMMER, skmax: P_EXPERT },
    { skill: P_QUARTERSTAFF, skmax: P_EXPERT },
    { skill: P_POLEARMS, skmax: P_SKILLED },
    { skill: P_SPEAR, skmax: P_SKILLED },
    { skill: P_TRIDENT, skmax: P_SKILLED },
    { skill: P_LANCE, skmax: P_BASIC },
    { skill: P_BOW, skmax: P_BASIC },
    { skill: P_SLING, skmax: P_BASIC },
    { skill: P_CROSSBOW, skmax: P_BASIC },
    { skill: P_DART, skmax: P_BASIC },
    { skill: P_SHURIKEN, skmax: P_BASIC },
    { skill: P_BOOMERANG, skmax: P_BASIC },
    { skill: P_UNICORN_HORN, skmax: P_BASIC },
    { skill: P_HEALING_SPELL, skmax: P_EXPERT },
    { skill: P_DIVINATION_SPELL, skmax: P_EXPERT },
    { skill: P_CLERIC_SPELL, skmax: P_EXPERT },
    { skill: P_BARE_HANDED_COMBAT, skmax: P_BASIC },
    { skill: P_NONE, skmax: 0 }
];

export const Skill_R = [
    { skill: P_DAGGER, skmax: P_EXPERT },
    { skill: P_KNIFE, skmax: P_EXPERT },
    { skill: P_SHORT_SWORD, skmax: P_EXPERT },
    { skill: P_BROAD_SWORD, skmax: P_SKILLED },
    { skill: P_LONG_SWORD, skmax: P_SKILLED },
    { skill: P_TWO_HANDED_SWORD, skmax: P_BASIC },
    { skill: P_SABER, skmax: P_SKILLED },
    { skill: P_CLUB, skmax: P_SKILLED },
    { skill: P_MACE, skmax: P_SKILLED },
    { skill: P_MORNING_STAR, skmax: P_BASIC },
    { skill: P_FLAIL, skmax: P_BASIC },
    { skill: P_HAMMER, skmax: P_BASIC },
    { skill: P_POLEARMS, skmax: P_BASIC },
    { skill: P_SPEAR, skmax: P_BASIC },
    { skill: P_CROSSBOW, skmax: P_EXPERT },
    { skill: P_DART, skmax: P_EXPERT },
    { skill: P_SHURIKEN, skmax: P_SKILLED },
    { skill: P_DIVINATION_SPELL, skmax: P_SKILLED },
    { skill: P_ESCAPE_SPELL, skmax: P_SKILLED },
    { skill: P_MATTER_SPELL, skmax: P_SKILLED },
    { skill: P_RIDING, skmax: P_BASIC },
    { skill: P_TWO_WEAPON_COMBAT, skmax: P_EXPERT },
    { skill: P_BARE_HANDED_COMBAT, skmax: P_EXPERT },
    { skill: P_NONE, skmax: 0 }
];

export const Skill_Ran = [
    { skill: P_DAGGER, skmax: P_EXPERT },
    { skill: P_KNIFE, skmax: P_SKILLED },
    { skill: P_AXE, skmax: P_SKILLED },
    { skill: P_PICK_AXE, skmax: P_BASIC },
    { skill: P_SHORT_SWORD, skmax: P_BASIC },
    { skill: P_MORNING_STAR, skmax: P_BASIC },
    { skill: P_FLAIL, skmax: P_SKILLED },
    { skill: P_HAMMER, skmax: P_BASIC },
    { skill: P_QUARTERSTAFF, skmax: P_BASIC },
    { skill: P_POLEARMS, skmax: P_SKILLED },
    { skill: P_SPEAR, skmax: P_EXPERT },
    { skill: P_TRIDENT, skmax: P_BASIC },
    { skill: P_BOW, skmax: P_EXPERT },
    { skill: P_SLING, skmax: P_EXPERT },
    { skill: P_CROSSBOW, skmax: P_EXPERT },
    { skill: P_DART, skmax: P_EXPERT },
    { skill: P_SHURIKEN, skmax: P_SKILLED },
    { skill: P_BOOMERANG, skmax: P_EXPERT },
    { skill: P_WHIP, skmax: P_BASIC },
    { skill: P_HEALING_SPELL, skmax: P_BASIC },
    { skill: P_DIVINATION_SPELL, skmax: P_EXPERT },
    { skill: P_ESCAPE_SPELL, skmax: P_BASIC },
    { skill: P_RIDING, skmax: P_BASIC },
    { skill: P_BARE_HANDED_COMBAT, skmax: P_BASIC },
    { skill: P_NONE, skmax: 0 }
];

export const Skill_S = [
    { skill: P_DAGGER, skmax: P_BASIC },
    { skill: P_KNIFE, skmax: P_SKILLED },
    { skill: P_SHORT_SWORD, skmax: P_EXPERT },
    { skill: P_BROAD_SWORD, skmax: P_SKILLED },
    { skill: P_LONG_SWORD, skmax: P_EXPERT },
    { skill: P_TWO_HANDED_SWORD, skmax: P_EXPERT },
    { skill: P_SABER, skmax: P_BASIC },
    { skill: P_FLAIL, skmax: P_SKILLED },
    { skill: P_QUARTERSTAFF, skmax: P_BASIC },
    { skill: P_POLEARMS, skmax: P_SKILLED },
    { skill: P_SPEAR, skmax: P_SKILLED },
    { skill: P_LANCE, skmax: P_SKILLED },
    { skill: P_BOW, skmax: P_EXPERT },
    { skill: P_SHURIKEN, skmax: P_EXPERT },
    { skill: P_ATTACK_SPELL, skmax: P_BASIC },
    { skill: P_DIVINATION_SPELL, skmax: P_BASIC }, /* special spell is clairvoyance */
    { skill: P_CLERIC_SPELL, skmax: P_SKILLED },
    { skill: P_RIDING, skmax: P_SKILLED },
    { skill: P_TWO_WEAPON_COMBAT, skmax: P_EXPERT },
    { skill: P_MARTIAL_ARTS, skmax: P_MASTER },
    { skill: P_NONE, skmax: 0 }
];

export const Skill_T = [
    { skill: P_DAGGER, skmax: P_EXPERT },
    { skill: P_KNIFE, skmax: P_SKILLED },
    { skill: P_AXE, skmax: P_BASIC },
    { skill: P_PICK_AXE, skmax: P_BASIC },
    { skill: P_SHORT_SWORD, skmax: P_EXPERT },
    { skill: P_BROAD_SWORD, skmax: P_BASIC },
    { skill: P_LONG_SWORD, skmax: P_BASIC },
    { skill: P_TWO_HANDED_SWORD, skmax: P_BASIC },
    { skill: P_SABER, skmax: P_SKILLED },
    { skill: P_CLUB, skmax: P_SKILLED },
    { skill: P_MACE, skmax: P_BASIC },
    { skill: P_MORNING_STAR, skmax: P_BASIC },
    { skill: P_FLAIL, skmax: P_BASIC },
    { skill: P_HAMMER, skmax: P_BASIC },
    { skill: P_QUARTERSTAFF, skmax: P_BASIC },
    { skill: P_POLEARMS, skmax: P_BASIC },
    { skill: P_SPEAR, skmax: P_BASIC },
    { skill: P_TRIDENT, skmax: P_BASIC },
    { skill: P_LANCE, skmax: P_BASIC },
    { skill: P_BOW, skmax: P_BASIC },
    { skill: P_SLING, skmax: P_BASIC },
    { skill: P_CROSSBOW, skmax: P_BASIC },
    { skill: P_DART, skmax: P_EXPERT },
    { skill: P_SHURIKEN, skmax: P_BASIC },
    { skill: P_BOOMERANG, skmax: P_BASIC },
    { skill: P_WHIP, skmax: P_BASIC },
    { skill: P_UNICORN_HORN, skmax: P_SKILLED },
    { skill: P_DIVINATION_SPELL, skmax: P_BASIC },
    { skill: P_ENCHANTMENT_SPELL, skmax: P_BASIC },
    { skill: P_ESCAPE_SPELL, skmax: P_SKILLED },
    { skill: P_RIDING, skmax: P_BASIC },
    { skill: P_TWO_WEAPON_COMBAT, skmax: P_SKILLED },
    { skill: P_BARE_HANDED_COMBAT, skmax: P_SKILLED },
    { skill: P_NONE, skmax: 0 }
];

export const Skill_V = [
    { skill: P_DAGGER, skmax: P_EXPERT },
    { skill: P_AXE, skmax: P_EXPERT },
    { skill: P_PICK_AXE, skmax: P_SKILLED },
    { skill: P_SHORT_SWORD, skmax: P_SKILLED },
    { skill: P_BROAD_SWORD, skmax: P_SKILLED },
    { skill: P_LONG_SWORD, skmax: P_EXPERT },
    { skill: P_TWO_HANDED_SWORD, skmax: P_EXPERT },
    { skill: P_SABER, skmax: P_BASIC },
    { skill: P_HAMMER, skmax: P_EXPERT },
    { skill: P_QUARTERSTAFF, skmax: P_BASIC },
    { skill: P_POLEARMS, skmax: P_SKILLED },
    { skill: P_SPEAR, skmax: P_SKILLED },
    { skill: P_TRIDENT, skmax: P_BASIC },
    { skill: P_LANCE, skmax: P_SKILLED },
    { skill: P_SLING, skmax: P_BASIC },
    { skill: P_ATTACK_SPELL, skmax: P_BASIC },
    { skill: P_ESCAPE_SPELL, skmax: P_BASIC },
    { skill: P_RIDING, skmax: P_SKILLED },
    { skill: P_TWO_WEAPON_COMBAT, skmax: P_SKILLED },
    { skill: P_BARE_HANDED_COMBAT, skmax: P_EXPERT },
    { skill: P_NONE, skmax: 0 }
];

export const Skill_W = [
    { skill: P_DAGGER, skmax: P_EXPERT },
    { skill: P_KNIFE, skmax: P_SKILLED },
    { skill: P_AXE, skmax: P_SKILLED },
    { skill: P_SHORT_SWORD, skmax: P_BASIC },
    { skill: P_CLUB, skmax: P_SKILLED },
    { skill: P_MACE, skmax: P_BASIC },
    { skill: P_QUARTERSTAFF, skmax: P_EXPERT },
    { skill: P_POLEARMS, skmax: P_SKILLED },
    { skill: P_SPEAR, skmax: P_BASIC },
    { skill: P_TRIDENT, skmax: P_BASIC },
    { skill: P_SLING, skmax: P_SKILLED },
    { skill: P_DART, skmax: P_EXPERT },
    { skill: P_SHURIKEN, skmax: P_BASIC },
    { skill: P_ATTACK_SPELL, skmax: P_EXPERT },
    { skill: P_HEALING_SPELL, skmax: P_SKILLED },
    { skill: P_DIVINATION_SPELL, skmax: P_EXPERT },
    { skill: P_ENCHANTMENT_SPELL, skmax: P_SKILLED },
    { skill: P_CLERIC_SPELL, skmax: P_SKILLED },
    { skill: P_ESCAPE_SPELL, skmax: P_EXPERT },
    { skill: P_MATTER_SPELL, skmax: P_EXPERT },
    { skill: P_RIDING, skmax: P_BASIC },
    { skill: P_BARE_HANDED_COMBAT, skmax: P_BASIC },
    { skill: P_NONE, skmax: 0 }
];

export function skills_for_role() {
    switch (game.urole.mnum) {
        case PM_ARCHEOLOGIST: return Skill_A;
        case PM_BARBARIAN: return Skill_B;
        case PM_CAVE_DWELLER: return Skill_C;
        case PM_HEALER: return Skill_H;
        case PM_KNIGHT: return Skill_K;
        case PM_MONK: return Skill_Mon;
        case PM_CLERIC: return Skill_P;
        case PM_ROGUE: return Skill_R;
        case PM_RANGER: return Skill_Ran;
        case PM_SAMURAI: return Skill_S;
        case PM_TOURIST: return Skill_T;
        case PM_VALKYRIE: return Skill_V;
        case PM_WIZARD: return Skill_W;
        default: return Skill_T; // Fallback
    }
}

function practice_needed_to_advance(level) {
    return level * level * 20;
}

function weapon_type(obj) {
    if (!obj) return P_BARE_HANDED_COMBAT;
    if (obj.oclass !== WEAPON_CLASS && obj.oclass !== TOOL_CLASS && obj.oclass !== GEM_CLASS) {
        // Not a weapon, weapon-tool, or ammo
        return P_NONE;
    }
    let type = objects[obj.otyp].oc_subtyp; // oc_skill is mapped to oc_subtyp
    return type < 0 ? -type : type;
}

export function skill_init(class_skill) {
    game.u.weapon_skills = [];
    for (let skill = 0; skill < P_NUM_SKILLS; skill++) {
        game.u.weapon_skills[skill] = {
            skill: P_ISRESTRICTED,
            max_skill: P_ISRESTRICTED,
            advance: 0
        };
    }

    // Set skill for all weapons in inventory to be basic
    for (let obj = invent; obj; obj = obj.nobj) {
        let oc_skill = objects[obj.otyp].oc_subtyp;
        // is_ammo(otmp) from obj.h
        let is_ammo = (obj.oclass === WEAPON_CLASS || obj.oclass === GEM_CLASS) &&
                      (oc_skill >= -P_CROSSBOW && oc_skill <= -P_BOW);
        if (is_ammo || obj.oclass === GEM_CLASS) continue;

        let skill = weapon_type(obj);
        if (skill !== P_NONE) {
            game.u.weapon_skills[skill].skill = P_BASIC;
        }
    }

    if (game.urole.mnum === PM_HEALER || game.urole.mnum === PM_MONK) {
        game.u.weapon_skills[P_HEALING_SPELL].skill = P_BASIC;
    } else if (game.urole.mnum === PM_CLERIC) {
        game.u.weapon_skills[P_CLERIC_SPELL].skill = P_BASIC;
    } else if (game.urole.mnum === PM_WIZARD) {
        game.u.weapon_skills[P_ATTACK_SPELL].skill = P_BASIC;
        game.u.weapon_skills[P_ENCHANTMENT_SPELL].skill = P_BASIC;
    }

    for (let i = 0; i < class_skill.length; i++) {
        let skmax = class_skill[i].skmax;
        let skill = class_skill[i].skill;

        if (skill === P_NONE) break;

        game.u.weapon_skills[skill].max_skill = skmax;
        if (game.u.weapon_skills[skill].skill === P_ISRESTRICTED) {
            game.u.weapon_skills[skill].skill = P_UNSKILLED;
        }
    }

    if (game.u.weapon_skills[P_BARE_HANDED_COMBAT].max_skill > P_EXPERT) {
        game.u.weapon_skills[P_BARE_HANDED_COMBAT].skill = P_BASIC;
    }

    // Roles that start with a horse know how to ride it
    if (game.urole.petnum === PM_PONY) game.u.weapon_skills[P_RIDING].skill = P_BASIC;

    for (let skill = 0; skill < P_NUM_SKILLS; skill++) {
        if (game.u.weapon_skills[skill].skill !== P_ISRESTRICTED) {
            if (game.u.weapon_skills[skill].max_skill < game.u.weapon_skills[skill].skill) {
                game.u.weapon_skills[skill].max_skill = game.u.weapon_skills[skill].skill;
            }
            game.u.weapon_skills[skill].advance = practice_needed_to_advance(game.u.weapon_skills[skill].skill);
        }
    }

    // unrestrict_weapon_skill(spell_skilltype(gu.urole.spelspec));
    // skill_based_spellbook_id();
}




function trquan(trop) {
    if (!trop.quan_min) return 0;
    return trop.quan_min + rn2(trop.quan_max - trop.quan_min + 1);
}

export function ini_inv(trop) {
    if (!trop) return;

    let got_sp1 = false;

    // We iterate through the array of items.
    for (let i = 0; i < trop.length; i++) {
        let t = trop[i];
        if (t.trotyp === 0 && t.trclass === 0 && t.quan_min === 0) break; // null terminator

        let quan = trquan(t);

        while (quan > 0) {
            let otyp = t.trotyp;
            let obj = null;

            if (otyp !== UNDEF_TYP) {
                // In C: obj = mksobj(otyp, TRUE, FALSE);
                rnd(2); // next_ident
                // mksobj_init for scrolls and potions does blessorcurse -> rn2(4)
                if (objects[otyp]) {
                    let objClass = objects[otyp].oc_class;
                    if (objClass === SCROLL_CLASS || objClass === POTION_CLASS) {
                        rn2(4);
                    }
                }
            } else {
                // UNDEF_TYP -> randomly generated object class
                // obj = mkobj(t.trclass, FALSE);
                let filter_otyp = ini_inv_mkobj_filter(t.trclass, got_sp1);
                otyp = filter_otyp;
            }

            if (t.trspe !== 'UNDEF_SPE' && t.trotyp === MAGIC_MARKER) {
                rn2(4); // from adjustment
            }

            // we simulate use_obj and adjustment but don't do real logic yet

            if (otyp !== UNDEF_TYP && objects[otyp] && objects[otyp].oc_class === SPBOOK_CLASS && objects[otyp].oc_oc2 === 1) {
                got_sp1 = true;
            }

            quan--;
        }
    }
}

export function discover_object(obj, a, b, c) {
    if (objects[obj]) {
        objects[obj].oc_name_known = 1;
    }
}

export function knows_object(obj, override_pauper) {
    if (game.u.uroleplay && game.u.uroleplay.pauper && !override_pauper) return;
    discover_object(obj, true, false, false);
}

export function knows_class(sym) {
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
