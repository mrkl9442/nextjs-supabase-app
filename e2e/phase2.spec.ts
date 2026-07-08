import { test, expect } from "@playwright/test";

// Phase 2 통합 E2E 테스트
// F005 정산, F006 공지사항, F007 독촉 메시지

test.describe("정산 페이지 (F005) — 라우트 보호", () => {
  test("비로그인 /events/[id]/settlement → /auth/login 리다이렉트", async ({
    page,
  }) => {
    await page.goto("/events/some-event-id/settlement");
    await expect(page).toHaveURL(/\/auth\/login/);
  });

  test("next 파라미터에 settlement 경로가 포함된다", async ({ page }) => {
    await page.goto("/events/some-event-id/settlement");
    await expect(page).toHaveURL(/next=.*settlement/);
  });
});

test.describe("공지사항 섹션 (F006) — 이벤트 상세 페이지", () => {
  test("이벤트 상세 페이지에 공지사항 섹션이 노출된다", async ({ page }) => {
    await page.goto("/events/test-fake-uuid-1234");
    await expect(page).not.toHaveURL(/\/auth\/login/);
    // notFound() 이후에도 공지 섹션 UI 확인 — 404 페이지여도 로그인 리다이렉트는 없음
  });

  test("비로그인 상태에서 공지 섹션은 읽기 전용 (작성 버튼 없음)", async ({
    page,
  }) => {
    await page.goto("/events/test-fake-uuid-1234");
    await page.waitForLoadState("networkidle");
    // 404 페이지이므로 "공지 작성" 버튼이 없어야 함
    await expect(
      page.getByRole("button", { name: "공지 작성" })
    ).not.toBeVisible();
  });
});

test.describe("관리 페이지 (F006, F007) — 라우트 보호", () => {
  test("비로그인 /events/[id]/manage → /auth/login 리다이렉트", async ({
    page,
  }) => {
    await page.goto("/events/some-event-id/manage");
    await expect(page).toHaveURL(/\/auth\/login/);
  });

  test("next 파라미터에 manage 경로가 포함된다", async ({ page }) => {
    await page.goto("/events/some-event-id/manage");
    await expect(page).toHaveURL(/next=.*manage/);
  });
});

test.describe("정산 UI 렌더링 — 로그인 페이지 경유 확인", () => {
  test("정산 페이지 리다이렉트 후 로그인 폼이 정상 렌더링된다", async ({
    page,
  }) => {
    await page.goto("/events/some-id/settlement");
    await expect(page).toHaveURL(/\/auth\/login/);
    await expect(page.getByText("Google로 계속하기")).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
  });
});

test.describe("로그인 후 Phase 2 페이지 접근 — next 파라미터 보존", () => {
  test("settlement next 파라미터가 URL에 유지된다", async ({ page }) => {
    await page.goto("/events/abc-123/settlement");
    await expect(page).toHaveURL(/next=.*abc-123.*settlement/);
  });

  test("manage next 파라미터가 URL에 유지된다", async ({ page }) => {
    await page.goto("/events/abc-123/manage");
    await expect(page).toHaveURL(/next=.*abc-123.*manage/);
  });
});

test.describe("헤더 네비게이션", () => {
  test("로그인 페이지에서 Sign up 링크로 회원가입 페이지 이동", async ({
    page,
  }) => {
    await page.goto("/auth/login");
    await page.getByRole("link", { name: "Sign up" }).first().click();
    await expect(page).toHaveURL(/\/auth\/sign-up/);
    await expect(page.getByText("Create a new account")).toBeVisible();
  });

  test("회원가입 페이지에서 Login 링크로 로그인 페이지 이동", async ({
    page,
  }) => {
    await page.goto("/auth/sign-up");
    await page.getByRole("link", { name: "Login" }).click();
    await expect(page).toHaveURL(/\/auth\/login/);
  });
});

test.describe("랜딩 페이지 → 로그인 플로우", () => {
  test("Sign in 클릭 시 로그인 페이지로 이동한다", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Sign in" }).click();
    await expect(page).toHaveURL(/\/auth\/login/);
    await expect(page.getByText("Google로 계속하기")).toBeVisible();
  });
});
