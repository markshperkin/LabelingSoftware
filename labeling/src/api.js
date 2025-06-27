import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000',
  headers: { 'Content-Type': 'application/json' }
});

export function listRuns() {
  console.log('[api] ▶ GET /runs');
  return api
    .get('/runs')
    .then(res => {
      console.log('[api] ◀ 200 /runs', res.data);
      return res.data;
    })
    .catch(err => {
      console.error('[api] ✖ GET /runs error', err);
      throw err;
    });
}

export function getRun(runId) {
  console.log(`[api] ▶ GET /runs/${runId}`);
  return api
    .get(`/runs/${runId}`)
    .then(res => {
      console.log(`[api] ◀ 200 /runs/${runId}`, res.data);
      return res.data;
    })
    .catch(err => {
      console.error(`[api] ✖ GET /runs/${runId} error`, err);
      throw err;
    });
}

export function saveLabels(runId, segments) {
  console.log(`[api] ▶ POST /runs/${runId}/labels`, segments);
  return api
    .post(`/runs/${runId}/labels`, segments)
    .then(res => {
      console.log(`[api] ◀ 200 /runs/${runId}/labels`, res.data);
      return res.data;
    })
    .catch(err => {
      console.error(`[api] ✖ POST /runs/${runId}/labels error`, err);
      throw err;
    });
}

export function updateStatus(runId, status) {
  console.log(`[api] ▶ PATCH /runs/${runId}/status`, { status });
  return api
    .patch(`/runs/${runId}/status`, { status })
    .then(res => {
      console.log(`[api] ◀ 200 /runs/${runId}/status`, res.data);
      return res.data;
    })
    .catch(err => {
      console.error(`[api] ✖ PATCH /runs/${runId}/status error`, err);
      throw err;
    });
}
