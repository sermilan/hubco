// E2E测试全局设置
// 设置测试超时
jest.setTimeout(30000);

// 全局清理
afterAll(async () => {
  // 等待所有异步操作完成
  await new Promise((resolve) => setTimeout(resolve, 500));
});
