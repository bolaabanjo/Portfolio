import { Flex, Meta, Schema } from "@once-ui-system/core";
import GalleryView from "@/components/gallery/GalleryView";
import { baseURL, gallery, person } from "@/resources";

export async function generateMetadata() {
  return Meta.generate({
    title: gallery.title,
    description: gallery.description,
    baseURL: baseURL,
    image: `/api/og/generate?title=${encodeURIComponent(gallery.title)}`,
    path: gallery.path,
  });
}

export default function Gallery() {
  const imageSchemaData = {
    "@context": "https://schema.org",
    "@type": "ImageGallery",
    name: gallery.title,
    description: gallery.description,
    url: `${baseURL}${gallery.path}`,
    author: {
      "@type": "Person",
      name: person.name,
      url: baseURL,
    },
    image: gallery.images.map((img) => ({
      "@type": "ImageObject",
      contentUrl: `${baseURL}${img.src}`,
      name: img.alt,
      description: img.alt,
      author: {
        "@type": "Person",
        name: person.name,
      },
    })),
  };

  return (
    <Flex maxWidth="s">
      <Schema
        as="webPage"
        baseURL={baseURL}
        title={gallery.title}
        description={gallery.description}
        path={gallery.path}
        image={`/api/og/generate?title=${encodeURIComponent(gallery.title)}`}
        author={{
          name: person.name,
          url: `${baseURL}${gallery.path}`,
          image: `${baseURL}${person.avatar}`,
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(imageSchemaData) }}
      />
      <GalleryView />
    </Flex>
  );
}
