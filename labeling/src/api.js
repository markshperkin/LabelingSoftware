import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE,
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

export async function saveLabels(runId, segments) {
  console.log(`[api] ▶ POST /runs/${runId}/labels`, segments);

  try {
    const res = await api.post(
      `/runs/${runId}/labels`,
      segments,
      { responseType: 'blob' }
    );

    // try to extract filename from Content-Disposition
    let filename = `labels_${runId}.csv`;
    const dispo = res.headers?.['content-disposition'];

    // create a download link for the blob
    const blob = new Blob([res.data], { type: 'csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);

    console.log(`[api] ◀ 200 /runs/${runId}/labels (downloaded ${filename})`);
    return { ok: true, filename };
  } catch (err) {
    console.error(`[api] ✖ POST /runs/${runId}/labels error`, err);
    throw err;
  }
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
