import { useEffect } from 'react';

interface SEOProps {
  title: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
  structuredData?: object;
}

export default function SEO({
  title,
  description = 'ReelReview - In-depth movie reviews across Bollywood, Hollywood, South Indian cinema, Web Series, and OTT releases.',
  image,
  url,
  type = 'website',
  structuredData,
}: SEOProps) {
  useEffect(() => {
    document.title = title;

    const ensureMeta = (attr: 'name' | 'property', key: string, content: string) => {
      let el = document.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    ensureMeta('name', 'description', description);
    ensureMeta('property', 'og:title', title);
    ensureMeta('property', 'og:description', description);
    ensureMeta('property', 'og:type', type);
    ensureMeta('name', 'twitter:card', 'summary_large_image');
    ensureMeta('name', 'twitter:title', title);
    ensureMeta('name', 'twitter:description', description);

    if (image) {
      ensureMeta('property', 'og:image', image);
      ensureMeta('name', 'twitter:image', image);
    }

    if (url) {
      ensureMeta('property', 'og:url', url);
      let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
      if (!canonical) {
        canonical = document.createElement('link');
        canonical.setAttribute('rel', 'canonical');
        document.head.appendChild(canonical);
      }
      canonical.setAttribute('href', url);
    }

    let structuredEl = document.getElementById('structured-data') as HTMLScriptElement | null;
    if (structuredData) {
      if (!structuredEl) {
        structuredEl = document.createElement('script');
        structuredEl.setAttribute('type', 'application/ld+json');
        structuredEl.setAttribute('id', 'structured-data');
        document.head.appendChild(structuredEl);
      }
      structuredEl.textContent = JSON.stringify(structuredData);
    } else if (structuredEl) {
      structuredEl.remove();
    }

    return () => {
      const el = document.getElementById('structured-data');
      if (el) el.remove();
    };
  }, [title, description, image, url, type, structuredData]);

  return null;
}
