import type { Reflection, DailyLog } from '../types/reflection';

export interface WeeklyInsights {
  totalEntries: number;
  topWords: Array<{ word: string; count: number }>;
  relationshipMentions: number;
  weeklyQuestion: string;
}

/**
 * 지난 7일간의 날짜 문자열 배열 반환
 */
function getLast7Days(): string[] {
  const days: string[] = [];
  const today = new Date();
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    days.push(date.toISOString().split('T')[0]);
  }
  
  return days;
}

/**
 * 텍스트에서 단어 추출 (공백으로 분리, 짧은 토큰 제거)
 */
function extractWords(text: string): string[] {
  // 공백으로 분리
  const words = text
    .split(/\s+/)
    .map((w) => w.trim().toLowerCase())
    .filter((w) => {
      // 짧은 토큰 제거 (2글자 미만)
      if (w.length < 2) return false;
      // 특수문자만 있는 경우 제거
      if (!/[가-힣a-zA-Z]/.test(w)) return false;
      // 일반적인 불용어 제거
      const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', '이', '가', '을', '를', '은', '는', '에', '의', '와', '과', '도', '로', '으로'];
      if (stopWords.includes(w)) return false;
      return true;
    });
  
  return words;
}

/**
 * 관계 키워드 목록
 */
const RELATIONSHIP_KEYWORDS = [
  '상대', '관계', '연락', '답장', '서운', '오해', '소통', '대화', '이해', '갈등',
  'trust', 'relationship', 'reply', 'message', 'communication', 'misunderstanding',
  'conflict', 'connection', 'interaction', 'conversation'
];

/**
 * 부정 감정 토큰 목록
 */
const NEGATIVE_EMOTION_TOKENS = [
  '스트레스', '불안', '걱정', '우울', '화', '분노', '실망', '후회', '아쉬움',
  'stress', 'anxiety', 'worry', 'depression', 'anger', 'disappointment', 'regret'
];

/**
 * 지난 7일간의 반성 항목 수집
 */
function getLast7DaysReflections(logs: Record<string, DailyLog>): Reflection[] {
  const last7Days = getLast7Days();
  const reflections: Reflection[] = [];
  
  for (const date of last7Days) {
    const log = logs[date];
    if (log && log.reflections) {
      reflections.push(...log.reflections);
    }
  }
  
  return reflections;
}

/**
 * 단어 빈도 계산
 */
function countWords(reflections: Reflection[]): Map<string, number> {
  const wordCount = new Map<string, number>();
  
  for (const reflection of reflections) {
    const text = reflection.rawInput || reflection.content || '';
    const words = extractWords(text);
    
    for (const word of words) {
      wordCount.set(word, (wordCount.get(word) || 0) + 1);
    }
  }
  
  return wordCount;
}

/**
 * 관계 키워드 언급 횟수 계산
 */
function countRelationshipMentions(reflections: Reflection[]): number {
  let count = 0;
  
  for (const reflection of reflections) {
    const text = (reflection.rawInput || reflection.content || '').toLowerCase();
    for (const keyword of RELATIONSHIP_KEYWORDS) {
      if (text.includes(keyword.toLowerCase())) {
        count++;
        break; // 한 항목당 한 번만 카운트
      }
    }
  }
  
  return count;
}

/**
 * 부정 감정 토큰 빈도 계산
 */
function countNegativeEmotionTokens(reflections: Reflection[]): number {
  let count = 0;
  
  for (const reflection of reflections) {
    const text = (reflection.rawInput || reflection.content || '').toLowerCase();
    for (const token of NEGATIVE_EMOTION_TOKENS) {
      if (text.includes(token.toLowerCase())) {
        count++;
        break; // 한 항목당 한 번만 카운트
      }
    }
  }
  
  return count;
}

/**
 * 주간 질문 생성 (휴리스틱 규칙)
 */
function generateWeeklyQuestion(
  relationshipMentions: number,
  negativeEmotionCount: number,
  totalEntries: number
): string {
  const relationshipRatio = totalEntries > 0 ? relationshipMentions / totalEntries : 0;
  const emotionRatio = totalEntries > 0 ? negativeEmotionCount / totalEntries : 0;
  
  // 관계 언급이 높은 경우 (30% 이상)
  if (relationshipRatio >= 0.3) {
    return '이번 주 관계에서 어떤 패턴을 발견하셨나요? 그 패턴이 당신에게 무엇을 알려주고 있나요?';
  }
  
  // 부정 감정 토큰이 높은 경우 (30% 이상)
  if (emotionRatio >= 0.3) {
    return '이번 주 감정의 흐름을 돌아보면, 어떤 감정이 가장 자주 나타났나요? 그 감정의 근원은 무엇이라고 생각하시나요?';
  }
  
  // 기본: 명확성/의사결정 질문
  return '이번 주 가장 중요한 결정이나 생각은 무엇이었나요? 그 결정을 내리는 과정에서 무엇을 배웠나요?';
}

/**
 * 주간 인사이트 계산
 */
export function calculateWeeklyInsights(logs: Record<string, DailyLog>): WeeklyInsights {
  const reflections = getLast7DaysReflections(logs);
  const totalEntries = reflections.length;
  
  // 단어 빈도 계산
  const wordCount = countWords(reflections);
  const topWords = Array.from(wordCount.entries())
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10); // 상위 10개
  
  // 관계 키워드 언급 횟수
  const relationshipMentions = countRelationshipMentions(reflections);
  
  // 부정 감정 토큰 빈도
  const negativeEmotionCount = countNegativeEmotionTokens(reflections);
  
  // 주간 질문 생성
  const weeklyQuestion = generateWeeklyQuestion(
    relationshipMentions,
    negativeEmotionCount,
    totalEntries
  );
  
  return {
    totalEntries,
    topWords,
    relationshipMentions,
    weeklyQuestion,
  };
}



