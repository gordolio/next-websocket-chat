"use client";

import { useState } from "react";
import { BigHead } from "@bigheads/core";
import type { AvatarConfig, UserProfile } from "@/lib/types";
import {
  HAIR_OPTIONS,
  HAIR_COLOR_OPTIONS,
  EYE_OPTIONS,
  EYEBROW_OPTIONS,
  MOUTH_OPTIONS,
  FACIAL_HAIR_OPTIONS,
  CLOTHING_OPTIONS,
  CLOTHING_COLOR_OPTIONS,
  ACCESSORY_OPTIONS,
  SKIN_TONE_OPTIONS,
  BODY_OPTIONS,
  HAT_OPTIONS,
  HAT_COLOR_OPTIONS,
} from "@/lib/avatarDefaults";

interface AvatarEditorModalProps {
  profile: UserProfile;
  onSave: (profile: UserProfile) => void;
  onCancel: () => void;
}

interface OptionSelectorProps {
  label: string;
  options: readonly string[];
  value: string;
  onChange: (value: string) => void;
}

function OptionSelector({ label, options, value, onChange }: OptionSelectorProps) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-muted uppercase tracking-wide">{label}</label>
      <div className="flex flex-wrap gap-1">
        {options.map((opt) => (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            className={`px-2 py-1 rounded text-xs font-medium border transition cursor-pointer ${
              value === opt
                ? "bg-accent text-white border-accent"
                : "bg-surface text-foreground border-border hover:bg-surface-hover"
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

function HueSlider({ color, onChange }: { color: string; onChange: (color: string) => void }) {
  // Extract hue from hsl string
  const hueMatch = color.match(/hsl\((\d+)/);
  const hue = hueMatch ? parseInt(hueMatch[1]) : 200;

  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-muted uppercase tracking-wide">Name Color</label>
      <div className="flex items-center gap-3">
        <input
          type="range"
          min="0"
          max="359"
          value={hue}
          onChange={(e) => onChange(`hsl(${e.target.value}, 70%, 72%)`)}
          className="flex-1 accent-accent"
          style={{
            background: `linear-gradient(to right, ${Array.from({ length: 12 }, (_, i) => `hsl(${i * 30}, 70%, 72%)`).join(", ")})`,
          }}
        />
        <div
          className="w-8 h-8 rounded-full border border-border shrink-0"
          style={{ backgroundColor: color }}
        />
      </div>
    </div>
  );
}

export function AvatarEditorModal({ profile, onSave, onCancel }: AvatarEditorModalProps) {
  const [avatarConfig, setAvatarConfig] = useState<AvatarConfig>({ ...profile.avatarConfig });
  const [color, setColor] = useState(profile.color);

  function updateConfig<K extends keyof AvatarConfig>(key: K, value: AvatarConfig[K]) {
    setAvatarConfig((prev) => ({ ...prev, [key]: value }));
  }

  function handleSave() {
    onSave({ color, avatarConfig });
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-surface rounded-xl border border-border shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header with preview */}
        <div className="flex items-center gap-4 p-4 border-b border-border sticky top-0 bg-surface rounded-t-xl z-10">
          <div className="w-20 h-20 shrink-0">
            <BigHead {...(avatarConfig as any)} />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-foreground">Edit Avatar</h2>
            <p className="text-sm text-muted">Customize your look</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={onCancel}
              className="px-3 py-1.5 rounded-lg text-sm font-medium border border-border text-foreground hover:bg-surface-hover transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-3 py-1.5 rounded-lg text-sm font-medium bg-accent hover:bg-accent-hover text-white transition cursor-pointer"
            >
              Save
            </button>
          </div>
        </div>

        {/* Options */}
        <div className="p-4 space-y-4">
          <HueSlider color={color} onChange={setColor} />

          <OptionSelector
            label="Hair"
            options={HAIR_OPTIONS}
            value={avatarConfig.hair}
            onChange={(v) => updateConfig("hair", v)}
          />
          <OptionSelector
            label="Hair Color"
            options={HAIR_COLOR_OPTIONS}
            value={avatarConfig.hairColor}
            onChange={(v) => updateConfig("hairColor", v)}
          />
          <OptionSelector
            label="Eyes"
            options={EYE_OPTIONS}
            value={avatarConfig.eyes}
            onChange={(v) => updateConfig("eyes", v)}
          />
          <OptionSelector
            label="Eyebrows"
            options={EYEBROW_OPTIONS}
            value={avatarConfig.eyebrows}
            onChange={(v) => updateConfig("eyebrows", v)}
          />
          <OptionSelector
            label="Mouth"
            options={MOUTH_OPTIONS}
            value={avatarConfig.mouth}
            onChange={(v) => updateConfig("mouth", v)}
          />
          <OptionSelector
            label="Facial Hair"
            options={FACIAL_HAIR_OPTIONS}
            value={avatarConfig.facialHair}
            onChange={(v) => updateConfig("facialHair", v)}
          />
          <OptionSelector
            label="Skin Tone"
            options={SKIN_TONE_OPTIONS}
            value={avatarConfig.skinTone}
            onChange={(v) => updateConfig("skinTone", v)}
          />
          <OptionSelector
            label="Body"
            options={BODY_OPTIONS}
            value={avatarConfig.body}
            onChange={(v) => updateConfig("body", v)}
          />
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-muted uppercase tracking-wide">Lashes</label>
            <button
              onClick={() => updateConfig("lashes", !avatarConfig.lashes)}
              className={`px-2 py-1 rounded text-xs font-medium border transition cursor-pointer ${
                avatarConfig.lashes
                  ? "bg-accent text-white border-accent"
                  : "bg-surface text-foreground border-border hover:bg-surface-hover"
              }`}
            >
              {avatarConfig.lashes ? "On" : "Off"}
            </button>
          </div>
          <OptionSelector
            label="Clothing"
            options={CLOTHING_OPTIONS}
            value={avatarConfig.clothing}
            onChange={(v) => updateConfig("clothing", v)}
          />
          <OptionSelector
            label="Clothing Color"
            options={CLOTHING_COLOR_OPTIONS}
            value={avatarConfig.clothingColor}
            onChange={(v) => updateConfig("clothingColor", v)}
          />
          <OptionSelector
            label="Accessory"
            options={ACCESSORY_OPTIONS}
            value={avatarConfig.accessory}
            onChange={(v) => updateConfig("accessory", v)}
          />
          <OptionSelector
            label="Hat"
            options={HAT_OPTIONS}
            value={avatarConfig.hat}
            onChange={(v) => updateConfig("hat", v)}
          />
          <OptionSelector
            label="Hat Color"
            options={HAT_COLOR_OPTIONS}
            value={avatarConfig.hatColor}
            onChange={(v) => updateConfig("hatColor", v)}
          />
        </div>
      </div>
    </div>
  );
}
