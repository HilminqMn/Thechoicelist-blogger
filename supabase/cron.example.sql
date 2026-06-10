# Supabase Cron example — schedule daily-content Edge Function
# Configure in Supabase Dashboard > Database > Extensions (enable pg_cron)
# Or use Supabase Dashboard > Edge Functions > Schedules

# Example SQL to invoke via pg_net (adjust URL and anon key):
#
# SELECT cron.schedule(
#   'daily-content-job',
#   '0 2 * * *',
#   $$
#   SELECT net.http_post(
#     url := 'https://YOUR_PROJECT.supabase.co/functions/v1/daily-content',
#     headers := '{"Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb
#   );
#   $$
# );
