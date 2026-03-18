// ============ SceneBuilderProvider ============
// 场景构建器状态管理 - 使用React Context + useReducer
// 管理构建器的完整状态生命周期

import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useMemo,
  useEffect,
  ReactNode,
} from "react";
import type {
  SceneTemplate,
  CustomScene,
  FiveDimensionalTags,
  ControlObjective,
  MatchedControlObjective,
  Industry,
  Region,
  UserType,
  SceneMatchingConfig,
} from "../../types";
import {
  sceneBuilderService,
  BusinessProfile,
  MatchingResult,
} from "../../services/sceneBuilder";

// ============ 类型定义 ============

export type BuildStep =
  | "template"
  | "profile"
  | "tags"
  | "matching"
  | "preview"
  | "complete";

export type BuildMode = "user" | "admin";

// 业务画像
export interface ProfileData {
  name: string;
  description: string;
  industry: Industry;
  region: Region;
  userType: UserType;
  scale: "small" | "medium" | "large" | "enterprise";
  dataTypes: string[];
  specialRequirements: string[];
}

// 匹配结果状态
export interface MatchingState {
  isLoading: boolean;
  results: MatchedControlObjective[];
  selectedIds: Set<string>;
  error: string | null;
}

// 构建器状态
export interface SceneBuilderState {
  // 基础
  mode: BuildMode;
  currentStep: BuildStep;
  isLoading: boolean;
  error: string | null;

  // 步骤完成状态
  completedSteps: Set<BuildStep>;

  // 模板数据
  templates: SceneTemplate[];
  selectedTemplate: SceneTemplate | null;
  templateVersions: Map<string, string>; // templateId -> version

  // 业务画像
  profile: ProfileData;

  // 标签配置
  tags: FiveDimensionalTags;

  // 匹配结果
  matching: MatchingState;

  // 预览数据
  previewScene: CustomScene | null;

  // 编辑模式（用于二次编辑场景）
  isEditing: boolean;
  editingSceneId: string | null;

  // 草稿状态
  hasUnsavedChanges: boolean;
  lastSavedAt: Date | null;
}

// ============ 初始状态 ============

const initialProfile: ProfileData = {
  name: "",
  description: "",
  industry: "互联网",
  region: "国内",
  userType: "中小企业",
  scale: "medium",
  dataTypes: [],
  specialRequirements: [],
};

const initialTags: FiveDimensionalTags = {
  objects: [],
  subjects: [],
  lifecycles: [],
  securities: [],
  actions: [],
};

const initialMatchingState: MatchingState = {
  isLoading: false,
  results: [],
  selectedIds: new Set(),
  error: null,
};

const createInitialState = (mode: BuildMode): SceneBuilderState => ({
  mode,
  currentStep: "template",
  isLoading: false,
  error: null,
  completedSteps: new Set(),
  templates: [],
  selectedTemplate: null,
  templateVersions: new Map(),
  profile: { ...initialProfile },
  tags: { ...initialTags },
  matching: { ...initialMatchingState },
  previewScene: null,
  isEditing: false,
  editingSceneId: null,
  hasUnsavedChanges: false,
  lastSavedAt: null,
});

// ============ Actions ============

