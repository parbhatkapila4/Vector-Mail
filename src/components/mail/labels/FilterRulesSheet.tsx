"use client";

import React, { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

interface FilterRulesSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accountId: string;
}

export function FilterRulesSheet({
  open,
  onOpenChange,
  accountId,
}: FilterRulesSheetProps) {
  const [tagValue, setTagValue] = useState("");
  const [labelId, setLabelId] = useState<string>("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const utils = api.useUtils();
  const { data: labels } = api.account.getLabels.useQuery(
    { accountId: accountId || "placeholder" },
    { enabled: open && !!accountId },
  );
  const { data: tags } = api.account.getDistinctEmailTags.useQuery(
    { accountId: accountId || "placeholder" },
    { enabled: open && !!accountId },
  );
  const { data: rules, isLoading } = api.account.getFilterRules.useQuery(
    { accountId: accountId || "placeholder" },
    { enabled: open && !!accountId },
  );

  const createMutation = api.account.createFilterRule.useMutation({
    onSuccess: () => {
      void utils.account.getFilterRules.invalidate({ accountId });
      setTagValue("");
      setLabelId("");
      toast.success("Filter rule created");
    },
    onError: (e) => toast.error(e.message ?? "Failed to create rule"),
  });

  const deleteMutation = api.account.deleteFilterRule.useMutation({
    onSuccess: () => {
      void utils.account.getFilterRules.invalidate({ accountId });
      setDeleteId(null);
      toast.success("Rule deleted");
    },
    onError: (e) => toast.error(e.message ?? "Failed to delete rule"),
  });

  const handleCreate = () => {
    const value = tagValue.trim();
    if (!value || !labelId || !accountId) {
      toast.error("Select a tag and a label");
      return;
    }
    createMutation.mutate({
      accountId,
      conditionType: "TAG_MATCH",
      conditionValue: value,
      labelId,
    });
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="flex flex-col gap-0 overflow-hidden bg-white dark:bg-[#202124] sm:max-w-[400px]">
          <SheetHeader className="shrink-0 px-6 pt-6 pb-2 text-left">
            <SheetTitle className="text-lg font-semibold text-[#202124] dark:text-[#e8eaed]">
              Filter rules
            </SheetTitle>
            <p className="mt-2 text-sm leading-snug text-[#5f6368] dark:text-[#9aa0a6]">
              When an email has an AI tag that matches the selected tag, the label is applied to the thread automatically.
            </p>
          </SheetHeader>

          <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-6 pb-6 pt-4">
            <section className="shrink-0 rounded-xl border border-[#e8eaed] bg-[#f8f9fa] p-4 dark:border-[#3c4043] dark:bg-[#292a2d]">
              <p className="mb-4 text-xs font-medium uppercase tracking-wider text-[#5f6368] dark:text-[#9aa0a6]">
                Add rule
              </p>
              <div className="flex flex-col gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#202124] dark:text-[#e8eaed]">
                    When email has tag
                  </label>
                  <Select value={tagValue} onValueChange={setTagValue}>
                    <SelectTrigger className="h-9 border-[#dadce0] bg-white dark:border-[#3c4043] dark:bg-[#202124] dark:text-[#e8eaed]">
                      <SelectValue placeholder="Select tag" />
                    </SelectTrigger>
                    <SelectContent>
                      {(tags ?? []).map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                      {(!tags || tags.length === 0) && (
                        <SelectItem value="__none" disabled>
                          No tags yet (analyze emails first)
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#202124] dark:text-[#e8eaed]">
                    Apply label
                  </label>
                  <Select value={labelId} onValueChange={setLabelId}>
                    <SelectTrigger className="h-9 border-[#dadce0] bg-white dark:border-[#3c4043] dark:bg-[#202124] dark:text-[#e8eaed]">
                      <SelectValue placeholder="Select label" />
                    </SelectTrigger>
                    <SelectContent>
                      {(labels ?? []).map((l) => (
                        <SelectItem key={l.id} value={l.id}>
                          {l.name}
                        </SelectItem>
                      ))}
                      {(!labels || labels.length === 0) && (
                        <SelectItem value="__none" disabled>
                          Create a label first
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={handleCreate}
                  disabled={!tagValue.trim() || !labelId || createMutation.isPending}
                  className="h-9 w-full bg-[#1a73e8] hover:bg-[#1765cc] dark:bg-[#8ab4f8] dark:text-[#202124] dark:hover:bg-[#aecbfa]"
                >
                  Add rule
                </Button>
              </div>
            </section>

            <section className="flex min-h-0 flex-1 flex-col rounded-xl border border-[#e8eaed] bg-[#f8f9fa] p-4 dark:border-[#3c4043] dark:bg-[#292a2d]">
              <p className="mb-3 shrink-0 text-xs font-medium uppercase tracking-wider text-[#5f6368] dark:text-[#9aa0a6]">
                Existing rules
              </p>
              {isLoading ? (
                <div className="flex flex-1 items-center justify-center py-8">
                  <p className="text-sm text-[#5f6368] dark:text-[#9aa0a6]">Loading...</p>
                </div>
              ) : (rules ?? []).length === 0 ? (
                <div className="flex flex-1 flex-col items-center justify-center gap-2 py-8 text-center">
                  <div className="rounded-full bg-[#e8eaed] p-3 dark:bg-[#3c4043]">
                    <Trash2 className="h-5 w-5 text-[#5f6368] dark:text-[#9aa0a6]" />
                  </div>
                  <p className="text-sm font-medium text-[#202124] dark:text-[#e8eaed]">No rules yet</p>
                  <p className="max-w-[220px] text-xs text-[#5f6368] dark:text-[#9aa0a6]">
                    Add a rule above to auto-apply labels when emails match a tag.
                  </p>
                </div>
              ) : (
                <ul className="flex flex-col gap-2 overflow-y-auto pr-1">
                  {(rules ?? []).map((rule) => (
                    <li
                      key={rule.id}
                      className="flex items-center justify-between gap-3 rounded-lg border border-[#e8eaed] bg-white px-3 py-2.5 dark:border-[#3c4043] dark:bg-[#202124]"
                    >
                      <span className="min-w-0 flex-1 truncate text-sm text-[#202124] dark:text-[#e8eaed]">
                        <span className="font-medium text-[#5f6368] dark:text-[#9aa0a6]">&quot;{rule.conditionValue}&quot;</span>
                        <span className="mx-1.5 text-[#5f6368] dark:text-[#9aa0a6]">→</span>
                        {rule.label.name}
                      </span>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 shrink-0 text-[#d93025] hover:bg-[#fce8e6] dark:text-[#f28b82] dark:hover:bg-[#5f2120]"
                        onClick={() => setDeleteId(rule.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
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
          <AlertDialogTitle>Delete this rule?</AlertDialogTitle>
          <AlertDialogDescription>
            Threads that were auto-labeled will keep the label until you remove it manually.
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
