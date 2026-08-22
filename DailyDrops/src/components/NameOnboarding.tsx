import React, { useState } from 'react';

interface NameOnboardingProps {
  onComplete: (name: string) => void;
}

export default function NameOnboarding({
  onComplete,
}: NameOnboardingProps) {
  const [name, setName] = useState('');

  const handleContinue = () => {
    const trimmedName = name.trim();

    if (!trimmedName) return;

    onComplete(trimmedName);
  };

  return (
    <div className="min-h-screen bg-blue-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-[32px] p-8 shadow-xl shadow-blue-100">
        
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">💧</div>

          <h1 className="text-3xl font-black text-blue-950">
            Welcome to Daily Drop!
          </h1>

          <p className="text-slate-500 mt-2">
            First things first — what should we call you?
          </p>
        </div>

        <label className="text-sm font-bold text-blue-950 block mb-2">
          Your name
        </label>

        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleContinue();
            }
          }}
          placeholder="Enter your name"
          autoFocus
          className="w-full px-4 py-3 bg-blue-50 border border-blue-200 rounded-2xl text-blue-950 font-semibold focus:outline-none focus:border-blue-500"
        />

        <button
          onClick={handleContinue}
          disabled={!name.trim()}
          className="w-full mt-5 py-3 rounded-2xl bg-blue-500 text-white font-black disabled:opacity-40 disabled:cursor-not-allowed hover:bg-blue-600 transition"
        >
          Continue →
        </button>
      </div>
    </div>
  );
}