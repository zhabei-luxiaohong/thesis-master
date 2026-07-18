'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function StartPage() {
  const router = useRouter();

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/auth/guest');
        const data = await res.json();
        if (data.token) {
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
          router.push('/dashboard');
        }
      } catch {
        router.push('/login');
      }
    })();
  }, [router]);

  return (
    <div className="h-screen bg-[#0a0e27] flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-10 h-10 text-blue-400 animate-spin mx-auto mb-4" />
        <p className="text-gray-400 text-lg">正在为你准备写作空间...</p>
      </div>
    </div>
  );
}
