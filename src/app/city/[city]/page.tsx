import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { MapPin, Star, Building2, ChevronRight } from 'lucide-react';
import { Metadata } from 'next';

interface Props {
    params: Promise<{ city: string }>;
}

function slugToCity(slug: string): string {
    return slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { city } = await params;
    const cityName = slugToCity(city);

    return {
        title: `Businesses in ${cityName} | 9jaSearch`,
        description: `Find the best businesses in ${cityName}, Nigeria. Browse restaurants, hotels, services and more on 9jaSearch.`,
        openGraph: {
            title: `Businesses in ${cityName} | 9jaSearch`,
            description: `Discover top-rated businesses in ${cityName}. Verified listings with reviews and contact info.`,
        },
    };
}

export default async function CityPage({ params }: Props) {
    const { city } = await params;
    const cityName = slugToCity(city);

    // Fetch all active businesses in this city
    const businesses = await prisma.business.findMany({
        where: {
            isActive: true,
            city: { contains: cityName, mode: 'insensitive' },
        },
        orderBy: [
            { isFeatured: 'desc' },
            { rating: 'desc' },
            { reviewCount: 'desc' },
        ],
    });

    // Build category breakdown
    const categoryMap: Record<string, number> = {};
    businesses.forEach(biz => {
        categoryMap[biz.category] = (categoryMap[biz.category] || 0) + 1;
    });
    const categories = Object.entries(categoryMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 12);

    // Top rated businesses (top 6)
    const topRated = [...businesses]
        .filter(b => b.reviewCount > 0)
        .sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount)
        .slice(0, 6);

    function categoryToSlug(cat: string): string {
        return cat.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    }

    function cityToSlug(c: string): string {
        return c.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    }

    return (
        <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 20px' }}>
            {/* Breadcrumb */}
            <nav style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: '#666', marginBottom: '24px' }}>
                <Link href="/" style={{ color: '#008751', textDecoration: 'none', fontWeight: '600' }}>Home</Link>
                <ChevronRight size={14} />
                <span style={{ color: '#333', fontWeight: '600' }}>{cityName}</span>
            </nav>

            {/* Hero */}
            <div style={{
                background: 'linear-gradient(135deg, #008751 0%, #00a86b 100%)',
                borderRadius: '20px',
                padding: '48px 40px',
                color: 'white',
                marginBottom: '48px',
                position: 'relative',
                overflow: 'hidden',
            }}>
                <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '200px', height: '200px', background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <MapPin size={28} />
                    <h1 style={{ fontSize: '36px', fontWeight: '800', margin: 0 }}>
                        Businesses in {cityName}
                    </h1>
                </div>
                <p style={{ fontSize: '18px', opacity: 0.9, margin: '0 0 24px' }}>
                    {businesses.length} business{businesses.length !== 1 ? 'es' : ''} listed across {categories.length} categories
                </p>
                <Link
                    href={`/search?location=${encodeURIComponent(cityName)}`}
                    style={{
                        display: 'inline-block',
                        background: 'white',
                        color: '#008751',
                        padding: '12px 24px',
                        borderRadius: '8px',
                        fontWeight: '700',
                        textDecoration: 'none',
                        fontSize: '15px',
                    }}
                >
                    Search in {cityName} →
                </Link>
            </div>

            {/* Category Breakdown */}
            {categories.length > 0 && (
                <section style={{ marginBottom: '48px' }}>
                    <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#1a1a1a', marginBottom: '20px', paddingBottom: '10px', borderBottom: '2px solid #f0f0f0' }}>
                        Browse by Category
                    </h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
                        {categories.map(([cat, count]) => (
                            <Link
                                key={cat}
                                href={`/${categoryToSlug(cat)}/${cityToSlug(cityName)}`}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    background: 'white',
                                    border: '1px solid #e8e8e8',
                                    borderRadius: '10px',
                                    padding: '14px 16px',
                                    textDecoration: 'none',
                                    transition: 'border-color 0.2s, box-shadow 0.2s',
                                }}
                                onMouseEnter={(e) => {
                                    (e.currentTarget as HTMLAnchorElement).style.borderColor = '#008751';
                                    (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 2px 8px rgba(0,135,81,0.1)';
                                }}
                                onMouseLeave={(e) => {
                                    (e.currentTarget as HTMLAnchorElement).style.borderColor = '#e8e8e8';
                                    (e.currentTarget as HTMLAnchorElement).style.boxShadow = 'none';
                                }}
                            >
                                <span style={{ fontSize: '14px', fontWeight: '600', color: '#333' }}>{cat}</span>
                                <span style={{ background: '#f0fdf4', color: '#008751', fontSize: '12px', fontWeight: '700', padding: '2px 8px', borderRadius: '10px' }}>
                                    {count}
                                </span>
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            {/* Top Rated Businesses */}
            {topRated.length > 0 && (
                <section style={{ marginBottom: '48px' }}>
                    <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#1a1a1a', marginBottom: '20px', paddingBottom: '10px', borderBottom: '2px solid #f0f0f0' }}>
                        Top Rated in {cityName}
                    </h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
                        {topRated.map((biz) => (
                            <Link
                                key={biz.id}
                                href={`/business/${biz.slug}`}
                                style={{
                                    display: 'flex',
                                    gap: '14px',
                                    background: 'white',
                                    border: '1px solid #e8e8e8',
                                    borderRadius: '12px',
                                    padding: '16px',
                                    textDecoration: 'none',
                                    transition: 'box-shadow 0.2s',
                                }}
                                onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 4px 16px rgba(0,0,0,0.1)'; }}
                                onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.boxShadow = 'none'; }}
                            >
                                <div style={{
                                    width: '48px',
                                    height: '48px',
                                    borderRadius: '10px',
                                    background: 'linear-gradient(135deg, #008751, #00a86b)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '20px',
                                    fontWeight: '800',
                                    color: 'white',
                                    flexShrink: 0,
                                }}>
                                    {biz.name.charAt(0).toUpperCase()}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontWeight: '700', fontSize: '15px', color: '#1a1a1a', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {biz.name}
                                    </div>
                                    <div style={{ fontSize: '12px', color: '#888', marginBottom: '6px' }}>{biz.category}</div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <Star size={13} fill="#f59e0b" color="#f59e0b" />
                                        <span style={{ fontWeight: '700', fontSize: '13px', color: '#333' }}>{biz.rating.toFixed(1)}</span>
                                        <span style={{ fontSize: '12px', color: '#888' }}>({biz.reviewCount})</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            {businesses.length === 0 && (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: '#888' }}>
                    <Building2 size={48} style={{ marginBottom: '16px', opacity: 0.3 }} />
                    <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px' }}>No businesses listed yet in {cityName}</h3>
                    <p style={{ marginBottom: '20px' }}>Be the first to add your business here.</p>
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
            )}
        </main>
    );
}
