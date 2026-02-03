'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Loader2, Calendar, Clock, User, Phone, CheckCircle } from 'lucide-react';

export default function CalendarPage() {
    const { data: session } = useSession();
    const [appointments, setAppointments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch bookings for the business
        // Assuming we find the business via search trick or API update
        // I'll stick to the "first business" assumption for MVP dashboard
        const fetchBookings = async () => {
            const resBiz = await fetch('/api/businesses/search?q=Eko&limit=1'); // Reusing dashboard logic
            const dataBiz = await resBiz.json();

            if (dataBiz.length > 0) {
                const bizId = dataBiz[0].id; // In real app, /api/user/business
                const res = await fetch(`/api/bookings?businessId=${bizId}`);
                if (res.ok) {
                    setAppointments(await res.json());
                }
            }
            setLoading(false);
        };
        fetchBookings();
    }, []);

    if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}><Loader2 className="animate-spin" /></div>;

    const upcoming = appointments.filter(a => new Date(a.date) >= new Date());
    const past = appointments.filter(a => new Date(a.date) < new Date());

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Calendar color="#008751" /> Appointment Calendar
            </h1>

            <div style={{ display: 'grid', gap: '20px' }}>
                <div style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #eee' }}>
                    <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '15px' }}>Upcoming ({upcoming.length})</h2>
                    {upcoming.length === 0 ? <p style={{ color: '#666' }}>No upcoming appointments.</p> : (
                        <div style={{ display: 'grid', gap: '10px' }}>
                            {upcoming.map(app => (
                                <BookingCard key={app.id} appointment={app} />
                            ))}
                        </div>
                    )}
                </div>

                <div style={{ opacity: 0.7 }}>
                    <h2 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '15px', color: '#666' }}>Past History</h2>
                    {past.length === 0 ? <p style={{ color: '#666' }}>No history.</p> : (
                        <div style={{ display: 'grid', gap: '10px' }}>
                            {past.map(app => (
                                <BookingCard key={app.id} appointment={app} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function BookingCard({ appointment }: { appointment: any }) {
    return (
        <div style={{
            background: '#f9fafb', padding: '15px', borderRadius: '8px',
            borderLeft: '4px solid #008751', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
            <div>
                <div style={{ fontWeight: '700', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {new Date(appointment.date).toLocaleDateString()}
                    <span style={{ fontWeight: '400', fontSize: '14px', color: '#555' }}>
                        at {new Date(appointment.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                </div>
                <div style={{ display: 'flex', gap: '15px', marginTop: '8px', fontSize: '14px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <User size={14} /> {appointment.user.name}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <Phone size={14} /> {appointment.user.email}
                    </span>
                </div>
                {appointment.notes && (
                    <div style={{ marginTop: '8px', fontSize: '13px', color: '#666', fontStyle: 'italic' }}>
                        "{appointment.notes}"
                    </div>
                )}
            </div>
            <div>
                <span style={{
                    background: '#dcfce7', color: '#166534', padding: '4px 8px',
                    borderRadius: '12px', fontSize: '12px', fontWeight: '600'
                }}>
                    {appointment.status}
                </span>
            </div>
        </div>
    );
}
