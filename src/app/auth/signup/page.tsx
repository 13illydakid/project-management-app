"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignUpPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    if (res.ok) {
      setSuccess(true);
      setTimeout(() => router.push("/auth/signin"), 1500);
    } else {
      const data = await res.json();
      setError(data.error || "Sign up failed");
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-600 via-purple-600 to-cyan-500 animate-[pulse_12s_ease-in-out_infinite]" />
      <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-white/10 blur-3xl" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-black/10 blur-3xl" />
      <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-sm backdrop-blur-xl bg-white/20 border border-white/30 rounded-2xl p-8 shadow-2xl text-white flex flex-col gap-4"
        >
          <h2 className="text-2xl font-extrabold tracking-tight">
            Create account
          </h2>
          <p className="text-sm text-white/80 -mt-2">Sign up to get started</p>
          <label
            htmlFor="name"
            className="text-xs uppercase tracking-wide text-white/80"
          >
            Name
          </label>
          <input
            id="name"
            type="text"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-white/20 border border-white/30 rounded-lg px-3 py-2 placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-cyan-300"
            required
          />
          <label
            htmlFor="email"
            className="text-xs uppercase tracking-wide text-white/80"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-white/20 border border-white/30 rounded-lg px-3 py-2 placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-cyan-300"
            required
          />
          <label
            htmlFor="password"
            className="text-xs uppercase tracking-wide text-white/80"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-white/20 border border-white/30 rounded-lg px-3 py-2 placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-cyan-300"
            required
          />
          {error && <div className="text-red-200 text-sm">{error}</div>}
          {success && (
            <div className="text-green-200 text-sm">
              Sign up successful! Redirecting...
            </div>
          )}
          <button
            type="submit"
            className="mt-2 bg-gradient-to-r from-fuchsia-500 to-cyan-500 text-white py-2 rounded-lg font-semibold shadow-lg hover:from-fuchsia-600 hover:to-cyan-600"
          >
            Sign Up
          </button>
          <div className="flex flex-col items-center gap-1 mt-3">
            <span className="text-xs text-white/80">
              Already have an account?
            </span>
            <a
              href="/auth/signin"
              className="bg-white/20 border border-white/30 text-white py-2 px-4 rounded-lg text-sm font-semibold hover:bg-white/30"
            >
              Sign In
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
