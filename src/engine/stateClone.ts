import { GameState } from "../types/game";

export const cloneState = (state: GameState): GameState => JSON.parse(JSON.stringify(state));
