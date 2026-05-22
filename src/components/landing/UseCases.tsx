"use client";

import Image from "next/image";
import { useEffect, useState, type ReactNode } from "react";
import { useSearchParams } from "next/navigation";

const TABS = [
  "Founders",
  "Sales",
  "Engineering",
  "Customer Support",
  "Investors",
] as const;

interface UseCard {
  h: string;
  p: string;
  tag: string;
  preview: ReactNode;
}

const InvestorTrackerPreview = (
  <div className="ui-preview">
    <div className="ui-preview-head">
      <span>Investors · 8 active</span>
      <span className="right">
        <span className="pill">2 need reply</span>
      </span>
    </div>
    <div className="ui-thread-list">
      <div className="ui-thread-row">
        <span className="ui-thread-avatar green">SQ</span>
        <span className="ui-thread-name">Sequoia · Roelof</span>
        <span className="ui-thread-status live">2h ago</span>
      </div>
      <div className="ui-thread-row">
        <span className="ui-thread-avatar amber">A1</span>
        <span className="ui-thread-name">a16z · Marc</span>
        <span className="ui-thread-status warn">waiting</span>
      </div>
      <div className="ui-thread-row">
        <span className="ui-thread-avatar indigo">YC</span>
        <span className="ui-thread-name">Y Combinator</span>
        <span className="ui-thread-status muted">5d ago</span>
      </div>
      <div className="ui-thread-row">
        <span className="ui-thread-avatar rose">FF</span>
        <span className="ui-thread-name">Founders Fund · Brian</span>
        <span className="ui-thread-status urgent">overdue</span>
      </div>
    </div>
  </div>
);

const FounderBriefPreview = (
  <div className="ui-preview">
    <div className="ui-preview-head">
      <span>Mon · 8:42 AM</span>
      <span className="right">
        <span className="live-dot">live</span>
      </span>
    </div>
    <div className="ui-brief">
      <div className="ui-brief-wave">
        <span /><span /><span /><span /><span /><span />
        <span /><span /><span /><span /><span /><span />
      </div>
      <div className="ui-brief-stats">
        <span className="stat"><span className="num">47</span>read</span>
        <span className="stat"><span className="num">3</span>need you</span>
        <span className="stat"><span className="num">42m</span>saved</span>
      </div>
    </div>
  </div>
);

const ColdOutreachPreview = (
  <div className="ui-preview">
    <div className="ui-preview-head">
      <span>Draft · to marc@tideflow.com</span>
      <span className="right">
        <span className="live-dot">drafting</span>
      </span>
    </div>
    <div className="ui-draft">
      Hey Marc - saw Tideflow&apos;s<br />
      new agent SDK. The way you<br />
      handle context windows is<br />
      smart<span className="cursor" />
    </div>
  </div>
);
const DealStagePreview = (
  <div className="ui-preview">
    <div className="ui-preview-head">
      <span>Pipeline · 47 deals</span>
      <span className="right">
        <span className="pill">$1.2M ARR</span>
      </span>
    </div>
    <div className="ui-pipeline">
      <div className="ui-pipeline-col">
        <div className="ui-pipeline-col-head">Demo<span className="num">12</span></div>
        <div className="ui-pipeline-deal warm">Acme Corp</div>
        <div className="ui-pipeline-deal cold">Stripe Inc</div>
      </div>
      <div className="ui-pipeline-col">
        <div className="ui-pipeline-col-head">POC<span className="num">8</span></div>
        <div className="ui-pipeline-deal hot">Linear</div>
        <div className="ui-pipeline-deal warm">Vercel</div>
      </div>
      <div className="ui-pipeline-col">
        <div className="ui-pipeline-col-head">Negot.<span className="num">5</span></div>
        <div className="ui-pipeline-deal hot">Notion</div>
      </div>
      <div className="ui-pipeline-col">
        <div className="ui-pipeline-col-head">Close<span className="num">3</span></div>
        <div className="ui-pipeline-deal hot">Figma</div>
      </div>
    </div>
  </div>
);

const FollowUpRadarPreview = (
  <div className="ui-preview">
    <div className="ui-preview-head">
      <span>Stalled threads · Today</span>
      <span className="right">
        <span className="pill">7 to nudge</span>
      </span>
    </div>
    <div className="ui-thread-list">
      <div className="ui-thread-row">
        <span className="ui-thread-avatar blue">JD</span>
        <span className="ui-thread-name">Jane @ Datadog</span>
        <span className="ui-thread-status urgent">9 days</span>
      </div>
      <div className="ui-thread-row">
        <span className="ui-thread-avatar gray">RK</span>
        <span className="ui-thread-name">Rajeev @ HubSpot</span>
        <span className="ui-thread-status urgent">12 days</span>
      </div>
      <div className="ui-thread-row">
        <span className="ui-thread-avatar amber">SM</span>
        <span className="ui-thread-name">Sam @ Loom</span>
        <span className="ui-thread-status warn">5 days</span>
      </div>
      <div className="ui-thread-row">
        <span className="ui-thread-avatar indigo">MC</span>
        <span className="ui-thread-name">Mei @ Canva</span>
        <span className="ui-thread-status warn">4 days</span>
      </div>
    </div>
  </div>
);

