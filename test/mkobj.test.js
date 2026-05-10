import { describe, it, expect, beforeEach } from 'vitest';
import { newobj, place_object, remove_object, obj_extract_self, OBJ_FREE, OBJ_FLOOR } from '../js/mkobj.js';
import { game, resetGame } from '../js/gstate.js';
import { GameMap } from '../js/game.js';
import { set_fobj, fobj } from '../js/decl.js';
import { BOULDER, GOLD_PIECE } from '../js/objects.js';

describe('mkobj linked list operations', () => {
    beforeEach(() => {
        resetGame();
        game.level = new GameMap();
        set_fobj(null);
    });

    it('creates a new object properly', () => {
        const obj = newobj();
        expect(obj.where).toBe(OBJ_FREE);
        expect(obj.ox).toBe(0);
        expect(obj.oy).toBe(0);
        expect(obj.quan).toBe(0);
    });

    it('places an object on the floor', () => {
        const obj = newobj();
        obj.otyp = GOLD_PIECE;

        place_object(obj, 10, 10);

        expect(obj.where).toBe(OBJ_FLOOR);
        expect(obj.ox).toBe(10);
        expect(obj.oy).toBe(10);
        expect(game.level.objects[10][10]).toBe(obj);
        expect(fobj).toBe(obj);
    });

    it('places an object under a boulder', () => {
        const bobj = newobj();
        bobj.otyp = BOULDER;
        place_object(bobj, 10, 10);

        const gobj = newobj();
        gobj.otyp = GOLD_PIECE;
        place_object(gobj, 10, 10);

        expect(game.level.objects[10][10]).toBe(bobj);
        expect(bobj.nexthere).toBe(gobj);
        expect(gobj.nexthere).toBeNull();

        // fobj list has gobj at head, then bobj
        expect(fobj).toBe(gobj);
        expect(fobj.nobj).toBe(bobj);
    });

    it('removes an object from the floor', () => {
        const obj = newobj();
        obj.otyp = GOLD_PIECE;
        place_object(obj, 5, 5);
        expect(game.level.objects[5][5]).toBe(obj);

        remove_object(obj);
        expect(game.level.objects[5][5]).toBeNull();
        expect(fobj).toBeNull();
        expect(obj.where).toBe(OBJ_FREE);
    });

    it('extracts self', () => {
        const obj = newobj();
        obj.otyp = GOLD_PIECE;
        place_object(obj, 5, 5);
        expect(fobj).toBe(obj);

        obj_extract_self(obj);

        expect(game.level.objects[5][5]).toBeNull();
        expect(fobj).toBeNull();
        expect(obj.where).toBe(OBJ_FREE);
    });
});
