import webpush from "npm:web-push@3.6.7";
import { createClient } from "npm:@supabase/supabase-js@2";

const vapidPublicKey = Deno.env.get("VAPID_PUBLIC_KEY")!;
const vapidPrivateKey = Deno.env.get("VAPID_PRIVATE_KEY")!;
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

webpush.setVapidDetails(
  "mailto:pavani180266@gmail.com",
  vapidPublicKey,
  vapidPrivateKey
);

Deno.serve(async (_req) => {
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("id, name, reminder_interval_minutes, notifications_enabled, last_reminder_sent, active_start_hour, active_end_hour");

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  const now = new Date();
  let sentCount = 0;

  for (const profile of profiles) {
    if (!profile.notifications_enabled) continue;

    // Convert UTC time to IST (UTC+5:30) since active hours are set in Indian time
    const istOffsetMinutes = 5.5 * 60;
    const istTime = new Date(now.getTime() + istOffsetMinutes * 60 * 1000);
    const currentHour = istTime.getUTCHours();
    const startHour = profile.active_start_hour ?? 8;
    const endHour = profile.active_end_hour ?? 23;

    const isWithinActiveHours = currentHour >= startHour && currentHour < endHour;
    if (!isWithinActiveHours) continue;

    const intervalMs = profile.reminder_interval_minutes * 60 * 1000;
    const lastSent = profile.last_reminder_sent ? new Date(profile.last_reminder_sent) : null;

    const isDue = !lastSent || now.getTime() - lastSent.getTime() >= intervalMs;
    if (!isDue) continue;

    const { data: sub } = await supabase
      .from("push_subscriptions")
      .select("subscription")
      .eq("user_id", profile.id)
      .single();

    if (!sub) continue;

    try {
      await webpush.sendNotification(
        sub.subscription,
        JSON.stringify({
          title: "Daily Drop 💧",
          body: `Time for a glass of water, ${profile.name}!`,
        })
      );
      sentCount++;

      await supabase
        .from("profiles")
        .update({ last_reminder_sent: now.toISOString() })
        .eq("id", profile.id);
    } catch (err) {
      console.error(`Failed to send to ${profile.id}:`, err);
    }
  }

  return new Response(JSON.stringify({ sent: sentCount }), { status: 200 });
});