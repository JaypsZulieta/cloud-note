import { NotFoundError } from "./http-errors";
import { CanDelete, CanRead } from "./interfaces";
import { Note } from "./note";
import { NoteRepository } from "./note-repository";

export interface NoteService extends CanRead<number, Note>, CanDelete<number, Note> {
  findByTitle(title: string): Promise<Note>;
}

export class NoteNotFoundError extends NotFoundError {}

export class NoteServiceImplementation implements NoteService {
  constructor(private noteRepository: NoteRepository) {}

  async findByTitle(title: string): Promise<Note> {
    const noteRepository = this.noteRepository;
    if (!(await noteRepository.existByTitle(title)))
      throw new NoteNotFoundError(`Note with title '${title}' does not exist`);
    return noteRepository.findByTitle(title);
  }

  findById(id: number): Promise<Note> {
    throw new Error("Method not implemented.");
  }
  findAll(): Promise<Note[]> {
    throw new Error("Method not implemented.");
  }
  deleteById(id: number): Promise<Note> {
    throw new Error("Method not implemented.");
  }
}
