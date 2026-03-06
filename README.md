# Tenman iOS (Expo / React Native)

This is a standalone iOS-targeted migration of the original `tenman` app.

- Original `tenman` repo is untouched.
- Backend gameplay logic was moved into an in-app TypeScript engine.
- Persistence is now local on-device (`AsyncStorage`) so closing/reopening restores progress.

## What Was Migrated

Core game flow parity with the web app:

1. `Landing`
2. `Recruit Territories`
3. `Offer Recruits`
4. `Choose Tournament`
5. `Tournament Results`
6. `Menu`
7. `View Senior Players`
8. `View Junior Players`
9. `Training`
10. `Remove Player`
11. `Skip Ahead`
12. `Tournament Schedule`
13. `Exhibition Match`

Gameplay systems migrated into app logic:

- Recruit generation by territory profile
- Junior/senior roster handling
- Tournament qualification rules (`mandatory`, `accepted`, `wildcard`, `qualifying`)
- Tournament simulation with match-by-match text output
- Ranking and points updates
- Week/year progression, skip-week, skip-year
- End-of-year aging, improvement, promotion, retirement
- Training and exhibition match focus effects

## Local Persistence

Save key: `tenman_ios_save_v1`

- State is autosaved after changes
- On app launch, state is loaded automatically
- "Clear Saved Progress" on landing removes local save data

## Project Structure

- `App.tsx`: screen orchestration and app UI
- `src/engine/gameEngine.ts`: migrated game logic
- `src/data/recruiting.ts`: territories, names, constants
- `src/data/tournamentSchedule.ts`: ATP + junior schedule data (ported)
- `src/store/persistence.ts`: save/load state
- `src/types/game.ts`: typed game models

## Run

```bash
npm install
npm run ios
```

If using physical device / simulator setup via Expo:

```bash
npx expo start
```

## Validation Run

Type check:

```bash
npx tsc --noEmit
```

Bundle export smoke test:

```bash
npx expo export --platform ios --output-dir dist-test
```
