# Tasks

Work is split into parallel streams in `tasks/`. Each stream can be worked on independently by a separate agent or session.

## Dependency Graph

```
    Stream A ─────────────────────────────────┐
    (Data Tables)                              │
    js/objects.js, js/monst.js, js/role.js     │
    scripts/extract-*.js                       │
                                               ▼
    Stream B ──────┐                     Stream D
    (RNG Path)     │                     (Object System)
    js/chargen.js  │                     js/mkobj.js, js/invent.js
    js/mklev.js    │─── depends on ───▶  js/objnam.js
                   │    A + D + E
                   │                     Stream E
                   │                     (Monster System)
                   └─────────────────▶   js/mkmon.js, js/mon.js
                                         js/mondata.js

    Stream C (Display) ── independent ──── can start NOW
    js/botl.js, js/pline.js, js/display.js improvements
```

## Stream Quick Reference

| Stream | File | Can start | Dependencies | Touches |
|--------|------|-----------|--------------|---------|
| [A](tasks/A-data-tables.md) | Data Tables & Constants | **NOW** | None | `scripts/`, `js/objects.js`, `js/monst.js`, `js/role.js` |
| [B](tasks/B-rng-foundation.md) | RNG Critical Path | **NOW** (tasks 1-3), then needs A | A (for task 4+) | `js/chargen.js`, `js/mklev.js`, `js/allmain.js` |
| [C](tasks/C-display.md) | Display & Terminal | **NOW** | None | `js/botl.js`, `js/pline.js`, `js/display.js` |
| [D](tasks/D-object-system.md) | Object System | After A | A | `js/mkobj.js`, `js/invent.js`, `js/objnam.js` |
| [E](tasks/E-monster-system.md) | Monster System | After A | A | `js/mkmon.js`, `js/mon.js`, `js/mondata.js`, `js/monmove.js` |
| [F](tasks/F-hero-init.md) | Hero Init & Game Loop | After A, D | A, D | `js/u_init.js`, `js/attrib.js`, `js/exper.js` |

**Streams A, B (early tasks), and C can all start NOW in parallel — zero dependencies between them.**

Once A lands, D and E can start in parallel with each other.
Once A + D land, F can start.
B's later tasks (mklev fill) need D + E.

## Rules for parallel work

1. Each stream touches different files — no merge conflicts
2. Every stream must run `npm run score:check` before merging — no regressions
3. Each stream works on its own feature branch (`feature/stream-a-data-tables`, etc.)
4. When a dependency lands on `main`, rebase your branch onto it
