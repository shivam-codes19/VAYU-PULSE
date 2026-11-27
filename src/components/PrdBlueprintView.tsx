import React, { useMemo, useState } from 'react';
import { Check, Copy, Download, FileText, Search } from 'lucide-react';
import {
  exportPrdAsMarkdown,
  PRD_SECTIONS,
  TOP_10_PREDEV_DECISIONS,
} from '../data/prdContent';

export const PrdBlueprintView: React.FC = () => {
  const [query, setQuery] = useState('');
  const [activeId, setActiveId] = useState<string>('all');
  const [copied, setCopied] = useState(false);

  const filteredSections = useMemo(() => {
    const q = query.trim().toLowerCase();
    return PRD_SECTIONS.filter((sec) => {
      if (activeId !== 'all' && activeId !== 'decisions' && sec.id !== activeId) {
        return false;
      }
      if (!q) return true;
      const haystack = [
        sec.title,
        sec.summary,
        ...(sec.bullets ?? []),
        ...(sec.table?.rows.flat() ?? []),
        ...(sec.callouts?.map((c) => `${c.title} ${c.body}`) ?? []),
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [query, activeId]);

  const handleDownloadMarkdown = () => {
    const md = exportPrdAsMarkdown();
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Vayu_Pulse_PRD.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopyMarkdown = async () => {
    try {
      await navigator.clipboard.writeText(exportPrdAsMarkdown());
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // ignore
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[#111613] dark:text-[#F4F7F5]">
            Vayu Pulse — Build-Ready PRD (17 Sections + Top 10 Decisions)
          </h1>
          <p className="mt-1 text-sm text-[#58635B] dark:text-[#96A299]">
            Complete specification for engineering, design, clinical advisors, and GTM teams. Quantified assumptions explicitly flagged.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopyMarkdown}
            className="inline-flex items-center gap-1.5 rounded-full border border-[#CFD8D1] dark:border-[#363D38] px-4 py-2 text-xs font-medium text-[#151C17] dark:text-[#E5ECE7] hover:bg-[#EEF3EF] dark:hover:bg-[#232724] cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-[#88D46B]" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied Markdown' : 'Copy MD'}
          </button>
          <button
            type="button"
            onClick={handleDownloadMarkdown}
            className="inline-flex items-center gap-1.5 rounded-full bg-[#8AD66D] px-4 py-2 text-xs font-semibold text-[#0E160C] hover:bg-[#7CC85F] cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Download PRD (.md)
          </button>
        </div>
      </div>

      {/* Search & Section Filter Bar */}
      <div className="rounded-[20px] bg-white dark:bg-[#191B1A] border border-[#DFE6E1] dark:border-[#262A27] p-4 space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-[#738077] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <label htmlFor="prd-search" className="sr-only">
            Search PRD sections
          </label>
          <input
            id="prd-search"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search PRD requirements (e.g., NAQI, DPDP, CADR, red-teaming, WhatsApp, LCP, personas)..."
            className="w-full min-h-[42px] rounded-full bg-[#F3F6F4] dark:bg-[#111312] border border-[#D8E1DB] dark:border-[#2B302C] pl-10 pr-4 text-sm text-[#111613] dark:text-[#F4F7F5] placeholder:text-[#76837A] focus:outline-none focus:border-[#88D46B]"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setActiveId('all')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap shrink-0 cursor-pointer ${
              activeId === 'all'
                ? 'bg-[#8AD66D] text-[#0E160C]'
                : 'bg-[#EFF4F0] dark:bg-[#222623] text-[#434F47] dark:text-[#B4C0B7]'
            }`}
          >
            All 17 Sections
          </button>
          <button
            type="button"
            onClick={() => setActiveId('decisions')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap shrink-0 cursor-pointer ${
              activeId === 'decisions'
                ? 'bg-[#8AD66D] text-[#0E160C]'
                : 'bg-[#EFF4F0] dark:bg-[#222623] text-[#434F47] dark:text-[#B4C0B7]'
            }`}
          >
            Top 10 Pre-Dev Decisions
          </button>
          {PRD_SECTIONS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setActiveId(s.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap shrink-0 cursor-pointer ${
                activeId === s.id
                  ? 'bg-[#8AD66D] text-[#0E160C]'
                  : 'bg-[#EFF4F0] dark:bg-[#222623] text-[#434F47] dark:text-[#B4C0B7]'
              }`}
            >
              {s.number}. {s.title.split('&')[0].trim()}
            </button>
          ))}
        </div>
      </div>

      {/* Sections List */}
      {activeId !== 'decisions' && (
        <div className="space-y-5">
          {filteredSections.map((sec) => (
            <article
              key={sec.id}
              className="rounded-[22px] bg-white dark:bg-[#191B1A] border border-[#DFE6E1] dark:border-[#262A27] p-5 sm:p-6 space-y-4"
            >
              <div className="flex items-start gap-3">
                <span className="font-mono text-sm font-bold text-[#206B1C] dark:text-[#88D46B] mt-0.5">
                  {sec.number}.
                </span>
                <div>
                  <h2 className="text-lg font-semibold text-[#111613] dark:text-[#F4F7F5]">
                    {sec.title}
                  </h2>
                  <p className="mt-1 text-sm text-[#4A564E] dark:text-[#AAB7AE] leading-relaxed">
                    {sec.summary}
                  </p>
                </div>
              </div>

              {sec.bullets && (
                <ul className="space-y-2 text-sm text-[#2A342D] dark:text-[#CFDAD2] list-disc pl-6 leading-relaxed">
                  {sec.bullets.map((b, idx) => (
                    <li key={idx}>{b}</li>
                  ))}
                </ul>
              )}

              {sec.table && (
                <div className="overflow-x-auto rounded-2xl border border-[#E2E9E4] dark:border-[#262B27]">
                  <table className="w-full text-left border-collapse min-w-[600px] text-xs sm:text-sm">
                    <thead className="bg-[#F2F6F3] dark:bg-[#131514] text-[#4A564E] dark:text-[#9AA79E]">
                      <tr>
                        {sec.table.headers.map((h) => (
                          <th key={h} className="py-2.5 px-4 font-semibold border-b border-[#E2E9E4] dark:border-[#262B27]">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E9EFEA] dark:divide-[#232724]">
                      {sec.table.rows.map((row, rIdx) => (
                        <tr key={rIdx} className="align-top">
                          {row.map((cell, cIdx) => (
                            <td
                              key={cIdx}
                              className={`py-3 px-4 leading-relaxed ${
                                cIdx === 0
                                  ? 'font-medium text-[#111613] dark:text-[#F1F5F2] whitespace-nowrap'
                                  : 'text-[#37423B] dark:text-[#C5D1C8]'
                              }`}
                            >
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {sec.callouts && (
                <div className="space-y-3">
                  {sec.callouts.map((c) => (
                    <div
                      key={c.title}
                      className="rounded-2xl bg-[#F4F7F5] dark:bg-[#121413] border border-[#E2E9E4] dark:border-[#252A26] p-4 space-y-1.5"
                    >
                      <h3 className="text-xs font-semibold text-[#206B1C] dark:text-[#88D46B]">
                        {c.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-[#2A342D] dark:text-[#CFDAD2] whitespace-pre-line leading-relaxed">
                        {c.body}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </article>
          ))}
        </div>
      )}

      {/* Prioritized Top 10 Decisions Before Development Starts */}
      {(activeId === 'all' || activeId === 'decisions') && (
        <section className="rounded-[22px] bg-white dark:bg-[#191B1A] border border-[#DFE6E1] dark:border-[#262A27] p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#206B1C] dark:text-[#88D46B]" />
            <h2 className="text-lg font-semibold text-[#111613] dark:text-[#F4F7F5]">
              Prioritized Top 10 Decisions Before Development Starts
            </h2>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-[#E2E9E4] dark:border-[#262B27]">
            <table className="w-full text-left border-collapse min-w-[680px] text-xs sm:text-sm">
              <thead className="bg-[#F2F6F3] dark:bg-[#131514] text-[#4A564E] dark:text-[#9AA79E]">
                <tr>
                  <th className="py-2.5 px-3 font-semibold border-b border-[#E2E9E4] dark:border-[#262B27]">#</th>
                  <th className="py-2.5 px-4 font-semibold border-b border-[#E2E9E4] dark:border-[#262B27]">Decision</th>
                  <th className="py-2.5 px-4 font-semibold border-b border-[#E2E9E4] dark:border-[#262B27]">Options Considered</th>
                  <th className="py-2.5 px-4 font-semibold border-b border-[#E2E9E4] dark:border-[#262B27]">Recommended Direction</th>
                  <th className="py-2.5 px-4 font-semibold border-b border-[#E2E9E4] dark:border-[#262B27]">Owner</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E9EFEA] dark:divide-[#232724]">
                {TOP_10_PREDEV_DECISIONS.map((d) => (
                  <tr key={d.rank} className="align-top">
                    <td className="py-3 px-3 font-mono font-bold text-[#206B1C] dark:text-[#88D46B]">
                      {String(d.rank).padStart(2, '0')}
                    </td>
                    <td className="py-3 px-4 font-semibold text-[#111613] dark:text-[#F1F5F2]">
                      {d.decision}
                    </td>
                    <td className="py-3 px-4 text-[#4A564E] dark:text-[#A4B0A7]">{d.options}</td>
                    <td className="py-3 px-4 text-[#1E2721] dark:text-[#DCE6DF]">{d.recommended}</td>
                    <td className="py-3 px-4 font-mono text-xs whitespace-nowrap text-[#58635B] dark:text-[#96A299]">
                      {d.owner}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
};
