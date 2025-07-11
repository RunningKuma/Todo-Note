import { TreeNode } from "primevue/treenode"
import { NoteFolderId, NoteId, NoteTags } from "./gerneral"

export type NoteMeta = {
  id: NoteId,
  title: string,
  create: Date,
  modified: Date,
  tags?: NoteTags
}
export type NoteContent = string

export type UpdateNoteMeta = Pick<NoteMeta, 'id'> & Partial<NoteMeta>
export type UpdateNote = { meta: UpdateNoteMeta, content?: NoteContent }

export type NoteList = Pick<NoteMeta, 'id' | 'title'>

export type NoteMetaTrans = Pick<NoteMeta, 'id' | 'title' | 'tags'> & {
  create: string,
  modified: string
}
export type NoteTrans = {
  meta: NoteMetaTrans,
  content: NoteContent
}
export type Note = {
  meta: NoteMeta,
  content: NoteContent
}

export type NoteTreeType = 'folder' | 'note'
export type NoteTreeNode = Pick<TreeNode, 'label' | 'selectable'> & {
  key: NoteFolderId | NoteId,
  type: NoteTreeType,
  children?: NoteTreeNode[],
}