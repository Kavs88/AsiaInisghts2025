import Script from 'next/script'

interface StructuredDataProps {
    entity: any // flexible for now to avoid strict type deps in this micro-patch
}

export default function StructuredData({ entity }: StructuredDataProps) {
    if (!entity) return null

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'LocalBusiness',
        name: entity.name,
        description: entity.description,
        image: entity.logo_url || entity.image_url || [], // Fallback
        url: `${process.env.NEXT_PUBLIC_BASE_URL}/makers/${entity.slug}`,
        address: {
            '@type': 'PostalAddress',
            streetAddress: entity.location_text,
            addressCountry: 'VN', // Defaulting to Vietnam context for now
        },
        // We can add priceRange, telephone, etc if we have them
    }

    return (
        <Script
            id="structured-data"
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
    )
}
