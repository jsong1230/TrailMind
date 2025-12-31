# 자동 배포 고치기 - 간단한 해결 방법

`git push` 해도 Vercel에서 자동 배포가 안 될 때, 가장 확실한 해결 방법입니다.

## 🔧 해결 방법 (5분 소요)

### Step 1: Vercel 대시보드 접속

1. 브라우저에서 https://vercel.com 접속
2. 로그인
3. 프로젝트 목록에서 **TrailMind** (또는 **trail-mind**) 클릭

### Step 2: Git 연결 해제

1. 프로젝트 페이지에서 상단의 **Settings** 탭 클릭
2. 왼쪽 메뉴에서 **Git** 클릭
3. "Connected Git Repository" 섹션에서 **Disconnect** 버튼 클릭
4. 확인 대화상자에서 **Disconnect** 클릭

### Step 3: Git 저장소 다시 연결

1. 같은 페이지에서 **Connect Git Repository** 버튼 클릭
2. GitHub 저장소 목록에서 **jsong1230/TrailMind** 선택
3. **Import** 버튼 클릭

### Step 4: 빌드 설정 확인 (변경 불필요)

- Framework Preset: **Vite** (자동 감지됨)
- Build Command: `npm run build`
- Output Directory: `dist`

변경 필요 없으면 그대로 두세요.

### Step 5: 환경 변수 확인

1. **Environment Variables** 섹션으로 스크롤
2. 다음 변수가 있는지 확인:
   - `OPENAI_API_KEY` = `sk-...` (OpenAI API 키)
   - `OPENAI_MODEL` = `gpt-4o-mini` (선택사항)

**없으면 추가:**
1. **Add** 버튼 클릭
2. Name: `OPENAI_API_KEY`
3. Value: OpenAI API 키 입력
4. Environment: **Production**, **Preview**, **Development** 모두 체크
5. **Save** 클릭

### Step 6: 배포 시작

1. 페이지 하단의 **Deploy** 버튼 클릭
2. 빌드가 시작됩니다 (1-2분 소요)
3. 배포 완료 후 자동 배포가 활성화됩니다!

## ✅ 확인 방법

### 방법 1: 테스트 푸시 (가장 확실한 방법)

```bash
# 작은 변경사항 만들기
echo "<!-- test -->" >> index.html
git add index.html
git commit -m "test: 자동 배포 테스트"
git push origin main
```

**푸시 후 확인:**
1. Vercel 대시보드 접속: https://vercel.com
2. 프로젝트 선택 (TrailMind)
3. 상단의 **Deployments** 탭 클릭
4. 1-2분 내에 새 배포가 자동으로 시작되는지 확인
   - ✅ 새 배포가 보이면 → 자동 배포 작동 중!
   - ❌ 새 배포가 없으면 → 아직 문제 있음

### 방법 2: GitHub Webhook 확인 (선택사항)

**중요**: 이 방법은 확인용입니다. Webhook을 수동으로 만들 필요는 없습니다!
Vercel에서 Git 저장소를 연결하면 자동으로 webhook이 생성됩니다.

**확인만 하려면:**
1. 브라우저에서 https://github.com/jsong1230/TrailMind 접속
2. 저장소 페이지 상단의 **Settings** 탭 클릭
   - ⚠️ 주의: 저장소 관리자 권한이 있어야 Settings가 보입니다
3. 왼쪽 사이드바에서 **Webhooks** 클릭
   - 위치: "Code and automation" 섹션 아래
4. Webhook 목록 확인:
   - ✅ `vercel.com` 또는 `vercel.app` URL을 가진 webhook이 있으면 정상
   - ✅ **Active** 상태면 정상
   - ❌ webhook이 없거나 **Inactive**면 문제 있음

**Webhook이 없거나 Inactive면:**
- Vercel에서 Git 연결을 다시 해야 합니다 (위 Step 1-5 참고)
- GitHub에서 수동으로 webhook을 만들 필요는 없습니다!

## 🎯 핵심 포인트

- **Git 연결을 해제하고 다시 연결**하면 webhook이 자동으로 재설정됩니다
- 이 과정을 거치면 자동 배포가 다시 작동합니다
- 환경 변수는 다시 설정해야 할 수 있습니다

## ❓ 여전히 안 되면?

1. Vercel 대시보드 → **Deployments** 탭
2. 최근 배포 클릭
3. **Build Logs** 확인하여 에러 메시지 확인
4. 에러가 있으면 수정 후 다시 푸시

## 💡 임시 해결책

자동 배포가 작동하지 않을 때는 수동 배포를 사용하세요:

```bash
vercel --prod
```

이 명령어로 최신 커밋을 프로덕션에 배포할 수 있습니다.

