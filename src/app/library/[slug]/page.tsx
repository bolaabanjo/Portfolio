import { notFound } from "next/navigation";
import { CustomMDX, ScrollToHash } from "@/components";
import {
  Meta,
  Schema,
  Column,
  Text,
  SmartLink,
  Row,
} from "@once-ui-system/core";
import { baseURL, person, about } from "@/resources";
import { formatDate } from "@/utils/formatDate";
import { getPosts } from "@/utils/utils";
import { Metadata } from "next";

const ENTRIES_PATH = ["src", "app", "library", "entries"];

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  return getPosts(ENTRIES_PATH).map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPosts(ENTRIES_PATH).find((p) => p.slug === slug);
  if (!post) return {};

  return Meta.generate({
    title: post.metadata.title,
    description: post.metadata.summary,
    baseURL: baseURL,
    image: `/api/og/generate?title=${encodeURIComponent(post.metadata.title)}`,
    path: `/library/${post.slug}`,
  });
}

export default async function LibraryEntry({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPosts(ENTRIES_PATH).find((p) => p.slug === slug);

  if (!post) notFound();

  const tags = Array.isArray(post.metadata.tag)
    ? post.metadata.tag
    : post.metadata.tag
      ? [post.metadata.tag]
      : [];

  const entryId = post.metadata.id
    ? String(post.metadata.id).padStart(3, "0")
    : null;

  return (
    <Column
      as="section"
      style={{ maxWidth: 680 }}
      gap="l"
      paddingY="12"
      horizontal="center"
    >
      <Schema
        as="article"
        baseURL={baseURL}
        path={`/library/${post.slug}`}
        title={post.metadata.title}
        description={post.metadata.summary}
        datePublished={post.metadata.publishedAt}
        image={`/api/og/generate?title=${encodeURIComponent(post.metadata.title)}`}
        author={{
          name: person.name,
          url: `${baseURL}${about.path}`,
          image: `${baseURL}${person.avatar}`,
        }}
      />

      {/* Breadcrumb */}
      <Column fillWidth gap="4" paddingX="l">
        <Row gap="8" vertical="center">
          <SmartLink href="/library" style={{ margin: 0, textDecoration: "none" }}>
            <Text variant="body-default-s" onBackground="neutral-weak">
              Library
            </Text>
          </SmartLink>
          <Text variant="body-default-s" onBackground="neutral-weak">/</Text>
        </Row>
      </Column>

      {/* Header */}
      <Column fillWidth paddingX="l" gap="8">
        {/* Meta line: id + type + status */}
        <Row gap="12" vertical="center">
          {entryId && (
            <span
              style={{
                fontFamily: "var(--font-code)",
                fontSize: "12px",
                color: "var(--neutral-on-background-weak)",
                opacity: 0.4,
              }}
            >
              {entryId}
            </span>
          )}
          {post.metadata.type && (
            <span
              style={{
                fontFamily: "var(--font-code)",
                fontSize: "11px",
                color: "var(--neutral-on-background-weak)",
                opacity: 0.5,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              {post.metadata.type}
            </span>
          )}
          {post.metadata.status && (
            <span
              style={{
                fontFamily: "var(--font-code)",
                fontSize: "11px",
                color: "var(--neutral-on-background-weak)",
                opacity: 0.4,
              }}
            >
              {post.metadata.status}
            </span>
          )}
        </Row>

        <h1
          style={{
            fontSize: "26px",
            fontWeight: 600,
            color: "var(--neutral-on-background-strong)",
            margin: 0,
            letterSpacing: "-0.02em",
            lineHeight: 1.3,
            fontFamily: "Georgia, 'Times New Roman', serif",
          }}
        >
          {post.metadata.title}
        </h1>

        {post.metadata.summary && (
          <p
            style={{
              fontSize: "15px",
              color: "var(--neutral-on-background-weak)",
              lineHeight: 1.6,
              margin: 0,
              fontFamily: "Georgia, 'Times New Roman', serif",
              fontStyle: "italic",
            }}
          >
            {post.metadata.summary}
          </p>
        )}

        <Row gap="16" vertical="center" style={{ marginTop: 4 }}>
          <span
            style={{
              fontFamily: "var(--font-code)",
              fontSize: "11px",
              color: "var(--neutral-on-background-weak)",
              opacity: 0.4,
            }}
          >
            {formatDate(post.metadata.publishedAt)}
          </span>
          {post.metadata.category && (
            <span
              style={{
                fontFamily: "var(--font-code)",
                fontSize: "11px",
                color: "var(--neutral-on-background-weak)",
                opacity: 0.4,
              }}
            >
              {post.metadata.category}
            </span>
          )}
        </Row>

        {tags.length > 0 && (
          <Row gap="8" wrap style={{ marginTop: 2 }}>
            {tags.map((tag) => (
              <span
                key={tag}
                style={{
                  fontFamily: "var(--font-code)",
                  fontSize: "10px",
                  padding: "1px 8px",
                  border: "1px solid var(--neutral-alpha-weak)",
                  color: "var(--neutral-on-background-weak)",
                  opacity: 0.5,
                }}
              >
                {tag}
              </span>
            ))}
          </Row>
        )}
      </Column>

      {/* Separator */}
      <div
        style={{
          width: "100%",
          height: 0,
          borderTop: "1px solid var(--neutral-alpha-weak)",
          marginLeft: 24,
          marginRight: 24,
        }}
      />

      {/* Content */}
      <Column as="article" fillWidth paddingX="l">
        <style>{`
          .archive-entry p {
            font-family: Georgia, 'Times New Roman', serif;
            font-size: 15px;
            line-height: 1.55;
            color: var(--neutral-on-background-weak);
            margin: 0 0 8px 0;
          }
          .archive-entry strong {
            color: var(--neutral-on-background-strong);
            font-weight: 500;
          }
          .archive-entry em {
            font-style: italic;
          }
          .archive-entry code {
            font-family: var(--font-code);
            background: var(--neutral-alpha-weak);
            padding: 1px 5px;
            border-radius: 2px;
            font-size: 0.9em;
          }
          .archive-entry pre {
            font-family: var(--font-code);
            background: var(--neutral-alpha-weak);
            padding: 16px;
            overflow-x: auto;
            margin: 0 0 12px 0;
            font-size: 13px;
            line-height: 1.5;
          }
          .archive-entry pre code {
            background: none;
            padding: 0;
          }
          .archive-entry ul, .archive-entry ol {
            font-family: Georgia, 'Times New Roman', serif;
            font-size: 15px;
            line-height: 1.5;
            color: var(--neutral-on-background-weak);
            padding-left: 24px;
            margin: 0 0 8px 0;
          }
          .archive-entry li {
            margin-bottom: 0;
          }
          .archive-entry blockquote {
            font-family: Georgia, 'Times New Roman', serif;
            border-left: 2px solid var(--neutral-alpha-medium);
            padding: 4px 20px;
            margin: 0 0 8px 0;
            font-style: italic;
            font-size: 15px;
            color: var(--neutral-on-background-weak);
          }
          .archive-entry hr {
            border: none;
            border-top: 1px solid var(--neutral-alpha-weak);
            margin: 16px 0;
          }
          .archive-entry a {
            color: var(--neutral-on-background-strong);
            text-decoration: underline;
            text-underline-offset: 3px;
          }
        `}</style>
        <div className="archive-entry">
          <CustomMDX
            source={post.content}
            components={{
              h2: ({ children }: { children: React.ReactNode }) => (
                <h2 style={{
                  fontFamily: "Georgia, 'Times New Roman', serif",
                  fontSize: "16px",
                  fontWeight: 500,
                  color: "var(--neutral-on-background-strong)",
                  margin: "12px 0 4px 0",
                }}>
                  {children}
                </h2>
              ),
              h3: ({ children }: { children: React.ReactNode }) => (
                <h3 style={{
                  fontFamily: "Georgia, 'Times New Roman', serif",
                  fontSize: "15px",
                  fontWeight: 500,
                  color: "var(--neutral-on-background-strong)",
                  margin: "10px 0 4px 0",
                }}>
                  {children}
                </h3>
              ),
            } as any}
          />
        </div>
      </Column>

      <ScrollToHash />
    </Column>
  );
}
