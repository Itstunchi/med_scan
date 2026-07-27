import React from "react";
import {
  Pill,
  Bell,
  Eye,
  Store,
  RefreshCw,
  Clock,
  Upload,
  MessageCircle,
  Send,
  Type,
  Contrast,
  Waves,
} from "lucide-react";

const ACCENT = "#0F766E"; // teal, used for icons and Save changes
const TOGGLE_ON = "#DC2626"; // red
const INK = "#12231F";
const INK_MUTED = "#7A8C87";

const BADGE_BG = "#E6F1EF";
const BADGE_FG = ACCENT;

// Text-size slider (1-4) maps to a scale multiplier applied to every scaled text element
const TEXT_SCALE = { 1: 0.85, 2: 1, 3: 1.15, 4: 1.3 };
const TextScaleContext = React.createContext(1);

// Base sizes in px before scaling. Section titles are the largest (text-sm equivalent);
// everything else is intentionally smaller.
const BASE = {
  sectionTitle: 14, // ~text-sm
  sectionDesc: 12,
  rowTitle: 12,
  rowDesc: 11,
  control: 12,
  label: 12,
};

function Toggle({ checked, onChange }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      aria-pressed={checked}
      className="relative w-11 h-6 rounded-full border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
      style={{
        background: checked ? TOGGLE_ON : "#FFFFFF",
        borderColor: checked ? TOGGLE_ON : "#D6DCE3",
      }}
    >
      <span
        className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full shadow transition-transform"
        style={{
          background: checked ? "#FFFFFF" : "#D6DCE3",
          transform: checked ? "translateX(20px)" : "translateX(0)",
        }}
      />
    </button>
  );
}

function TextInput(props) {
  const scale = React.useContext(TextScaleContext);
  return (
    <input
      {...props}
      className="w-full sm:max-w-[220px] rounded-lg border border-[#E1E4EA] bg-white px-3 py-2 text-[#12231F] placeholder-[#A7B4B0] focus:outline-none focus:ring-2 focus:border-transparent"
      style={{ "--tw-ring-color": ACCENT, fontSize: BASE.control * scale }}
    />
  );
}

