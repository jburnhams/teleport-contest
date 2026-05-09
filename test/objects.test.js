import { POT_HEALING, FOOD_RATION } from "../js/objects.js";
import { describe, it, expect } from 'vitest';
import { objects, DART, CORPSE, HEAVY_IRON_BALL, IRON_CHAIN, POT_HEALING, FOOD_RATION } from '../js/objects.js';
import * as Const from '../js/const.js';

describe('objects[] array extraction', () => {
    it('has the correct length', () => {
        expect(objects.length).toBe(390);
    });

    it('has correct properties for dart', () => {
        const dart = objects[DART];
        expect(dart).toBeDefined();
        expect(dart.oc_name).toBe("dart");
        expect(dart.oc_descr).toBe(null);
        expect(dart.oc_name_known).toBe(1);
        expect(dart.oc_merge).toBe(1);
        expect(dart.oc_uses_known).toBe(0);
        expect(dart.oc_magic).toBe(1);
        expect(dart.oc_charged).toBe(1);
        expect(dart.oc_unique).toBe(0);
        expect(dart.oc_nowish).toBe(0);
        expect(dart.oc_big).toBe(0);
        expect(dart.oc_tough).toBe(0);
        expect(dart.oc_dir).toBe(Const.PIERCE);
        expect(dart.oc_material).toBe(Const.IRON);
        expect(dart.oc_subtyp).toBe(-Const.P_DART);
        expect(dart.oc_oprop).toBe(0);
        expect(dart.oc_class).toBe(Const.WEAPON_CLASS);
        expect(dart.oc_prob).toBe(60);
        expect(dart.oc_delay).toBe(0);
        expect(dart.oc_weight).toBe(1);
        expect(dart.oc_cost).toBe(2);
        expect(dart.oc_wsdam).toBe(3);
        expect(dart.oc_wldam).toBe(2);
        expect(dart.oc_oc1).toBe(0);
        expect(dart.oc_oc2).toBe(0);
        expect(dart.oc_color).toBe(Const.HI_METAL);
    });

    it('has correct properties for corpse', () => {
        const corpse = objects[CORPSE];
        expect(corpse).toBeDefined();
        expect(corpse.oc_name).toBe("corpse");
        expect(corpse.oc_descr).toBe(null);
        expect(corpse.oc_name_known).toBe(1);
        expect(corpse.oc_merge).toBe(1);
        expect(corpse.oc_uses_known).toBe(0);
        expect(corpse.oc_magic).toBe(0);
        expect(corpse.oc_charged).toBe(0);
        expect(corpse.oc_unique).toBe(0);
        expect(corpse.oc_nowish).toBe(0);
        expect(corpse.oc_big).toBe(0);
        expect(corpse.oc_tough).toBe(0);
        expect(corpse.oc_dir).toBe(0);
        expect(corpse.oc_material).toBe(Const.FLESH); // tin param in FOOD is 0 for FLESH
        expect(corpse.oc_subtyp).toBe(0);
        expect(corpse.oc_oprop).toBe(0);
        expect(corpse.oc_class).toBe(Const.FOOD_CLASS);
        expect(corpse.oc_prob).toBe(0);
        expect(corpse.oc_delay).toBe(1);
        expect(corpse.oc_weight).toBe(0);
        expect(corpse.oc_cost).toBe(5);
        expect(corpse.oc_wsdam).toBe(0);
        expect(corpse.oc_wldam).toBe(0);
        expect(corpse.oc_oc1).toBe(0);
        expect(corpse.oc_oc2).toBe(0);
        expect(corpse.oc_color).toBe(Const.CLR_BROWN);
    });

    it('has correct properties for heavy iron ball', () => {
        const ball = objects[HEAVY_IRON_BALL];
        expect(ball).toBeDefined();
        expect(ball.oc_name).toBe("heavy iron ball");
        expect(ball.oc_descr).toBe(null);
        expect(ball.oc_name_known).toBe(1);
        expect(ball.oc_merge).toBe(0);
        expect(ball.oc_uses_known).toBe(0); // C passes 0
        expect(ball.oc_magic).toBe(0);
        expect(ball.oc_charged).toBe(0);
        expect(ball.oc_unique).toBe(0);
        expect(ball.oc_nowish).toBe(0);
        expect(ball.oc_big).toBe(0);
        expect(ball.oc_tough).toBe(0);
        expect(ball.oc_dir).toBe(Const.WHACK);
        expect(ball.oc_material).toBe(Const.IRON);
        expect(ball.oc_subtyp).toBe(0);
        expect(ball.oc_oprop).toBe(0);
        expect(ball.oc_class).toBe(Const.BALL_CLASS);
        expect(ball.oc_prob).toBe(1000);
        expect(ball.oc_delay).toBe(0);
        expect(ball.oc_weight).toBe(480);
        expect(ball.oc_cost).toBe(10);
        expect(ball.oc_wsdam).toBe(25);
        expect(ball.oc_wldam).toBe(25);
        expect(ball.oc_oc1).toBe(0);
        expect(ball.oc_oc2).toBe(0);
        expect(ball.oc_color).toBe(Const.HI_METAL);
    });

    it('has correct properties for iron chain', () => {
        const chain = objects[IRON_CHAIN];
        expect(chain).toBeDefined();
        expect(chain.oc_name).toBe("iron chain");
        expect(chain.oc_descr).toBe(null);
        expect(chain.oc_name_known).toBe(1);
        expect(chain.oc_merge).toBe(0);
        expect(chain.oc_uses_known).toBe(0);
        expect(chain.oc_magic).toBe(0);
        expect(chain.oc_charged).toBe(0);
        expect(chain.oc_unique).toBe(0);
        expect(chain.oc_nowish).toBe(0);
        expect(chain.oc_big).toBe(0);
        expect(chain.oc_tough).toBe(0);
        expect(chain.oc_dir).toBe(Const.WHACK);
        expect(chain.oc_material).toBe(Const.IRON);
        expect(chain.oc_subtyp).toBe(0);
        expect(chain.oc_oprop).toBe(0);
        expect(chain.oc_class).toBe(Const.CHAIN_CLASS);
        expect(chain.oc_prob).toBe(1000);
        expect(chain.oc_delay).toBe(0);
        expect(chain.oc_weight).toBe(120);
        expect(chain.oc_cost).toBe(0);
        expect(chain.oc_wsdam).toBe(4);
        expect(chain.oc_wldam).toBe(4);
        expect(chain.oc_oc1).toBe(0);
        expect(chain.oc_oc2).toBe(0);
        expect(chain.oc_color).toBe(Const.HI_METAL);
    });
});


describe('objects[] additional extraction validations', () => {
    it('has correct properties for potion of healing', () => {
        const potion = objects[POT_HEALING];
        expect(potion).toBeDefined();
        expect(potion.oc_name).toBe("healing");
        expect(potion.oc_class).toBe(Const.POTION_CLASS);
        expect(potion.oc_material).toBe(Const.GLASS);
    });

    it('has correct properties for food ration', () => {
        const ration = objects[FOOD_RATION];
        expect(ration).toBeDefined();
        expect(ration.oc_name).toBe("food ration");
        expect(ration.oc_class).toBe(Const.FOOD_CLASS);
        expect(ration.oc_material).toBe(Const.VEGGY);
    });
});
