"use client";

import { useState, useRef, useCallback } from "react";
import { Dropzone } from "./components/Dropzone";
import { ResultCard } from "./components/ResultCard";
import { ImageGallery } from "./components/ImageGallery";
import { Loader } from "./components/Loader";

interface IdentificationResult {
  taxonId: number;
  scientificName: string;
  commonNames: string[];
  genus: string;
  family: string;
  score: number;
}

interface Photo {
  url: string;
  thumbnail: string;
  attribution: string;
  sourceLink: string;
}

type AppState = "idle" | "identifying" | "result" | "error";

export default function Home() {
  const [appState, setAppState] = useState<AppState>("idle");
  const [result, setResult] = useState<IdentificationResult | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [errorMsg, setErrorMsg] = useState("");
  const galleryFetchedRef = useRef(false);

  const handleFile = useCallback(async (file: File) => {
    setAppState("identifying");
    setResult(null);
    setPhotos([]);
    setErrorMsg("");
    galleryFetchedRef.current = false;

    try {
      const form = new FormData();
      form.append("image", file);

      const res = await fetch("/api/identify", {
        method: "POST",
        body: form,
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setErrorMsg(
          data.error ??
            "Couldn't identify this one — try a clearer photo of the cap, gills, or stem"
        );
        setAppState("error");
        return;
      }

      const top = data.results[0] as IdentificationResult;
      setResult(top);
      setAppState("result");
    } catch {
      setErrorMsg("Something went wrong — please check your connection and try again");
      setAppState("error");
    }
  }, []);

  const handleTypingDone = useCallback(async () => {
    if (!result || galleryFetchedRef.current) return;
    galleryFetchedRef.current = true;

    try {
      const res = await fetch(`/api/images?taxonId=${result.taxonId}`);
      if (res.ok) {
        const data = await res.json();
        setPhotos(data.photos ?? []);
      }
    } catch {
      // Gallery failure is silent — the identification is still valid
    }
  }, [result]);

  const isLoading = appState === "identifying";

  return (
    <div
      className="flex flex-col flex-1 min-h-screen"
      style={{ backgroundColor: "#1a1a14" }}
    >
      {/* Subtle noise texture overlay */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E")`,
          opacity: 0.4,
        }}
        aria-hidden
      />

      <main className="relative z-10 flex flex-col flex-1 w-full max-w-2xl mx-auto px-4 py-12 sm:py-16 gap-8">
        {/* Header */}
        <header className="text-center">
          <div className="text-4xl mb-4 select-none" aria-hidden>
            🍄
          </div>
          <h1
            className="text-4xl sm:text-5xl font-semibold leading-tight mb-3"
            style={{
              fontFamily: "var(--font-fraunces)",
              color: "#e8e0d0",
            }}
          >
            Fungus Identification
          </h1>
          <p className="text-base" style={{ color: "#a09880" }}>
            Upload or paste a photo — discover what&apos;s growing in the shadows
          </p>
        </header>

        {/* Dropzone */}
        <Dropzone onFile={handleFile} disabled={isLoading} />

        {/* Loading */}
        {isLoading && <Loader />}

        {/* Error */}
        {appState === "error" && (
          <div
            className="rounded-2xl px-6 py-5"
            style={{
              backgroundColor: "rgba(196,145,58,0.07)",
              border: "1px solid rgba(196,145,58,0.2)",
              animation: "fade-in 0.4s ease forwards",
            }}
          >
            <p className="text-sm" style={{ color: "#c4913a" }}>
              ⚠ {errorMsg}
            </p>
          </div>
        )}

        {/* Result */}
        {appState === "result" && result && (
          <ResultCard result={result} onTypingDone={handleTypingDone} />
        )}

        {/* Gallery */}
        {photos.length > 0 && result && (
          <ImageGallery
            photos={photos}
            speciesName={result.commonNames[0] ?? result.scientificName}
          />
        )}
      </main>

      <footer className="relative z-10 text-center pb-8 pt-4">
        <p className="text-xs" style={{ color: "#5a5447" }}>
          Identification powered by{" "}
          <a
            href="https://www.inaturalist.org"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:text-[#8b6f47] transition-colors"
          >
            iNaturalist
          </a>{" "}
          · No data is stored · Always verify before foraging
        </p>
      </footer>
    </div>
  );
}
