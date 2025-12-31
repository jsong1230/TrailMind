# TrailMind

산책, 하이킹, 일상 후 개인 반성을 돕는 웹 기반 시스템입니다.

## 특징

- 🧘 **사고 명확성**: 생각을 정리하고 명확하게 표현
- 💭 **감정 인식**: 감정을 인식하고 이해
- 🤝 **관계 패턴**: 관계에서의 패턴을 발견하고 성장
- 🤖 **AI 분석**: OpenAI를 활용한 구조화된 반성 분석
- 📊 **주간 인사이트**: 지난 7일간의 패턴 분석
- 💾 **Local-first**: 모든 데이터는 브라우저에 저장
- 📤 **Export/Import**: 데이터 백업 및 복원

## 기술 스택

- **프론트엔드**: Vite + React + TypeScript
- **백엔드**: Vercel Serverless Functions
- **AI**: OpenAI API (GPT-4o-mini)
- **스토리지**: 브라우저 LocalStorage
- **스타일링**: CSS (다크 모드 지원)

## 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

#### Vercel 배포 시

Vercel 대시보드에서 **Settings > Environment Variables**에 다음을 설정:

- `OPENAI_API_KEY`: OpenAI API 키 (필수)
- `OPENAI_MODEL`: 사용할 모델 (선택사항, 기본값: `gpt-4o-mini`)

#### 로컬 개발 시

Vercel CLI를 사용하여 로컬에서 서버리스 함수 실행:

```bash
# Vercel CLI 설치
npm i -g vercel

# 프로젝트 링크
vercel link

# 환경 변수 설정
vercel env add OPENAI_API_KEY
vercel env add OPENAI_MODEL

# 로컬 개발 서버 실행 (서버리스 함수 포함)
vercel dev
```

### 3. 개발 서버 실행

```bash
# Vercel CLI로 실행 (서버리스 함수 포함)
vercel dev

# 또는 프론트엔드만 실행 (프로덕션 API 사용)
npm run dev
```

### 4. 빌드

```bash
# 프론트엔드 빌드
npm run build
```

## 프로젝트 구조

```
TrailMind/
├── api/                    # Vercel Serverless Functions
│   └── generate.ts         # AI 생성 API
├── src/                    # 프론트엔드 소스
│   ├── components/         # React 컴포넌트
│   │   ├── ReflectionInput.tsx
│   │   ├── ReflectionItem.tsx
│   │   ├── DailyLog.tsx
│   │   ├── WeeklyInsights.tsx
│   │   └── Settings.tsx
│   ├── hooks/             # 커스텀 훅
│   │   ├── useReflections.ts
│   │   └── useLocalStorage.ts
│   ├── utils/             # 유틸리티 함수
│   │   ├── api.ts          # API 클라이언트
│   │   ├── aiClient.ts     # AI 클라이언트 (래퍼)
│   │   ├── formatAnalysis.ts
│   │   └── koreanPrompts.ts
│   └── types/             # TypeScript 타입
├── docs/                   # 문서
│   ├── PROJECT_PROPOSAL.md
│   ├── AI_PROMPT_DESIGN.md
│   ├── KOREAN_REFLECTION_PROMPTS.md
│   └── AI_INTEGRATION.md
├── vercel.json            # Vercel 설정
└── package.json
```

## 주요 기능

### 1. 반성 입력
- 텍스트 입력
- 카테고리 선택 (사고 명확성, 감정 인식, 관계 패턴)
- 날짜/시간 자동 기록

### 2. AI 분석
- "AI로 생성" 버튼으로 자동 분석
- 구조화된 JSON 응답
- 마크다운 형식으로 읽기 좋게 표시

### 3. 일일 로그
- 날짜별 반성 기록 조회
- Markdown 형식 표시
- 최신순 정렬

### 4. 주간 인사이트
- 지난 7일간의 데이터 집계
- 자주 사용된 단어 분석
- 관계 언급 횟수
- 휴리스틱 기반 주간 질문 생성

### 5. 데이터 관리
- Export: 모든 로그를 JSON 파일로 다운로드
- Import: JSON 파일에서 로그 가져오기 및 병합
- 자동 마이그레이션 지원

## AI 프롬프트

TrailMind는 3가지 한글 프롬프트를 사용합니다:

1. **사고 명확성**: 생각의 명료화, 사실과 해석 구분
2. **감정 인식**: 감정 신호 관찰 및 이름 붙이기
3. **관계 패턴**: 관계 패턴의 구조적 분해

각 프롬프트는 구조화된 JSON 형식으로 응답합니다:

```json
{
  "핵심_요약": "...",
  "사실과_해석": {
    "사실": ["..."],
    "해석": ["..."]
  },
  "감정_신호": ["..."],
  "관계_신호": ["..."],
  "재해석": "...",
  "오늘의_질문": "...",
  "아주_작은_행동": "..."
}
```

자세한 내용은 [docs/KOREAN_REFLECTION_PROMPTS.md](./docs/KOREAN_REFLECTION_PROMPTS.md)를 참고하세요.

## 배포

### Vercel 배포

1. GitHub에 푸시
2. Vercel에 프로젝트 연결
3. 환경 변수 설정 (`OPENAI_API_KEY`, `OPENAI_MODEL`)
4. 자동 배포 완료

```bash
# Vercel CLI로 배포
vercel
```

## 보안

- ✅ API 키는 서버 사이드에서만 사용 (Vercel 환경 변수)
- ✅ 프론트엔드에는 API 키 노출 없음
- ✅ 요청 제한 (Rate Limiting) 적용 (2.5초 쿨다운)
- ✅ 입력 검증 및 에러 처리

## 데이터 구조

모든 데이터는 브라우저 LocalStorage에 저장됩니다:

- **키**: `trailmind-reflections`
- **형식**: `Record<string, DailyLog>`
- **마이그레이션**: 자동으로 최신 스키마로 업데이트

## 개발 가이드

### API 사용

```typescript
import { generateAiResult } from './utils/api';

const result = await generateAiResult({
  guideId: '사고_명확성',
  inputText: '사용자 입력',
  meta: {
    date: '2024-01-01',
    activity: 'walk',
    aloneOrWith: 'alone'
  }
});
```

### 로컬 스토리지 접근

```typescript
import { useReflections } from './hooks/useReflections';

const { addReflection, getDailyLogs, updateReflection } = useReflections();
```

## 문서

- [프로젝트 제안서](./docs/PROJECT_PROPOSAL.md)
- [AI 통합 가이드](./docs/AI_INTEGRATION.md)
- [로컬 개발 가이드](./docs/LOCAL_DEVELOPMENT.md)
- [AI 프롬프트 디자인](./docs/AI_PROMPT_DESIGN.md)
- [한글 반성 프롬프트](./docs/KOREAN_REFLECTION_PROMPTS.md)
- [일일 반성 템플릿](./docs/DAILY_REFLECTION_TEMPLATE.md)

## 라이선스

Private

## 기여

이 프로젝트는 개인 프로젝트입니다.
