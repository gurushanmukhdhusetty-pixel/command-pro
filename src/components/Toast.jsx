import { useStore } from '../lib/store';
export default function Toast() {
  const { toast } = useStore();
  return <div className={`toast ${toast ? 'show' : ''}`}>{toast?.msg}</div>;
}
