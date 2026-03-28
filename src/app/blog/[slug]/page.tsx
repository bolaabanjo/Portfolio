import { notFound } from "next/navigation";
import { CustomMDX, ScrollToHash } from "@/components";
import {
  Meta,
  Schema,
  Column,
  Text,
  Row,
  SmartLink,
} from "@once-ui-system/core";
import { baseURL, about, blog, person } from "@/resources";
import { formatDate } from "@/utils/formatDate";
import { getPosts } from "@/utils/utils";
import { Metadata } from "next";
import React from "react";

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  const posts = getPosts(["src", "app", "blog", "posts"]);
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string | string[] }>;
}): Promise<Metadata> {
  const routeParams = await params;
  const slugPath = Array.isArray(routeParams.slug)
    ? routeParams.slug.join("/")
    : routeParams.slug || "";

  const posts = getPosts(["src", "app", "blog", "posts"]);
  let post = posts.find((post) => post.slug === slugPath);

  if (!post) return {};

  return Meta.generate({
    title: post.metadata.title,
    description: post.metadata.summary,
    baseURL: baseURL,
    image: post.metadata.image || `/api/og/generate?title=${post.metadata.title}`,
    path: `${blog.path}/${post.slug}`,
  });
}

export default async function Blog({ params }: { params: Promise<{ slug: string | string[] }> }) {
  const routeParams = await params;
  const slugPath = Array.isArray(routeParams.slug)
    ? routeParams.slug.join("/")
    : routeParams.slug || "";

  let post = getPosts(["src", "app", "blog", "posts"]).find((post) => post.slug === slugPath);

  if (!post) {
    notFound();
  }

  const tags = Array.isArray(post.metadata.tag)
    ? post.metadata.tag
    : post.metadata.tag
      ? [post.metadata.tag]
      : [];

  return (
    <Column
      as="section"
      style={{ maxWidth: 680 }}
      gap="l"
      paddingY="12"
      horizontal="center"
    >
      <Schema
        as="blogPosting"
        baseURL={baseURL}
        path={`${blog.path}/${post.slug}`}
        title={post.metadata.title}
        description={post.metadata.summary}
        datePublished={post.metadata.publishedAt}
        dateModified={post.metadata.publishedAt}
        image={
          post.metadata.image ||
          `/api/og/generate?title=${encodeURIComponent(post.metadata.title)}`
        }
        author={{
          name: person.name,
          url: `${baseURL}${about.path}`,
          image: `${baseURL}${person.avatar}`,
        }}
      />

      {/* Breadcrumb */}
      <Column fillWidth gap="4" paddingX="l">
        <Row gap="8" vertical="center">
          <SmartLink href="/blog" style={{ margin: 0, textDecoration: "none" }}>
            <Text variant="body-default-s" onBackground="neutral-weak">
              Essays
            </Text>
          </SmartLink>
          <Text variant="body-default-s" onBackground="neutral-weak">/</Text>
        </Row>
      </Column>

      {/* Header */}
      <Column fillWidth paddingX="l" gap="8">
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
          <span
            style={{
              fontFamily: "var(--font-code)",
              fontSize: "11px",
              color: "var(--neutral-on-background-weak)",
              opacity: 0.4,
            }}
          >
            {person.name}
          </span>
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
          .essay-entry p {
            font-family: Georgia, 'Times New Roman', serif;
            font-size: 15px;
            line-height: 1.55;
            color: var(--neutral-on-background-weak);
            margin: 0 0 8px 0;
          }
          .essay-entry strong {
            color: var(--neutral-on-background-strong);
            font-weight: 500;
          }
          .essay-entry em {
            font-style: italic;
          }
          .essay-entry code {
            font-family: var(--font-code);
            background: var(--neutral-alpha-weak);
            padding: 1px 5px;
            border-radius: 2px;
            font-size: 0.9em;
          }
          .essay-entry pre {
            font-family: var(--font-code);
            background: var(--neutral-alpha-weak);
            padding: 16px;
            overflow-x: auto;
            margin: 0 0 12px 0;
            font-size: 13px;
            line-height: 1.5;
          }
          .essay-entry pre code {
            background: none;
            padding: 0;
          }
          .essay-entry ul, .essay-entry ol {
            font-family: Georgia, 'Times New Roman', serif;
            font-size: 15px;
            line-height: 1.5;
            color: var(--neutral-on-background-weak);
            padding-left: 24px;
            margin: 0 0 8px 0;
          }
          .essay-entry li {
            margin-bottom: 0;
          }
          .essay-entry blockquote {
            font-family: Georgia, 'Times New Roman', serif;
            border-left: 2px solid var(--neutral-alpha-medium);
            padding: 4px 20px;
            margin: 0 0 8px 0;
            font-style: italic;
            font-size: 15px;
            color: var(--neutral-on-background-weak);
          }
          .essay-entry hr {
            border: none;
            border-top: 1px solid var(--neutral-alpha-weak);
            margin: 16px 0;
          }
          .essay-entry a {
            color: var(--neutral-on-background-strong);
            text-decoration: underline;
            text-underline-offset: 3px;
          }
          .essay-entry pre {
            background: var(--surface-background) !important;
          }
        `}</style>
        <div className="essay-entry">
          <CustomMDX
            source={post.content}
            components={{
              h2: ({ children }: { children: React.ReactNode }) => (
                <h2 style={{
                  fontFamily: "Georgia, 'Times New Roman', serif",
                  fontSize: "18px",
                  fontWeight: 500,
                  color: "var(--neutral-on-background-strong)",
                  margin: "24px 0 6px 0",
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
                  margin: "20px 0 6px 0",
                }}>
                  {children}
                </h3>
              ),
              p: ({ children }: { children: React.ReactNode }) => (
                <p style={{
                  fontFamily: "Georgia, 'Times New Roman', serif",
                  fontSize: "15px",
                  lineHeight: 1.55,
                  color: "var(--neutral-on-background-weak)",
                  margin: "0 0 12px 0",
                }}>
                  {children}
                </p>
              ),
              ul: ({ children }: { children: React.ReactNode }) => (
                <ul style={{
                  fontFamily: "Georgia, 'Times New Roman', serif",
                  fontSize: "15px",
                  lineHeight: 1.5,
                  color: "var(--neutral-on-background-weak)",
                  paddingLeft: 24,
                  margin: "0 0 8px 0",
                }}>
                  {children}
                </ul>
              ),
              ol: ({ children }: { children: React.ReactNode }) => (
                <ol style={{
                  fontFamily: "Georgia, 'Times New Roman', serif",
                  fontSize: "15px",
                  lineHeight: 1.5,
                  color: "var(--neutral-on-background-weak)",
                  paddingLeft: 24,
                  margin: "0 0 8px 0",
                }}>
                  {children}
                </ol>
              ),
              li: ({ children }: { children: React.ReactNode }) => (
                <li style={{ marginBottom: 0 }}>{children}</li>
              ),
            } as any}
          />
        </div>
      </Column>

      <ScrollToHash />
    </Column>
  );
}
