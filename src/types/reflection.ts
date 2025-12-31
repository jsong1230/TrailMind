export type ReflectionCategory = 'thinking' | 'emotion' | 'relationship';

export interface ReflectionAnalysis {
  insightSummary: string;
  keyQuestion: string;
  suggestedReframe?: string;
}

export interface Reflection {
  id: string;
  date: string; // ISO 8601
  content: string; // 사용자 입력 (하위 호환성 유지)
  rawInput: string; // 원본 사용자 입력
  promptTemplateId?: string; // 선택된 프롬프트 템플릿 ID
  promptVersion?: string; // 프롬프트 버전 (예: "1.0.0")
  generatedPrompt?: string; // 생성된 프롬프트
  aiOutput?: string; // AI 출력 JSON 문자열 (원본 저장)
  aiAnalysisMarkdown?: string; // AI 분석 결과 마크다운 (렌더링용)
  category?: ReflectionCategory;
  prompts?: string[]; // 사용한 가이드 프롬프트 (하위 호환성)
  analysis?: ReflectionAnalysis; // AI 분석 결과 (선택적, 하위 호환성)
  updatedAt?: string; // ISO 8601, 마지막 업데이트 시간
}

export interface ExportData {
  version: string;
  exportedAt: string; // ISO 8601
  logs: Record<string, DailyLog>;
}

export interface DailyLog {
  date: string; // YYYY-MM-DD
  reflections: Reflection[];
}

