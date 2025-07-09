import { noteDiffEngine } from '../note/diffEngine';

/**
 * 笔记版本管理使用示例
 */
export class NoteVersionExample {

  /**
   * 初始化示例
   */
  static async init() {
    console.log('=== 笔记版本管理示例 ===');

    // 1. 创建一个笔记并保存几个版本
    const noteId = 'example-note-1';

    console.log('1. 保存初始版本...');
    await noteDiffEngine.saveVersion(noteId, '# 我的第一篇笔记\n\n这是初始内容。', '用户A');

    console.log('2. 保存第二个版本...');
    await noteDiffEngine.saveVersion(noteId, '# 我的第一篇笔记\n\n这是初始内容。\n\n新增了一些内容。', '用户A');

    console.log('3. 保存第三个版本...');
    await noteDiffEngine.saveVersion(noteId, '# 我的第一篇笔记\n\n这是修改后的内容。\n\n新增了一些内容。', '用户B');

    // 2. 查看所有版本
    console.log('4. 获取所有版本...');
    const versions = await noteDiffEngine.getVersions(noteId);
    console.log(`共有 ${versions.length} 个版本:`);
    versions.forEach((version, index) => {
      console.log(`  版本 ${index + 1}: ${version.id} (${new Date(version.timestamp).toLocaleString()})`);
    });

    // 3. 获取特定版本的内容
    if (versions.length > 0) {
      console.log('5. 获取第一个版本的内容...');
      const firstVersionContent = await noteDiffEngine.getVersionContent(noteId, versions[0].id);
      console.log('第一个版本内容:', firstVersionContent);

      if (versions.length > 1) {
        console.log('6. 获取最新版本的内容...');
        const latestVersionContent = await noteDiffEngine.getVersionContent(noteId, versions[versions.length - 1].id);
        console.log('最新版本内容:', latestVersionContent);
      }
    }

    // 4. 比较版本差异
    if (versions.length >= 2) {
      console.log('7. 比较版本差异...');
      const diffs = await noteDiffEngine.compareVersions(noteId, versions[0].id, versions[1].id);
      if (diffs) {
        console.log('版本差异:');
        diffs.forEach(diff => {
          console.log(`  ${diff.type}: "${diff.text}"`);
        });
      }
    }

    // 5. 获取所有笔记信息
    console.log('8. 获取所有笔记信息...');
    const notesInfo = await noteDiffEngine.getAllNotesInfo();
    console.log('所有笔记信息:', notesInfo);

    // 6. 获取存储使用情况
    console.log('9. 获取存储使用情况...');
    const storageInfo = await noteDiffEngine.getStorageInfo();
    console.log(`存储使用情况: ${(storageInfo.estimatedUsage / 1024 / 1024).toFixed(2)} MB / ${(storageInfo.quota / 1024 / 1024).toFixed(2)} MB`);

    console.log('=== 示例完成 ===');
  }

  /**
   * 清理示例数据
   */
  static async cleanup() {
    console.log('清理示例数据...');
    await noteDiffEngine.deleteNoteVersions('example-note-1');
    console.log('清理完成');
  }

  /**
   * 性能测试
   */
  static async performanceTest() {
    console.log('=== 性能测试 ===');

    const noteId = 'performance-test-note';
    const startTime = Date.now();

    // 保存 100 个版本
    for (let i = 0; i < 100; i++) {
      const content = `# 性能测试笔记\n\n这是第 ${i + 1} 个版本的内容。\n\n随机内容: ${Math.random()}`;
      await noteDiffEngine.saveVersion(noteId, content, '测试用户');

      if (i % 10 === 9) {
        console.log(`已保存 ${i + 1} 个版本...`);
      }
    }

    const saveTime = Date.now() - startTime;
    console.log(`保存 100 个版本耗时: ${saveTime} ms`);

    // 读取所有版本
    const readStartTime = Date.now();
    const versions = await noteDiffEngine.getVersions(noteId);
    await noteDiffEngine.getAllVersions(noteId);
    const readTime = Date.now() - readStartTime;

    console.log(`读取 ${versions.length} 个版本耗时: ${readTime} ms`);
    console.log(`平均每个版本: ${(readTime / versions.length).toFixed(2)} ms`);

    // 清理测试数据
    await noteDiffEngine.deleteNoteVersions(noteId);

    console.log('=== 性能测试完成 ===');
  }
}

// 在开发环境中可以运行示例
if (import.meta.env.DEV) {
  // 延迟运行，确保页面加载完成
  setTimeout(() => {
    console.log('运行笔记版本管理示例...');
    NoteVersionExample.init().catch(console.error);
  }, 2000);
}
