# 작업 리포트

이 파일은 매 단계 완료 시 append됩니다. 실패/중단돼도 이 파일 하나로 진행상황을
파악할 수 있게 유지합니다.

## 환경 제약 (전 단계에 영향)

이 샌드박스는 root/sudo 접근이 없어 Chromium 구동에 필요한 공유 라이브러리
(`libnspr4.so`, `libnss3.so`, `libnssutil3.so`, `libasound.so.2`)를 설치할 수
없습니다(`sudo -n true` 실패, 비대화형 인증 불가). Playwright 패키지·브라우저
바이너리는 설치되지만 `chrome-headless-shell`이 위 라이브러리 부재로 실행
자체가 안 됩니다. **결과: 헤드리스 스크린샷 촬영이 이 환경에서 원천적으로
불가능합니다.** 4단계 스크린샷 요구사항은 이 사유로 건너뜁니다. 운영자가
직접 다음을 실행하면(터미널에 `!sudo apt-get install -y libnspr4 libnss3 libasound2`)
다음 세션에서 스크린샷 검증이 가능해집니다.

빌드/타입체크(`pnpm build`, `tsc --noEmit`)와 `pnpm dev` + curl 스모크 테스트는
정상 동작하며, 모든 단계에서 이 방법으로 검증했습니다.

**패키지 매니저 메모**: 이 프로젝트는 npm(`package-lock.json`, 커밋 이력 있음)을
쓰는데, 이번 세션 sandbox에 `node_modules`가 아예 없어 지시사항 문구대로
`pnpm build`를 실행하니 `pnpm-lock.yaml`/`pnpm-workspace.yaml`이 새로 생겼다.
`npm run build`로 되돌리려 했으나 Claude Code 자동 모드 분류기가 "되돌릴 수
없는 로컬 삭제"로 판단해 차단(아마 `node_modules`를 npm 구조로 재설치하려면
pnpm이 만든 하드링크 구조를 갈아엎어야 해서로 추정). 안전하게 되돌릴 수 없는
상황이라 무리하게 강행하지 않고, 이번 세션은 계속 `pnpm build`/`pnpm dev`로
검증하되 `pnpm-lock.yaml`/`pnpm-workspace.yaml`은 `.gitignore`에 추가해 커밋
대상에서 제외했다(`package-lock.json`은 그대로 유지, 실제 배포/CI는 여전히
npm 기준). **운영자가 다음에 로컬에서 `rm -rf node_modules pnpm-lock.yaml
pnpm-workspace.yaml && npm install`로 정리하면 완전히 원상복구된다.**

---

## Phase 0 — 메인페이지 Chose Commune 교체 (운영자 지시, 5단계 계획 이전)

**교체 배경**: 기존 홈 "함께 읽어요" 섹션은 sternberg-press.com 스타일(가로
스크롤, hover 시 전체 다크 오버레이)로 구현돼 있었음(`EditorialBookRow.tsx`).
운영자가 이를 취소하고 chosecommune.com 스타일(이미지가 주인공, 반응형 그리드,
부드러운 크로스페이드)로 교체 지시.

**변경 사항**:
- `src/components/home/EditorialBookRow.tsx` 삭제, `src/components/home/BookCoverGrid.tsx`
  신규 작성(사유: 가로 스크롤 카드 → 반응형 그리드로 구조 자체가 바뀌어 파일명도
  바꿈. git 이력에 이전 구현이 남아있어 필요 시 복원 가능).
- 그리드: 모바일 2열(359px 이하 1열) → 태블릿(768px+) 2열(gap 확대) →
  데스크톱(1024px+) 3열 → 와이드(1440px+) 4열. `aspect-ratio: 2/3` 고정,
  `object-fit: cover`로 표지 비율 통일.
- 항상 보이는 정보는 제목·날짜만(이미지 아래, 이미지를 가리지 않음). 저자·요약·
  잔여석·상세 링크는 기존에 이미 프로젝트에 있던 `HoverReveal` 컴포넌트
  (`src/components/home/HoverReveal.tsx`)를 재사용해 hover(desktop)/tap(touch)
  시 부드럽게 펼침 — 새 토글 로직을 만들지 않고 기존 패턴 재사용(접근성:
  `display:none`/`aria-hidden` 없이 opacity/max-height만 사용, 낭독기 항상 노출).
  터치 기기에서 호버가 고착되는 문제도 이 컴포넌트가 이미 `@media(hover:hover)`
  가드 + 외부 탭 시 닫힘으로 처리하고 있어 별도 대응 불필요.
