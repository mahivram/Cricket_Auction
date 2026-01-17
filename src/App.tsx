import { useEffect, useMemo, useState } from "react";
import "./App.css";
import { AuctionView } from "./components/AuctionView";
import { ResultsView } from "./components/ResultsView";
import { EditPlayerModal } from "./components/EditPlayerModal";
import { AddPlayerModal } from "./components/AddPlayerModal";
import { SettingsModal } from "./components/SettingsModal";
import { PresetsModal } from "./components/PresetsModal";
import type { Category, Player, Stage, Team } from "./types";

const makeId = () => `p-${Math.random().toString(36).slice(2, 8)}`;

const playerPool: Player[] = [];

const initialTeams: Team[] = [];

const categoryDefaults: Record<Category, number> = {
  Legends: 20000,
  Elite: 15000,
  "Rising Stars": 10000,
  Uncapped: 6000,
  Unsold: 0,
};

function App() {
  const [stage, setStage] = useState<Stage>("pool");
  const [players, setPlayers] = useState<Player[]>(() => {
    try {
      const saved = localStorage.getItem("auctionPlayers");
      return saved ? JSON.parse(saved) : playerPool;
    } catch {
      return playerPool;
    }
  });
  const [activePlayer, setActivePlayer] = useState<Player | null>(null);
  const [teams, setTeams] = useState<Team[]>(() => {
    try {
      const saved = localStorage.getItem("auctionTeams");
      if (saved) {
        const parsed = JSON.parse(saved);
        // Ensure all teams have required fields
        return parsed.map((t: any) => ({
          id: t.id || `t-${Math.random().toString(36).slice(2, 8)}`,
          name: t.name || "Unknown Team",
          budget: t.budget ?? 150000,
          roster: t.roster || [],
          logo: t.logo,
        }));
      }
      return initialTeams;
    } catch {
      return initialTeams;
    }
  });
  const [bidInputs, setBidInputs] = useState<Record<string, string>>({});
  const [banner, setBanner] = useState<{
    type: "success" | "error" | "info";
    message: string;
  } | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [playerModalOpen, setPlayerModalOpen] = useState(false);
  const [settingsMode, setSettingsMode] = useState<"edit" | "add">("edit");
  const [editPlayerId, setEditPlayerId] = useState<string>("");
  const [playerForm, setPlayerForm] = useState<{
    name: string;
    image: string;
    statsImage: string;
    basePrice: number;
  }>(() => ({
    name: "",
    image: "",
    statsImage: "",
    basePrice: 0,
  }));
  const [newPlayerForm, setNewPlayerForm] = useState<{
    name: string;
    role: string;
    category: Player["category"];
    basePrice: number;
    image: string;
    statsImage: string;
  }>(() => ({
    name: "",
    role: "",
    category: "Legends",
    basePrice: categoryDefaults.Legends,
    image: "",
    statsImage: "",
  }));
  const [categoryBase, setCategoryBase] = useState<Record<Category, number>>(
    () => {
      try {
        const saved = localStorage.getItem("auctionCategoryBase");
        return saved ? JSON.parse(saved) : categoryDefaults;
      } catch {
        return categoryDefaults;
      }
    },
  );
  const [currentBid, setCurrentBid] = useState<number | null>(null);
  const [currentLeader, setCurrentLeader] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [globalBid, setGlobalBid] = useState<number>(0);
  const [presetsOpen, setPresetsOpen] = useState(false);
  const [bidHistory, setBidHistory] = useState<
    Array<{ bid: number; teamId: string; teamName: string }>
  >([]);
  const [showSoldSeal, setShowSoldSeal] = useState(false);
  const [soldInfo, setSoldInfo] = useState<{
    playerName: string;
    teamName: string;
    teamLogo?: string;
    bid: number;
  } | null>(null);
  const [showUnsoldSeal, setShowUnsoldSeal] = useState(false);
  const [unsoldInfo, setUnsoldInfo] = useState<{
    playerName: string;
  } | null>(null);
  const [unsoldPlayers, setUnsoldPlayers] = useState<
    Array<{ player: Player; timestamp: number }>
  >(() => {
    try {
      const saved = localStorage.getItem("unsoldPlayers");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("unsoldPlayers", JSON.stringify(unsoldPlayers));
  }, [unsoldPlayers]);

  useEffect(() => {
    localStorage.setItem("auctionPlayers", JSON.stringify(players));
  }, [players]);

  useEffect(() => {
    localStorage.setItem("auctionTeams", JSON.stringify(teams));
  }, [teams]);

  useEffect(() => {
    localStorage.setItem("auctionCategoryBase", JSON.stringify(categoryBase));
  }, [categoryBase]);

  const loadImageFile = (file: File, onReady: (url: string) => void) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        onReady(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleEditFileUpload = (
    file: File,
    key: "image" | "statsImage",
  ) => {
    loadImageFile(file, (url) =>
      setPlayerForm((prev) => ({
        ...prev,
        [key]: url,
      })),
    );
  };

  const handleAddFileUpload = (
    file: File,
    key: "image" | "statsImage",
  ) => {
    loadImageFile(file, (url) =>
      setNewPlayerForm((prev) => ({
        ...prev,
        [key]: url,
      })),
    );
  };

  const updatePlayerForm = (
    key: keyof typeof playerForm,
    value: string | number,
  ) => {
    setPlayerForm((prev) => ({ ...prev, [key]: value }));
  };

  const updateNewPlayerForm = (
    key: keyof typeof newPlayerForm,
    value: string | number,
  ) => {
    setNewPlayerForm((prev) => ({ ...prev, [key]: value }));
  };

  useEffect(() => {
    const player = players.find((p) => p.id === editPlayerId);
    if (player) {
      setPlayerForm({
        name: player.name,
        image: player.image ?? "",
        statsImage: player.statsImage ?? "",
        basePrice: player.basePrice,
      });
    }
  }, [editPlayerId, players]);

  const assignments = useMemo(() => {
    const map = new Map<string, string>();
    teams.forEach((team) => {
      if (team.roster && Array.isArray(team.roster)) {
        team.roster.forEach((player) => map.set(player.id, team.name));
      }
    });
    return map;
  }, [teams]);

  const pooledByCategory = useMemo(() => {
    return players.reduce<Record<string, Player[]>>((acc, player) => {
      if (!acc[player.category]) acc[player.category] = [];
      acc[player.category].push(player);
      return acc;
    }, {});
  }, [players]);

  const clearBannerLater = () => {
    window.setTimeout(() => setBanner(null), 3000);
  };

  const openSettings = (playerId?: string) => {
    // Open SettingsModal for clearing data
    setSettingsOpen(true);
  };

  const openAddPlayer = () => {
    setSettingsMode("add");
    setPlayerModalOpen(true);
    setNewPlayerForm({
      name: "",
      role: "",
      category: "Legends",
      basePrice: categoryBase.Legends,
      image: "",
      statsImage: "",
    });
  };

  const openEditPlayer = (playerId?: string) => {
    const targetId = playerId || activePlayer?.id;
    if (!targetId) return;
    setSettingsMode("edit");
    setEditPlayerId(targetId);
    setPlayerModalOpen(true);
  };

  const handleSendToAuction = (player: Player) => {
    setActivePlayer(player);
    setStage("auction");
    setCurrentBid(null);
    setGlobalBid(player.basePrice);
    setCurrentLeader(null);
    setBidHistory([]);
    setBidInputs(
      Object.fromEntries(
        teams.map((team) => [team.id, String(player.basePrice)]),
      ),
    );
  };

  const handlePlaceBid = (teamId: string, overrideValue?: number) => {
    if (!activePlayer) return;

    const currentTeam = teams.find((team) => team.id === teamId);
    if (!currentTeam) return;

    const bidValue =
      overrideValue ??
      (bidInputs[teamId] !== undefined ? Number(bidInputs[teamId]) : NaN);
    const alreadyTakenBy = assignments.get(activePlayer.id);
    
    // First bid can be at base price; subsequent bids must be higher
    const minimum = currentBid ? currentBid + 1000 : activePlayer.basePrice;

    if (!Number.isFinite(bidValue) || bidValue <= 0) {
      setBanner({ type: "error", message: "Enter a positive bid value." });
      clearBannerLater();
      return;
    }

    if (bidValue < minimum) {
      setBanner({
        type: "error",
        message: `Bid must be at least ${minimum.toLocaleString()} pts.`,
      });
      clearBannerLater();
      return;
    }

    if (alreadyTakenBy) {
      setBanner({
        type: "error",
        message: `${activePlayer.name} already belongs to ${alreadyTakenBy}.`,
      });
      clearBannerLater();
      return;
    }

    if (currentTeam.roster.length >= 14) {
      setBanner({
        type: "error",
        message: `${currentTeam.name} already has 14 players.`,
      });
      clearBannerLater();
      return;
    }

    if (bidValue > currentTeam.budget) {
      setBanner({
        type: "error",
        message: `${currentTeam.name} does not have enough auction points.`,
      });
      clearBannerLater();
      return;
    }
    setCurrentBid(bidValue);
    setCurrentLeader({ id: currentTeam.id, name: currentTeam.name });
    setBidInputs((prev) => ({ ...prev, [teamId]: String(bidValue) }));
    setGlobalBid(bidValue + 1000);
    setBidHistory((prev) => [
      ...prev,
      { bid: bidValue, teamId, teamName: currentTeam.name },
    ]);
  };

  const handleFinalizeSale = () => {
    if (!activePlayer || !currentLeader || currentBid === null) {
      setBanner({
        type: "error",
        message: "Set a current bid and leader before finalizing.",
      });
      clearBannerLater();
      return;
    }

    const currentTeam = teams.find((team) => team.id === currentLeader.id);
    if (!currentTeam) return;

    const alreadyTakenBy = assignments.get(activePlayer.id);
    if (alreadyTakenBy) {
      setBanner({
        type: "error",
        message: `${activePlayer.name} already belongs to ${alreadyTakenBy}.`,
      });
      clearBannerLater();
      return;
    }

    if (currentTeam.roster.length >= 14) {
      setBanner({
        type: "error",
        message: `${currentTeam.name} already has 14 players.`,
      });
      clearBannerLater();
      return;
    }

    if (currentBid > currentTeam.budget) {
      setBanner({
        type: "error",
        message: `${currentTeam.name} does not have enough auction points.`,
      });
      clearBannerLater();
      return;
    }

    setTeams((prev) =>
      prev.map((team) =>
        team.id === currentTeam.id
          ? {
              ...team,
              budget: team.budget - currentBid,
              roster: [
                ...team.roster,
                { ...activePlayer, winningBid: currentBid },
              ],
            }
          : team,
      ),
    );

    // Show sold seal with team logo
    setShowSoldSeal(true);
    setSoldInfo({
      playerName: activePlayer.name,
      teamName: currentTeam.name,
      teamLogo: currentTeam.logo,
      bid: currentBid,
    });

    setTimeout(() => {
      setShowSoldSeal(false);
      setCurrentBid(null);
      setCurrentLeader(null);
      setActivePlayer(null);
      setStage("pool");
      setBidInputs({});
      setBidHistory([]);
    }, 2000);

    setBanner({
      type: "success",
      message: `${activePlayer.name} sold to ${currentTeam.name} for ${currentBid.toLocaleString()} pts.`,
    });
    clearBannerLater();
  };

  const resetAuction = () => {
    setStage("pool");
    setActivePlayer(null);
    setBidInputs({});
    setCurrentBid(null);
    setCurrentLeader(null);
    setGlobalBid(0);
    setBidHistory([]);
  };

  const handleReverseBid = () => {
    if (!activePlayer || bidHistory.length === 0) return;

    const newHistory = [...bidHistory];
    newHistory.pop();
    setBidHistory(newHistory);

    if (newHistory.length === 0) {
      // No more bids, reset to base price
      setCurrentBid(activePlayer.basePrice);
      setCurrentLeader(null);
      setGlobalBid(activePlayer.basePrice + 1000);
    } else {
      // Restore previous bid
      const previousEntry = newHistory[newHistory.length - 1];
      setCurrentBid(previousEntry.bid);
      setCurrentLeader({
        id: previousEntry.teamId,
        name: previousEntry.teamName,
      });
      setGlobalBid(previousEntry.bid + 1000);
    }
  };

  const handleMarkUnsold = () => {
    if (!activePlayer) return;
    
    // Add to unsold list
    setUnsoldPlayers((prev) => [
      ...prev,
      { player: activePlayer, timestamp: Date.now() },
    ]);

    // Move player to Unsold category
    setPlayers((prev) =>
      prev.map((p) =>
        p.id === activePlayer.id ? { ...p, category: "Unsold" } : p,
      ),
    );

    setShowUnsoldSeal(true);
    setUnsoldInfo({
      playerName: activePlayer.name,
    });

    setTimeout(() => {
      setShowUnsoldSeal(false);
      resetAuction();
    }, 2500);

    setBanner({
      type: "info",
      message: `${activePlayer.name} marked as unsold.`,
    });
    clearBannerLater();
  };

  const handleSavePlayer = () => {
    const trimmedName = playerForm.name.trim();
    const baseValue = Number.isFinite(playerForm.basePrice)
      ? Math.max(0, playerForm.basePrice)
      : 0;
    setPlayers((prev) =>
      prev.map((player) =>
        player.id === editPlayerId
          ? {
              ...player,
              name: trimmedName || player.name,
              image: playerForm.image.trim() || undefined,
              statsImage: playerForm.statsImage.trim() || undefined,
              basePrice: baseValue,
            }
          : player,
      ),
    );

    if (activePlayer && activePlayer.id === editPlayerId) {
      const updatedBase = baseValue || activePlayer.basePrice;
      const newName = trimmedName || activePlayer.name;
      setActivePlayer((prev) =>
        prev
          ? {
              ...prev,
              name: newName,
              image: playerForm.image,
              statsImage: playerForm.statsImage,
              basePrice: updatedBase,
            }
          : prev,
      );
      setCurrentBid((prev) => {
        const nextBid = Math.max(prev ?? 0, updatedBase);
        return nextBid;
      });
      setBidInputs((prev) => {
        const next: Record<string, string> = { ...prev };
        const minBid = Math.max(currentBid ?? 0, updatedBase);
        teams.forEach((team) => {
          const val = Number(next[team.id]);
          if (!Number.isFinite(val) || val < minBid) {
            next[team.id] = String(minBid);
          }
        });
        return next;
      });
    }

    setBanner({ type: "success", message: "Player updated." });
    clearBannerLater();
    setSettingsOpen(false);
  };

  const handleAddPlayer = () => {
    const name = newPlayerForm.name.trim() || "New Player";
    const role = newPlayerForm.role.trim() || "Squad Player";
    const baseValue = Number.isFinite(newPlayerForm.basePrice)
      ? Math.max(0, newPlayerForm.basePrice)
      : 0;
    const category = newPlayerForm.category || "Legends";
    const id = makeId();

    const newPlayer: Player = {
      id,
      name,
      role,
      basePrice: baseValue,
      category,
      image: newPlayerForm.image.trim() || undefined,
      statsImage: newPlayerForm.statsImage.trim() || undefined,
    };

    setPlayers((prev) => [...prev, newPlayer]);
    setEditPlayerId(id);
    setPlayerForm({
      name,
      image: newPlayer.image ?? "",
      statsImage: newPlayer.statsImage ?? "",
      basePrice: baseValue,
    });
    setNewPlayerForm({
      name: "",
      role: "",
      category: "Legends",
      basePrice: categoryBase.Legends,
      image: "",
      statsImage: "",
    });
    setBanner({ type: "success", message: `${name} added to pool.` });
    clearBannerLater();
  };

  const handleCategoryBaseChange = (category: Category, value: number) => {
    setCategoryBase((prev) => ({ ...prev, [category]: Math.max(0, value) }));
  };

  const syncNewBaseToCategory = (category: Category) => {
    setNewPlayerForm((prev) => ({ ...prev, basePrice: categoryBase[category] }));
  };

  const syncEditBaseToCategory = () => {
    if (!activePlayer && !playerForm) return;
    const cat = players.find((p) => p.id === editPlayerId)?.category;
    if (!cat) return;
    setPlayerForm((prev) => ({ ...prev, basePrice: categoryBase[cat] }));
  };

  const handleRemovePlayer = () => {
    const player = players.find((p) => p.id === editPlayerId);
    if (!player) return;

    if (assignments.has(player.id)) {
      setBanner({
        type: "error",
        message: "Cannot remove: player already assigned to a team.",
      });
      clearBannerLater();
      return;
    }

    const remaining = players.filter((p) => p.id !== player.id);
    setPlayers(remaining);

    if (activePlayer && activePlayer.id === player.id) {
      resetAuction();
    }

    const nextId = remaining[0]?.id;
    if (nextId) {
      setEditPlayerId(nextId);
      const nextPlayer = remaining[0];
      setPlayerForm({
        name: nextPlayer.name,
        image: nextPlayer.image ?? "",
        statsImage: nextPlayer.statsImage ?? "",
        basePrice: nextPlayer.basePrice,
      });
    } else {
      setSettingsOpen(false);
    }

    setBanner({
      type: "success",
      message: `${player.name} removed from pool.`,
    });
    clearBannerLater();
  };

  const handleRemovePlayerFromTeam = (teamId: string, playerId: string) => {
    const team = teams.find((t) => t.id === teamId);
    if (!team) return;

    const player = team.roster.find((p) => p.id === playerId);
    if (!player) return;

    setTeams((prev) =>
      prev.map((t) =>
        t.id === teamId
          ? {
              ...t,
              roster: t.roster.filter((p) => p.id !== playerId),
              budget: t.budget + player.winningBid,
            }
          : t,
      ),
    );

    setBanner({
      type: "success",
      message: `${player.name} removed from ${team.name}. ${player.winningBid.toLocaleString()} pts refunded.`,
    });
    clearBannerLater();
  };

  return (
    <div className="app-shell">
      {stage !== "auction" && (
        <header className="app-header compact">
          <div className="logo-frame">
            <img src="src\assets\site-logo\WhatsApp Image 2026-0ds1-17 at 3.10.28 PM.jpeg" alt="LDPL" className="site-logo" />
          </div>
          <div className="stage-pill">
            {stage === "pool" ? "Player Pool" : stage === "results" ? "Results" : "Live Auction"}
          </div>
          <div className="actions">
            <button onClick={openAddPlayer}>Add player</button>
            <button className="ghost" onClick={() => setPresetsOpen(true)}>
              Presets
            </button>
            <button className="ghost" onClick={() => setStage("results")}>
              Results
            </button>
            <button className="ghost" onClick={() => openSettings()}>
              Settings
            </button>
          </div>
        </header>
      )}

      {banner && (
        <div className={`banner banner-${banner.type}`}>{banner.message}</div>
      )}

      {stage === "pool" && (
        <section className="pool-grid">
          {Object.entries(pooledByCategory)
            .sort(([catA], [catB]) => {
              // Move "Unsold" to the end
              if (catA === "Unsold") return 1;
              if (catB === "Unsold") return -1;
              return 0;
            })
            .map(([category, players]) => (
            <div className="panel" key={category}>
              <div className="panel-head">
                <h2>{category}</h2>
                <span className="meta">{players.length} players</span>
              </div>
              <div className="player-list">
                {players.map((player) => {
                  const assignedTo = assignments.get(player.id);
                  return (
                    <div className="player-card" key={player.id}>
                      <div className="player-id">
                        <img
                          src={
                            player.image ||
                            "https://placehold.co/80x80?text=Player"
                          }
                          alt={player.name}
                        />
                        <div>
                          <p className="player-name">{player.name}</p>
                          <p className="player-role">{player.role}</p>
                          <span className="cat-chip">{player.category}</span>
                        </div>
                      </div>
                      <div className="player-actions">
                        <p className="base">
                          Base {player.basePrice.toLocaleString()} pts
                        </p>
                        {assignedTo ? (
                          <span className="tag">Sold to {assignedTo}</span>
                        ) : (
                          <div className="player-buttons">
                            <button
                              className="secondary"
                              onClick={() => handleSendToAuction(player)}
                            >
                              Send to auction
                            </button>
                            <button
                              className="ghost small"
                              onClick={() => openEditPlayer(player.id)}
                            >
                              Edit
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </section>
      )}

      {stage === "auction" && (
        <AuctionView
          activePlayer={activePlayer}
          currentBid={currentBid}
          currentLeader={currentLeader}
          globalBid={globalBid}
          teams={teams}
          onSetGlobalBid={setGlobalBid}
          onReverseBid={handleReverseBid}
          onPlaceBid={(teamId, amount) => handlePlaceBid(teamId, amount)}
          onFinalizeSale={handleFinalizeSale}
          onMarkUnsold={handleMarkUnsold}
          onBack={resetAuction}
        />
      )}

      {stage === "results" && (
        <ResultsView
          teams={teams}
          unsoldPlayers={unsoldPlayers}
          onClearUnsold={() => setUnsoldPlayers([])}
          onRemovePlayerFromTeam={handleRemovePlayerFromTeam}
          onBack={() => setStage("pool")}
        />
      )}

      {showSoldSeal && soldInfo && (
        <div className="sold-seal-overlay">
          <div className="sold-seal">
            <div
              className="sold-seal-inner"
              style={{
                backgroundImage: soldInfo.teamLogo
                  ? `url('${soldInfo.teamLogo}')`
                  : "linear-gradient(135deg, #5ed1ff 0%, #89ffce 100%)",
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
              }}
            />
            <div className="sold-text">SOLD</div>
            <div className="sold-details">
              <p>{soldInfo.playerName}</p>
              <p>{soldInfo.teamName}</p>
              <p className="sold-price">{soldInfo.bid.toLocaleString()} pts</p>
            </div>
            <div className="sold-emojis">🎉 🥳 🎊</div>
          </div>
        </div>
      )}

      {showUnsoldSeal && unsoldInfo && (
        <div className="unsold-seal-overlay">
          <div className="unsold-seal">
            <div className="unsold-seal-inner">
              <div className="unsold-emoji">😢</div>
              <div className="unsold-text">UNSOLD</div>
              <div className="unsold-player-name">{unsoldInfo.playerName}</div>
            </div>
          </div>
        </div>
      )}

      {playerModalOpen && settingsMode === "edit" && (
        <EditPlayerModal
          form={playerForm}
          onChange={updatePlayerForm}
          onClose={() => setPlayerModalOpen(false)}
          onFileUpload={handleEditFileUpload}
          onSyncBase={syncEditBaseToCategory}
          onSave={handleSavePlayer}
          onRemove={handleRemovePlayer}
        />
      )}

      {playerModalOpen && settingsMode === "add" && (
        <AddPlayerModal
          form={newPlayerForm}
          onChange={updateNewPlayerForm}
          onFileUpload={handleAddFileUpload}
          onSyncCategoryBase={syncNewBaseToCategory}
          onAdd={handleAddPlayer}
          onClose={() => setPlayerModalOpen(false)}
        />
      )}

      {presetsOpen && (
        <PresetsModal
          categoryBase={categoryBase}
          onCategoryBaseChange={handleCategoryBaseChange}
          teams={teams}
          onTeamsChange={(updatedTeams) => {
            setTeams(updatedTeams as Team[]);
            localStorage.setItem("auctionTeams", JSON.stringify(updatedTeams));
          }}
          onClose={() => setPresetsOpen(false)}
        />
      )}

      {settingsOpen && (
        <SettingsModal onClose={() => setSettingsOpen(false)} />
      )}
    </div>
  );
}

export default App;
