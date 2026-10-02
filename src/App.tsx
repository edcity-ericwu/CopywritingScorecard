import { useState } from "react";

type GateKey = "clear" | "credible" | "enabling" | "inclusive" | "calm";
type AttrKey = "curious" | "optimistic" | "human" | "vibrant" | "connected";
type Preset = "public" | "internal" | "audience" | "marketing";

const PRESETS: { key: Preset; label: string; desc: string }[] = [
  { key: "public",    label: "Public-facing",     desc: "All five checks required — full usability standard." },
  { key: "internal",  label: "Internal / Admin",    desc: "Clear, Enabling, and Calm are required. Credible and Inclusive are recommended." },
  { key: "audience",  label: "Audience-specific",  desc: "Clear, Credible, Enabling, and Calm are required. Inclusive is recommended — copy should suit its target audience, not every reader." },
  { key: "marketing", label: "Marketing / Brand",  desc: "Clear, Credible, Enabling, and Inclusive are required. Calm is recommended." },
];

const REQUIRED_CHECKS: Record<Preset, GateKey[]> = {
  public:    ["clear", "credible", "enabling", "inclusive", "calm"],
  internal:  ["clear", "enabling", "calm"],
  audience:  ["clear", "credible", "enabling", "calm"],
  marketing: ["clear", "credible", "enabling", "inclusive"],
};

const GATE_ITEMS: { key: GateKey; label: string; desc: string }[] = [
  { key: "clear",     label: "Clear",     desc: "Communicates information clearly and logically without confusion. The user can understand and act without re-reading." },
  { key: "credible",  label: "Credible",  desc: "Accurate, trustworthy, and authoritative. Content can be relied upon; the tone and claims reflect well on the organisation." },
  { key: "enabling",  label: "Enabling",  desc: "Supports the user’s immediate goal. Copy removes friction and empowers the next step rather than creating uncertainty." },
  { key: "inclusive", label: "Inclusive", desc: "Accessible, respectful, and friendly to the intended audience. Language should not exclude or alienate any person it is reasonably expected to reach." },
  { key: "calm",      label: "Calm",      desc: "Helpful, measured, and stable — especially during errors or complex tasks. Avoids alarming or confusing language at critical moments." },
];

const ATTR_ITEMS: {
  key: AttrKey;
  label: string;
  desc: string;
  leftLabel: string;
  rightLabel: string;
  label1: string;
  label3: string;
  label5: string;
  score1: string;
  score3: string;
  score5: string;
}[] = [
  {
    key: "curious",
    label: "Curious",
    desc: "Encourages exploration, discovery, and a lifelong relationship with learning. Copy should open doors and invite deeper engagement.",
    leftLabel: "← Transactional / Restrictive",
    rightLabel: "Exploratory & Pathway-driven →",
    label1: "1 — Dry, directive, no invitation",
    label3: "3 — Straightforward but not inviting",
    label5: "5 — Stories, pathways, discovery",
    score1: "Dry, directive tone. Treats interaction as a transaction only. No invitation to explore further.",
    score3: "Straightforward and functional. Gets the job done but doesn’t open new pathways or spark curiosity.",
    score5: "Prompts questions, tells stories, surfaces connections and possibilities. Every phrase invites discovery.",
  },
  {
    key: "optimistic",
    label: "Optimistic",
    desc: "Grounded and forward-looking. Challenges feel navigable; progress is visible; potential is clear without idealism.",
    leftLabel: "← Over-promotional or clinical",
    rightLabel: "Grounded & forward-looking →",
    label1: "1 — Hyped/unrealistic or negative",
    label3: "3 — Matter-of-fact",
    label5: "5 — Challenges navigable, progress clear",
    score1: "Hyped, unrealistic promises or unnecessarily negative and clinical. Neither builds trust nor forward momentum.",
    score3: "Matter-of-fact. Neutral tone. States facts without framing them as opportunities or encouraging progress.",
    score5: "Challenges feel navigable. Progress is visible. Potential is clear and grounded — honest optimism, not idealism.",
  },
  {
    key: "human",
    label: "Human",
    desc: "Supportive and empathetic. Recognises users’ goals, constraints, agency, and everyday learning contexts.",
    leftLabel: "← Corporate / Robotic",
    rightLabel: "Supportive & Empathetic →",
    label1: "1 — Detached, corporate, robotic",
    label3: "3 — Safe corporate language",
    label5: "5 — Recognises goals, constraints, agency",
    score1: "Detached, institutional. Speaks at users rather than to them. Ignores emotional context and real-world constraints.",
    score3: "Safe, professional language. Polite but generic. Does not actively acknowledge the user’s situation or context.",
    score5: "Recognises users’ goals, real-life constraints, and agency. Supportive language that meets people where they are.",
  },
  {
    key: "vibrant",
    label: "Vibrant",
    desc: "Warm, delightful, and memorable. Energy and warmth without compromising clarity or calm. For internal tools, score 3 (clean and functional) is a valid target.",
    leftLabel: "← Dull / Flat / Long-winded",
    rightLabel: "Warm, Delightful & Memorable →",
    label1: "1 — Dull or long-winded",
    label3: "3 — Clean but unmemorable",
    label5: "5 — Energetic warmth and delight",
    score1: "Flat, dull, or long-winded. No personality or warmth. Reads like a legal disclaimer or generic system message.",
    score3: "Clean and competent. Gets the message across clearly but won’t be remembered. No distinctive voice or energy.",
    score5: "Energetic warmth and genuine delight. Memorable language that feels distinctive without sacrificing clarity.",
  },
  {
    key: "connected",
    label: "Connected",
    desc: "Shared community ecosystem. Connects learners, families, teachers, schools, resources, and opportunities. Less applicable to internal tools — task focus and clarity are the correct goals there.",
    leftLabel: "← Siloed service",
    rightLabel: "Shared community ecosystem →",
    label1: "1 — Isolated software vendor",
    label3: "3 — Generic, resources siloed",
    label5: "5 — Learners, families, schools, connected",
    score1: "Feels like an isolated software product. No sense of community, shared mission, or broader ecosystem.",
    score3: "Generic references to users and resources. Services exist but feel separate; no narrative of a shared purpose.",
    score5: "Actively connects learners, families, teachers, schools, and resources. Every phrase reinforces a shared ecosystem vision.",
  },
];

