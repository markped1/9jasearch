import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Business Profile | Eagle Search Naija',
    description: 'View business details, reviews, and contact information.',
};

export default function BusinessLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            {children}
        </>
    );
}
