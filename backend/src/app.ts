import { Hono } from "hono";
import auth from "./routes/auth";
import tasks from "./routes/tasks";

const app = new Hono();

app.route("/api/auth", auth);
app.route("/api/tasks", tasks);

app.notFound((c) => c.json({ error: "Not found" }, 404));
app.onError((err, c) => {
  console.error(err);
  return c.json({ error: "Internal server error" }, 500);
});

export default app;
