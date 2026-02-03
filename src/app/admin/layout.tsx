'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { LayoutDashboard, Users, ShieldCheck, CreditCard, Settings, Loader2, LogOut } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession();
    const router = useRouter();
    const pathname = usePathname();
    const [isSidebarOpen, setSidebarOpen] = useState(true);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
        } else if (status === 'authenticated') {
            // @ts-ignore
            if (session?.user?.role !== 'ADMIN') {
                router.push('/'); // Redirect unauthorized users
            }
        }
    }, [status, session, router]);

    if (status === 'loading') return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Loader2 className="animate-spin" size={40} color="#008751" /></div>;

    // @ts-ignore
    if (session?.user?.role !== 'ADMIN') return null;

    const navItems = [
        { icon: LayoutDashboard, label: 'Overview', href: '/admin' },
        { icon: ShieldCheck, label: 'Verification', href: '/admin/verification' },
        { icon: Users, label: 'Users & Business', href: '/admin/users' },
        { icon: CreditCard, label: 'Transactions', href: '/admin/payments' },
        { icon: Settings, label: 'Settings', href: '/admin/settings' },
    ];

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#f4f6f8' }}>
            {/* Sidebar */}
            <aside style={{
                width: isSidebarOpen ? '260px' : '80px',
                background: '#1a1a1a',
                color: 'white',
                padding: '20px',
                flexShrink: 0,
                transition: 'width 0.3s ease',
                position: 'fixed',
                height: '100vh',
                zIndex: 100
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '40px', padding: '0 10px' }}>
                    <div style={{ width: '32px', height: '32px', background: '#008751', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>A</div>
                    {isSidebarOpen && <span style={{ fontSize: '18px', fontWeight: '700', letterSpacing: '0.5px' }}>EAGLE <span style={{ color: '#008751' }}>ADMIN</span></span>}
                </div>

                <nav style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {navItems.map((item) => (
                        <Link key={item.href} href={item.href} style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '12px 15px',
                            borderRadius: '10px',
                            color: pathname === item.href ? '#fff' : '#888',
                            background: pathname === item.href ? '#008751' : 'transparent',
                            textDecoration: 'none',
                            transition: 'all 0.2s'
                        }}>
                            <item.icon size={20} />
                            {isSidebarOpen && <span style={{ fontSize: '14px', fontWeight: '500' }}>{item.label}</span>}
                        </Link>
                    ))}
                </nav>

                <div style={{ marginTop: 'auto', borderTop: '1px solid #333', paddingTop: '20px' }}>
                    <Link href="/" style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px 15px',
                        borderRadius: '10px',
                        color: '#e74c3c',
                        textDecoration: 'none'
                    }}>
                        <LogOut size={20} />
                        {isSidebarOpen && <span style={{ fontSize: '14px', fontWeight: '500' }}>Exit Admin</span>}
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <main style={{
                flex: 1,
                marginLeft: isSidebarOpen ? '260px' : '80px',
                padding: '30px',
                transition: 'margin 0.3s ease',
                width: '100%'
            }}>
                {children}
            </main>
        </div>
    );
}
