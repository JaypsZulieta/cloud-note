import { Context, Hono } from "hono";
import { PostgresConnectionFactory } from "tsdbc-pg/postgres";
import { PostgresNoteRepository } from "./note-repository";
import { NoteService, NoteServiceImplementation } from "./note-service";
import { HttpError } from "./http-errors";

type Bindings = {
  DATABASE_URL: string;
};

const app = new Hono<{ Bindings: Bindings }>();

const createService = (databaseURL: string): NoteService => {
  const connection = PostgresConnectionFactory.create(databaseURL);
  const repository = new PostgresNoteRepository(connection);
  return new NoteServiceImplementation(repository);
};

app.get("/notes", async (context) => {
  const databaseURL = context.env.DATABASE_URL;
  const service = createService(databaseURL);
  return context.json(await service.findAll());
});

app.get("/notes/:id", async (context) => {
  const databaseURL = context.env.DATABASE_URL;
  const service = createService(databaseURL);
  const id = Number(context.req.param("id"));
  return context.json(await service.findById(id));
});

app.delete("/notes/:id", async (context) => {
  const databaseURL = context.env.DATABASE_URL;
  const service = createService(databaseURL);
  const id = Number(context.req.param("id"));
  return context.json(await service.deleteById(id));
});

app.onError((error: Error, context: Context) => {
  if (error instanceof HttpError) return error.handle(context);
  context.status(500);
  return context.json({ message: "server error" });
});

export default app;
