"use client";

import { useState, useEffect, useRef } from "react";

interface UseTypewriterOptions {
  text: string;
  speed?: number;
  onDone?: () => void;
}

export function useTypewriter({
  text,
  speed = 40,
  onDone,
}: UseTypewriterOptions) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);
  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);
  const indexRef = useRef(0);
  const onDoneCalledRef = useRef(false);

  useEffect(() => {
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduced) {
      setDisplayed(text);
      setDone(true);
      return;
    }

    indexRef.current = 0;
    onDoneCalledRef.current = false;
    setDisplayed("");
    setDone(false);

    const msPerChar = 1000 / speed;

    function tick(timestamp: number) {
      if (lastTimeRef.current === null) {
        lastTimeRef.current = timestamp;
      }

      const elapsed = timestamp - lastTimeRef.current;
      const charsToAdd = Math.floor(elapsed / msPerChar);

      if (charsToAdd > 0) {
        indexRef.current = Math.min(
          indexRef.current + charsToAdd,
          text.length
        );
        setDisplayed(text.slice(0, indexRef.current));
        lastTimeRef.current = timestamp - (elapsed % msPerChar);
      }

      if (indexRef.current < text.length) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setDone(true);
      }
    }

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      lastTimeRef.current = null;
    };
  }, [text, speed]);

  useEffect(() => {
    if (done && !onDoneCalledRef.current && onDone) {
      onDoneCalledRef.current = true;
      onDone();
    }
  }, [done, onDone]);

  return { displayed, done };
}
