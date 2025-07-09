import { NoteClass } from '../models/note';

export class NoteService {
  constructor() {
    NoteClass.createTable();
  }
}
