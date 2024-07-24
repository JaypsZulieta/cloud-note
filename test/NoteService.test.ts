import { describe, test, beforeEach, expect, afterEach, assert } from "vitest";
import { mock, mockClear, MockProxy } from "vitest-mock-extended";
import { NoteNotFoundError, NoteService, NoteServiceImplementation } from "../src/note-service";
import { NoteRepository } from "../src/note-repository";
import { NoteBuilder } from "../src/note";

describe("NoteServiceImplementation", () => {
  let noteService: NoteService;
  let noteRepository: MockProxy<NoteRepository>;

  beforeEach(() => {
    noteRepository = mock<NoteRepository>();
    noteService = new NoteServiceImplementation(noteRepository);
  });

  afterEach(() => {
    mockClear(noteRepository);
  });

  describe("findByTitle", () => {
    test("if note exists -> return note", async () => {
      const note = new NoteBuilder()
        .id(123)
        .title("Hello, World")
        .body("Hello, Bro!")
        .timeStamp(new Date("2004-12-13"))
        .build();
      const findByTitle = noteRepository.findByTitle;
      const existByTitle = noteRepository.existByTitle;

      existByTitle.mockResolvedValue(true);
      findByTitle.mockResolvedValue(note);

      const title = "Hello, World";
      expect(await noteService.findByTitle(title)).toEqual(note);
      expect(findByTitle).toHaveBeenCalledWith(title);
      expect(findByTitle).toHaveBeenCalledOnce();
      expect(existByTitle).toHaveBeenCalledWith(title);
      expect(existByTitle).toHaveBeenCalledOnce();
    });

    test("if note does not exist -> throw NoteNotFoundError", () => {
      const existByTitle = noteRepository.existByTitle;
      const findByTitle = noteRepository.findByTitle;
      existByTitle.mockResolvedValue(false);

      const title = "Foo";
      const note = noteService.findByTitle(title);

      expect(note).rejects.toThrow(NoteNotFoundError);
      expect(note).rejects.toThrow(`Note with title '${title}' does not exist`);
      expect(findByTitle).not.toHaveBeenCalled();
      expect(existByTitle).toHaveBeenCalledOnce();
      expect(existByTitle).toHaveBeenCalledWith(title);
    });
  });

  describe("findById", () => {
    test("if note exists -> return note", async () => {
      const note = new NoteBuilder()
        .id(123)
        .title("Foo")
        .body("Bar")
        .timeStamp(new Date("2003-1-24"))
        .build();
      const existById = noteRepository.existById;
      const findById = noteRepository.findById;
      existById.mockResolvedValue(true);
      findById.mockResolvedValue(note);

      const id = 123;
      expect(await noteService.findById(id)).toEqual(note);
      expect(existById).toHaveBeenCalledWith(id);
      expect(findById).toHaveBeenCalledWith(id);
      expect(existById).toHaveBeenCalledOnce();
      expect(findById).toHaveBeenCalledOnce();
    });

    test("if note does not exist -> throw NoteNotFoundError", async () => {
      const existById = noteRepository.existById;
      const findById = noteRepository.findById;

      const id = 123;
      const note = noteService.findById(id);

      expect(note).rejects.toThrow(NoteNotFoundError);
      expect(note).rejects.toThrow(`Note with id '${id}' does not exist`);
      expect(findById).not.toHaveBeenCalled();
      expect(existById).toHaveBeenCalledOnce();
      expect(existById).toHaveBeenCalledWith(id);
    });
  });
});
