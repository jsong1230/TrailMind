import type { DailyLog, Reflection } from '../types/reflection';
import { DailyLog as DailyLogComponent } from './DailyLog';

interface LogListProps {
  logs: DailyLog[];
  onUpdateReflection: (id: string, updates: Partial<Reflection>) => void;
}

export function LogList({ logs, onUpdateReflection }: LogListProps) {
  if (logs.length === 0) {
    return (
      <div className="empty-state">
        <p>아직 기록이 없습니다. 첫 번째 반성을 시작해보세요!</p>
      </div>
    );
  }

  return (
    <div className="log-list">
      {logs.map((log) => (
        <DailyLogComponent
          key={log.date}
          log={log}
          onUpdateReflection={onUpdateReflection}
        />
      ))}
    </div>
  );
}

