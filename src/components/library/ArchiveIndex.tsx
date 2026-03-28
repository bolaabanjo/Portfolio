"use client";

import { useState } from "react";
import { SmartLink } from "@once-ui-system/core";

interface ArchiveEntry {
  slug: string;
  id: number;
  title: string;
  summary: string;
  publishedAt: string;
  category: string;
  type: string;
  status: string;
  tags: string[];
}

interface ArchiveIndexProps {
  entries: ArchiveEntry[];
}

export function ArchiveIndex({ entries }: ArchiveIndexProps) {
  const [search, setSearch] = useState("");
  const [activeType, setActiveType] = useState<string | null>(null);
  const [activeStatus, setActiveStatus] = useState<string | null>(null);

  const types = Array.from(new Set(entries.map((e) => e.type))).sort();
  const statuses = Array.from(new Set(entries.map((e) => e.status))).sort();

  const filtered = entries.filter((entry) => {
    const matchesSearch =
      !search ||
      entry.title.toLowerCase().includes(search.toLowerCase()) ||
      entry.summary.toLowerCase().includes(search.toLowerCase()) ||
      entry.category.toLowerCase().includes(search.toLowerCase()) ||
      entry.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));

    const matchesType = !activeType || entry.type === activeType;
    const matchesStatus = !activeStatus || entry.status === activeStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  const sorted = [...filtered].sort((a, b) => a.id - b.id);

  const filterBtn = (
    label: string,
    isActive: boolean,
    onClick: () => void
  ) => (
    <button
      onClick={onClick}
      style={{
        padding: "2px 0",
        border: "none",
        background: "transparent",
        color: isActive
          ? "var(--neutral-on-background-strong)"
          : "var(--neutral-on-background-weak)",
        cursor: "pointer",
        fontSize: "13px",
        fontFamily: "inherit",
        textDecoration: isActive ? "none" : "none",
        opacity: isActive ? 1 : 0.5,
        borderBottom: isActive ? "1px solid var(--neutral-on-background-strong)" : "1px solid transparent",
      }}
    >
      {label}
    </button>
  );

  return (
    <div style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
      {/* Search */}
      <input
        type="text"
        placeholder="Search the archive..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          width: "100%",
          padding: "12px 0",
          background: "transparent",
          border: "none",
          borderBottom: "1px solid var(--neutral-alpha-medium)",
          color: "var(--neutral-on-background-strong)",
          fontSize: "15px",
          fontFamily: "Georgia, 'Times New Roman', serif",
          outline: "none",
          fontStyle: "italic",
        }}
      />

      {/* Filters */}
      <div
        style={{
          display: "flex",
          gap: "20px",
          padding: "16px 0",
          borderBottom: "1px solid var(--neutral-alpha-weak)",
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        {filterBtn("all", !activeType && !activeStatus, () => {
          setActiveType(null);
          setActiveStatus(null);
        })}

        <span style={{ color: "var(--neutral-alpha-medium)", fontSize: "12px" }}>|</span>

        {types.map((type) =>
          filterBtn(type, activeType === type, () =>
            setActiveType(activeType === type ? null : type)
          )
        )}

        <span style={{ color: "var(--neutral-alpha-medium)", fontSize: "12px" }}>|</span>

        {statuses.map((status) =>
          filterBtn(status, activeStatus === status, () =>
            setActiveStatus(activeStatus === status ? null : status)
          )
        )}

        <span style={{ color: "var(--neutral-alpha-medium)", fontSize: "12px" }}>|</span>

        <a
          href="/library/books"
          style={{
            padding: "2px 0",
            border: "none",
            background: "transparent",
            color: "var(--neutral-on-background-weak)",
            cursor: "pointer",
            fontSize: "13px",
            fontFamily: "inherit",
            textDecoration: "none",
            opacity: 0.5,
            borderBottom: "1px solid transparent",
          }}
        >
          books
        </a>
      </div>

      {/* Entries */}
      <div style={{ marginTop: 8 }}>
        {sorted.length === 0 && (
          <p
            style={{
              padding: "32px 0",
              color: "var(--neutral-on-background-weak)",
              fontStyle: "italic",
              fontSize: "14px",
            }}
          >
            No entries found.
          </p>
        )}

        {sorted.map((entry) => (
          <SmartLink
            key={entry.slug}
            href={`/library/${entry.slug}`}
            style={{ margin: 0, textDecoration: "none", display: "block" }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "48px 1fr auto",
                gap: "16px",
                alignItems: "baseline",
                padding: "18px 0",
                borderBottom: "1px solid var(--neutral-alpha-weak)",
              }}
            >
              {/* ID */}
              <span
                style={{
                  fontFamily: "var(--font-code)",
                  fontSize: "12px",
                  color: "var(--neutral-on-background-weak)",
                  opacity: 0.4,
                }}
              >
                {String(entry.id).padStart(3, "0")}
              </span>

              {/* Title + summary */}
              <div>
                <div
                  style={{
                    fontSize: "16px",
                    color: "var(--neutral-on-background-strong)",
                    lineHeight: 1.4,
                    marginBottom: 4,
                  }}
                >
                  {entry.title}
                </div>
                <div
                  style={{
                    fontSize: "13px",
                    color: "var(--neutral-on-background-weak)",
                    lineHeight: 1.5,
                    opacity: 0.6,
                  }}
                >
                  {entry.summary}
                </div>
              </div>

              {/* Meta labels */}
              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  alignItems: "baseline",
                  flexShrink: 0,
                  fontFamily: "var(--font-code)",
                  fontSize: "11px",
                  color: "var(--neutral-on-background-weak)",
                  opacity: 0.5,
                  whiteSpace: "nowrap",
                }}
              >
                <span>{entry.type}</span>
                <span>·</span>
                <span>{entry.category.toLowerCase()}</span>
                <span>·</span>
                <span>{entry.status}</span>
              </div>
            </div>
          </SmartLink>
        ))}
      </div>

      {/* Footer count */}
      <div
        style={{
          padding: "16px 0",
          fontFamily: "var(--font-code)",
          fontSize: "11px",
          color: "var(--neutral-on-background-weak)",
          opacity: 0.4,
        }}
      >
        {sorted.length} {sorted.length === 1 ? "entry" : "entries"}
      </div>
    </div>
  );
}
