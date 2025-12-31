# TrailMind 프로젝트 제안서

## 프로젝트 개요
TrailMind는 산책, 하이킹, 일상 후 개인 반성을 돕는 웹 기반 시스템입니다.

## 기술 스택 선택: **Vite + React + TypeScript + Vercel**

### 선택 이유
- ✅ **가벼움**: 초기 단계에 최적
- ✅ **빠른 개발 경험**: HMR, 빠른 빌드
- ✅ **확장성**: Vercel Serverless Functions로 쉽게 확장
- ✅ **Local-first 친화적**: 클라이언트 사이드 중심 개발
- ✅ **서버리스**: 서버 관리 없이 백엔드 기능 제공

### 대안 고려사항
- Next.js: SSR/SSG가 필요 없고, 초기에는 오버헤드
- 순수 HTML/JS: 확장성과 유지보수성 부족
- Express 서버: 서버 관리 필요, Vercel이 더 간단

## 프로젝트 구조

```
TrailMind/
├── api/
│   └── generate.ts              # Vercel Serverless Function
├── src/
│   ├── components/
│   │   ├── ReflectionInput.tsx  # 반성 내용 입력
│   │   ├── ReflectionItem.tsx   # 반성 항목 (AI 분석 포함)
│   │   ├── DailyLog.tsx          # 일일 로그 뷰어
│   │   ├── LogList.tsx           # 로그 목록
│   │   ├── WeeklyInsights.tsx    # 주간 인사이트
│   │   └── Settings.tsx          # 설정 (Export/Import)
│   ├── hooks/
│   │   ├── useLocalStorage.ts    # 로컬 스토리지 관리
│   │   └── useReflections.ts     # 반성 데이터 관리
│   ├── utils/
│   │   ├── api.ts                # API 클라이언트
│   │   ├── aiClient.ts           # AI 클라이언트 (래퍼)
│   │   ├── formatAnalysis.ts     # 분석 결과 포맷팅
│   │   ├── markdown.ts           # Markdown 처리
│   │   ├── date.ts               # 날짜 유틸리티
│   │   ├── prompts.ts            # 반성 가이드 프롬프트
│   │   ├── koreanPrompts.ts      # 한글 AI 프롬프트
│   │   ├── weeklyInsights.ts     # 주간 인사이트 계산
│   │   └── exportImport.ts       # 데이터 Export/Import
│   ├── types/
│   │   └── reflection.ts          # TypeScript 타입 정의
│   ├── App.tsx                   # 메인 앱 컴포넌트
│   └── main.tsx                  # 진입점
├── docs/                         # 문서
├── vercel.json                   # Vercel 설정
├── package.json
├── vite.config.ts
├── tsconfig.json
└── README.md
```

## MVP 범위 정의

### ✅ MVP에서 할 것 (Must Have)

1. **반성 입력**
   - 텍스트 입력 필드
   - 카테고리 선택 (사고 명확성, 감정 인식, 관계 패턴)
   - 날짜/시간 자동 기록
   - 저장 버튼

2. **로컬 저장**
   - 브라우저 LocalStorage 사용
   - 날짜별로 데이터 구조화
   - 영구 저장 (브라우저 기반)
   - 자동 마이그레이션 지원

3. **일일 로그 뷰**
   - Markdown 형식으로 표시
   - 날짜별 필터링
   - 최신순 정렬
   - AI 분석 결과 표시

4. **AI 분석**
   - OpenAI API 통합
   - 한글 프롬프트 사용
   - 구조화된 JSON 응답
   - 마크다운 형식으로 렌더링

5. **주간 인사이트**
   - 지난 7일간의 데이터 집계
   - 자주 사용된 단어 분석
   - 관계 언급 횟수
   - 휴리스틱 기반 주간 질문

6. **데이터 관리**
   - Export: JSON 파일로 다운로드
   - Import: JSON 파일에서 가져오기 및 병합

7. **최소한의 UI**
   - 깔끔한 텍스트 중심 디자인
   - 다크 모드 지원
   - 반응형 레이아웃

### ❌ MVP에서 하지 않을 것 (Won't Have)

1. **인증/사용자 관리**
   - 단일 사용자 가정
   - 로그인/회원가입 없음

2. **복잡한 기능**
   - 태그/카테고리 필터링 (나중에)
   - 검색 기능 (나중에)
   - 고급 통계/분석 (나중에)
   - 이미지 업로드 (나중에)

3. **데이터 동기화**
   - 클라우드 동기화 없음
   - 다중 디바이스 지원 없음

## 데이터 구조

```typescript
interface Reflection {
  id: string;
  date: string; // ISO 8601
  content: string; // 사용자 입력 (하위 호환성)
  rawInput: string; // 원본 사용자 입력
  category?: 'thinking' | 'emotion' | 'relationship';
  prompts?: string[]; // 사용한 가이드 프롬프트
  promptTemplateId?: string;
  generatedPrompt?: string;
  aiOutput?: string; // JSON 원본
  aiAnalysisMarkdown?: string; // 마크다운 렌더링용
  updatedAt?: string; // ISO 8601
}

interface DailyLog {
  date: string; // YYYY-MM-DD
  reflections: Reflection[];
}

interface ExportData {
  version: string;
  exportedAt: string; // ISO 8601
  logs: Record<string, DailyLog>;
}
```

## AI 통합

### 프롬프트 구조
- 3가지 GuideId: "사고_명확성", "감정_인식", "관계_패턴"
- 각 프롬프트는 JSON 스키마로 구조화된 응답 요구
- 차분하고 분석적인 톤 유지

### API 구조
- Vercel Serverless Function (`/api/generate`)
- OpenAI Chat Completions API 사용
- JSON 스키마로 구조화된 출력 보장

## 다음 단계 (Post-MVP)

1. ✅ AI API 통합 (완료)
2. ✅ 데이터 내보내기/가져오기 (완료)
3. ✅ 주간 인사이트 (완료)
4. 검색 및 필터링
5. 고급 통계 대시보드
6. 태그 시스템
7. 모바일 앱 (선택적)

## 배포

- **플랫폼**: Vercel
- **프론트엔드**: Vite 빌드 → Vercel 정적 호스팅
- **백엔드**: Vercel Serverless Functions
- **환경 변수**: Vercel 대시보드에서 관리

## 관련 문서

- [AI 통합 가이드](./AI_INTEGRATION.md)
- [로컬 개발 가이드](./LOCAL_DEVELOPMENT.md)
- [한글 반성 프롬프트](./KOREAN_REFLECTION_PROMPTS.md)
- [AI 프롬프트 디자인](./AI_PROMPT_DESIGN.md)
