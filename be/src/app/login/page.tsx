'use client';

import { signIn, useSession, signOut } from "next-auth/react";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, ArrowRight, Clock, Lock } from "lucide-react";

export default function LoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [checkStatus, setCheckStatus] = useState<'idle' | 'checking' | 'pending' | 'denied'>('idle');
  const hasCalledApi = useRef(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    const email = session?.user?.email;

    if (status === "authenticated" && email && !hasCalledApi.current) {
      hasCalledApi.current = true;

      const verifyAccess = async () => {
        setCheckStatus('checking');
        try {
          const res = await fetch(`${API_URL}/api/check-access?email=${encodeURIComponent(email)}`);

          if (!res.ok) throw new Error("Access check failed");

          const data = await res.json();
          if (data.allowed) {
            router.push("/admin");
          } else if (data.status === 'pending') {
            setCheckStatus('pending');
          } else {
            setCheckStatus('denied');
          }
        } catch (err) {
          console.error(err);
          setCheckStatus('denied');
        }
      };

      verifyAccess();
    }
  }, [status, session, router, API_URL]);

  if (status === "loading" || checkStatus === 'checking') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f8fafc]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium">Verifying access...</p>
        </div>
      </div>
    );
  }

  if (checkStatus === 'pending') {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#f8fafc]">
        <div className="max-w-md w-full bg-white p-8 border border-slate-200 shadow-sm text-center">
          <Clock className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Account Pending</h2>
          <p className="text-slate-500 mb-6">
            Account <strong>{session?.user?.email}</strong> is waiting for approval.
          </p>
          <button onClick={() => signOut()} className="text-blue-600 hover:underline">Sign out</button>
        </div>
      </div>
    );
  }

  if (checkStatus === 'denied') {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#f8fafc]">
        <div className="max-w-md w-full bg-white p-8 border border-slate-200 shadow-sm text-center">
          <Lock className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Access Denied</h2>
          <p className="text-slate-500 mb-6">You don`t have permission to access.</p>
          <button onClick={() => signOut()} className="text-blue-600 hover:underline">Sign out</button>
        </div>
      </div>
    );
  }

   return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#f8fafc] relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-400"></div>
      
      <div className="z-10 w-full max-w-[440px] px-6">
        <div className="bg-white border border-slate-200 rounded-none p-8 md:p-12 shadow-sm">
          
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 rounded-none mb-6">
              <ShieldCheck className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">
              Jobzesty<span className="text-blue-600"></span>
            </h1>
            <p className="text-slate-500 text-sm font-medium uppercase tracking-widest">Internal Content Manager</p>
          </div>

          <div className="space-y-6">
            <button 
              onClick={() => signIn('google')}
              className="group w-full relative flex items-center justify-center gap-4 bg-white border border-slate-200 hover:border-blue-400 text-slate-700 py-4 px-6 rounded-none font-bold text-[15px] transition-all duration-200 active:bg-slate-50"
            >
              <img 
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
                alt="Google" 
                className="w-5 h-5"
              />
              Continue with Google
              <ArrowRight className="w-4 h-4 opacity-40 group-hover:translate-x-1 transition-transform" />
            </button>

            <div className="space-y-4 pt-4">
              <div className="flex items-center gap-2 justify-center py-2 px-4 bg-slate-50 rounded-none border border-slate-100">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
                </span>
                <p className="text-[10px] uppercase tracking-[2px] text-slate-500 font-bold">
                  Authorized Personnel Only
                </p>
              </div>
              
              <p className="text-[12px] text-slate-400 text-center leading-relaxed">
                Please log in with your administrative email. All system activities are monitored and logged.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-center text-slate-400">
           <span className="text-[10px] font-bold tracking-[0.2em] uppercase">© 2026 ROAMROLES Production</span>
        </div>
      </div>
    </div>
  );
}