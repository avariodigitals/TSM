"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (!result?.ok) {
      if (result?.error === "Configuration") {
        setErrorMessage("Server auth configuration is missing. Please set NEXTAUTH_SECRET and NEXTAUTH_URL.");
        return;
      }

      if (result?.error && result.error !== "CredentialsSignin") {
        setErrorMessage("Login service is temporarily unavailable. Please try again in a moment.");
        return;
      }

      setErrorMessage("Invalid login credentials.");
      return;
    }

    router.push("/admin");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
        <h1 className="text-3xl font-black text-[#231F20] mb-2">Admin Login</h1>
        <p className="text-sm text-gray-500 mb-6">Sign in to manage leads, artisan registrations, content, and settings.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-[#231F20] mb-1.5">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00AEEF]"
              placeholder="admin@totalservemaintenance.com"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#231F20] mb-1.5">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00AEEF]"
            />
          </div>

          {errorMessage ? <p className="text-sm text-[#ED1C24]">{errorMessage}</p> : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-[#2E3192] text-white font-semibold hover:bg-[#252880] disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
