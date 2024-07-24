import { CanRead, CanDelete, CanCheckExistence } from "./interfaces";
import { Note } from "./note";

export interface NoteRepository
  extends CanRead<number, Note>,
    CanDelete<number, Note>,
    CanCheckExistence<number> {
  findByTitle(title: string): Promise<Note>;
  existByTitle(title: string): Promise<boolean>;
}