function Select({ options, value, onChange }) {
  const scale = React.useContext(TextScaleContext);
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full sm:max-w-[220px] rounded-lg border border-[#E1E4EA] bg-white px-3 py-2 text-[#12231F] focus:outline-none focus:ring-2 focus:border-transparent"
      style={{ "--tw-ring-color": ACCENT, fontSize: BASE.control * scale }}
    >
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}

function SettingsRow({ icon: Icon, title, desc, children }) {
  const scale = React.useContext(TextScaleContext);
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 rounded-xl border border-[#E7E9EE] bg-white px-4 py-4 sm:px-5">
      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
        <div
          className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shrink-0"
          style={{ background: BADGE_BG }}
        >
          <Icon size={17} style={{ color: BADGE_FG }} />
        </div>
        <div className="min-w-0">
          <div className="font-semibold" style={{ color: INK, fontSize: BASE.rowTitle * scale }}>
            {title}
          </div>
          {desc && (
            <div className="mt-0.5" style={{ color: INK_MUTED, fontSize: BASE.rowDesc * scale }}>
              {desc}
            </div>
          )}
        </div>
      </div>
      <div className="shrink-0 pl-[46px] sm:pl-0">{children}</div>
    </div>
  );
}

function SectionCard({ icon: Icon, title, desc, children }) {
  const scale = React.useContext(TextScaleContext);
  return (
    <div className="mb-8 sm:mb-9">
      <div className="flex items-center gap-3 sm:gap-4 mb-4">
        <div
          className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: BADGE_BG }}
        >
          <Icon size={19} style={{ color: BADGE_FG }} />
        </div>
        <div className="min-w-0">
          <div className="font-bold" style={{ color: INK, fontSize: BASE.sectionTitle * scale }}>
            {title}
          </div>
          <div style={{ color: INK_MUTED, fontSize: BASE.sectionDesc * scale }}>{desc}</div>
        </div>
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

export default function MedScanSettings() {
  const [meds, setMeds] = React.useState({
    pharmacy: "GreenLife Pharmacy, Ikeja",
    autoDetect: true,
    refillDays: "5",
    format: "Photo + typed dosage",
  });

  const [notif, setNotif] = React.useState({
    reminders: true,
    time: "08:00",
    refillAlerts: true,
    followUps: false,
    channels: { push: true, sms: true, email: false },
  });

  const [access, setAccess] = React.useState({
    textSize: "2",
    highContrast: false,
    reduceMotion: false,
    screenReader: false,
  });

  const scale = TEXT_SCALE[access.textSize] || 1;

  return (
    <div className="min-h-screen w-full" style={{ background: "#F6F7F9", fontFamily: "'IBM Plex Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@600;700&family=IBM+Plex+Sans:wght@400;500;600&display=swap');
        input:focus, select:focus { box-shadow: 0 0 0 2px ${ACCENT}55; }
      `}</style>

      <TextScaleContext.Provider value={scale}>
        <div className="max-w-3xl mx-auto px-4 sm:px-10 py-6 sm:py-10">
          <SectionCard
            icon={Pill}
            title="Medications"
            desc="How MediScan handles your medications and refills."
          >
            <SettingsRow icon={Store} title="Preferred pharmacy" desc="Where refills get routed">
              <TextInput
                value={meds.pharmacy}
                onChange={(e) => setMeds({ ...meds, pharmacy: e.target.value })}
              />
            </SettingsRow>
            <SettingsRow
              icon={RefreshCw}
              title="Auto-detect dosage"
              desc="Read strength and frequency from prescription photos"
            >
              <Toggle checked={meds.autoDetect} onChange={(v) => setMeds({ ...meds, autoDetect: v })} />
            </SettingsRow>
            <SettingsRow icon={Clock} title="Refill reminder" desc="Days before a medication runs out">
              <Select
                options={["2", "3", "5", "7"]}
                value={meds.refillDays}
                onChange={(v) => setMeds({ ...meds, refillDays: v })}
              />
            </SettingsRow>
            <SettingsRow icon={Upload} title="Upload format" desc="How new prescriptions are captured">
              <Select
                options={["Photo only", "Photo + typed dosage", "Typed entry only"]}
                value={meds.format}
                onChange={(v) => setMeds({ ...meds, format: v })}
              />
            </SettingsRow>
          </SectionCard>

          <SectionCard
            icon={Bell}
            title="Notifications"
            desc="Choose what MediScan notifies you about."
          >
            <SettingsRow icon={Bell} title="Medication reminders">
              <Toggle checked={notif.reminders} onChange={(v) => setNotif({ ...notif, reminders: v })} />
            </SettingsRow>
            <SettingsRow icon={Clock} title="Reminder time">
              <TextInput
                type="time"
                value={notif.time}
                onChange={(e) => setNotif({ ...notif, time: e.target.value })}
              />
            </SettingsRow>
            <SettingsRow icon={RefreshCw} title="Refill alerts">
              <Toggle checked={notif.refillAlerts} onChange={(v) => setNotif({ ...notif, refillAlerts: v })} />
            </SettingsRow>
            <SettingsRow icon={MessageCircle} title="Follow-up messages" desc="Check-ins after a consultation">
              <Toggle checked={notif.followUps} onChange={(v) => setNotif({ ...notif, followUps: v })} />
            </SettingsRow>
            <SettingsRow icon={Send} title="Delivery channels">
              <div className="flex gap-3 flex-wrap">
                {["push", "sms", "email"].map((c) => (
                  <label
                    key={c}
                    className="flex items-center gap-1.5"
                    style={{ color: INK, fontSize: BASE.label * scale }}
                  >
                    <input
                      type="checkbox"
                      checked={notif.channels[c]}
                      onChange={(e) =>
                        setNotif({ ...notif, channels: { ...notif.channels, [c]: e.target.checked } })
                      }
                      className="w-4 h-4"
                      style={{ accentColor: ACCENT }}
                    />
                    {c === "push" ? "Push" : c === "sms" ? "SMS" : "Email"}
                  </label>
                ))}
              </div>
            </SettingsRow>
          </SectionCard>

          <SectionCard
            icon={Eye}
            title="Accessibility"
            desc="Adjust the app to fit how you read and move."
          >
            <SettingsRow icon={Type} title="Text size">
              <input
                type="range"
                min="1"
                max="4"
                value={access.textSize}
                onChange={(e) => setAccess({ ...access, textSize: e.target.value })}
                className="w-full max-w-[180px]"
                style={{ accentColor: ACCENT }}
              />
            </SettingsRow>
            <SettingsRow icon={Contrast} title="High contrast" desc="Increases contrast between text and background">
              <Toggle checked={access.highContrast} onChange={(v) => setAccess({ ...access, highContrast: v })} />
            </SettingsRow>
            <SettingsRow icon={Waves} title="Reduce motion" desc="Turns off transitions and animations">
              <Toggle checked={access.reduceMotion} onChange={(v) => setAccess({ ...access, reduceMotion: v })} />
            </SettingsRow>
            <SettingsRow icon={Eye} title="Screen reader optimized" desc="Adds extra labels for assistive technology">
              <Toggle checked={access.screenReader} onChange={(v) => setAccess({ ...access, screenReader: v })} />
            </SettingsRow>
          </SectionCard>

          <button
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 font-semibold text-white px-5 py-2.5 rounded-lg hover:opacity-90 transition-opacity"
            style={{ background: ACCENT, fontSize: BASE.control * scale }}
          >
            Save changes
          </button>
        </div>
      </TextScaleContext.Provider>
    </div>
  );
}