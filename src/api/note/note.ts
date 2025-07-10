import { AxiosResponse } from 'axios';
import type { Note, NoteMeta, NoteTreeNode, UpdateNote, UpdateNoteMeta } from '../types/note';
import { request } from '../utils/request';
import { ApiResponse } from '../types/request';
import { NoteId } from '../types/gerneral';
import { testNote, testTreeData } from '../constants/test';

// let _testNoteTreeData = testTreeData;
// @todo 极其多重复代码，考虑包装
// 笔记操作API
export const noteOps = {
  /**
   * 获取用户笔记目录结构
   */
  getNoteTree: async (): Promise<ApiResponse<NoteTreeNode[]>> => {
    // return { success: true, data: _testNoteTreeData }
    const response = await request.get('/notes/folders')
      .catch(res => {
        return { success: false, ...res.response } as AxiosResponse;
      });
    const { message } = response.data as { message: string } ?? { message: '' };

    if (response.status === 200) {
      return response.data as ApiResponse<NoteTreeNode[]>;
    }

    return { success: false, data: [], message: message ?? '获取笔记目录失败' };
  },
  /**
   * 更新用户笔记目录结构
   */
  updateNoteTree: async (treeData: NoteTreeNode[]): Promise<ApiResponse<{ success: boolean }>> => {
    // _testNoteTreeData = treeData;
    // return { success: true, data: { success: true } }
    const response = await request.put('/notes/folders', { data: treeData })
      .catch(res => {
        console.error('更新笔记目录失败:', res);
        return { success: false, ...res.response } as AxiosResponse;
      });
    const { message } = response.data as { message: string } ?? { message: '' };

    if (response.status === 200) {
      return response.data as ApiResponse<{ success: boolean }>;
    }

    return { success: false, message: message ?? '更新笔记目录失败' };
  },

  /**
   * 获取单个笔记
   */
  getNote: async (id: NoteId): Promise<ApiResponse<Note>> => {
    // return { success: true, data: testNote }
    const response = await request.get(`/notes/${id}`)
      .catch(res => {
        console.error('获取笔记失败:', res);
        return { success: false, ...res.response } as AxiosResponse;
      });
    const { message } = response.data as { message: string } ?? { message: '' };

    if (response.status === 200) {
      return response.data as ApiResponse<Note>;
    }

    return { success: false, message: message ?? '获取笔记失败' };
  },

  /**
   * 创建新笔记
   */
  createNote: async (noteMeta: NoteMeta): Promise<ApiResponse<{ success: boolean }>> => {
    // return { success: true, data: { success: true } }
    const response = await request.post('/notes', noteMeta)
      .catch(res => {
        console.error('创建笔记失败:', res);
        return { success: false, ...res.response } as AxiosResponse;
      });
    const { message } = response.data as { message: string } ?? { message: '' };

    if (response.status === 201) {
      return response.data as ApiResponse<{ success: boolean }>;
    }

    return { success: false, message: message ?? '创建笔记失败' };
  },

  /**
   * 更新笔记
   */
  updateNote: async (note: UpdateNote): Promise<ApiResponse<{ success: boolean }>> => {
    const response = await request.put(`/notes`, { data: note })
      .catch(res => {
        console.error('更新笔记失败:', res);
        return { success: false, ...res.response } as AxiosResponse;
      });
    const { message } = response.data as { message: string } ?? { message: '' };

    if (response.status === 200) {
      return response.data as ApiResponse<{ success: boolean }>;
    }

    return { success: false, message: message ?? '更新笔记失败' };
  },

  /**
   * 删除笔记
   */
  deleteNote: async (id: NoteId): Promise<ApiResponse<void>> => {
    const response = await request.delete(`/notes/${id}`)
      .catch(res => {
        console.error('删除笔记失败:', res);
        return { success: false, ...res.response } as AxiosResponse;
      });
    const { message } = response.data as { message: string } ?? { message: '' };

    if (response.status === 200) {
      return response.data as ApiResponse<void>;
    }

    return { success: false, message: message ?? '删除笔记失败' };
  },
};