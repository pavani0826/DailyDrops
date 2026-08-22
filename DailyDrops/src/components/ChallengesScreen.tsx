import React, { useState } from 'react';
import { UserProfile, Challenge } from '../types';
import { WaterSprite } from './WaterSprite';
import { CircularProgress } from './CircularProgress';
import { Send, Users, Plus, Award, CheckCircle2, Sparkles, ChevronRight, UserPlus, HeartHandshake } from 'lucide-react';
import { soundManager } from '../utils/audio';
import confetti from 'canvas-confetti';
import { supabase } from '../utils/supabaseClient';
import { createChallenge, joinChallengeByCode, sendNudge } from '../utils/challengeService';

interface ChallengesScreenProps {
  profile: UserProfile;
  challenges: Challenge[];
  onUpdateChallenges: (challenges: Challenge[]) => void;
  userId: string;
  onRefreshChallenges: () => void;
}

export const ChallengesScreen: React.FC<ChallengesScreenProps> = ({
  profile,
  challenges,
  onUpdateChallenges,
  userId,
  onRefreshChallenges,
}) => {
  const [activeChallengeIdx, setActiveChallengeIdx] = useState(0);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [nudgeSent, setNudgeSent] = useState(false);
  const [nudgeFeedback, setNudgeFeedback] = useState<string | null>(null);
  const [joinCode, setJoinCode] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [actionError, setActionError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState<'choose' | 'create' | 'join'>('choose');

  const [incomingNudge, setIncomingNudge] = useState<string | null>(null);

  React.useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel('nudges-listen')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'nudges', filter: `to_user_id=eq.${userId}` },
        (payload) => {
          setIncomingNudge(payload.new.message || 'Your buddy nudged you! 💧');
          soundManager.playNudge();
          setTimeout(() => setIncomingNudge(null), 6000);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);
  
  const handleCreateChallenge = async () => {
    if (!newTitle.trim()) {
      setActionError('Give your challenge a name');
      return;
    }
    setActionLoading(true);
    setActionError('');
    try {
      await createChallenge(newTitle.trim(), 14, userId);
      setNewTitle('');
      onRefreshChallenges();
      setShowInviteModal(false);
    } catch (err: any) {
      setActionError(err.message || 'Could not create challenge');
    }
    setActionLoading(false);
  };

  React.useEffect(() => {
    const currentChallengeId = challenges[activeChallengeIdx]?.id || challenges[0]?.id;
    if (!currentChallengeId) return;

    const channel = supabase
      .channel(`participants-${currentChallengeId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'challenge_participants',
          filter: `challenge_id=eq.${currentChallengeId}`,
        },
        () => {
          onRefreshChallenges();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [challenges[activeChallengeIdx]?.id, challenges[0]?.id]);

  const handleJoinChallenge = async () => {
    if (!joinCode.trim()) {
      setActionError('Enter an invite code');
      return;
    }
    setActionLoading(true);
    setActionError('');
    try {
      await joinChallengeByCode(joinCode.trim().toUpperCase(), userId);
      setJoinCode('');
      onRefreshChallenges();
    } catch (err: any) {
      setActionError(err.message || 'Invalid invite code');
    }
    setActionLoading(false);
  }; 

  const activeChallenge = challenges[activeChallengeIdx] || challenges[0];
  if (!activeChallenge) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-5 pb-3 select-none text-center max-w-lg mx-auto w-full">
        <Users className="w-10 h-10 text-blue-300 mb-3" />
        <h2 className="text-lg font-black text-blue-950">No active challenge</h2>
        <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-xs">
          Challenge a friend to stay hydrated together, or join one you've been invited to.
        </p>

        {onboardingStep === 'choose' && (
          <div className="w-full max-w-xs mt-5 space-y-2">
            <button
              onClick={() => setOnboardingStep('create')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Challenge a Friend</span>
            </button>
            <button
              onClick={() => setOnboardingStep('join')}
              className="w-full bg-teal-600 hover:bg-teal-700 text-white py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>Join a Challenge</span>
            </button>
          </div>
        )}

        {onboardingStep === 'create' && (
          <div className="w-full max-w-xs mt-5 space-y-2 text-left">
            <input
              type="text"
              placeholder="Challenge name (e.g. Office Hydration War)"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm"
            />
            <button
              onClick={handleCreateChallenge}
              disabled={actionLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl font-bold text-sm disabled:opacity-50"
            >
              {actionLoading ? 'Creating...' : 'Create Challenge'}
            </button>
            <button
              onClick={() => { setOnboardingStep('choose'); setActionError(''); }}
              className="w-full py-2 text-slate-400 text-xs font-semibold"
            >
              ← Back
            </button>
            {actionError && <p className="text-red-500 text-xs text-center">{actionError}</p>}
          </div>
        )}

        {onboardingStep === 'join' && (
          <div className="w-full max-w-xs mt-5 space-y-2 text-left">
           <input
              type="text"
              placeholder="Paste invite code (e.g. DROP-7F3K9)"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-mono"
            />
            <button
              onClick={handleJoinChallenge}
              disabled={actionLoading}
              className="w-full bg-teal-600 hover:bg-teal-700 text-white py-2.5 rounded-xl font-bold text-sm disabled:opacity-50"
            >
              {actionLoading ? 'Joining...' : 'Join Challenge'}
            </button>
            <button
              onClick={() => { setOnboardingStep('choose'); setActionError(''); }}
              className="w-full py-2 text-slate-400 text-xs font-semibold"
            >
              ← Back
            </button>
            {actionError && <p className="text-red-500 text-xs text-center">{actionError}</p>}
          </div>
        )}
      </div>
    );
  }
   
  const buddy = activeChallenge?.participants.find((p) => !p.isCurrentUser);

  const handleSendNudge = async () => {
    if (!buddy) return;
    soundManager.playNudge();
    setNudgeSent(true);
    try {
      await sendNudge(activeChallenge.id, userId, buddy.id, 'Stay hydrated buddy! 💧');
      setNudgeFeedback(`Nudge sent to ${buddy.name}! 💧`);
    } catch {
      setNudgeFeedback('Could not send nudge — try again.');
    }

    setTimeout(() => {
      setNudgeSent(false);
      setNudgeFeedback(null);
    }, 5000);
  };

  const remainingL = Math.max(
    0,
    Number((activeChallenge.totalSharedGoalL - activeChallenge.currentSharedL).toFixed(2))
  );

  return (
    <div className="flex-1 flex flex-col px-5 pt-2 pb-3 select-none overflow-y-auto max-w-lg mx-auto w-full">
      {/* Top Breadcrumb Header */}
      <div className="flex items-center justify-between pb-1 border-b border-blue-100/60 mb-2">
        <div className="flex items-center space-x-1 text-blue-600 text-xs font-bold cursor-pointer">
          <span>&lt; Challenges</span>
          <span className="text-blue-950 font-black ml-2 text-sm">{activeChallenge.title}</span>
        </div>
        <button
          onClick={() => setShowInviteModal(true)}
          className="text-xs bg-blue-50 text-blue-700 hover:bg-blue-100 px-3 py-1 rounded-full font-bold flex items-center gap-1 transition-colors cursor-pointer border border-blue-200/60"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>Invite</span>
        </button>
      </div>


      {/* Challenge Title & Duo Sprites Hero */}
      <div className="flex items-center justify-between mt-1">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-blue-950 tracking-tight">
            {activeChallenge.title}
          </h1>
          <p className="text-slate-400 text-xs mt-0.5 font-bold uppercase tracking-widest">{activeChallenge.dateRange}</p>
          <p className="text-blue-700 text-xs sm:text-sm font-bold mt-1 flex items-center gap-1">
            <HeartHandshake className="w-3.5 h-3.5 text-blue-500" />
            {profile.name}{buddy ? ` + ${buddy.name}` : ''}
          </p>
        </div>

        {/* Duo Sprites: You + your buddy (if joined) */}
        <div className="flex items-center -space-x-4">
          <WaterSprite
            avatar={profile.avatar}
            mood="cheering"
            size={88}
            showRipples={false}
          />
          <WaterSprite
            avatar="blue-sprite"
            mood="cheering"
            size={88}
            showRipples={false}
          />
        </div>
      </div>

      {/* Participants Card (Bento Style) */}
      <div className="mt-3 bg-white rounded-[2rem] p-4 border border-blue-100 shadow-md shadow-blue-100/40">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2.5">Participants</div>
        <div className="space-y-3">
          {activeChallenge.participants.map((p) => (
            <div key={p.id} className="flex items-center justify-between group">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center overflow-hidden">
                  <WaterSprite avatar={p.avatar} size={38} showRipples={false} />
                </div>
                <div>
                  <span className="text-xs font-black text-blue-950 block">
                    {p.name} {p.isCurrentUser && '(You)'}
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium">
                    {p.consumedL} L · {p.percentage}%
                  </span>
                </div>
              </div>

              {/* Progress bar and arrow */}
              <div className="flex items-center space-x-2 flex-1 max-w-[130px] ml-3">
                <div className="flex-1 h-2 bg-blue-50 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${p.percentage}%`,
                      backgroundColor: p.color || (p.isCurrentUser ? '#2563eb' : '#0284c7'),
                    }}
                  />
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-blue-300" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Shared Goal Circular Meter */}
      <div className="mt-3 bg-white rounded-[2rem] p-4 border border-blue-100 shadow-md shadow-blue-100/40 flex flex-col items-center justify-center">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
          {activeChallenge.totalSharedGoalL} L shared goal
        </div>

        <CircularProgress
          currentMl={activeChallenge.currentSharedL * 1000}
          goalMl={activeChallenge.totalSharedGoalL * 1000}
          size={190}
          strokeWidth={14}
          isLiters={true}
          color="#2563eb"
          badgeText={undefined}
          showDropIcon={true}
        />

        <div className="mt-3 text-center px-4">
          <p className="text-slate-600 text-xs font-medium">
            You're <span className="font-black text-blue-600">{remainingL} L</span> from the next team milestone
          </p>
          <p className="text-blue-700 text-xs font-bold mt-0.5">
            {activeChallenge.milestoneMessage}
          </p>
        </div>
      </div>

      {/* Nudge Feedback Alert */}
      {nudgeFeedback && (
        <div className="mt-2 p-2.5 rounded-2xl bg-blue-50 border border-blue-200 text-blue-900 text-xs font-semibold flex items-center justify-between animate-fade-in">
          <span>{nudgeFeedback}</span>
          <button
            onClick={() => setNudgeFeedback(null)}
            className="text-blue-500 hover:text-blue-700 ml-2 font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Incoming Nudge Alert (live from a friend) */}
      {incomingNudge && (
        <div className="mt-2 p-2.5 rounded-2xl bg-teal-50 border border-teal-200 text-teal-900 text-xs font-semibold flex items-center justify-between animate-fade-in">
          <span>💧 {incomingNudge}</span>
          <button
            onClick={() => setIncomingNudge(null)}
            className="text-teal-500 hover:text-teal-700 ml-2 font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Send a nudge Button */}
      <div className="mt-3">
        <button
          onClick={handleSendNudge}
          disabled={nudgeSent}
          className={`w-full py-3 px-4 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center space-x-2 transition-all duration-200 cursor-pointer shadow-md ${
            nudgeSent
              ? 'bg-blue-100 text-blue-700 border border-blue-300'
              : 'bg-blue-600 hover:bg-blue-700 text-white active:scale-98 shadow-blue-500/20'
          }`}
        >
          <Send className={`w-4 h-4 text-white ${nudgeSent ? 'animate-bounce' : ''}`} />
          <span>{nudgeSent ? 'Nudge flying...' : 'Send a nudge'}</span>
        </button>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full shadow-2xl border border-slate-100">
            <h3 className="text-lg font-bold text-slate-800 mb-1">Invite a Sip Buddy</h3>
            <p className="text-xs text-slate-500 mb-4">
              Challenge a friend or coworker to stay hydrated together with live cheer sync!
            </p>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/70 mb-4 flex items-center justify-between">
                <span className="font-mono font-bold text-teal-700 text-sm">{activeChallenge.inviteCode || '...'}</span>
              <button
                onClick={() => {
                  navigator.clipboard?.writeText(activeChallenge.inviteCode || '');
                  alert('Challenge link copied to clipboard!');
                }}
                className="text-xs bg-teal-600 text-white font-semibold px-2.5 py-1 rounded-lg hover:bg-teal-700"
              >
                Copy link
              </button>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => {
                  setShowInviteModal(false);
                  confetti({ particleCount: 35, spread: 60, origin: { y: 0.6 } });
                }}
                className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-xs"
              >
                Done
              </button>
              <button
                onClick={() => setShowInviteModal(false)}
                className="w-full py-2 text-slate-400 hover:text-slate-600 text-xs font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
