# Caravan

Oregon Trail, but you can actually make it to Oregon.

## Why This Exists

The original Oregon Trail taught a generation that dysentery is hilarious and fording rivers is basically Russian roulette. This version keeps the brutal survival mechanics but adds some actual strategy. You might still die of cholera, but at least you'll understand why.

## Features

- **Party management** - Name your pioneers, watch them get sick, desperately feed them medicine
- **Supply economy** - Food, ammo, medicine, spare parts. Never enough of any of them.
- **Weather system** - Seasons matter. Crossing the Rockies in winter is as bad an idea as it sounds.
- **Random events** - Illness, injury, theft, broken axles, the occasional windfall
- **River crossings** - Ford it (free but risky), caulk and float (uses parts), ferry (costs money), or wait (lose days)
- **Hunting** - Spend ammo, maybe get food. The math is not in your favor.
- **17 historical locations** - Independence to Oregon City, 2,000 miles of regret
- **Sound effects** - Retro synthesized sounds for all key actions
- **Leaderboard** - Track your best journeys (distance, survivors, time bonuses)

## Quick Start

```bash
npm install
npm run dev
```

Open http://localhost:3000 and try not to let everyone die.

## How to Play

1. **Name your party** - Pick a month to depart (hint: not winter)
2. **Buy supplies** - Food is critical, medicine is clutch, spare parts save lives
3. **Hit the trail** - Adjust pace and rations as needed
4. **Survive** - Handle events, cross rivers, hunt when desperate
5. **Reach Oregon** - With at least one person alive

## Controls

- **Pace** - Steady (safe), Strenuous (faster, costs health), Grueling (you'll regret this)
- **Rations** - Filling (healthy), Meager (stretches food), Bare Bones (starvation diet)
- **Rest** - Burns a day, everyone heals a bit
- **Hunt** - Uses ammo, returns 0-100 lbs of food based on luck

## Survival Tips

- Start in spring (March-May). Trust me.
- Food consumption scales with party size. Fewer mouths = longer survival.
- Grueling pace damages health AND the wagon. Use sparingly.
- Ferry crossings are expensive but nobody drowns.
- Save medicine for illness, not injuries. Injuries heal; cholera doesn't.

## Tech Stack

- Next.js 14
- TypeScript
- Tailwind CSS
- 292 tests (because Oregon Trail edge cases are wild)

## Architecture

```
src/
  game/           # Core game logic
    Party.ts      # Health, status, death
    Supplies.ts   # Resource tracking
    Wagon.ts      # Damage, oxen, speed
    Weather.ts    # Seasonal generation
    Events.ts     # Random encounters
    Travel.ts     # Distance calculation
    River.ts      # Crossing mechanics
    Hunting.ts    # Ammo to food conversion
    Store.ts      # Buy/sell transactions
    Sound.ts      # Web Audio synthesized SFX
    Game.ts       # Orchestrator
  components/     # React UI
  __tests__/      # Jest tests
```

## Historical Accuracy

Locations are real. Distances are approximately real. Disease and death rates are toned down because nobody wants to restart 47 times. The original Oregon Trail had a hidden message about resource management and mortality. This one has the same message but with better UI.

## License

MIT

## Author

Katie

---

*You have died of mass regret.*
