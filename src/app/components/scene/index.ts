// ============ Scene Builder Components ============
// 场景构建器组件库统一导出

// Provider
export { SceneBuilderProvider, useSceneBuilder } from "./SceneBuilderProvider";
export type { BuildStep, BuildMode, ProfileData } from "./SceneBuilderProvider";

// Shared Components
export {
  StepIndicator,
  USER_MODE_STEPS,
  ADMIN_MODE_STEPS,
} from "./shared/StepIndicator";
export {
  TemplateCard,
  UserSceneCard,
  CompactSceneCard,
  EmptySceneCard,
} from "./shared/SceneCard";

// Steps (将在后续实现)
// export { TemplateSelectStep } from "./steps/TemplateSelectStep";
// export { BusinessProfileStep } from "./steps/BusinessProfileStep";
// export { TagConfigStep } from "./steps/TagConfigStep";
// export { MatchingResultStep } from "./steps/MatchingResultStep";
// export { PreviewConfirmStep } from "./steps/PreviewConfirmStep";

// Panels (将在后续实现)
// export { TemplateEditorPanel } from "./panels/TemplateEditorPanel";
// export { MatchingRulePanel } from "./panels/MatchingRulePanel";
