import React, { useState } from 'react';
import { BookOpen, Copy, Check, FileCode, ChevronRight } from 'lucide-react';
import { ARCHITECTURE_SPEC_SECTIONS } from '../data/architecture-spec';
import { SUPABASE_SQL_SCHEMA } from '../data/sql-schema';

export const TechnicalWhitepaperView: React.FC = () => {
  const [activeSectionId, setActiveSectionId] = useState(ARCHITECTURE_SPEC_SECTIONS[0].id);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Editorial Title */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 mb-2">
          <span>DOSSIER D'INGÉNIERIE LOGICIELLE</span>
          <span aria-hidden="true">·</span>
          <span>SPÉCIFICATIONS COMPLÈTES</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white text-balance">
          Documentation Technique et Fonctionnelle Exhaustive
        </h1>
        <p className="mt-2 text-sm sm:text-base text-slate-400 max-w-4xl leading-relaxed">
          Synthèse intégrale structurée en 4 volets : Architecture globale micro-services et sécurité C#/.NET 8,
          spécification chirurgicale des scripts de réparation (DISM, SFC, ReTrim, WinSxS), schéma relationnel
          Supabase PostgreSQL avec politiques RLS et structure du rapport PDF.
        </p>
      </div>

      {/* Chapter Index & Full Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Table of Contents Navigation */}
        <div className="space-y-2 lg:sticky lg:top-24 h-fit">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-2 block mb-3">
            Sommaire du Dossier
          </span>
          {ARCHITECTURE_SPEC_SECTIONS.map((sec) => (
            <button
              key={sec.id}
              onClick={() => setActiveSectionId(sec.id)}
              className={`w-full text-left px-3.5 py-3 rounded-lg text-xs font-medium transition-all flex items-start gap-2.5 cursor-pointer ${
                activeSectionId === sec.id
                  ? 'bg-slate-800 text-cyan-400 border border-slate-700 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <span className="font-mono text-cyan-500 font-bold shrink-0">{sec.number}.</span>
              <span className="leading-snug">{sec.title}</span>
            </button>
          ))}
        </div>

        {/* Content Body */}
        <div className="lg:col-span-3 space-y-8">
          {ARCHITECTURE_SPEC_SECTIONS.filter((s) => s.id === activeSectionId).map((sec) => (
            <div key={sec.id} className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8 space-y-6">
              <div className="border-b border-slate-800 pb-4">
                <span className="text-xs font-mono font-bold text-cyan-400">
                  SECTION {sec.number}
                </span>
                <h2 className="text-xl font-bold text-white mt-1">{sec.title}</h2>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  {sec.summary}
                </p>
              </div>

              {/* Prose Content */}
              <div className="prose prose-invert max-w-none text-xs sm:text-sm text-slate-300 leading-relaxed space-y-4">
                {sec.content.split('\n\n').map((paragraph, pIdx) => {
                  if (paragraph.startsWith('### ')) {
                    return (
                      <h3 key={pIdx} className="text-base font-bold text-white pt-4 pb-1 border-b border-slate-800/60">
                        {paragraph.replace('### ', '')}
                      </h3>
                    );
                  }
                  if (paragraph.startsWith('---')) {
                    return <hr key={pIdx} className="border-slate-800 my-4" />;
                  }
                  return (
                    <p key={pIdx} className="text-slate-300 leading-relaxed">
                      {paragraph}
                    </p>
                  );
                })}
              </div>

              {/* Attached Code Snippets */}
              {sec.codeSnippets.length > 0 && (
                <div className="space-y-4 pt-4 border-t border-slate-800">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
                    Implémentation de Référence & Code Source
                  </span>

                  {sec.codeSnippets.map((snippet, sIdx) => (
                    <div key={sIdx} className="rounded-lg border border-slate-800 bg-slate-950 overflow-hidden">
                      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/90 border-b border-slate-800">
                        <span className="text-xs font-mono text-cyan-300 font-medium">
                          {snippet.title} ({snippet.language})
                        </span>
                        <button
                          onClick={() => handleCopy(`${sec.id}-${sIdx}`, snippet.code)}
                          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
                        >
                          {copiedId === `${sec.id}-${sIdx}` ? (
                            <Check className="h-3.5 w-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                          <span>{copiedId === `${sec.id}-${sIdx}` ? 'Copié !' : 'Copier'}</span>
                        </button>
                      </div>
                      <div className="p-4 overflow-x-auto max-h-[400px] overflow-y-auto">
                        <pre className="font-mono text-xs text-slate-300 leading-relaxed">
                          <code>{snippet.code}</code>
                        </pre>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
