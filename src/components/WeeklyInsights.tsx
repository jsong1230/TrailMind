import { useMemo } from 'react';
import { useReflections } from '../hooks/useReflections';
import { calculateWeeklyInsights } from '../utils/weeklyInsights';

export function WeeklyInsights() {
  const { logs } = useReflections();
  
  const insights = useMemo(() => {
    return calculateWeeklyInsights(logs);
  }, [logs]);
  
  return (
    <div className="weekly-insights">
      <h2>주간 인사이트</h2>
      <p className="insights-subtitle">지난 7일간의 반성 요약</p>
      
      <div className="insights-grid">
        <div className="insight-card">
          <h3>총 항목 수</h3>
          <div className="insight-value">{insights.totalEntries}</div>
          <p className="insight-description">지난 7일간 기록한 반성 항목</p>
        </div>
        
        <div className="insight-card">
          <h3>관계 언급</h3>
          <div className="insight-value">{insights.relationshipMentions}</div>
          <p className="insight-description">관계 관련 키워드가 언급된 항목 수</p>
        </div>
      </div>
      
      <div className="insight-section">
        <h3>자주 사용된 단어</h3>
        {insights.topWords.length > 0 ? (
          <div className="word-cloud">
            {insights.topWords.map(({ word, count }) => (
              <span key={word} className="word-tag" style={{ fontSize: `${Math.min(1 + count * 0.1, 1.5)}rem` }}>
                {word} ({count})
              </span>
            ))}
          </div>
        ) : (
          <p className="empty-message">단어 데이터가 없습니다.</p>
        )}
      </div>
      
      <div className="insight-section">
        <h3>이번 주 질문</h3>
        <div className="weekly-question">
          <p>{insights.weeklyQuestion}</p>
        </div>
      </div>
    </div>
  );
}