export type SceneBuilderAction =
  // 基础操作
  | { type: "SET_MODE"; payload: BuildMode }
  | { type: "SET_STEP"; payload: BuildStep }
  | { type: "NEXT_STEP" }
  | { type: "PREV_STEP" }
  | { type: "GO_TO_STEP"; payload: BuildStep }
  | { type: "MARK_STEP_COMPLETE"; payload: BuildStep }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "RESET"; payload: BuildMode }

  // 模板操作
  | { type: "SET_TEMPLATES"; payload: SceneTemplate[] }
  | { type: "SELECT_TEMPLATE"; payload: SceneTemplate }
  | { type: "SET_TEMPLATE_VERSION"; payload: { templateId: string; version: string } }

  // 画像操作
  | { type: "UPDATE_PROFILE"; payload: Partial<ProfileData> }
  | { type: "RESET_PROFILE" }

  // 标签操作
  | { type: "SET_TAGS"; payload: FiveDimensionalTags }
  | { type: "UPDATE_TAGS"; payload: Partial<FiveDimensionalTags> }
  | { type: "ADD_TAG"; payload: { dimension: keyof FiveDimensionalTags; tag: string } }
  | { type: "REMOVE_TAG"; payload: { dimension: keyof FiveDimensionalTags; tag: string } }
  | { type: "RESET_TAGS" }

  // 匹配操作
  | { type: "SET_MATCHING_LOADING"; payload: boolean }
  | { type: "SET_MATCHING_RESULTS"; payload: MatchedControlObjective[] }
  | { type: "TOGGLE_CO_SELECTION"; payload: string }
  | { type: "SELECT_ALL_CO" }
  | { type: "DESELECT_ALL_CO" }
  | { type: "SET_MATCHING_ERROR"; payload: string | null }

  // 预览操作
  | { type: "SET_PREVIEW_SCENE"; payload: CustomScene | null }
  | { type: "CLEAR_PREVIEW" }

  // 编辑模式
  | { type: "START_EDITING"; payload: string }
  | { type: "LOAD_SCENE_DATA"; payload: CustomScene }
  | { type: "EXIT_EDITING" }

  // 草稿状态
  | { type: "MARK_UNSAVED" }
  | { type: "MARK_SAVED" }
  | { type: "UPDATE_LAST_SAVED" };

// ============ Reducer ============

