"use client";

import { useTypewriter } from "../hooks/useTypewriter";

interface IdentificationResult {
  taxonId: number;
  scientificName: string;
  commonNames: string[];
  genus: string;
  family: string;
  score: number | null;
}

interface ResultCardProps {
  result: IdentificationResult;
  onTypingDone: () => void;
}

function buildDescription(result: IdentificationResult): string {
  const common = result.commonNames[0];
  const name = common ? `${common} (${result.scientificName})` : result.scientificName;
  const score = result.score;

  const confidence =
    score == null
      ? "with uncertain confidence"
      : score >= 90
      ? "with high confidence"
      : score >= 70
      ? "with good confidence"
      : score >= 50
      ? "with moderate confidence"
      : "— though the image may benefit from a clearer angle";

  const scoreText = score != null ? ` Confidence: ${score}%.` : "";

  return `This appears to be ${name} — a member of the ${result.genus} genus, identified ${confidence}.${scoreText}`;
}

export function ResultCard({ result, onTypingDone }: ResultCardProps) {
  const text = buildDescription(result);
  const { displayed, done } = useTypewriter({ text, speed: 45, onDone: onTypingDone });

  const score = result.score;
  const badgeHighConfidence = score != null && score >= 80;

  return (
    <div
      className="w-full rounded-2xl p-6 sm:p-8"
      style={{
        backgroundColor: "rgba(139,111,71,0.08)",
        border: "1px solid rgba(139,111,71,0.25)",
        boxShadow: "0 4px 40px rgba(0,0,0,0.4), 0 0 80px rgba(196,145,58,0.04)",
        animation: "fade-in 0.5s ease forwards",
      }}
    >
      <div className="flex items-start justify-between gap-4 mb-4 flex-wrap">
        <div>
          <h2
            className="text-2xl sm:text-3xl font-semibold leading-tight"
            style={{
              fontFamily: "var(--font-fraunces)",
              color: "#e8e0d0",
            }}
          >
            {result.commonNames[0] ?? result.scientificName}
          </h2>
          {result.commonNames[0] && (
            <p
              className="text-sm mt-0.5 italic"
              style={{ color: "#a09880" }}
            >
              {result.scientificName}
            </p>
          )}
        </div>
        <span
          className="text-xs font-semibold tracking-widest uppercase px-3 py-1 rounded-full shrink-0"
          style={{
            backgroundColor: badgeHighConfidence
              ? "rgba(122,140,114,0.2)"
              : "rgba(196,145,58,0.15)",
            color: badgeHighConfidence ? "#7a8c72" : "#c4913a",
            border: `1px solid ${badgeHighConfidence ? "rgba(122,140,114,0.4)" : "rgba(196,145,58,0.3)"}`,
          }}
        >
          {score != null ? `${score}% match` : "match"}
        </span>
      </div>

      <p
        className="text-base leading-relaxed min-h-[3em]"
        style={{ color: "#c8bfaf" }}
      >
        {displayed}
        {!done && (
          <span
            className="inline-block w-0.5 h-[1em] ml-0.5 align-middle"
            style={{
              backgroundColor: "#c4913a",
              animation: "cursor-blink 1s step-end infinite",
            }}
            aria-hidden
          />
        )}
      </p>
    </div>
  );
}
