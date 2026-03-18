// ============ 虚拟滚动表格组件 ============
// COUBrowser 中使用，支持万级数据流畅滚动
// 新增：首行置顶、列宽拖拽

import React, { useRef, useEffect, useState, useCallback } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

// 列定义
export interface Column<T> {
  key: string;
  title: string;
  width?: number;
  minWidth?: number;
  render?: (record: T, index: number) => React.ReactNode;
  sorter?: (a: T, b: T) => number;
  filterable?: boolean;
}

interface VirtualTableProps<T> {
  data: T[];
  columns: Column<T>[];
  rowHeight?: number;
  headerHeight?: number;
  overscan?: number;
  selectedIds?: Set<string>;
  onSelect?: (id: string, selected: boolean) => void;
  onSelectAll?: (selected: boolean) => void;
  rowKey: (record: T) => string;
  onRowClick?: (record: T) => void;
  expandedRowRender?: (record: T) => React.ReactNode;
  sortConfig?: { key: string; order: "asc" | "desc" } | null;
  onSort?: (key: string) => void;
  className?: string;
}

// 可调整宽度的表头单元格
interface ResizableHeaderProps {
  children: React.ReactNode;
  width: number;
  minWidth?: number;
  onResize: (newWidth: number) => void;
  className?: string;
  onClick?: () => void;
}

function ResizableHeader({
  children,
  width,
  minWidth = 60,
  onResize,
  className = "",
  onClick,
}: ResizableHeaderProps) {
  const isResizingRef = useRef(false);
  const startXRef = useRef(0);
  const startWidthRef = useRef(width);
  const [isResizing, setIsResizing] = useState(false);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      isResizingRef.current = true;
      setIsResizing(true);
      startXRef.current = e.clientX;
      startWidthRef.current = width;

      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";

      const handleMouseMove = (moveEvent: MouseEvent) => {
        if (!isResizingRef.current) return;
        moveEvent.preventDefault();
        moveEvent.stopPropagation();

        const diff = moveEvent.clientX - startXRef.current;
        const newWidth = Math.max(minWidth, startWidthRef.current + diff);
        onResize(newWidth);
      };

      const handleMouseUp = (upEvent: MouseEvent) => {
        upEvent.preventDefault();
        isResizingRef.current = false;
        setIsResizing(false);
        document.removeEventListener("mousemove", handleMouseMove, { capture: true });
        document.removeEventListener("mouseup", handleMouseUp, { capture: true });
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      };

      document.addEventListener("mousemove", handleMouseMove, { capture: true });
      document.addEventListener("mouseup", handleMouseUp, { capture: true });
    },
    [width, minWidth, onResize]
  );

  return (
    <div
      className={`relative flex items-center px-3 text-xs font-medium text-slate-600 border-r border-slate-200 last:border-r-0 select-none ${className}`}
      style={{ width, minWidth: width }}
      onClick={onClick}
    >
      <div className="flex items-center h-full overflow-hidden flex-1">{children}</div>
      {/* 拖拽手柄 */}
      <div
        className={`absolute right-0 top-0 bottom-0 w-5 cursor-col-resize flex items-center justify-center select-none z-10 ${
          isResizing ? "bg-blue-300/50" : "bg-slate-200/0 hover:bg-slate-300/50"
        }`}
        onMouseDown={handleMouseDown}
        title="拖动调整列宽"
      >
        <div className={`w-px h-4 ${isResizing ? "bg-blue-600" : "bg-slate-400/50"}`} />
      </div>
    </div>
  );
}

