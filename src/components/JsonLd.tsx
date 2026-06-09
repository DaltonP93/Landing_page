import site from '@/data/site.json';
import products from '@/data/products.json';

const base = (site.company.siteUrl || 'https://www.tudominio.com.py').replace(/\/$/, '');

/** Datos estructurados (schema.org) para rich results en Google. */
export default function JsonLd() {
  const organization = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: site.company.name,
    url: base,
    email: site.company.email,
    telephone: site.company.phone,
    description: site.company.description,
    address: { '@type': 'PostalAddress', addressLocality: site.company.address, addressCountry: 'PY' },
    sameAs: Object.values(site.footer.socialLinks).filter((u) => u && u !== '#'),
  };

  const itemList = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: products.map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'Product',
        name: p.name,
        description: p.description,
        url: `${base}/producto/${p.id}`,
        ...(p.image ? { image: p.image.startsWith('http') ? p.image : `${base}${p.image}` } : {}),
        offers: {
          '@type': 'Offer',
          price: p.pricing.monthly,
          priceCurrency: p.pricing.currency || 'PYG',
          availability: 'https://schema.org/InStock',
          url: `${base}/contratar/${p.id}`,
        },
      },
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organization) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemList) }} />
    </>
  );
}
