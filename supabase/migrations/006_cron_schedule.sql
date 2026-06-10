-- TheChoiceList: Schedule daily-content Edge Function
-- Run in Supabase SQL Editor after deploying the daily-content function
--
-- Prerequisites:
--   1. Enable extensions: pg_cron, pg_net (Dashboard → Database → Extensions)
--   2. Deploy: supabase functions deploy daily-content --no-verify-jwt
--   3. Set secrets: AI_API_KEY, AI_MODEL, AI_PROVIDER (optional)
--
-- Schedule: daily at 02:00 UTC (= 09:00 Bangkok, UTC+7)

-- Remove previous job if re-running this migration
SELECT cron.unschedule(jobid)
FROM cron.job
WHERE jobname = 'daily-content-job';

SELECT cron.schedule(
  'daily-content-job',
  '0 2 * * *',
  $$
  SELECT net.http_post(
    url := 'https://pjjtohcbuhdartslzzal.supabase.co/functions/v1/daily-content',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
    ),
    body := '{}'::jsonb
  ) AS request_id;
  $$
);

-- Alternative: use Dashboard → Edge Functions → daily-content → Schedules
--   Cron: 0 2 * * *
--   Timezone: UTC
--
-- Or invoke manually for testing:
--   curl -X POST 'https://pjjtohcbuhdartslzzal.supabase.co/functions/v1/daily-content' \
--     -H 'Authorization: Bearer YOUR_SERVICE_ROLE_KEY' \
--     -H 'Content-Type: application/json'
