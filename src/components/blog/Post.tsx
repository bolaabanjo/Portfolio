"use client";

import { Column, Row, Text } from "@once-ui-system/core";
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
    <Link href={`/blog/${post.slug}`} style={{ textDecoration: "none" }}>
      <Row
        fillWidth
        horizontal="between"
        vertical="center"
        paddingY="12"
        gap="16"
        style={{
          borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
          cursor: "pointer",
          transition: "opacity 150ms ease",
        }}
        className="blog-post-row"
      >
        <Text
          variant="body-default-s"
          onBackground="neutral-strong"
          style={{ fontWeight: 500 }}
        >
          {post.metadata.title}
        </Text>
        <Text
          variant="label-default-s"
          onBackground="neutral-weak"
          style={{
            whiteSpace: "nowrap",
            opacity: 0.5,
            fontSize: "0.75rem",
          }}
        >
          {formatDate(post.metadata.publishedAt, false)}
        </Text>
      </Row>
    </Link>
  );
}
