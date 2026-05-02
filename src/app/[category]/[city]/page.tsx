import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { MapPin, Star, Phone, ChevronRight } from 'lucide-react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

interface Props {
    params: Promise<{ category: string; city: string }>;
}

/** Convert URL slug to display name: "hotels-resorts" → "Hotels Resorts" */
function slugToCategory(slug: string): string {
    return slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

function slugToCity(slug: string): string {
    return slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { category, city } = await params;
    const categoryName = slugToCategory(category);
    const cityName = slugToCity(city);

    return {
        title: `Best ${categoryName} in ${cityName} | 9jaSearch`,
        description: `Find the top-rated ${categoryName} businesses in ${cityName}, Nigeria. Browse reviews, contact details, and directions on 9jaSearch.`,
        openGraph: {
            title: `Best ${categoryName} in ${cityName} | 9jaSearch`,
            description: `Discover the best ${categoryName} in ${cityName}. Verified listings with reviews and contact info.`,
        },
    };
}

export default async function CategoryCityPage({ params }: Props) {
    const { category, city } = await params;
    const categoryName = slugToCategory(category);
    const cityName = slugToCity(city);

    // Search for businesses matching category and city (case-insensitive via contains)
    const businesses = await prisma.business.findMany({
        where: {
            isActive: true,
            OR: [
                { category: { contains: categoryName, mode: 'insensitive' } },
                // Also try the raw slug words
                { category: { contains: category.replace(/-/g, ' '), mode: 'insensitive' } },
            ],
            city: { contains: cityName, mode: 'insensitive' },
        },
        orderBy: [
            { isFeatured: 'desc' },
            { rating: 'desc' },
            { reviewCount: 'desc' },
        ],
        take: 50,
    });

    // If no results, still render the page (good for SEO)
    return (
        <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 20px' }}>
            {/* Breadcrumb */}
            <nav style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: '#666', marginBottom: '24px', flexWrap: 'wrap' }}>
                <Link href="/" style={{ color: '#008751', textDecoration: 'none', fontWeight: '600' }}>Home</Link>
                <ChevronRight size={14} />
                <Link href={`/search?q=${encodeURIComponent(categoryName)}`} style={{ color: '#008751', textDecoration: 'none', fontWeight: '600' }}>
                    {categoryName}
                </Link>
                <ChevronRight size={14} />
                <span style={{ color: '#333', fontWeight: '600' }}>{cityName}</span>
            </nav>

            {/* Hero */}
            <div style={{ marginBottom: '36px' }}>
                <h1 style={{ fontSize: '32px', fontWeight: '800', color: '#1a1a1a', marginBottom: '10px' }}>
                    Best {categoryName} in {cityName}
                </h1>
                <p style={{ fontSize: '16px', color: '#666' }}>
                    {businesses.length > 0
                        ? `${businesses.length} business${businesses.length !== 1 ? 'es' : ''} found in ${cityName}`
                        : `No businesses found yet for ${categoryName} in ${cityName}`}
                </p>
            </div>

            {businesses.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: '#888' }}>
                    <MapPin size={48} style={{ marginBottom: '16px', opacity: 0.3 }} />
                    <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px' }}>No listings yet</h3>
                    <p style={{ marginBottom: '20px' }}>Be the first to add a {categoryName} business in {cityName}.</p>
                    <Link
                        href="/add-business"
                        style={{
                            display: 'inline-block',
                            background: '#008751',
                            color: 'white',
                            padding: '12px 24px',
                            borderRadius: '8px',
                            fontWeight: '700',
                            textDecoration: 'none',
                        }}
                    >
                        Add Your Business
                    </Link>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {businesses.map((biz) => (
                        <div
                            key={biz.id}
                            style={{
                                background: 'white',
                                border: '1px solid #e8e8e8',
                                borderRadius: '12px',
                                padding: '20px 24px',
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '16px',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                                transition: 'box-shadow 0.2s',
                            }}
                        >
                            {/* Avatar */}
                            <div style={{
                                width: '52px',
                                height: '52px',
                                borderRadius: '10px',
                                background: biz.isFeatured ? 'linear-gradient(135deg, #008751, #00a86b)' : '#f0f0f0',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '22px',
                                fontWeight: '800',
                                color: biz.isFeatured ? 'white' : '#555',
                                flexShrink: 0,
                            }}>
                                {biz.name.charAt(0).toUpperCase()}
                            </div>

                            {/* Info */}
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
                                    <Link
                                        href={`/business/${biz.slug}`}
                                        style={{ fontSize: '18px', fontWeight: '700', color: '#1a1a1a', textDecoration: 'none' }}
                                    >
                                        {biz.name}
                                    </Link>
                                    {biz.isFeatured && (
                                        <span style={{ background: '#fff3cd', color: '#856404', fontSize: '11px', fontWeight: '700', padding: '2px 8px', borderRadius: '10px' }}>
                                            ⭐ Featured
                                        </span>
                                    )}
                                    {biz.isVerified && (
                                        <span style={{ background: '#d4edda', color: '#155724', fontSize: '11px', fontWeight: '700', padding: '2px 8px', borderRadius: '10px' }}>
                                            ✓ Verified
                                        </span>
                                    )}
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                                    <Star size={14} fill="#f59e0b" color="#f59e0b" />
                                    <span style={{ fontWeight: '700', fontSize: '14px' }}>{biz.rating.toFixed(1)}</span>
                                    <span style={{ fontSize: '13px', color: '#888' }}>({biz.reviewCount} reviews)</span>
                                </div>

                                {biz.description && (
                                    <p style={{ fontSize: '14px', color: '#555', margin: '0 0 8px', lineHeight: '1.5', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as any }}>
                                        {biz.description}
                                    </p>
                                )}

                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', fontSize: '13px', color: '#666' }}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <MapPin size={13} /> {biz.address}, {biz.city}
                                    </span>
                                    {biz.phone && (
                                        <a href={`tel:${biz.phone}`} style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#008751', textDecoration: 'none', fontWeight: '600' }}>
                                            <Phone size={13} /> {biz.phone}
                                        </a>
                                    )}
                                </div>
                            </div>

                            {/* CTA */}
                            <Link
                                href={`/business/${biz.slug}`}
                                style={{
                                    flexShrink: 0,
                                    background: '#008751',
                                    color: 'white',
                                    padding: '10px 18px',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    fontWeight: '700',
                                    textDecoration: 'none',
                                    whiteSpace: 'nowrap',
                                }}
                            >
                                View Details
                            </Link>
                        </div>
                    ))}
                </div>
            )}

            {/* Add business CTA */}
            <div style={{ marginTop: '48px', background: '#f0fdf4', border: '1px solid #c6f6d5', borderRadius: '16px', padding: '32px', textAlign: 'center' }}>
                <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#1a1a1a', marginBottom: '8px' }}>
                    Own a {categoryName} business in {cityName}?
                </h3>
                <p style={{ color: '#555', marginBottom: '20px' }}>Get discovered by thousands of customers searching for your services.</p>
                <Link
                    href="/add-business"
                    style={{
                        display: 'inline-block',
                        background: '#008751',
                        color: 'white',
                        padding: '12px 28px',
                        borderRadius: '8px',
                        fontWeight: '700',
                        textDecoration: 'none',
                        fontSize: '15px',
                    }}
                >
                    List Your Business Free →
                </Link>
            </div>
        </main>
    );
}
