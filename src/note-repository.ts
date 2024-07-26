import { CanRead, CanDelete, CanCheckExistence } from "./interfaces";
import { Note, NoteBuilder } from "./note";
import { DatabaseConnection, RowData } from "tsdbc-pg";

export interface NoteRepository
  extends CanRead<number, Note>,
    CanDelete<number, Note>,
    CanCheckExistence<number> {
  findByTitle(title: string): Promise<Note>;
  existByTitle(title: string): Promise<boolean>;
}

export class PostgresNoteRepository implements NoteRepository {
  constructor(private connection: DatabaseConnection) {}

  private static buildNote(row?: RowData) {
    return new NoteBuilder()
      .id(row?.getNumber("id") as number)
      .title(row?.getString("title") as string)
      .body(row?.getString("body") as string)
      .timeStamp(row?.getDate("time_stamp") as Date)
      .build();
  }

  async findByTitle(title: string): Promise<Note> {
    const rows = await this.connection
      .prepareStatement("SELECT * FROM notes WHERE title = ?")
      .setString(title)
      .execute();
    const row = rows.at(0);
    return PostgresNoteRepository.buildNote(row);
  }

  async existByTitle(title: string): Promise<boolean> {
    const rows = await this.connection
      .prepareStatement("SELECT count(id) FROM notes WHERE title = ?")
      .setString(title)
      .execute();
    const row = rows.at(0);
    const count = row?.getNumber("count") as number;
    return count > 0;
  }

  async findById(id: number): Promise<Note> {
    const rows = await this.connection
      .prepareStatement("SELECT * FROM notes WHERE id = ?")
      .setNumber(id)
      .execute();
    const row = rows.at(0);
    return PostgresNoteRepository.buildNote(row);
  }

  async findAll(): Promise<Note[]> {
    return (
      await this.connection
        .createStatement("SELECT * FROM notes ORDER BY time_stamp DESC")
        .execute()
    ).map((row) => PostgresNoteRepository.buildNote(row));
  }

  async deleteById(id: number): Promise<Note> {
    const note = await this.findById(id);
    return await this.connection
      .prepareStatement("DELETE FROM notes WHERE id = ?")
      .setNumber(id)
      .execute()
      .then(() => note);
  }

  async existById(id: number): Promise<boolean> {
    const rows = await this.connection
      .prepareStatement("SELECT count(id) FROM notes WHERE id = ?")
      .setNumber(id)
      .execute();
    const row = rows.at(0);
    const count = row?.getNumber("count") as number;
    return count > 0;
  }
}
