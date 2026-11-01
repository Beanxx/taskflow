import { and, eq } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";
import { db } from "../db";
import { TASK_STATUSES, tasks } from "../db/schema";
import { authMiddleware, type AuthEnv } from "../middleware/auth";

const createSchema = z.object({
  title: z.string().trim().min(1),
  description: z.string().optional(),
});

const updateSchema = z
  .object({
    title: z.string().trim().min(1),
    description: z.string().nullable(),
    status: z.enum(TASK_STATUSES),
  })
  .partial()
  .refine((v) => Object.keys(v).length > 0, "No fields to update");

const statusFilterSchema = z.enum(TASK_STATUSES).optional();

const tasksRouter = new Hono<AuthEnv>();
tasksRouter.use("*", authMiddleware);

// Every query below is scoped by userId so other users' tasks look nonexistent (404).
const ownedBy = (id: number, userId: number) =>
  and(eq(tasks.id, id), eq(tasks.userId, userId));

const parseId = (raw: string) => {
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
};

const readJson = (req: { json: () => Promise<unknown> }) => req.json().catch(() => null);

tasksRouter.get("/", (c) => {
  const status = statusFilterSchema.safeParse(c.req.query("status"));
  if (!status.success) return c.json({ error: "Invalid status" }, 400);

  const userId = c.get("userId");
  const where = status.data
    ? and(eq(tasks.userId, userId), eq(tasks.status, status.data))
    : eq(tasks.userId, userId);

  return c.json(db.select().from(tasks).where(where).orderBy(tasks.id).all());
});

tasksRouter.post("/", async (c) => {
  const body = createSchema.safeParse(await readJson(c.req));
  if (!body.success) return c.json({ error: "Invalid task data" }, 400);

  const [task] = db
    .insert(tasks)
    .values({ ...body.data, userId: c.get("userId") })
    .returning()
    .all();

  return c.json(task, 201);
});

tasksRouter.patch("/:id", async (c) => {
  const id = parseId(c.req.param("id"));
  if (id === null) return c.json({ error: "Task not found" }, 404);

  const body = updateSchema.safeParse(await readJson(c.req));
  if (!body.success) return c.json({ error: "Invalid task data" }, 400);

  const [task] = db
    .update(tasks)
    .set(body.data)
    .where(ownedBy(id, c.get("userId")))
    .returning()
    .all();

  return task ? c.json(task) : c.json({ error: "Task not found" }, 404);
});

tasksRouter.delete("/:id", (c) => {
  const id = parseId(c.req.param("id"));
  if (id === null) return c.json({ error: "Task not found" }, 404);

  const [deleted] = db
    .delete(tasks)
    .where(ownedBy(id, c.get("userId")))
    .returning({ id: tasks.id })
    .all();

  return deleted ? c.body(null, 204) : c.json({ error: "Task not found" }, 404);
});

export default tasksRouter;