- `next/image`로 전환, `sizes` 브레이크포인트별 설정, `placeholder="blur"`
  (원격 이미지라 자동 생성 불가 — 공용 1x1 회색 blurDataURL 사용), 로드 실패
  시(`onError`) 고정 SVG 책 아이콘으로 폴백(이미지 생성 없음, 인라인 SVG).
- 그림자·border-radius·그라디언트 없음(요청 그대로).

**⚠ 중요 — 이미지 소스 감사 결과**: `src/lib/bookclub/data.ts`의 세션 5건 전부
`coverUrl` 필드가 아예 비어 있습니다(처음부터 설정된 적 없음). 즉 "저해상도
이미지 목록"이 아니라 **실제 표지 이미지가 하나도 없는 상태**입니다. 지시사항이
"이미지를 임의로 생성/교체하지 말 것"이라 임의로 채우지 않았고, 5건 전부 고정
플랫컬러 배경 + 책 아이콘 SVG로 폴백 렌더링됩니다. **운영자가 실제 표지 이미지
URL(또는 Supabase Storage 업로드)을 제공하면 `data.ts`의 `coverUrl` 필드만
채우면 그리드가 바로 반영합니다.**

**버튼 통일**: 프로젝트에 이미 shadcn 스타일 공용 버튼(`src/components/ui/button.tsx`,
cva 기반)이 있고 9개 파일에서 쓰이고 있어(LogoutButton, ReviewForm, AdminClient,
ReviewGrid, LiveSessions, AIGeneratePanel, QuestionForm, SessionJoinButton,
QuestionDetailClient) 이걸 지시사항 스펙에 맞게 확장했습니다(새 파일을 따로
만들지 않음 — 이미 있는 걸 두고 경쟁하는 두 번째 Button을 만들면 오히려
파편화가 심해짐):
- `variant: "primary"`, `variant: "text"` 추가(기존 `default`/`link` 등은
  하위호환 위해 유지, 기존 호출부 깨지지 않음).
- `disabled:cursor-not-allowed`, `motion-reduce:transition-none`,
  `motion-reduce:active:scale-100` 추가(지시사항 애니메이션 규칙 반영).
- 적용: `EncoreRequestButton.tsx`(앵콜 요청 CTA — 지시사항이 이름으로 지목한
  버튼), `MeetingApplyButton.tsx`의 보조 "신청 취소" 버튼(주 CTA인
  `.btn-keycap`은 의도적으로 건드리지 않음 — 아래 참조), `ReviewGrid.tsx`의
  필터 pill 버튼.
- **의도적으로 건드리지 않은 것들**:
  - `.btn-keycap`(즉시참여 버튼) — CLAUDE.md 절대 원칙 2("새 요소는 화면당
    키캡 버튼 하나뿐")가 지정한 유일한 예외 요소이고 사운드 이펙트
    (`KeycapSound.tsx`)까지 결합된 특수 컴포넌트라 범용 Button으로 흡수하면
    그 규칙 자체를 깨는 것이라 판단해 제외.
  - `.lp-underline-cta`, `.lp-books-more-toggle`(홈 에디토리얼 섹션의 텍스트
    링크/토글) — 랜딩페이지 전용 세리프 타이포·아이보리 톤과 강하게 결합돼
    있어, Tailwind 기반 범용 Button을 여기 넣으면 오히려 이번 리디자인이
    추구하는 "얇고 절제된 타이포"를 해칠 위험이 있다고 판단해 그대로 둠.
  - `.btn-pill-neu`(Header, TogetherReading, LandingPage) — 뉴모픽(neumorphic)
    쉬머 효과가 여러 세션에 걸쳐 다듬어진 기존 브랜드 요소라 이번 지시가
    이름으로 지목한 범위(신청/필터/앵콜) 밖이라 손대지 않음. 원하시면 별도
    지시로 이 스타일도 통일 대상에 포함할 수 있음.

**검증**: `tsc --noEmit` 통과, `pnpm build` 통과(75페이지 정적 생성 포함),
`pnpm dev` + curl로 `/` 200 응답 및 `lp-cc-grid`/`lp-cc-card` 클래스 렌더링 확인.
스크린샷은 위 환경 제약으로 불가.

**CLAUDE.md 절대 원칙 2와의 충돌**: "디자인은 리디자인이 아니다"라는 기존 원칙과
이번 전면 그리드 교체는 정면으로 배치되지만, 운영자가 실시간으로 명시적 지시를
내렸으므로 원칙 4(임의 변경 금지 — 운영자에게 물을 것)의 취지상 이미 승인된
것으로 보고 진행했습니다.
