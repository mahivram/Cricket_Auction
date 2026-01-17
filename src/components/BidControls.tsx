import type { Player, Team } from "../types";
import "./BidControls.css";

interface BidControlsProps {
  activePlayer: Player;
  currentBid: number | null;
  currentLeader: { id: string; name: string } | null;
  globalBid: number;
  teams: Team[];
  onSetGlobalBid: (value: number) => void;
  onReverseBid: () => void;
  onPlaceBid: (teamId: string, amount: number) => void;
  onFinalizeSale: () => void;
  onMarkUnsold: () => void;
}

export function BidControls({
  activePlayer,
  currentBid,
  currentLeader,
  globalBid,
  teams,
  onSetGlobalBid,
  onReverseBid,
  onPlaceBid,
  onFinalizeSale,
  onMarkUnsold,
}: BidControlsProps) {
  return (
    <div className="bid-controls-panel">
      <div className="bid-control-group">
        <label className="field inline-field">
          <span>Bid amount (pts)</span>
          <input
            type="number"
            min={currentBid ? currentBid + 1000 : activePlayer.basePrice}
            value={globalBid}
            onChange={(e) => onSetGlobalBid(Number(e.target.value))}
          />
        </label>
        <div className="bid-adjust-buttons">
          <button
            className="secondary small"
            onClick={() => {
              const minimum = currentBid
                ? currentBid + 1000
                : activePlayer.basePrice;
              onSetGlobalBid(Math.max(minimum, globalBid - 1000));
            }}
          >
            −1k
          </button>
          <button
            className="secondary small"
            onClick={() => onSetGlobalBid(globalBid + 1000)}
          >
            +1k
          </button>
          <button
            className="secondary small danger"
            disabled={!currentLeader}
            onClick={onReverseBid}
          >
            Reverse bid
          </button>
        </div>
      </div>
      <div className="team-bid-grid">
        {teams.map((team) => (
          <div key={team.id} className="team-bid-card">
            <div className="team-bid-header">
              <div className="team-name-section">
                <span className="team-bid-name">{team.name}</span>
                <span className="team-bid-budget">
                  {team.budget.toLocaleString()} pts
                </span>
              </div>
            </div>
            <button
              className="team-bid-button"
              disabled={!activePlayer || globalBid > team.budget}
              onClick={() => onPlaceBid(team.id, globalBid)}
            >
              Set bid
            </button>
          </div>
        ))}
      </div>
      <div className="soldbtn">
        <button
          className="primary finalize-btn"
          disabled={!currentLeader}
          onClick={onFinalizeSale}
        >
          Finalize sale
        </button>
        <button
          className="secondary unsold-btn"
          disabled={!activePlayer || !!currentLeader}
          onClick={onMarkUnsold}
        >
          Mark as unsold
        </button>
      </div>
    </div>
  );
}
