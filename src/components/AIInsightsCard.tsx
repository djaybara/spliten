'use client';

import React, { useEffect, useState } from 'react';
import { Bot, Eye, Lightbulb, ThumbsUp, GitBranch, AlertTriangle, Scale, HelpCircle, Zap, CheckCircle, TrendingUp, Users, MessageSquare, Database, ChevronDown, ChevronUp } from 'lucide-react';
import { insightsTranslations, type Language } from '@/lib/i18n/insights';

type AIInsights = {
  summary?: string;
  keyTakeaways?: string[];
  topArguments?: {
    pour?: string[];
    contre?: string[];
  };
  missingAngles?: string[];
  biases?: string[];
  
  // Sprint 1
  counterArgumentsToTest?: string[];
  factCheckCues?: string[];
  plainLanguageVerdict?: string;
  verdictChangers?: string[];
  
  // Sprint 2 - Scores
  scores?: {
    evidenceDensity: number;
    argumentDiversity: number;
    controversyLevel: number;
    reliability: number;
  };
  toneSentiment?: 'neutral' | 'positive' | 'negative';
  debateMaturity?: 'early' | 'developing' | 'mature';
  consensusLikelihood?: 'low' | 'medium' | 'high';
  
  // Sprint 3 - Advanced
  riskBenefitMap?: {
    risks: string[];
    benefits: string[];
  };
  stakeholders?: string[];
  relatedQuestions?: string[];
  dataGaps?: string[];
};

