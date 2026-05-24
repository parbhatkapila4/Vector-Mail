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
  "#1e2a4a",
  "#b91c4b",
  "#d4a55b",
  "#15803d",
  "#7c3aed",
  "#db2777",
  "#0891b2",
  "#92400e",
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
  const [newColor, setNewColor] = useState<string>(LABEL_COLORS[0] ?? "#1e2a4a");
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
      setNewColor(LABEL_COLORS[0] ?? "#1e2a4a");
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
    setEditColor((color || LABEL_COLORS[0]) ?? "#1e2a4a");
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
        <SheetContent className="flex flex-col gap-0 overflow-hidden bg-white p-0 dark:bg-[#202124] sm:max-w-[420px]">
          <SheetHeader className="shrink-0 border-b border-[#eef0f4] px-6 py-5 text-left dark:border-[#3c4043]">
            <SheetTitle className="text-[18px] font-semibold tracking-tight text-[#0e1729] dark:text-[#e8eaed]">
              Manage labels
            </SheetTitle>
            <p className="mt-1 text-[12.5px] leading-relaxed text-[#7a849a]">
              Organize threads with custom labels. Use them in filter rules to
              auto-tag incoming mail.
            </p>
          </SheetHeader>

          <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-5 py-5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:px-6">
            <section className="shrink-0">
              <h3 className="mb-3 text-[13px] font-semibold tracking-tight text-[#0e1729] dark:text-[#e8eaed]">
                New label
              </h3>
              <div className="flex flex-col gap-3">
                <Input
                  placeholder="Label name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="h-9 border-[#e4e7ed] bg-white text-[13px] text-[#0e1729] placeholder:text-[#a8b0c0] focus-visible:border-[#1e2a4a]/40 focus-visible:ring-2 focus-visible:ring-[#1e2a4a]/15 dark:border-[#3c4043] dark:bg-[#202124] dark:text-[#e8eaed]"
                  onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                />
                <div className="flex flex-col gap-2">
                  <span className="text-[11px] font-medium text-[#7a849a]">
                    Color
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {LABEL_COLORS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        className="h-6 w-6 shrink-0 rounded-full transition-all hover:scale-110"
                        style={{
                          backgroundColor: c,
                          ...(newColor === c
                            ? { boxShadow: `0 0 0 2px white, 0 0 0 4px ${c}` }
                            : {}),
                        }}
                        onClick={() => setNewColor(c)}
                        aria-label={`Color ${c}`}
                      />
                    ))}
                  </div>
                </div>
                <Button
                  onClick={handleCreate}
                  disabled={!newName.trim() || createMutation.isPending}
                  className="h-9 w-full rounded-lg bg-[#1e2a4a] text-[13px] font-semibold text-white shadow-sm transition-colors hover:bg-[#0d1530] disabled:opacity-60 dark:bg-[#1e2a4a] dark:text-white dark:hover:bg-[#0d1530]"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  {createMutation.isPending ? "Creating…" : "Add label"}
                </Button>
              </div>
            </section>

            <section className="flex min-h-0 flex-1 flex-col border-t border-[#eef0f4] pt-5 dark:border-[#3c4043]">
              <div className="mb-3 flex shrink-0 items-center justify-between">
                <h3 className="text-[13px] font-semibold tracking-tight text-[#0e1729] dark:text-[#e8eaed]">
                  Your labels
                </h3>
                {(labels ?? []).length > 0 && (
                  <span className="rounded-full bg-[#f1f3f4] px-2 py-0.5 text-[11px] font-semibold text-[#5f6368] dark:bg-[#3c4043] dark:text-[#9aa0a6]">
                    {(labels ?? []).length}
                  </span>
                )}
              </div>
              {isLoading ? (
                <div className="flex flex-1 items-center justify-center py-10">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#e4e7ed] border-t-[#1e2a4a]" />
                </div>
              ) : (labels ?? []).length === 0 ? (
                <div className="flex flex-1 flex-col items-center justify-center gap-3 py-10 text-center">
                  <div className="rounded-full bg-[#1e2a4a]/8 p-3">
                    <Pencil className="h-5 w-5 text-[#1e2a4a]" />
                  </div>
                  <p className="text-[13.5px] font-semibold text-[#0e1729]">
                    No labels yet
                  </p>
                  <p className="max-w-[240px] text-[12px] leading-relaxed text-[#7a849a]">
                    Create one above to organize threads and power your filter
                    rules.
                  </p>
                </div>
              ) : (
                <ul className="flex flex-col gap-2 overflow-y-auto pr-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  {(labels ?? []).map((label) => (
                    <li
                      key={label.id}
                      className="flex items-center justify-between gap-2 rounded-lg border border-[#e4e7ed] bg-white px-3 py-2.5 transition-colors hover:border-[#d0d5de] hover:shadow-[0_1px_2px_rgba(15,20,40,0.04)] dark:border-[#3c4043] dark:bg-[#202124]"
                    >
                      {editingId === label.id ? (
                        <>
                          <Input
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="h-8 flex-1 border-[#e4e7ed] text-[13px] focus-visible:border-[#1e2a4a]/40 focus-visible:ring-2 focus-visible:ring-[#1e2a4a]/15 dark:border-[#3c4043] dark:bg-[#292a2d] dark:text-[#e8eaed]"
                            autoFocus
                          />
                          <div className="flex flex-wrap gap-1.5">
                            {LABEL_COLORS.map((c) => (
                              <button
                                key={c}
                                type="button"
                                className="h-5 w-5 shrink-0 rounded-full transition-all hover:scale-110"
                                style={{
                                  backgroundColor: c,
                                  ...(editColor === c
                                    ? {
                                      boxShadow: `0 0 0 2px white, 0 0 0 4px ${c}`,
                                    }
                                    : {}),
                                }}
                                onClick={() => setEditColor(c)}
                              />
                            ))}
                          </div>
                          <Button
                            size="sm"
                            className="h-8 bg-[#1e2a4a] px-3 text-[12px] font-semibold text-white hover:bg-[#0d1530]"
                            onClick={saveEdit}
                            disabled={updateMutation.isPending}
                          >
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 text-[12px] text-[#4a5572] hover:bg-[#f4f5f8]"
                            onClick={() => setEditingId(null)}
                          >
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <>
                          <span
                            className="min-w-0 flex-1 truncate rounded-md px-2.5 py-1 text-[12.5px] font-semibold"
                            style={
                              label.color
                                ? {
                                  backgroundColor: `${label.color}1a`,
                                  color: label.color,
                                }
                                : {
                                  backgroundColor: "rgba(30,42,74,0.08)",
                                  color: "#1e2a4a",
                                }
                            }
                          >
                            {label.name}
                          </span>
                          <div className="flex shrink-0 gap-0.5">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-[#7a849a] hover:bg-[#f4f5f8] hover:text-[#1e2a4a] dark:text-[#9aa0a6] dark:hover:bg-[#3c4043]"
                              onClick={() =>
                                startEdit(label.id, label.name, label.color)
                              }
                              title="Rename"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-[#7a849a] hover:bg-[#fef2f2] hover:text-[#b91c1c] dark:text-[#9aa0a6] dark:hover:bg-[#5f2120]"
                              onClick={() => setDeleteId(label.id)}
                              title="Delete"
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
        <AlertDialogContent className="border-[#e4e7ed] bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#0e1729]">Delete label?</AlertDialogTitle>
            <AlertDialogDescription className="text-[#4a5572]">
              This will remove the label from all threads and delete any filter rules that use it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-[#e4e7ed] text-[#4a5572] hover:bg-[#f4f5f8]">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-[#b91c1c] text-white hover:bg-[#991b1b]"
              onClick={() => deleteId && deleteMutation.mutate({ id: deleteId })}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
