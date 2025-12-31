import type { Reflection, DailyLog } from '../types/reflection';

export interface PatternInsight {
  repeatedTopics: Array<{ topic: string; frequency: number; examples: string[] }>;
  weekdayPatterns: Record<string, { count: number; avgLength: number; categories: Record<string, number> }>;
  emotionPatterns: {
    positive: number;
    negative: number;
    neutral: number;
    dominantEmotion: string;
  };
  relationshipPatterns: {
    mentions: number;
    frequency: number;
    commonThemes: string[];
  };
  monthlyTrends: Array<{ month: string; count: number; avgLength: number }>;
}

/**
 * 감정 키워드 목록
 */
const POSITIVE_EMOTION_KEYWORDS = [
  '기쁨', '행복', '만족', '감사', '평화', '안정', '희망', '자신감', '성취', '뿌듯',
  'joy', 'happy', 'satisfied', 'grateful', 'peaceful', 'stable', 'hopeful', 'confident', 'achievement', 'proud'
];

const NEGATIVE_EMOTION_KEYWORDS = [
  '스트레스', '불안', '걱정', '우울', '화', '분노', '실망', '후회', '아쉬움', '피로', '지침',
  'stress', 'anxiety', 'worry', 'depression', 'anger', 'disappointment', 'regret', 'tired', 'exhausted'
];

const RELATIONSHIP_KEYWORDS = [
  '상대', '관계', '연락', '답장', '서운', '오해', '소통', '대화', '이해', '갈등', '친구', '가족', '동료',
  'relationship', 'reply', 'message', 'communication', 'misunderstanding', 'conflict', 'friend', 'family', 'colleague'
];

/**
 * 주제 키워드 목록 (사고 패턴)
 */
const THINKING_PATTERN_KEYWORDS = [
  '결정', '선택', '고민', '생각', '판단', '분석', '이해', '명확', '혼란', '확신',
  'decision', 'choice', 'consider', 'think', 'judge', 'analyze', 'understand', 'clear', 'confusion', 'certain'
];

/**
 * 날짜에서 요일 추출 (0=일요일, 6=토요일)
 */
function getWeekday(dateString: string): string {
  const date = new Date(dateString);
  const weekdays = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
  return weekdays[date.getDay()];
}

/**
 * 날짜에서 월 추출 (YYYY-MM 형식)
 */
function getMonth(dateString: string): string {
  return dateString.substring(0, 7); // YYYY-MM
}

/**
 * 반복되는 주제 감지 (키워드 기반)
 */
function detectRepeatedTopics(reflections: Reflection[]): Array<{ topic: string; frequency: number; examples: string[] }> {
  const topicCount = new Map<string, { count: number; examples: string[] }>();
  
  // 모든 키워드 카테고리 통합
  const allKeywords = [
    ...RELATIONSHIP_KEYWORDS,
    ...POSITIVE_EMOTION_KEYWORDS,
    ...NEGATIVE_EMOTION_KEYWORDS,
    ...THINKING_PATTERN_KEYWORDS,
  ];

  for (const reflection of reflections) {
    const text = (reflection.rawInput || reflection.content || '').toLowerCase();
    const foundTopics = new Set<string>();

    for (const keyword of allKeywords) {
      if (text.includes(keyword.toLowerCase())) {
        foundTopics.add(keyword);
      }
    }

    for (const topic of foundTopics) {
      if (!topicCount.has(topic)) {
        topicCount.set(topic, { count: 0, examples: [] });
      }
      const entry = topicCount.get(topic)!;
      entry.count++;
      if (entry.examples.length < 3) {
        const preview = (reflection.rawInput || reflection.content || '').substring(0, 50);
        if (preview) {
          entry.examples.push(preview + '...');
        }
      }
    }
  }

  // 빈도가 2회 이상인 주제만 반환 (상위 10개)
  return Array.from(topicCount.entries())
    .filter(([, data]) => data.count >= 2)
    .map(([topic, data]) => ({
      topic,
      frequency: data.count,
      examples: data.examples,
    }))
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, 10);
}

/**
 * 요일별 패턴 분석
 */
