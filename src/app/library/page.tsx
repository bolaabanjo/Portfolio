import {
  Column,
  Text,
  Meta,
  Schema,
} from "@once-ui-system/core";
import { baseURL, library, person, about } from "@/resources";
import { getPosts } from "@/utils/utils";
import { ArchiveIndex } from "@/components/library/ArchiveIndex";

export async function generateMetadata() {
  return Meta.generate({
    title: library.title,
    description: library.description,
    baseURL: baseURL,
    image: `/api/og/generate?title=${encodeURIComponent(library.title)}`,
    path: library.path,
  });
}

export default function Library() {
  const posts = getPosts(["src", "app", "library", "entries"]);

  const entries = posts
    .map((post) => ({
      slug: post.slug,
      id: post.metadata.id ?? 0,
      title: post.metadata.title,
      summary: post.metadata.summary,
      publishedAt: post.metadata.publishedAt,
      category: post.metadata.category || "Uncategorized",
      type: post.metadata.type || "note",
      status: post.metadata.status || "ongoing",
      tags: Array.isArray(post.metadata.tag)
        ? post.metadata.tag
        : post.metadata.tag
          ? [post.metadata.tag]
          : [],
    }));

  return (
    <Column style={{ maxWidth: 720 }} gap="l" paddingY="12" horizontal="center">
      <Schema
        as="webPage"
        baseURL={baseURL}
        path={library.path}
        title={library.title}
        description={library.description}
        image={`/api/og/generate?title=${encodeURIComponent(library.title)}`}
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
          Library
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
          Study notes, ongoing research, and open questions. Nothing here is finished —
          this is a living archive of work in progress.
        </Text>
      </Column>

      <Column fillWidth paddingX="l">
        <ArchiveIndex entries={entries} />
      </Column>
    </Column>
  );
}
