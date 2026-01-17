import type { ChangeEvent } from "react";
import type { Category, Player } from "../types";
import "./AddPlayerModal.css";

interface NewPlayerForm {
  name: string;
  role: string;
  category: Player["category"];
  basePrice: number;
  image: string;
  statsImage: string;
}

interface AddPlayerModalProps {
  form: NewPlayerForm;
  onChange: (
    field: keyof NewPlayerForm,
    value: string | number,
  ) => void;
  onFileUpload: (file: File, key: "image" | "statsImage") => void;
  onSyncCategoryBase: (category: Category) => void;
  onAdd: () => void;
  onClose: () => void;
}

export function AddPlayerModal({
  form,
  onChange,
  onFileUpload,
  onSyncCategoryBase,
  onAdd,
  onClose,
}: AddPlayerModalProps) {
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

  const handleCategoryChange = (value: string) => {
    const category = value as Category;
    onChange("category", category);
    onSyncCategoryBase(category);
  };

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal">
        <div className="modal-head">
          <div>
            <p className="eyebrow">Add player</p>
            <h3>Create a new player</h3>
          </div>
          <button className="ghost" onClick={onClose}>
            Close
          </button>
        </div>
        <div className="add-grid">
          <label className="field">
            <span>Name</span>
            <input
              value={form.name}
              onChange={(e) => onChange("name", e.target.value)}
            />
          </label>
          <label className="field">
            <span>Role</span>
            <input
              value={form.role}
              onChange={(e) => onChange("role", e.target.value)}
            />
          </label>
          <label className="field">
            <span>Category</span>
            <select
              value={form.category}
              onChange={(e) => handleCategoryChange(e.target.value)}
            >
              <option value="Legends">Legends</option>
              <option value="Elite">Elite</option>
              <option value="Rising Stars">Rising Stars</option>
              <option value="Uncapped">Uncapped</option>
              <option value="Unsold">Unsold</option>
            </select>
          </label>
          <label className="field">
            <span>Base bid (points)</span>
            <input
              type="number"
              min={0}
              value={form.basePrice}
              onChange={(e) => onChange("basePrice", Number(e.target.value))}
            />
            <button
              className="secondary tiny"
              onClick={() => onSyncCategoryBase(form.category as Category)}
            >
              Use category base
            </button>
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
        </div>
        <div className="preview">
          <img
            src={form.image || "https://placehold.co/120x120?text=Preview"}
            alt="Player preview"
          />
          <div>
            <p className="meta">Preview</p>
            <p className="player-name">{form.name || "Name"}</p>
            <p className="meta">
              Base {form.basePrice.toLocaleString()} pts • {form.category}
            </p>
          </div>
        </div>
        <div className="modal-actions">
          <div className="spacer" />
          <button className="secondary" onClick={onClose}>
            Cancel
          </button>
          <button onClick={onAdd}>Add player</button>
        </div>
      </div>
    </div>
  );
}
