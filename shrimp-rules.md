# Development Guidelines

## 프로젝트 개요

- **목적**: 소규모 모임(5~15명) 이벤트 관리 웹 MVP — 참여 취합·정산·카풀 배정을 링크 하나로 해결
- **기술 스택**: Next.js 15 App Router, TypeScript 5, React 19, Supabase(SSR), shadcn/ui, Tailwind CSS 3, React Hook Form, Zod, Lucide React
- **PRD**: `docs/PRD.md`
- **로드맵**: `docs/ROADMAP.md` — Phase 0~4, TASK-001~045
- **DB 테이블**: `events`, `attendances`, `announcements`, `expenses`, `carpool_drivers`, `carpool_members`

---

## 디렉터리 구조 및 파일 배치

### 라우트 배치 규칙

- 인증 필요 페이지 → `app/protected/` 하위에 배치
- 인증 관련 페이지(로그인·회원가입 등) → `app/auth/` 하위 (이미 구현됨, 건드리지 않음)
- 새 이벤트 라우트 → `app/events/[id]/`, `app/events/new/`, `app/dashboard/` 등 `app/` 직하 배치
- 각 라우트 폴더에는 `page.tsx` (필수), `layout.tsx`·`loading.tsx`·`error.tsx` (필요시)만 생성

### 컴포넌트 배치 규칙

- `components/ui/` — **절대 수정 금지** (shadcn/ui 자동 생성 파일)
- `components/` — 비즈니스 로직 컴포넌트 (폼, 버튼, 카드 등) 배치
- `components/tutorial/` — **건드리지 않음** (스타터 튜토리얼용)
- shadcn 컴포넌트 추가 시 반드시 `npx shadcn@latest add [name]` 사용

### 기타 파일 배치

- Supabase 클라이언트 → `lib/supabase/` (server.ts, client.ts, proxy.ts)
- DB 타입 정의 → `types/database.ts`
- 공통 유틸 → `lib/utils.ts`
- 더미 데이터 픽스처 → `lib/fixtures/` (Phase 0에서 생성)
- Zod 스키마 → `lib/schemas/` (Phase 0에서 생성)
- Server Actions → 해당 기능 폴더의 `actions.ts`에 배치 (예: `app/events/actions.ts`)

---

## 코딩 컨벤션

### 네이밍

- 파일명: `kebab-case` (예: `event-card.tsx`, `settlement-form.tsx`)
- 컴포넌트명: `PascalCase` (예: `EventCard`, `SettlementForm`)
- 변수·함수명: `camelCase`
- DB 컬럼·타입 필드: `snake_case` (Supabase 컨벤션)
- enum 값: `'attending' | 'absent' | 'undecided'` (소문자 문자열)

### Import

- **반드시 `@/` 별칭 사용** (`import { X } from '@/components/...'`)
- **상대 경로(`./`, `../`) 금지**
- import 순서: 외부 라이브러리 → `@/lib` → `@/components` → `@/types`

### Export

- **Named export 사용**: `export function Foo() {}`, `export const bar = ...`
- **페이지 컴포넌트만 default export**: `app/**/page.tsx`의 컴포넌트
- `export default` 를 `page.tsx` 외 파일에서 사용 금지

---

## Next.js 15 App Router 규칙

### params / searchParams

```tsx
// ✅ 반드시 await 처리 (Next.js 15 비동기 API)
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
}

// ❌ await 없이 직접 접근 금지
export default async function Page({ params }) {
  const id = params.id; // 빌드 에러 발생
}
```

### Server / Client 컴포넌트

- **Server Component 기본**: `'use client'` 없이 작성 → 자동으로 서버 컴포넌트
- **`'use client'` 조건**: `useState`, `useEffect`, `onClick` 등 브라우저 API·이벤트 핸들러 사용 시에만
- 서버 컴포넌트에서 클라이언트 컴포넌트를 import하여 사용 (역방향 금지)
- 클라이언트 컴포넌트는 별도 파일로 분리 후 `'use client'`를 파일 최상단에 선언

### Server Actions

- `'use server'` 지시어를 함수 또는 파일 최상단에 선언
- 폼 제출·데이터 변경은 Server Action으로 처리
- `useActionState` (React 19) 활용하여 pending·error 상태 관리

### 데이터 패칭

- 서버 컴포넌트에서 직접 `async/await`로 Supabase 호출
- 클라이언트 컴포넌트에서 실시간 데이터는 Supabase Realtime 구독 사용
- `cache()` 또는 `revalidatePath()` 적절히 활용

---

## Supabase 클라이언트 사용 규칙

### 서버 컴포넌트 / Server Action

```ts
// ✅ 올바른 사용: 함수 내에서 매번 새 인스턴스 생성
import { createClient } from "@/lib/supabase/server";

export async function getData() {
  const supabase = await createClient(); // await 필수
  const { data } = await supabase.from("events").select("*");
  return data;
}

// ❌ 금지: 전역 변수에 저장
const supabase = await createClient(); // 모듈 레벨 금지
```

### 클라이언트 컴포넌트

```ts
// ✅ 브라우저 전용: lib/supabase/client.ts 사용
import { createClient } from "@/lib/supabase/client";

const supabase = createClient(); // await 불필요
```

### 환경 변수

