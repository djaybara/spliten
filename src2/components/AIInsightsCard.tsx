'use client';

import React, { useMemo } from 'react';
import {
  Bot,                             // ⬅️ ajouté
  Eye, Lightbulb, Link as LinkIcon, ShieldAlert,
  Layers, ThumbsUp, GitBranch, Scale, Thermometer, AlertTriangle
} from 'lucide-react';
import { faviconUrl, domainFromUrl } from '@/lib/utils/url';

type BaseInsights = {
  summary?: string; summaryLong?: string;
  missingAngles?: string; missingAnglesLong?: string;
  quality?: string; evidenceDensity?: number;
  keyTakeaways?: string[]; suggestedSources?: { url: string; label?: string }[];
  counterArguments?: string[]; argumentClusters?: { label: string; size: number }[];
  topConvincing?: { text: string; votes: number }[];
  authorityBalance?: { academic: number; media: number; other: number };
  argumentDiversity?: number; toneSentiment?: number; controversy?: number; reliabilityScore?: number;
};

export default function AIInsightsCard({
  ai, yesPercent, totalTopLevelArgs, questionSources,
  bodyColor = 'var(--text)',
}:{
  ai: BaseInsights | null | undefined;
  yesPercent: number;
  totalTopLevelArgs: number;
  questionSources: { url: string }[];
  bodyColor?: string;
}) {
  const M = useMemo(()=>{
    const baseSummary = ai?.summaryLong || ai?.summary ||
      'No summary yet. The AI will synthesize the strongest claims from both sides.';
    const longSummary = baseSummary.length < 240
      ? baseSummary + ' It highlights key evidence, recurring claims, blind spots, and trade-offs that could shift the conclusion if addressed.'
      : baseSummary;

    const baseMissing = ai?.missingAnglesLong || ai?.missingAngles ||
      'Potential gaps are not fully covered yet.';
    const longMissing = baseMissing.length < 200
      ? baseMissing + ' Consider longitudinal effects, subgroup heterogeneity, unintended consequences, implementation costs, and external validity vs. benchmarks.'
      : baseMissing;

    return {
      summary: longSummary,
      keyTakeaways: ai?.keyTakeaways ?? [
        'FOR: core benefits and use-cases.',
        'AGAINST: key risks and constraints.',
        'Areas of partial agreement and unresolved uncertainty.',
        'Short vs long-term outcomes to monitor.',
      ],
      topConvincing: ai?.topConvincing ?? [
        { text: 'Randomized trial X shows +25% improvement', votes: 42 },
        { text: 'Meta-analysis Y (n=120k) controls for bias Z', votes: 31 },
      ],
      missingAngles: longMissing,
      counterArguments: ai?.counterArguments ?? [
        'Ask for longitudinal data', 'Check subgroup effects', 'Probe edge cases in deployment'
      ],
      suggestedSources: ai?.suggestedSources ?? (questionSources || []).map(s => ({ url: s.url })),
      evidenceDensity: typeof ai?.evidenceDensity === 'number' ? ai!.evidenceDensity : Math.min(100, totalTopLevelArgs*8),
      cohesionScore: 65,
      argumentClusters: ai?.argumentClusters ?? [
        { label:'Economy', size:35 }, { label:'Health', size:25 }, { label:'Environment', size:20 }, { label:'Society', size:20 },
      ],
      authorityBalance: ai?.authorityBalance ?? { academic:30, media:50, other:20 },
      argumentDiversity: ai?.argumentDiversity ?? Math.min(100, totalTopLevelArgs*10),
      toneSentiment: ai?.toneSentiment ?? 50,
      controversy: ai?.controversy ?? (Math.abs(50-yesPercent) < 10 ? 70 : 40),
      reliabilityScore: ai?.reliabilityScore ?? 60,
      quality: ai?.quality ?? 'Mixed quality: combine academic and reputable media.',
    };
  },[ai, yesPercent, totalTopLevelArgs, questionSources]);

  const text = { color: bodyColor } as const;

  return (
    <div style={{
      background:'var(--card)', borderRadius:12, padding:16, border:'1px solid var(--border)',
      boxShadow:'0 1px 3px rgba(0,0,0,0.08)', backgroundImage:'linear-gradient(135deg, rgba(102,126,234,0.06) 0%, rgba(118,75,162,0.06) 100%)'
    }}>
      {/* ⬇️ Header avec tête de robot comme sur la Home */}
      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
        <Bot size={18} color="#667eea" />
        <h3 style={{ fontSize:16, fontWeight:800, color:'var(--text)' }}>AI Insights</h3>
      </div>

      {/* ordre par pertinence */}
      <Section title="Summary" Icon={Eye} color="#64748b">
        <p style={{ ...text, fontSize:12, lineHeight:1.6 }}>{M.summary}</p>
      </Section>

      <Section title="Key takeaways" Icon={Lightbulb} color="#22c55e">
        <div style={{ display:'grid', rowGap:6 }}>
          {M.keyTakeaways.map((t,i)=><div key={i} style={{ ...text, fontSize:12 }}>{t}</div>)}
        </div>
      </Section>

      <Section title="Top convincing arguments" Icon={ThumbsUp} color="#0ea5e9">
        <div style={{ display:'grid', rowGap:6 }}>
          {M.topConvincing.map((a,i)=>(
            <div key={i} style={{ ...text, fontSize:12 }}>
              <span style={{ fontWeight:700, marginRight:6 }}>+{a.votes}</span>{a.text}
            </div>
          ))}
        </div>
      </Section>

      <Section title="Missing angles" Icon={GitBranch} color="#a78bfa">
        <p style={{ ...text, fontSize:12, lineHeight:1.6 }}>{M.missingAngles}</p>
      </Section>

      <Section title="Counter-arguments to test" Icon={ThumbsUp} color="#14b8a6">
        <div style={{ display:'grid', rowGap:6 }}>
          {M.counterArguments.map((t,i)=><div key={i} style={{ ...text, fontSize:12 }}>{t}</div>)}
        </div>
      </Section>

      <Section title="Suggested sources" Icon={LinkIcon} color="#f59e0b">
        <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
          {M.suggestedSources.map((s,i)=>{
            const host = domainFromUrl(s.url);
            return (
              <a key={i} href={s.url} target="_blank" rel="noopener noreferrer" className="clickable"
                 style={{ ...text, fontSize:12, display:'inline-flex', alignItems:'center', gap:8, textDecoration:'none' }}>
                {/* On garde 16px visuel mais image retina (tu patches SourcePills aussi) */}
                <img src={faviconUrl(s.url,32)} width={16} height={16} alt="" style={{ borderRadius:4, display:'block' }} loading="lazy" decoding="async"/>
                <span>{s.label || host || s.url}</span>
              </a>
            );
          })}
        </div>
      </Section>

      <Section title="Evidence density" Icon={Layers} color="#06b6d4">
        <Metric label={`${Math.round(M.evidenceDensity)} refs/points`} color={bodyColor}/>
        <RatioBar value={M.evidenceDensity} left="Sparse" right="Rich"/>
      </Section>

      <Section title="Cohesion score" Icon={ThumbsUp} color="#10b981">
        <Metric label={`${M.cohesionScore}% of arguments in top 3 themes`} color={bodyColor}/>
        <RatioBar value={M.cohesionScore} left="Scattered" right="Focused"/>
      </Section>

      <Section title="Argument clusters" Icon={Layers} color="#8b5cf6">
        <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
          {M.argumentClusters.map((c,i)=>(
            <span key={i} style={{ ...text, fontSize:12, border:'1px solid var(--border)', background:'var(--pill)', padding:'4px 8px', borderRadius:999 }}>
              {c.label} • {c.size}%
            </span>
          ))}
        </div>
      </Section>

      <Section title="Authority balance" Icon={Scale} color="#f97316">
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8, fontSize:12 }}>
          {[
            { label:'Academic', val:(ai?.authorityBalance?.academic ?? 30) },
            { label:'Media',    val:(ai?.authorityBalance?.media ?? 50) },
            { label:'Other',    val:(ai?.authorityBalance?.other ?? 20) },
          ].map((x,i)=>(
            <div key={i} style={text}>
              <div style={{ fontWeight:700, marginBottom:4 }}>{x.label} {x.val}%</div>
              <div style={{ height:8, background:'var(--chip)', border:'1px solid var(--border)', borderRadius:999, overflow:'hidden' }}>
                <div style={{ width:`${x.val}%`, height:'100%', background:'linear-gradient(90deg, #667eea, #764ba2)' }}/>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Argument diversity" Icon={Layers} color="#0ea5e9">
        <RatioBar value={M.argumentDiversity} left="Narrow" right="Wide"/>
      </Section>

      <Section title="Tone sentiment" Icon={Thermometer} color="#eab308">
        <RatioBar value={M.toneSentiment} left="Negative" right="Positive"/>
      </Section>

      <Section title="Controversy" Icon={AlertTriangle} color="#f43f5e">
        <RatioBar value={M.controversy} left="Low" right="High"/>
      </Section>

      <Section title="Reliability score" Icon={ShieldAlert} color="#22c55e">
        <RatioBar value={M.reliabilityScore} left="Low" right="High"/>
      </Section>

      <Section title="Quality" Icon={ShieldAlert} color="#94a3b8">
        <p style={{ ...text, fontSize:12 }}>{String(ai?.quality ?? 'Mixed')}</p>
      </Section>
    </div>
  );
}

/* === UI helpers === */

function Section({ title, Icon, color, children }:{
  title:string; Icon:any; color:string; children:React.ReactNode;
}) {
  return (
    <div style={{ marginTop:12 }}>
      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
        <Icon size={16} color={color}/>
        <span style={{ fontSize:13, fontWeight:800, color:'var(--text)' }}>{title}</span>
      </div>
      <div style={{ marginTop:6 }}>
        {children}
      </div>
    </div>
  );
}

function Metric({ label, color='var(--text)' }:{ label:string; color?:string }) {
  return <div style={{ fontSize:12, fontWeight:700, color, marginBottom:6 }}>{label}</div>;
}

function RatioBar({ value, left, right }:{ value:number; left?:string; right?:string }) {
  const v = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, color:'var(--text)', marginBottom:4 }}>
        <span>{left ?? '0%'}</span><span>{right ?? '100%'}</span>
      </div>
      <div style={{ height:8, background:'var(--chip)', border:'1px solid var(--border)', borderRadius:999, overflow:'hidden' }}>
        <div style={{ width:`${v}%`, height:'100%', background:'linear-gradient(90deg, #667eea, #764ba2)' }}/>
      </div>
    </div>
  );
}
