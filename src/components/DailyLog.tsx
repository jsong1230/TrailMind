import type { DailyLog as DailyLogType, Reflection } from '../types/reflection';
import { formatDate } from '../utils/date';
import { ReflectionItem } from './ReflectionItem';

interface DailyLogProps {
  log: DailyLogType;
  onUpdateReflection: (id: string, updates: Partial<Reflection>) => void;
}

export function DailyLog({ log, onUpdateReflection }: DailyLogProps) {
  return (
    <div className="daily-log">
      <h2 className="log-date">{formatDate(log.date)}</h2>
      {log.reflections.length === 0 ? (
        <p className="empty-log">이 날짜에는 기록이 없습니다.</p>
      ) : (
        <div className="reflections">
          {log.reflections.map((reflection) => (
            <ReflectionItem
              key={reflection.id}
              reflection={reflection}
              onUpdate={onUpdateReflection}
            />
          ))}
        </div>
      )}
    </div>
  );
}

