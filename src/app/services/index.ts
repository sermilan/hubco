// ============ 服务层统一导出 ============

export {
  // 标签匹配引擎
  searchCOUs,
  searchCOUsDetailed,
  calculateMatchScore,
  calculateFinalWeight,
  findMatchedTags,
  findMissedRequiredTags,
  createQueryFromTemplate,
  validateFiveDimensionalTags,
  calculateTagCombinationWeight,
  getWeightRiskLevel,
  createEmptyFiveDimensionalTags,
  DEFAULT_MATCHING_CONFIG,
  DOMAIN_COEFFICIENTS,
} from "./tagMatching";

export type {
  DetailedMatchResult,
} from "./tagMatching";

export {
  // To-Do 生成器
  generateToDoList,
  sortToDoItems,
  groupToDoItemsByPriority,
  groupToDoItemsByStatus,
  calculateToDoStats,
  updateToDoStatus,
  batchUpdateToDoStatus,
  markOverdueItems,
} from "./todoGenerator";

export type {
  ToDoStats,
} from "./todoGenerator";
