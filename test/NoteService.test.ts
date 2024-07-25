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
    test("If note does NOT exist, throw NoteNotFoundError", () => {
      noteRepository.existById.mockResolvedValue(false);
      expect(noteService.findByTitle("Foo")).rejects.toThrowError(NoteNotFoundError);
    });

    test("If note DOES exist, return note", () => {
      const expectedNote = new NoteBuilder()
        .title("Foo")
        .body("Bar")
        .timeStamp(new Date("2003-10-14"))
        .id(123)
        .build();
      noteRepository.existByTitle.mockResolvedValue(true);
      noteRepository.findByTitle.mockResolvedValue(expectedNote);

      expect(noteService.findByTitle("Foo")).resolves.toBe(expectedNote);
    });

    test.each([
      { title: "Foo", exists: true },
      { title: "Bar", exists: false },
    ])(
      "when called with $title, should call NoteRepository.existByTitle($title)",
      async ({ title, exists }) => {
        expect.assertions(1);
        noteRepository.existByTitle.mockResolvedValue(exists);

        await noteService
          .findByTitle(title)
          .then(() => {
            expect(noteRepository.existByTitle).toHaveBeenCalledWith(title);
          })
          .catch(() => {
            expect(noteRepository.existByTitle).toHaveBeenCalledWith(title);
          });
      }
    );

    test.each([
      { title: "Foo" },
      { title: "Bar" },
      { title: "Deadpool and Wolverine" },
      { title: "Logan" },
      { title: "Hello, World" },
    ])(
      "when called with $title and note exists, should call NoteRepository.findByTitle($title)",
      async ({ title }) => {
        expect.assertions(1);
        noteRepository.existByTitle.mockResolvedValue(true);
        await noteService.findByTitle(title);
        expect(noteRepository.findByTitle).toHaveBeenCalledWith(title);
      }
    );
  });

  describe("findById", () => {
    test("If note by id does not exist, throw NoteNotFoundError", () => {
      noteRepository.existById.mockResolvedValue(false);
      expect(noteService.findById(123)).rejects.toThrowError(NoteNotFoundError);
    });

    test.each([
      { id: 123, exists: true },
      { id: 5417, exists: false },
      { id: 2187, exists: true },
      { id: 616, exists: false },
      { id: 1084, exists: false },
    ])(
      "When called with $id, should call NoteRepository.existById($id)",
      async ({ id, exists }) => {
        expect.assertions(1);
        noteRepository.existById.mockResolvedValue(exists);
        await noteService
          .findById(id)
          .then(() => {
            expect(noteRepository.existById).toHaveBeenCalledWith(id);
          })
          .catch(() => {
            expect(noteRepository.existById).toHaveBeenCalledWith(id);
          });
      }
    );

    test.each([{ id: 165 }, { id: 252 }, { id: 69220 }, { id: 818 }, { id: 2187 }, { id: 6040 }])(
      "When called with $id and note DOES exist, should call NoteRepository.findById($id)",
      async ({ id }) => {
        expect.assertions(1);
        noteRepository.existById.mockResolvedValue(true);
        await noteService.findById(id).then(() => {
          expect(noteRepository.findById).toHaveBeenCalledWith(id);
        });
      }
    );

    test("If note DOES exist, return note", () => {
      const note = new NoteBuilder()
        .id(123)
        .title("Hello, World")
        .body("Your first program")
        .timeStamp(new Date("2024-07-18"))
        .build();
      noteRepository.existById.mockResolvedValue(true);
      noteRepository.findById.mockResolvedValue(note);
      expect(noteService.findById(123)).resolves.toBe(note);
    });
  });
});
