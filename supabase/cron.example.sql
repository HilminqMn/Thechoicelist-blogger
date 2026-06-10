# Supabase Cron — schedule daily-content Edge Function
# See docs/AI_CRON_SETUP.md for full setup guide
#
# Option A (recommended): Dashboard → Edge Functions → daily-content → Schedules
#   Cron: 0 2 * * *  (02:00 UTC = 09:00 Bangkok)
#
# Option B: pg_cron + pg_net (run 006_cron_schedule.sql in SQL Editor)
#   Prerequisites: enable pg_cron and pg_net extensions
#
# Manual test:
#   curl -X POST 'https://pjjtohcbuhdartslzzal.supabase.co/functions/v1/daily-content' \
#     -H 'Authorization: Bearer YOUR_SERVICE_ROLE_KEY' \
#     -H 'Content-Type: application/json'
