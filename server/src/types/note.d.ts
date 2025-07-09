import { TreeNode } from "primevue/treenode";
import { NoteFolderId, NoteId, NoteTags } from "./gerneral";

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

export type NoteTreeNode = Pick<TreeNode, 'label' | 'selectable'> & {
  key: NoteFolderId | NoteId,
  type: 'folder' | 'note',
  children?: NoteTreeNode[],
}