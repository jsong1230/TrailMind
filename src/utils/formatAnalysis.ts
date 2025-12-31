import type { KoreanReflectionAnalysis } from './koreanPrompts';

/**
 * AI 분석 결과(JSON)를 사람이 읽기 좋은 마크다운으로 변환
 * 빈 필드는 조건부로 렌더링하여 읽기 좋은 흐름 유지
 */
export function formatAnalysisToMarkdown(analysis: KoreanReflectionAnalysis): string {
  let markdown = '## AI 분석 결과\n\n';

  // 핵심 요약 (항상 표시)
  if (analysis.핵심_요약 && analysis.핵심_요약.trim()) {
    markdown += `### 핵심 요약\n\n${analysis.핵심_요약.trim()}\n\n`;
  }

  // 사실과 해석 (둘 중 하나라도 있으면 섹션 표시)
  const hasFacts = analysis.사실과_해석?.사실 && analysis.사실과_해석.사실.length > 0;
  const hasInterpretations = analysis.사실과_해석?.해석 && analysis.사실과_해석.해석.length > 0;
  
  if (hasFacts || hasInterpretations) {
    markdown += `### 사실과 해석\n\n`;
    
    if (hasFacts) {
      markdown += `**사실:**\n`;
      analysis.사실과_해석.사실.forEach((fact) => {
        if (fact && fact.trim()) {
          markdown += `- ${fact.trim()}\n`;
        }
      });
      markdown += `\n`;
    }

    if (hasInterpretations) {
      markdown += `**해석:**\n`;
      analysis.사실과_해석.해석.forEach((interpretation) => {
        if (interpretation && interpretation.trim()) {
          markdown += `- ${interpretation.trim()}\n`;
        }
      });
      markdown += `\n`;
    }
  }

  // 감정 신호 (있는 경우만)
  if (analysis.감정_신호 && analysis.감정_신호.length > 0) {
    const validEmotions = analysis.감정_신호.filter((e) => e && e.trim());
    if (validEmotions.length > 0) {
      markdown += `### 감정 신호\n\n`;
      validEmotions.forEach((emotion) => {
        markdown += `- ${emotion.trim()}\n`;
      });
      markdown += `\n`;
    }
  }

  // 관계 신호 (있는 경우만)
  if (analysis.관계_신호 && analysis.관계_신호.length > 0) {
    const validRelations = analysis.관계_신호.filter((r) => r && r.trim());
    if (validRelations.length > 0) {
      markdown += `### 관계 신호\n\n`;
      validRelations.forEach((relation) => {
        markdown += `- ${relation.trim()}\n`;
      });
      markdown += `\n`;
    }
  }

  // 재해석 (있는 경우만)
  if (analysis.재해석 && analysis.재해석.trim()) {
    markdown += `### 재해석\n\n${analysis.재해석.trim()}\n\n`;
  }

  // 오늘의 질문 (항상 표시 - 필수 필드)
  if (analysis.오늘의_질문 && analysis.오늘의_질문.trim()) {
    markdown += `### 오늘의 질문\n\n> ${analysis.오늘의_질문.trim()}\n\n`;
  }

  // 아주 작은 행동 (있는 경우만)
  if (analysis.아주_작은_행동 && analysis.아주_작은_행동.trim()) {
    markdown += `### 아주 작은 행동\n\n${analysis.아주_작은_행동.trim()}\n\n`;
  }

  return markdown.trim();
}

/**
 * JSON 문자열을 파싱하여 마크다운으로 변환
 */
export function parseAndFormatAnalysis(jsonString: string): string {
  try {
    const analysis = JSON.parse(jsonString) as KoreanReflectionAnalysis;
    return formatAnalysisToMarkdown(analysis);
  } catch (error) {
    console.error('Failed to parse analysis JSON:', error);
    return `## AI 분석 결과\n\nJSON 파싱 오류가 발생했습니다.\n\n\`\`\`json\n${jsonString}\n\`\`\``;
  }
}

