# Vercel 자동 배포 설정 확인 가이드

GitHub에 푸시할 때 자동으로 배포되도록 설정하는 방법과 확인 방법입니다.

## 🔍 자동 배포 설정 확인 방법

### 1. Vercel 대시보드에서 확인

#### Step 1: 프로젝트 설정 접근
1. https://vercel.com 접속
2. 로그인
3. 프로젝트 목록에서 `TrailMind` (또는 `trail-mind`) 선택

#### Step 2: Git 연동 확인
1. 프로젝트 페이지에서 **Settings** 탭 클릭
2. 왼쪽 메뉴에서 **Git** 클릭
3. 확인 사항:
   - ✅ **Connected Git Repository**: `jsong1230/TrailMind` 표시되어야 함
   - ✅ **Production Branch**: `main` (또는 `master`)
   - ✅ **Auto-deploy from Git**: **Enabled** 상태여야 함

#### Step 3: Deploy Hooks 확인 (선택사항)
1. Settings → **Git** 또는 **Deploy Hooks** 섹션 확인
2. GitHub webhook이 자동으로 설정되어 있어야 함

### 2. GitHub에서 Webhook 확인

#### Step 1: GitHub 저장소 접근
1. https://github.com/jsong1230/TrailMind 접속
2. **Settings** 탭 클릭

#### Step 2: Webhooks 확인
1. 왼쪽 메뉴에서 **Webhooks** 클릭
2. 확인 사항:
   - ✅ `vercel.com` 또는 `vercel.app` 도메인의 webhook이 있어야 함
   - ✅ **Active** 상태여야 함
   - ✅ **Events**: `push` 이벤트가 체크되어 있어야 함

#### Step 3: Webhook 테스트
1. Webhook 항목 클릭
2. **Recent Deliveries** 탭에서 최근 푸시 이벤트 확인
3. 최근 푸시에 대한 응답이 `200 OK`인지 확인

## 🔧 자동 배포 설정하기 (처음 설정하는 경우)

### 방법 1: Vercel 대시보드에서 설정

#### Step 1: 새 프로젝트 가져오기
1. https://vercel.com 접속
2. **Add New...** → **Project** 클릭
3. **Import Git Repository** 클릭
4. `jsong1230/TrailMind` 선택
5. **Import** 클릭

#### Step 2: 빌드 설정 확인
- **Framework Preset**: Vite (자동 감지)
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

변경 필요 없으면 그대로 두고 **Deploy** 클릭

#### Step 3: 환경 변수 설정
1. **Environment Variables** 섹션으로 이동
2. 다음 변수 추가:
   - **Name**: `OPENAI_API_KEY`
   - **Value**: `sk-your-api-key-here`
   - **Environment**: Production, Preview, Development 모두 체크
3. **Save** 클릭

#### Step 4: 배포 완료
- **Deploy** 버튼 클릭
- 배포 완료 후 자동 배포가 활성화됨

### 방법 2: Vercel CLI로 확인

```bash
# 프로젝트 정보 확인
vercel ls

# 프로젝트 링크 확인
vercel inspect

# 프로젝트 설정 확인
vercel project ls
```

## ✅ 자동 배포 작동 확인

### 테스트 방법

1. **작은 변경사항 만들기**
   ```bash
   # README에 주석 추가
   echo "# Test" >> README.md
   git add README.md
   git commit -m "test: 자동 배포 테스트"
   git push origin main
   ```

2. **Vercel 대시보드 확인**
   - 1-2분 내에 새 배포가 시작되는지 확인
   - Deployments 탭에서 새 배포 항목 확인

3. **GitHub Webhook 로그 확인**
   - GitHub → Settings → Webhooks
   - 최근 푸시에 대한 webhook 전송 확인

## 🐛 문제 해결

### 문제 1: 자동 배포가 작동하지 않음

**증상**: `git push` 후에도 Vercel에서 배포가 시작되지 않음

**해결 방법**:
1. Vercel 대시보드 → Settings → Git 확인
2. "Auto-deploy from Git"이 **Enabled**인지 확인
3. GitHub webhook이 활성 상태인지 확인
4. 필요 시 webhook 재설정:
   - Vercel → Settings → Git → "Disconnect" 후 다시 연결

### 문제 2: GitHub Webhook이 없음

**해결 방법**:
1. Vercel → Settings → Git
2. 저장소 연결 해제 후 다시 연결
3. 또는 Vercel CLI 사용:
   ```bash
   vercel link
   ```

### 문제 3: Webhook이 실패함

**증상**: GitHub Webhooks에서 `200 OK` 대신 에러 응답

**해결 방법**:
1. GitHub → Settings → Webhooks → 실패한 webhook 클릭
2. "Recent Deliveries"에서 에러 메시지 확인
3. Vercel 대시보드에서 프로젝트 설정 확인
4. 필요 시 Vercel 지원팀에 문의

## 📋 체크리스트

자동 배포가 제대로 설정되었는지 확인:

- [ ] Vercel 대시보드에서 프로젝트가 GitHub 저장소와 연결되어 있음
- [ ] Settings → Git에서 "Auto-deploy from Git"이 Enabled
- [ ] GitHub → Settings → Webhooks에서 Vercel webhook이 Active 상태
- [ ] 최근 푸시에 대한 webhook 전송이 성공함 (200 OK)
- [ ] `git push` 후 1-2분 내에 Vercel에서 자동 배포 시작됨

## 🔗 관련 문서

- [GitHub Webhook 확인 가이드](./GITHUB_WEBHOOK_GUIDE.md) ⭐ **상세 가이드**
- [자동 배포 문제 해결](./TROUBLESHOOTING_AUTO_DEPLOY.md)
- [Vercel 배포 가이드](./VERCEL_DEPLOYMENT.md)
- [배포 검증 가이드](./DEPLOYMENT_VERIFICATION.md)

