import { getPosts } from "@/utils/utils";
import { baseURL, routes as routesConfig, gallery } from "@/resources";

export default async function sitemap() {
  const blogs = getPosts(["src", "app", "blog", "posts"]).map((post) => ({
    url: `${baseURL}/blog/${post.slug}`,
    lastModified: post.metadata.publishedAt,
  }));

  const works = getPosts(["src", "app", "work", "projects"]).map((post) => ({
    url: `${baseURL}/work/${post.slug}`,
    lastModified: post.metadata.publishedAt,
  }));

  const libraryEntries = getPosts(["src", "app", "library", "entries"]).map((post) => ({
    url: `${baseURL}/library/${post.slug}`,
    lastModified: post.metadata.publishedAt,
  }));

  const activeRoutes = Object.keys(routesConfig).filter(
    (route) => routesConfig[route as keyof typeof routesConfig],
  );

  const routes = activeRoutes.map((route) => ({
    url: `${baseURL}${route !== "/" ? route : ""}`,
    lastModified: new Date().toISOString().split("T")[0],
    ...(route === "/gallery" && {
      images: gallery.images.map((img) => `${baseURL}${img.src}`),
    }),
  }));

  const bookEntries = getPosts(["src", "app", "library", "books", "entries"]).map((post) => ({
    url: `${baseURL}/library/books/${post.slug}`,
    lastModified: new Date().toISOString().split("T")[0],
  }));

  const additionalPages = [
    {
      url: `${baseURL}/library/books`,
      lastModified: new Date().toISOString().split("T")[0],
    },
  ];

  return [...routes, ...additionalPages, ...blogs, ...works, ...libraryEntries, ...bookEntries];
}