function segmentColor(score: number, pos: number): string {
  if (pos !== score) return "#e5e7eb";
  if (score === 1) return "#ef4444";
  if (score === 2) return "#f59e0b";
  if (score === 3) return "#6b7a8d";
  if (score === 4) return "#3b5bdb";
  return "#059669";
}

function getScoreBand(total: number) {
  if (total >= 20) return { label: "Premium Brand Fit",       color: "#059669", bg: "#ecfdf5", badgeBg: "#059669",  badgeText: "✓ Ready to publish", badgeColor: "white" };
  if (total >= 14) return { label: "Good Core Copy",          color: "#1e3a8a", bg: "#eff6ff", badgeBg: "#dbeafe",  badgeText: "Refine first",        badgeColor: "#1d4ed8" };
  if (total >= 8)  return { label: "Needs Rewrite",           color: "#92400e", bg: "#fff7ed", badgeBg: "#fde68a",  badgeText: "Rewrite required",    badgeColor: "#b45309" };
  return             { label: "Critical — Do Not Publish", color: "#991b1b", bg: "#fef2f2", badgeBg: "#fca5a5",  badgeText: "Do not publish",      badgeColor: "#991b1b" };
}

function ScoreBar({ score, onChange }: { score: number; onChange: (s: number) => void }) {
  return (
    <div className="flex gap-[8px] items-center w-full">
      {[1, 2, 3, 4, 5].map((n) => {
        const color = segmentColor(score, n);
        const isSelected = score === n;
        return (
          <button
            key={n}
            onClick={() => onChange(n)}
            className="flex flex-[1_0_0] flex-col items-center min-w-px cursor-pointer group"
            style={{ background: "none", border: "none", padding: 0 }}
            aria-label={`Score ${n}`}
          >
            <div
              className="h-[12px] rounded-[3px] w-full transition-colors duration-150 group-hover:opacity-80"
              style={{ background: color }}
            />
            <div
              className="h-[14px] w-[2px] transition-colors duration-150"
              style={{ background: isSelected ? color : "#d1d5db" }}
            />
            <p
              className={`text-fluid-label leading-none transition-colors duration-150 ${
                isSelected ? "font-extrabold text-[#111]" : "font-bold text-[#9ca3af]"
              }`}
            >
              {n}
            </p>
          </button>
        );
      })}
    </div>
  );
}

