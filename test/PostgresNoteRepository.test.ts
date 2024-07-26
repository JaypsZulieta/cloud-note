import { DatabaseConnection, PreparedStatement, RowData } from "tsdbc-pg";
import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { mock, mockClear, MockProxy } from "vitest-mock-extended";
import { NoteRepository, PostgresNoteRepository } from "../src/note-repository";
import { NoteBuilder } from "../src/note";

class FakeRowData extends RowData {}

const createFakeRowData = (rows: any[]) => rows.map((row) => new FakeRowData(row));

describe("PostgresNoteRepository", () => {
  let connection: MockProxy<DatabaseConnection>;
  let repository: NoteRepository;

  beforeEach(() => {
    connection = mock<DatabaseConnection>();
    repository = new PostgresNoteRepository(connection);
  });

  afterEach(() => {
    mockClear(connection);
  });

  describe("findByTitle", () => {
    test("When called, should call Connection.prepareStatement", async () => {
      expect.assertions(1);
      const assertion = () => expect(connection.prepareStatement).toHaveBeenCalled();
      await repository.findByTitle("title").then(assertion).catch(assertion);
    });

    test("When called, should call Connection.prepareStatement with 'SELECT * FROM notes WHERE title = ?'", async () => {
      expect.assertions(1);
      const SQL = "SELECT * FROM notes WHERE title = ?";
      const assertion = () => expect(connection.prepareStatement).toHaveBeenCalledWith(SQL);
      await repository.findByTitle("title").then(assertion).catch(assertion);
    });

    test("When called, should call PreparedStatement.setString", async () => {
      expect.assertions(1);
      const prepareStatement = mock<PreparedStatement>();
      connection.prepareStatement.mockReturnValue(prepareStatement);

      const assertion = () => expect(prepareStatement.setString).toHaveBeenCalled();
      await repository.findByTitle("Hello").then(assertion).catch(assertion);
    });

    test.each([
      { title: "Foo" },
      { title: "Bar" },
      { title: "Hello, World" },
      { title: "Groceries" },
    ])(
      "When called with $title, should call PreparedStatement.setString($title)",
      async ({ title }) => {
        expect.assertions(1);
        const prepareStatement = mock<PreparedStatement>();
        connection.prepareStatement.mockReturnValue(prepareStatement);

        const assertion = () => expect(prepareStatement.setString).toHaveBeenCalledWith(title);
        await repository.findByTitle(title).then(assertion).catch(assertion);
      }
    );

    test("When called, should call PreparedStatement.execute", async () => {
      expect.assertions(1);
      const prepareStatement = mock<PreparedStatement>();
      connection.prepareStatement.mockReturnValue(prepareStatement);
      prepareStatement.setString.mockReturnValue(prepareStatement);

      const assertion = () => expect(prepareStatement.execute).toHaveBeenCalled();
      await repository.findByTitle("Hello").then(assertion).catch(assertion);
    });

    test("When called, should return note based on rows returned", async () => {
      expect.assertions(1);
      const rows = [
        {
          id: 123,
          title: "Hello, World",
          body: "Your First program",
          time_stamp: new Date("2006-7-8"),
        },
      ];
      const prepareStatement = mock<PreparedStatement>();
      connection.prepareStatement.mockReturnValue(prepareStatement);
      prepareStatement.setString.mockReturnValue(prepareStatement);
      prepareStatement.execute.mockResolvedValue(createFakeRowData(rows));

      const expectedNote = new NoteBuilder()
        .id(123)
        .title("Hello, World")
        .body("Your First program")
        .timeStamp(new Date("2006-7-8"))
        .build();

      expect(await repository.findByTitle("Hello, World")).toEqual(expectedNote);
    });
  });
});
