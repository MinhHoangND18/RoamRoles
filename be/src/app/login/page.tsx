'use client';
import { signIn, useSession } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/admin");
    }
  }, [status, router]);

  if (status === "loading" || status === "authenticated") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f8fafc]">
        <div className="flex flex-col items-center gap-6">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-none border-4 border-blue-500/10"></div>
            <div className="absolute inset-0 rounded-none border-4 border-t-blue-600 animate-spin"></div>
          </div>
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