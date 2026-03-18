import { Policy } from "../types";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Calendar, Building2, FileText } from "lucide-react";

interface PolicyCardProps {
  policy: Policy;
  onClick: () => void;
}

export function PolicyCard({ policy, onClick }: PolicyCardProps) {
  const getLevelColor = (level: string) => {
    switch (level) {
      case "法律":
        return "bg-red-100 text-red-700 border-red-300";
      case "行政法规":
        return "bg-orange-100 text-orange-700 border-orange-300";
      case "部门规章":
        return "bg-blue-100 text-blue-700 border-blue-300";
      case "国家标准":
        return "bg-green-100 text-green-700 border-green-300";
      case "行业标准":
        return "bg-purple-100 text-purple-700 border-purple-300";
      case "地方性法规":
        return "bg-yellow-100 text-yellow-700 border-yellow-300";
      default:
        return "bg-gray-100 text-gray-700 border-gray-300";
    }
  };

  return (
    <Card
      className="p-5 hover:shadow-lg transition-shadow cursor-pointer border border-gray-200"
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 mr-3">
          <h3 className="mb-1">{policy.title}</h3>
          <p className="text-xs text-gray-500">{policy.code}</p>
        </div>
        <Badge className={getLevelColor(policy.level)} variant="outline">
          {policy.level}
        </Badge>
      </div>

      <p className="text-gray-600 mb-4 line-clamp-2">{policy.description}</p>

      <div className="flex flex-wrap gap-2 mb-4">
        {policy.tags.map((tag) => (
          <Badge
            key={tag.id}
            className={`${tag.color} text-white`}
            variant="secondary"
          >
            {tag.name}
          </Badge>
        ))}
      </div>

      <div className="flex items-center gap-4 text-sm text-gray-500">
        <div className="flex items-center gap-1">
          <Building2 className="size-4" />
          <span className="truncate">{policy.publishOrg}</span>
        </div>
        <div className="flex items-center gap-1">
          <Calendar className="size-4" />
          <span>{policy.publishDate}</span>
        </div>
        <div className="flex items-center gap-1">
          <FileText className="size-4" />
          <span>{policy.clauseCount} 条款</span>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-gray-100">
        <div className="flex flex-wrap gap-2">
          {policy.industries.map((industry) => (
            <span
              key={industry}
              className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
            >
              {industry}
            </span>
          ))}
        </div>
      </div>
    </Card>
  );
}