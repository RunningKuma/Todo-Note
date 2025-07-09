import { AxiosResponse } from 'axios';
import type { Note, NoteMeta, NoteTreeNode } from '../types/note';
import { request } from '../utils/request';
import { ApiResponse } from '../types/request';
import { NoteId } from '../types/gerneral';

// 笔记操作API
export const noteOps = {
  /**
   * 获取用户笔记目录结构
   */
  getNoteTree: async (): Promise<ApiResponse<NoteTreeNode[]>> => {
    const response = await request.get('/notes')
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
   * 获取单个笔记
   */
  getNote: async (id: NoteId): Promise<ApiResponse<Note>> => {
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
  updateNote: async (note: Note): Promise<ApiResponse<{ success: boolean }>> => {
    const response = await request.put(`/notes`, note)
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