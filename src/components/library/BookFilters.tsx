"use client";

import { useState } from "react";
import Link from "next/link";

interface Book {
  slug: string;
  title: string;
  author: string;
  category: string;
  status: string;
  summary: string;
  note: string;
  coverUrl: string | null;
}

interface BookFiltersProps {
  books: Book[];
}

export function BookFilters({ books }: BookFiltersProps) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeStatus, setActiveStatus] = useState<string | null>(null);

  const categories = Array.from(new Set(books.map((b) => b.category))).sort();
  const statuses = ["reading", "finished", "shelved"];

  const filtered = books.filter((book) => {
    const matchesSearch =
      !search ||
      book.title.toLowerCase().includes(search.toLowerCase()) ||
      book.author.toLowerCase().includes(search.toLowerCase()) ||
      book.category.toLowerCase().includes(search.toLowerCase());

    const matchesCategory = !activeCategory || book.category === activeCategory;
    const matchesStatus = !activeStatus || book.status === activeStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

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
        opacity: isActive ? 1 : 0.5,
        borderBottom: isActive
          ? "1px solid var(--neutral-on-background-strong)"
          : "1px solid transparent",
      }}
    >
      {label}
    </button>
  );

  return (
    <div style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
      <style>{`
        .book-filters {
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
          align-items: center;
        }
        @media (max-width: 640px) {
          .book-filters {
            gap: 10px !important;
          }
        }
      `}</style>

      {/* Search */}
      <input
        type="text"
        placeholder="Search books..."
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
        className="book-filters"
        style={{
          padding: "16px 0",
          borderBottom: "1px solid var(--neutral-alpha-weak)",
        }}
      >
        {filterBtn("all", !activeCategory && !activeStatus, () => {
          setActiveCategory(null);
          setActiveStatus(null);
        })}

        <span style={{ color: "var(--neutral-alpha-medium)", fontSize: "12px" }}>|</span>

        {categories.map((cat) =>
          filterBtn(cat.toLowerCase(), activeCategory === cat, () =>
            setActiveCategory(activeCategory === cat ? null : cat)
          )
        )}

        <span style={{ color: "var(--neutral-alpha-medium)", fontSize: "12px" }}>|</span>

        {statuses.map((status) =>
          filterBtn(status, activeStatus === status, () =>
            setActiveStatus(activeStatus === status ? null : status)
          )
        )}
      </div>

      {/* Book list */}
      <div style={{ marginTop: 8 }}>
        {filtered.length === 0 && (
          <p
            style={{
              padding: "32px 0",
              color: "var(--neutral-on-background-weak)",
              fontStyle: "italic",
              fontSize: "14px",
            }}
          >
            No books found.
          </p>
        )}

        {filtered.map((book, i) => (
          <Link
            key={book.slug}
            href={`/library/books/${book.slug}`}
            style={{ textDecoration: "none", display: "block" }}
          >
            <div
              style={{
                display: "flex",
                gap: "16px",
                padding: "16px 0",
                borderBottom:
                  i < filtered.length - 1
                    ? "1px solid var(--neutral-alpha-weak)"
                    : "none",
              }}
            >
              {/* Cover */}
              <div
                style={{
                  width: 48,
                  height: 68,
                  flexShrink: 0,
                  background: "var(--neutral-alpha-weak)",
                  overflow: "hidden",
                }}
              >
                {book.coverUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={book.coverUrl}
                    alt={`${book.title} by ${book.author} — book cover`}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                )}
              </div>

              {/* Details */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontFamily: "Georgia, 'Times New Roman', serif",
                    fontSize: "15px",
                    color: "var(--neutral-on-background-strong)",
                    lineHeight: 1.4,
                  }}
                >
                  {book.title}
                </div>
                <div
                  style={{
                    fontFamily: "Georgia, 'Times New Roman', serif",
                    fontSize: "13px",
                    color: "var(--neutral-on-background-weak)",
                    opacity: 0.6,
                    marginTop: 2,
                  }}
                >
                  {book.author}
                  <span
                    style={{
                      fontFamily: "var(--font-code)",
                      fontSize: "11px",
                      marginLeft: 12,
                      opacity: 0.7,
                    }}
                  >
                    {book.category.toLowerCase()}
                  </span>
                </div>
                {book.note && (
                  <p
                    style={{
                      fontFamily: "Georgia, 'Times New Roman', serif",
                      fontSize: "13px",
                      color: "var(--neutral-on-background-weak)",
                      lineHeight: 1.5,
                      margin: "6px 0 0 0",
                      fontStyle: "italic",
                      opacity: 0.7,
                    }}
                  >
                    {book.note}
                  </p>
                )}
              </div>
            </div>
          </Link>
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
        {filtered.length} {filtered.length === 1 ? "book" : "books"}
      </div>
    </div>
  );
}
