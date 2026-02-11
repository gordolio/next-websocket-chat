"use client";

import { useMemo, useState, useCallback } from "react";
import { BigHead, bigHeadOptions } from "extended-bigheads";
import type { AvatarConfig, UserProfile } from "@/lib/types";
import { randomizeAvatar } from "@/lib/avatarDefaults";

interface AvatarEditorModalProps {
  profile: UserProfile;
  onSave: (profile: UserProfile) => void;
  onCancel: () => void;
}

type BigHeadProps = React.ComponentProps<typeof BigHead>;

/** Cast a string[] from bigHeadOptions to the narrow union array AvatarConfig[K][]. */
const opts = <K extends keyof AvatarConfig>(arr: string[]) =>
  arr as unknown as AvatarConfig[K][];

/** Per-key overrides to strip items that would obscure the thing being previewed. */
const PREVIEW_OVERRIDES: Partial<Record<keyof AvatarConfig, Partial<AvatarConfig>>> = {
  eyes:     { hat: "none", accessory: "none", faceMask: false, facialHair: "none" },
  eyebrows: { hat: "none", accessory: "none", faceMask: false, facialHair: "none" },
  mouth:    { hat: "none", accessory: "none", faceMask: false, facialHair: "none" },
  lipColor: { hat: "none", accessory: "none", faceMask: false, facialHair: "none" },
  hair:     { hat: "none", accessory: "none", faceMask: false },
};

function makePreview<K extends keyof AvatarConfig>(
  base: AvatarConfig,
  key: K,
  value: AvatarConfig[K],
): AvatarConfig {
  return {
    ...base,
    ...PREVIEW_OVERRIDES[key],
    [key]: value,
  };
}

/**
 * Mini avatar preview picker. Generic over the config key so
 * the onChange callback passes properly-typed values.
 */