- `NEXT_PUBLIC_SUPABASE_URL` — Supabase 프로젝트 URL
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` — Supabase anon key (**`ANON_KEY`가 아닌 `PUBLISHABLE_KEY` 사용**)
- `.env.local`에 저장, 코드에 하드코딩 금지

### RLS 정책 패턴

- 모든 테이블에 RLS 활성화 필수
- `auth.uid() = host_id` 패턴으로 본인 데이터만 수정 가능하도록 설정
- 이벤트 상세 조회는 인증 없이 허용 (공유 링크 접근)
- 참여 응답·카풀 신청은 `auth.uid() = user_id` 본인만 수정 가능

---

## 컴포넌트 작성 규칙

### 기본 원칙

- 단일 책임: 컴포넌트 하나당 한 가지 역할
- 300줄 이하 유지 (초과 시 분리)
- Props 인터페이스 반드시 명시적 타입 정의

### shadcn/ui 활용

- `Button`, `Card`, `Input`, `Label`, `Badge`, `Dialog`, `Toast` 등 `components/ui/`의 컴포넌트 재사용
- 스타일 변형은 `className` prop 또는 `cva` 활용
- 새 UI 컴포넌트 필요 시 `npx shadcn@latest add [name]`으로 추가

### 폼 작성

- React Hook Form + Zod 조합 필수 (`lib/schemas/`의 Zod 스키마 사용)
- `useForm` → `register` / `handleSubmit` / `formState.errors` 패턴
- 서버 에러는 `setError('root', ...)` 또는 `useActionState`로 처리
- 폼 컴포넌트는 반드시 `'use client'`

### 로딩·빈 상태

- 데이터 로딩 중: 스켈레톤 또는 스피너 표시 (`loading.tsx` 또는 `Suspense`)
- 빈 목록: 안내 메시지 + CTA 버튼 (예: "이벤트가 없습니다. 첫 이벤트를 만들어보세요!")
- 에러 상태: `error.tsx`에서 처리

---

## 개발 순서 원칙 (ROADMAP 기반)

**모든 Phase에서 반드시 이 순서를 지킨다:**

1. **A. UI 마크업** — `lib/fixtures/`의 더미 데이터로 화면 먼저 완성
2. **B. DB 스키마** — UI 확정 후 Supabase 테이블·RLS 생성
3. **C. 실데이터 연동** — 더미 데이터를 실제 Supabase 호출로 교체

**예시 (이벤트 생성 기능):**

- ✅ TASK-008: 폼 UI 마크업 (더미 submit) → TASK-013: events 테이블 생성 → TASK-016: Server Action 연동
- ❌ DB 테이블부터 만들고 UI 나중에 작성하는 순서

---

## 타입 정의 규칙

### DB 타입

- `types/database.ts`에 모든 DB 타입 정의 (Supabase 테이블 Row·Insert·Update 타입)
- 새 테이블 추가 시 반드시 `types/database.ts` 업데이트
- `Database` 타입을 `createClient<Database>()`에 전달하여 타입 안전성 확보

### 도메인 타입

- `Event`, `Attendance`, `Announcement`, `Expense`, `CarpoolDriver`, `CarpoolMember` 인터페이스
- 참여 상태: `type AttendanceStatus = 'attending' | 'absent' | 'undecided'`
- `types/` 폴더에 도메인별로 파일 분리 (예: `types/event.ts`, `types/carpool.ts`)

---

## 동시 수정이 필요한 파일 쌍

| 변경 작업             | 수정해야 할 파일                                                  |
| --------------------- | ----------------------------------------------------------------- |
| 새 DB 테이블 추가     | `types/database.ts` (타입 추가) + Supabase SQL 마이그레이션       |
| 새 페이지 추가        | `app/.../page.tsx` + (필요시) `app/.../layout.tsx`, `loading.tsx` |
| 새 Server Action 추가 | `app/.../actions.ts` + 호출하는 클라이언트 컴포넌트               |
| shadcn 컴포넌트 추가  | `npx shadcn@latest add` 실행 → `components/ui/` 자동 생성         |
| Zod 스키마 변경       | `lib/schemas/` 파일 + 해당 폼 컴포넌트 + Server Action            |

---

## 품질 검사 규칙

- **커밋 전**: Husky pre-commit이 자동으로 lint-staged 실행 (ESLint + Prettier)
- **타입 검사**: `npm run typecheck` 통과 필수
- **전체 검사**: `npm run check-all` (typecheck + lint + format:check)
- 코드 수정 후 반드시 `npm run typecheck`로 타입 에러 없음 확인

---

## 금지 사항

- `components/ui/` 파일 직접 수정 금지 (shadcn 재생성 시 덮어써짐)
- `components/tutorial/` 수정 금지
- `app/auth/` 기존 파일 수정 금지 (인증 흐름 이미 구현됨)
- Supabase 서버 클라이언트 전역 변수 저장 금지
- 상대 경로 import 금지 (`./`, `../` 모두 금지, `@/` 사용)
- `page.tsx` 외 파일에서 `export default` 사용 금지
- Pages Router (`pages/` 폴더) 사용 금지 — App Router만 사용
- `params`, `searchParams`를 `await` 없이 직접 접근 금지
- `.env.local`의 환경 변수를 코드에 하드코딩 금지
- DB 스키마 작업을 UI 마크업보다 먼저 시작 금지 (개발 순서 원칙 위반)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` 변수명 사용 금지 (`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` 사용)