function GateRow({ item, value, isRequired, onChange }: { item: (typeof GATE_ITEMS)[0]; value: boolean; isRequired: boolean; onChange: (v: boolean) => void }) {
  const isYes = value;
  const failing = !isYes && isRequired;
  const recommended = !isYes && !isRequired;

  return (
    <div
      className="flex flex-col sm:flex-row gap-[16px] sm:gap-[20px] items-start px-[16px] sm:px-[24px] py-[12px] sm:py-[16px] rounded-[8px] w-full"
      style={{
        background: failing ? "#fffbeb" : "#f8fafc",
        border: failing ? "2px solid #f59e0b" : "1px solid #e5e7eb",
      }}
    >
      {/* Yes / No buttons */}
      <div className="flex gap-[8px] items-center shrink-0 pt-[2px]">
        <button
          onClick={() => onChange(true)}
          className={`border flex items-center px-[16px] py-[7px] rounded-[6px] shrink-0 cursor-pointer transition-all duration-150 ${
            isYes ? "bg-[#ecfdf5] border-[#6ee7b7]" : "bg-white border-[#d1d5db] opacity-50 hover:opacity-80"
          }`}
          aria-label="Yes"
        >
          <p className="font-bold text-[#059669] text-fluid-label tracking-[0.16px] uppercase whitespace-nowrap">✓ Yes</p>
        </button>
        <button
          onClick={() => onChange(false)}
          className={`border flex items-center px-[16px] py-[7px] rounded-[6px] shrink-0 cursor-pointer transition-all duration-150 ${
            !isYes ? "bg-[#fef3c7] border-[#f59e0b]" : "bg-white border-[#d1d5db] opacity-50 hover:opacity-80"
          }`}
          aria-label="No"
        >
          <p className="font-bold text-[#d97706] text-fluid-label tracking-[0.16px] uppercase whitespace-nowrap">✗ No</p>
        </button>
      </div>

      {/* Label + badge */}
      <div className="flex flex-col gap-[5px] items-start shrink-0 w-auto sm:w-[180px] pt-[4px]">
        <p className={`font-bold text-fluid-body ${failing ? "text-[#b45309]" : "text-[#111]"}`}>
          {item.label}
        </p>
        {!isRequired && (
          <span className="bg-[#f4f5f7] border border-[#d1d5db] text-[#6b7a8d] font-medium text-fluid-micro tracking-[0.26px] uppercase px-[8px] py-[2px] rounded-[4px]">
            Recommended
          </span>
        )}
      </div>

      {/* Divider */}
      <div className="hidden sm:block h-[44px] shrink-0 w-px self-center" style={{ background: failing ? "#f59e0b" : "#e5e7eb" }} />

      {/* Description */}
      <div className="flex flex-[1_0_0] flex-col gap-[8px] items-start min-w-px">
        <p className={`[word-break:break-word] font-normal text-fluid-body leading-snug ${failing ? "text-[#92400e]" : "text-[#4b5563]"}`}>
          {item.desc}
        </p>
        {failing && (
          <div className="bg-[#fef3c7] flex items-start px-[12px] py-[7px] rounded-[4px] w-full">
            <p className="[word-break:break-word] font-semibold text-[#b45309] text-fluid-label leading-snug">
              ⚠ Pending revision — {item.label} check failed
            </p>
          </div>
        )}
        {recommended && (
          <div className="bg-[#f4f5f7] flex items-start px-[12px] py-[7px] rounded-[4px] w-full">
            <p className="[word-break:break-word] font-medium text-[#6b7a8d] text-fluid-label leading-snug">
              Consider revising — not required for this context
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function AttributeCard({ attr, score, onChange }: { attr: (typeof ATTR_ITEMS)[0]; score: number; onChange: (s: number) => void }) {
  const belowBaseline = score < 3;
  const badgeBlue = score >= 3;

  return (
    <div className="bg-white border border-[#e5e7eb] flex flex-col gap-[18px] sm:gap-[28px] items-start p-card rounded-[12px] w-full">
      {/* Header: name + desc */}
      <div className="flex flex-col gap-[8px] items-start w-full">
        <div className="flex gap-[12px] items-center">
          <p className="font-extrabold text-[#111] text-fluid-card">{attr.label}</p>
          <div
            className="flex items-center px-[10px] py-[3px] rounded-[4px]"
            style={{ background: badgeBlue ? "#eef2ff" : "#fff7ed" }}
          >
            <p className="font-semibold text-fluid-micro whitespace-nowrap" style={{ color: badgeBlue ? "#3b5bdb" : "#b45309" }}>
              Score: {score} / 5
            </p>
          </div>
        </div>
        <p className="[word-break:break-word] font-normal text-[#6b7a8d] text-fluid-body leading-snug w-full max-w-[720px]">
          {attr.desc}
        </p>
      </div>

      {/* Scale */}
      <div className="flex flex-col gap-[10px] items-start w-full">
        <div className="flex items-center justify-between w-full">
          <p className="font-semibold text-[#ef4444] text-fluid-label">{attr.leftLabel}</p>
          <p className="font-semibold text-[#059669] text-fluid-label text-right">{attr.rightLabel}</p>
        </div>
        <ScoreBar score={score} onChange={onChange} />
        <div className="flex items-start justify-between w-full gap-[8px] text-fluid-micro leading-snug">
          <p className="font-normal text-[#9ca3af] max-w-[30%]">{attr.label1}</p>
          <p className="font-semibold text-[#6b7a8d] text-center max-w-[36%]">{attr.label3}</p>
          <p className="font-normal text-[#059669] text-right max-w-[30%]">{attr.label5}</p>
        </div>
      </div>

      {/* Below baseline warning */}
      {belowBaseline && (
        <div className="bg-[#fffbeb] border border-[#f59e0b] flex items-start px-[18px] py-[12px] rounded-[6px] w-full">
          <p className="[word-break:break-word] font-semibold text-[#b45309] text-fluid-label leading-snug">
            ⚠ Score below baseline (3) — consider revision before publishing.
          </p>
        </div>
      )}

      {/* Score rubrics */}
      <div className="flex flex-col sm:flex-row gap-[2px] items-start w-full">
        <div
          className="flex flex-[1_0_0] flex-col gap-[8px] items-start min-w-px p-[18px] w-full sm:w-auto rounded-tl-[6px] rounded-tr-[6px] sm:rounded-tr-none sm:rounded-bl-[6px]"
          style={{ background: score === 1 ? "#fee2e2" : "#fef2f2" }}
        >
          <p className="font-bold text-[#dc2626] text-fluid-micro tracking-[0.26px] uppercase whitespace-nowrap">Score 1</p>
          <p className="font-normal text-[#7f1d1d] text-fluid-body leading-snug">{attr.score1}</p>
        </div>
        <div
          className="border-l-2 flex flex-[1_0_0] flex-col gap-[8px] items-start min-w-px p-[18px] w-full sm:w-auto"
          style={{ background: score === 3 ? "#e8edf5" : "#f8fafc", borderColor: "#6b7a8d" }}
        >
          <p className="font-bold text-[#6b7a8d] text-fluid-micro tracking-[0.26px] uppercase whitespace-nowrap">Score 3 — Baseline</p>
          <p className="font-normal text-[#374151] text-fluid-body leading-snug">{attr.score3}</p>
        </div>
        <div
          className="flex flex-[1_0_0] flex-col gap-[8px] items-start min-w-px p-[18px] w-full sm:w-auto rounded-bl-[6px] rounded-br-[6px] sm:rounded-bl-none sm:rounded-tr-[6px]"
          style={{ background: score === 5 ? "#d1fae5" : "#f0fdf4" }}
        >
          <p className="font-bold text-[#059669] text-fluid-micro tracking-[0.26px] uppercase whitespace-nowrap">Score 5</p>
          <p className="font-normal text-[#064e3b] text-fluid-body leading-snug">{attr.score5}</p>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [copyText, setCopyText] = useState("");
  const [copyPanelOpen, setCopyPanelOpen] = useState(true);
  const [preset, setPreset] = useState<Preset>("public");

  const [gateChecks, setGateChecks] = useState<Record<GateKey, boolean>>({
    clear: true,
    credible: true,
    enabling: true,
    inclusive: false,
    calm: true,
  });

  const [scores, setScores] = useState<Record<AttrKey, number>>({
    curious: 3,
    optimistic: 4,
    human: 2,
    vibrant: 4,
    connected: 5,
  });

  const requiredChecks = REQUIRED_CHECKS[preset];
  const gatePassCount = requiredChecks.filter((k) => gateChecks[k]).length;
  const gateTotal = requiredChecks.length;
  const gatePassed = gatePassCount === gateTotal;
  const totalExpressive = Object.values(scores).reduce((a, b) => a + b, 0);
  const band = getScoreBand(totalExpressive);

  const scoreBarWidth = (s: number) => `${(s / 5) * 100}%`;
  const scoreColor = (s: number) => {
    if (s <= 1) return "#ef4444";
    if (s <= 2) return "#f59e0b";
    if (s <= 3) return "#6b7a8d";
    return "#3b5bdb";
  };

  function getRecommendation(total: number, attrScores: Record<AttrKey, number>): string {
    const low = ATTR_ITEMS.filter((a) => attrScores[a.key] < 3).map((a) => a.label);
    if (total >= 20) {
      const note = low.length ? ` Note: ${low.join(", ")} scored below 3 — review before flagship placements.` : "";
      return `Copy fully embodies the brand’s expressive identity. Ready to publish across all surfaces including flagship and highly visible placements.${note}`;
    }
    if (total >= 14) {
      const note = low.length ? ` Focus on improving: ${low.join(", ")}.` : "";
      return `Strong foundation — mostly on-brand and functional.${note} Refine before deploying on highly visible or brand-defining surfaces.`;
    }
    if (total >= 8) {
      return `Copy falls short of brand expression standards. Significant rewrite required. Areas needing attention: ${low.join(", ") || "multiple attributes"}.`;
    }
    return "Copy is off-brand and potentially harmful to user trust. Do not publish. Full rethink of content strategy required.";
  }

  const SCORE_BANDS = [
    { range: "20–25", min: 20, bg: "#ecfdf5", color: "#065f46", label: "Premium Brand Fit",       desc: "Copy fully embodies the brand’s expressive identity. Ready to publish across all surfaces including flagship and highly visible placements.", badgeBg: "#059669", badgeText: "✓ Ready to publish", badgeColor: "white" },
    { range: "14–19", min: 14, bg: "#eff6ff", color: "#1e3a8a", label: "Good Core Copy",          desc: "Solid quality copy. Functional and mostly on-brand. Refine before deploying on highly visible or brand-defining surfaces.",                  badgeBg: "#dbeafe", badgeText: "Refine first",        badgeColor: "#1d4ed8" },
    { range: "8–13",  min: 8,  bg: "#fff7ed", color: "#92400e", label: "Needs Rewrite",           desc: "Copy falls well short of brand expression standards. Significant rewrite required before any publication. Revisit tone, voice, and brand attributes.", badgeBg: "#fde68a", badgeText: "Rewrite required",    badgeColor: "#b45309" },
    { range: "5–7",   min: 0,  bg: "#fef2f2", color: "#991b1b", label: "Critical — Do Not Publish", desc: "Copy is off-brand and potentially harmful to user trust. Do not publish. Full rethink of content strategy required for this surface.", badgeBg: "#fca5a5", badgeText: "Do not publish",      badgeColor: "#991b1b" },
  ];

  return (
    <div className="bg-white flex flex-col items-start w-full min-h-screen">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="bg-white flex flex-col items-start pt-section px-section w-full">
        <div className="bg-[#111] h-[4px] w-full" />
        <div className="flex flex-col gap-[24px] items-start pt-[40px] sm:pt-[56px] w-full">

          {/* Wordmark */}
          <div className="flex gap-[12px] items-center">
            <div className="bg-[#111] rounded-[4px] size-[24px]" />
            <p className="font-light text-[#6b7a8d] text-fluid-micro whitespace-nowrap">Content Quality Framework</p>
          </div>

          {/* Hero title */}
          <div className="flex flex-col gap-[10px] font-extrabold text-[#111] text-fluid-hero leading-none w-full">
            <p>Copywriting</p>
            <p>Quality Scorecard</p>
          </div>

          {/* Subtitle */}
          <p className="[word-break:break-word] font-normal text-[#6b7a8d] text-fluid-body leading-relaxed max-w-[680px]">
            A two-layer evaluation framework for digital copy — functional baseline first, then expressive brand alignment.
          </p>

          {/* Copy input */}
          <div className="flex flex-col gap-[8px] items-start pt-[20px] sm:pt-[32px] w-full">
            <p className="font-semibold text-[#6b7a8d] text-fluid-micro tracking-[0.3px] uppercase">
              Evaluating content
            </p>
            <textarea
              value={copyText}
              onChange={(e) => setCopyText(e.target.value)}
              placeholder="Paste or type the copy you’re evaluating here…"
              className="bg-[#f4f5f7] border border-[#d1d5db] w-full rounded-[8px] px-[28px] py-[20px] text-[#111] text-fluid-body font-normal leading-relaxed placeholder:text-[#9ca3af] resize-none focus:outline-none focus:border-[#6b7a8d] transition-colors"
              rows={6}
            />
          </div>
        </div>
        <div className="bg-[#e5e7eb] h-px w-full mt-[40px] sm:mt-[56px]" />
      </div>

      {/* ── Section 1 — Functional Gate ─────────────────────────────────── */}
      <div className="bg-white flex flex-col gap-[28px] sm:gap-[40px] items-start px-section py-section w-full">

        {/* Section header */}
        <div className="flex flex-col gap-[20px] items-start w-full">

          {/* Eyebrow */}
          <div className="flex gap-[12px] items-center">
            <div className="bg-[#111] flex items-center px-[14px] py-[5px] rounded-[4px]">
              <p className="font-bold text-fluid-micro text-white tracking-[0.3px] uppercase whitespace-nowrap">Layer 1</p>
            </div>
            <p className="font-medium text-[#6b7a8d] text-fluid-micro tracking-[0.3px] uppercase whitespace-nowrap">
              Non-negotiable baseline
            </p>
          </div>

          {/* Title */}
          <p className="font-extrabold text-[#111] text-fluid-title">Functional Gate</p>

          {/* Context type picker */}
          <div className="flex flex-col gap-[10px] items-start w-full">
            <p className="font-semibold text-[#6b7a8d] text-fluid-micro tracking-[0.3px] uppercase">Context type</p>
            <div className="flex flex-wrap gap-[8px] items-center">
              {PRESETS.map((p) => (
                <button
                  key={p.key}
                  onClick={() => setPreset(p.key)}
                  className="px-[14px] py-[7px] rounded-[6px] text-fluid-label font-medium border cursor-pointer transition-all duration-150 whitespace-nowrap"
                  style={
                    preset === p.key
                      ? { background: "#111", color: "white", borderColor: "#111" }
                      : { background: "#f4f5f7", color: "#6b7a8d", borderColor: "#e5e7eb" }
                  }
                >
                  {p.label}
                </button>
              ))}
            </div>
            <p className="[word-break:break-word] font-normal text-[#6b7a8d] text-fluid-body leading-snug max-w-[680px]">
              {PRESETS.find((p) => p.key === preset)?.desc}
            </p>
          </div>

          {/* Gate Status — compact left-aligned row */}
          <div
            className="border flex items-center gap-[14px] px-[18px] py-[12px] rounded-[10px]"
            style={{ background: gatePassed ? "#f0fdf4" : "#fff7ed", borderColor: gatePassed ? "#6ee7b7" : "#f59e0b" }}
          >
            <p className="font-extrabold text-fluid-title leading-none" style={{ color: gatePassed ? "#059669" : "#f59e0b" }}>
              {gatePassCount} / {gateTotal}
            </p>
            <div className="flex flex-col gap-[2px]">
              <p className="font-semibold text-fluid-micro tracking-[0.3px] uppercase" style={{ color: gatePassed ? "#065f46" : "#b45309" }}>
                Gate Status
              </p>
              <p className="font-medium text-fluid-micro" style={{ color: gatePassed ? "#047857" : "#b45309" }}>
                {gatePassed ? "All required checks passed" : "Revision required"}
              </p>
            </div>
          </div>
        </div>

        {/* Gate rows */}
        <div className="flex flex-col gap-[10px] w-full">
          {GATE_ITEMS.map((item) => (
            <GateRow
              key={item.key}
              item={item}
              value={gateChecks[item.key]}
              isRequired={requiredChecks.includes(item.key)}
              onChange={(v) => setGateChecks((prev) => ({ ...prev, [item.key]: v }))}
            />
          ))}
        </div>

        {/* Gate result banner */}
        {!gatePassed && (
          <div className="bg-[#fff1f2] border border-[#fda4af] flex flex-wrap gap-[14px] items-center px-[16px] sm:px-[24px] py-[12px] sm:py-[16px] rounded-[10px] w-full">
            <div className="bg-[#ef4444] flex items-center px-[12px] py-[5px] rounded-[6px] shrink-0">
              <p className="font-bold text-fluid-label text-white whitespace-nowrap">GATE BLOCKED</p>
            </div>
            <div className="flex flex-col gap-[3px] min-w-0">
              <p className="font-bold text-[#991b1b] text-fluid-body">Usability threshold unmet. Copy must be modified.</p>
              <p className="font-normal text-[#b91c1c] text-fluid-label">
                {gatePassCount} of {gateTotal} required checks passed. Address the failing check(s) first, then re-evaluate.
              </p>
            </div>
          </div>
        )}
        {gatePassed && (
          <div className="bg-[#f0fdf4] border border-[#6ee7b7] flex flex-wrap gap-[14px] items-center px-[16px] sm:px-[24px] py-[12px] sm:py-[16px] rounded-[10px] w-full">
            <div className="bg-[#059669] flex items-center px-[12px] py-[5px] rounded-[6px] shrink-0">
              <p className="font-bold text-fluid-label text-white whitespace-nowrap">GATE PASSED</p>
            </div>
            <p className="font-normal text-[#047857] text-fluid-body">
              All required functional checks passed. Proceed to expressive attribute scoring.
            </p>
          </div>
        )}
      </div>

      <div className="bg-[#111] h-[8px] w-full" />

      {/* ── Section 2 — Expressive Attribute Scales ─────────────────────── */}
      <div className="bg-[#fafbfc] flex flex-col gap-[28px] sm:gap-[40px] items-start px-section py-section w-full">

        {/* Section header */}
        <div className="flex flex-col gap-[16px] items-start w-full">
          <div className="flex gap-[12px] items-center">
            <div className="bg-[#3b5bdb] flex items-center px-[14px] py-[5px] rounded-[4px]">
              <p className="font-bold text-fluid-micro text-white tracking-[0.3px] uppercase whitespace-nowrap">Layer 2</p>
            </div>
            <p className="font-medium text-[#6b7a8d] text-fluid-micro tracking-[0.3px] uppercase whitespace-nowrap">
              Brand expression scoring
            </p>
          </div>
          <div className="flex flex-col gap-[12px] items-start">
            <p className="font-extrabold text-[#111] text-fluid-title">Expressive Attribute Scales</p>
            <p className="[word-break:break-word] font-normal text-[#6b7a8d] text-fluid-body leading-snug max-w-[680px]">
              Score each attribute from 1 to 5. Step 3 is the neutral baseline — scores below 3 require attention. Total maximum score is 25.
            </p>
          </div>
          <div className="flex flex-wrap gap-[16px] items-center">
            {[
              { bg: "#d1d5db", label: "1–2 Below baseline" },
              { bg: "#6b7a8d", label: "3 Neutral" },
              { bg: "#3b5bdb", label: "4–5 Strong" },
            ].map((leg) => (
              <div key={leg.label} className="flex gap-[8px] items-center">
                <div className="h-[3px] rounded-full w-[24px]" style={{ background: leg.bg }} />
                <p className="font-medium text-[#9ca3af] text-fluid-micro whitespace-nowrap">{leg.label}</p>
              </div>
            ))}
          </div>
        </div>

        {ATTR_ITEMS.map((attr) => (
          <AttributeCard
            key={attr.key}
            attr={attr}
            score={scores[attr.key]}
            onChange={(s) => setScores((prev) => ({ ...prev, [attr.key]: s }))}
          />
        ))}
      </div>

      <div className="bg-[#111] h-[8px] w-full" />

      {/* ── Section 3 — Final Evaluation ────────────────────────────────── */}
      <div className="bg-white flex flex-col gap-[28px] sm:gap-[40px] items-start pb-[80px] px-section py-section w-full">

        {/* Section header */}
        <div className="flex flex-col gap-[32px] items-start w-full">
          <div className="flex gap-[12px] items-center">
            <div className="bg-[#059669] flex items-center px-[14px] py-[5px] rounded-[4px]">
              <p className="font-bold text-fluid-micro text-white tracking-[0.3px] uppercase whitespace-nowrap">Layer 3</p>
            </div>
            <p className="font-medium text-[#6b7a8d] text-fluid-micro tracking-[0.3px] uppercase whitespace-nowrap">
              Summary &amp; recommendation
            </p>
          </div>
          <p className="font-extrabold text-[#111] text-fluid-title">Final Evaluation</p>
        </div>

        {/* Score breakdown + Recommendation panel */}
        <div className="flex flex-wrap gap-[28px] items-start w-full">

          {/* Score Breakdown */}
          <div className="bg-[#f8fafc] border border-[#e5e7eb] flex flex-[1_0_280px] flex-col gap-[20px] items-start min-w-px p-card rounded-[12px]">
            <p className="font-semibold text-[#6b7a8d] text-fluid-micro tracking-[0.3px] uppercase whitespace-nowrap">
              Score Breakdown
            </p>
            <div className="flex flex-col gap-[4px] w-full">
              {ATTR_ITEMS.map((attr) => {
                const s = scores[attr.key];
                const low = s < 3;
                const high = s >= 4;
                return (
                  <div
                    key={attr.key}
                    className="border flex min-h-[44px] items-center justify-between px-[14px] py-[8px] gap-[8px] rounded-[6px] w-full"
                    style={{
                      background: low ? "#fffbeb" : high ? "#f0fdf4" : "white",
                      borderColor: low ? "#f59e0b" : high ? "#6ee7b7" : "#e5e7eb",
                    }}
                  >
                    <div className="flex items-center gap-[8px] min-w-0 shrink">
                      <p className="font-semibold text-fluid-body shrink-0" style={{ color: low ? "#b45309" : high ? "#065f46" : "#111" }}>
                        {attr.label}
                      </p>
                      {low && (
                        <div className="bg-[#fef3c7] flex items-center px-[7px] py-[2px] rounded-[4px] shrink-0">
                          <p className="font-semibold text-[#b45309] text-fluid-micro whitespace-nowrap">Needs attention</p>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-[6px] items-center shrink-0">
                      <div className="relative bg-[#e5e7eb] h-[6px] rounded-[3px] w-[56px] overflow-hidden">
                        <div
                          className="absolute top-0 left-0 h-[6px] rounded-[3px] transition-all duration-300"
                          style={{ width: scoreBarWidth(s), background: scoreColor(s) }}
                        />
                      </div>
                      <p className="font-bold text-fluid-body" style={{ color: scoreColor(s) }}>{s}</p>
                      <p className="font-normal text-[#9ca3af] text-fluid-micro">/ 5</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="bg-[#e5e7eb] h-px w-full" />

            <div className="flex items-center justify-between w-full">
              <p className="font-bold text-[#111] text-fluid-panel">Total Expressive Score</p>
              <div className="flex gap-[4px] items-baseline">
                <p className="font-extrabold text-[#3b5bdb] text-fluid-title leading-none">{totalExpressive}</p>
                <p className="font-normal text-[#9ca3af] text-fluid-label">/ 25</p>
              </div>
            </div>

            {preset === "internal" && (
              <p className="[word-break:break-word] font-normal text-[#9ca3af] text-fluid-micro leading-snug">
                Bands are calibrated for public-facing content. For internal tools, lower scores on Vibrant and Connected are expected — this is not a failure.
              </p>
            )}

            <div className="flex flex-col gap-[6px] items-start w-full">
              <p className="font-semibold text-[#6b7a8d] text-fluid-micro tracking-[0.3px] uppercase whitespace-nowrap">Score range</p>
              <div className="relative bg-[#e5e7eb] h-[16px] rounded-[8px] w-full overflow-hidden">
                <div
                  className="absolute top-0 left-0 h-[16px] rounded-[8px] transition-all duration-500"
                  style={{
                    width: `${((totalExpressive - 5) / 20) * 100}%`,
                    background: "linear-gradient(to right, #ef4444, #f59e0b 48%, #3b5bdb 72%)",
                  }}
                />
              </div>
            </div>
          </div>

          {/* Recommendation Panel */}
          <div className="bg-[#111] flex flex-col gap-[22px] items-start p-card rounded-[12px] w-full sm:w-[380px] sm:shrink-0">
            <div className="flex flex-col gap-[4px] items-start w-full">
              <p className="font-semibold text-[#9ca3af] text-fluid-micro tracking-[0.3px] uppercase">Result</p>
              <div className="flex gap-[6px] items-baseline">
                <p className="font-black text-[#3b82f6] text-fluid-display leading-none">{totalExpressive}</p>
                <p className="font-normal text-[#6b7280] text-fluid-panel">/25</p>
              </div>
            </div>
            <div
              className="flex items-center justify-center px-[20px] py-[12px] rounded-[8px] w-full"
              style={{ background: band.bg }}
            >
              <p className="[word-break:break-word] font-extrabold text-fluid-panel text-center" style={{ color: band.color }}>
                {band.label}
              </p>
            </div>
            <div className="flex flex-col gap-[8px] items-start w-full">
              <p className="font-semibold text-[#9ca3af] text-fluid-micro tracking-[0.3px] uppercase whitespace-nowrap">Recommendation</p>
              <p className="[word-break:break-word] font-normal text-[#e5e7eb] text-fluid-body leading-snug">
                {getRecommendation(totalExpressive, scores)}
              </p>
            </div>
            <div className="bg-[#374151] h-px w-full" />
            <div className="flex flex-col gap-[8px] items-start w-full">
              <p className="font-semibold text-[#9ca3af] text-fluid-micro tracking-[0.3px] uppercase whitespace-nowrap">Next action</p>
              <div className="flex gap-[10px] items-start w-full">
                <div
                  className="flex items-center px-[10px] py-[4px] rounded-[4px] shrink-0"
                  style={{ background: totalExpressive >= 20 ? "#059669" : totalExpressive >= 14 ? "#3b5bdb" : "#f59e0b" }}
                >
                  <p className="font-bold text-fluid-micro text-white whitespace-nowrap">
                    {totalExpressive >= 20 ? "Publish" : totalExpressive >= 14 ? "Refine" : "Rewrite"}
                  </p>
                </div>
                <p className="[word-break:break-word] font-normal text-[#d1d5db] text-fluid-body leading-snug min-w-0">
                  {totalExpressive >= 20
                    ? "Copy meets all brand expression standards. Approved for all surfaces."
                    : totalExpressive >= 14
                    ? "Revise low-scoring attributes before publishing on flagship surfaces."
                    : "Significant revision required across multiple attributes before any publication."}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Score Bands reference table */}
        <div className="border border-[#e5e7eb] flex flex-col items-start overflow-clip rounded-[12px] w-full">
          <div className="bg-[#111] flex flex-wrap items-center justify-between gap-[8px] px-[16px] sm:px-[24px] py-[12px] sm:py-[16px] w-full">
            <p className="font-bold text-fluid-label text-white tracking-[0.3px] uppercase whitespace-nowrap">
              Score Bands &amp; Publishing Thresholds
            </p>
            <p className="font-normal text-[#9ca3af] text-fluid-micro whitespace-nowrap">
              Expressive score out of 25 (Layer 2 only)
            </p>
          </div>
          {SCORE_BANDS.map((b, i, arr) => {
            const isCurrent = i < arr.length - 1
              ? totalExpressive >= b.min && totalExpressive < arr[i - 1]?.min || (i === 0 && totalExpressive >= b.min)
              : totalExpressive < arr[i - 1]?.min;
            return (
              <div
                key={b.range}
                className="border-[#e5e7eb] border-b flex flex-col gap-[10px] items-start px-[16px] sm:px-[24px] py-[14px] sm:py-[20px] w-full last:border-b-0 transition-all"
                style={{ background: isCurrent ? b.bg : "white" }}
              >
                {/* Range + label row */}
                <div className="flex flex-wrap items-center gap-[10px]">
                  <div
                    className="flex items-center px-[12px] py-[4px] rounded-[6px] shrink-0"
                    style={{ background: isCurrent ? b.badgeBg : "#e5e7eb" }}
                  >
                    <p className="font-extrabold text-fluid-label whitespace-nowrap" style={{ color: isCurrent ? "white" : "#6b7a8d" }}>{b.range}</p>
                  </div>
                  <p className="font-extrabold text-fluid-card" style={{ color: b.color }}>{b.label}</p>
                  {isCurrent && (
                    <div className="bg-[#dbeafe] flex items-center px-[10px] py-[3px] rounded-[4px]">
                      <p className="font-semibold text-[#1d4ed8] text-fluid-micro whitespace-nowrap">Current: {totalExpressive}</p>
                    </div>
                  )}
                </div>
                {/* Description */}
                <p className="[word-break:break-word] font-normal text-fluid-body leading-snug" style={{ color: b.color }}>{b.desc}</p>
                {/* Action badge */}
                <div className="flex items-center px-[14px] py-[5px] rounded-[6px]" style={{ background: b.badgeBg }}>
                  <p className="font-semibold text-fluid-micro whitespace-nowrap" style={{ color: b.badgeColor }}>{b.badgeText}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* How to use */}
        <div className="bg-[#f4f5f7] border border-[#e5e7eb] flex gap-[20px] items-start p-card rounded-[10px] w-full">
          <div className="bg-[#3b5bdb] h-full min-h-[48px] rounded-[2px] shrink-0 w-[3px]" />
          <div className="flex flex-[1_0_0] flex-col gap-[6px] items-start min-w-px">
            <p className="font-bold text-[#111] text-fluid-label whitespace-nowrap">How to use this scorecard</p>
            <p className="[word-break:break-word] font-normal text-[#4b5563] text-fluid-body leading-snug">
              Complete the Functional Gate (Layer 1) first — all required checks must pass before expressive scoring is valid. Once the gate is clear, score each of the five expressive attributes independently from 1 to 5. Total the scores, identify the band, and follow the publishing recommendation. A score below 3 on any individual attribute flags a specific area for revision.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col gap-[16px] items-start w-full">
          <div className="bg-[#111] h-[2px] w-full" />
          <div className="flex flex-wrap items-center justify-between gap-[8px] w-full">
            <div className="flex gap-[10px] items-center">
              <div className="bg-[#111] rounded-[3px] size-[16px]" />
              <p className="font-normal text-[#6b7a8d] text-fluid-micro whitespace-nowrap">Copywriting Quality Scorecard</p>
            </div>
            <p className="font-normal text-[#9ca3af] text-fluid-micro whitespace-nowrap">
              Content Design &amp; Brand — Internal evaluation tool · v1.0
            </p>
          </div>
        </div>
      </div>

      {/* ── Sticky copy-reference panel ─────────────────────────────────── */}
      {copyText.trim() && (
        <div className="fixed bottom-4 right-4 sm:bottom-8 sm:right-8 z-50 w-[calc(100%-2rem)] max-w-[340px] rounded-[12px] shadow-2xl overflow-hidden" style={{ background: "#111" }}>
          <button
            onClick={() => setCopyPanelOpen((o) => !o)}
            className="flex items-center justify-between w-full px-[18px] py-[12px] cursor-pointer"
            style={{ background: "none", border: "none" }}
          >
            <div className="flex items-center gap-[8px]">
              <div className="bg-[#3b5bdb] rounded-[2px] shrink-0" style={{ width: 3, height: 16 }} />
              <p className="font-semibold text-white text-fluid-micro tracking-[0.26px] uppercase">Evaluating</p>
            </div>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none"
              style={{ transform: copyPanelOpen ? "rotate(0deg)" : "rotate(180deg)", transition: "transform 0.2s" }}>
              <polyline points="3,10 8,5 13,10" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          {copyPanelOpen && (
            <div className="px-[18px] pb-[18px] overflow-y-auto" style={{ maxHeight: "36vh" }}>
              <p className="font-normal text-[#d1d5db] text-fluid-micro leading-relaxed whitespace-pre-wrap">{copyText}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
