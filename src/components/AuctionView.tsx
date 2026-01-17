import { BidControls } from "./BidControls";
import type { Player, Team } from "../types";
import "./AuctionView.css";

interface AuctionViewProps {
  activePlayer: Player | null;
  currentBid: number | null;
  currentLeader: { id: string; name: string } | null;
  globalBid: number;
  teams: Team[];
  onSetGlobalBid: (value: number) => void;
  onReverseBid: () => void;
  onPlaceBid: (teamId: string, amount: number) => void;
  onFinalizeSale: () => void;
  onMarkUnsold: () => void;
  onBack: () => void;
}

export function AuctionView({
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
  onBack,
}: AuctionViewProps) {
  return (
    <section className="auction">
      <div className="auction-card">
        <button className="ghost back-btn" onClick={onBack}>
          ← Back to player pool
        </button>
        {activePlayer ? (
          <>
            {/* Column 1: Player Info (Left) */}
            <div className="auction-column-1">
              <div className="player-info-section">
                <div className="auction-left">
                  <img
                    className="hero-img"
                    src={
                      activePlayer.image ||
                      "https://placehold.co/200x220?text=Player"
                    }
                    alt={activePlayer.name}
                  />
                  <div>
                    <p className="eyebrow">Player in auction</p>
                    <h2>{activePlayer.name}</h2>
                    <p className="player-role">{activePlayer.role}</p>
                  </div>
                </div>
                <div className="player-meta">
                  <p>Category: {activePlayer.category}</p>
                  <p>Base price: {activePlayer.basePrice.toLocaleString()} pts</p>
                  <div className="current-bid">
                    <p className="meta">Current bid</p>
                    <h1>
                      {currentBid
                        ? currentBid.toLocaleString()
                        : activePlayer.basePrice.toLocaleString()} {" "}
                      pts
                      {currentLeader ? (
                        <span className="leader"> • {currentLeader.name}</span>
                      ) : (
                        <span className="leader"> • No bids yet</span>
                      )}
                    </h1>
                    <div className="finalize-row">
                      <span className="meta subtle">
                        Choose a bid amount, set it for a team, then finalize.
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Column 2: Stats Frame (Middle) */}
            <div className="auction-column-2">
              <div className="stats-frame">
                <img
                  src={
                    activePlayer.statsImage ||
                    activePlayer.image ||
                    "https://placehold.co/640x360?text=Player+Stats"
                  }
                  alt={`${activePlayer.name} stats`}
                />
              </div>
            </div>

            {/* Column 3: Bid Controls (Right) */}
            <div className="auction-column-3">
              <BidControls
                activePlayer={activePlayer}
                currentBid={currentBid}
                currentLeader={currentLeader}
                globalBid={globalBid}
                teams={teams}
                onSetGlobalBid={onSetGlobalBid}
                onReverseBid={onReverseBid}
                onPlaceBid={onPlaceBid}
                onFinalizeSale={onFinalizeSale}
                onMarkUnsold={onMarkUnsold}
              />
            </div>
          </>
        ) : (
          <p className="muted">No player selected. Go back to the pool to pick someone.</p>
        )}
      </div>
    </section>
  );
}
