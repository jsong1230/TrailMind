import type { KoreanReflectionAnalysis } from './koreanPrompts';
import { generateAiResult } from './api';

type GuideId = '사고_명확성' | '감정_인식' | '관계_패턴';

/**
 * 카테고리를 GuideId로 변환
 */
function categoryToGuideId(category: string): GuideId {
  switch (category) {
    case 'thinking':
      return '사고_명확성';
    case 'emotion':
      return '감정_인식';
    case 'relationship':
      return '관계_패턴';
    default:
      return '사고_명확성';
  }
}

/**
 * AI 분석 요청 (하위 호환성을 위한 래퍼)
 */
export async function generateReflectionAnalysis(
  input: string,
  category: string,
  meta?: {
    date?: string;
    activity?: string;
    aloneOrWith?: string;
  }
): Promise<{ analysis: KoreanReflectionAnalysis; promptVersion?: string }> {
  const guideId = categoryToGuideId(category);
  
  const response = await generateAiResult({
    guideId,
    inputText: input.trim(),
    meta,
  });

  return {
    analysis: response.result as KoreanReflectionAnalysis,
    promptVersion: response.promptVersion,
  };
}

