"use client";

import React, { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { Pencil, Trash2, Plus } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const LABEL_COLORS = [
  "#1a73e8",
  "#ea4335",
  "#f9ab00",
  "#34a853",
  "#9334e6",
  "#e91e63",
  "#00bcd4",
  "#795548",
];

interface ManageLabelsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accountId: string;
}

export function ManageLabelsSheet({
  open,
  onOpenChange,
  accountId,
}: ManageLabelsSheetProps) {
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState<string>(LABEL_COLORS[0] ?? "#1a73e8");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editColor, setEditColor] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const utils = api.useUtils();
  const { data: labels, isLoading } = api.account.getLabels.useQuery(
    { accountId: accountId || "placeholder" },
    { enabled: open && !!accountId },
  );

  const createMutation = api.account.createLabel.useMutation({
    onMutate: async (variables) => {
      const pendingId = `pending-${Date.now()}`;
      const optimisticLabel = {
        id: pendingId,
        name: variables.name.trim(),
        color: variables.color ?? null,
        accountId: variables.accountId,
        createdAt: new Date(),
      };
      await utils.account.getLabels.cancel({ accountId });
      await utils.account.getLabelsWithCounts.cancel({ accountId });
      const prevLabels = utils.account.getLabels.getData({ accountId });
      const prevWithCounts = utils.account.getLabelsWithCounts.getData({ accountId });
      utils.account.getLabels.setData({ accountId }, (old) =>
        old ? [...old, optimisticLabel].sort((a, b) => a.name.localeCompare(b.name)) : [optimisticLabel]
      );
      utils.account.getLabelsWithCounts.setData({ accountId }, (old) =>
        old
          ? [...old, { ...optimisticLabel, threadCount: 0 }].sort((a, b) => a.name.localeCompare(b.name))
          : [{ ...optimisticLabel, threadCount: 0 }]
      );
      return { pendingId, prevLabels, prevWithCounts };
    },
    onSuccess: (data) => {
      const newLabel = {
        id: data.id,
        name: data.name,
        color: data.color,
        accountId: data.accountId,
        createdAt: data.createdAt,
      };
      utils.account.getLabels.setData({ accountId }, (old) =>
        old
          ? [...old.filter((l) => !String(l.id).startsWith("pending-")), newLabel].sort((a, b) =>
            a.name.localeCompare(b.name)
          )
          : [newLabel]
      );
      utils.account.getLabelsWithCounts.setData({ accountId }, (old) =>
        old
          ? [
            ...old.filter((l) => !String(l.id).startsWith("pending-")),
            { ...newLabel, threadCount: 0 },
          ].sort((a, b) => a.name.localeCompare(b.name))
          : [{ ...newLabel, threadCount: 0 }]
      );
      setNewName("");
      setNewColor(LABEL_COLORS[0] ?? "#1a73e8");
      toast.success("Label created");
    },
    onError: (e, _variables, context) => {
      if (context?.prevLabels !== undefined) {
        utils.account.getLabels.setData({ accountId }, () => context.prevLabels);
      }
      if (context?.prevWithCounts !== undefined) {
        utils.account.getLabelsWithCounts.setData({ accountId }, () => context.prevWithCounts);
      }
      toast.error(e.message ?? "Failed to create label");
    },
  });

  const updateMutation = api.account.updateLabel.useMutation({
    onSuccess: () => {
      void utils.account.getLabels.invalidate({ accountId });
      void utils.account.getLabelsWithCounts.invalidate({ accountId });
      setEditingId(null);
      toast.success("Label updated");
    },
    onError: (e) => toast.error(e.message ?? "Failed to update label"),
  });

  const deleteMutation = api.account.deleteLabel.useMutation({
    onSuccess: () => {
      void utils.account.getLabels.invalidate({ accountId });
      void utils.account.getLabelsWithCounts.invalidate({ accountId });
      void utils.account.getThreads.invalidate();
      setDeleteId(null);
      toast.success("Label deleted");
    },
    onError: (e) => toast.error(e.message ?? "Failed to delete label"),
  });

  const handleCreate = () => {
    const name = newName.trim();
    if (!name || !accountId) return;
    createMutation.mutate({ accountId, name, color: newColor });
  };

  const startEdit = (id: string, name: string, color: string | null) => {
    setEditingId(id);
    setEditName(name);
    setEditColor((color || LABEL_COLORS[0]) ?? "#1a73e8");
  };

  const saveEdit = () => {
    if (!editingId) return;
    updateMutation.mutate({
      id: editingId,
      name: editName.trim(),
      color: editColor,
    });
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="flex flex-col gap-0 overflow-hidden bg-white dark:bg-[#202124] sm:max-w-[400px]">
          <SheetHeader className="shrink-0 px-6 pt-6 pb-4 text-left">
            <SheetTitle className="text-lg font-semibold text-[#202124] dark:text-[#e8eaed]">
              Manage labels
            </SheetTitle>
          </SheetHeader>

          <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-6 pb-6">
            <section className="shrink-0 rounded-xl border border-[#e8eaed] bg-[#f8f9fa] p-4 dark:border-[#3c4043] dark:bg-[#292a2d]">
              <p className="mb-3 text-xs font-medium uppercase tracking-wider text-[#5f6368] dark:text-[#9aa0a6]">
                New label
              </p>
              <div className="flex flex-col gap-3">
                <Input
                  placeholder="Label name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="h-9 border-[#dadce0] bg-white dark:border-[#3c4043] dark:bg-[#202124] dark:text-[#e8eaed]"
                  onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                />
                <div className="flex items-center gap-3">
                  <span className="text-xs text-[#5f6368] dark:text-[#9aa0a6]">Color</span>
                  <div className="flex gap-2">
                    {LABEL_COLORS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        className={`h-7 w-7 rounded-full border-2 transition-all hover:scale-110 ${newColor === c
                          ? "border-[#202124] ring-2 ring-[#202124]/20 dark:border-[#e8eaed] dark:ring-[#e8eaed]/20"
                          : "border-transparent hover:border-[#5f6368] dark:hover:border-[#9aa0a6]"
                          }`}
                        style={{ backgroundColor: c }}
                        onClick={() => setNewColor(c)}
                        aria-label={`Color ${c}`}
                      />
                    ))}
                  </div>
                </div>
                <Button
                  onClick={handleCreate}
                  disabled={!newName.trim() || createMutation.isPending}
                  className="h-9 w-full bg-[#1a73e8] hover:bg-[#1765cc] dark:bg-[#8ab4f8] dark:text-[#202124] dark:hover:bg-[#aecbfa]"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add label
                </Button>
              </div>
            </section>

            <section className="flex min-h-0 flex-1 flex-col rounded-xl border border-[#e8eaed] bg-[#f8f9fa] p-4 dark:border-[#3c4043] dark:bg-[#292a2d]">
              <p className="mb-3 shrink-0 text-xs font-medium uppercase tracking-wider text-[#5f6368] dark:text-[#9aa0a6]">
                Your labels
              </p>
              {isLoading ? (
                <div className="flex flex-1 items-center justify-center py-8">
                  <p className="text-sm text-[#5f6368] dark:text-[#9aa0a6]">Loading...</p>
                </div>
              ) : (labels ?? []).length === 0 ? (
                <div className="flex flex-1 flex-col items-center justify-center gap-2 py-8 text-center">
                  <div className="rounded-full bg-[#e8eaed] p-3 dark:bg-[#3c4043]">
                    <Pencil className="h-5 w-5 text-[#5f6368] dark:text-[#9aa0a6]" />
                  </div>
                  <p className="text-sm font-medium text-[#202124] dark:text-[#e8eaed]">No labels yet</p>
                  <p className="max-w-[220px] text-xs text-[#5f6368] dark:text-[#9aa0a6]">
                    Create one above to organize threads and use filter rules.
                  </p>
                </div>
              ) : (
                <ul className="flex flex-col gap-2 overflow-y-auto pr-1">
                  {(labels ?? []).map((label) => (
                    <li
                      key={label.id}
                      className="flex items-center justify-between gap-3 rounded-lg border border-[#e8eaed] bg-white px-3 py-2.5 dark:border-[#3c4043] dark:bg-[#202124]"
                    >
                      {editingId === label.id ? (
                        <>
                          <Input
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="h-8 flex-1 border-[#dadce0] dark:border-[#3c4043] dark:bg-[#292a2d] dark:text-[#e8eaed]"
                            autoFocus
                          />
                          <div className="flex gap-1.5">
                            {LABEL_COLORS.slice(0, 4).map((c) => (
                              <button
                                key={c}
                                type="button"
                                className={`h-6 w-6 rounded-full border-2 ${editColor === c ? "border-[#202124] dark:border-[#e8eaed]" : "border-transparent"}`}
                                style={{ backgroundColor: c }}
                                onClick={() => setEditColor(c)}
                              />
                            ))}
                          </div>
                          <Button size="sm" variant="ghost" className="h-8" onClick={saveEdit} disabled={updateMutation.isPending}>
                            Save
                          </Button>
                          <Button size="sm" variant="ghost" className="h-8" onClick={() => setEditingId(null)}>
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <>
                          <span
                            className="min-w-0 flex-1 truncate rounded-md px-2.5 py-1 text-sm font-medium"
                            style={
                              label.color
                                ? { backgroundColor: `${label.color}20`, color: label.color }
                                : { backgroundColor: "#e8f0fe", color: "#1967d2" }
                            }
                          >
                            {label.name}
                          </span>
                          <div className="flex shrink-0 gap-0.5">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-[#5f6368] hover:bg-[#f1f3f4] dark:text-[#9aa0a6] dark:hover:bg-[#3c4043]"
                              onClick={() => startEdit(label.id, label.name, label.color)}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-[#d93025] hover:bg-[#fce8e6] dark:text-[#f28b82] dark:hover:bg-[#5f2120]"
                              onClick={() => setDeleteId(label.id)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </SheetContent>
      </Sheet>

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogTitle>Delete label?</AlertDialogTitle>
          <AlertDialogDescription>
            This will remove the label from all threads and delete any filter rules that use it.
          </AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-[#d93025] hover:bg-[#b3261e] dark:bg-[#f28b82] dark:hover:bg-[#c5221f]"
              onClick={() => deleteId && deleteMutation.mutate({ id: deleteId })}
              disabled={deleteMutation.isPending}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
