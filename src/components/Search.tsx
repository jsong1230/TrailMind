import { useState, useMemo } from 'react';
import { useReflections } from '../hooks/useReflections';
import { searchReflections, extractKeywords, highlightKeywords } from '../utils/search';
import type { Reflection } from '../types/reflection';
import './Search.css';

interface SearchProps {
  onSelectReflection?: (reflection: Reflection) => void;
}

export function Search({ onSelectReflection }: SearchProps) {
  const { logs } = useReflections();
  const [query, setQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [category, setCategory] = useState<Reflection['category'] | ''>('');

  // 검색 실행
  const results = useMemo(() => {
    if (!query.trim()) {
      return [];
    }

    return searchReflections(logs, {
      query,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      category: category || undefined,
    });
  }, [logs, query, startDate, endDate, category]);

  const keywords = extractKeywords(query);

  const handleClearFilters = () => {
    setQuery('');
    setStartDate('');
    setEndDate('');
    setCategory('');
  };

  const handleReflectionClick = (reflection: Reflection) => {
    if (onSelectReflection) {
      onSelectReflection(reflection);
    }
  };

  return (
    <div className="search-container">
      <div className="search-header">
        <h2>검색</h2>
        <p className="search-subtitle">과거 반성을 검색하여 연결점을 발견하세요</p>
      </div>

      <div className="search-filters">
        <div className="search-input-group">
          <label htmlFor="search-query">검색어</label>
          <input
            id="search-query"
            type="text"
            className="search-input"
            placeholder="키워드, 문구를 입력하세요..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
        </div>

        <div className="search-filters-row">
          <div className="search-filter-group">
            <label htmlFor="search-start-date">시작 날짜</label>
            <input
              id="search-start-date"
              type="date"
              className="search-date-input"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div className="search-filter-group">
            <label htmlFor="search-end-date">종료 날짜</label>
            <input
              id="search-end-date"
              type="date"
              className="search-date-input"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          <div className="search-filter-group">
            <label htmlFor="search-category">카테고리</label>
            <select
              id="search-category"
              className="search-select"
              value={category}
              onChange={(e) => setCategory(e.target.value as Reflection['category'] | '')}
            >
              <option value="">전체</option>
              <option value="thinking">사고 명확성</option>
              <option value="emotion">감정 인식</option>
              <option value="relationship">관계 패턴</option>
            </select>
          </div>
        </div>

        {(query || startDate || endDate || category) && (
          <button className="clear-filters-button" onClick={handleClearFilters}>
            필터 초기화
          </button>
        )}
      </div>

      <div className="search-results">
        {!query.trim() ? (
          <div className="search-empty-state">
            <p>검색어를 입력하여 반성을 검색하세요.</p>
          </div>
        ) : results.length === 0 ? (
          <div className="search-empty-state">
            <p>검색 결과가 없습니다.</p>
            <p className="search-empty-hint">다른 키워드나 날짜 범위를 시도해보세요.</p>
          </div>
        ) : (
          <>
            <div className="search-results-header">
              <p className="search-results-count">
                {results.length}개의 결과를 찾았습니다
              </p>
            </div>
            <div className="search-results-list">
              {results.map((result) => {
                const reflection = result.reflection;
                const rawInput = reflection.rawInput || reflection.content || '';
                const displayText = highlightKeywords(rawInput, keywords);
                const date = new Date(reflection.date);
                const logDate = new Date(result.logDate);

                return (
                  <div
                    key={reflection.id}
                    className="search-result-item"
                    onClick={() => handleReflectionClick(reflection)}
                  >
                    <div className="search-result-header">
                      <div className="search-result-meta">
                        <span className="search-result-date">
                          {logDate.toLocaleDateString('ko-KR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </span>
                        <span className="search-result-time">
                          {date.toLocaleTimeString('ko-KR', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                        {reflection.category && (
                          <span className={`search-result-category category-${reflection.category}`}>
                            {reflection.category === 'thinking' && '사고 명확성'}
                            {reflection.category === 'emotion' && '감정 인식'}
                            {reflection.category === 'relationship' && '관계 패턴'}
                          </span>
                        )}
                      </div>
                      <span className="search-result-score">
                        관련도: {result.matchScore}
                      </span>
                    </div>
                    <div
                      className="search-result-content"
                      dangerouslySetInnerHTML={{
                        __html: displayText.substring(0, 300) + (rawInput.length > 300 ? '...' : ''),
                      }}
                    />
                    {reflection.aiAnalysisMarkdown && (
                      <div className="search-result-has-ai">
                        <span>✓ AI 분석 포함</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

