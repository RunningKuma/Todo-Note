import { useToast } from "primevue"

export const useToastHelper = () => {
  const _toast = useToast()
  return {
    info: (message: string, summary?: string) => {
      _toast.add({ severity: 'info', summary: summary ?? '信息', detail: message, life: 3000 })
    },
    success: (message: string, summary?: string) => {
      _toast.add({ severity: 'success', summary: summary ?? '成功', detail: message, life: 3000 })
    },
    error: (message: string, summary?: string) => {
      _toast.add({ severity: 'error', summary: summary ?? '错误', detail: message, life: 3000 })
    },
    warn: (message: string, summary?: string) => {
      _toast.add({ severity: 'warn', summary: summary ?? '警告', detail: message, life: 3000 })
    },
    remove: () => {
      _toast.removeAllGroups()
    }
  }
}