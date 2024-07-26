import { describe, test, beforeEach, expect, afterEach } from "vitest";
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

  describe("findAll", () => {
    test("When called, should call NoteRepository.findAll()", async () => {
      expect.assertions(1);
      await noteService.findAll();
      expect(noteRepository.findAll).toHaveBeenCalled();
    });
  });

  describe("deleteById", () => {
    test("If note does not exist, throw NoteNotFoundError", async () => {
      expect.assertions(1);
      noteRepository.existById.mockResolvedValue(false);
      await noteService.deleteById(123).catch(() => {
        expect(noteRepository.existById).toHaveBeenCalled();
      });
    });

    test("If note does exist, return the deleted Note", async () => {
      const deletedNote = new NoteBuilder()
        .id(123)
        .title("Hello, World")
        .body("First Program")
        .timeStamp(new Date("2003-12-20"))
        .build();
      noteRepository.existById.mockResolvedValue(true);
      noteRepository.deleteById.mockResolvedValue(deletedNote);

      expect(await noteService.deleteById(123)).toBe(deletedNote);
    });

    test.each([
      { id: 123, exists: true },
      { id: 54417, exists: false },
      { id: 6498, exists: true },
      { id: 2589, exists: true },
      { id: 890294, exists: false },
      { id: 89265, exists: false },
    ])(
      "When called with $id, should call NoteRepository.existById($id)",
      async ({ id, exists }) => {
        noteRepository.existById.mockResolvedValue(exists);
        await noteService
          .deleteById(id)
          .then(() => {
            expect(noteRepository.existById).toHaveBeenCalledWith(id);
          })
          .catch(() => {
            expect(noteRepository.existById).toBeCalledWith(id);
          });
      }
    );

    test.each([
      { id: 123 },
      { id: 54417 },
      { id: 6498 },
      { id: 2589 },
      { id: 890294 },
      { id: 89265 },
    ])(
      "When called with $id and Note exists, should call NoteRepository.deleteById($id)",
      async ({ id }) => {
        noteRepository.existById.mockResolvedValue(true);
        await noteService.deleteById(id);
        expect(noteRepository.deleteById).toHaveBeenCalledWith(id);
      }
    );

    test("When Note does not exist, shouldn't call NoteRepository.deleteById", async () => {
      expect.assertions(1);
      noteRepository.existById.mockResolvedValue(false);
      await noteService.deleteById(123).catch(() => {
        expect(noteRepository.deleteById).not.toHaveBeenCalled();
      });
    });
  });
});
