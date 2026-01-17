import type { ChangeEvent } from "react";
import "./EditPlayerModal.css";

interface EditPlayerForm {
  name: string;
  image: string;
  statsImage: string;
  basePrice: number;
}

interface EditPlayerModalProps {
  form: EditPlayerForm;
  onChange: (
    field: keyof EditPlayerForm,
    value: string | number,
  ) => void;
  onFileUpload: (file: File, key: "image" | "statsImage") => void;
  onSyncBase: () => void;
  onClose: () => void;
  onSave: () => void;
  onRemove: () => void;
}

export function EditPlayerModal({
  form,
  onChange,
  onFileUpload,
  onSyncBase,
  onClose,
  onSave,
  onRemove,
}: EditPlayerModalProps) {
  const handleFile = (
    event: ChangeEvent<HTMLInputElement>,
    key: "image" | "statsImage",
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileUpload(file, key);
      // Reset the input value so same file can be selected again
      event.target.value = "";
    }
  };

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal">
        <div className="modal-head">
          <div>
            <p className="eyebrow">Settings</p>
            <h3>Edit player display</h3>
          </div>
          <button className="ghost" onClick={onClose}>
            Close
          </button>
        </div>
        <label className="field">
          <span>Display name</span>
          <input
            value={form.name}
            onChange={(e) => onChange("name", e.target.value)}
          />
        </label>
        <label className="field">
          <span>Image URL</span>
          <input
            value={form.image}
            onChange={(e) => onChange("image", e.target.value)}
          />
          <input
            className="file-input"
            type="file"
            accept="image/*"
            onChange={(e) => handleFile(e, "image")}
          />
        </label>
        <label className="field">
          <span>Stats screenshot URL</span>
          <input
            value={form.statsImage}
            onChange={(e) => onChange("statsImage", e.target.value)}
          />
          <input
            className="file-input"
            type="file"
            accept="image/*"
            onChange={(e) => handleFile(e, "statsImage")}
          />
        </label>
        <label className="field">
          <span>Base bid (points)</span>
          <input
            type="number"
            min={0}
            value={form.basePrice}
            onChange={(e) => onChange("basePrice", Number(e.target.value))}
          />
          <button className="secondary tiny" onClick={onSyncBase}>
            Use category base
          </button>
        </label>
        <div className="preview">
          <img
            src={form.image || "https://placehold.co/120x120?text=Preview"}
            alt="Player preview"
          />
          <div>
            <p className="meta">Preview</p>
            <p className="player-name">{form.name || "Name"}</p>
          </div>
        </div>
        <div className="modal-actions">
          <button className="danger" onClick={onRemove}>
            Remove player
          </button>
          <div className="spacer" />
          <button className="secondary" onClick={onClose}>
            Cancel
          </button>
          <button onClick={onSave}>Save</button>
        </div>
      </div>
    </div>
  );
}
