import { useState, useMemo, useEffect } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { ScrollArea } from "./ui/scroll-area";
import { Input } from "./ui/input";
import { UnifiedSceneBuilder } from "./scene/UnifiedSceneBuilder";
import {
  Sparkles,
  Plus,
  Eye,
  Edit,
  Trash2,
  TrendingUp,
  Target,
  Calendar,
  BarChart3,
  Search,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { MOCK_SCENARIOS, SCENE_TEMPLATES } from "../data/mockData";
import { CustomScene } from "../types";
import { SceneAnalysis } from "./SceneAnalysis";

interface SceneManagerProps {
  searchKeyword?: string;
}

export function SceneManager({ searchKeyword = "" }: SceneManagerProps) {
  const [showBuilder, setShowBuilder] = useState(false);
  const [selectedScene, setSelectedScene] = useState<CustomScene | null>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [scenes, setScenes] = useState<CustomScene[]>(MOCK_SCENARIOS as CustomScene[]);
  const [editingScene, setEditingScene] = useState<CustomScene | null>(null);
  const [localSearchKeyword, setLocalSearchKeyword] = useState(searchKeyword);

  // 同步外部搜索关键词
  useEffect(() => {
    setLocalSearchKeyword(searchKeyword);
  }, [searchKeyword]);

  // 过滤场景
  const filteredScenes = useMemo(() => {
    if (!localSearchKeyword) return scenes;
    const keyword = localSearchKeyword.toLowerCase();
    return scenes.filter((scene) =>
      scene.name.toLowerCase().includes(keyword) ||
      scene.description?.toLowerCase().includes(keyword) ||
      scene.industry?.toLowerCase().includes(keyword)
    );
  }, [scenes, localSearchKeyword]);

  const handleSaveScene = (scene: CustomScene) => {
    // 如果场景已存在则更新，否则添加
    const existingIndex = scenes.findIndex((s) => s.id === scene.id);
    if (existingIndex >= 0) {
      const updatedScenes = [...scenes];
      updatedScenes[existingIndex] = {
        ...scene,
        updatedAt: new Date().toISOString().split("T")[0],
      };
      setScenes(updatedScenes);
      toast.success("场景更新成功");
    } else {
      setScenes([...scenes, scene]);
      toast.success("场景创建成功");
    }
    setShowBuilder(false);
    setEditingScene(null);
  };

  const handleViewAnalysis = (scene: CustomScene) => {
    setSelectedScene(scene);
    setShowAnalysis(true);
  };

  const handleDeleteScene = (sceneId: string) => {
    setScenes(scenes.filter((s) => s.id !== sceneId));
    toast.success("场景已删除");
  };

  const handleEditScene = (scene: CustomScene) => {
    setEditingScene(scene);
    setShowBuilder(true);
  };

  return (
    <div className="h-full flex flex-col">
      {/* 顶部工具栏 */}
      <div className="bg-white/60 backdrop-blur-xl border-b border-slate-200/50 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="mb-1">场景管理</h2>
            <p className="text-sm text-gray-600">
              管理您的合规场景，智能组合COU
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* 本地搜索 */}
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
              <Input
                placeholder="搜索场景..."
                value={localSearchKeyword}
                onChange={(e) => setLocalSearchKeyword(e.target.value)}
                className="pl-9 pr-8 bg-slate-50/50"
              />
              {localSearchKeyword && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 -translate-y-1/2 size-6 p-0"
                  onClick={() => setLocalSearchKeyword("")}
                >
                  <X className="size-3" />
                </Button>
              )}
            </div>
            <Button
              className="gap-2 bg-gradient-to-r from-blue-600 to-cyan-600"
              onClick={() => setShowBuilder(true)}
            >
              <Plus className="size-4" />
              创建场景
            </Button>
          </div>
        </div>
      </div>

      {/* 场景列表 */}
      <ScrollArea className="flex-1">
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredScenes.map((scene) => (
              <Card key={scene.id} className="p-6 bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3">
                    <div className="size-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                      <Sparkles className="size-6 text-white" />
                    </div>
                    <div>
                      <h3 className="mb-1">{scene.name}</h3>
                      <p className="text-sm text-gray-600">{scene.description}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl mb-1">{scene.totalCOUs}</div>
                    <div className="text-xs text-gray-600">总COU数</div>
                  </div>
                  <div className="text-center p-3 bg-orange-50 rounded-lg">
                    <div className="text-2xl mb-1">{scene.highPriorityCOUs}</div>
                    <div className="text-xs text-gray-600">高优先级</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl mb-1">{scene.complianceScore}</div>
                    <div className="text-xs text-gray-600">合规分数</div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="size-4" />
                    创建于 {scene.createdAt}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1"
                      onClick={() => handleViewAnalysis(scene)}
                    >
                      <BarChart3 className="size-4" />
                      分析
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleEditScene(scene)}>
                      <Edit className="size-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600"
                      onClick={() => handleDeleteScene(scene.id)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}

            {filteredScenes.length === 0 && (
              <Card className="col-span-full p-12 text-center border-dashed border-2 bg-white/60">
                <Sparkles className="size-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">
                  {localSearchKeyword ? "未找到匹配的场景" : "暂无合规场景"}
                </p>
                <Button
                  className="bg-blue-600"
                  onClick={() => setShowBuilder(true)}
                >
                  <Plus className="size-4 mr-2" />
                  创建第一个场景
                </Button>
              </Card>
            )}
          </div>
        </div>
      </ScrollArea>

      {/* 场景构建器 */}
      <UnifiedSceneBuilder
        open={showBuilder}
        onOpenChange={(open) => {
          setShowBuilder(open);
          if (!open) setEditingScene(null);
        }}
        mode="user"
        initialScene={editingScene || undefined}
        availableTemplates={SCENE_TEMPLATES}
        onSave={handleSaveScene}
      />

      {/* 场景分析 */}
      {selectedScene && (
        <SceneAnalysis
          scene={selectedScene}
          open={showAnalysis}
          onOpenChange={setShowAnalysis}
        />
      )}
    </div>
  );
}
