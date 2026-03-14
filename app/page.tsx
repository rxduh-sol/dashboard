// app/page.tsx
import DashboardClient from './DashboardClient';
export const dynamic = 'force-dynamic';

export default async function Page() {
  let initialTasks = [];

  try {
    // Internal Docker bridge fetch - This happens on the server!
    const res = await fetch('http://192.168.0.177:8000/tasks', { 
      cache: 'no-store' 
    });
    
    if (res.ok) {
      initialTasks = await res.json();
    }
  } catch (error) {
    console.error("Internal fetch failed, will sync via Tailscale on client:", error);
  }

  // Pass the pre-fetched data into your preppy UI
  return <DashboardClient initialTasks={initialTasks} />;
}