function sceneBuilderReducer(
  state: SceneBuilderState,
  action: SceneBuilderAction
): SceneBuilderState {
  switch (action.type) {
    // 基础操作
    case "SET_MODE":
      return { ...state, mode: action.payload };

    case "SET_STEP":
      return { ...state, currentStep: action.payload };

    case "NEXT_STEP": {
      const steps: BuildStep[] = ["template", "profile", "tags", "matching", "preview", "complete"];
      const currentIndex = steps.indexOf(state.currentStep);
      const nextStep = steps[currentIndex + 1];
      if (nextStep) {
        return {
          ...state,
          currentStep: nextStep,
          completedSteps: new Set([...state.completedSteps, state.currentStep]),
        };
      }
      return state;
    }

    case "PREV_STEP": {
      const steps: BuildStep[] = ["template", "profile", "tags", "matching", "preview", "complete"];
      const currentIndex = steps.indexOf(state.currentStep);
      const prevStep = steps[currentIndex - 1];
      if (prevStep) {
        return { ...state, currentStep: prevStep };
      }
      return state;
    }

    case "GO_TO_STEP":
      // 只能跳转到已完成的步骤或当前步骤
      if (
        state.completedSteps.has(action.payload) ||
        action.payload === state.currentStep
      ) {
        return { ...state, currentStep: action.payload };
      }
      return state;

    case "MARK_STEP_COMPLETE":
      return {
        ...state,
        completedSteps: new Set([...state.completedSteps, action.payload]),
      };

    case "SET_LOADING":
      return { ...state, isLoading: action.payload };

    case "SET_ERROR":
      return { ...state, error: action.payload };

    case "RESET":
      return createInitialState(action.payload);

    // 模板操作
    case "SET_TEMPLATES":
      return { ...state, templates: action.payload };

    case "SELECT_TEMPLATE": {
      const template = action.payload;
      // 自动填充画像和标签
      return {
        ...state,
        selectedTemplate: template,
        profile: {
          ...state.profile,
          name: template.name,
          description: template.description,
          industry: template.targetIndustries[0] || state.profile.industry,
          region: template.targetRegions[0] || state.profile.region,
          userType: template.targetUserTypes[0] || state.profile.userType,
        },
        tags: {
          objects: template.tagProfile.requiredTags.filter((t) =>
            t.startsWith("OBJ-")
          ),
          subjects: template.tagProfile.requiredTags.filter((t) =>
            t.startsWith("SUB-")
          ),
          lifecycles: template.tagProfile.requiredTags.filter((t) =>
            t.startsWith("LIF-")
          ),
          securities: template.tagProfile.requiredTags.filter((t) =>
            t.startsWith("SEC-")
          ),
          actions: template.tagProfile.requiredTags.filter((t) =>
            t.startsWith("ACT-")
          ),
        },
        hasUnsavedChanges: true,
      };
    }

    case "SET_TEMPLATE_VERSION": {
      const newVersions = new Map(state.templateVersions);
      newVersions.set(action.payload.templateId, action.payload.version);
      return { ...state, templateVersions: newVersions };
    }

    // 画像操作
    case "UPDATE_PROFILE":
      return {
        ...state,
        profile: { ...state.profile, ...action.payload },
        hasUnsavedChanges: true,
      };

    case "RESET_PROFILE":
      return { ...state, profile: { ...initialProfile } };

    // 标签操作
    case "SET_TAGS":
      return { ...state, tags: action.payload, hasUnsavedChanges: true };

    case "UPDATE_TAGS":
      return {
        ...state,
        tags: { ...state.tags, ...action.payload },
        hasUnsavedChanges: true,
      };

    case "ADD_TAG": {
      const { dimension, tag } = action.payload;
      const currentTags = state.tags[dimension] || [];
      if (currentTags.includes(tag)) return state;
      return {
        ...state,
        tags: {
          ...state.tags,
          [dimension]: [...currentTags, tag],
        },
        hasUnsavedChanges: true,
      };
    }

    case "REMOVE_TAG": {
      const { dimension, tag } = action.payload;
      return {
        ...state,
        tags: {
          ...state.tags,
          [dimension]: state.tags[dimension].filter((t) => t !== tag),
        },
        hasUnsavedChanges: true,
      };
    }

    case "RESET_TAGS":
      return { ...state, tags: { ...initialTags } };

    // 匹配操作
    case "SET_MATCHING_LOADING":
      return {
        ...state,
        matching: { ...state.matching, isLoading: action.payload },
      };

    case "SET_MATCHING_RESULTS": {
      const results = action.payload;
      // 自动选择推荐的CO
      const recommendedIds = new Set(
        results.filter((r) => r.isRecommended).map((r) => r.controlObjective.id)
      );
      return {
        ...state,
        matching: {
          ...state.matching,
          results,
          selectedIds: recommendedIds,
          isLoading: false,
        },
      };
    }

    case "TOGGLE_CO_SELECTION": {
      const id = action.payload;
      const newSelected = new Set(state.matching.selectedIds);
      if (newSelected.has(id)) {
        newSelected.delete(id);
      } else {
        newSelected.add(id);
      }
      return {
        ...state,
        matching: { ...state.matching, selectedIds: newSelected },
        hasUnsavedChanges: true,
      };
    }

    case "SELECT_ALL_CO": {
      const allIds = new Set(
        state.matching.results.map((r) => r.controlObjective.id)
      );
      return {
        ...state,
        matching: { ...state.matching, selectedIds: allIds },
        hasUnsavedChanges: true,
      };
    }

    case "DESELECT_ALL_CO":
      return {
        ...state,
        matching: { ...state.matching, selectedIds: new Set() },
        hasUnsavedChanges: true,
      };

    case "SET_MATCHING_ERROR":
      return {
        ...state,
        matching: { ...state.matching, error: action.payload },
      };

    // 预览操作
    case "SET_PREVIEW_SCENE":
      return { ...state, previewScene: action.payload };

    case "CLEAR_PREVIEW":
      return { ...state, previewScene: null };

    // 编辑模式
    case "START_EDITING":
      return {
        ...state,
        isEditing: true,
        editingSceneId: action.payload,
      };

    case "LOAD_SCENE_DATA": {
      const scene = action.payload;
      return {
        ...state,
        profile: {
          name: scene.name,
          description: scene.description,
          industry: scene.industry,
          region: scene.region,
          userType: scene.userType,
          scale: "medium",
          dataTypes: [],
          specialRequirements: scene.specialRequirements,
        },
        tags: scene.selectedTags,
        previewScene: scene,
      };
    }

    case "EXIT_EDITING":
      return {
        ...state,
        isEditing: false,
        editingSceneId: null,
      };

    // 草稿状态
    case "MARK_UNSAVED":
      return { ...state, hasUnsavedChanges: true };

    case "MARK_SAVED":
      return { ...state, hasUnsavedChanges: false };

    case "UPDATE_LAST_SAVED":
      return { ...state, lastSavedAt: new Date() };

    default:
      return state;
  }
}

