/**
 * 오늘 날짜를 YYYY-MM-DD 형식으로 반환
 */
export function getTodayDateString(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * ISO 8601 날짜 문자열을 읽기 쉬운 형식으로 변환
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  // 오늘인지 확인
  if (date.toDateString() === today.toDateString()) {
    return '오늘';
  }

  // 어제인지 확인
  if (date.toDateString() === yesterday.toDateString()) {
    return '어제';
  }

  // 그 외는 날짜 형식으로 표시
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * 날짜 문자열을 비교하여 정렬
 */
export function compareDates(a: string, b: string): number {
  return b.localeCompare(a); // 최신순
}

