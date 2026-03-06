import { useEffect, useState } from "react";
import { ExhibitionFocus } from "../../data/recruiting";
import { ScreenKey, Surface } from "../../types/game";

export const useExhibitionSetup = (screen: ScreenKey, week: number) => {
  const [exhPlayer1, setExhPlayer1] = useState<number | null>(null);
  const [exhPlayer2, setExhPlayer2] = useState<number | null>(null);
  const [exhSurface, setExhSurface] = useState<Surface>("hard");
  const [exhFocus1, setExhFocus1] = useState<ExhibitionFocus>("court");
  const [exhFocus2, setExhFocus2] = useState<ExhibitionFocus>("court");
  const [exhLines, setExhLines] = useState<string[] | null>(null);
  const [exhError, setExhError] = useState<string | null>(null);

  useEffect(() => {
    if (screen !== "exhibition-match") return;
    setExhLines(null);
    setExhError(null);
    setExhPlayer1(null);
    setExhPlayer2(null);
    setExhSurface("hard");
    setExhFocus1("court");
    setExhFocus2("court");
  }, [screen, week]);

  return {
    exhPlayer1,
    exhPlayer2,
    exhSurface,
    exhFocus1,
    exhFocus2,
    exhLines,
    exhError,
    setExhPlayer1,
    setExhPlayer2,
    setExhSurface,
    setExhFocus1,
    setExhFocus2,
    setExhLines,
    setExhError,
  };
};
