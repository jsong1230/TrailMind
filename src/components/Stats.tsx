import { useMemo } from 'react';
import type { DailyLog } from '../types/reflection';
import './Stats.css';

interface StatsProps {
  logs: DailyLog[];
}

export function Stats({ logs }: StatsProps) {
  const stats = useMemo(() => {
    const allReflections = logs.flatMap((log) => log.reflections);
    const totalDays = logs.length;
    const totalReflections = allReflections.length;

    // 카테고리 분포
    const categoryCount: Record<string, number> = {
      thinking: 0,
      emotion: 0,
      relationship: 0,
      uncategorized: 0,
    };
    for (const r of allReflections) {
      const cat = r.category || 'uncategorized';
      categoryCount[cat] = (categoryCount[cat] || 0) + 1;
    }

    // AI 분석 비율
    const withAI = allReflections.filter((r) => r.aiOutput || r.aiAnalysisMarkdown).length;

    // 주간 빈도 (최근 8주)
    const weeklyData: { week: string; count: number }[] = [];
    const now = new Date();
    for (let i = 7; i >= 0; i--) {
      const weekStart = new Date(now);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay() - i * 7);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);

      const startStr = weekStart.toISOString().slice(0, 10);
      const endStr = weekEnd.toISOString().slice(0, 10);

      const count = logs.filter((log) => log.date >= startStr && log.date <= endStr)
        .reduce((sum, log) => sum + log.reflections.length, 0);

      const label = `${weekStart.getMonth() + 1}/${weekStart.getDate()}`;
      weeklyData.push({ week: label, count });
    }

    // 평균 글자수
    const avgLength = totalReflections > 0
      ? Math.round(allReflections.reduce((sum, r) => sum + (r.rawInput || r.content || '').length, 0) / totalReflections)
      : 0;

    // 연속 기록 일수 (streak)
    let streak = 0;
    const today = new Date().toISOString().slice(0, 10);
    const dateSet = new Set(logs.map((l) => l.date));
    const checkDate = new Date();
    // 오늘 기록이 없으면 어제부터 체크
    if (!dateSet.has(today)) {
      checkDate.setDate(checkDate.getDate() - 1);
    }
    while (dateSet.has(checkDate.toISOString().slice(0, 10))) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    }

    return {
      totalDays,
      totalReflections,
      categoryCount,
      withAI,
      weeklyData,
      avgLength,
      streak,
    };
  }, [logs]);

  const maxWeeklyCount = Math.max(...stats.weeklyData.map((w) => w.count), 1);

  const categoryLabels: Record<string, string> = {
    thinking: '사고 명확성',
    emotion: '감정 인식',
    relationship: '관계 패턴',
    uncategorized: '미분류',
  };

  const categoryColors: Record<string, string> = {
    thinking: 'var(--primary-color)',
    emotion: '#ef4444',
    relationship: 'var(--accent-color)',
    uncategorized: '#999',
  };

  return (
    <div className="stats-container">
      <h2>통계</h2>
      <p className="stats-subtitle">나의 성찰 활동을 한눈에 확인하세요</p>

      <div className="stats-summary">
        <div className="stat-card">
          <div className="stat-value">{stats.totalDays}</div>
          <div className="stat-label">기록한 날</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.totalReflections}</div>
          <div className="stat-label">총 반성</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.streak}</div>
          <div className="stat-label">연속 기록</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.avgLength}</div>
          <div className="stat-label">평균 글자수</div>
        </div>
      </div>

      <div className="stats-section">
        <h3>주간 활동</h3>
        <div className="weekly-chart">
          {stats.weeklyData.map((week) => (
            <div key={week.week} className="chart-bar-group">
              <div className="chart-bar-wrapper">
                <div
                  className="chart-bar"
                  style={{ height: `${(week.count / maxWeeklyCount) * 100}%` }}
                />
              </div>
              <span className="chart-label">{week.week}</span>
              <span className="chart-count">{week.count}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="stats-section">
        <h3>카테고리 분포</h3>
        {stats.totalReflections === 0 ? (
          <p className="empty-message">아직 데이터가 없습니다.</p>
        ) : (
          <div className="category-bars">
            {Object.entries(stats.categoryCount)
              .filter(([, count]) => count > 0)
              .sort(([, a], [, b]) => b - a)
              .map(([cat, count]) => (
                <div key={cat} className="category-bar-row">
                  <span className="category-bar-label">{categoryLabels[cat] || cat}</span>
                  <div className="category-bar-track">
                    <div
                      className="category-bar-fill"
                      style={{
                        width: `${(count / stats.totalReflections) * 100}%`,
                        backgroundColor: categoryColors[cat] || '#666',
                      }}
                    />
                  </div>
                  <span className="category-bar-count">
                    {count} ({Math.round((count / stats.totalReflections) * 100)}%)
                  </span>
                </div>
              ))}
          </div>
        )}
      </div>

      <div className="stats-section">
        <h3>AI 활용</h3>
        <div className="ai-usage">
          <div className="ai-usage-bar">
            <div
              className="ai-usage-fill"
              style={{
                width: stats.totalReflections > 0
                  ? `${(stats.withAI / stats.totalReflections) * 100}%`
                  : '0%',
              }}
            />
          </div>
          <p className="ai-usage-text">
            {stats.totalReflections > 0
              ? `${stats.withAI}/${stats.totalReflections}개 반성에 AI 분석 적용 (${Math.round((stats.withAI / stats.totalReflections) * 100)}%)`
              : '아직 데이터가 없습니다.'}
          </p>
        </div>
      </div>
    </div>
  );
}
