<template>
  <div class="vditor-diff-demo">
    <h3>Vditor 差分算法演示</h3>

    <!-- 编辑器容器 -->
    <div ref="vditorElement" class="vditor-container"></div>

    <!-- 控制面板 -->
    <div class="controls-panel">
      <Button label="手动保存" @click="saveCurrentVersion" />
      <Button label="刷新版本历史" @click="refreshVersionHistory" />
      <Button label="比较版本" @click="showDiffComparison" />
    </div>

    <!-- 版本历史 -->
    <div class="version-history">
      <h4>版本历史</h4>
      <div v-for="version in versions" :key="version.id" class="version-item">
        <span>{{ noteUtils.formatTimestamp(version.timestamp) }}</span>
        <Button label="查看" size="small" @click="viewVersion(version)" />
        <Button label="比较" size="small" severity="secondary" @click="selectForComparison(version)" />
      </div>
    </div>

    <!-- 差异对比 -->
    <div v-if="diffHtml" class="diff-display">
      <h4>版本差异</h4>
      <div class="diff-content" v-html="diffHtml"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { Button } from 'primevue';
import { NoteVersionRaw, noteDiffEngine, } from '@/api/note/diffEngine';
import 'vditor/dist/index.css';
import { noteUtils } from '@/api/utils/note';

const vditorElement = ref<HTMLDivElement | undefined>();
const versions = ref<NoteVersionRaw[]>([]);
const diffHtml = ref('');
const selectedVersions = ref<NoteVersionRaw[]>([]);

const noteId = ref('demo-note-001');

watch(
  () => noteId.value,
  async (newId) => {
    // 每次切换笔记时，重新加载版本列表
    versions.value = await noteDiffEngine.getAllVersions(newId);
    diffHtml.value = '';
    selectedVersions.value = [];
    noteDiffEngine.updateNoteId(newId);
  },
  { immediate: true }
);

onMounted(async () => {
  if (vditorElement.value) {
    await noteDiffEngine.initVditor(vditorElement.value, {
      height: '500px',
      placeholder: 'Start Typing Here...',
    });
    noteDiffEngine.setAutoSave(true, 2 * 60 * 1000);
  }
});

onUnmounted(() => {
  noteDiffEngine.destroy();
});

/**
 * 保存当前版本
 */
const saveCurrentVersion = async () => {
  const content = await noteDiffEngine.getCurrentContent();
  // @todo use real user
  await noteDiffEngine.saveVersion(noteId.value, content);

  // 刷新版本列表
  versions.value = await noteDiffEngine.getAllVersions(noteId.value);

  console.log('版本已保存:', content.substring(0, 50) + '...');
};

/**
 * 显示版本历史
 */
//@todo 查看历史时应当禁用 自动保存……
const refreshVersionHistory = async () => {
  versions.value = await noteDiffEngine.getAllVersions(noteId.value);
};

/**
 * 查看特定版本
 */
const viewVersion = (version: NoteVersionRaw) => {
  noteDiffEngine.setContent(version.content);
};

/**
 * 选择版本进行比较
 */
const selectForComparison = (version: NoteVersionRaw) => {
  if (selectedVersions.value.length < 2) {
    selectedVersions.value.push(version);
  }

  if (selectedVersions.value.length === 2) {
    compareTwoVersions();
  }
};

/**
 * 比较两个版本
 */
const compareTwoVersions = () => {
  if (selectedVersions.value.length === 2) {
    const [v1, v2] = selectedVersions.value;
    const diffs = noteDiffEngine.calculateDiff(v1.content, v2.content);
    diffHtml.value = noteDiffEngine.generateDiffHtml(diffs);

    // 显示差异统计
    const stats = noteUtils.getDiffStats(diffs);
    console.log('差异统计:', stats);

    // 重置选择
    selectedVersions.value = [];
  }
};

/**
 * 显示差异比较
 */
const showDiffComparison = async () => {
  const versionList = await noteDiffEngine.getAllVersions(noteId.value);
  if (versionList.length >= 2) {
    const latest = versionList[versionList.length - 1];
    const previous = versionList[versionList.length - 2];

    const diffs = noteDiffEngine.calculateDiff(previous.content, latest.content);
    diffHtml.value = noteDiffEngine.generateDiffHtml(diffs);

    // 计算相似度
    const similarity = noteUtils.calculateSimilarity(previous.content, latest.content);
    console.log('版本相似度:', (similarity * 100).toFixed(2) + '%');
  }
};

</script>

<style scoped>
.vditor-diff-demo {
  padding: 1rem;
  max-width: 64rem;
  margin: 0 auto;
}

.vditor-container {
  margin-bottom: 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
}

.controls-panel {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.version-history {
  margin-bottom: 1rem;
  padding: 1rem;
  background-color: #f8fafc;
  border-radius: 0.5rem;
}

.version-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid #e2e8f0;
}

.version-item:last-child {
  border-bottom: none;
}

.diff-display {
  padding: 1rem;
  background-color: #f8fafc;
  border-radius: 0.5rem;
}

.diff-content {
  font-family: monospace;
  font-size: 0.875rem;
  background-color: white;
  padding: 1rem;
  border-radius: 0.25rem;
  border: 1px solid #e2e8f0;
}

:deep(.diff-delete) {
  background-color: #fef2f2;
  color: #991b1b;
  text-decoration: line-through;
}

:deep(.diff-insert) {
  background-color: #f0fdf4;
  color: #166534;
}
</style>
