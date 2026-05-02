'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { LogOut, LayoutDashboard, Phone } from 'lucide-react';
import styles from './Layout.module.css';

export default function Header() {
    const { data: session } = useSession();

    return (
        <header className={styles.header}>
            <div className={styles.headerContainer}>
                <div style={{ flex: 1 }} />
                <div className={styles.rightSide}>
                    {!session ? (
                        <>
                            <Link href="/add-business" className={styles.addBizBtn}>
                                + Add Business
                            </Link>
                            {/* No public Login button — admin logs in via /admin-login */}
                            <a href="tel:+2348000000000" className={styles.phone}>
                                <Phone size={14} /> +234-800-0000
                            </a>
                        </>
                    ) : (
                        <>
                            {/* @ts-ignore */}
                            {session?.user?.role === 'ADMIN' && (
                                <Link href="/admin" className={styles.dashboardBtn}>
                                    <LayoutDashboard size={16} /> Admin Panel
                                </Link>
                            )}
                            {/* @ts-ignore */}
                            {session?.user?.role === 'BUSINESS' && (
                                <Link href="/dashboard" className={styles.dashboardBtn}>
                                    <LayoutDashboard size={16} /> Dashboard
                                </Link>
                            )}
                            <span className={styles.userName}>
                                {session?.user?.name || session?.user?.email}
                            </span>
                            <button onClick={() => signOut()} className={styles.logoutBtn}>
                                <LogOut size={16} /> Logout
                            </button>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}
