# AI 통합 가이드

## 개요

TrailMind는 Vercel Serverless Functions를 통해 안전하게 AI API를 통합하여 사용자의 반성 내용을 분석합니다. API 키는 서버 사이드에서만 사용되며, 프론트엔드에는 노출되지 않습니다.

## 아키텍처

```
프론트엔드 (React) 
    ↓ HTTP 요청
    ↓ /api/generate
Vercel Serverless Function
    ↓ API 키 사용 (환경 변수)
OpenAI API
    ↓ JSON 응답
Vercel Serverless Function
    ↓ JSON 전달
프론트엔드
```

## 파일 구조

```text
TrailMind/
├── api/
│   └── generate.ts          # Vercel Serverless Function
├── src/
│   ├── utils/
│   │   ├── api.ts            # 프론트엔드 API 클라이언트
│   │   ├── aiClient.ts       # AI 클라이언트 (래퍼)
│   │   └── formatAnalysis.ts # 분석 결과 포맷팅
│   └── components/
│       └── ReflectionItem.tsx # AI 분석 UI
└── vercel.json               # Vercel 설정
```

## 환경 변수 설정

### Vercel 배포 시

Vercel 대시보드에서 **Settings > Environment Variables**에 설정:

- `OPENAI_API_KEY`: OpenAI API 키 (필수)
- `OPENAI_MODEL`: 사용할 모델 (선택사항, 기본값: `gpt-4o-mini`)

### 로컬 개발 시

Vercel CLI를 사용하여 로컬에서 서버리스 함수 실행:

```bash
# Vercel CLI 설치
npm i -g vercel

# 프로젝트 링크
vercel link

# 환경 변수 설정
vercel env add OPENAI_API_KEY
vercel env add OPENAI_MODEL

# 로컬 개발 서버 실행
vercel dev
```

## API 엔드포인트

### POST /api/generate

사용자의 반성 내용을 AI로 분석합니다.

**요청:**
```json
{
  "guideId": "사고_명확성" | "감정_인식" | "관계_패턴",
  "inputText": "사용자의 반성 내용",
  "meta": {
    "date": "2024-01-01",
    "activity": "walk",
    "aloneOrWith": "alone"
  }
}
```

**응답:**
```json
{
  "ok": true,
  "model": "gpt-4o-mini",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "result": {
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
}
```

**에러 응답:**
```json
{
  "ok": false,
  "message": "에러 메시지"
}
```

## 보안 기능

### 1. API 키 보호
- API 키는 Vercel 환경 변수로 관리
- 서버 사이드에서만 사용
- 프론트엔드에 노출되지 않음

### 2. 요청 제한 (Rate Limiting)
- 같은 IP에서 2.5초 이내 연속 호출 방지
- 메모리 기반 간단한 캐싱
- 실수 방지용 쿨다운

### 3. 입력 검증
- `guideId` 필수 및 유효성 검증
- `inputText` 필수 및 공백 제거
- `meta` 선택사항
- 에러 처리 및 안전한 응답

## 사용 방법

### 프론트엔드에서 사용

```typescript
import { generateAiResult } from './utils/api';

// 직접 사용
const result = await generateAiResult({
  guideId: '사고_명확성',
  inputText: '사용자 입력',
  meta: {
    date: '2024-01-01',
    activity: 'walk',
    aloneOrWith: 'alone'
  }
});

// 또는 래퍼 함수 사용
import { generateReflectionAnalysis } from './utils/aiClient';

const analysis = await generateReflectionAnalysis(
  '사용자 입력',
  'thinking', // 'thinking' | 'emotion' | 'relationship'
  {
    date: '2024-01-01',
    activity: 'walk'
  }
);
```

### 개발 환경

```bash
# Vercel CLI로 실행 (서버리스 함수 포함)
vercel dev

# 또는 프론트엔드만 실행 (프로덕션 API 사용)
npm run dev
```

### 프로덕션 배포

1. Vercel에 프로젝트 연결
2. 환경 변수 설정 (`OPENAI_API_KEY`, `OPENAI_MODEL`)
3. 자동 배포 완료

```bash
# Vercel CLI로 배포
vercel
```

## 응답 처리

### JSON 파싱

```typescript
const result = await generateAiResult({...});
const analysis = result.result; // TrailMindJson 타입
```

### 마크다운 변환

```typescript
import { formatAnalysisToMarkdown } from './utils/formatAnalysis';

const markdown = formatAnalysisToMarkdown(analysis);
// 사람이 읽기 좋은 마크다운 형식으로 변환
```

## 프롬프트 구조

프롬프트는 `api/generate.ts`의 `GUIDE_PROMPTS` 객체에 정의되어 있습니다:

- **사고_명확성**: 생각의 명료화, 사실과 해석 구분
- **감정_인식**: 감정 신호 관찰 및 이름 붙이기
- **관계_패턴**: 관계 패턴의 구조적 분해

각 프롬프트는 JSON 스키마를 사용하여 구조화된 응답을 보장합니다.

자세한 내용은 [한글 반성 프롬프트](./KOREAN_REFLECTION_PROMPTS.md) 문서를 참고하세요.

## 트러블슈팅

### API 키 오류

- Vercel 대시보드에서 환경 변수 확인
- 환경 변수 이름이 정확한지 확인 (`OPENAI_API_KEY`)
- Vercel 재배포 필요

### Rate Limit 오류

- 2.5초 간격으로 요청
- "요청이 너무 빠릅니다" 메시지 확인
- 잠시 후 다시 시도

### JSON 파싱 오류

- AI 응답이 JSON 스키마를 따르지 않는 경우
- 모델 설정 확인 (`OPENAI_MODEL`)
- 프롬프트 확인

### CORS 오류

- Vercel에서는 자동으로 처리됨
- 로컬 개발 시 `vercel dev` 사용 권장

## 성능 최적화

- Serverless Functions는 요청 시에만 실행
- 자동 스케일링
- 최대 실행 시간: 30초 (vercel.json 설정)

## 비용 최적화

- GPT-4o-mini 사용 권장 (비용 효율적)
- 요청 제한으로 불필요한 호출 방지
- 캐싱 전략 고려 (향후 구현)

## 관련 문서

- [로컬 개발 가이드](./LOCAL_DEVELOPMENT.md)
- [한글 반성 프롬프트](./KOREAN_REFLECTION_PROMPTS.md)
- [AI 프롬프트 디자인](./AI_PROMPT_DESIGN.md)
- [프로젝트 제안서](./PROJECT_PROPOSAL.md)
