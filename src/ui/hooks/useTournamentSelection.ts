import { useEffect, useState } from "react";
import { PlayerTournamentEligibility, TournamentWithPlayers } from "../../types/game";

export const useTournamentSelection = (
  screen: string,
  availableTournaments: TournamentWithPlayers[],
) => {
  const [selectedByTournament, setSelectedByTournament] = useState<Record<string, number[]>>({});

  useEffect(() => {
    if (screen !== "choose-tournament") return;

    const mandatory: Record<string, number[]> = {};
    availableTournaments.forEach(({ tournament, players }) => {
      const ids = players.filter((player) => player.qualify_tourney === -1).map((player) => player.player_id);
      if (ids.length) mandatory[tournament.name] = ids;
    });
    setSelectedByTournament(mandatory);
  }, [screen, availableTournaments]);

  const toggleTournamentPlayer = (
    tournamentName: string,
    player: PlayerTournamentEligibility,
  ) => {
    if (player.qualify_tourney === 0) return;

    const isMandatorySomewhere = availableTournaments.some((entry) => {
      const found = entry.players.find((candidate) => candidate.player_id === player.player_id);
      return found?.qualify_tourney === -1;
    });
    if (isMandatorySomewhere) return;

    setSelectedByTournament((prev) => {
      const next: Record<string, number[]> = {};
      Object.entries(prev).forEach(([name, ids]) => {
        const filtered = ids.filter((id) => id !== player.player_id);
        if (filtered.length > 0) next[name] = filtered;
      });

      const current = prev[tournamentName] ?? [];
      const alreadySelected = current.includes(player.player_id);
      if (!alreadySelected) {
        next[tournamentName] = [...(next[tournamentName] ?? []), player.player_id];
      }
      return next;
    });
  };

  return { selectedByTournament, toggleTournamentPlayer };
};
