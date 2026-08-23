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

Deno.serve(async (req) => {
  try {
    const { userId, title, body } = await req.json();

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: sub, error } = await supabase
      .from("push_subscriptions")
      .select("subscription")
      .eq("user_id", userId)
      .single();

    if (error || !sub) {
      return new Response(JSON.stringify({ error: "No subscription found" }), { status: 404 });
    }

    await webpush.sendNotification(
      sub.subscription,
      JSON.stringify({ title, body })
    );

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
});