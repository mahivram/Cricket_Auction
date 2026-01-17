import { useState } from "react";
import type { Category } from "../types";
import "./PresetsModal.css";

interface PresetsModalProps {
  categoryBase: Record<Category, number>;
  onCategoryBaseChange: (category: Category, value: number) => void;
  onClose: () => void;
  teams?: Array<{ id: string; name: string; logo?: string }>;
  onTeamsChange?: (teams: Array<{ id: string; name: string; logo?: string }>) => void;
}

export function PresetsModal({
  categoryBase,
  onCategoryBaseChange,
  onClose,
  teams = [],
  onTeamsChange,
}: PresetsModalProps) {
  const [teamName, setTeamName] = useState("");
  const [teamList, setTeamList] = useState(teams);

  const handleAddTeam = () => {
    if (teamName.trim()) {
      const newTeam = {
        id: Date.now().toString(),
        name: teamName,
        budget: 150000,
        roster: [],
        logo: undefined,
      };
      const updated = [...teamList, newTeam];
      setTeamList(updated);
      onTeamsChange?.(updated);
      setTeamName("");
    }
  };

  const handleLogoUpload = (teamId: string, file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      const updated = teamList.map((t) =>
        t.id === teamId ? { ...t, logo: base64 } : t
      );
      setTeamList(updated);
      onTeamsChange?.(updated);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveTeam = (teamId: string) => {
    const updated = teamList.filter((t) => t.id !== teamId);
    setTeamList(updated);
    onTeamsChange?.(updated);
  };

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal">
        <div className="modal-head">
          <div>
            <p className="eyebrow">Auction Settings</p>
            <h3>Category base price presets & Teams</h3>
          </div>
          <button className="ghost" onClick={onClose}>
            Close
          </button>
        </div>

        <div className="preset-section">
          <p className="field-help">Set the starting bid price for each player category.</p>
          <div className="preset-grid">
            {(Object.keys(categoryBase) as Category[]).map((cat) => (
              <label className="field" key={cat}>
                <span>{cat}</span>
                <input
                  type="number"
                  min={0}
                  value={categoryBase[cat]}
                  onChange={(e) =>
                    onCategoryBaseChange(cat, Number(e.target.value))
                  }
                />
              </label>
            ))}
          </div>
        </div>

        <div className="preset-section">
          <p className="field-help">Add teams and upload their logos.</p>
          <div className="team-input-group">
            <input
              type="text"
              placeholder="Team name"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleAddTeam()}
              className="team-input"
            />
            <button className="primary small" onClick={handleAddTeam}>
              Add Team
            </button>
          </div>

          <div className="team-management-list">
            {teamList.map((team) => (
              <div key={team.id} className="team-management-item">
                <div className="team-logo-preview">
                  {team.logo ? (
                    <img src={team.logo} alt={team.name} />
                  ) : (
                    <span className="no-logo">No logo</span>
                  )}
                </div>
                <div className="team-info">
                  <span className="team-management-name">{team.name}</span>
                  <label className="logo-upload-label">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          handleLogoUpload(team.id, e.target.files[0]);
                        }
                      }}
                      style={{ display: "none" }}
                    />
                    <span className="upload-text">
                      {team.logo ? "Change logo" : "Upload logo"}
                    </span>
                  </label>
                </div>
                <button
                  className="secondary danger small"
                  onClick={() => handleRemoveTeam(team.id)}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="modal-actions">
          <div className="spacer" />
          <button className="secondary" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
