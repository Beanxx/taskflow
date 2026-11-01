import { describe, test, expect, beforeAll } from "vitest";
// import app from "../src/app";

describe("POST /api/auth/register", () => {
  test("새 사용자를 등록하고 토큰을 반환한다", async () => {
    const res = await app.request("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: "test@test.com",
        password: "password123",
      }),
    });
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data).toHaveProperty("token");
    expect(data).toHaveProperty("user.email", "new@test.com");
  });
});

describe("POST /api/auth/login", () => {
  test("올바른 자격증명으로 로그인하면 토큰을 반환한다", async () => {
    const res = await app.request("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: "new@test.com",
        password: "password123",
      }),
    });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toHaveProperty("token");
  });

  test("잘못된 비밀번호로 로그인하면 401을 반환한다", async () => {
    const res = await app.request("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: "new@test.com",
        password: "wrongpassword",
      }),
    });
    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data).toHaveProperty("error");
  });
});
