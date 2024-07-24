import { Hono } from "hono";

type Bindings = {
  DATABASE_URL: string;
};

const app = new Hono<{ Bindings: Bindings }>();

app.get("/", (context) => {
  return context.json({ message: "Hello, World" });
});

export default app;
