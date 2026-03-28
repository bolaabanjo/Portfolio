import { getPosts } from "@/utils/utils";
import { Column, Row, Text, SmartLink } from "@once-ui-system/core";

interface ProjectsProps {
  range?: [number, number?];
  exclude?: string[];
}

export function Projects({ range, exclude }: ProjectsProps) {
  let allProjects = getPosts(["src", "app", "work", "projects"]);

  if (exclude && exclude.length > 0) {
    allProjects = allProjects.filter((post) => !exclude.includes(post.slug));
  }

  const sortedProjects = allProjects.sort((a, b) => {
    return new Date(b.metadata.publishedAt).getTime() - new Date(a.metadata.publishedAt).getTime();
  });

  const displayedProjects = range
    ? sortedProjects.slice(range[0] - 1, range[1] ?? sortedProjects.length)
    : sortedProjects;

  // Group projects by year
  const grouped: Record<string, typeof displayedProjects> = {};
  for (const post of displayedProjects) {
    const year = new Date(post.metadata.publishedAt).getFullYear().toString();
    if (!grouped[year]) grouped[year] = [];
    grouped[year].push(post);
  }

  const years = Object.keys(grouped).sort((a, b) => Number(b) - Number(a));

  return (
    <Column fillWidth gap="xl" paddingX="l">
      {years.map((year) => (
        <Row key={year} fillWidth gap="xl" s={{ direction: "column" }}>
          <Text
            variant="body-default-s"
            onBackground="neutral-weak"
            style={{ minWidth: 48, flexShrink: 0, paddingTop: 2 }}
          >
            {year}
          </Text>
          <Column fillWidth gap="l">
            {grouped[year].map((post) => (
              <Column key={post.slug} fillWidth gap="4">
                <SmartLink
                  href={`/work/${post.slug}`}
                  style={{
                    margin: 0,
                    width: "fit-content",
                    textDecoration: "underline",
                    textUnderlineOffset: "3px",
                  }}
                >
                  <Text variant="heading-strong-m" onBackground="neutral-strong">
                    {post.metadata.title}
                  </Text>
                </SmartLink>
                <Text variant="body-default-s" onBackground="neutral-weak">
                  {post.metadata.summary}
                </Text>
                {post.metadata.tag && post.metadata.tag.length > 0 && (
                  <Text
                    variant="body-default-xs"
                    onBackground="neutral-weak"
                    style={{ opacity: 0.6 }}
                  >
                    {(Array.isArray(post.metadata.tag)
                      ? post.metadata.tag
                      : [post.metadata.tag]
                    ).join(", ")}
                  </Text>
                )}
              </Column>
            ))}
          </Column>
        </Row>
      ))}
    </Column>
  );
}