const ProspectIntelPreview = (
  <div className="ui-preview">
    <div className="ui-preview-head">
      <span>Prospect intel · Linear</span>
      <span className="right">
        <span className="live-dot">synthesizing</span>
      </span>
    </div>
    <div className="ui-draft">
      <span style={{ color: "#1e2a4a", fontWeight: 700 }}>Buying signals:</span>
      <br />
      • Hired 2 RevOps in Q2<br />
      • CFO mentioned &quot;tooling<br />
      &nbsp;&nbsp;consolidation&quot; 3x<br />
      • Trial expired Friday<span className="cursor" />
    </div>
  </div>
);
const PrIncidentPreview = (
  <div className="ui-preview">
    <div className="ui-preview-head">
      <span>Auto-filed · last hour</span>
      <span className="right">
        <span className="pill">87 muted</span>
      </span>
    </div>
    <div className="ui-filter-stack">
      <div className="ui-filter-row">
        <span className="ui-filter-tag pr">PR</span>
        <span className="ui-filter-text">backend/auth: rotate JWT keys</span>
        <span className="ui-filter-time">2m</span>
      </div>
      <div className="ui-filter-row">
        <span className="ui-filter-tag incident">P1</span>
        <span className="ui-filter-text">api.checkout 503s spiking</span>
        <span className="ui-filter-time">5m</span>
      </div>
      <div className="ui-filter-row">
        <span className="ui-filter-tag deploy">DEPLOY</span>
        <span className="ui-filter-text">prod-us-east v2.41.0</span>
        <span className="ui-filter-time">14m</span>
      </div>
      <div className="ui-filter-row">
        <span className="ui-filter-tag pr">PR</span>
        <span className="ui-filter-text">infra/k8s: bump node count</span>
        <span className="ui-filter-time">22m</span>
      </div>
    </div>
  </div>
);

const FocusModePreview = (
  <div className="ui-preview">
    <div className="ui-preview-head">
      <span>Deep work mode · 09:00–12:00</span>
      <span className="right">
        <span className="live-dot">active</span>
      </span>
    </div>
    <div className="ui-brief">
      <div className="ui-brief-wave">
        <span style={{ height: "12%", opacity: 0.3 }} />
        <span style={{ height: "18%", opacity: 0.3 }} />
        <span style={{ height: "14%", opacity: 0.3 }} />
        <span style={{ height: "16%", opacity: 0.3 }} />
        <span style={{ height: "22%", opacity: 0.4 }} />
        <span style={{ height: "20%", opacity: 0.4 }} />
        <span style={{ height: "90%", opacity: 1 }} />
        <span style={{ height: "70%", opacity: 0.85 }} />
        <span style={{ height: "60%", opacity: 0.7 }} />
        <span style={{ height: "80%", opacity: 0.95 }} />
        <span style={{ height: "65%", opacity: 0.8 }} />
        <span style={{ height: "50%", opacity: 0.65 }} />
      </div>
      <div className="ui-brief-stats">
        <span className="stat"><span className="num">3h</span>protected</span>
        <span className="stat"><span className="num">14</span>queued</span>
        <span className="stat"><span className="num">2</span>P1 only</span>
      </div>
    </div>
  </div>
);

const IncidentContextPreview = (
  <div className="ui-preview">
    <div className="ui-preview-head">
      <span>On-call escalation</span>
      <span className="right">
        <span className="live-dot">paged</span>
      </span>
    </div>
    <div className="ui-draft">
      <span style={{ color: "#b91c4b", fontWeight: 700 }}>P1 - checkout 503s</span>
      <br />
      Started 04:12 UTC<br />
      Affected: 2.3% of requests<br />
      <span style={{ color: "#1e2a4a", fontWeight: 700 }}>Likely cause:</span>{" "}Stripe<br />
      webhook timeout<span className="cursor" />
    </div>
  </div>
);

const PatternSpotterPreview = (
  <div className="ui-preview">
    <div className="ui-preview-head">
      <span>Pattern detection · this week</span>
      <span className="right">
        <span className="pill">3 trends</span>
      </span>
    </div>
    <div className="ui-triage">
      <div className="ui-triage-row">
        <span className="ui-triage-icon pattern">↗</span>
        <span className="ui-triage-text">
          <strong>SSO login fails</strong> on Safari
        </span>
        <span className="ui-triage-count">×34</span>
      </div>
      <div className="ui-triage-row">
        <span className="ui-triage-icon pattern">↗</span>
        <span className="ui-triage-text">
          <strong>Export CSV</strong> truncates rows
        </span>
        <span className="ui-triage-count">×18</span>
      </div>
      <div className="ui-triage-row">
        <span className="ui-triage-icon pattern">↗</span>
        <span className="ui-triage-text">
          <strong>Billing</strong> proration confusion
        </span>
        <span className="ui-triage-count">×11</span>
      </div>
      <div className="ui-triage-row">
        <span className="ui-triage-icon resolved">✓</span>
        <span className="ui-triage-text">Mobile push delays</span>
        <span className="ui-triage-count">fixed</span>
      </div>
    </div>
  </div>
);

