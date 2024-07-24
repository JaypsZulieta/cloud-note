class Note {
  constructor(
    private id: number,
    private title: string,
    private body: string,
    private timeStamp: Date
  ) {}

  getId(): number {
    return this.id;
  }
  getTitle(): string {
    return this.title;
  }
  setTitle(title: string): void {
    this.title = title;
  }
  getBody(): string {
    return this.body;
  }
  setBody(body: string): void {
    this.body = body;
  }
  getTimeStamp(): Date {
    return this.timeStamp;
  }
}

export class NoteBuilder {
  private idSet?: number;
  private titleSet?: string;
  private bodySet?: string;
  private timeStampSet?: Date;

  id(id: number): NoteBuilder {
    this.idSet = id;
    return this;
  }

  title(title: string): NoteBuilder {
    this.titleSet = title;
    return this;
  }

  body(body: string): NoteBuilder {
    this.bodySet = body;
    return this;
  }

  timeStamp(timeStamp: Date): NoteBuilder {
    this.timeStampSet = timeStamp;
    return this;
  }

  private static formatError(member: string): string {
    return `'${member}' is non-nullable`;
  }

  build(): Note {
    if (!this.idSet) throw Error(NoteBuilder.formatError("id"));
    if (!this.titleSet) throw Error(NoteBuilder.formatError("title"));
    if (!this.bodySet) throw new Error(NoteBuilder.formatError("body"));
    if (!this.timeStampSet) throw new Error(NoteBuilder.formatError("timeStamp"));
    return new Note(this.idSet, this.titleSet, this.bodySet, this.timeStampSet);
  }
}

export type { Note };
