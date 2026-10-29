"use client";

import { useEffect, useState } from "react";

function parts(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return { days: Math.floor(s / 86400), hours: Math.floor((s % 86400) / 3600), minutes: Math.floor((s % 3600) / 60), seconds: s % 60 };
}

export function Countdown({ target }: { target: string }) {
  const end = new Date(target).getTime();
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => setNow(Date.now());
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    // Opening moment reached: reload so the server can open the ballot.
    if (now !== null && now >= end) window.location.reload();
  }, [now, end]);

  const p = parts(now === null ? 0 : end - now);
  const cells = [
    { v: p.days, l: "Days" },
    { v: p.hours, l: "Hours" },
    { v: p.minutes, l: "Minutes" },
    { v: p.seconds, l: "Seconds" },
  ];

  return (
    <div role="timer" aria-label="Time until voting opens" className="grid grid-cols-4 border-y border-espresso/15">
      {cells.map((c) => (
        <div key={c.l} className="border-r border-espresso/15 py-5 text-center last:border-r-0">
          <span className="block font-display text-[clamp(2rem,5vw,3.5rem)] tabular-nums leading-none text-espresso">
            {now === null ? "--" : String(c.v).padStart(2, "0")}
          </span>
          <span className="eyebrow mt-2 block text-[0.5625rem] text-espresso/50">{c.l}</span>
        </div>
      ))}
    </div>
  );
}
