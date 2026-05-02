'use client';

import { useState, useEffect } from 'react';
import { Calendar, Clock, Loader2, CheckCircle, ChevronRight } from 'lucide-react';
import { useSession } from 'next-auth/react';

export default function BookingWidget({ businessId, businessName }: { businessId: string, businessName: string }) {
    const { data: session } = useSession();
    const [date, setDate] = useState('');
    const [slots, setSlots] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
    const [booking, setBooking] = useState(false);
    const [success, setSuccess] = useState(false);
    const [notes, setNotes] = useState('');
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        if (!date || !isOpen) return;
        setLoading(true);
        fetch(`/api/business/${businessId}/slots?date=${date}`)
            .then(res => res.json())
            .then(data => {
                setSlots(Array.isArray(data) ? data : []);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [date, businessId, isOpen]);

    // Set default date to today
    useEffect(() => {
        if (isOpen && !date) {
            const today = new Date().toISOString().split('T')[0];
            setDate(today);
        }
    }, [isOpen, date]);

    const handleBook = async () => {
        if (!session) {
            alert('Please login to book appointments');
            window.location.href = '/login';
            return;
        }
        if (!selectedSlot) return;

        setBooking(true);
        try {
            const res = await fetch('/api/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    businessId,
                    date: selectedSlot,
                    notes,
                    serviceName: 'General Consultation',
                    price: 0
                })
            });

            if (res.ok) {
                setSuccess(true);
            } else {
                const err = await res.json();
                alert(err.error || 'Booking failed');
            }
        } catch {
            alert('Connection error');
        }
        setBooking(false);
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                style={{
                    background: '#008751', color: 'white', border: 'none',
                    padding: '12px 24px', borderRadius: '8px', fontWeight: '600',
                    display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(0,135,81,0.2)'
                }}
            >
                <Calendar size={18} /> Book Appointment
            </button>
        );
    }

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.5)', zIndex: 1000,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
            <div style={{
                background: 'white', width: '90%', maxWidth: '450px',
                borderRadius: '16px', padding: '25px', position: 'relative',
                maxHeight: '90vh', overflowY: 'auto'
            }}>
                <button
                    onClick={() => { setIsOpen(false); setSuccess(false); setSelectedSlot(null); }}
                    style={{ position: 'absolute', top: '15px', right: '15px', border: 'none', background: 'transparent', fontSize: '20px', cursor: 'pointer' }}
                >✕</button>

                <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '5px' }}>Book Appointment</h2>
                <p style={{ color: '#666', fontSize: '14px', marginBottom: '20px' }}>with {businessName}</p>

                {success ? (
                    <div style={{ textAlign: 'center', padding: '30px 0' }}>
                        <div style={{ display: 'inline-flex', background: '#dcfce7', padding: '15px', borderRadius: '50%', marginBottom: '15px' }}>
                            <CheckCircle size={40} color="#008751" />
                        </div>
                        <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '10px' }}>Booking Confirmed!</h3>
                        <p style={{ color: '#666' }}>We have sent your request to the business.</p>
                        <button
                            onClick={() => { setIsOpen(false); setSuccess(false); setSelectedSlot(null); }}
                            style={{
                                marginTop: '20px', background: '#333', color: 'white',
                                border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: '600'
                            }}
                        >
                            Close
                        </button>
                    </div>
                ) : (
                    <>
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', fontSize: '14px' }}>Select Date</label>
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                min={new Date().toISOString().split('T')[0]}
                                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }}
                            />
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', fontSize: '14px' }}>Available Slots</label>
                            {loading ? (
                                <div style={{ textAlign: 'center', padding: '20px' }}><Loader2 className="animate-spin" /></div>
                            ) : slots.length === 0 ? (
                                <div style={{ padding: '15px', background: '#f9fafb', borderRadius: '8px', textAlign: 'center', color: '#666', fontSize: '14px' }}>
                                    No slots available for this date.
                                </div>
                            ) : (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                                    {slots.map((slot) => (
                                        <button
                                            key={slot.iso}
                                            onClick={() => setSelectedSlot(slot.iso)}
                                            style={{
                                                padding: '10px', borderRadius: '8px', border: '1px solid',
                                                borderColor: selectedSlot === slot.iso ? '#008751' : '#eee',
                                                background: selectedSlot === slot.iso ? '#f0fdf4' : 'white',
                                                color: selectedSlot === slot.iso ? '#008751' : '#333',
                                                cursor: 'pointer', fontSize: '13px', fontWeight: '500'
                                            }}
                                        >
                                            {slot.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', fontSize: '14px' }}>Notes (Optional)</label>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Any specific requirements?"
                                rows={2}
                                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }}
                            />
                        </div>

                        <button
                            onClick={handleBook}
                            disabled={!selectedSlot || booking}
                            style={{
                                width: '100%', background: !selectedSlot ? '#ccc' : '#008751',
                                color: 'white', border: 'none', padding: '14px', borderRadius: '8px',
                                fontWeight: 'bold', fontSize: '16px', cursor: !selectedSlot ? 'not-allowed' : 'pointer',
                                display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px'
                            }}
                        >
                            {booking ? <Loader2 className="animate-spin" /> : 'Confirm Booking'}
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
