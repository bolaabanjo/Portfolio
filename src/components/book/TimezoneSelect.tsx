"use client";

import { type ReactNode, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import styles from "./Booking.module.scss";

type Zone = { id: string; city: string; region: string; offset: string; search: string };

type Props = {
  value: string;
  onChange: (tz: string) => void;
  disabled?: boolean;
  icon?: ReactNode;
  chevron?: ReactNode;
};

const pretty = (s: string) => s.replace(/_/g, " ");

function offsetOf(tz: string) {
  try {
    const part = new Intl.DateTimeFormat("en-US", { timeZone: tz, timeZoneName: "shortOffset" })
      .formatToParts(new Date())
      .find((p) => p.type === "timeZoneName");
    return part?.value === "GMT" ? "GMT+0" : (part?.value ?? "");
  } catch {
    return "";
  }
}

function buildZones(current: string): Zone[] {
  const ids = typeof Intl.supportedValuesOf === "function" ? Intl.supportedValuesOf("timeZone") : [];
  const all = ids.includes(current) ? ids : [current, ...ids];
  return all.map((id) => {
    const parts = id.split("/");
    const city = pretty(parts[parts.length - 1]);
    const region = pretty(parts.slice(0, -1).join(" / "));
    const offset = offsetOf(id);
    return { id, city, region, offset, search: `${id} ${city} ${region} ${offset}`.toLowerCase().replace(/[_/]/g, " ") };
  });
}

export function TimezoneSelect({ value, onChange, disabled, icon, chevron }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const listId = useId();
  // Set when the popover opens so the "keep in view" effect doesn't undo the centering.
  const skipScroll = useRef(false);

  // Built once the picker is first opened; ~400 zones is cheap.
  const zones = useMemo(() => (open ? buildZones(value) : []), [open, value]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase().replace(/[_/]/g, " ");
    if (!q) return zones;
    const terms = q.split(/\s+/);
    return zones.filter((z) =>
      terms.every((t) => {
        // "gmt+1" / "utc-5:30" match the offset exactly, so +1 doesn't also hit +10 and +11.
        const off = t.match(/^(?:gmt|utc)([+-]\d{1,2}(?::\d{2})?)$/);
        if (off) return z.offset.toLowerCase() === `gmt${off[1]}` || (off[1] === "+0" && z.offset === "GMT+0");
        return z.search.includes(t);
      }),
    );
  }, [zones, query]);

  // On open: focus search, highlight the current zone and center it in the list.
  useLayoutEffect(() => {
    if (!open) return;
    const idx = Math.max(0, zones.findIndex((z) => z.id === value));
    setActive(idx);
    inputRef.current?.focus();
    skipScroll.current = true;
    // The list isn't scrollable until it has been laid out, so center it on the next frame.
    const frame = requestAnimationFrame(() => {
      const list = listRef.current;
      const el = list?.querySelector<HTMLElement>(`[data-index="${idx}"]`);
      if (list && el) list.scrollTop = el.offsetTop - list.clientHeight / 2 + el.offsetHeight / 2;
    });
    return () => cancelAnimationFrame(frame);
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  // Keep the highlighted row visible.
  useEffect(() => {
    if (!open) return;
    if (skipScroll.current) {
      skipScroll.current = false;
      return;
    }
    const list = listRef.current;
    const el = list?.querySelector<HTMLElement>(`[data-index="${active}"]`);
    if (!list || !el) return;
    // Scroll only the list, never the page.
    const top = el.offsetTop;
    const bottom = top + el.offsetHeight;
    if (top < list.scrollTop) {
      list.scrollTop = top - 4;
    } else if (bottom > list.scrollTop + list.clientHeight) {
      list.scrollTop = bottom - list.clientHeight + 4;
    }
  }, [active, open, filtered]);

  // Close on outside click.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) close();
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  function close(refocus = false) {
    setOpen(false);
    setQuery("");
    if (refocus) triggerRef.current?.focus();
  }

  function choose(id: string) {
    onChange(id);
    close(true);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Home") {
      e.preventDefault();
      setActive(0);
    } else if (e.key === "End") {
      e.preventDefault();
      setActive(filtered.length - 1);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filtered[active]) choose(filtered[active].id);
    } else if (e.key === "Escape") {
      e.preventDefault();
      close(true);
    } else if (e.key === "Tab") {
      close();
    }
  }

  return (
    <div className={styles.tzRoot} ref={rootRef}>
      <button
        ref={triggerRef}
        type="button"
        className={`${styles.meta} ${styles.tzTrigger}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Timezone: ${pretty(value)}`}
        disabled={disabled}
        onClick={() => (open ? close() : setOpen(true))}
      >
        {icon}
        <span>{pretty(value)}</span>
        {chevron}
      </button>

      {open && (
        <div className={styles.tzPopover}>
          <div className={styles.tzSearch}>
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="7" />
              <path d="M20 20l-3.5-3.5" />
            </svg>
            <input
              ref={inputRef}
              type="text"
              role="combobox"
              aria-expanded
              aria-controls={listId}
              aria-activedescendant={filtered[active] ? `${listId}-${active}` : undefined}
              aria-autocomplete="list"
              placeholder="Search city or GMT offset"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setActive(0);
              }}
              onKeyDown={onKeyDown}
              spellCheck={false}
              autoComplete="off"
            />
          </div>
          <ul ref={listRef} id={listId} role="listbox" className={styles.tzList} aria-label="Timezones">
            {filtered.length === 0 && <li className={styles.tzEmpty}>No matching timezones</li>}
            {filtered.map((z, i) => (
              <li
                key={z.id}
                id={`${listId}-${i}`}
                data-index={i}
                role="option"
                aria-selected={z.id === value}
                className={`${styles.tzOption} ${i === active ? styles.tzActive : ""}`}
                onMouseMove={() => i !== active && setActive(i)}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => choose(z.id)}
              >
                <span className={styles.tzCheck} aria-hidden>
                  {z.id === value && (
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12.5l4.5 4.5L19 7.5" />
                    </svg>
                  )}
                </span>
                <span className={styles.tzName}>
                  {z.city}
                  {z.region && <span className={styles.tzRegion}>{z.region}</span>}
                </span>
                <span className={styles.tzOffset}>{z.offset}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