export function VirtualTable<T extends Record<string, unknown>>({
  data,
  columns: initialColumns,
  rowHeight = 48,
  headerHeight = 40,
  overscan = 5,
  selectedIds = new Set(),
  onSelect,
  onSelectAll,
  rowKey,
  onRowClick,
  expandedRowRender,
  sortConfig,
  onSort,
  className = "",
}: VirtualTableProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  // 列宽状态
  const [columns, setColumns] = useState(initialColumns);

  // 同步外部columns变化
  useEffect(() => {
    setColumns(initialColumns);
  }, [initialColumns]);

  // 计算可见范围
  const startIndex = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan);
  const visibleCount = Math.ceil(containerHeight / rowHeight) + 2 * overscan;
  const endIndex = Math.min(data.length, startIndex + visibleCount);
  const visibleData = data.slice(startIndex, endIndex);

  // 总高度
  const totalHeight = data.length * rowHeight;
  const offsetY = startIndex * rowHeight;

  // 监听容器高度变化
  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerHeight(entry.contentRect.height);
      }
    });

    resizeObserver.observe(containerRef.current);
    setContainerHeight(containerRef.current.clientHeight);

    return () => resizeObserver.disconnect();
  }, []);

  // 处理滚动
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  // 处理行展开
  const handleExpand = (id: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // 处理列宽调整
  const handleColumnResize = useCallback((key: string, newWidth: number) => {
    setColumns((prev) =>
      prev.map((col) => (col.key === key ? { ...col, width: newWidth } : col))
    );
  }, []);

  const hasExpandColumn = !!expandedRowRender;

  return (
    <div className={`border border-slate-200 rounded-xl overflow-hidden bg-white ${className}`}>
      {/* 表头 - sticky置顶 */}
      <div
        className="flex border-b border-slate-200 bg-slate-50 sticky top-0 z-20"
        style={{ height: headerHeight }}
      >
        {/* 选择列 */}
        {onSelect && (
          <div
            className="flex items-center justify-center border-r border-slate-200 z-20 bg-slate-50"
            style={{ width: 40, minWidth: 40 }}
          >
            <input
              type="checkbox"
              checked={selectedIds.size > 0 && selectedIds.size === data.length}
              onChange={(e) => onSelectAll?.(e.target.checked)}
              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
          </div>
        )}

        {/* 展开列 */}
        {hasExpandColumn && (
          <div
            className="flex items-center justify-center border-r border-slate-200 z-20 bg-slate-50"
            style={{ width: 40, minWidth: 40 }}
          />
        )}

        {/* 数据列 - 可拖拽调整宽度 */}
        {columns.map((col) => (
          <ResizableHeader
            key={col.key}
            width={col.width || 150}
            minWidth={col.minWidth || 60}
            onResize={(newWidth) => handleColumnResize(col.key, newWidth)}
            className={col.sorter ? "cursor-pointer hover:bg-slate-100" : ""}
            onClick={() => col.sorter && onSort?.(col.key)}
          >
            <span className="truncate">{col.title}</span>
            {col.sorter && sortConfig?.key === col.key && (
              <span className="ml-1 flex-shrink-0">
                {sortConfig.order === "asc" ? (
                  <ChevronUp className="w-3 h-3" />
                ) : (
                  <ChevronDown className="w-3 h-3" />
                )}
              </span>
            )}
          </ResizableHeader>
        ))}
      </div>

      {/* 表格内容 */}
      <div
        ref={containerRef}
        className="overflow-auto"
        style={{ height: `calc(100% - ${headerHeight}px)` }}
        onScroll={handleScroll}
      >
        <div style={{ height: totalHeight, position: "relative" }}>
          <div style={{ transform: `translateY(${offsetY}px)` }}>
            {visibleData.map((record, index) => {
              const actualIndex = startIndex + index;
              const id = rowKey(record);
              const isSelected = selectedIds.has(id);
              const isExpanded = expandedRows.has(id);

              return (
                <div key={id}>
                  <div
                    className={`flex border-b border-slate-100 hover:bg-slate-50 transition-colors ${
                      isSelected ? "bg-blue-50" : ""
                    }`}
                    style={{ height: rowHeight }}
                    onClick={() => onRowClick?.(record)}
                  >
                    {/* 选择列 */}
                    {onSelect && (
                      <div
                        className="flex items-center justify-center border-r border-slate-100"
                        style={{ width: 40, minWidth: 40 }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => onSelect?.(id, e.target.checked)}
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                      </div>
                    )}

                    {/* 展开列 */}
                    {hasExpandColumn && (
                      <div
                        className="flex items-center justify-center border-r border-slate-100"
                        style={{ width: 40, minWidth: 40 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleExpand(id);
                        }}
                      >
                        {expandedRowRender && (
                          <button className="p-1 hover:bg-slate-200 rounded">
                            {isExpanded ? (
                              <ChevronDown className="w-4 h-4 text-slate-400" />
                            ) : (
                              <ChevronUp className="w-4 h-4 text-slate-400" />
                            )}
                          </button>
                        )}
                      </div>
                    )}

                    {/* 数据列 */}
                    {columns.map((col) => (
                      <div
                        key={col.key}
                        className="flex items-center px-3 text-sm text-slate-700 border-r border-slate-100 last:border-r-0 overflow-hidden"
                        style={{
                          width: col.width || 150,
                          minWidth: col.minWidth || col.width || 150,
                        }}
                      >
                        {col.render ? (
                          col.render(record, actualIndex)
                        ) : (
                          <span className="truncate">{(record[col.key] as string) || "-"}</span>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* 展开内容 */}
                  {isExpanded && expandedRowRender && (
                    <div className="bg-slate-50 border-b border-slate-100 p-4">
                      {expandedRowRender(record)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default VirtualTable;
