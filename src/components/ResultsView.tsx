import type { Player, Team } from "../types";
import "./ResultsView.css";

interface ResultsViewProps {
  teams: Team[];
  unsoldPlayers: Array<{ player: Player; timestamp: number }>;
  onClearUnsold: () => void;
  onRemovePlayerFromTeam: (teamId: string, playerId: string) => void;
  onBack: () => void;
}

export function ResultsView({
  teams,
  unsoldPlayers,
  onClearUnsold,
  onRemovePlayerFromTeam,
  onBack,
}: ResultsViewProps) {
  return (
    <section className="results-section">
      <div className="results-header">
        <h2>Auction Results</h2>
        <button className="ghost" onClick={onBack}>
          Back to pool
        </button>
      </div>

      <div className="results-grid">
        <div className="results-panel">
          <h3 className="results-title unsold-title">
            Unsold Players ({unsoldPlayers.length})
          </h3>
          {unsoldPlayers.length === 0 ? (
            <p className="muted">No unsold players yet.</p>
          ) : (
            <div className="results-list">
              {unsoldPlayers.map(({ player, timestamp }) => (
                <div key={timestamp} className="results-item">
                  <img
                    src={player.image || "https://placehold.co/50x50?text=Player"}
                    alt={player.name}
                    className="results-img"
                  />
                  <div className="results-item-info">
                    <p className="results-item-name">{player.name}</p>
                    <p className="results-item-meta">
                      {player.role} • {player.category}
                    </p>
                    <p className="results-item-base">
                      Base: {player.basePrice.toLocaleString()} pts
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
          <button
            className="secondary small"
            onClick={onClearUnsold}
            disabled={unsoldPlayers.length === 0}
          >
            Clear unsold list
          </button>
        </div>

        <div className="results-panel sold-panel">
          <h3 className="results-title sold-title">Sold Players by Team</h3>
          <div className="team-results">
            {teams.map((team) => (
              <div key={team.id} className="team-results-section">
                <div className="team-results-header">
                  {team.logo && (
                    <div className="team-results-logo">
                      <img src={team.logo} alt={team.name} />
                    </div>
                  )}
                  <div className="team-header-info">
                    <h4>{team.name}</h4>
                    <span className="team-results-count">
                      {(team.roster?.length ?? 0)} player
                      {(team.roster?.length ?? 0) !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>
                <div className="team-results-budget">
                  <p>Budget spent: {(150000 - team.budget).toLocaleString()} pts</p>
                  <p>Budget left: {team.budget.toLocaleString()} pts</p>
                </div>
                {(team.roster?.length ?? 0) === 0 ? (
                  <p className="muted">No players picked yet.</p>
                ) : (
                  <ul className="team-roster-list">
                    {(team.roster || []).map((player) => (
                      <li key={player.id} className="roster-item">
                        <div className="roster-item-info">
                          <span className="roster-item-name">{player.name}</span>
                          <span className="roster-item-role">{player.role}</span>
                        </div>
                        <div className="roster-item-right">
                          <span className="roster-item-bid">
                            {player.winningBid.toLocaleString()} pts
                          </span>
                          <button
                            className="ghost small remove-btn"
                            onClick={() => onRemovePlayerFromTeam(team.id, player.id)}
                          >
                            ✕
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
