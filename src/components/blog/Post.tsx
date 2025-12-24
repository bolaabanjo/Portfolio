"use client";

import { Column, Row, Text } from "@once-ui-system/core";
import { formatDate } from "@/utils/formatDate";
import Link from "next/link";

interface PostProps {
  post: any;
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
        paddingY="16"
        gap="24"
        style={{
          borderBottom: "1px solid var(--neutral-alpha-weak)",
          cursor: "pointer",
        }}
        className="blog-post-row"
      >
        <Text variant="heading-strong-m" onBackground="neutral-strong">
          {post.metadata.title}
        </Text>
        <Text
          variant="body-default-s"
          onBackground="neutral-weak"
          style={{ whiteSpace: "nowrap" }}
        >
          {formatDate(post.metadata.publishedAt, false)}
        </Text>
      </Row>
    </Link>
  );
}
