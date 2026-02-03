'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, Calendar, User, PlusSquare } from 'lucide-react';
import { hapticImpact } from '@/lib/capacitor';
import styles from './Layout.module.css';

const navItems = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Explore', href: '/#search', icon: Search },
    { label: 'Add', href: '/add-business', icon: PlusSquare },
    { label: 'Bookings', href: '/dashboard', icon: Calendar },
    { label: 'Account', href: '/login', icon: User },
];

export default function MobileNav() {
    const pathname = usePathname();

    const handleNavClick = async () => {
        await hapticImpact();
    };

    return (
        <nav className={styles.mobileNav}>
            <div className={styles.mobileNavContainer}>
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;

                    return (
                        <Link
                            key={item.label}
                            href={item.href}
                            className={`${styles.mobileNavItem} ${isActive ? styles.activeItem : ''}`}
                            onClick={handleNavClick}
                        >
                            <Icon size={24} />
                            <span>{item.label}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