const VoiceMatchedPreview = (
  <div className="ui-preview">
    <div className="ui-preview-head">
      <span>Suggested reply · in your voice</span>
      <span className="right">
        <span className="live-dot">drafted</span>
      </span>
    </div>
    <div className="ui-draft">
      Hey Sarah,<br /><br />
      Totally hear you - that<br />
      export bug bit a few folks<br />
      this week. Engineering has<br />
      a fix shipping Friday<span className="cursor" />
    </div>
  </div>
);

const EscalationRadarPreview = (
  <div className="ui-preview">
    <div className="ui-preview-head">
      <span>Escalation queue</span>
      <span className="right">
        <span className="pill">2 urgent</span>
      </span>
    </div>
    <div className="ui-triage">
      <div className="ui-triage-row">
        <span className="ui-triage-icon escalate">!</span>
        <span className="ui-triage-text">
          <strong>Acme</strong> · churn risk · 3rd ping
        </span>
        <span className="ui-triage-count">CSM</span>
      </div>
      <div className="ui-triage-row">
        <span className="ui-triage-icon escalate">!</span>
        <span className="ui-triage-text">
          <strong>BigCo</strong> · CEO involved
        </span>
        <span className="ui-triage-count">Mgr</span>
      </div>
      <div className="ui-triage-row">
        <span className="ui-triage-icon pattern">↗</span>
        <span className="ui-triage-text">
          <strong>Nexus</strong> · sentiment dropped
        </span>
        <span className="ui-triage-count">watch</span>
      </div>
      <div className="ui-triage-row">
        <span className="ui-triage-icon resolved">✓</span>
        <span className="ui-triage-text">DataCo · resolved 2h ago</span>
        <span className="ui-triage-count">CSAT 5</span>
      </div>
    </div>
  </div>
);

const PortfolioPulsePreview = (
  <div className="ui-preview">
    <div className="ui-preview-head">
      <span>Portfolio digest · this week</span>
      <span className="right">
        <span className="pill">23 updates</span>
      </span>
    </div>
    <div className="ui-portfolio">
      <div className="ui-portfolio-row">
        <span className="ui-portfolio-mark">L</span>
        <span className="ui-portfolio-name">Linear · Q1 ARR</span>
        <span className="ui-portfolio-trend up">↑ 38%</span>
      </div>
      <div className="ui-portfolio-row">
        <span className="ui-portfolio-mark">V</span>
        <span className="ui-portfolio-name">Vercel · headcount</span>
        <span className="ui-portfolio-trend up">↑ 12</span>
      </div>
      <div className="ui-portfolio-row">
        <span className="ui-portfolio-mark">N</span>
        <span className="ui-portfolio-name">Notion · churn</span>
        <span className="ui-portfolio-trend flat">flat</span>
      </div>
      <div className="ui-portfolio-row">
        <span className="ui-portfolio-mark">R</span>
        <span className="ui-portfolio-name">Replit · burn</span>
        <span className="ui-portfolio-trend down">↑ 22%</span>
      </div>
    </div>
  </div>
);

const DealFlowPreview = (
  <div className="ui-preview">
    <div className="ui-preview-head">
      <span>Deal flow · ranked</span>
      <span className="right">
        <span className="pill">194 in box</span>
      </span>
    </div>
    <div className="ui-dealflow">
      <div className="ui-dealflow-row">
        <span className="ui-dealflow-rank">01</span>
        <span className="ui-dealflow-name">Tideflow · agent infra</span>
        <span className="ui-dealflow-stage">seed</span>
      </div>
      <div className="ui-dealflow-row">
        <span className="ui-dealflow-rank">02</span>
        <span className="ui-dealflow-name">Cinder · AI eval platform</span>
        <span className="ui-dealflow-stage">pre-seed</span>
      </div>
      <div className="ui-dealflow-row">
        <span className="ui-dealflow-rank">03</span>
        <span className="ui-dealflow-name">Halo · dev observability</span>
        <span className="ui-dealflow-stage">series a</span>
      </div>
      <div className="ui-dealflow-row">
        <span className="ui-dealflow-rank">04</span>
        <span className="ui-dealflow-name">Verdant · climate compute</span>
        <span className="ui-dealflow-stage">seed</span>
      </div>
    </div>
  </div>
);

const FounderCheckInPreview = (
  <div className="ui-preview">
    <div className="ui-preview-head">
      <span>Founder check-in · auto-draft</span>
      <span className="right">
        <span className="live-dot">drafted</span>
      </span>
    </div>
    <div className="ui-draft">
      Hey Parbhat,<br /><br />
      Saw you closed your first<br />
      paying account - congrats.<br />
      Quick check: how&apos;s the<br />
      EU GDPR review going<span className="cursor" />
    </div>
  </div>
);

