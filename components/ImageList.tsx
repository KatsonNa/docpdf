"use client";

import { DndContext, closestCenter, PointerSensor, KeyboardSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, X, AlertCircle, CheckCircle2 } from "lucide-react";
import { formatBytes } from "@/lib/utils";
import type { ImageFile } from "@/lib/pdf";

function SortableCard({ item, index, onRemove }: { item: ImageFile; index: number; onRemove: (id: string) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });

  return (
    <div ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 }}>
      <div className="flex items-center gap-3 w-full rounded-xl p-3"
        style={{ background: "var(--surface)", border: `1px solid ${item.error ? "var(--danger)" : "var(--border)"}`, boxShadow: "var(--shadow-sm)" }}>
        <button className="cursor-grab active:cursor-grabbing touch-none p-1 rounded flex-shrink-0"
          style={{ color: "var(--text-3)" }} aria-label="Drag to reorder" {...attributes} {...listeners}>
          <GripVertical size={18} />
        </button>
        <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0"
          style={{ background: item.error ? "var(--danger-dim)" : "var(--accent-dim)", color: item.error ? "var(--danger)" : "var(--accent-text)" }}>
          {index + 1}
        </span>
        {item.url ? (
          <img src={item.url} alt={item.name} className="w-12 h-12 object-cover rounded-lg flex-shrink-0"
            style={{ border: "1px solid var(--border)" }} />
        ) : (
          <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "var(--bg-2)" }}>
            <AlertCircle size={20} style={{ color: "var(--danger)" }} />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate" style={{ color: "var(--text-1)" }}>{item.name}</p>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-3)" }}>
            {formatBytes(item.sizeBytes)}{item.width ? ` · ${item.width}×${item.height} px` : ""}
          </p>
          <div className="flex items-center gap-1 mt-1">
            {item.error ? <AlertCircle size={12} style={{ color: "var(--danger)" }} /> : <CheckCircle2 size={12} style={{ color: "var(--success)" }} />}
            <span className="text-xs" style={{ color: item.error ? "var(--danger)" : "var(--success)" }}>{item.error ?? "Ready"}</span>
          </div>
        </div>
        <button onClick={() => onRemove(item.id)} className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ color: "var(--text-3)" }}
          onMouseEnter={e => { e.currentTarget.style.background = "var(--danger-dim)"; e.currentTarget.style.color = "var(--danger)"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-3)"; }}
          aria-label={`Remove ${item.name}`}>
          <X size={15} />
        </button>
      </div>
    </div>
  );
}

export function ImageList({ files, onRemove, onReorder }: { files: ImageFile[]; onRemove: (id: string) => void; onReorder: (activeId: string, overId: string) => void }) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) onReorder(String(active.id), String(over.id));
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={files.map((f) => f.id)} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-2">
          {files.map((item, i) => <SortableCard key={item.id} item={item} index={i} onRemove={onRemove} />)}
        </div>
      </SortableContext>
    </DndContext>
  );
}