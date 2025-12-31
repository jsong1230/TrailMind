import type { Reflection, DailyLog } from '../types/reflection';

export interface SearchResult {
  reflection: Reflection;
  logDate: string; // YYYY-MM-DD
  matchScore: number; // 검색 관련도 점수
}

export interface SearchOptions {
  query: string;
  startDate?: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
  category?: Reflection['category'];
}

/**
 * 텍스트에서 키워드를 하이라이트하기 위한 마크업 생성
 */
export function highlightKeywords(text: string, keywords: string[]): string {
  if (!keywords.length || !text) return text;

  // 키워드를 정규식으로 이스케이프하고 대소문자 구분 없이 검색
  const escapedKeywords = keywords
    .filter(k => k.trim().length > 0)
    .map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));

  if (escapedKeywords.length === 0) return text;

  const pattern = new RegExp(`(${escapedKeywords.join('|')})`, 'gi');
  
  return text.replace(pattern, '<mark>$1</mark>');
}

/**
 * 반성 내용에서 검색어를 찾아 관련도 점수 계산
 */
function calculateMatchScore(reflection: Reflection, query: string): number {
  const queryLower = query.toLowerCase().trim();
  if (!queryLower) return 0;

  const searchableText = [
    reflection.rawInput || reflection.content || '',
    reflection.aiAnalysisMarkdown || reflection.aiOutput || '',
  ].join(' ').toLowerCase();

  // 정확히 일치하는 경우 높은 점수
  if (searchableText.includes(queryLower)) {
    let score = 10;
    
    // 단어 단위로 일치하는 경우 추가 점수
    const queryWords = queryLower.split(/\s+/).filter(w => w.length > 1);
    queryWords.forEach(word => {
      if (searchableText.includes(word)) {
        score += 5;
      }
    });

    // 제목이나 시작 부분에 있으면 추가 점수
    const first100 = searchableText.substring(0, 100);
    if (first100.includes(queryLower)) {
      score += 3;
    }

    return score;
  }

  // 부분 일치
  const queryWords = queryLower.split(/\s+/).filter(w => w.length > 1);
  let partialScore = 0;
  queryWords.forEach(word => {
    if (searchableText.includes(word)) {
      partialScore += 2;
    }
  });

  return partialScore;
}

/**
 * 날짜 범위 필터링
 */
function isDateInRange(date: string, startDate?: string, endDate?: string): boolean {
  if (!startDate && !endDate) return true;

  const logDate = date.split('T')[0]; // ISO 8601에서 날짜 부분만 추출

  if (startDate && logDate < startDate) return false;
  if (endDate && logDate > endDate) return false;

  return true;
}

/**
 * 모든 로그에서 검색 수행
 */
export function searchReflections(
  logs: Record<string, DailyLog>,
  options: SearchOptions
): SearchResult[] {
  const { query, startDate, endDate, category } = options;
  const queryLower = query.toLowerCase().trim();

  if (!queryLower) {
    return [];
  }

  const results: SearchResult[] = [];

  // 모든 로그를 순회하며 검색
  for (const [, log] of Object.entries(logs)) {
    if (!log || !log.reflections) continue;

    // 날짜 범위 필터
    if (!isDateInRange(log.date, startDate, endDate)) {
      continue;
    }

    // 각 반성 검색
    for (const reflection of log.reflections) {
      // 카테고리 필터
      if (category && reflection.category !== category) {
        continue;
      }

      // 검색어 매칭 및 점수 계산
      const matchScore = calculateMatchScore(reflection, query);
      
      if (matchScore > 0) {
        results.push({
          reflection,
          logDate: log.date,
          matchScore,
        });
      }
    }
  }

  // 관련도 점수 순으로 정렬 (높은 점수 먼저)
  return results.sort((a, b) => b.matchScore - a.matchScore);
}

/**
 * 검색어를 단어 배열로 분리 (하이라이트용)
 */
export function extractKeywords(query: string): string[] {
  return query
    .split(/\s+/)
    .filter(word => word.trim().length > 0)
    .map(word => word.trim());
}

