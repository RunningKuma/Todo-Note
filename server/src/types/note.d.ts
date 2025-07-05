export type Note_Old = {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export type NoteMeta = {
  id: NoteId,
  title: string,
  create: Date,
  modified: Date
  tags?: NoteTags
}
export type NoteContent = string

export type Note = {
  meta: NoteMeta,
  content: NoteContent
}