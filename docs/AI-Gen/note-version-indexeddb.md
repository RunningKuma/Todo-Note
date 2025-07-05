# 笔记版本管理 IndexedDB 集成指南

## 概述

本项目已将笔记版本管理系统从内存存储升级为使用 IndexedDB 进行持久化存储。这样可以确保用户的笔记版本历史在浏览器会话之间得到保留。

## 主要特性

### 1. 持久化存储
- 使用 IndexedDB 存储笔记版本数据
- 版本历史在浏览器重启后仍然保留
- 自动备份到本地数据库

### 2. 性能优化
- 内存缓存机制，提高读取速度
- 差异化存储，只保存变更部分
- 异步操作，不阻塞UI

### 3. 数据管理
- 自动清理过期数据
- 版本数量限制（最多50个版本）
- 存储使用情况监控

## 使用方法

### 基本使用

```typescript
import { noteDiffEngine } from '@/api/note/note';

// 初始化（自动完成）
// 数据库会在第一次使用时自动初始化

// 保存版本
await noteDiffEngine.saveVersion('note-id', '笔记内容', '作者');

// 获取所有版本
const versions = await noteDiffEngine.getVersions('note-id');

// 获取特定版本内容
const content = await noteDiffEngine.getVersionContent('note-id', 'version-id');

// 比较版本差异
const diffs = await noteDiffEngine.compareVersions('note-id', 'version1', 'version2');
```

### 数据管理

```typescript
// 获取所有笔记信息
const notesInfo = await noteDiffEngine.getAllNotesInfo();

// 删除笔记的所有版本
await noteDiffEngine.deleteNoteVersions('note-id');

// 清理过期数据（默认保留30天）
await noteDiffEngine.cleanupOldData(30);

// 获取存储使用情况
const storageInfo = await noteDiffEngine.getStorageInfo();
console.log(`使用: ${storageInfo.estimatedUsage} / ${storageInfo.quota} 字节`);
```

### Vditor 集成

```typescript
// 初始化编辑器（自动启用版本管理）
const vditor = await noteDiffEngine.initVditor(element, {
  // Vditor 配置选项
});

// 设置当前笔记ID
noteDiffEngine.updateNoteId('your-note-id');

// 配置自动保存
noteDiffEngine.setAutoSave(true, 2000); // 启用，2秒延迟
```

## 数据结构

### NoteVersion
```typescript
interface NoteVersion {
  id: string;
  content?: string;        // 完整内容（仅第一个版本）
  diffs?: NoteDiff[];     // 相对于前一版本的差异
  timestamp: number;       // 时间戳
  author?: string;         // 作者
  baseVersionId?: string;  // 基础版本ID
}
```

### NoteDiff
```typescript
interface NoteDiff {
  type: 'equal' | 'delete' | 'insert';
  text: string;
}
```

## 数据库架构

### 表结构

1. **notes** 表
   - `id` (string): 笔记ID（主键）
   - `versions` (NoteVersion[]): 版本数组
   - `lastModified` (number): 最后修改时间

2. **索引**
   - `lastModified`: 按修改时间索引，用于清理过期数据

## 最佳实践

### 1. 错误处理
```typescript
try {
  await noteDiffEngine.saveVersion(noteId, content, author);
} catch (error) {
  console.error('保存版本失败:', error);
  // 显示错误提示给用户
}
```

### 2. 性能考虑
- 避免频繁调用 `saveVersion`，使用内置的节流机制
- 定期清理过期数据，避免数据库过大
- 使用版本缓存，避免重复计算

### 3. 存储管理
```typescript
// 定期检查存储使用情况
const checkStorage = async () => {
  const { estimatedUsage, quota } = await noteDiffEngine.getStorageInfo();
  const usagePercent = (estimatedUsage / quota) * 100;

  if (usagePercent > 80) {
    // 警告用户存储空间不足
    await noteDiffEngine.cleanupOldData(15); // 清理15天前的数据
  }
};
```

## 迁移说明

如果您之前使用的是内存版本的系统，数据会在第一次运行时自动迁移到 IndexedDB。无需手动操作。

## 故障排除

### 常见问题

1. **数据库初始化失败**
   - 检查浏览器是否支持 IndexedDB
   - 确保有足够的存储空间
   - 检查浏览器隐私设置

2. **版本保存失败**
   - 检查网络连接
   - 确保数据库已正确初始化
   - 查看浏览器控制台错误信息

3. **性能问题**
   - 检查版本数量是否过多
   - 考虑清理过期数据
   - 检查缓存设置

### 调试工具

可以使用示例代码进行测试：

```typescript
import { NoteVersionExample } from '@/api/utils/noteVersionExample';

// 运行基本示例
await NoteVersionExample.init();

// 运行性能测试
await NoteVersionExample.performanceTest();

// 清理测试数据
await NoteVersionExample.cleanup();
```

## 浏览器兼容性

- Chrome/Edge: 完全支持
- Firefox: 完全支持
- Safari: 完全支持
- IE: 不支持（需要polyfill）

## 备份建议

虽然 IndexedDB 提供了持久化存储，但建议：

1. 定期导出重要笔记
2. 使用云同步功能（如果可用）
3. 在关键操作前手动备份
