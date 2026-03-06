import { useEffect, useState } from "react";
import { ScreenKey } from "../../types/game";

export const useScreenLocalState = (screen: ScreenKey, week: number) => {
  const [resultIndex, setResultIndex] = useState(0);
  const [trainingChoices, setTrainingChoices] = useState<Record<number, number>>({});
  const [selectedWeek, setSelectedWeek] = useState(2);

  useEffect(() => {
    if (screen === "tournament-results") {
      setResultIndex(0);
    }
    if (screen === "training") {
      setTrainingChoices({});
    }
    if (screen === "skip-ahead") {
      setSelectedWeek(Math.min(52, week + 1));
    }
  }, [screen, week]);

  return {
    resultIndex,
    trainingChoices,
    selectedWeek,
    setResultIndex,
    setTrainingChoices,
    setSelectedWeek,
  };
};
