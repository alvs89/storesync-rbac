import { useCallback, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { apiUrl } from '../utils/api';

export function useBranchComparison(enabled, start, end) {
  const [state, setState] = useState({ snapshot: null, error: '', refreshing: false });
  const refreshRef = useRef(() => {});
  const refresh = useCallback(() => refreshRef.current(), []);
  useEffect(() => {
    let disposed = false;
    let busy = false;
    let queued = false;
    const controller = new AbortController();
    setState({ snapshot: null, error: '', refreshing: enabled });
    if (!enabled) { refreshRef.current = () => {}; return; }
    const load = async () => {
      if (disposed) return;
      if (busy) { queued = true; return; }
      busy = true;
      setState(previous => ({ ...previous, refreshing: true }));
      try {
        const { data } = await axios.get(apiUrl('/api/reports/branch-comparison'), {
          params: { start: new Date(start).toISOString(), end: new Date(end).toISOString() },
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          signal: controller.signal,
        });
        if (!Array.isArray(data.sales) || !Array.isArray(data.products) || !data.snapshotAt) throw new Error('The comparison response is incomplete.');
        if (!disposed) setState({ snapshot: { ...data, rangeStart: start, rangeEnd: end }, error: '', refreshing: false });
      } catch (error) {
        if (!disposed) setState(previous => ({ ...previous, refreshing: false, error: error.response?.data?.error || 'Unable to refresh branch comparison. Please try again.' }));
      } finally {
        busy = false;
        if (queued && !disposed) { queued = false; load(); }
      }
    };
    const onStorage = event => { if (event.key === 'storesync_prototype_data_v1') load(); };
    const onVisible = () => { if (document.visibilityState === 'visible') load(); };
    refreshRef.current = load;
    load();
    const interval = setInterval(() => { if (document.visibilityState === 'visible') load(); }, 30000);
    window.addEventListener('storesync-data-changed', load);
    window.addEventListener('storage', onStorage);
    window.addEventListener('focus', load);
    window.addEventListener('database-restored', load);
    window.addEventListener('maintenance-action-completed', load);
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      disposed = true;
      controller.abort();
      refreshRef.current = () => {};
      clearInterval(interval);
      window.removeEventListener('storesync-data-changed', load);
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('focus', load);
      window.removeEventListener('database-restored', load);
      window.removeEventListener('maintenance-action-completed', load);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [enabled, start, end]);
  const snapshot = state.snapshot?.rangeStart === start && state.snapshot?.rangeEnd === end ? state.snapshot : null;
  return { ...state, snapshot, refresh };
}
