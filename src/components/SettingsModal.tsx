interface SettingsModalProps {
  onClose: () => void;
}

export const SettingsModal = ({ onClose }: SettingsModalProps) => {
  const handleClearLocalStorage = () => {
    if (window.confirm("Are you sure you want to clear all data? This cannot be undone.")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Settings</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <div className="settings-section">
            <h3>Data Management</h3>
            <button 
              className="danger-btn" 
              onClick={handleClearLocalStorage}
            >
              Clear All Data
            </button>
            <p className="settings-help">This will reset all players, teams, and auction data.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
