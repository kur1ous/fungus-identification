"use client";

import { useState } from "react";

interface Photo {
  url: string;
  thumbnail: string;
  attribution: string;
  sourceLink: string;
}

interface ImageGalleryProps {
  photos: Photo[];
  speciesName: string;
}

function PhotoCard({ photo, index }: { photo: Photo; index: number }) {
  const [loaded, setLoaded] = useState(false);
  const [showAttr, setShowAttr] = useState(false);

  return (
    <a
      href={photo.sourceLink}
      target="_blank"
      rel="noopener noreferrer"
      className="relative block rounded-xl overflow-hidden group"
      style={{
        animation: `fade-in 0.5s ease ${index * 0.07}s both`,
        aspectRatio: "1 / 1",
        backgroundColor: "rgba(139,111,71,0.1)",
      }}
      onMouseEnter={() => setShowAttr(true)}
      onMouseLeave={() => setShowAttr(false)}
      onFocus={() => setShowAttr(true)}
      onBlur={() => setShowAttr(false)}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={photo.url}
        alt={`Species photo ${index + 1}`}
        onLoad={() => setLoaded(true)}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        style={{ opacity: loaded ? 1 : 0, transition: "opacity 0.4s ease, transform 0.5s ease" }}
      />

      {!loaded && (
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ backgroundColor: "rgba(139,111,71,0.08)" }}
        >
          <div
            className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor: "#8b6f47", borderTopColor: "transparent" }}
          />
        </div>
      )}

      {showAttr && photo.attribution && (
        <div
          className="absolute bottom-0 inset-x-0 p-2 text-xs leading-tight"
          style={{
            backgroundColor: "rgba(26,26,20,0.88)",
            color: "#a09880",
            backdropFilter: "blur(4px)",
          }}
        >
          {photo.attribution}
        </div>
      )}
    </a>
  );
}

export function ImageGallery({ photos, speciesName }: ImageGalleryProps) {
  if (photos.length === 0) return null;

  return (
    <div
      className="w-full"
      style={{ animation: "fade-in 0.6s ease 0.1s both" }}
    >
      <h3
        className="text-lg font-semibold mb-4"
        style={{
          fontFamily: "var(--font-fraunces)",
          color: "#c4913a",
          letterSpacing: "0.02em",
        }}
      >
        Photos of {speciesName}
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {photos.map((photo, i) => (
          <PhotoCard key={photo.url} photo={photo} index={i} />
        ))}
      </div>
      <p className="mt-3 text-xs" style={{ color: "#7a8c72" }}>
        Photos sourced from{" "}
        <a
          href="https://www.inaturalist.org"
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2 hover:text-[#c4913a] transition-colors"
        >
          iNaturalist
        </a>
        . Click any photo to view the species page.
      </p>
    </div>
  );
}
