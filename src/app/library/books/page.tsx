import {
  Column,
  Text,
  Row,
  SmartLink,
  Meta,
  Schema,
} from "@once-ui-system/core";
import { baseURL, person, about } from "@/resources";
import { fetchBookData } from "@/utils/openLibrary";
import { getPosts } from "@/utils/utils";
import { BookFilters } from "@/components/library/BookFilters";

const ENTRIES_PATH = ["src", "app", "library", "books", "entries"];

export async function generateMetadata() {
  return Meta.generate({
    title: `Books – ${person.name}`,
    description: `Reading shelf — books that shaped how ${person.name} thinks.`,
    baseURL: baseURL,
    image: `/api/og/generate?title=${encodeURIComponent("Books")}`,
    path: "/library/books",
  });
}

export default async function Books() {
  const posts = getPosts(ENTRIES_PATH);

  // Fetch covers from Open Library in parallel
  const bookData = await Promise.all(
    posts.map((post) => {
      const meta = post.metadata as any;
      return fetchBookData(meta.title, meta.author || "");
    })
  );

  const books = posts.map((post, i) => ({
    slug: post.slug,
    title: post.metadata.title,
    author: (post.metadata as any).author || "",
    category: post.metadata.category || "",
    status: post.metadata.status || "",
    summary: post.metadata.summary || "",
    note: (post.metadata as any).note || post.metadata.summary || "",
    coverUrl: bookData[i].coverUrl,
  }));

  return (
    <Row fillWidth horizontal="center">
      <Column
        fillWidth
        style={{ maxWidth: 680 }}
        gap="l"
        paddingY="12"
        horizontal="center"
      >
        <Schema
          as="webPage"
          baseURL={baseURL}
          path="/library/books"
          title={`Books – ${person.name}`}
          description={`Reading shelf — books that shaped how ${person.name} thinks.`}
          image={`/api/og/generate?title=${encodeURIComponent("Books")}`}
          author={{
            name: person.name,
            url: `${baseURL}${about.path}`,
            image: `${baseURL}${person.avatar}`,
          }}
        />

        {/* Breadcrumb */}
        <Column fillWidth gap="4" paddingX="l">
          <Row gap="8" vertical="center">
            <SmartLink
              href="/library"
              style={{ margin: 0, textDecoration: "none" }}
            >
              <Text variant="body-default-s" onBackground="neutral-weak">
                Library
              </Text>
            </SmartLink>
            <Text variant="body-default-s" onBackground="neutral-weak">
              /
            </Text>
          </Row>
        </Column>

        {/* Header */}
        <Column fillWidth paddingX="l" gap="8">
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
            Books
          </h1>
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
            Things I&apos;ve read, am reading, or intend to return to.
          </p>
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

        <Column fillWidth paddingX="l">
          <BookFilters books={books} />
        </Column>
      </Column>
    </Row>
  );
}
