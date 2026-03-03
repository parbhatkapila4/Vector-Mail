"use client";

import React, { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { Loader2, Mail, Shield, CheckCircle2 } from "lucide-react";
import { useDemoMode } from "@/hooks/use-demo-mode";
import { DEMO_ACCOUNT_ID } from "@/lib/demo/constants";

interface SendingIdentitySheetProps {
  accountId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SPF_DESC = "SPF tells receiving servers which hosts can send mail for your domain. Add a TXT record at your DNS.";
const DKIM_DESC = "DKIM signs messages so recipients can verify they came from your domain. Enable it in your provider and add the records they give you.";
const DMARC_DESC = "DMARC tells receivers what to do with mail that fails SPF/DKIM. Add a TXT record for policy and reporting.";

export function SendingIdentitySheet({
  accountId,
  open,
  onOpenChange,
}: SendingIdentitySheetProps) {
  const isDemo = useDemoMode();
  const { data: identity, isLoading: identityLoading } =
    api.account.getSendingIdentity.useQuery(
      { accountId: accountId || "placeholder" },
      { enabled: open && !!accountId && accountId !== DEMO_ACCOUNT_ID },
    );
  const { data: guidance, isLoading: guidanceLoading } =
    api.account.getDeliverabilityGuidance.useQuery(
      { accountId: accountId || "placeholder" },
      { enabled: open && !!accountId && accountId !== DEMO_ACCOUNT_ID },
    );
  const updateMutation = api.account.updateSendingIdentity.useMutation({
    onSuccess: () => {
      toast.success("Sending identity saved");
      onOpenChange(false);
    },
    onError: (e) => toast.error(e.message ?? "Failed to save"),
  });

  const [displayName, setDisplayName] = useState("");
  const [fromAddress, setFromAddress] = useState("");
  const [customDomain, setCustomDomain] = useState("");
  const [spfDone, setSpfDone] = useState(false);
  const [dkimDone, setDkimDone] = useState(false);
  const [dmarcDone, setDmarcDone] = useState(false);

  useEffect(() => {
    if (!identity) return;
    setDisplayName(identity.customFromName ?? "");
    setFromAddress(identity.customFromAddress ?? "");
    setCustomDomain(identity.customDomain ?? "");
    const checklist = identity.deliverabilityChecklist;
    setSpfDone(!!checklist?.spf);
    setDkimDone(!!checklist?.dkim);
    setDmarcDone(!!checklist?.dmarc);
  }, [identity]);

  const handleSave = () => {
    if (!accountId || accountId === DEMO_ACCOUNT_ID) return;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (fromAddress.trim() && !emailRegex.test(fromAddress.trim())) {
      toast.error("Please enter a valid email address for From address");
      return;
    }
    updateMutation.mutate({
      accountId,
      customFromName: displayName.trim() || null,
      customFromAddress: fromAddress.trim() || null,
      customDomain: customDomain.trim() || null,
      deliverabilityChecklist: guidance?.hasCustomDomain
        ? { spf: spfDone, dkim: dkimDone, dmarc: dmarcDone }
        : undefined,
    });
  };

  const handleChecklistChange = (key: "spf" | "dkim" | "dmarc", value: boolean) => {
    if (key === "spf") setSpfDone(value);
    if (key === "dkim") setDkimDone(value);
    if (key === "dmarc") setDmarcDone(value);
    if (!accountId || accountId === DEMO_ACCOUNT_ID) return;
    const next = { spf: key === "spf" ? value : spfDone, dkim: key === "dkim" ? value : dkimDone, dmarc: key === "dmarc" ? value : dmarcDone };
    updateMutation.mutate({
      accountId,
      deliverabilityChecklist: next,
    });
  };

  const hasCustomDomain = guidance?.hasCustomDomain ?? false;
  const allChecklistDone = hasCustomDomain && spfDone && dkimDone && dmarcDone;
  const loading = identityLoading || guidanceLoading;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col overflow-y-auto border-[#dadce0] bg-white dark:border-[#3c4043] dark:bg-[#202124] sm:max-w-md">
        <SheetHeader className="border-b border-[#dadce0] pb-4 dark:border-[#3c4043]">
          <SheetTitle className="text-left text-lg font-semibold text-[#202124] dark:text-[#e8eaed]">
            Sending identity
          </SheetTitle>
        </SheetHeader>

        {isDemo || accountId === DEMO_ACCOUNT_ID ? (
          <p className="mt-4 text-sm text-[#5f6368] dark:text-[#9aa0a6]">
            Connect your Gmail to set a custom From address and deliverability options.
          </p>
        ) : loading ? (
          <div className="flex flex-1 items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-[#1a73e8] dark:text-[#8ab4f8]" />
          </div>
        ) : (
          <div className="mt-6 flex flex-1 flex-col gap-8">
            <div className="space-y-4">
              <p className="text-sm text-[#5f6368] dark:text-[#9aa0a6]">
                Default from: <strong className="text-[#202124] dark:text-[#e8eaed]">{identity?.providerFromName}</strong> &lt;{identity?.providerFromAddress}&gt;
              </p>
              <div className="space-y-2">
                <Label htmlFor="display-name" className="text-[#202124] dark:text-[#e8eaed]">Display name</Label>
                <Input
                  id="display-name"
                  placeholder="e.g. Acme Inc"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="border-[#dadce0] bg-white dark:border-[#3c4043] dark:bg-[#292a2d] dark:text-[#e8eaed]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="from-address" className="text-[#202124] dark:text-[#e8eaed]">From address</Label>
                <Input
                  id="from-address"
                  type="email"
                  placeholder="e.g. hello@mycompany.com"
                  value={fromAddress}
                  onChange={(e) => setFromAddress(e.target.value)}
                  className="border-[#dadce0] bg-white dark:border-[#3c4043] dark:bg-[#292a2d] dark:text-[#e8eaed]"
                />
                <p className="text-xs text-[#5f6368] dark:text-[#9aa0a6]">
                  Custom From is used when sending if your provider supports it (e.g. Gmail &quot;Send mail as&quot;). Otherwise add this address in Gmail/Outlook.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="custom-domain" className="text-[#202124] dark:text-[#e8eaed]">Custom domain (optional)</Label>
                <Input
                  id="custom-domain"
                  placeholder="e.g. mycompany.com"
                  value={customDomain}
                  onChange={(e) => setCustomDomain(e.target.value)}
                  className="border-[#dadce0] bg-white dark:border-[#3c4043] dark:bg-[#292a2d] dark:text-[#e8eaed]"
                />
                <p className="text-xs text-[#5f6368] dark:text-[#9aa0a6]">
                  Used only for deliverability guidance below.
                </p>
              </div>
              <Button
                onClick={handleSave}
                disabled={updateMutation.isPending}
                className="w-full bg-[#1a73e8] text-white hover:bg-[#1557b0] dark:bg-[#8ab4f8] dark:text-[#202124] dark:hover:bg-[#aecbfa]"
              >
                {updateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
              </Button>
            </div>

            {hasCustomDomain ? (
              <div className="space-y-4 rounded-lg border border-[#dadce0] bg-[#f8f9fa] p-4 dark:border-[#3c4043] dark:bg-[#252628]">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-[#202124] dark:text-[#e8eaed]">
                  <Shield className="h-4 w-4" />
                  Set up your domain (deliverability)
                </h3>
                <p className="text-xs text-[#5f6368] dark:text-[#9aa0a6]">
                  Static guidance only; we don’t verify DNS. Add these records at your DNS provider.
                </p>

                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="spf-done"
                      checked={spfDone}
                      onCheckedChange={(c) => handleChecklistChange("spf", !!c)}
                      className="border-[#5f6368] data-[state=checked]:bg-[#1a73e8] dark:border-[#9aa0a6] dark:data-[state=checked]:bg-[#8ab4f8]"
                    />
                    <div className="min-w-0 flex-1">
                      <Label htmlFor="spf-done" className="cursor-pointer font-medium text-[#202124] dark:text-[#e8eaed]">SPF</Label>
                      <p className="mt-0.5 text-xs text-[#5f6368] dark:text-[#9aa0a6]">{SPF_DESC}</p>
                      <code className="mt-1 block break-all rounded bg-[#e8eaed] px-2 py-1 text-[11px] text-[#202124] dark:bg-[#3c4043] dark:text-[#e8eaed]">
                        {guidance?.spf ?? "v=spf1 include:_spf.google.com ~all"}
                      </code>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="dkim-done"
                      checked={dkimDone}
                      onCheckedChange={(c) => handleChecklistChange("dkim", !!c)}
                      className="border-[#5f6368] data-[state=checked]:bg-[#1a73e8] dark:border-[#9aa0a6] dark:data-[state=checked]:bg-[#8ab4f8]"
                    />
                    <div className="min-w-0 flex-1">
                      <Label htmlFor="dkim-done" className="cursor-pointer font-medium text-[#202124] dark:text-[#e8eaed]">DKIM</Label>
                      <p className="mt-0.5 text-xs text-[#5f6368] dark:text-[#9aa0a6]">{guidance?.dkim ?? DKIM_DESC}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="dmarc-done"
                      checked={dmarcDone}
                      onCheckedChange={(c) => handleChecklistChange("dmarc", !!c)}
                      className="border-[#5f6368] data-[state=checked]:bg-[#1a73e8] dark:border-[#9aa0a6] dark:data-[state=checked]:bg-[#8ab4f8]"
                    />
                    <div className="min-w-0 flex-1">
                      <Label htmlFor="dmarc-done" className="cursor-pointer font-medium text-[#202124] dark:text-[#e8eaed]">DMARC</Label>
                      <p className="mt-0.5 text-xs text-[#5f6368] dark:text-[#9aa0a6]">{DMARC_DESC}</p>
                      <code className="mt-1 block break-all rounded bg-[#e8eaed] px-2 py-1 text-[11px] text-[#202124] dark:bg-[#3c4043] dark:text-[#e8eaed]">
                        {guidance?.dmarc ?? "v=DMARC1; p=none; rua=mailto:..."}
                      </code>
                    </div>
                  </div>
                </div>
                {allChecklistDone && (
                  <p className="flex items-center gap-2 text-sm font-medium text-[#137333] dark:text-[#81c995]">
                    <CheckCircle2 className="h-4 w-4" />
                    All set
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-[#5f6368] dark:text-[#9aa0a6]">
                You’re sending from your provider address; deliverability is usually fine. To use your own domain, set a custom From address above and follow the checklist.
              </p>
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
