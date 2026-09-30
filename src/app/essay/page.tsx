import { Column, Row, Text, Meta, Schema } from "@once-ui-system/core";
import { Posts } from "@/components/blog/Posts";
import { baseURL, blog, person, about } from "@/resources";
import { getPosts } from "@/utils/utils";
import Link from "next/link";

export async function generateMetadata() {
  return Meta.generate({
    title: blog.title,
    description: blog.description,
    baseURL: baseURL,
    image: `/api/og/generate?title=${encodeURIComponent(blog.title)}`,
    path: blog.path,
  });
}

const PER_PAGE = 6;

export default async function Blog({
  searchParams,
}: {
  searchParams?: Promise<{ page?: string }>;
}) {
  const resolvedParams = await searchParams;
  const allBlogs = getPosts(["src", "app", "essay", "posts"]).sort((a, b) => {
    return new Date(b.metadata.publishedAt).getTime() - new Date(a.metadata.publishedAt).getTime();
  });

  const totalPages = Math.max(1, Math.ceil(allBlogs.length / PER_PAGE));
  const parsed = parseInt(resolvedParams?.page ?? "1", 10);
  const page = Number.isNaN(parsed) ? 1 : Math.min(Math.max(parsed, 1), totalPages);

  const start = (page - 1) * PER_PAGE + 1;
  const end = page * PER_PAGE;

  return (
    <Column fillWidth style={{ maxWidth: 780 }} gap="l" paddingY="12" horizontal="center">
      <Schema
        as="blogPosting"
        baseURL={baseURL}
        title={blog.title}
        description={blog.description}
        path={blog.path}
        image={`/api/og/generate?title=${encodeURIComponent(blog.title)}`}
        author={{
          name: person.name,
          url: `${baseURL}${about.path}`,
          image: `${baseURL}${person.avatar}`,
        }}
      />

      <Column fillWidth gap="8" paddingX="l">
        <h1
          style={{
            fontSize: "22px",
            fontWeight: 600,
            color: "var(--neutral-on-background-strong)",
            margin: 0,
            letterSpacing: "-0.02em",
            fontFamily: "Georgia, 'Times New Roman', serif",
          }}
        >
          Essays
        </h1>
        <Text
          variant="body-default-s"
          onBackground="neutral-weak"
          style={{
            lineHeight: 1.7,
            fontFamily: "Georgia, 'Times New Roman', serif",
            fontStyle: "italic",
          }}
        >
          {blog.description}
        </Text>
      </Column>

      <Column fillWidth paddingX="l">
        <Posts range={[start, end]} />
      </Column>

      {totalPages > 1 && (
        <Row fillWidth horizontal="between" vertical="center" paddingX="l">
          {page > 1 ? (
            <Link
              href={`/essay?page=${page - 1}`}
              style={{
                fontFamily: "var(--font-code)",
                fontSize: "11px",
                color: "var(--neutral-on-background-strong)",
                textDecoration: "none",
              }}
            >
              ← Prev
            </Link>
          ) : (
            <span
              style={{
                fontFamily: "var(--font-code)",
                fontSize: "11px",
                color: "var(--neutral-on-background-weak)",
                opacity: 0.3,
              }}
            >
              ← Prev
            </span>
          )}
          <span
            style={{
              fontFamily: "var(--font-code)",
              fontSize: "11px",
              color: "var(--neutral-on-background-weak)",
              opacity: 0.5,
            }}
          >
            {page} / {totalPages}
          </span>
          {page < totalPages ? (
            <Link
              href={`/essay?page=${page + 1}`}
              style={{
                fontFamily: "var(--font-code)",
                fontSize: "11px",
                color: "var(--neutral-on-background-strong)",
                textDecoration: "none",
              }}
            >
              Next →
            </Link>
          ) : (
            <span
              style={{
                fontFamily: "var(--font-code)",
                fontSize: "11px",
                color: "var(--neutral-on-background-weak)",
                opacity: 0.3,
              }}
            >
              Next →
            </span>
          )}
        </Row>
      )}
    </Column>
  );
}
