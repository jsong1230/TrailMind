# 자동 배포 문제 해결 가이드

자동 배포가 작동하지 않을 때 확인하고 해결하는 방법입니다.

## 🔍 문제 진단

### 1. GitHub Webhook 확인

1. https://github.com/jsong1230/TrailMind 접속
2. **Settings** → **Webhooks** 클릭
3. `vercel.com` 또는 `vercel.app` webhook 확인:
   - ✅ **Active** 상태인지 확인
   - ✅ 최근 푸시에 대한 **Recent Deliveries** 확인
   - ❌ 실패한 경우 (빨간색) → 에러 메시지 확인

### 2. Vercel 설정 재확인

1. Vercel 대시보드 → 프로젝트 → **Settings** → **Git**
2. 확인 사항:
   - **Connected Git Repository**: `jsong1230/TrailMind`
   - **Production Branch**: `main`
   - **Auto-deploy from Git**: **Enabled** (중요!)

### 3. 최근 배포 확인

1. Vercel 대시보드 → **Deployments** 탭
2. 최근 커밋 해시 확인
3. GitHub의 최신 커밋과 일치하는지 확인

## 🔧 해결 방법

### 방법 1: Git 연결 재설정 (가장 효과적)

1. **Vercel 대시보드** → 프로젝트 → **Settings** → **Git**
2. **Disconnect** 클릭
3. **Connect Git Repository** 클릭
4. `jsong1230/TrailMind` 선택
5. **Import** 클릭
6. 환경 변수 다시 설정 (필요 시)
7. **Deploy** 클릭

이렇게 하면 webhook이 자동으로 재설정됩니다.

### 방법 2: 수동 배포 (임시 해결)

자동 배포가 작동하지 않을 때 임시로 사용:

```bash
# 프로덕션 배포
vercel --prod

# 또는 특정 커밋 배포
vercel --prod --force
```

### 방법 3: GitHub Webhook 수동 재설정

1. **GitHub** → Settings → **Webhooks**
2. Vercel webhook 삭제
3. **Vercel** → Settings → **Git** → **Disconnect** 후 다시 연결
4. Webhook이 자동으로 재생성됨

### 방법 4: Vercel CLI로 확인

```bash
# 프로젝트 정보 확인
vercel ls

# 프로젝트 링크 상태 확인
vercel inspect

# 수동 배포 (자동 배포가 안 될 때)
vercel --prod
```

## 🐛 일반적인 문제

### 문제 1: Webhook이 실패함

**증상**: GitHub Webhooks에서 빨간색 실패 표시

**원인**:
- Vercel 프로젝트가 삭제되었거나 이름이 변경됨
- Vercel 계정 권한 문제
- Webhook URL이 만료됨

**해결**:
- Git 연결 재설정 (방법 1)

### 문제 2: Auto-deploy가 Disabled

**증상**: Settings → Git에서 "Auto-deploy from Git"이 Disabled

**해결**:
1. Settings → Git
2. "Auto-deploy from Git" 토글을 **Enabled**로 변경
3. **Save** 클릭

### 문제 3: 잘못된 브랜치 설정

**증상**: `main` 브랜치에 푸시했는데 배포가 안 됨

**해결**:
1. Settings → Git
2. **Production Branch**가 `main`인지 확인
3. 다른 브랜치면 `main`으로 변경

### 문제 4: 빌드 실패로 인한 자동 재배포 안 됨

**증상**: 이전 배포가 실패했고, 새 푸시가 있어도 배포가 안 됨

**해결**:
- 수동으로 배포: `vercel --prod`
- 또는 빌드 에러 수정 후 다시 푸시

## ✅ 자동 배포 작동 확인 체크리스트

- [ ] GitHub → Settings → Webhooks에서 Vercel webhook이 Active
- [ ] 최근 푸시에 대한 webhook 전송이 성공 (200 OK)
- [ ] Vercel → Settings → Git에서 "Auto-deploy from Git"이 Enabled
- [ ] Production Branch가 `main`으로 설정됨
- [ ] `git push` 후 1-2분 내에 Vercel에서 배포 시작됨

## 📞 추가 도움

위 방법으로 해결되지 않으면:
1. Vercel 대시보드 → 프로젝트 → **Deployments** → 최근 배포 클릭
2. **Build Logs** 확인하여 에러 메시지 확인
3. Vercel 지원팀에 문의 (support@vercel.com)

## 🔗 관련 문서

- [GitHub Webhook 확인 가이드](./GITHUB_WEBHOOK_GUIDE.md) ⭐ **상세 가이드**
- [Vercel 자동 배포 설정](./VERCEL_AUTO_DEPLOY_SETUP.md)
- [Vercel 배포 가이드](./VERCEL_DEPLOYMENT.md)
- [배포 검증 가이드](./DEPLOYMENT_VERIFICATION.md)

