# 로컬 개발 가이드

## 환경 변수 설정

### .env.local 파일

프로젝트 루트에 `.env.local` 파일을 생성하고 다음을 설정하세요:

```env
OPENAI_API_KEY=sk-your-api-key-here
OPENAI_MODEL=gpt-4o-mini
```

## 로컬 개발 서버 실행

### 방법 1: Vercel CLI 사용 (권장)

Vercel Serverless Functions를 포함하여 로컬에서 실행:

```bash
# Vercel CLI 설치 (처음 한 번만)
npm i -g vercel

# 프로젝트 링크 (처음 한 번만)
vercel link

# 로컬 개발 서버 실행
vercel dev
```

이 방법을 사용하면:
- ✅ `.env.local` 파일의 환경 변수를 자동으로 읽음
- ✅ `/api/generate` 서버리스 함수가 로컬에서 작동
- ✅ 프론트엔드와 백엔드 모두 실행

### 방법 2: 프론트엔드만 실행

```bash
npm run dev
```

이 방법을 사용하면:
- ⚠️ 프론트엔드만 실행됨
- ⚠️ `/api/generate`는 프로덕션 환경을 호출하거나 작동하지 않을 수 있음
- ⚠️ `.env.local`은 서버리스 함수에서 읽히지 않음

## 환경 변수 확인

### .env.local 파일 확인

```bash
cat .env.local
```

다음이 포함되어 있어야 합니다:
- `OPENAI_API_KEY=sk-...`
- `OPENAI_MODEL=gpt-4o-mini` (선택사항)

### 서버에서 환경 변수 읽기 확인

`vercel dev` 실행 후, 브라우저 콘솔에서 API 호출 시:
- 성공: AI 분석 결과가 표시됨
- 실패: "서버에 OPENAI_API_KEY가 설정되지 않았습니다" 오류

## 문제 해결

### 환경 변수가 읽히지 않는 경우

1. **파일 위치 확인**
   - `.env.local`이 프로젝트 루트에 있는지 확인
   - `api/` 폴더가 아닌 루트에 있어야 함

2. **Vercel CLI 사용 확인**
   - `npm run dev`가 아닌 `vercel dev` 사용
   - Vercel CLI가 `.env.local`을 자동으로 로드

3. **환경 변수 이름 확인**
   - `OPENAI_API_KEY` (대문자)
   - 오타나 공백이 없는지 확인

4. **서버 재시작**
   - 환경 변수 변경 후 `vercel dev` 재시작 필요

### API 호출이 실패하는 경우

1. **API 키 유효성 확인**
   - OpenAI 대시보드에서 API 키 확인
   - 키가 활성화되어 있는지 확인

2. **네트워크 확인**
   - OpenAI API에 접근 가능한지 확인
   - 방화벽이나 프록시 설정 확인

3. **콘솔 로그 확인**
   - 브라우저 개발자 도구의 Network 탭 확인
   - `/api/generate` 요청의 응답 확인

## 프로덕션 배포

로컬 `.env.local`은 프로덕션에 자동으로 배포되지 않습니다.

Vercel 대시보드에서 환경 변수를 별도로 설정해야 합니다:

1. Vercel 대시보드 접속
2. 프로젝트 선택
3. Settings > Environment Variables
4. 다음 추가:
   - `OPENAI_API_KEY`: API 키
   - `OPENAI_MODEL`: `gpt-4o-mini` (선택사항)

## 관련 문서

- [AI 통합 가이드](./AI_INTEGRATION.md)
- [프로젝트 제안서](./PROJECT_PROPOSAL.md)