const TAB_CONTENT: Record<number, UseCard[]> = {
  0: [
    {
      h: "Investor Update Tracker",
      p: "Surfaces every commitment, intro, and follow-up across all your investor threads. Never miss a check-in or let a hot lead go cold.",
      tag: "Investors",
      preview: InvestorTrackerPreview,
    },
    {
      h: "Founder Morning Brief",
      p: "A 90-second digest of what changed overnight: customer fires, hire updates, fundraise pings. The signal, none of the noise.",
      tag: "Daily",
      preview: FounderBriefPreview,
    },
    {
      h: "Cold Outreach Composer",
      p: 'Drafts founder-direct emails based on the company’s actual product. Four sentences. Sixty words. No "Hope you’re well."',
      tag: "Outreach",
      preview: ColdOutreachPreview,
    },
  ],
  1: [
    {
      h: "Deal Stage Tracker",
      p: "Reads your threads and infers each deal’s actual stage. No more guessing if a prospect went dark or just needs a nudge.",
      tag: "Pipeline",
      preview: DealStagePreview,
    },
    {
      h: "Follow-Up Radar",
      p: "Catches prospects you forgot to follow up with before your manager does. Suggests the exact send-time most likely to land a reply.",
      tag: "Follow-ups",
      preview: FollowUpRadarPreview,
    },
    {
      h: "Prospect Intel Synth",
      p: "Pulls every signal from your threads with an account into a single brief. Walk into every call knowing exactly what to lean on.",
      tag: "Intel",
      preview: ProspectIntelPreview,
    },
  ],
  2: [
    {
      h: "PR & Incident Filter",
      p: "Surfaces the GitHub, Linear, and PagerDuty threads that actually need your eyes. Mutes the bot noise. Pages you only when it matters.",
      tag: "Signal",
      preview: PrIncidentPreview,
    },
    {
      h: "Focus Mode Guard",
      p: "Holds your inbox during deep work. Lets P1 incidents through. Releases the queue at noon with one-line summaries of everything you missed.",
      tag: "Focus",
      preview: FocusModePreview,
    },
    {
      h: "Incident Context Brief",
      p: "When you’re paged at 4 AM, get the thread history, related deploys, and probable cause distilled into 5 lines before you open Slack.",
      tag: "On-call",
      preview: IncidentContextPreview,
    },
  ],
  3: [
    {
      h: "Pattern Spotter",
      p: "Clusters tickets by root cause across users. You learn about the bug from your inbox before engineering opens the issue.",
      tag: "Trends",
      preview: PatternSpotterPreview,
    },
    {
      h: "Voice-Matched Replies",
      p: "Drafts replies that sound like you wrote them. Pulls the right help doc, the right fix-ETA, the right tone for that customer.",
      tag: "Replies",
      preview: VoiceMatchedPreview,
    },
    {
      h: "Escalation Radar",
      p: "Flags tickets with churn-risk language, exec involvement, or sentiment drops. Routes them to the right person before they blow up.",
      tag: "Escalations",
      preview: EscalationRadarPreview,
    },
  ],
  4: [
    {
      h: "Portfolio Pulse",
      p: "Aggregates every founder update into one weekly digest. Spot the company quietly slipping or quietly crushing it before the next board call.",
      tag: "Portfolio",
      preview: PortfolioPulsePreview,
    },
    {
      h: "Deal Flow Ranker",
      p: "Ranks 200+ inbound decks by thesis fit, founder quality signals, and team velocity. Your weekend reading list, prioritized.",
      tag: "Sourcing",
      preview: DealFlowPreview,
    },
    {
      h: "Founder Check-In Drafter",
      p: "Drafts a quarterly check-in to every portfolio founder, referencing their last update and asking the one question that matters most.",
      tag: "Outreach",
      preview: FounderCheckInPreview,
    },
  ],
};

