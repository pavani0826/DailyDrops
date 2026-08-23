import React, { useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import { Droplets } from 'lucide-react';

export const AuthScreen: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (isSignUp) {
    const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name: name || email.split('@')[0] },
        },
      });
      if (signUpError) {
        setError(signUpError.message);
        setLoading(false);
        return;
      }
  
    } else {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signInError) {
        setError(signInError.message);
        setLoading(false);
        return;
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-sky-50 to-white px-5">
      <div className="max-w-sm w-full">
        <div className="flex flex-col items-center mb-8">
          <Droplets className="w-10 h-10 text-blue-500 mb-2" />
          <h1 className="text-2xl font-black text-blue-950">Daily Drop</h1>
          <p className="text-slate-400 text-sm">{isSignUp ? 'Create your account' : 'Welcome back'}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {isSignUp && (
            <input
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm"
            />
          )}
          <input
            type="email"
            placeholder="Email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm"
          />
          <input
            type="password"
            placeholder="Password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm"
          />

          {error && <p className="text-red-500 text-xs">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-2xl font-bold text-sm disabled:opacity-50"
          >
            {loading ? 'Please wait...' : isSignUp ? 'Sign Up' : 'Log In'}
          </button>
        </form>

        <button
          onClick={() => setIsSignUp(!isSignUp)}
          className="w-full text-center text-xs text-slate-400 mt-4"
        >
          {isSignUp ? 'Already have an account? Log in' : "Don't have an account? Sign up"}
        </button>
      </div>
    </div>
  );
};