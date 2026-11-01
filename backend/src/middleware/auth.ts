import { createMiddleware } from "hono/factory";
import { verify } from "hono/jwt";
import { jwtSecret } from "../config";

export type AuthEnv = { Variables: { userId: number } };

export const authMiddleware = createMiddleware<AuthEnv>(async (c, next) => {
  const header = c.req.header("Authorization");
  if (!header?.startsWith("Bearer ")) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    const payload = await verify(header.slice(7), jwtSecret(), "HS256");
    if (typeof payload.userId !== "number") throw new Error("bad payload");
    c.set("userId", payload.userId);
  } catch {
    return c.json({ error: "Invalid token" }, 401);
  }

  await next();
});
