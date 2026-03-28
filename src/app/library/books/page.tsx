import {
  Column,
  Text,
  Row,
  SmartLink,
  Meta,
  Schema,
} from "@once-ui-system/core";
import { baseURL, library, person, about } from "@/resources";
import { fetchBookData } from "@/utils/openLibrary";

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
  const books = library.books;

  // Fetch covers from Open Library in parallel
  const bookData = await Promise.all(
    books.map((book) => fetchBookData(book.title, book.author))
  );

  const booksWithCovers = books.map((book, i) => ({
    ...book,
    coverUrl: book.cover || bookData[i].coverUrl,
  }));

  const statuses = ["reading", "finished", "shelved"] as const;
  const statusLabel: Record<string, string> = {
    reading: "Currently reading",
    finished: "Finished",
    shelved: "Shelved",
  };

  return (
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

      {/* Book list grouped by status */}
      <Column fillWidth paddingX="l" gap="32">
        {statuses.map((status) => {
          const group = booksWithCovers.filter((b) => b.status === status);
          if (group.length === 0) return null;

          return (
            <div key={status}>
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
                {statusLabel[status]}
              </span>

              <div style={{ marginTop: 12 }}>
                {group.map((book, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      gap: "16px",
                      padding: "16px 0",
                      borderBottom:
                        i < group.length - 1
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
                        <img
                          src={book.coverUrl}
                          alt={`${book.title} cover`}
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
                ))}
              </div>
            </div>
          );
        })}
      </Column>

      {/* Footer count */}
      <Column fillWidth paddingX="l">
        <span
          style={{
            fontFamily: "var(--font-code)",
            fontSize: "11px",
            color: "var(--neutral-on-background-weak)",
            opacity: 0.4,
          }}
        >
          {books.length} {books.length === 1 ? "book" : "books"}
        </span>
      </Column>
    </Column>
  );
}
