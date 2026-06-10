import type { APIRoute } from 'astro';
import { checkDbHealth } from '../../lib/db-health';

export const GET: APIRoute = async () => {
  const health = await checkDbHealth();

  return new Response(JSON.stringify(health), {
    status: health.ok ? 200 : 503,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    },
  });
};