const ROLECARDS_CSS = `
  .vm-rolecards-scope { color: #ffffff; }

  /* TABS */
  .vm-rolecards-scope .role-tabs {
    display: flex;
    justify-content: center;
    gap: 4px;
    margin: 0 auto 48px;
    border-bottom: 1px solid rgba(255,255,255,0.10);
    flex-wrap: wrap;
    max-width: 1100px;
  }
  .vm-rolecards-scope .role-tab {
    padding: 16px 28px;
    background: transparent;
    border: none;
    color: rgba(255,255,255,0.55);
    font-family: inherit;
    font-size: 15px;
    font-weight: 540;
    cursor: pointer;
    position: relative;
    transition: color 0.18s cubic-bezier(0.16, 1, 0.3, 1);
    letter-spacing: -0.005em;
  }
  .vm-rolecards-scope .role-tab:hover { color: rgba(255,255,255,0.85); }
  .vm-rolecards-scope .role-tab.active { color: #ffffff; font-weight: 600; }
  .vm-rolecards-scope .role-tab.active::after {
    content: '';
    position: absolute;
    bottom: -1px;
    left: 0;
    right: 0;
    height: 2px;
    background: #ffffff;
    border-radius: 1px;
  }

  /* CARDS GRID */
  .vm-rolecards-scope .cards-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 18px;
    max-width: 1180px;
    margin: 0 auto;
    animation: vm-rolecards-fade-in 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  }
  @keyframes vm-rolecards-fade-in {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  /* CARD CHROME */
  .vm-rolecards-scope .role-card {
    background: #ffffff;
    border: 1px solid #e4e7ed;
    border-radius: 14px;
    padding: 0;
    box-shadow: 0 1px 2px rgba(15,20,40,0.04), 0 4px 12px rgba(15,20,40,0.05);
    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    overflow: hidden;
    display: flex;
    flex-direction: column;
    text-align: left;
  }
  .vm-rolecards-scope .role-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 1px 2px rgba(15,20,40,0.05), 0 8px 24px rgba(15,20,40,0.08);
    border-color: rgba(30,42,74,0.18);
  }

  /* CARD BODY */
  .vm-rolecards-scope .card-body {
    padding: 18px 18px 16px;
    flex: 1;
    display: flex;
    flex-direction: column;
  }
  .vm-rolecards-scope .card-title {
    font-size: 17px;
    font-weight: 600;
    color: #0e1729;
    letter-spacing: -0.018em;
    line-height: 1.25;
    margin: 0 0 8px;
  }
  .vm-rolecards-scope .card-desc {
    font-size: 13.5px;
    color: #4a5572;
    line-height: 1.5;
    letter-spacing: -0.005em;
    flex: 1;
    margin: 0 0 14px;
  }
  .vm-rolecards-scope .card-tag {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    font-family: var(--font-jetbrains-mono), 'JetBrains Mono', ui-monospace, monospace;
    font-size: 10px;
    color: #7a849a;
    text-transform: uppercase;
    letter-spacing: 0.14em;
    font-weight: 600;
    padding: 4px 10px;
    background: #f4f5f8;
    border-radius: 5px;
    width: fit-content;
  }
  .vm-rolecards-scope .card-tag::before {
    content: '→';
    color: #1e2a4a;
    font-weight: 700;
  }

  /* UI PREVIEW (top half) */
  .vm-rolecards-scope .ui-preview {
    padding: 16px;
    background: #fafbfc;
    border-bottom: 1px solid #eef0f4;
    min-height: 200px;
    position: relative;
  }
  .vm-rolecards-scope .ui-preview-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
    font-family: var(--font-jetbrains-mono), 'JetBrains Mono', ui-monospace, monospace;
    font-size: 9.5px;
    color: #7a849a;
    text-transform: uppercase;
    letter-spacing: 0.14em;
    font-weight: 600;
  }
  .vm-rolecards-scope .ui-preview-head .right { display: flex; align-items: center; gap: 6px; }
  .vm-rolecards-scope .ui-preview-head .pill {
    padding: 1px 7px;
    background: rgba(185,28,75,0.08);
    color: #b91c4b;
    border-radius: 3px;
    font-weight: 700;
  }
  .vm-rolecards-scope .ui-preview-head .live-dot {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    color: #15803d;
  }
  .vm-rolecards-scope .ui-preview-head .live-dot::before {
    content: '';
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: #15803d;
    box-shadow: 0 0 4px #15803d;
    animation: vm-rolecards-pulse 1.6s ease-in-out infinite;
  }
  @keyframes vm-rolecards-pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.4; }
  }

  /* THREAD ROWS */
  .vm-rolecards-scope .ui-thread-list { display: flex; flex-direction: column; gap: 4px; }
  .vm-rolecards-scope .ui-thread-row {
    display: flex;
    align-items: center;
    gap: 9px;
    padding: 8px 10px;
    background: #ffffff;
    border: 1px solid #e4e7ed;
    border-radius: 7px;
    font-size: 11.5px;
    transition: border-color 0.15s;
  }
  .vm-rolecards-scope .ui-thread-row:hover { border-color: rgba(30,42,74,0.18); }
  .vm-rolecards-scope .ui-thread-avatar {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    display: grid;
    place-items: center;
    font-family: var(--font-jetbrains-mono), 'JetBrains Mono', ui-monospace, monospace;
    font-size: 8.5px;
    font-weight: 700;
    color: white;
    flex-shrink: 0;
  }
  .vm-rolecards-scope .ui-thread-avatar.green  { background: linear-gradient(135deg, #16a34a, #15803d); }
  .vm-rolecards-scope .ui-thread-avatar.amber  { background: linear-gradient(135deg, #d97706, #92400e); }
  .vm-rolecards-scope .ui-thread-avatar.indigo { background: linear-gradient(135deg, #2d3d6b, #0d1530); }
  .vm-rolecards-scope .ui-thread-avatar.rose   { background: linear-gradient(135deg, #db2777, #be185d); }
  .vm-rolecards-scope .ui-thread-avatar.blue   { background: linear-gradient(135deg, #2563eb, #1e40af); }
  .vm-rolecards-scope .ui-thread-avatar.gray   { background: linear-gradient(135deg, #64748b, #475569); }
  .vm-rolecards-scope .ui-thread-name {
    flex: 1;
    font-weight: 540;
    color: #1e2a44;
    letter-spacing: -0.005em;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .vm-rolecards-scope .ui-thread-status {
    font-family: var(--font-jetbrains-mono), 'JetBrains Mono', ui-monospace, monospace;
    font-size: 9.5px;
    color: #7a849a;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    font-weight: 600;
    flex-shrink: 0;
  }
  .vm-rolecards-scope .ui-thread-status.live {
    color: #15803d;
    display: inline-flex;
    align-items: center;
    gap: 4px;
  }
  .vm-rolecards-scope .ui-thread-status.live::before {
    content: '';
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: #15803d;
    box-shadow: 0 0 4px #15803d;
  }
  .vm-rolecards-scope .ui-thread-status.warn   { color: #92400e; }
  .vm-rolecards-scope .ui-thread-status.urgent { color: #b91c4b; }
  .vm-rolecards-scope .ui-thread-status.muted  { color: #a8b0c0; }

  /* MORNING BRIEF / FOCUS WAVEFORM */
  .vm-rolecards-scope .ui-brief { padding: 4px 0; }
  .vm-rolecards-scope .ui-brief-wave {
    display: flex;
    align-items: flex-end;
    gap: 3px;
    height: 56px;
    margin-bottom: 16px;
    padding: 0 4px;
  }
  .vm-rolecards-scope .ui-brief-wave span {
    flex: 1;
    background: linear-gradient(180deg, #2d3d6b 0%, #1e2a4a 100%);
    border-radius: 2px;
    opacity: 0.6;
    animation: vm-rolecards-wave 2s ease-in-out infinite;
    transform-origin: bottom;
  }
  .vm-rolecards-scope .ui-brief-wave span:nth-child(1)  { height: 30%; animation-delay: 0s; }
  .vm-rolecards-scope .ui-brief-wave span:nth-child(2)  { height: 55%; animation-delay: 0.1s; }
  .vm-rolecards-scope .ui-brief-wave span:nth-child(3)  { height: 70%; animation-delay: 0.2s; opacity: 0.85; }
  .vm-rolecards-scope .ui-brief-wave span:nth-child(4)  { height: 90%; animation-delay: 0.3s; opacity: 1; }
  .vm-rolecards-scope .ui-brief-wave span:nth-child(5)  { height: 65%; animation-delay: 0.4s; opacity: 0.9; }
  .vm-rolecards-scope .ui-brief-wave span:nth-child(6)  { height: 80%; animation-delay: 0.5s; opacity: 0.95; }
  .vm-rolecards-scope .ui-brief-wave span:nth-child(7)  { height: 45%; animation-delay: 0.6s; }
  .vm-rolecards-scope .ui-brief-wave span:nth-child(8)  { height: 60%; animation-delay: 0.7s; opacity: 0.7; }
  .vm-rolecards-scope .ui-brief-wave span:nth-child(9)  { height: 75%; animation-delay: 0.8s; opacity: 0.85; }
  .vm-rolecards-scope .ui-brief-wave span:nth-child(10) { height: 35%; animation-delay: 0.9s; }
  .vm-rolecards-scope .ui-brief-wave span:nth-child(11) { height: 50%; animation-delay: 1.0s; opacity: 0.75; }
  .vm-rolecards-scope .ui-brief-wave span:nth-child(12) { height: 25%; animation-delay: 1.1s; opacity: 0.5; }
  @keyframes vm-rolecards-wave {
    0%, 100% { transform: scaleY(1); }
    50%      { transform: scaleY(0.85); }
  }
  .vm-rolecards-scope .ui-brief-stats {
    display: flex;
    align-items: center;
    gap: 14px;
    font-size: 11.5px;
    color: #7a849a;
  }
  .vm-rolecards-scope .ui-brief-stats .stat .num {
    color: #0e1729;
    font-weight: 600;
    font-family: var(--font-jetbrains-mono), 'JetBrains Mono', ui-monospace, monospace;
    margin-right: 2px;
  }

  /* DRAFT/COMPOSE */
  .vm-rolecards-scope .ui-draft {
    font-family: var(--font-jetbrains-mono), 'JetBrains Mono', ui-monospace, monospace;
    font-size: 11px;
    color: #1e2a44;
    line-height: 1.55;
    padding: 4px 0;
  }
  .vm-rolecards-scope .ui-draft .cursor {
    display: inline-block;
    width: 1.5px;
    height: 11px;
    background: #1e2a4a;
    vertical-align: text-bottom;
    margin-left: 1px;
    animation: vm-rolecards-cursor 1.1s steps(2) infinite;
  }
  @keyframes vm-rolecards-cursor {
    50% { opacity: 0; }
  }

  /* SALES PIPELINE */
  .vm-rolecards-scope .ui-pipeline {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 6px;
  }
  .vm-rolecards-scope .ui-pipeline-col {
    background: #ffffff;
    border: 1px solid #e4e7ed;
    border-radius: 6px;
    padding: 8px 7px;
    min-height: 110px;
  }
  .vm-rolecards-scope .ui-pipeline-col-head {
    font-family: var(--font-jetbrains-mono), 'JetBrains Mono', ui-monospace, monospace;
    font-size: 8.5px;
    color: #7a849a;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    font-weight: 600;
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .vm-rolecards-scope .ui-pipeline-col-head .num { color: #0e1729; font-weight: 700; }
  .vm-rolecards-scope .ui-pipeline-deal {
    background: #f4f5f8;
    border-radius: 4px;
    padding: 5px 6px;
    margin-bottom: 4px;
    font-size: 10px;
    font-weight: 540;
    color: #1e2a44;
    letter-spacing: -0.005em;
    border-left: 2px solid transparent;
  }
  .vm-rolecards-scope .ui-pipeline-deal.hot  { border-left-color: #b91c4b; }
  .vm-rolecards-scope .ui-pipeline-deal.warm { border-left-color: #92400e; }
  .vm-rolecards-scope .ui-pipeline-deal.cold { border-left-color: #a8b0c0; }

  /* PR/INCIDENT FILTER */
  .vm-rolecards-scope .ui-filter-stack { display: flex; flex-direction: column; gap: 5px; }
  .vm-rolecards-scope .ui-filter-row {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 7px 9px;
    background: #ffffff;
    border: 1px solid #e4e7ed;
    border-radius: 6px;
    font-size: 10.5px;
  }
  .vm-rolecards-scope .ui-filter-tag {
    font-family: var(--font-jetbrains-mono), 'JetBrains Mono', ui-monospace, monospace;
    font-size: 8.5px;
    padding: 1px 6px;
    border-radius: 3px;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    font-weight: 700;
    flex-shrink: 0;
  }
  .vm-rolecards-scope .ui-filter-tag.pr       { background: rgba(30,64,175,0.08);   color: #1e40af; }
  .vm-rolecards-scope .ui-filter-tag.incident { background: rgba(185,28,75,0.08);   color: #b91c4b; }
  .vm-rolecards-scope .ui-filter-tag.deploy   { background: rgba(21,128,61,0.08);   color: #15803d; }
  .vm-rolecards-scope .ui-filter-text {
    flex: 1;
    color: #1e2a44;
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    letter-spacing: -0.005em;
  }
  .vm-rolecards-scope .ui-filter-time {
    font-family: var(--font-jetbrains-mono), 'JetBrains Mono', ui-monospace, monospace;
    font-size: 9.5px;
    color: #7a849a;
    flex-shrink: 0;
  }

  /* TICKET TRIAGE (support) */
  .vm-rolecards-scope .ui-triage { display: flex; flex-direction: column; gap: 5px; }
  .vm-rolecards-scope .ui-triage-row {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 7px 9px;
    background: #ffffff;
    border: 1px solid #e4e7ed;
    border-radius: 6px;
    font-size: 10.5px;
  }
  .vm-rolecards-scope .ui-triage-icon {
    width: 16px;
    height: 16px;
    border-radius: 4px;
    display: grid;
    place-items: center;
    flex-shrink: 0;
    font-size: 10px;
    font-weight: 700;
  }
  .vm-rolecards-scope .ui-triage-icon.pattern  { background: rgba(30,64,175,0.08);  color: #1e40af; }
  .vm-rolecards-scope .ui-triage-icon.escalate { background: rgba(185,28,75,0.08);  color: #b91c4b; }
  .vm-rolecards-scope .ui-triage-icon.resolved { background: rgba(21,128,61,0.08);  color: #15803d; }
  .vm-rolecards-scope .ui-triage-text {
    flex: 1;
    color: #1e2a44;
    letter-spacing: -0.005em;
  }
  .vm-rolecards-scope .ui-triage-text strong { font-weight: 600; color: #0e1729; }
  .vm-rolecards-scope .ui-triage-count {
    font-family: var(--font-jetbrains-mono), 'JetBrains Mono', ui-monospace, monospace;
    font-size: 9.5px;
    color: #7a849a;
    font-weight: 600;
  }

  /* PORTFOLIO DIGEST (investors) */
  .vm-rolecards-scope .ui-portfolio { display: flex; flex-direction: column; gap: 5px; }
  .vm-rolecards-scope .ui-portfolio-row {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 7px 9px;
    background: #ffffff;
    border: 1px solid #e4e7ed;
    border-radius: 6px;
    font-size: 10.5px;
  }
  .vm-rolecards-scope .ui-portfolio-mark {
    width: 22px;
    height: 22px;
    border-radius: 5px;
    background: #0e1729;
    color: white;
    display: grid;
    place-items: center;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: -0.02em;
    flex-shrink: 0;
  }
  .vm-rolecards-scope .ui-portfolio-name {
    flex: 1;
    font-weight: 540;
    color: #1e2a44;
    letter-spacing: -0.005em;
  }
  .vm-rolecards-scope .ui-portfolio-trend {
    font-family: var(--font-jetbrains-mono), 'JetBrains Mono', ui-monospace, monospace;
    font-size: 9.5px;
    font-weight: 700;
    flex-shrink: 0;
  }
  .vm-rolecards-scope .ui-portfolio-trend.up   { color: #15803d; }
  .vm-rolecards-scope .ui-portfolio-trend.flat { color: #7a849a; }
  .vm-rolecards-scope .ui-portfolio-trend.down { color: #b91c4b; }

  /* DEAL FLOW (investors) */
  .vm-rolecards-scope .ui-dealflow { display: flex; flex-direction: column; gap: 4px; }
  .vm-rolecards-scope .ui-dealflow-row {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 9px;
    background: #ffffff;
    border: 1px solid #e4e7ed;
    border-radius: 6px;
    font-size: 10.5px;
  }
  .vm-rolecards-scope .ui-dealflow-rank {
    font-family: var(--font-jetbrains-mono), 'JetBrains Mono', ui-monospace, monospace;
    font-size: 10px;
    color: #7a849a;
    font-weight: 700;
    width: 14px;
    flex-shrink: 0;
  }
  .vm-rolecards-scope .ui-dealflow-name {
    flex: 1;
    color: #1e2a44;
    letter-spacing: -0.005em;
    font-weight: 540;
  }
  .vm-rolecards-scope .ui-dealflow-stage {
    font-family: var(--font-jetbrains-mono), 'JetBrains Mono', ui-monospace, monospace;
    font-size: 9px;
    padding: 1px 5px;
    border-radius: 3px;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    font-weight: 700;
    flex-shrink: 0;
    background: rgba(30,42,74,0.06);
    color: #1e2a4a;
  }

  /* FOOTER STATEMENT */
  .vm-rolecards-scope .roles-foot {
    margin-top: 56px;
    text-align: center;
    font-family: var(--font-jetbrains-mono), 'JetBrains Mono', ui-monospace, monospace;
    font-size: 11.5px;
    color: rgba(255,255,255,0.5);
    text-transform: uppercase;
    letter-spacing: 0.14em;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 14px;
  }
  .vm-rolecards-scope .roles-foot::before,
  .vm-rolecards-scope .roles-foot::after {
    content: '';
    width: 32px;
    height: 1px;
    background: rgba(255,255,255,0.18);
  }

  /* RESPONSIVE */
  @media (max-width: 900px) {
    .vm-rolecards-scope .cards-grid { grid-template-columns: 1fr; }
    .vm-rolecards-scope .role-tab   { padding: 14px 18px; font-size: 14px; }
  }

  @media (prefers-reduced-motion: reduce) {
    .vm-rolecards-scope .cards-grid,
    .vm-rolecards-scope .ui-brief-wave span,
    .vm-rolecards-scope .ui-draft .cursor,
    .vm-rolecards-scope .ui-preview-head .live-dot::before {
      animation: none !important;
    }
  }
`;

