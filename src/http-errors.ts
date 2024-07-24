import { Context } from "hono";

export abstract class HttpError extends Error {
  abstract handle(context: Context): Promise<Response>;
}

export class NotFoundError extends HttpError {
  async handle(context: Context): Promise<Response> {
    context.status(404);
    const message = this.message;
    return context.json({ message });
  }
}
