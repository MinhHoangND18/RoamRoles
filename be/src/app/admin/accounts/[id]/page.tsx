"use client";
import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Save, ArrowLeft, Loader2, User, Mail, Shield, CheckCircle2, XCircle, ChevronDown } from "lucide-react";
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

  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const statusDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        statusDropdownRef.current &&
        !statusDropdownRef.current.contains(event.target as Node)
      ) {
        setIsStatusOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const fetchAccount = async () => {
      if (isNewAccount) {
        setAccount({
          id: 0, 
          account: "",
          status: "pending",
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
        const newAccount = await createAccount(account);
        toast.success("Account created!");
        router.push(`/accounts/${newAccount.id}`);
      } else {
        await updateAccount(accountId, account);
        toast.success("Account updated!");
      }
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "An unknown error occurred");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="relative">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
          <div className="absolute inset-0 blur-xl bg-blue-400/30 animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (!account) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 md:p-8 lg:p-12">
      <div className="fixed top-0 left-0 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl -z-10"></div>
      <div className="fixed bottom-0 right-0 w-96 h-96 bg-indigo-400/10 rounded-full blur-3xl -z-10"></div>
      
      <div className=" mx-auto">
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={() => router.back()}
            className="group flex items-center gap-2 text-slate-600 hover:text-blue-600 transition-all duration-300 font-semibold text-sm"
          >
            <div className="w-8 h-8 bg-white shadow-md group-hover:shadow-lg flex items-center justify-center transition-all duration-300 group-hover:scale-110">
              <ArrowLeft className="w-4 h-4" />
            </div>
            <span className="hidden sm:inline">Back to Accounts</span>
          </button>

        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 shadow-xl">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                  <User className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">
                    {isNewAccount ? "Create New Account" : "Edit Account"}
                  </h1>
                  <p className="text-blue-100 text-sm mt-1 font-medium">
                    Manage access control and permissions
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm p-8 shadow-xl border border-white/20">
              <div className="space-y-6">
                <div className="group">
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                    <Mail className="w-4 h-4" />
                    Google Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={account.account}
                      onChange={(e) => setAccount({ ...account, account: e.target.value })}
                      className="w-full bg-white border-2 border-slate-200 px-4 py-4 text-slate-700 font-medium shadow-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-300 placeholder:text-slate-400 disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed"
                      placeholder="example@gmail.com"
                      disabled={!isNewAccount}
                    />
                    {account.account && (
                      <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-2 ml-1">
                    This email will be used for authentication and notifications
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              {/* Status Card */}
              <div className="bg-white/80 backdrop-blur-sm p-6 shadow-xl border border-white/20">
                <h3 className="text-center font-bold text-slate-700 mb-4 uppercase tracking-wide">
                  Action
                </h3>
                


                <div className="mb-6" ref={statusDropdownRef}>
                  <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">
                    Status
                  </label>
                  <div className="relative">
                    <button
                      onClick={() => setIsStatusOpen(!isStatusOpen)}
                      className="flex items-center justify-between w-full bg-white border-2 border-slate-200 px-4 py-3 text-slate-700 font-medium shadow-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-300"
                    >
                      <span className="text-left">
                        {account.status.charAt(0).toUpperCase() + account.status.slice(1)}
                      </span>
                      <ChevronDown
                        className={`w-5 h-5 transition-transform text-slate-400 ${
                          isStatusOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    {isStatusOpen && (
                      <ul className="absolute top-full mt-1 left-0 w-full bg-white border border-slate-200 shadow-lg py-1 z-20 font-medium text-sm">
                        {(["active", "pending", "inactive"] as const).map((status) => (
                          <li
                            key={status}
                            onClick={() => {
                              setAccount((prev) => (prev ? { ...prev, status: status } : null));
                              setIsStatusOpen(false);
                            }}
                            className="px-4 py-2 cursor-pointer hover:bg-blue-50 text-slate-600 hover:text-blue-600"
                          >
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>

                {/* Save Button */}
                <button
                  onClick={handleSave}
                  disabled={saving || !account.account}
                  className="group relative w-full overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-4 font-bold text-sm uppercase tracking-wide shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                  <div className="relative flex items-center justify-center gap-2">
                    {saving ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        Save Account
                      </>
                    )}
                  </div>
                </button>
              </div>

              {/* Info Card */}
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-6 border border-amber-100">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-amber-500 flex items-center justify-center flex-shrink-0 mt-1">
                    <Shield className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-amber-900 mb-2">Security Notice</h4>
                    <p className="text-xs text-amber-700 leading-relaxed">
                      Ensure you use a secure email address. All changes are logged for security purposes.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}