"use client";

import { formatDate } from "@/utils/formatDate";
import Link from "next/link";

interface PostProps {
  post: {
    slug: string;
    metadata: {
      title: string;
      publishedAt: string;
    };
  };
  thumbnail?: boolean;
  direction?: "row" | "column";
}

export default function Post({ post }: PostProps) {
  return (
    <Link href={`/blog/${post.slug}`} style={{ textDecoration: "none", display: "block" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          gap: "16px",
          padding: "16px 0",
          borderBottom: "1px solid var(--neutral-alpha-weak)",
          cursor: "pointer",
        }}
      >
        <span
          style={{
            fontFamily: "Georgia, 'Times New Roman', serif",
            fontSize: "15px",
            color: "var(--neutral-on-background-strong)",
            lineHeight: 1.4,
          }}
        >
          {post.metadata.title}
        </span>
        <span
          style={{
            fontFamily: "var(--font-code)",
            fontSize: "11px",
            color: "var(--neutral-on-background-weak)",
            opacity: 0.4,
            whiteSpace: "nowrap",
            flexShrink: 0,
          }}
        >
          {formatDate(post.metadata.publishedAt, false)}
        </span>
      </div>
    </Link>
  );
}
