"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Save, ArrowLeft, Loader2, User, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";
import { Account } from "@/types";
import { getAccountById, createAccount, updateAccount } from "@/lib/api/accounts";

export default function EditAccountPage() {
  const params = useParams();
  const router = useRouter();
  const accountId = params.id as string;
  const isNewAccount = accountId === "add";

  const [account, setAccount] = useState<Account | null>(null);
  const [loading, setLoading] = useState(!isNewAccount);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchAccount = async () => {
      if (isNewAccount) {
        setAccount({
          id: 0, 
          account: "",
          status: "active",
        });
        setLoading(false);
        return;
      }

      try {
        const data = await getAccountById(accountId);
        setAccount(data);
      } catch (error) {
        console.error("Error:", error);
        toast.error("Could not load account data");
      } finally {
        setLoading(false);
      }
    };
    fetchAccount();
  }, [accountId, isNewAccount]);

  const handleSave = async () => {
    if (!account?.account) {
      toast.error("Email account is required");
      return;
    }

    setSaving(true);
    
    try {
      if (isNewAccount) {
        await createAccount(account);
        toast.success("Account created!");
      } else {
        await updateAccount(accountId, account);
        toast.success("Account updated!");
      }
      router.push("/admin?menu=accounts");
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "An unknown error occurred");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#f8fafc]">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (!account) return null;

  return (
    <div className="min-h-screen bg-[#f8fafc] p-6 md:p-12">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-all font-bold text-sm uppercase tracking-wider"
          >
            <ArrowLeft className="w-4 h-4" /> Back to list
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <div className="bg-white border border-slate-200 p-8 shadow-sm space-y-8">
              <div className="flex items-center gap-3 border-b pb-4">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    {isNewAccount ? "Add New Account" : "Edit Account"}
                  </h2>
                  <p className="text-slate-400 text-xs font-medium uppercase tracking-tight">Access Control Manager</p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[2px] mb-3 ml-1">
                    Google Email Address
                  </label>
                  <input
                    type="email"
                    value={account.account}
                    onChange={(e) => setAccount({ ...account, account: e.target.value })}
                    className="w-full bg-white border border-slate-200 p-4 text-[15px] font-bold text-slate-700 shadow-sm focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500/50 transition-all font-bold"
                    placeholder="example@gmail.com"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="md:col-span-1">
            <div className="sticky top-12 space-y-4">
              <div className="bg-white border border-slate-200 shadow-sm p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-600">Active</span>
                  <button
                    onClick={() =>
                      setAccount({
                        ...account,
                        status: account.status === "active" ? "inactive" : "active",
                      })
                    }
                    className={`relative inline-flex items-center h-6 rounded-full w-11 transition-all duration-300 ${
                      account.status === "active" ? "bg-green-500" : "bg-slate-300"
                    }`}
                  >
                    <span
                      className={`inline-block w-4 h-4 transform bg-white rounded-full transition-all duration-300 ${
                        account.status === "active" ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 font-black text-xs uppercase tracking-widest shadow-lg transition-all disabled:opacity-50"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {saving ? "Saving..." : "Save Account"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}