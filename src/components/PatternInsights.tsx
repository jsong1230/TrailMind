import { useMemo, useState } from 'react';
import { useReflections } from '../hooks/useReflections';
import { calculatePatternInsights } from '../utils/patternRecognition';
import './PatternInsights.css';

export function PatternInsights() {
  const { logs } = useReflections();
  const [timeRange, setTimeRange] = useState<30 | 60 | 90>(30);

  const insights = useMemo(() => {
    return calculatePatternInsights(logs, timeRange);
  }, [logs, timeRange]);

  const weekdays = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];

  return (
    <div className="pattern-insights">
      <div className="pattern-header">
        <h2>패턴 인식</h2>
        <p className="pattern-subtitle">반복되는 주제와 패턴을 자동으로 감지합니다</p>
        <div className="time-range-selector">
          <label>기간 선택:</label>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(Number(e.target.value) as 30 | 60 | 90)}
            className="time-range-select"
          >
            <option value={30}>최근 30일</option>
            <option value={60}>최근 60일</option>
            <option value={90}>최근 90일</option>
          </select>
        </div>
      </div>

      {/* 반복 주제 */}
      <div className="pattern-section">
        <h3>반복되는 주제</h3>
        {insights.repeatedTopics.length > 0 ? (
          <div className="repeated-topics">
            {insights.repeatedTopics.map((topic, idx) => (
              <div key={idx} className="topic-item">
                <div className="topic-header">
                  <span className="topic-name">{topic.topic}</span>
                  <span className="topic-frequency">{topic.frequency}회</span>
                </div>
                {topic.examples.length > 0 && (
                  <div className="topic-examples">
                    {topic.examples.map((example, exIdx) => (
                      <div key={exIdx} className="topic-example">
                        "{example}"
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="empty-message">반복되는 주제가 없습니다.</p>
        )}
      </div>

      {/* 요일별 패턴 */}
      <div className="pattern-section">
        <h3>요일별 패턴</h3>
        {Object.keys(insights.weekdayPatterns).length > 0 ? (
          <div className="weekday-patterns">
            {weekdays.map((weekday) => {
              const pattern = insights.weekdayPatterns[weekday];
              if (!pattern || pattern.count === 0) return null;

              return (
                <div key={weekday} className="weekday-item">
                  <div className="weekday-header">
                    <span className="weekday-name">{weekday}</span>
                    <span className="weekday-count">{pattern.count}개 항목</span>
                  </div>
                  <div className="weekday-stats">
                    <span>평균 길이: {pattern.avgLength}자</span>
                    {Object.keys(pattern.categories).length > 0 && (
                      <div className="weekday-categories">
                        {Object.entries(pattern.categories).map(([cat, count]) => (
                          <span key={cat} className="category-tag">
                            {cat === 'thinking' && '사고'}
                            {cat === 'emotion' && '감정'}
                            {cat === 'relationship' && '관계'}
                            : {count}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="empty-message">요일별 패턴 데이터가 없습니다.</p>
        )}
      </div>

      {/* 감정 패턴 */}
      <div className="pattern-section">
        <h3>감정 패턴</h3>
        <div className="emotion-patterns">
          <div className="emotion-stat">
            <span className="emotion-label">긍정</span>
            <span className="emotion-value">{insights.emotionPatterns.positive}</span>
          </div>
          <div className="emotion-stat">
            <span className="emotion-label">부정</span>
            <span className="emotion-value">{insights.emotionPatterns.negative}</span>
          </div>
          <div className="emotion-stat">
            <span className="emotion-label">중립</span>
            <span className="emotion-value">{insights.emotionPatterns.neutral}</span>
          </div>
          <div className="emotion-dominant">
            <span>주요 감정: </span>
            <strong>{insights.emotionPatterns.dominantEmotion}</strong>
          </div>
        </div>
      </div>

      {/* 관계 패턴 */}
      <div className="pattern-section">
        <h3>관계 패턴</h3>
        <div className="relationship-patterns">
          <div className="relationship-stat">
            <span className="relationship-label">언급 횟수</span>
            <span className="relationship-value">{insights.relationshipPatterns.mentions}회</span>
          </div>
          <div className="relationship-stat">
            <span className="relationship-label">빈도</span>
            <span className="relationship-value">
              {Math.round(insights.relationshipPatterns.frequency * 100)}%
            </span>
          </div>
          {insights.relationshipPatterns.commonThemes.length > 0 && (
            <div className="relationship-themes">
              <span className="themes-label">자주 언급된 주제:</span>
              <div className="themes-list">
                {insights.relationshipPatterns.commonThemes.map((theme, idx) => (
                  <span key={idx} className="theme-tag">{theme}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 월별 트렌드 */}
      <div className="pattern-section">
        <h3>월별 트렌드</h3>
        {insights.monthlyTrends.length > 0 ? (
          <div className="monthly-trends">
            {insights.monthlyTrends.map((trend) => (
              <div key={trend.month} className="monthly-item">
                <div className="monthly-header">
                  <span className="monthly-name">{trend.month}</span>
                  <span className="monthly-count">{trend.count}개 항목</span>
                </div>
                <div className="monthly-stats">
                  <span>평균 길이: {trend.avgLength}자</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="empty-message">월별 트렌드 데이터가 없습니다.</p>
        )}
      </div>
    </div>
  );
}

