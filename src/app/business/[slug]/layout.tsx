import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Business Profile | 9jaSearch',
    description: 'View business details, reviews, and contact information on 9jaSearch.',
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