export function UseCases() {
  const searchParams = useSearchParams();
  const [active, setActive] = useState(0);
  const cards = TAB_CONTENT[active] ?? TAB_CONTENT[0]!;

  useEffect(() => {
    const key = (searchParams.get("usecase") || "").toLowerCase();
    const idxMap: Record<string, number> = {
      founders: 0,
      sales: 1,
      engineering: 2,
      support: 3,
      investors: 4,
    };
    const idx = idxMap[key];
    if (idx !== undefined) setActive(idx);
  }, [searchParams]);

  return (
    <section
      id="use-cases"
      className="vmx-halftone-usecases relative px-5 py-[120px] text-center md:px-8"
      style={{ background: "#000" }}
      data-nav-theme="dark"
    >

      <style dangerouslySetInnerHTML={{ __html: ROLECARDS_CSS }} />

      <div className="relative mx-auto">
        <div
          className="mx-auto mb-6 grid place-items-center"
          style={{ width: 64, height: 64 }}
          aria-hidden
        >
          <Image
            src="/VectorMail-New.png"
            alt=""
            width={64}
            height={64}
            className="object-contain"
            sizes="64px"
            style={{
              filter: "drop-shadow(0 6px 24px rgba(94,154,255,0.35))",
            }}
            unoptimized
            priority
          />
        </div>

        <h2
          className="mb-4"
          style={{
            fontSize: "clamp(36px, 4.5vw, 56px)",
            fontWeight: 600,
            letterSpacing: "-0.04em",
            lineHeight: 1.05,
            color: "#ffffff",
            fontFamily: "var(--vmx-sans)",
          }}
        >
          One inbox.
          <br />
          Five ways to use it.
        </h2>

        <p
          className="mx-auto mb-12 max-w-[460px]"
          style={{
            fontSize: 16,
            color: "rgba(255,255,255,0.6)",
          }}
        >
          The same client, tuned to the work in front of you.
        </p>

        <div className="vm-rolecards-scope">
          <nav className="role-tabs" role="tablist" aria-label="Roles">
            {TABS.map((label, i) => (
              <button
                key={label}
                type="button"
                role="tab"
                aria-selected={active === i}
                aria-controls={`role-cards-${i}`}
                onClick={() => setActive(i)}
                className={`role-tab${active === i ? " active" : ""}`}
              >
                {label}
              </button>
            ))}
          </nav>

          <div
            key={active}
            id={`role-cards-${active}`}
            className="cards-grid"
            role="tabpanel"
            aria-label={`${TABS[active]} cards`}
          >
            {cards.map((c) => (
              <article key={c.h} className="role-card">
                {c.preview}
                <div className="card-body">
                  <h3 className="card-title">{c.h}</h3>
                  <p className="card-desc">{c.p}</p>
                  <span className="card-tag">{c.tag}</span>
                </div>
              </article>
            ))}
          </div>

          <footer className="roles-foot">
            <span>Switch tabs to see the cards built for that role.</span>
          </footer>
        </div>
      </div>
    </section>
  );
}
