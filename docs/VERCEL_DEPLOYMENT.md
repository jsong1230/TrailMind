# Vercel 배포 가이드

## Vercel이란?

**Vercel**은 프론트엔드와 서버리스 함수를 무료로 호스팅하는 플랫폼입니다.

### 핵심 개념

1. **서버 없이 실행 가능**: 별도의 서버를 구축하거나 관리할 필요 없음
2. **자동 배포**: GitHub에 푸시하면 자동으로 배포됨
3. **무료 도메인 제공**: `your-project.vercel.app` 형태의 무료 도메인 자동 생성
4. **커스텀 도메인 지원**: 자신의 도메인 연결 가능
5. **서버리스 함수**: `/api/` 폴더의 함수가 자동으로 서버리스 함수로 변환됨

## Vercel 작동 방식

### 1. 프로젝트 구조

```
TrailMind/
├── src/              # 프론트엔드 (React)
├── api/              # 서버리스 함수 (자동으로 /api/* 엔드포인트가 됨)
│   └── generate.ts   # → https://your-app.vercel.app/api/generate
├── vercel.json       # Vercel 설정 파일
└── package.json
```

### 2. 배포 시 자동 처리

- `src/` → 정적 파일로 빌드되어 CDN에 배포
- `api/generate.ts` → 서버리스 함수로 변환되어 `/api/generate` 엔드포인트 생성
- 환경 변수는 Vercel 대시보드에서 관리

## 로컬 테스트 방법

### 1단계: Vercel CLI 설치

```bash
npm i -g vercel
```

### 2단계: Vercel에 로그인

```bash
vercel login
```

브라우저가 열리면 GitHub 계정으로 로그인합니다.

### 3단계: 프로젝트 링크 (처음 한 번만)

```bash
cd /Users/jsong/dev/jsong1230-github/TrailMind
vercel link
```

질문에 답변:
- **Set up and deploy?** → `Y`
- **Which scope?** → 본인 계정 선택
- **Link to existing project?** → `N` (처음이면)
- **Project name?** → `TrailMind` (또는 원하는 이름)
- **Directory?** → `./` (현재 디렉토리)

### 4단계: 환경 변수 설정

`.env.local` 파일이 이미 있다면, Vercel CLI가 자동으로 읽습니다:

```env
OPENAI_API_KEY=sk-your-api-key-here
OPENAI_MODEL=gpt-4o-mini
```

### 5단계: 로컬 개발 서버 실행

```bash
vercel dev
```

이제:
- ✅ 프론트엔드: `http://localhost:3000`
- ✅ 서버리스 함수: `http://localhost:3000/api/generate`
- ✅ `.env.local` 환경 변수 자동 로드
- ✅ 프로덕션과 동일한 환경에서 테스트 가능

### 로컬 테스트 확인

1. 브라우저에서 `http://localhost:3000` 접속
2. 반성 입력 후 "AI로 생성" 버튼 클릭
3. AI 분석 결과가 나오면 성공!

## 실제 배포 방법

### 방법 1: GitHub 연동 (권장, 자동 배포)

#### 1단계: GitHub에 푸시 (이미 완료됨)

```bash
git push origin main
```

#### 2단계: Vercel 대시보드에서 프로젝트 가져오기

1. https://vercel.com 접속
2. "Add New..." → "Project" 클릭
3. "Import Git Repository"에서 `jsong1230/TrailMind` 선택
4. "Import" 클릭

#### 3단계: 빌드 설정 확인

Vercel이 자동으로 감지:
- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

변경 필요 없으면 "Deploy" 클릭.

#### 4단계: 환경 변수 설정

배포 전에 환경 변수를 설정해야 합니다:

1. "Environment Variables" 섹션으로 이동
2. 다음 변수 추가:
   - **Name**: `OPENAI_API_KEY`
   - **Value**: `sk-your-api-key-here`
   - **Environment**: Production, Preview, Development 모두 체크
3. "Save" 클릭

#### 5단계: 배포 완료

"Deploy" 버튼 클릭하면:
- 자동으로 빌드 시작
- 약 1-2분 후 배포 완료
- `https://trailmind-xxx.vercel.app` 형태의 URL 생성

#### 6단계: 자동 배포 설정 완료

이제부터:
- `git push` → 자동으로 배포됨
- Pull Request 생성 → Preview 배포 자동 생성
- `main` 브랜치 푸시 → Production 배포

### 방법 2: Vercel CLI로 직접 배포

```bash
# 프로젝트 루트에서
vercel

# 프로덕션 배포
vercel --prod
```

## 도메인 설정

