import { TodoId, UserId } from "./gerneral"
import { NoteContent, NoteMeta } from "./note"
import { TodoInfo, TodoStatus } from "./todo"

export type UserRawData = {
  id: UserId,
  email: string,
  username: string,
  password: string,
}
export type TodoRawData = Exclude<TodoInfo, 'create' | 'ddl' | 'tags'> & TodoStatus & {
  user_id: UserId,
  created_at: string, // SQLite 返回的是字符串格式的日期
  ddl?: string,
  tags?: string, // JSON 字符串格式的标签数组
}
// export type NoteRawData = NoteMeta