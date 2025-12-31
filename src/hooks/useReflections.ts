import { useLocalStorage } from './useLocalStorage';
import type { Reflection, DailyLog } from '../types/reflection';
import { getTodayDateString, compareDates } from '../utils/date';

const STORAGE_KEY = 'trailmind-reflections';

/**
 * 기존 데이터를 새 스키마로 마이그레이션
 */
function migrateReflection(reflection: any): Reflection {
  const now = new Date().toISOString();
  let migrated: Reflection = {
    ...reflection,
  };

  // rawInput 마이그레이션
  if (migrated.rawInput === undefined) {
    migrated.rawInput = migrated.content || '';
    migrated.content = migrated.content || ''; // 하위 호환성 유지
  }

  // updatedAt 마이그레이션 (없으면 date를 사용, 그것도 없으면 현재 시간)
  if (!migrated.updatedAt) {
    migrated.updatedAt = migrated.date || now;
  }

  return migrated;
}

/**
 * 로그 데이터 마이그레이션
 */
function migrateLogs(logs: Record<string, any>): Record<string, DailyLog> {
  const migrated: Record<string, DailyLog> = {};
  
  for (const [date, log] of Object.entries(logs)) {
    if (log && log.reflections) {
      migrated[date] = {
        ...log,
        reflections: log.reflections.map(migrateReflection),
      };
    } else {
      migrated[date] = log;
    }
  }
  
  return migrated;
}

export function useReflections() {
  const [logs, setLogs] = useLocalStorage<Record<string, DailyLog>>(STORAGE_KEY, {}, (value) => {
    // 초기 로드 시 마이그레이션 수행
    return migrateLogs(value);
  });

  const addReflection = (
    content: string,
    category?: Reflection['category'],
    prompts?: string[],
    promptTemplateId?: string
  ) => {
    const today = getTodayDateString();
    const now = new Date().toISOString();
    const newReflection: Reflection = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
      date: now,
      content, // 하위 호환성
      rawInput: content,
      category,
      prompts,
      promptTemplateId,
      updatedAt: now,
    };

    setLogs((prev) => {
      const todayLog = prev[today] || { date: today, reflections: [] };
      return {
        ...prev,
        [today]: {
          ...todayLog,
          reflections: [...todayLog.reflections, newReflection],
        },
      };
    });
  };

  const updateReflection = (
    reflectionId: string,
    updates: Partial<Reflection>
  ) => {
    setLogs((prev) => {
      const updated = { ...prev };
      const now = new Date().toISOString();
      
      for (const date in updated) {
        const log = updated[date];
        if (log && log.reflections) {
          const reflectionIndex = log.reflections.findIndex((r) => r.id === reflectionId);
          if (reflectionIndex !== -1) {
            updated[date] = {
              ...log,
              reflections: log.reflections.map((r, idx) =>
                idx === reflectionIndex 
                  ? { ...r, ...updates, updatedAt: now } 
                  : r
              ),
            };
            break;
          }
        }
      }
      
      return updated;
    });
  };

  const importLogs = (importedLogs: Record<string, DailyLog>) => {
    setLogs((prev) => {
      const merged: Record<string, DailyLog> = { ...prev };
      const now = new Date().toISOString();

      // 모든 반성을 평탄화하여 ID별로 관리
      const existingReflections = new Map<string, Reflection>();
      for (const log of Object.values(merged)) {
        if (log && log.reflections) {
          for (const reflection of log.reflections) {
            existingReflections.set(reflection.id, reflection);
          }
        }
      }

      // 가져온 로그 병합
      for (const [date, log] of Object.entries(importedLogs)) {
        if (!log || !log.reflections) continue;

        const existingLog = merged[date] || { date, reflections: [] };
        const mergedReflections: Reflection[] = [...existingLog.reflections];

        for (const importedReflection of log.reflections) {
          const existing = existingReflections.get(importedReflection.id);
          
          if (existing) {
            // 같은 ID가 있으면 updatedAt 비교하여 최신 유지
            const existingUpdatedAt = existing.updatedAt || existing.date || '';
            const importedUpdatedAt = importedReflection.updatedAt || importedReflection.date || '';
            
            if (importedUpdatedAt > existingUpdatedAt) {
              // 가져온 것이 더 최신이면 교체
              const index = mergedReflections.findIndex((r) => r.id === importedReflection.id);
              if (index !== -1) {
                mergedReflections[index] = { ...importedReflection, updatedAt: importedReflection.updatedAt || now };
              }
            }
            // 기존 것이 더 최신이면 건너뛰기
          } else {
            // 새로운 반성이면 추가
            mergedReflections.push({
              ...importedReflection,
              updatedAt: importedReflection.updatedAt || now,
            });
          }
        }

        merged[date] = {
          date,
          reflections: mergedReflections,
        };
      }

      return merged;
    });
  };

  const getDailyLogs = (): DailyLog[] => {
    return Object.values(logs)
      .sort((a, b) => compareDates(a.date, b.date));
  };

  const getTodayLog = (): DailyLog | undefined => {
    const today = getTodayDateString();
    return logs[today];
  };

  const getLogByDate = (date: string): DailyLog | undefined => {
    return logs[date];
  };

  return {
    logs,
    addReflection,
    updateReflection,
    importLogs,
    getDailyLogs,
    getTodayLog,
    getLogByDate,
  };
}

