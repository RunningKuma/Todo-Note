# Vditor 差分算法使用指南

## 功能概述

本实现基于 Vditor 编辑器和 fast-diff 算法，提供了完整的文档版本管理和差异对比功能。

## 主要特性

### 1. 文档编辑
- 基于 Vditor 的所见即所得 Markdown 编辑器
- 支持实时预览和多种编辑模式
- 自动保存和内容变更监听

### 2. 版本管理
- 自动版本快照保存
- 版本历史查看和回滚
- 版本间差异对比

### 3. 差分算法
- 基于 fast-diff 的高效文本对比
- 可视化差异显示（插入/删除/相同）
- 差异统计和相似度计算

## 使用方法

### 1. 基本初始化

```typescript
import { noteDiffEngine } from '@/api/note/note';

// 初始化编辑器
const vditor = await noteDiffEngine.initVditor(document.getElementById('editor'), {
  mode: 'ir',
  height: 400,
  placeholder: '开始编写...',
  input: (value) => {
    console.log('内容变更:', value);
  }
});
```

### 2. 版本管理

```typescript
// 保存当前版本
const content = noteDiffEngine.getCurrentContent();
noteDiffEngine.saveVersion('note-001', content, '用户名');

// 获取版本历史
const versions = noteDiffEngine.getVersions('note-001');

// 设置编辑器内容
noteDiffEngine.setContent('新的内容');
```

### 3. 差异对比

```typescript
// 计算两个文本的差异
const diffs = noteDiffEngine.calculateDiff('旧文本', '新文本');

// 生成可视化差异 HTML
const diffHtml = noteDiffEngine.generateDiffHtml(diffs);

// 比较两个版本
const versionDiffs = noteDiffEngine.compareVersions('note-001', 'v1', 'v2');
```

### 4. 实时协作

```typescript
// 同步协作差异
const mergedContent = await noteDiffEngine.syncCollaborativeDiff(
  'note-001',
  '本地内容',
  '远程内容'
);
```

## 工具函数

### 1. 时间格式化
```typescript
import { noteUtils } from '@/api/note/note';

const formattedTime = noteUtils.formatTimestamp(Date.now());
```

### 2. 相似度计算
```typescript
const similarity = noteUtils.calculateSimilarity('文本1', '文本2');
console.log('相似度:', (similarity * 100).toFixed(2) + '%');
```

### 3. 差异统计
```typescript
const stats = noteUtils.getDiffStats(diffs);
console.log('添加:', stats.additions, '删除:', stats.deletions);
```

## Vue 组件使用

在 Vue 组件中使用演示组件：

```vue
<template>
  <VditorDiffDemo />
</template>

<script setup>
import VditorDiffDemo from '@/components/VditorDiffDemo.vue';
</script>
```

## 样式自定义

### 差异显示样式
```css
.diff-delete {
  background-color: #fef2f2;
  color: #991b1b;
  text-decoration: line-through;
}

.diff-insert {
  background-color: #f0fdf4;
  color: #166534;
}
```

## 配置选项

### Vditor 编辑器配置
- `mode`: 编辑模式 ('ir' | 'sv' | 'wysiwyg')
- `height`: 编辑器高度
- `placeholder`: 占位符文本
- `theme`: 主题 ('classic' | 'dark')

### 差分算法配置
- 版本保存限制：默认保留最近 50 个版本
- 冲突解决策略：优先保留插入内容
- 自动保存间隔：可自定义

## 注意事项

1. **性能考虑**：大文档的差分计算可能较慢，建议分段处理
2. **内存使用**：版本历史会占用内存，定期清理旧版本
3. **协作冲突**：实时协作时需要合理的冲突解决策略
4. **数据持久化**：当前版本仅存储在内存中，需要配合后端 API

## 扩展功能

可以进一步扩展的功能：
- 语法高亮差异显示
- 按行/按段落的精确差异
- 三方合并算法
- 差异应用和撤销
- 实时协作同步
