import AsyncStorage from "@react-native-async-storage/async-storage";
import { GameState, Player } from "../types/game";

const SAVE_KEY = "tenman_ios_save_v1";
const STAMINA_MAX = 99;

const normalizeCurrency = (value: unknown): number => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) return 0;
  return Math.round(parsed);
};

const normalizeEarningsShare = (value: unknown, playerId: unknown): number => {
  const parsed = Number(value);
  if (Number.isFinite(parsed)) {
    return Math.max(1, Math.min(10, Math.round(parsed)));
  }

  const id = Number(playerId);
  if (Number.isFinite(id)) {
    return Math.abs(Math.trunc(id)) % 10 + 1;
  }
  return 5;
};

const normalizeStamina = (value: unknown): number => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 60;
  return Math.max(1, Math.min(STAMINA_MAX, parsed));
};

const hydratePlayer = (player: Player | Record<string, unknown>): Player => {
  const raw = player as Player & Record<string, unknown>;
  return {
    ...raw,
    career_earnings: normalizeCurrency(raw.career_earnings),
    earnings_share: normalizeEarningsShare(raw.earnings_share, raw.player_id),
    stamina: normalizeStamina(raw.stamina),
  } as Player;
};

const hydrateState = (state: GameState | Record<string, unknown>): GameState => {
  const raw = state as GameState & Record<string, unknown>;
  return {
    ...raw,
    agent_earnings: normalizeCurrency(raw.agent_earnings),
    userPlayers: Array.isArray(raw.userPlayers) ? raw.userPlayers.map((player) => hydratePlayer(player as Player)) : [],
    offerRecruits: Array.isArray(raw.offerRecruits) ? raw.offerRecruits.map((player) => hydratePlayer(player as Player)) : [],
  } as GameState;
};

export const loadGameState = async (): Promise<GameState | null> => {
  try {
    const raw = await AsyncStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    return hydrateState(JSON.parse(raw) as GameState);
  } catch (error) {
    console.error("Failed to load saved game", error);
    return null;
  }
};

export const saveGameState = async (state: GameState): Promise<void> => {
  try {
    await AsyncStorage.setItem(SAVE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error("Failed to save game", error);
  }
};

export const clearGameState = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(SAVE_KEY);
  } catch (error) {
    console.error("Failed to clear game", error);
  }
};
