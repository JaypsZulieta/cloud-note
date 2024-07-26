import { DatabaseConnection, PreparedStatement, RowData } from "tsdbc-pg";
import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { mock, mockClear, MockProxy } from "vitest-mock-extended";
import { NoteRepository, PostgresNoteRepository } from "../src/note-repository";
import { NoteBuilder } from "../src/note";

class FakeRowData extends RowData {}

const createFakeRowData = (rows: any[]) => rows.map((row) => new FakeRowData(row));

const noteTestCases = [
  {
    rows: [
      {
        id: 123,
        title: "Hello, World",
        body: "Your First Program",
        time_stamp: new Date("2006-7-8"),
      },
    ],
    expectedNote: new NoteBuilder()
      .id(123)
      .title("Hello, World")
      .body("Your First Program")
      .timeStamp(new Date("2006-7-8"))
      .build(),
  },
  {
    rows: [
      {
        id: 5417,
        title: "Math",
        body: "A quiz about Math",
        time_stamp: "2003-3-14",
      },
    ],
    expectedNote: new NoteBuilder()
      .id(5417)
      .title("Math")
      .body("A quiz about Math")
      .timeStamp(new Date("2003-3-14"))
      .build(),
  },
  {
    rows: [
      {
        id: 69420,
        title: "Science",
        body: "A quiz about Science",
        time_stamp: new Date("2004-12-13"),
      },
    ],
    expectedNote: new NoteBuilder()
      .id(69420)
      .title("Science")
      .body("A quiz about Science")
      .timeStamp(new Date("2004-12-13"))
      .build(),
  },
];

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
    test("When called, should call Connection.prepareStatement with 'SELECT * FROM notes WHERE title = ?'", async () => {
      expect.assertions(1);
      const SQL = "SELECT * FROM notes WHERE title = ?";
      const assertion = () => expect(connection.prepareStatement).toHaveBeenCalledWith(SQL);
      await repository.findByTitle("title").then(assertion).catch(assertion);
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

    test.each(noteTestCases)(
      "When rows returned are $rows, should return $expectedNote",
      async ({ rows, expectedNote }) => {
        expect.assertions(1);

        const prepareStatement = mock<PreparedStatement>();
        connection.prepareStatement.mockReturnValue(prepareStatement);
        prepareStatement.setString.mockReturnValue(prepareStatement);
        prepareStatement.execute.mockResolvedValue(createFakeRowData(rows));

        expect(await repository.findByTitle("Hello, World")).toEqual(expectedNote);
      }
    );
  });

  describe("existByTitle", () => {
    test("When called, should call Connection.prepareStatement('SELECT count(id) FROM notes WHERE title = ?')", async () => {
      expect.assertions(1);
      const SQL = "SELECT count(id) FROM notes WHERE title = ?";
      const exists = repository.existByTitle("Hello, World");
      const assertion = () => expect(connection.prepareStatement).toHaveBeenCalledWith(SQL);
      await exists.then(assertion).catch(assertion);
    });

    test.each([
      { title: "Hello, World" },
      { title: "Groceries" },
      { title: "Math" },
      { title: "Science" },
      { title: "Monty Python" },
    ])(
      "When called with $title, should call PreparedStatement.setString($title)",
      async ({ title }) => {
        expect.assertions(1);
        const prepareStatement = mock<PreparedStatement>();
        connection.prepareStatement.mockReturnValue(prepareStatement);

        const exists = repository.existByTitle(title);
        const assertion = () => expect(prepareStatement.setString).toHaveBeenCalledWith(title);
        await exists.then(assertion).catch(assertion);
      }
    );

    test("When called, should call PreparedStatement.execute", async () => {
      expect.assertions(1);
      const prepareStatement = mock<PreparedStatement>();
      connection.prepareStatement.mockReturnValue(prepareStatement);
      prepareStatement.setString.mockReturnValue(prepareStatement);

      const exists = repository.existByTitle("Hello, World");
      const assertion = () => expect(prepareStatement.execute).toHaveBeenCalled();
      await exists.then(assertion).catch(assertion);
    });

    test.each([
      {
        rows: [{ count: 1 }],
        result: true,
      },
      {
        rows: [{ count: "1" }],
        result: true,
      },
      {
        rows: [{ count: 0 }],
        result: false,
      },
      {
        rows: [{ count: "0" }],
        result: false,
      },
    ])("When rows returned are $rows, should return $result", async ({ rows, result }) => {
      expect.assertions(1);
      const prepareStatement = mock<PreparedStatement>();
      connection.prepareStatement.mockReturnValue(prepareStatement);
      prepareStatement.setString.mockReturnValue(prepareStatement);
      prepareStatement.execute.mockResolvedValue(createFakeRowData(rows));

      expect(await repository.existByTitle("Hello, World")).toBe(result);
    });
  });

  describe("findById", () => {
    test("When called, should call Connection.prepareStatement('SELECT * FROM notes WHERE id = ?')", async () => {
      const SQL = "SELECT * FROM notes WHERE id = ?";
      const assertion = () => expect(connection.prepareStatement).toHaveBeenCalledWith(SQL);
      await repository.findById(123).then(assertion).catch(assertion);
    });

    test.each([{ id: 123 }, { id: 5417 }, { id: 2167 }, { id: 540 }, { id: 6890 }])(
      "When called with $id, should call PrepareStatement.setNumber($id)",
      async ({ id }) => {
        const preparedStatement = mock<PreparedStatement>();
        connection.prepareStatement.mockReturnValue(preparedStatement);
        const assertion = () => expect(preparedStatement.setNumber).toHaveBeenCalledWith(id);

        await repository.findById(id).then(assertion).catch(assertion);
      }
    );

    test("When called, should call PreparedStatement.execute()", async () => {
      const preparedStatement = mock<PreparedStatement>();
      connection.prepareStatement.mockReturnValue(preparedStatement);
      preparedStatement.setNumber.mockReturnValue(preparedStatement);

      const assertion = () => expect(preparedStatement.execute).toHaveBeenCalled();
      await repository.findById(123).then(assertion).catch(assertion);
    });

    test.each(noteTestCases)(
      "When rows returned are $rows, should return $expectedNote",
      async ({ rows, expectedNote }) => {
        const preparedStatement = mock<PreparedStatement>();
        connection.prepareStatement.mockReturnValue(preparedStatement);
        preparedStatement.setNumber.mockReturnValue(preparedStatement);
        preparedStatement.execute.mockResolvedValue(createFakeRowData(rows));

        expect(await repository.findById(123)).toEqual(expectedNote);
      }
    );
  });
});