function analyzeWeekdayPatterns(reflections: Reflection[]): Record<string, { count: number; avgLength: number; categories: Record<string, number> }> {
  const patterns: Record<string, { count: number; totalLength: number; categories: Record<string, number> }> = {};

  for (const reflection of reflections) {
    const weekday = getWeekday(reflection.date);
    if (!patterns[weekday]) {
      patterns[weekday] = { count: 0, totalLength: 0, categories: {} };
    }

    patterns[weekday].count++;
    const textLength = (reflection.rawInput || reflection.content || '').length;
    patterns[weekday].totalLength += textLength;

    if (reflection.category) {
      patterns[weekday].categories[reflection.category] = 
        (patterns[weekday].categories[reflection.category] || 0) + 1;
    }
  }

  // 평균 길이 계산
  const result: Record<string, { count: number; avgLength: number; categories: Record<string, number> }> = {};
  for (const [weekday, data] of Object.entries(patterns)) {
    result[weekday] = {
      count: data.count,
      avgLength: data.count > 0 ? Math.round(data.totalLength / data.count) : 0,
      categories: data.categories,
    };
  }

  return result;
}

/**
 * 감정 패턴 분석
 */
function analyzeEmotionPatterns(reflections: Reflection[]): {
  positive: number;
  negative: number;
  neutral: number;
  dominantEmotion: string;
} {
  let positive = 0;
  let negative = 0;
  let neutral = 0;

  for (const reflection of reflections) {
    const text = (reflection.rawInput || reflection.content || '').toLowerCase();
    let hasPositive = false;
    let hasNegative = false;

    for (const keyword of POSITIVE_EMOTION_KEYWORDS) {
      if (text.includes(keyword.toLowerCase())) {
        hasPositive = true;
        break;
      }
    }

    for (const keyword of NEGATIVE_EMOTION_KEYWORDS) {
      if (text.includes(keyword.toLowerCase())) {
        hasNegative = true;
        break;
      }
    }

    if (hasPositive && !hasNegative) {
      positive++;
    } else if (hasNegative) {
      negative++;
    } else {
      neutral++;
    }
  }

  let dominantEmotion = '중립';
  if (positive > negative && positive > neutral) {
    dominantEmotion = '긍정';
  } else if (negative > positive && negative > neutral) {
    dominantEmotion = '부정';
  }

  return { positive, negative, neutral, dominantEmotion };
}

/**
 * 관계 패턴 분석
 */
function analyzeRelationshipPatterns(reflections: Reflection[]): {
  mentions: number;
  frequency: number;
  commonThemes: string[];
} {
  let mentions = 0;
  const themeCount = new Map<string, number>();

  for (const reflection of reflections) {
    const text = (reflection.rawInput || reflection.content || '').toLowerCase();
    let hasRelationship = false;

    for (const keyword of RELATIONSHIP_KEYWORDS) {
      if (text.includes(keyword.toLowerCase())) {
        hasRelationship = true;
        themeCount.set(keyword, (themeCount.get(keyword) || 0) + 1);
      }
    }

    if (hasRelationship) {
      mentions++;
    }
  }

  const commonThemes = Array.from(themeCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([theme]) => theme);

  return {
    mentions,
    frequency: reflections.length > 0 ? mentions / reflections.length : 0,
    commonThemes,
  };
}

/**
 * 월별 트렌드 분석
 */
function analyzeMonthlyTrends(logs: Record<string, DailyLog>): Array<{ month: string; count: number; avgLength: number }> {
  const monthData = new Map<string, { count: number; totalLength: number }>();

  for (const [date, log] of Object.entries(logs)) {
    if (!log || !log.reflections) continue;

    const month = getMonth(date);
    if (!monthData.has(month)) {
      monthData.set(month, { count: 0, totalLength: 0 });
    }

    const data = monthData.get(month)!;
    for (const reflection of log.reflections) {
      data.count++;
      const textLength = (reflection.rawInput || reflection.content || '').length;
      data.totalLength += textLength;
    }
  }

  return Array.from(monthData.entries())
    .map(([month, data]) => ({
      month,
      count: data.count,
      avgLength: data.count > 0 ? Math.round(data.totalLength / data.count) : 0,
    }))
    .sort((a, b) => b.month.localeCompare(a.month)) // 최신순
    .slice(0, 6); // 최근 6개월
}

/**
 * 패턴 인사이트 계산
 */
export function calculatePatternInsights(
  logs: Record<string, DailyLog>,
  days: number = 30 // 기본 30일
): PatternInsight {
  // 최근 N일간의 반성 수집
  const today = new Date();
  const reflections: Reflection[] = [];

  for (let i = 0; i < days; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateString = date.toISOString().split('T')[0];
    const log = logs[dateString];
    if (log && log.reflections) {
      reflections.push(...log.reflections);
    }
  }

  return {
    repeatedTopics: detectRepeatedTopics(reflections),
    weekdayPatterns: analyzeWeekdayPatterns(reflections),
    emotionPatterns: analyzeEmotionPatterns(reflections),
    relationshipPatterns: analyzeRelationshipPatterns(reflections),
    monthlyTrends: analyzeMonthlyTrends(logs),
  };
}

