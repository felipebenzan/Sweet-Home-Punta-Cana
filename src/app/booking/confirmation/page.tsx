'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

type Booking = {
  id: string;
  status: string;
  confirmationCode: string;
  totals: { grandTotal: number; currency: string };
  dates: { start: string; end:string };
  customer: { name: string; email: string; phone: string };
  items: {name: string, qty: number}[];
};

function ConfirmationDetails() {
  const searchParams = useSearchParams();
  const bid = searchParams.get('bid');
  const [data, setData] = useState<Booking | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!bid) return;
    (async () => {
      try {
        const res = await fetch(`/api/booking/${bid}`);
        if (!res.ok) throw new Error(await res.text());
        setData(await res.json());
      } catch (e: any) {
        setErr(e?.message || 'Failed to load booking');
      }
    })();
  }, [bid]);

  if (!bid) return <main style={{padding:24}}><p>Missing booking id.</p></main>;
  if (err) return <main style={{padding:24}}><p>Error: {err}</p></main>;
  if (!data) return <main style={{padding:24}}><p>Loading…</p></main>;

  return (
    <main style={{ padding: 24, fontFamily: 'sans-serif' }}>
      <h1>Booking Confirmed</h1>
      <p>Confirmation Code: <b>{data.confirmationCode}</b></p>
      <hr style={{margin: '1rem 0'}} />
      <div style={{display: 'grid', gridTemplateColumns: '150px 1fr', gap: '0.5rem 1rem'}}>
          <b>Booking ID:</b><span>{data.id}</span>
          <b>Status:</b><span>{data.status}</span>
          <b>Guest:</b><span>{data.customer.name}</span>
          <b>Email:</b><span>{data.customer.email}</span>
          <b>Total Paid:</b><span>{data.totals.grandTotal} {data.totals.currency}</span>
          <b>Item:</b><span>{data.items?.[0]?.name} ({data.items?.[0]?.qty}x)</span>
          <b>Date:</b><span>{data.dates.start}</span>
      </div>
    </main>
  );
}

export default function ConfirmationPage() {
  return (
    <Suspense fallback={<main style={{padding:24}}><p>Loading confirmation...</p></main>}>
      <ConfirmationDetails />
    </Suspense>
  );
}
