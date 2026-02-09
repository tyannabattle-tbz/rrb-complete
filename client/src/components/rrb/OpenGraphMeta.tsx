import { useEffect } from 'react';

interface OpenGraphMetaProps {
  title: string;
  description: string;
  image: string;
  url?: string;
  type?: 'website' | 'article' | 'music.song' | 'music.album';
}

export function OpenGraphMeta({
  title,
  description,
  image,
  url,
  type = 'website',
}: OpenGraphMetaProps) {
  useEffect(() => {
    // Update Open Graph meta tags
    const updateMetaTag = (property: string, content: string) => {
      let tag = document.querySelector(`meta[property="${property}"]`);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute('property', property);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    };

    updateMetaTag('og:title', title);
    updateMetaTag('og:description', description);
    updateMetaTag('og:image', image);
    updateMetaTag('og:type', type);

    if (url) {
      updateMetaTag('og:url', url);
    }

    // Update Twitter Card tags
    const updateTwitterTag = (name: string, content: string) => {
      let tag = document.querySelector(`meta[name="${name}"]`);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute('name', name);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    };

    updateTwitterTag('twitter:card', 'summary_large_image');
    updateTwitterTag('twitter:title', title);
    updateTwitterTag('twitter:description', description);
    updateTwitterTag('twitter:image', image);
  }, [title, description, image, url, type]);

  return null;
}
