'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useSession, signOut } from 'next-auth/react';
import { LogOut, User, LayoutDashboard, Phone } from 'lucide-react';
import styles from './Layout.module.css';

export default function Header() {
    const { data: session } = useSession();

    return (
        <header className={styles.header}>
            <div className={`container ${styles.headerContainer}`}>

                {/* Scaled Logo */}
                <Link href="/" className={styles.logoLink}>
                    <Image
                        src="/logo.png"
                        alt="Eagle Search Naija"
                        width={800}
                        height={200}
                        className={styles.logoImage}
                        priority
                    />
                </Link>

                {/* Controls */}
                <div className={styles.rightSide}>
                    {!session ? (
                        <>
                            <Link href="/add-business" className={styles.addBizBtn}>
                                + Add Business
                            </Link>
                            <Link href="/login" className={styles.loginLink}>
                                Login
                            </Link>
                            <div className={styles.support}>
                                <span className={styles.supportLabel}>Support</span>
                                <a href="tel:+2348000000000" className={styles.phone}><Phone size={14} /> +234 800 000 0000</a>
                            </div>
                        </>
                    ) : (
                        <div className={styles.userControls}>
                            <Link href="/" className={styles.homeLink}>
                                <Phone size={18} /> Home
                            </Link>
                            {/* @ts-ignore */}
                            {session.user.role === 'ADMIN' && (
                                <Link href="/admin" className={styles.dashboardBtn}>
                                    <LayoutDashboard size={18} /> Admin Panel
                                </Link>
                            )}
                            {/* @ts-ignore */}
                            {session.user.role === 'BUSINESS' && (
                                <Link href="/dashboard" className={styles.dashboardBtn}>
                                    <LayoutDashboard size={18} /> Dashboard
                                </Link>
                            )}
                            <div className={styles.userInfo}>
                                <User size={18} />
                                <span>{session?.user?.name || session?.user?.email || 'User'}</span>
                            </div>
                            <button onClick={() => signOut()} className={styles.logoutBtn}>
                                <LogOut size={18} /> Logout
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