function AvatarOptionPicker<K extends keyof AvatarConfig>({
  label,
  options,
  value,
  configKey,
  baseConfig,
  onChange,
  disabled,
  disabledHint,
}: {
  label: string;
  options: readonly AvatarConfig[K][];
  value: AvatarConfig[K];
  configKey: K;
  baseConfig: AvatarConfig;
  onChange: (value: AvatarConfig[K]) => void;
  disabled?: boolean;
  disabledHint?: string;
}) {
  return (
    <div className={`flex flex-col gap-2 ${disabled ? "opacity-40" : ""}`}>
      <label className="text-muted text-xs font-medium tracking-wider uppercase">
        {label}
        {disabled && disabledHint && (
          <span className="text-muted/70 ml-2 tracking-normal normal-case italic">
            {disabledHint}
          </span>
        )}
      </label>
      <div
        className={`flex flex-wrap gap-2 ${disabled ? "pointer-events-none" : ""}`}
      >
        {options.map((opt) => {
          const preview = makePreview(baseConfig, configKey, opt);
          const selected = value === opt;
          return (
            <button
              key={String(opt)}
              onClick={() => onChange(opt)}
              disabled={disabled}
              className={`flex cursor-pointer flex-col items-center gap-1 rounded-xl border p-1.5 transition-all duration-150 ${
                selected
                  ? "bg-accent/10 border-accent shadow-[0_0_10px_-3px_rgba(226,160,82,0.3)]"
                  : "bg-background border-border hover:bg-surface-hover hover:border-muted/50"
              }`}
            >
              <div className="h-12 w-12">
                <BigHead {...preview} showBackground={false} />
              </div>
              <span
                className={`text-[10px] leading-tight font-medium ${
                  selected ? "text-accent" : "text-muted"
                }`}
              >
                {String(opt)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ToggleSwitch<K extends keyof AvatarConfig>({
  label,
  checked,
  baseConfig,
  configKey,
  onChange,
}: {
  label: string;
  checked: boolean;
  baseConfig: AvatarConfig;
  configKey: K;
  onChange: (value: boolean) => void;
}) {
  const previewOn = makePreview(baseConfig, configKey, true as AvatarConfig[K]);
  const previewOff = makePreview(
    baseConfig,
    configKey,
    false as AvatarConfig[K],
  );

  return (
    <div className="flex flex-col gap-2">
      <label className="text-muted text-xs font-medium tracking-wider uppercase">
        {label}
      </label>
      <div className="flex gap-2">
        {([false, true] as const).map((val) => {
          const selected = checked === val;
          const preview = val ? previewOn : previewOff;
          return (
            <button
              key={String(val)}
              onClick={() => onChange(val)}
              className={`flex cursor-pointer flex-col items-center gap-1 rounded-xl border p-1.5 transition-all duration-150 ${
                selected
                  ? "bg-accent/10 border-accent shadow-[0_0_10px_-3px_rgba(226,160,82,0.3)]"
                  : "bg-background border-border hover:bg-surface-hover hover:border-muted/50"
              }`}
            >
              <div className="h-12 w-12">
                <BigHead
                  {...(preview as BigHeadProps)}
                  showBackground={false}
                />
              </div>
              <span
                className={`text-[10px] leading-tight font-medium ${
                  selected ? "text-accent" : "text-muted"
                }`}
              >
                {val ? "on" : "off"}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function HueSlider({
  color,
  onChange,
}: {
  color: string;
  onChange: (color: string) => void;
}) {
  const hue = useMemo(() => {
    const match = color.match(/hsl\((\d+)/);
    return match?.[1] ? parseInt(match[1]) : 200;
  }, [color]);

  const gradient = useMemo(
    () =>
      `linear-gradient(to right, ${Array.from(
        { length: 24 },
        (_, i) => `hsl(${i * 15}, 70%, 72%)`,
      ).join(", ")})`,
    [],
  );

  return (
    <div className="flex flex-col gap-2">
      <label className="text-muted text-xs font-medium tracking-wider uppercase">
        Name Color
      </label>
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
          className="border-border h-9 w-9 shrink-0 rounded-xl border-2 shadow-inner"
          style={{ backgroundColor: color }}
        />
      </div>
    </div>
  );
}

function SectionDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 pt-2">
      <div className="bg-border h-px flex-1" />
      <span className="text-muted text-[10px] font-semibold tracking-widest uppercase">
        {label}
      </span>
      <div className="bg-border h-px flex-1" />
    </div>
  );
}

export function AvatarEditorModal({
  profile,
  onSave,
  onCancel,
}: AvatarEditorModalProps) {
  const [avatarConfig, setAvatarConfig] = useState<AvatarConfig>(() => ({
    ...profile.avatarConfig,
  }));
  const [color, setColor] = useState(() => profile.color);

  const updateConfig = useCallback(
    <K extends keyof AvatarConfig>(key: K, value: AvatarConfig[K]) => {
      setAvatarConfig((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const handleShuffle = useCallback(() => {
    setAvatarConfig(randomizeAvatar());
    setColor(`hsl(${Math.floor(Math.random() * 360)}, 70%, 72%)`);
  }, []);

  const handleSave = useCallback(() => {
    onSave({ color, avatarConfig });
  }, [onSave, color, avatarConfig]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div
        className="animate-fade-in-scale bg-surface border-border flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border shadow-[0_32px_80px_-16px_rgba(0,0,0,0.6)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with live preview */}
        <div className="border-border bg-surface flex shrink-0 items-center gap-4 border-b p-5">
          <div className="relative">
            <div className="bg-accent/10 absolute inset-0 rounded-full blur-xl" />
            <div className="relative h-24 w-24 shrink-0">
              <BigHead
                {...(avatarConfig as BigHeadProps)}
                showBackground={false}
              />
            </div>
          </div>
          <div className="flex-1">
            <h2 className="text-foreground text-lg font-semibold tracking-tight">
              Customize Avatar
            </h2>
            <p className="text-muted mt-0.5 text-sm">Make it uniquely yours</p>
            <button
              onClick={handleShuffle}
              className="bg-accent/10 text-accent border-accent/20 hover:bg-accent/20 mt-2 inline-flex cursor-pointer items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
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
              className="border-border text-foreground-dim hover:text-foreground hover:bg-surface-hover cursor-pointer rounded-xl border px-3.5 py-1.5 text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="bg-accent hover:bg-accent-hover text-background cursor-pointer rounded-xl px-3.5 py-1.5 text-sm font-medium shadow-[0_2px_12px_-4px_rgba(226,160,82,0.3)] transition-all duration-200"
            >
              Save
            </button>
          </div>
        </div>

        {/* Options — grouped by body region */}
        <div className="space-y-4 overflow-y-auto p-5">
          <HueSlider color={color} onChange={setColor} />

          <SectionDivider label="Face" />
          <AvatarOptionPicker
            label="Eyes"
            options={opts<"eyes">(bigHeadOptions.eyes)}
            value={avatarConfig.eyes}
            configKey="eyes"
            baseConfig={avatarConfig}
            onChange={(v) => updateConfig("eyes", v)}
          />
          <AvatarOptionPicker
            label="Eyebrows"
            options={opts<"eyebrows">(bigHeadOptions.eyebrows)}
            value={avatarConfig.eyebrows}
            configKey="eyebrows"
            baseConfig={avatarConfig}
            onChange={(v) => updateConfig("eyebrows", v)}
          />
          <AvatarOptionPicker
            label="Mouth"
            options={opts<"mouth">(bigHeadOptions.mouth)}
            value={avatarConfig.mouth}
            configKey="mouth"
            baseConfig={avatarConfig}
            onChange={(v) => updateConfig("mouth", v)}
          />
          <AvatarOptionPicker
            label="Lip Color"
            options={opts<"lipColor">(bigHeadOptions.lipColor)}
            value={avatarConfig.lipColor}
            configKey="lipColor"
            baseConfig={avatarConfig}
            onChange={(v) => updateConfig("lipColor", v)}
            disabled={avatarConfig.mouth !== "lips"}
            disabledHint="— requires lips mouth"
          />
          <AvatarOptionPicker
            label="Skin Tone"
            options={opts<"skinTone">(bigHeadOptions.skinTone)}
            value={avatarConfig.skinTone}
            configKey="skinTone"
            baseConfig={avatarConfig}
            onChange={(v) => updateConfig("skinTone", v)}
          />
          <ToggleSwitch
            label="Lashes"
            checked={avatarConfig.lashes}
            configKey="lashes"
            baseConfig={avatarConfig}
            onChange={(v) => updateConfig("lashes", v)}
          />

          <SectionDivider label="Hair" />
          <AvatarOptionPicker
            label="Hair Style"
            options={opts<"hair">(bigHeadOptions.hair)}
            value={avatarConfig.hair}
            configKey="hair"
            baseConfig={avatarConfig}
            onChange={(v) => updateConfig("hair", v)}
          />
          <AvatarOptionPicker
            label="Hair Color"
            options={opts<"hairColor">(bigHeadOptions.hairColor)}
            value={avatarConfig.hairColor}
            configKey="hairColor"
            baseConfig={avatarConfig}
            onChange={(v) => updateConfig("hairColor", v)}
            disabled={avatarConfig.hair === "none"}
            disabledHint="— choose a hair style first"
          />
          <AvatarOptionPicker
            label="Facial Hair"
            options={opts<"facialHair">(bigHeadOptions.facialHair)}
            value={avatarConfig.facialHair}
            configKey="facialHair"
            baseConfig={avatarConfig}
            onChange={(v) => updateConfig("facialHair", v)}
          />

          <SectionDivider label="Accessories" />
          <AvatarOptionPicker
            label="Hat"
            options={opts<"hat">(bigHeadOptions.hat)}
            value={avatarConfig.hat}
            configKey="hat"
            baseConfig={avatarConfig}
            onChange={(v) => updateConfig("hat", v)}
          />
          <AvatarOptionPicker
            label="Hat Color"
            options={opts<"hatColor">(bigHeadOptions.hatColor)}
            value={avatarConfig.hatColor}
            configKey="hatColor"
            baseConfig={avatarConfig}
            onChange={(v) => updateConfig("hatColor", v)}
            disabled={avatarConfig.hat === "none"}
            disabledHint="— choose a hat first"
          />
          <AvatarOptionPicker
            label="Accessory"
            options={opts<"accessory">(bigHeadOptions.accessory)}
            value={avatarConfig.accessory}
            configKey="accessory"
            baseConfig={avatarConfig}
            onChange={(v) => updateConfig("accessory", v)}
          />
          <ToggleSwitch
            label="Face Mask"
            checked={avatarConfig.faceMask}
            configKey="faceMask"
            baseConfig={avatarConfig}
            onChange={(v) => updateConfig("faceMask", v)}
          />

          <SectionDivider label="Body" />
          <AvatarOptionPicker
            label="Body"
            options={opts<"body">(bigHeadOptions.body)}
            value={avatarConfig.body}
            configKey="body"
            baseConfig={avatarConfig}
            onChange={(v) => updateConfig("body", v)}
          />
          <AvatarOptionPicker
            label="Clothing"
            options={opts<"clothing">(bigHeadOptions.clothing)}
            value={avatarConfig.clothing}
            configKey="clothing"
            baseConfig={avatarConfig}
            onChange={(v) => updateConfig("clothing", v)}
          />
          <AvatarOptionPicker
            label="Clothing Color"
            options={opts<"clothingColor">(bigHeadOptions.clothingColor)}
            value={avatarConfig.clothingColor}
            configKey="clothingColor"
            baseConfig={avatarConfig}
            onChange={(v) => updateConfig("clothingColor", v)}
            disabled={avatarConfig.clothing === "naked"}
            disabledHint="— choose clothing first"
          />
          <AvatarOptionPicker
            label="Clothing Graphic"
            options={opts<"graphic">(bigHeadOptions.graphic)}
            value={avatarConfig.graphic}
            configKey="graphic"
            baseConfig={avatarConfig}
            onChange={(v) => updateConfig("graphic", v)}
            disabled={avatarConfig.clothing === "naked"}
            disabledHint="— choose clothing first"
          />
        </div>
      </div>
    </div>
  );
}