export default function AIInsightsCard({
  questionId,
  questionSlug,
  yesPercent,
  totalTopLevelArgs,
  questionSources,
  bodyColor = 'var(--muted)',
  lang = 'en',
}: {
  questionId?: string;
  questionSlug?: string;
  yesPercent: number;
  totalTopLevelArgs: number;
  questionSources: { url: string }[];
  bodyColor?: string;
  lang?: Language;
}) {
  const [insights, setInsights] = useState<AIInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // État des sections collapsibles (ouvertes par défaut sauf sur mobile)
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    summary: true,
    verdict: true,
    scores: true,
    keyTakeaways: false, // Replié sur mobile
    topArguments: false,
    counterArguments: false,
    factCheck: false,
    verdictChangers: false,
    riskBenefit: false,
    stakeholders: false,
    relatedQuestions: false,
    dataGaps: false,
    missingAngles: false,
    biases: false,
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const t = insightsTranslations[lang];

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        setLoading(true);
        const param = questionSlug ? `slug=${questionSlug}` : `questionId=${questionId}`;
        const res = await fetch(`/api/ai/insights?${param}`);
        const data = await res.json();

        if (!res.ok) throw new Error(data.error || 'API Error');

        setInsights(data.insights);
        setError(null);
      } catch (err: any) {
        console.error('Insights loading error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (questionId || questionSlug) {
      fetchInsights();
    }
  }, [questionId, questionSlug]);

  const text = { color: bodyColor } as const;

  if (loading) {
    return (
      <div style={{
        background: 'var(--card)', borderRadius: 12, padding: 16, border: '1px solid var(--border)',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <Bot size={18} color="#667eea" />
          <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text)' }}>{t.title}</h3>
        </div>
        <div style={{ fontSize: 13, color: 'var(--muted)' }}>{t.loading}</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        background: 'var(--card)', borderRadius: 12, padding: 16, border: '1px solid var(--border)',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <Bot size={18} color="#ef4444" />
          <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text)' }}>{t.title}</h3>
        </div>
        <div style={{ fontSize: 13, color: '#ef4444' }}>{t.error}: {error}</div>
      </div>
    );
  }

  if (!insights) return null;

  return (
    <div style={{
      background: 'var(--card)', borderRadius: 12, padding: 16, border: '1px solid var(--border)',
      boxShadow: '0 1px 3px rgba(0,0,0,0.08)', 
      backgroundImage: 'linear-gradient(135deg, rgba(102,126,234,0.06) 0%, rgba(118,75,162,0.06) 100%)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <Bot size={18} color="#667eea" />
        <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text)' }}>{t.title}</h3>
      </div>

      {/* Summary */}
      {insights.summary && (
        <Section title={t.summary} Icon={Eye} color="#64748b">
          <p style={{ ...text, fontSize: 12, lineHeight: 1.6 }}>{insights.summary}</p>
        </Section>
      )}

      {/* Plain Language Verdict - NOUVEAU */}
      {insights.plainLanguageVerdict && (
        <Section title={t.plainLanguageVerdict} Icon={Scale} color="#0ea5e9" help={t.verdictHelp}>
          <div style={{
            background: 'rgba(14, 165, 233, 0.1)',
            border: '2px solid rgba(14, 165, 233, 0.3)',
            borderRadius: 8,
            padding: 12,
            marginTop: 6
          }}>
            <p style={{ ...text, fontSize: 12, lineHeight: 1.6, fontWeight: 600 }}>
              {insights.plainLanguageVerdict}
            </p>
          </div>
        </Section>
      )}

      {/* Debate Quality Metrics - SPRINT 2 */}
      {insights.scores && (
        <div style={{ marginTop: 16, padding: 12, background: 'rgba(102, 126, 234, 0.08)', borderRadius: 8, border: '1px solid rgba(102, 126, 234, 0.2)' }}>
          <h4 style={{ fontSize: 13, fontWeight: 800, color: 'var(--text)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
            📊 {t.debateQuality}
          </h4>
          
          <div style={{ display: 'grid', gap: 10 }}>
            <ScoreBar label={t.evidenceDensity} score={insights.scores.evidenceDensity} color="#22c55e" />
            <ScoreBar label={t.argumentDiversity} score={insights.scores.argumentDiversity} color="#0ea5e9" />
            <ScoreBar label={t.controversyLevel} score={insights.scores.controversyLevel} color="#f97316" />
            <ScoreBar label={t.reliability} score={insights.scores.reliability} color="#8b5cf6" />
          </div>

          {/* Qualitative metrics */}
          <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid rgba(102, 126, 234, 0.2)', display: 'grid', gap: 8 }}>
            {insights.toneSentiment && (
              <QualitativeMetric 
                label={t.toneSentiment} 
                value={t[insights.toneSentiment]} 
                emoji={insights.toneSentiment === 'positive' ? '😊' : insights.toneSentiment === 'negative' ? '😠' : '😐'}
              />
            )}
            {insights.debateMaturity && (
              <QualitativeMetric 
                label={t.debateMaturity} 
                value={t[insights.debateMaturity]}
                emoji={insights.debateMaturity === 'mature' ? '🎓' : insights.debateMaturity === 'developing' ? '📚' : '🌱'}
              />
            )}
            {insights.consensusLikelihood && (
              <QualitativeMetric 
                label={t.consensusLikelihood} 
                value={t[insights.consensusLikelihood]}
                emoji={insights.consensusLikelihood === 'high' ? '🤝' : insights.consensusLikelihood === 'medium' ? '🤔' : '💥'}
              />
            )}
          </div>
        </div>
      )}

      {/* Key Takeaways */}
      {insights.keyTakeaways && insights.keyTakeaways.length > 0 && (
        <Section 
          title={t.keyTakeaways} 
          Icon={Lightbulb} 
          color="#22c55e"
          collapsible
          isExpanded={expandedSections.keyTakeaways}
          onToggle={() => toggleSection('keyTakeaways')}
          sectionKey="keyTakeaways"
        >
          <div style={{ display: 'grid', rowGap: 6 }}>
            {insights.keyTakeaways.map((item, i) => (
              <div key={i} style={{ ...text, fontSize: 12 }}>• {item}</div>
            ))}
          </div>
        </Section>
      )}

      {/* Top Arguments */}
      {insights.topArguments && (
        <Section 
          title={t.topArguments} 
          Icon={ThumbsUp} 
          color="#0ea5e9"
          collapsible
          isExpanded={expandedSections.topArguments}
          onToggle={() => toggleSection('topArguments')}
          sectionKey="topArguments"
        >
          {insights.topArguments.pour && insights.topArguments.pour.length > 0 && (
            <div style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: '#22c55e', marginBottom: 4 }}>{t.pour}:</div>
              {insights.topArguments.pour.map((a, i) => (
                <div key={i} style={{ ...text, fontSize: 12, marginBottom: 3 }}>• {a}</div>
              ))}
            </div>
          )}
          {insights.topArguments.contre && insights.topArguments.contre.length > 0 && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 800, color: '#ef4444', marginBottom: 4 }}>{t.contre}:</div>
              {insights.topArguments.contre.map((a, i) => (
                <div key={i} style={{ ...text, fontSize: 12, marginBottom: 3 }}>• {a}</div>
              ))}
            </div>
          )}
        </Section>
      )}

      {/* Counter-Arguments to Test - NOUVEAU */}
      {insights.counterArgumentsToTest && insights.counterArgumentsToTest.length > 0 && (
        <Section title={t.counterArgumentsToTest} Icon={GitBranch} color="#f97316" help={t.counterArgumentsHelp}>
          <div style={{ display: 'grid', rowGap: 6 }}>
            {insights.counterArgumentsToTest.map((item, i) => (
              <div key={i} style={{ ...text, fontSize: 12, display: 'flex', gap: 6 }}>
                <span style={{ color: '#f97316', fontWeight: 'bold' }}>→</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Fact-Check Cues - NOUVEAU */}
      {insights.factCheckCues && insights.factCheckCues.length > 0 && (
        <Section title={t.factCheckCues} Icon={CheckCircle} color="#eab308" help={t.factCheckHelp}>
          <div style={{ display: 'grid', rowGap: 6 }}>
            {insights.factCheckCues.map((item, i) => (
              <div key={i} style={{
                ...text,
                fontSize: 12,
                background: 'rgba(234, 179, 8, 0.1)',
                border: '1px solid rgba(234, 179, 8, 0.3)',
                borderLeft: '3px solid #eab308',
                borderRadius: 6,
                padding: 8
              }}>
                {item}
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Verdict Changers - NOUVEAU */}
      {insights.verdictChangers && insights.verdictChangers.length > 0 && (
        <Section title={t.verdictChangers} Icon={Zap} color="#8b5cf6" help={t.verdictChangersHelp}>
          <div style={{ display: 'grid', rowGap: 6 }}>
            {insights.verdictChangers.map((item, i) => (
              <div key={i} style={{ ...text, fontSize: 12, display: 'flex', gap: 6 }}>
                <span style={{ color: '#8b5cf6', fontWeight: 'bold' }}>⚡</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Risk/Benefit Map - SPRINT 3 */}
      {insights.riskBenefitMap && (insights.riskBenefitMap.risks.length > 0 || insights.riskBenefitMap.benefits.length > 0) && (
        <Section title={t.riskBenefitMap} Icon={TrendingUp} color="#06b6d4" help={t.riskBenefitHelp}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 6 }}>
            {insights.riskBenefitMap.risks.length > 0 && (
              <div style={{ 
                background: 'rgba(239, 68, 68, 0.08)', 
                border: '1px solid rgba(239, 68, 68, 0.2)',
                borderRadius: 8,
                padding: 10
              }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: '#ef4444', marginBottom: 6 }}>
                  ⚠️ {t.risks}
                </div>
                <div style={{ display: 'grid', rowGap: 4 }}>
                  {insights.riskBenefitMap.risks.map((risk, i) => (
                    <div key={i} style={{ ...text, fontSize: 11 }}>• {risk}</div>
                  ))}
                </div>
              </div>
            )}
            {insights.riskBenefitMap.benefits.length > 0 && (
              <div style={{ 
                background: 'rgba(34, 197, 94, 0.08)', 
                border: '1px solid rgba(34, 197, 94, 0.2)',
                borderRadius: 8,
                padding: 10
              }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: '#22c55e', marginBottom: 6 }}>
                  ✅ {t.benefits}
                </div>
                <div style={{ display: 'grid', rowGap: 4 }}>
                  {insights.riskBenefitMap.benefits.map((benefit, i) => (
                    <div key={i} style={{ ...text, fontSize: 11 }}>• {benefit}</div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Section>
      )}

      {/* Stakeholders - SPRINT 3 */}
      {insights.stakeholders && insights.stakeholders.length > 0 && (
        <Section title={t.stakeholders} Icon={Users} color="#ec4899" help={t.stakeholdersHelp}>
          <div style={{ display: 'grid', rowGap: 6 }}>
            {insights.stakeholders.map((stakeholder, i) => (
              <div key={i} style={{ ...text, fontSize: 12, display: 'flex', gap: 6 }}>
                <span style={{ color: '#ec4899' }}>👥</span>
                <span>{stakeholder}</span>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Related Questions - SPRINT 3 */}
      {insights.relatedQuestions && insights.relatedQuestions.length > 0 && (
        <Section title={t.relatedQuestions} Icon={MessageSquare} color="#14b8a6" help={t.relatedQuestionsHelp}>
          <div style={{ display: 'grid', rowGap: 6 }}>
            {insights.relatedQuestions.map((question, i) => (
              <div key={i} style={{ 
                ...text, 
                fontSize: 12, 
                background: 'rgba(20, 184, 166, 0.08)',
                padding: 8,
                borderRadius: 6,
                borderLeft: '3px solid #14b8a6'
              }}>
                💭 {question}
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Data Gaps - SPRINT 3 */}
      {insights.dataGaps && insights.dataGaps.length > 0 && (
        <Section title={t.dataGaps} Icon={Database} color="#f59e0b" help={t.dataGapsHelp}>
          <div style={{ display: 'grid', rowGap: 6 }}>
            {insights.dataGaps.map((gap, i) => (
              <div key={i} style={{ ...text, fontSize: 12, display: 'flex', gap: 6 }}>
                <span style={{ color: '#f59e0b', fontWeight: 'bold' }}>🔍</span>
                <span>{gap}</span>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Missing Angles */}
      {insights.missingAngles && insights.missingAngles.length > 0 && (
        <Section title={t.missingAngles} Icon={GitBranch} color="#a78bfa">
          <div style={{ display: 'grid', rowGap: 6 }}>
            {insights.missingAngles.map((item, i) => (
              <div key={i} style={{ ...text, fontSize: 12 }}>• {item}</div>
            ))}
          </div>
        </Section>
      )}

      {/* Biases */}
      {insights.biases && insights.biases.length > 0 && (
        <Section title={t.biases} Icon={AlertTriangle} color="#f59e0b">
          <div style={{ display: 'grid', rowGap: 6 }}>
            {insights.biases.map((item, i) => (
              <div key={i} style={{ ...text, fontSize: 12, display: 'flex', gap: 6 }}>
                <span style={{ color: '#f59e0b' }}>⚠</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </Section>
      )}
    </div>
  );
}

function Section({ 
  title, 
  Icon, 
  color, 
  help,
  children 
}: {
  title: string; 
  Icon: any; 
  color: string; 
  help?: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginTop: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
        <Icon size={16} color={color} />
        <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text)' }}>{title}</span>
        {help && (
          <div style={{ position: 'relative', display: 'inline-block' }} title={help}>
            <HelpCircle size={14} color="var(--muted)" style={{ cursor: 'help' }} />
          </div>
        )}
      </div>
      <div>{children}</div>
    </div>
  );
}

function ScoreBar({ label, score, color }: { label: string; score: number; color: string }) {
  const percentage = (score / 10) * 100;
  
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text)' }}>{label}</span>
        <span style={{ fontSize: 11, fontWeight: 800, color }}>{score}/10</span>
      </div>
      <div style={{ 
        height: 8, 
        background: 'rgba(0,0,0,0.1)', 
        borderRadius: 4, 
        overflow: 'hidden',
        position: 'relative'
      }}>
        <div style={{ 
          height: '100%', 
          width: `${percentage}%`, 
          background: color,
          transition: 'width 0.3s ease',
          borderRadius: 4
        }} />
      </div>
    </div>
  );
}

function QualitativeMetric({ label, value, emoji }: { label: string; value: string; emoji: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)' }}>{label}:</span>
      <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)' }}>
        {emoji} {value}
      </span>
    </div>
  );
}