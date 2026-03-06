import AsyncStorage from "@react-native-async-storage/async-storage";
import { GameState } from "../types/game";

const SAVE_KEY = "tenman_ios_save_v1";

export const loadGameState = async (): Promise<GameState | null> => {
  try {
    const raw = await AsyncStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as GameState;
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
