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
import { getPosts } from "@/utils/utils";
import { fetchBookData } from "@/utils/openLibrary";
import { Metadata } from "next";
import React from "react";

const ENTRIES_PATH = ["src", "app", "library", "books", "entries"];

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
    title: `${post.metadata.title} – Books`,
    description: post.metadata.summary,
    baseURL: baseURL,
    image: `/api/og/generate?title=${encodeURIComponent(post.metadata.title)}`,
    path: `/library/books/${post.slug}`,
  });
}

export default async function BookEntry({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPosts(ENTRIES_PATH).find((p) => p.slug === slug);

  if (!post) notFound();

  const meta = post.metadata as any;
  const bookData = await fetchBookData(meta.title, meta.author || "");

  return (
    <Row fillWidth horizontal="center">
      <Column
        as="section"
        fillWidth
        style={{ maxWidth: 680 }}
        gap="l"
        paddingY="12"
        horizontal="center"
      >
        <Schema
          as="article"
          baseURL={baseURL}
          path={`/library/books/${post.slug}`}
          title={post.metadata.title}
          description={post.metadata.summary}
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
            <SmartLink href="/library/books" style={{ margin: 0, textDecoration: "none" }}>
              <Text variant="body-default-s" onBackground="neutral-weak">
                Books
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
            {meta.title}
          </h1>

          {meta.summary && (
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
              {meta.summary}
            </p>
          )}

          <Row gap="8" vertical="center" style={{ marginTop: 4 }}>
            <span
              style={{
                fontFamily: "Georgia, 'Times New Roman', serif",
                fontSize: "13px",
                color: "var(--neutral-on-background-weak)",
                opacity: 0.6,
              }}
            >
              {meta.author}
            </span>
            <span style={{ color: "var(--neutral-on-background-weak)", opacity: 0.3, fontSize: "11px" }}>·</span>
            <span
              style={{
                fontFamily: "var(--font-code)",
                fontSize: "10px",
                color: "var(--neutral-on-background-weak)",
                opacity: 0.4,
              }}
            >
              {meta.category?.toLowerCase()}
            </span>
            <span style={{ color: "var(--neutral-on-background-weak)", opacity: 0.3, fontSize: "11px" }}>·</span>
            <span
              style={{
                fontFamily: "var(--font-code)",
                fontSize: "10px",
                color: "var(--neutral-on-background-weak)",
                opacity: 0.4,
              }}
            >
              {meta.status}
            </span>
          </Row>

          {meta.link && (
            <Row style={{ marginTop: 4 }}>
              <a
                href={meta.link}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontFamily: "var(--font-code)",
                  fontSize: "11px",
                  color: "var(--neutral-on-background-weak)",
                  textDecoration: "underline",
                  textUnderlineOffset: "3px",
                  opacity: 0.5,
                }}
              >
                Get this book →
              </a>
            </Row>
          )}
        </Column>

        {/* Cover */}
        {bookData.coverUrl && (
          <Column fillWidth paddingX="l">
            <div
              style={{
                width: 120,
                height: 170,
                overflow: "hidden",
                background: "var(--neutral-alpha-weak)",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={bookData.coverUrl}
                alt={`${meta.title} by ${meta.author} — book cover`}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            </div>
          </Column>
        )}

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
            .book-entry p {
              font-family: Georgia, 'Times New Roman', serif;
              font-size: 15px;
              line-height: 1.55;
              color: var(--neutral-on-background-weak);
              margin: 0 0 8px 0;
            }
            .book-entry strong {
              color: var(--neutral-on-background-strong);
              font-weight: 500;
            }
            .book-entry em {
              font-style: italic;
            }
            .book-entry ul, .book-entry ol {
              font-family: Georgia, 'Times New Roman', serif;
              font-size: 15px;
              line-height: 1.5;
              color: var(--neutral-on-background-weak);
              padding-left: 24px;
              margin: 0 0 8px 0;
            }
            .book-entry li {
              margin-bottom: 0;
            }
            .book-entry blockquote {
              font-family: Georgia, 'Times New Roman', serif;
              border-left: 2px solid var(--neutral-alpha-medium);
              padding: 4px 20px;
              margin: 0 0 8px 0;
              font-style: italic;
              font-size: 15px;
              color: var(--neutral-on-background-weak);
            }
            .book-entry a {
              color: var(--neutral-on-background-strong);
              text-decoration: underline;
              text-underline-offset: 3px;
            }
          `}</style>
          <div className="book-entry">
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
    </Row>
  );
}
