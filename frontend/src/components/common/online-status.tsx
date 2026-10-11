import { CloudOff, Wifi } from 'lucide-react';
import { useOnlineStatus } from '@/hooks/use-online-status';

export function OnlineStatus() {
  const isOnline = useOnlineStatus();

  return (
    <div
      aria-live="polite"
      className={
        isOnline
          ? 'flex items-center gap-1.5 text-xs font-medium text-emerald-700'
          : 'flex items-center gap-1.5 text-xs font-medium text-amber-700'
      }
    >
      {isOnline ? <Wifi size={14} /> : <CloudOff size={14} />}
      {isOnline ? 'Online' : 'Offline — inventory operations unavailable'}
    </div>
  );
}
