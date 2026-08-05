"use client";

import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ChevronDown, ChevronUp, GripVertical, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { SECTION_LABELS, type StorefrontSection } from "@/types/template-sections";
import { SectionSettingsEditor } from "./SectionSettingsEditor";

interface SectionListProps {
  sections: StorefrontSection[];
  expandedId: string | null;
  onToggleExpanded: (id: string) => void;
  onChange: (sections: StorefrontSection[]) => void;
}

function SortableSection({
  section,
  expanded,
  onToggleExpanded,
  onUpdate,
  onRemove,
}: {
  section: StorefrontSection;
  expanded: boolean;
  onToggleExpanded: () => void;
  onUpdate: (next: StorefrontSection) => void;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: section.id,
  });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.6 : 1,
      }}
      className="rounded-lg border border-gray-200 bg-white"
    >
      <div className="flex items-center gap-2 p-3">
        <button
          type="button"
          className="cursor-grab text-gray-400 hover:text-gray-600"
          aria-label={`Reorder ${SECTION_LABELS[section.type]}`}
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4" />
        </button>

        <span className="flex-1 text-sm font-medium text-gray-900">
          {SECTION_LABELS[section.type]}
        </span>

        <Switch
          checked={section.enabled}
          onCheckedChange={(checked) => onUpdate({ ...section, enabled: checked })}
          aria-label={`Show ${SECTION_LABELS[section.type]}`}
        />

        <Button type="button" variant="ghost" size="icon" onClick={onToggleExpanded}>
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onRemove}
          aria-label={`Remove ${SECTION_LABELS[section.type]}`}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {expanded && (
        <div className="border-t border-gray-100 p-3">
          <SectionSettingsEditor
            section={section}
            onChange={(settings) => onUpdate({ ...section, settings })}
          />
        </div>
      )}
    </div>
  );
}

/** Drag-and-drop ordered list of storefront sections. */
export function SectionList({
  sections,
  expandedId,
  onToggleExpanded,
  onChange,
}: SectionListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = sections.findIndex((section) => section.id === active.id);
    const newIndex = sections.findIndex((section) => section.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    onChange(
      arrayMove(sections, oldIndex, newIndex).map((section, index) => ({
        ...section,
        order: index,
      })),
    );
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      modifiers={[restrictToVerticalAxis]}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={sections.map((section) => section.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-2">
          {sections.map((section) => (
            <SortableSection
              key={section.id}
              section={section}
              expanded={expandedId === section.id}
              onToggleExpanded={() => onToggleExpanded(section.id)}
              onUpdate={(next) =>
                onChange(sections.map((item) => (item.id === next.id ? next : item)))
              }
              onRemove={() =>
                onChange(
                  sections
                    .filter((item) => item.id !== section.id)
                    .map((item, index) => ({ ...item, order: index })),
                )
              }
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