### 무료 도메인 (자동 생성)

배포 완료 시 자동으로 생성됩니다:
- `https://trailmind-xxx.vercel.app`
- 또는 `https://trailmind.vercel.app` (프로젝트 이름에 따라)

### 커스텀 도메인 연결

#### 1단계: Vercel 대시보드에서 도메인 추가

1. 프로젝트 → Settings → Domains
2. "Add Domain" 클릭
3. 원하는 도메인 입력 (예: `trailmind.com`)

#### 2단계: DNS 설정

Vercel이 제공하는 DNS 레코드를 도메인 등록업체에 추가:

**예시 (Cloudflare, GoDaddy 등):**
- **Type**: `CNAME`
- **Name**: `@` 또는 `www`
- **Value**: `cname.vercel-dns.com`

또는:
- **Type**: `A`
- **Name**: `@`
- **Value**: Vercel이 제공하는 IP 주소

#### 3단계: SSL 인증서 자동 발급

Vercel이 자동으로 SSL 인증서를 발급하여 HTTPS를 활성화합니다 (약 1-24시간 소요).

## 배포 후 확인

### 1. 배포 상태 확인

Vercel 대시보드에서:
- "Deployments" 탭에서 배포 상태 확인
- "Functions" 탭에서 서버리스 함수 로그 확인

### 2. 실제 동작 테스트

1. 배포된 URL 접속 (예: `https://trailmind.vercel.app`)
2. 반성 입력 후 "AI로 생성" 버튼 클릭
3. AI 분석 결과 확인

### 3. 문제 발생 시

**환경 변수 확인:**
- Vercel 대시보드 → Settings → Environment Variables
- `OPENAI_API_KEY`가 설정되어 있는지 확인

**함수 로그 확인:**
- Vercel 대시보드 → Functions 탭
- `/api/generate` 함수의 로그 확인
- 에러 메시지 확인

**로컬에서 재테스트:**
```bash
vercel dev
```

## 요약: 로컬 vs 프로덕션

| 항목 | 로컬 테스트 | 프로덕션 배포 |
|------|------------|--------------|
| **명령어** | `vercel dev` | `git push` (자동) 또는 `vercel --prod` |
| **URL** | `http://localhost:3000` | `https://trailmind.vercel.app` |
| **환경 변수** | `.env.local` 파일 | Vercel 대시보드에서 설정 |
| **서버리스 함수** | 로컬에서 실행 | Vercel 서버에서 실행 |
| **빌드** | 필요 없음 | 자동 빌드 |

## 자주 묻는 질문

### Q: 서버를 따로 구축해야 하나요?

**A: 아니요.** Vercel이 모든 것을 처리합니다:
- 프론트엔드 호스팅 (CDN)
- 서버리스 함수 실행
- SSL 인증서
- 도메인 관리

### Q: 비용이 얼마나 드나요?

**A: 무료 플랜으로 충분합니다:**
- 무료 플랜: 월 100GB 대역폭, 무제한 서버리스 함수 실행
- TrailMind 같은 개인 프로젝트는 무료로 충분

### Q: 환경 변수는 어디에 저장되나요?

**A:**
- **로컬**: `.env.local` 파일 (Git에 커밋하지 않음)
- **프로덕션**: Vercel 대시보드 → Settings → Environment Variables

### Q: API 키가 노출되지 않나요?

**A: 안전합니다:**
- `.env.local`은 `.gitignore`에 포함되어 Git에 커밋되지 않음
- Vercel 대시보드의 환경 변수는 암호화되어 저장됨
- 서버리스 함수에서만 접근 가능 (프론트엔드에서 직접 접근 불가)

### Q: 로컬에서 테스트할 때도 API 키가 필요하나요?

**A: 네.** `vercel dev` 실행 시 `.env.local`의 `OPENAI_API_KEY`를 사용합니다.

### Q: 배포 후 코드를 수정하면?

**A: 자동으로 재배포됩니다:**
```bash
git add .
git commit -m "Update feature"
git push origin main
```
→ Vercel이 자동으로 감지하여 재배포

## 다음 단계

1. ✅ 로컬 테스트: `vercel dev`
2. ✅ GitHub에 푸시: `git push`
3. ✅ Vercel 대시보드에서 프로젝트 가져오기
4. ✅ 환경 변수 설정
5. ✅ 배포 완료!

## 관련 문서

- [로컬 개발 가이드](./LOCAL_DEVELOPMENT.md)
- [AI 통합 가이드](./AI_INTEGRATION.md)
- [프로젝트 제안서](./PROJECT_PROPOSAL.md)

