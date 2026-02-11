"use client";

import { useMemo, useState, useCallback } from "react";
import { BigHead } from "extended-bigheads";
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
  GRAPHIC_OPTIONS,
  SKIN_TONE_OPTIONS,
  BODY_OPTIONS,
  HAT_OPTIONS,
  HAT_COLOR_OPTIONS,
  LIP_COLOR_OPTIONS,
  randomizeAvatar,
} from "@/lib/avatarDefaults";

interface AvatarEditorModalProps {
  profile: UserProfile;
  onSave: (profile: UserProfile) => void;
  onCancel: () => void;
}

/**
 * Renders a row of mini BigHead previews, each with one prop changed.
 * This lets users visually compare options instead of reading text labels.
 */
function AvatarOptionPicker({
  label,
  options,
  value,
  configKey,
  baseConfig,
  onChange,
}: {
  label: string;
  options: readonly string[];
  value: string;
  configKey: keyof AvatarConfig;
  baseConfig: AvatarConfig;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-medium text-muted uppercase tracking-wider">{label}</label>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const previewConfig = { ...baseConfig, [configKey]: opt };
          return (
            <button
              key={opt}
              onClick={() => onChange(opt)}
              className={`flex flex-col items-center gap-1 p-1.5 rounded-xl border transition-all duration-150 cursor-pointer ${
                value === opt
                  ? "bg-accent/10 border-accent shadow-[0_0_10px_-3px_rgba(226,160,82,0.3)]"
                  : "bg-background border-border hover:bg-surface-hover hover:border-muted/50"
              }`}
            >
              <div className="w-12 h-12">
                <BigHead {...(previewConfig as React.ComponentProps<typeof BigHead>)} showBackground={false} />
              </div>
              <span className={`text-[10px] font-medium leading-tight ${
                value === opt ? "text-accent" : "text-muted"
              }`}>
                {opt}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Simple text-based selector for color options and simple choices.
 */
function OptionSelector({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: readonly string[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-medium text-muted uppercase tracking-wider">{label}</label>
      <div className="flex flex-wrap gap-1.5">
        {options.map((opt) => (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all duration-150 cursor-pointer ${
              value === opt
                ? "bg-accent text-background border-accent shadow-[0_0_8px_-2px_rgba(226,160,82,0.3)]"
                : "bg-background text-foreground-dim border-border hover:bg-surface-hover hover:text-foreground hover:border-muted/50"
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

function ToggleSwitch({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <label className="text-xs font-medium text-muted uppercase tracking-wider">{label}</label>
      <button
        onClick={() => onChange(!checked)}
        className={`relative w-10 h-5 rounded-full transition-colors duration-200 cursor-pointer ${
          checked ? "bg-accent" : "bg-border"
        }`}
      >
        <span
          className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all duration-200"
          style={{ left: checked ? "22px" : "2px" }}
        />
      </button>
    </div>
  );
}

function HueSlider({ color, onChange }: { color: string; onChange: (color: string) => void }) {
  const hue = useMemo(() => {
    const match = color.match(/hsl\((\d+)/);
    return match ? parseInt(match[1]) : 200;
  }, [color]);

  const gradient = useMemo(
    () =>
      `linear-gradient(to right, ${Array.from({ length: 24 }, (_, i) => `hsl(${i * 15}, 70%, 72%)`).join(", ")})`,
    [],
  );

  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-medium text-muted uppercase tracking-wider">Name Color</label>
      <div className="flex items-center gap-4">
        <input
          type="range"
          min="0"
          max="359"
          value={hue}
          onChange={(e) => onChange(`hsl(${e.target.value}, 70%, 72%)`)}
          className="flex-1"
          style={{ background: gradient }}
        />
        <div
          className="w-9 h-9 rounded-xl border-2 border-border shrink-0 shadow-inner"
          style={{ backgroundColor: color }}
        />
      </div>
    </div>
  );
}

export function AvatarEditorModal({ profile, onSave, onCancel }: AvatarEditorModalProps) {
  const [avatarConfig, setAvatarConfig] = useState<AvatarConfig>(() => ({ ...profile.avatarConfig }));
  const [color, setColor] = useState(() => profile.color);

  const updateConfig = useCallback(<K extends keyof AvatarConfig>(key: K, value: AvatarConfig[K]) => {
    setAvatarConfig((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleShuffle = useCallback(() => {
    setAvatarConfig(randomizeAvatar());
    setColor(`hsl(${Math.floor(Math.random() * 360)}, 70%, 72%)`);
  }, []);

  const handleSave = useCallback(() => {
    onSave({ color, avatarConfig });
  }, [onSave, color, avatarConfig]);

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onCancel}>
      <div
        className="animate-fade-in-scale bg-surface rounded-2xl border border-border shadow-[0_32px_80px_-16px_rgba(0,0,0,0.6)] max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with preview */}
        <div className="flex items-center gap-4 p-5 border-b border-border shrink-0 bg-surface">
          {/* Avatar preview with glow */}
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-accent/10 blur-xl" />
            <div className="relative w-24 h-24 shrink-0">
              <BigHead {...(avatarConfig as React.ComponentProps<typeof BigHead>)} showBackground={false} />
            </div>
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-foreground tracking-tight">Customize Avatar</h2>
            <p className="text-sm text-muted mt-0.5">Make it uniquely yours</p>
            {/* Shuffle button */}
            <button
              onClick={handleShuffle}
              className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-accent/10 text-accent border border-accent/20 hover:bg-accent/20 transition-colors cursor-pointer"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="16 3 21 3 21 8" />
                <line x1="4" y1="20" x2="21" y2="3" />
                <polyline points="21 16 21 21 16 21" />
                <line x1="15" y1="15" x2="21" y2="21" />
                <line x1="4" y1="4" x2="9" y2="9" />
              </svg>
              Shuffle
            </button>
          </div>
          <div className="flex gap-2 self-start">
            <button
              onClick={onCancel}
              className="px-3.5 py-1.5 rounded-xl text-sm font-medium border border-border text-foreground-dim hover:text-foreground hover:bg-surface-hover transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-3.5 py-1.5 rounded-xl text-sm font-medium bg-accent hover:bg-accent-hover text-background transition-all duration-200 cursor-pointer shadow-[0_2px_12px_-4px_rgba(226,160,82,0.3)]"
            >
              Save
            </button>
          </div>
        </div>

        {/* Options */}
        <div className="p-5 space-y-5 overflow-y-auto">
          <HueSlider color={color} onChange={setColor} />

          {/* Visual pickers — show mini avatar previews */}
          <AvatarOptionPicker
            label="Hair"
            options={HAIR_OPTIONS}
            value={avatarConfig.hair}
            configKey="hair"
            baseConfig={avatarConfig}
            onChange={(v) => updateConfig("hair", v)}
          />
          <AvatarOptionPicker
            label="Eyes"
            options={EYE_OPTIONS}
            value={avatarConfig.eyes}
            configKey="eyes"
            baseConfig={avatarConfig}
            onChange={(v) => updateConfig("eyes", v)}
          />
          <AvatarOptionPicker
            label="Eyebrows"
            options={EYEBROW_OPTIONS}
            value={avatarConfig.eyebrows}
            configKey="eyebrows"
            baseConfig={avatarConfig}
            onChange={(v) => updateConfig("eyebrows", v)}
          />
          <AvatarOptionPicker
            label="Mouth"
            options={MOUTH_OPTIONS}
            value={avatarConfig.mouth}
            configKey="mouth"
            baseConfig={avatarConfig}
            onChange={(v) => updateConfig("mouth", v)}
          />
          <AvatarOptionPicker
            label="Facial Hair"
            options={FACIAL_HAIR_OPTIONS}
            value={avatarConfig.facialHair}
            configKey="facialHair"
            baseConfig={avatarConfig}
            onChange={(v) => updateConfig("facialHair", v)}
          />
          <AvatarOptionPicker
            label="Accessory"
            options={ACCESSORY_OPTIONS}
            value={avatarConfig.accessory}
            configKey="accessory"
            baseConfig={avatarConfig}
            onChange={(v) => updateConfig("accessory", v)}
          />
          <AvatarOptionPicker
            label="Hat"
            options={HAT_OPTIONS}
            value={avatarConfig.hat}
            configKey="hat"
            baseConfig={avatarConfig}
            onChange={(v) => updateConfig("hat", v)}
          />
          <AvatarOptionPicker
            label="Clothing"
            options={CLOTHING_OPTIONS}
            value={avatarConfig.clothing}
            configKey="clothing"
            baseConfig={avatarConfig}
            onChange={(v) => updateConfig("clothing", v)}
          />
          <AvatarOptionPicker
            label="Clothing Graphic"
            options={GRAPHIC_OPTIONS}
            value={avatarConfig.graphic}
            configKey="graphic"
            baseConfig={avatarConfig}
            onChange={(v) => updateConfig("graphic", v)}
          />

          {/* Text-based pickers for colors and simple toggles */}
          <OptionSelector
            label="Hair Color"
            options={HAIR_COLOR_OPTIONS}
            value={avatarConfig.hairColor}
            onChange={(v) => updateConfig("hairColor", v)}
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
          <ToggleSwitch
            label="Lashes"
            checked={avatarConfig.lashes}
            onChange={(v) => updateConfig("lashes", v)}
          />
          <ToggleSwitch
            label="Face Mask"
            checked={avatarConfig.faceMask}
            onChange={(v) => updateConfig("faceMask", v)}
          />
          <OptionSelector
            label="Lip Color"
            options={LIP_COLOR_OPTIONS}
            value={avatarConfig.lipColor}
            onChange={(v) => updateConfig("lipColor", v)}
          />
          <OptionSelector
            label="Clothing Color"
            options={CLOTHING_COLOR_OPTIONS}
            value={avatarConfig.clothingColor}
            onChange={(v) => updateConfig("clothingColor", v)}
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
