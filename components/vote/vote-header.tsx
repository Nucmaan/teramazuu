import Image from "next/image";
import Link from "next/link";
import { X } from "lucide-react";
import logo from "@/public/images/images-4.png";

/** Top bar for the voting pages: campaign logo, wordmark and a way home. */
export function VoteHeader() {
  return (
    <header className="relative bg-white">
      <div className="mx-auto flex h-24 max-w-3xl items-center justify-between px-[var(--gutter)]">
        <Link href="/" className="flex items-center gap-3" aria-label="Taste, Click & Vote — home">
          <Image
            src={logo}
            alt="Week of the Italian Cuisine in the World"
            preload
            sizes="72px"
            className="h-[4.5rem] w-auto"
          />
          <span className="font-display text-xl leading-none tracking-[-0.01em] text-[#00592c]">
            Taste<span className="text-[#008c45]">,</span> Click <span className="italic text-[#cd212a]">&amp;</span> Vote
          </span>
        </Link>
        <Link
          href="/"
          aria-label="Leave voting and return home"
          className="-mr-2 grid size-11 place-items-center text-[#00592c]/70 transition-colors hover:text-[#00592c]"
        >
          <X className="size-5" />
        </Link>
      </div>
      <span aria-hidden className="tricolore absolute inset-x-0 bottom-0 block h-1" />
    </header>
  );
}
