"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleDemo = () => {
    setEmail("demo@demo.com");
    setPassword("demo123");
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    if (res?.error) setError("Invalid credentials");
    else window.location.href = "/";
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-600 via-purple-600 to-cyan-500 animate-[pulse_12s_ease-in-out_infinite]" />
      <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-white/10 blur-3xl" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-black/10 blur-3xl" />
      <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-sm backdrop-blur-xl bg-white/20 border border-white/30 rounded-2xl p-8 shadow-2xl text-white flex flex-col gap-4 relative"
        >
          <button
            type="button"
            onClick={handleDemo}
            className="absolute top-3 right-3 bg-white/30 hover:bg-white/40 text-white px-3 py-1 rounded-full text-xs font-semibold backdrop-blur"
            aria-label="Fill demo credentials"
          >
            demo
          </button>
          <h2 className="text-2xl font-extrabold tracking-tight">
            Welcome back
          </h2>
          <p className="text-sm text-white/80 -mt-2">Sign in to continue</p>
          <label className="text-xs uppercase tracking-wide text-white/80">
            Email
          </label>
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-white/20 border border-white/30 rounded-lg px-3 py-2 placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-cyan-300"
            required
          />
          <label className="text-xs uppercase tracking-wide text-white/80">
            Password
          </label>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-white/20 border border-white/30 rounded-lg px-3 py-2 placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-cyan-300"
            required
          />
          {error && <div className="text-red-200 text-sm">{error}</div>}
          <button
            type="submit"
            className="mt-2 bg-gradient-to-r from-fuchsia-500 to-cyan-500 text-white py-2 rounded-lg font-semibold shadow-lg hover:from-fuchsia-600 hover:to-cyan-600"
          >
            Sign In
          </button>
          <div className="flex flex-col items-center gap-1 mt-3">
            <span className="text-xs text-white/80">New User?</span>
            <a
              href="/auth/signup"
              className="bg-white/20 border border-white/30 text-white py-2 px-4 rounded-lg text-sm font-semibold hover:bg-white/30"
            >
              Sign Up
            </a>
          </div>
          <div className="text-xs text-white/70 mt-2">
            Demo: demo@demo.com / demo123
          </div>
        </form>
      </div>
    </div>
  );
}
