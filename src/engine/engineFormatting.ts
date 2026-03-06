export const roundLabel = (round: number, rounds: number, qualifying = false): string => {
  if (qualifying) {
    return "qualifying";
  }
  if (rounds > round + 2) {
    return `round ${round}`;
  }
  if (rounds === round + 2) {
    return "quarterfinal";
  }
  if (rounds === round + 1) {
    return "semifinal";
  }
  return "final";
};

export const topFinishLabel = (resultTop: number): string => {
  const rounded = Math.max(1, Math.round(resultTop));
  if (rounded <= 1) return "Champion";
  if (rounded === 2) return "Runner-up";
  if (rounded === 4) return "Semifinals";
  if (rounded === 8) return "Quarterfinals";
  if (rounded === 16) return "Round of 16";
  if (rounded === 32) return "Round of 32";
  if (rounded === 64) return "Round of 64";
  if (rounded === 128) return "Round of 128";
  if (rounded === 256) return "Round of 256";
  return `Top ${rounded}`;
};
