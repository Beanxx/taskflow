import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: [
    {
      command: 'npm run dev',
      cwd: './frontend',
      url: 'http://localhost:5173',
      reuseExistingServer: !process.env.CI,
    },
    {
      // 매 실행마다 빈 DB로 시작해야 회원가입 시나리오가 중복 이메일로 실패하지 않는다.
      command: 'rm -f e2e.db && npm run dev',
      cwd: './backend',
      env: { DATABASE_URL: 'e2e.db' },
      // 인증 없이 401을 돌려주는 경로로 기동 여부를 확인한다 (404는 준비 완료로 보지 않음).
      url: 'http://localhost:3000/api/tasks',
      reuseExistingServer: false,
    },
  ],
})
