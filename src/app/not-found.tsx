
import Link from 'next/link'
import { MapPinOff } from 'lucide-react'

export default function NotFound() {
    return (
        <div style={{ height: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '20px' }}>
            <div style={{ background: '#f3f4f6', padding: '30px', borderRadius: '50%', marginBottom: '20px' }}>
                <MapPinOff size={60} color="#9ca3af" />
            </div>
            <h2 style={{ fontSize: '30px', fontWeight: 'bold', marginBottom: '10px' }}>404 - Page Not Found</h2>
            <p style={{ color: '#666', marginBottom: '30px', maxWidth: '400px' }}>
                We searched high and low, but the page you are looking for does not exist.
            </p>
            <Link href="/" style={{ background: '#008751', color: 'white', padding: '12px 24px', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold' }}>
                Return to Safety
            </Link>
        </div>
    )
}