// ============ Context ============

interface SceneBuilderContextValue {
  state: SceneBuilderState;
  dispatch: React.Dispatch<SceneBuilderAction>;

  // 便捷方法
  selectTemplate: (template: SceneTemplate) => void;
  updateProfile: (profile: Partial<ProfileData>) => void;
  addTag: (dimension: keyof FiveDimensionalTags, tag: string) => void;
  removeTag: (dimension: keyof FiveDimensionalTags, tag: string) => void;
  toggleCOSelection: (id: string) => void;
  goToNextStep: () => void;
  goToPrevStep: () => void;
  canGoToStep: (step: BuildStep) => boolean;

  // 异步操作
  loadTemplates: () => Promise<void>;
  runMatching: () => Promise<void>;
  generatePreview: () => Promise<void>;
  saveScene: () => Promise<CustomScene | null>;

  // 编辑模式
  startEditing: (sceneId: string, scene: CustomScene) => void;
  exitEditing: () => void;
}

const SceneBuilderContext = createContext<SceneBuilderContextValue | null>(
  null
);

// ============ Provider ============

interface SceneBuilderProviderProps {
  children: ReactNode;
  mode: BuildMode;
  initialScene?: CustomScene;
}

export function SceneBuilderProvider({
  children,
  mode,
  initialScene,
}: SceneBuilderProviderProps) {
  const [state, dispatch] = useReducer(
    sceneBuilderReducer,
    mode,
    createInitialState
  );

  // 如果有初始场景数据（编辑模式），加载它
  useEffect(() => {
    if (initialScene) {
      dispatch({ type: "LOAD_SCENE_DATA", payload: initialScene });
      dispatch({ type: "START_EDITING", payload: initialScene.id });
    }
  }, [initialScene]);

  // ============ 便捷方法 ============

  const selectTemplate = useCallback((template: SceneTemplate) => {
    dispatch({ type: "SELECT_TEMPLATE", payload: template });
  }, []);

  const updateProfile = useCallback((profile: Partial<ProfileData>) => {
    dispatch({ type: "UPDATE_PROFILE", payload: profile });
  }, []);

  const addTag = useCallback(
    (dimension: keyof FiveDimensionalTags, tag: string) => {
      dispatch({ type: "ADD_TAG", payload: { dimension, tag } });
    },
    []
  );

  const removeTag = useCallback(
    (dimension: keyof FiveDimensionalTags, tag: string) => {
      dispatch({ type: "REMOVE_TAG", payload: { dimension, tag } });
    },
    []
  );

  const toggleCOSelection = useCallback((id: string) => {
    dispatch({ type: "TOGGLE_CO_SELECTION", payload: id });
  }, []);

  const goToNextStep = useCallback(() => {
    dispatch({ type: "NEXT_STEP" });
  }, []);

  const goToPrevStep = useCallback(() => {
    dispatch({ type: "PREV_STEP" });
  }, []);

  const canGoToStep = useCallback(
    (step: BuildStep) => {
      return (
        state.completedSteps.has(step) || step === state.currentStep
      );
    },
    [state.completedSteps, state.currentStep]
  );

  // ============ 异步操作 ============

  const loadTemplates = useCallback(async () => {
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      const templates = await sceneBuilderService.loadTemplates();
      dispatch({ type: "SET_TEMPLATES", payload: templates });
    } catch (error) {
      dispatch({
        type: "SET_ERROR",
        payload: error instanceof Error ? error.message : "加载模板失败",
      });
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, []);

  const runMatching = useCallback(async () => {
    if (!state.selectedTemplate) return;

    dispatch({ type: "SET_MATCHING_LOADING", payload: true });
    try {
      const results = await sceneBuilderService.matchControlObjectives(
        state.tags,
        state.selectedTemplate.matchingConfig
      );
      dispatch({ type: "SET_MATCHING_RESULTS", payload: results });
    } catch (error) {
      dispatch({
        type: "SET_MATCHING_ERROR",
        payload: error instanceof Error ? error.message : "匹配失败",
      });
    }
  }, [state.selectedTemplate, state.tags]);

  const generatePreview = useCallback(async () => {
    if (!state.selectedTemplate) return;

    dispatch({ type: "SET_LOADING", payload: true });
    try {
      const businessProfile: BusinessProfile = {
        name: state.profile.name,
        description: state.profile.description,
        industry: state.profile.industry,
        region: state.profile.region,
        userType: state.profile.userType,
        scale: state.profile.scale,
        dataTypes: state.profile.dataTypes,
        specialRequirements: state.profile.specialRequirements,
      };

      const scene = await sceneBuilderService.generateScene({
        template: state.selectedTemplate,
        profile: businessProfile,
        tags: state.tags,
        selectedCOIds: Array.from(state.matching.selectedIds),
        autoSelectRecommended: false,
      });

      dispatch({ type: "SET_PREVIEW_SCENE", payload: scene });
    } catch (error) {
      dispatch({
        type: "SET_ERROR",
        payload: error instanceof Error ? error.message : "生成预览失败",
      });
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, [
    state.selectedTemplate,
    state.profile,
    state.tags,
    state.matching.selectedIds,
  ]);

  const saveScene = useCallback(async (): Promise<CustomScene | null> => {
    if (!state.previewScene) return null;

    dispatch({ type: "SET_LOADING", payload: true });
    try {
      // 实际项目中应调用API保存
      // const savedScene = await api.scenes.create(state.previewScene);

      dispatch({ type: "MARK_SAVED" });
      dispatch({ type: "UPDATE_LAST_SAVED" });

      return state.previewScene;
    } catch (error) {
      dispatch({
        type: "SET_ERROR",
        payload: error instanceof Error ? error.message : "保存失败",
      });
      return null;
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, [state.previewScene]);

  // ============ 编辑模式 ============

  const startEditing = useCallback((sceneId: string, scene: CustomScene) => {
    dispatch({ type: "START_EDITING", payload: sceneId });
    dispatch({ type: "LOAD_SCENE_DATA", payload: scene });
  }, []);

  const exitEditing = useCallback(() => {
    dispatch({ type: "EXIT_EDITING" });
    dispatch({ type: "RESET", payload: state.mode });
  }, [state.mode]);

  // ============ Context Value ============

  const contextValue = useMemo<SceneBuilderContextValue>(
    () => ({
      state,
      dispatch,
      selectTemplate,
      updateProfile,
      addTag,
      removeTag,
      toggleCOSelection,
      goToNextStep,
      goToPrevStep,
      canGoToStep,
      loadTemplates,
      runMatching,
      generatePreview,
      saveScene,
      startEditing,
      exitEditing,
    }),
    [
      state,
      selectTemplate,
      updateProfile,
      addTag,
      removeTag,
      toggleCOSelection,
      goToNextStep,
      goToPrevStep,
      canGoToStep,
      loadTemplates,
      runMatching,
      generatePreview,
      saveScene,
      startEditing,
      exitEditing,
    ]
  );

  return (
    <SceneBuilderContext.Provider value={contextValue}>
      {children}
    </SceneBuilderContext.Provider>
  );
}

// ============ Hook ============

export function useSceneBuilder(): SceneBuilderContextValue {
  const context = useContext(SceneBuilderContext);
  if (!context) {
    throw new Error(
      "useSceneBuilder must be used within a SceneBuilderProvider"
    );
  }
  return context;
}

// ============ 便捷Hook ============

export function useCurrentStep(): BuildStep {
  const { state } = useSceneBuilder();
  return state.currentStep;
}

export function useIsStepComplete(step: BuildStep): boolean {
  const { state } = useSceneBuilder();
  return state.completedSteps.has(step);
}

export function useCanProceed(): boolean {
  const { state } = useSceneBuilder();

  switch (state.currentStep) {
    case "template":
      return !!state.selectedTemplate;
    case "profile":
      return !!state.profile.name.trim();
    case "tags":
      return true; // 标签可以为空
    case "matching":
      return state.matching.selectedIds.size > 0;
    case "preview":
      return !!state.previewScene;
    default:
      return false;
  }
}

export default SceneBuilderProvider;
