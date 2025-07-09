"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NoteService = void 0;
const note_1 = require("../models/note");
class NoteService {
    constructor() {
        note_1.NoteClass.createTable();
    }
}
exports.NoteService = NoteService;
