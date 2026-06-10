-- TheChoiceList: Schedule daily-content Edge Function
-- Run in Supabase SQL Editor AFTER deploying daily-content
--
-- Recommended: Dashboard → Edge Functions → daily-content → Schedules
--   Cron: 0 2 * * *  |  Timezone: UTC  (= 09:00 Bangkok)
--
-- Alternative (pg_cron + pg_net + Vault):
--   1. Enable extensions: pg_cron, pg_net, supabase_vault (Database → Extensions)
--   2. Deploy function: supabase functions deploy daily-content --no-verify-jwt
--   3. Store secrets in Vault (replace placeholders — run ONCE):
--
-- select vault.create_secret(
--   'https://pjjtohcbuhdartslzzal.supabase.co',
--   'tcl_project_url',
--   'Supabase project URL for cron'
-- );
-- select vault.create_secret(
--   'YOUR_SERVICE_ROLE_KEY',
--   'tcl_service_role_key',
--   'Service role key for daily-content cron'
-- );
--
--   4. Run the schedule block below

-- Remove previous job if re-running
SELECT cron.unschedule(jobid)
FROM cron.job
WHERE jobname = 'daily-content-job';

SELECT cron.schedule(
  'daily-content-job',
  '0 2 * * *',
  $$
  SELECT net.http_post(
    url := (
      SELECT decrypted_secret
      FROM vault.decrypted_secrets
      WHERE name = 'tcl_project_url'
    ) || '/functions/v1/daily-content',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (
        SELECT decrypted_secret
        FROM vault.decrypted_secrets
        WHERE name = 'tcl_service_role_key'
      )
    ),
    body := '{}'::jsonb
  ) AS request_id;
  $$
);

-- Manual test (replace YOUR_SERVICE_ROLE_KEY):
--   curl -X POST 'https://pjjtohcbuhdartslzzal.supabase.co/functions/v1/daily-content' \
--     -H 'Authorization: Bearer YOUR_SERVICE_ROLE_KEY' \
--     -H 'Content-Type: application/json'
