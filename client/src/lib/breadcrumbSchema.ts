/**
 * Breadcrumb Schema Generator
 * Creates schema.org BreadcrumbList markup for SEO
 * Helps search engines understand site structure and improves navigation
 */

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export function generateBreadcrumbSchema(items: BreadcrumbItem[]): string {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": `https://www.rockinrockinboogie.com${item.url}`
    }))
  };

  return JSON.stringify(schema);
}

export function injectBreadcrumbSchema(items: BreadcrumbItem[]): void {
  const schema = generateBreadcrumbSchema(items);
  
  let script = document.querySelector('script[data-breadcrumb="true"]');
  if (!script) {
    script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-breadcrumb', 'true');
    document.head.appendChild(script);
  }
  script.textContent = schema;
}

// Common breadcrumb paths for RRB pages
export const breadcrumbPaths = {
  littleRichardBiography: [
    { name: 'Home', url: '/' },
    { name: 'The Legacy', url: '/rrb/the-legacy' },
    { name: 'Little Richard Biography', url: '/rrb/little-richard-biography' }
  ],
  littleRichardFAQ: [
    { name: 'Home', url: '/' },
    { name: 'The Legacy', url: '/rrb/the-legacy' },
    { name: 'Little Richard FAQ', url: '/rrb/little-richard-faq' }
  ],
  littleRichardConnection: [
    { name: 'Home', url: '/' },
    { name: 'The Legacy', url: '/rrb/the-legacy' },
    { name: 'Little Richard Connection', url: '/rrb/little-richard-connection' }
  ],
  candyThroughTheYears: [
    { name: 'Home', url: '/' },
    { name: 'The Legacy', url: '/rrb/the-legacy' },
    { name: 'Candy Through the Years', url: '/rrb/candy-through-the-years' }
  ],
  radioStation: [
    { name: 'Home', url: '/' },
    { name: 'Music & Radio', url: '/rrb/the-music' },
    { name: 'Radio Station', url: '/rrb/radio-station' }
  ],
  theMusic: [
    { name: 'Home', url: '/' },
    { name: 'Music & Radio', url: '/rrb/the-music' }
  ],
  theMusic71to80: [
    { name: 'Home', url: '/' },
    { name: 'Music & Radio', url: '/rrb/the-music' },
    { name: 'Little Richard & Candy (1971-1980)', url: '/rrb/little-richard-biography' }
  ]
};
