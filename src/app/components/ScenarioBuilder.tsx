import { useState } from "react";
import { Scenario, Clause } from "../types";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Label } from "./ui/label";
import { Plus, Trash2, Save, Weight } from "lucide-react";
import { ClauseCard } from "./ClauseCard";

interface ScenarioBuilderProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialClauses?: Clause[];
  onSave: (scenario: Omit<Scenario, "id" | "createdAt" | "updatedAt">) => void;
}

export function ScenarioBuilder({
  open,
  onOpenChange,
  initialClauses = [],
  onSave,
}: ScenarioBuilderProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedClauses, setSelectedClauses] = useState<Clause[]>(initialClauses);

  const totalWeight = selectedClauses.reduce(
    (sum, clause) => sum + clause.weight,
    0
  );

  const handleRemoveClause = (clauseId: string) => {
    setSelectedClauses(selectedClauses.filter((c) => c.id !== clauseId));
  };

  const handleSave = () => {
    if (!name.trim()) {
      alert("请输入场景名称");
      return;
    }
    if (selectedClauses.length === 0) {
      alert("请至少添加一个条款");
      return;
    }

    onSave({
      name: name.trim(),
      description: description.trim(),
      clauses: selectedClauses,
      totalWeight,
    });

    // 重置表单
    setName("");
    setDescription("");
    setSelectedClauses([]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>创建自定义场景</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* 场景基本信息 */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>场景名称 *</Label>
              <Input
                placeholder="例如：互联网平台数据出境合规场景"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>场景描述</Label>
              <Textarea
                placeholder="描述此场景的适用范围和目的..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          {/* 总权重显示 */}
          <Card className="p-4 bg-blue-50 border-blue-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Weight className="size-5 text-blue-600" />
                <span className="text-blue-900">场景总权重</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-3xl font-bold text-blue-600">
                  {totalWeight}
                </span>
                <span className="text-sm text-blue-600">
                  ({selectedClauses.length} 条款)
                </span>
              </div>
            </div>
          </Card>

          {/* 已选择的条款 */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>已选择的条款</Label>
              {selectedClauses.length > 0 && (
                <Badge variant="secondary">
                  {selectedClauses.length} 条款
                </Badge>
              )}
            </div>

            {selectedClauses.length === 0 ? (
              <Card className="p-8 text-center border-dashed">
                <Plus className="size-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500">
                  暂无条款，请从条款列表中添加相关条款
                </p>
              </Card>
            ) : (
              <div className="space-y-3">
                {selectedClauses.map((clause) => (
                  <div key={clause.id} className="relative group">
                    <ClauseCard clause={clause} />
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleRemoveClause(clause.id)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 操作按钮 */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              取消
            </Button>
            <Button onClick={handleSave}>
              <Save className="size-4 mr-2" />
              保存场景
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
