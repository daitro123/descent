# Which touch control scheme fits deliberate isometric combat?

Type: prototype
Mode: HITL
Status: claimed
Blocked by: 03

## Question

Using placeholder shapes (capsule warrior, box enemies) in an isometric orthographic view, try the candidate control schemes on the phone:
- a virtual joystick plus on-screen action buttons,
- tap to move, tap an enemy to attack,
- any hybrid that comes out of trying them.

Decide the control scheme for the PoC, including how attacking, aiming or targeting, and a defensive action (if there is one) are triggered. Every other feel decision depends on this one, so it goes first.

## Comments

### Prototype ready for the phone (2026-09-26)

One scene, three control schemes, switched with the white bar at the **top** (the bottom corners belong to the controls), or with `?variant=`. Switching reloads the page and keeps `?tune`.

- **A · Stick + buttons** (`?variant=stick`): a floating stick wherever the left thumb lands (left 45% of the screen). On the right: ⚔ attack, 🛡 block (hold), » dodge (toward the stick, or straight back if the stick is idle).
- **B · Tap to move** (`?variant=tap`): one finger, no buttons. Tap the floor to walk there, tap a skeleton to walk up and swing once (tap again for the next swing). Hold still (0.22 s) to block toward your finger; flick to dodge that way.
- **C · Stick + gesture pad** (`?variant=gestures`): the same stick on the left, no buttons. The right side is a gesture pad: tap to attack (a tap *on* a skeleton aims at it), hold to block, flick to dodge in the flick's direction.

**Shared by all three:** the PoC's pixelated 3D scene and camera, the full KayKit Knight (swing, block, block-hit, 4 dodges, hit), and **3 Skeleton Minions as stand-in Enemies**. They walk up and telegraph each swing with a **red wedge on the floor** that fills over 0.8 s and shows where the swing will land. Only one winds up at a time. A swing that lands during the wind-up interrupts it. Three hits kill a skeleton, and it climbs back out of the floor 4 s later. **Aim assist** (A and C) turns a swing toward the nearest skeleton within 3 units and ±70°; a thin yellow ring shows which one it will pick. A thick ring marks a skeleton you've tapped. The bar shows a live tally: hits taken, blocked, dodged, kills. Desktop: WASD or arrows, J or Space to attack, K to block, L or Shift to dodge.

**Tuning (`?tune`):** Combat (aim assist on/off and its range and angle, reach, swing arc, hit timing, input buffer, dodge distance and time, block angle); Touch (hold delay, flick distance, tap-pick radius, stick size and dead zone, whether B keeps swinging); Enemies (on/off, telegraph time, speed, aggro, rest between swings); Movement; Camera.

**What to judge:** which scheme lets you pick your moment — step out of a wedge, block, or dodge, then answer with a swing — without fighting the controls. Also: is aim assist welcome or does it steal control? Is a separate defensive action needed at all, and which one: block, dodge, or both?

**Built-in choices the verdict should know about:**
- Movement stays on 8 directions in every scheme. Tap-to-move walks in one or two straight legs, with **no pathfinding**: it slides along walls instead of routing around them.
- Taps register when the finger lifts (so a tap can be told apart from a hold or a flick). A hold starts after 0.22 s; a flick is 30 px of travel before then.
- The Warrior stays facing forward while dodging (a sidestep or backstep clip), so you can dodge away from a skeleton while still facing it.
- The combat numbers (reach, timings, enemy behaviour) are stand-ins for the combat feel and enemy tickets, not proposals.

**Code:** `src/prototype-controls/` (replaces the PoC scene in `src/main.ts` for now; `src/scene/` is untouched). Assets are in `public/prototype-controls/kaykit/` (CC0): Knight and Skeleton Minion stripped to the clips used, about 0.65 MB each.
