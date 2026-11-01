import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { sign } from "hono/jwt";
import { z } from "zod";
import { db } from "../db";
import { jwtSecret } from "../config";
import { users } from "../db/schema";

const TOKEN_TTL_SECONDS = 60 * 60 * 24 * 7;

const registerSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
});

const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});

const issueToken = (userId: number) =>
  sign(
    { userId, exp: Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS },
    jwtSecret(),
    "HS256",
  );

const publicUser = (user: { id: number; email: string }) => ({
  id: user.id,
  email: user.email,
});

const auth = new Hono();

auth.post("/register", async (c) => {
  const body = registerSchema.safeParse(await c.req.json().catch(() => null));
  if (!body.success) return c.json({ error: "Invalid email or password" }, 400);

  const { email, password } = body.data;

  const existing = db.select().from(users).where(eq(users.email, email)).get();
  if (existing) return c.json({ error: "Email already registered" }, 409);

  const [user] = db
    .insert(users)
    .values({ email, password: await bcrypt.hash(password, 10) })
    .returning()
    .all();

  return c.json({ user: publicUser(user), token: await issueToken(user.id) }, 201);
});

auth.post("/login", async (c) => {
  const body = loginSchema.safeParse(await c.req.json().catch(() => null));
  if (!body.success) return c.json({ error: "Invalid email or password" }, 400);

  const { email, password } = body.data;

  const user = db.select().from(users).where(eq(users.email, email)).get();
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return c.json({ error: "Invalid credentials" }, 401);
  }

  return c.json({ user: publicUser(user), token: await issueToken(user.id) });
});

export default auth;
