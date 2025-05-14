'use client';

import dynamic from 'next/dynamic';

// Import SimulatorLayout with client-side only rendering
const SimulatorLayout = dynamic(() => import('./components/SimulatorLayout'), {
  ssr: false,
});

export default function Home() {
  return (
    <main>
      <SimulatorLayout />
    </main>
  );
}
