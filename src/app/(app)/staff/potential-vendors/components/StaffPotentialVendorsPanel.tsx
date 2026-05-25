"use client";

import { useState } from "react";
import { Loader2, Pencil, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";

import { trpc } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

type SavedRow = {
  id: string;
  region: string;
  potentialVendorsText: string;
};

type DraftRow = {
  region: string;
  potentialVendorsText: string;
};

function emptyDraft(): DraftRow {
  return { region: "", potentialVendorsText: "" };
}

function namesFromText(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function RowEditor({
  draft,
  onChange,
  onSave,
  onCancel,
  isSaving,
  saveLabel,
}: {
  draft: DraftRow;
  onChange: (next: DraftRow) => void;
  onSave: () => void;
  onCancel?: () => void;
  isSaving: boolean;
  saveLabel: string;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-[minmax(140px,1fr)_minmax(0,2fr)_auto] gap-3 rounded-lg border border-gray-300 bg-white p-4">
      <div className="space-y-1">
        <Label>Region</Label>
        <Input
          placeholder="e.g. Charlotte"
          value={draft.region}
          onChange={(e) => onChange({ ...draft, region: e.target.value })}
        />
      </div>
      <div className="space-y-1">
        <Label>Potential vendors</Label>
        <Textarea
          placeholder="One name per line"
          rows={4}
          value={draft.potentialVendorsText}
          onChange={(e) => onChange({ ...draft, potentialVendorsText: e.target.value })}
        />
      </div>
      <div className="flex sm:flex-col items-center sm:items-end justify-end gap-2">
        <Button type="button" size="sm" disabled={isSaving} onClick={onSave}>
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : saveLabel}
        </Button>
        {onCancel ? (
          <Button type="button" size="sm" variant="ghost" onClick={onCancel} disabled={isSaving}>
            <X className="h-4 w-4" />
          </Button>
        ) : null}
      </div>
    </div>
  );
}

function SavedRowListItem({
  row,
  isEditing,
  isSaving,
  editDraft,
  onEditDraftChange,
  onEdit,
  onCancelEdit,
  onSaveEdit,
  onDelete,
}: {
  row: SavedRow;
  isEditing: boolean;
  isSaving: boolean;
  editDraft: DraftRow;
  onEditDraftChange: (next: DraftRow) => void;
  onEdit: () => void;
  onCancelEdit: () => void;
  onSaveEdit: () => void;
  onDelete: () => void;
}) {
  const names = namesFromText(row.potentialVendorsText);

  if (isEditing) {
    return (
      <li className="p-4 bg-gray-50">
        <RowEditor
          draft={editDraft}
          onChange={onEditDraftChange}
          onSave={onSaveEdit}
          onCancel={onCancelEdit}
          isSaving={isSaving}
          saveLabel="Save"
        />
      </li>
    );
  }

  return (
    <li className="p-4 hover:bg-gray-50/80">
      <div className="grid grid-cols-1 sm:grid-cols-[minmax(140px,1fr)_minmax(0,2fr)_auto] gap-3 sm:gap-4">
        <div>
          <p className="text-xs font-medium text-gray-500 sm:hidden">Region</p>
          <p className="font-semibold text-gray-900">{row.region}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-gray-500 sm:hidden">Potential vendors</p>
          {names.length === 0 ? (
            <p className="text-sm text-gray-400 italic">No names yet</p>
          ) : (
            <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
              {names.map((name) => (
                <li key={name}>{name}</li>
              ))}
            </ul>
          )}
        </div>
        <div className="flex items-start justify-end gap-1">
          <Button type="button" size="sm" variant="outline" onClick={onEdit}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="text-red-600 hover:text-red-700"
            onClick={onDelete}
            disabled={isSaving}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </li>
  );
}

export function StaffPotentialVendorsPanel() {
  const utils = trpc.useUtils();
  const { data: rows, isLoading, error } = trpc.admin.potentialVendors.list.useQuery();

  const [showAddForm, setShowAddForm] = useState(false);
  const [addDraft, setAddDraft] = useState<DraftRow>(emptyDraft);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<DraftRow>(emptyDraft);
  const [busyId, setBusyId] = useState<string | null>(null);

  const createMutation = trpc.admin.potentialVendors.create.useMutation({
    onSuccess: () => {
      toast.success("Row added");
      setShowAddForm(false);
      setAddDraft(emptyDraft());
      void utils.admin.potentialVendors.list.invalidate();
    },
    onError: (err) => toast.error(err.message || "Failed to create"),
  });

  const updateMutation = trpc.admin.potentialVendors.update.useMutation({
    onSuccess: () => {
      toast.success("Row saved");
      setEditingId(null);
      void utils.admin.potentialVendors.list.invalidate();
    },
    onError: (err) => toast.error(err.message || "Failed to save"),
  });

  const deleteMutation = trpc.admin.potentialVendors.delete.useMutation({
    onSuccess: () => {
      toast.success("Row removed");
      void utils.admin.potentialVendors.list.invalidate();
    },
    onError: (err) => toast.error(err.message || "Failed to delete"),
  });

  const savedRows: SavedRow[] = (rows ?? []).map((r) => ({
    id: r.id,
    region: r.region,
    potentialVendorsText: r.potentialVendorsText,
  }));

  const handleCreate = async () => {
    if (!addDraft.region.trim()) {
      toast.error("Region is required");
      return;
    }
    setBusyId("new");
    try {
      await createMutation.mutateAsync({
        region: addDraft.region.trim(),
        potentialVendorsText: addDraft.potentialVendorsText,
      });
    } finally {
      setBusyId(null);
    }
  };

  const handleUpdate = async (id: string) => {
    if (!editDraft.region.trim()) {
      toast.error("Region is required");
      return;
    }
    setBusyId(id);
    try {
      await updateMutation.mutateAsync({
        id,
        region: editDraft.region.trim(),
        potentialVendorsText: editDraft.potentialVendorsText,
      });
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (id: string) => {
    setBusyId(id);
    try {
      await deleteMutation.mutateAsync({ id });
      if (editingId === id) setEditingId(null);
    } finally {
      setBusyId(null);
    }
  };

  const startEdit = (row: SavedRow) => {
    setEditingId(row.id);
    setEditDraft({
      region: row.region,
      potentialVendorsText: row.potentialVendorsText,
    });
    setShowAddForm(false);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (error) {
    return <p className="text-sm text-red-600">Failed to load: {error.message}</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-gray-600">
          Saved rows appear as a list. Use Add a row to create a new region entry.
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            setShowAddForm(true);
            setEditingId(null);
            setAddDraft(emptyDraft());
          }}
          disabled={showAddForm}
        >
          <Plus className="h-4 w-4 mr-1" />
          Add a row
        </Button>
      </div>

      {savedRows.length > 0 ? (
        <div className="rounded-lg border border-gray-200 overflow-hidden">
          <div className="hidden sm:grid sm:grid-cols-[minmax(140px,1fr)_minmax(0,2fr)_auto] gap-4 px-4 py-2 bg-gray-100 text-xs font-medium text-gray-600 border-b border-gray-200">
            <span>Region</span>
            <span>Potential vendors</span>
            <span className="text-right">Actions</span>
          </div>
          <ul className="divide-y divide-gray-200">
            {savedRows.map((row) => (
              <SavedRowListItem
                key={row.id}
                row={row}
                isEditing={editingId === row.id}
                isSaving={busyId === row.id}
                editDraft={editDraft}
                onEditDraftChange={setEditDraft}
                onEdit={() => startEdit(row)}
                onCancelEdit={() => setEditingId(null)}
                onSaveEdit={() => void handleUpdate(row.id)}
                onDelete={() => void handleDelete(row.id)}
              />
            ))}
          </ul>
        </div>
      ) : (
        !showAddForm && (
          <p className="text-sm text-gray-500 rounded-lg border border-dashed border-gray-300 p-8 text-center">
            No rows yet. Click Add a row to create your first entry.
          </p>
        )
      )}

      {showAddForm ? (
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-900">New row</p>
          <RowEditor
            draft={addDraft}
            onChange={setAddDraft}
            onSave={() => void handleCreate()}
            onCancel={() => {
              setShowAddForm(false);
              setAddDraft(emptyDraft());
            }}
            isSaving={busyId === "new"}
            saveLabel="Add row"
          />
        </div>
      ) : null}
    </div>
  );
}
