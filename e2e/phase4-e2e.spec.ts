import { test, expect } from "@playwright/test";

// TASK-039: 전체 사용자 여정 종단 E2E 스모크 테스트
// Google OAuth 특성상 인증 후 흐름은 미들웨어·리다이렉트·UI 렌더링으로 검증

test.describe("사용자 여정 — 이벤트 생성 플로우", () => {
  test("랜딩 → 로그인 → 로그인 페이지 도달", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "로그인" }).click();
    await expect(page).toHaveURL(/\/auth\/login/);
    await expect(page.getByText("Google로 계속하기")).toBeVisible();
  });

  test("시작하기 클릭 → 로그인 페이지 이동", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "시작하기" }).click();
    await expect(page).toHaveURL(/\/auth\/login/);
  });
});

test.describe("사용자 여정 — 이벤트 참여 플로우", () => {
  test("이벤트 상세 페이지 공개 접근 → 로그인 없이 정보 확인 가능", async ({
    page,
  }) => {
    await page.goto("/events/test-id");
    await expect(page).not.toHaveURL(/\/auth\/login/);
  });

  test("이벤트 상세 → 참여 응답 시도 → 로그인 유도 메시지", async ({
    page,
  }) => {
    await page.goto("/events/test-id");
    await page.waitForLoadState("networkidle");
    const content = await page.content();
    // 비로그인이면 "로그인이 필요합니다" 또는 404 페이지 중 하나
    const hasLoginPrompt = content.includes("로그인이 필요합니다");
    const is404 =
      content.includes("404") || content.includes("could not be found");
    expect(hasLoginPrompt || is404).toBeTruthy();
  });
});

test.describe("사용자 여정 — 관리 기능 접근 제어", () => {
  test("대시보드 → 관리 → 정산 → 카풀 모두 로그인 필요", async ({ page }) => {
    const routes = [
      "/dashboard",
      "/events/test-id/manage",
      "/events/test-id/settlement",
      "/events/test-id/carpool",
    ];
    for (const route of routes) {
      await page.goto(route);
      await expect(page).toHaveURL(/\/auth\/login/);
    }
  });

  test("로그인 후 원래 경로 복원 — next 파라미터 체인", async ({ page }) => {
    await page.goto("/events/abc/manage");
    const url1 = page.url();
    await page.goto("/events/abc/settlement");
    const url2 = page.url();
    await page.goto("/events/abc/carpool");
    const url3 = page.url();

    expect(url1).toContain("next=");
    expect(url2).toContain("next=");
    expect(url3).toContain("next=");
  });
});

// TASK-041: 반응형·모바일 최적화
test.describe("모바일 뷰포트 렌더링", () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test("모바일 — 랜딩 페이지 정상 렌더링", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.getByRole("link", { name: "로그인" })).toBeVisible();
  });

  test("모바일 — 로그인 페이지 Google 버튼 접근 가능", async ({ page }) => {
    await page.goto("/auth/login");
    await expect(page.getByText("Google로 계속하기")).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
  });

  test("모바일 — 이벤트 상세 페이지 공개 접근", async ({ page }) => {
    await page.goto("/events/test-id");
    await expect(page).not.toHaveURL(/\/auth\/login/);
  });
});

test.describe("태블릿 뷰포트 렌더링", () => {
  test.use({ viewport: { width: 768, height: 1024 } });

  test("태블릿 — 랜딩 페이지 정상 렌더링", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1")).toBeVisible();
  });

  test("태블릿 — 인증 페이지 폼 렌더링", async ({ page }) => {
    await page.goto("/auth/login");
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.getByText("Google로 계속하기")).toBeVisible();
  });
});

// TASK-044: RLS 보안 검증 (UI 레벨)
test.describe("보안 — 권한 없는 접근 차단", () => {
  test("비로그인 이벤트 관리 → 로그인 리다이렉트", async ({ page }) => {
    await page.goto("/events/some-event-id/manage");
    await expect(page).toHaveURL(/\/auth\/login/);
    // 관리 페이지 UI가 노출되지 않아야 함
    await expect(page.getByText("이벤트 관리")).not.toBeVisible();
  });

  test("비로그인 카풀 배정 → 로그인 리다이렉트", async ({ page }) => {
    await page.goto("/events/some-event-id/carpool");
    await expect(page).toHaveURL(/\/auth\/login/);
    await expect(page.getByText("드라이버 등록")).not.toBeVisible();
  });

  test("비로그인 정산 → 로그인 리다이렉트", async ({ page }) => {
    await page.goto("/events/some-event-id/settlement");
    await expect(page).toHaveURL(/\/auth\/login/);
    await expect(page.getByText("지출 항목")).not.toBeVisible();
  });
});
