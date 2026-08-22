import { supabase } from './supabaseClient';

// Generate a short random invite code, e.g. "DROP-7F3K9"
const generateInviteCode = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'DROP-';
  for (let i = 0; i < 5; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
};

// Create a new challenge, with the creator as the first participant
export const createChallenge = async (title: string, totalGoalL: number, userId: string) => {
  const inviteCode = generateInviteCode();

  const { data: challenge, error } = await supabase
    .from('challenges')
    .insert({ title, total_goal_l: totalGoalL, invite_code: inviteCode, created_by: userId })
    .select()
    .single();

  if (error) throw error;

  // Add creator as a participant too
  const { error: joinError } = await supabase
    .from('challenge_participants')
    .insert({ challenge_id: challenge.id, user_id: userId, contributed_l: 0 });

  if (joinError) throw joinError;

  return challenge;
};

// Join an existing challenge using its invite code
export const joinChallengeByCode = async (inviteCode: string, userId: string) => {
  const { data: challenge, error } = await supabase
    .from('challenges')
    .select('*')
    .eq('invite_code', inviteCode)
    .single();

  if (error || !challenge) throw new Error('Invalid invite code');

  const { error: joinError } = await supabase
    .from('challenge_participants')
    .insert({ challenge_id: challenge.id, user_id: userId, contributed_l: 0 });

  if (joinError) throw joinError;

  return challenge;
};

// Fetch all challenges the current user is part of, with participant details
export const getMyChallenges = async (userId: string) => {
  const { data: participantRows, error } = await supabase
    .from('challenge_participants')
    .select('challenge_id')
    .eq('user_id', userId);

  if (error || !participantRows?.length) return [];

  const challengeIds = participantRows.map((r) => r.challenge_id);

  const { data: challenges, error: challengeError } = await supabase
    .from('challenges')
    .select('*, challenge_participants(user_id, contributed_l, profiles(name))')
    .in('id', challengeIds);

  if (challengeError) throw challengeError;
  return challenges;
};

// Add contributed water (in liters) to the current user's row in a challenge
export const addContribution = async (challengeId: string, userId: string, amountL: number) => {
  const { data: existing, error: fetchError } = await supabase
    .from('challenge_participants')
    .select('contributed_l')
    .eq('challenge_id', challengeId)
    .eq('user_id', userId)
    .single();

  if (fetchError || !existing) return;

  const newTotal = Number((existing.contributed_l + amountL).toFixed(2));

  await supabase
    .from('challenge_participants')
    .update({ contributed_l: newTotal })
    .eq('challenge_id', challengeId)
    .eq('user_id', userId);
};
// Send a nudge to a specific participant
export const sendNudge = async (
  challengeId: string,
  fromUserId: string,
  toUserId: string,
  message: string
) => {
  const { error } = await supabase.from('nudges').insert({
    challenge_id: challengeId,
    from_user_id: fromUserId,
    to_user_id: toUserId,
    message,
  });
  if (error) throw error;
};