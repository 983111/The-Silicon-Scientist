import React, { useState, useCallback } from 'react';
import { getWorkerUrl } from '../App';


interface Paper {
  id: string;
  title: string;
  authors: string[];
  abstract: string;
  categories: string[];
  published: string;
  link: string;
  arxivId: string;
}

const DOMAIN_PRESETS = [
  { label: 'Machine Learning', query: 'machine learning deep learning neural networks' },
  { label: 'Computer Vision', query: 'computer vision image recognition' },
  { label: 'NLP / LLMs', query: 'large language models natural language processing' },
  { label: 'Quantum Computing', query: 'quantum computing algorithms' },
  { label: 'Bioinformatics', query: 'bioinformatics genomics protein structure' },
  { label: 'Robotics', query: 'robotics reinforcement learning control' },
  { label: 'Climate Science', query: 'climate change modeling atmospheric' },
  { label: 'Drug Discovery', query: 'drug discovery molecular docking' },
];

function parseArxivFeed(xml: string): Paper[] {
  const cleanXml = xml.replace(/xmlns=".*?"/g, '');
  const parser = new DOMParser();
  const doc = parser.parseFromString(cleanXml, 'application/xml');
  const entries = Array.from(doc.querySelectorAll('entry'));

  return entries.map((entry) => {
    const id = entry.querySelector('id')?.textContent?.trim() ?? '';
    const arxivId = id.split('/abs/').pop()?.replace('v1', '') ?? id;
    const title = entry.querySelector('title')?.textContent?.trim().replace(/\s+/g, ' ') ?? 'Untitled';
    const abstract = entry.querySelector('summary')?.textContent?.trim().replace(/\s+/g, ' ') ?? '';
    const published = entry.querySelector('published')?.textContent?.slice(0, 10) ?? '';
    const authors = Array.from(entry.querySelectorAll('author name')).map(n => n.textContent?.trim() ?? '');
    const categories = Array.from(entry.querySelectorAll('category')).map(c => c.getAttribute('term') ?? '');
    const link = `https://arxiv.org/abs/${arxivId}`;
    return { id: arxivId, title, authors, abstract, categories, published, link, arxivId };
  });
}

interface ScriptsViewProps {
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export function ScriptsView({ showToast }: ScriptsViewProps) {
  const [query, setQuery] = useState('');
  const [papers, setPapers] = useState<Paper[]>([]);
  const [selectedPaper, setSelectedPaper] = useState<Paper | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activePreset, setActivePreset] = useState<number | null>(null);
  const [searched, setSearched] = useState(false);

  const doSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    setError('');
    setPapers([]);
    setSelectedPaper(null);
    setSearched(true);
    try {
      const encoded = encodeURIComponent(searchQuery.trim());
      const url = `${getWorkerUrl()}/api/arxiv?q=${encoded}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`ArXiv API returned ${res.status}`);
      const xml = await res.text();
      const parsed = parseArxivFeed(xml);
      setPapers(parsed);
      if (parsed.length === 0) setError('No papers found. Try different keywords.');
      else if (parsed.length > 0) setSelectedPaper(parsed[0]);
    } catch (e: any) {
      setError(`Search failed: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  const handlePreset = (idx: number) => {
    setActivePreset(idx);
    const q = DOMAIN_PRESETS[idx].query;
    setQuery(q);
    doSearch(q);
  };

  const handleLaunch = () => {
    if (!selectedPaper) return;
    const problem = `Investigate the research problem described in: "${selectedPaper.title}". Based on the abstract: ${selectedPaper.abstract.slice(0, 400)}`;
    const objectives = `- Reproduce or extend a key insight from this paper\n- Validate core claims with computational experiments\n- Generate a visual artifact summarizing findings`;
    window.dispatchEvent(new CustomEvent('silicon:open-modal-prefill', {
      detail: { problem, objectives }
    }));
    window.dispatchEvent(new CustomEvent('silicon:open-modal'));
    showToast(`Paper loaded into experiment launcher`, 'success');
  };

  const getCategoryColor = (cat: string) => {
    if (cat.startsWith('cs.')) return { bg: 'var(--slate-light)', color: 'var(--accent-slate)' };
    if (cat.startsWith('q-bio') || cat.startsWith('bio')) return { bg: 'var(--sage-light)', color: 'var(--accent-sage)' };
    if (cat.startsWith('quant') || cat.startsWith('hep') || cat.startsWith('cond')) return { bg: 'var(--gold-light)', color: 'var(--accent-gold)' };
    return { bg: 'var(--accent-light)', color: 'var(--accent)' };
  };

  return (
    <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '340px 1fr', overflow: 'hidden', height: '100%' }}>
      {/* Left Panel - Search + List */}
      <div style={{ borderRight: '1px solid var(--rule)', display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--white)' }}>
        {/* Header */}
        <div style={{ padding: '18px 18px 14px', borderBottom: '1px solid var(--rule)', flexShrink: 0 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, margin: '0 0 4px', color: 'var(--ink)' }}>
            Research Browser
          </h2>
          <p style={{ fontSize: 12, color: 'var(--ink-muted)', margin: '0 0 14px', lineHeight: 1.4 }}>
            Search live ArXiv papers and launch experiments directly from research
          </p>

          {/* Search bar */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
            <input
              className="input-field"
              placeholder="Search ArXiv: topic, keyword, author..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && doSearch(query)}
              style={{ flex: 1, fontSize: 13 }}
            />
            <button
              className="btn-primary"
              onClick={() => doSearch(query)}
              disabled={loading}
              style={{ padding: '8px 14px', fontSize: 13 }}
            >
              {loading ? <span className="spin" style={{ display: 'inline-block' }}>◌</span> : 'Search'}
            </button>
          </div>

          {/* Domain presets */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {DOMAIN_PRESETS.map((p, i) => (
              <button
                key={i}
                onClick={() => handlePreset(i)}
                style={{
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-sm)',
                  border: `1.5px solid ${activePreset === i ? 'var(--accent)' : 'var(--rule)'}`,
                  background: activePreset === i ? 'var(--accent-light)' : 'var(--paper)',
                  color: activePreset === i ? 'var(--accent)' : 'var(--ink-muted)',
                  fontSize: 11.5,
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  fontFamily: 'var(--font-body)',
                }}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Results list */}
        <div className="scroll-area" style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
          {!searched && !loading && (
            <div style={{ padding: '32px 16px', textAlign: 'center' }}>
              <div style={{ fontSize: 13, color: 'var(--ink-muted)', lineHeight: 1.6 }}>
                Search by topic or select a domain preset to browse the latest scientific papers from ArXiv.
              </div>
            </div>
          )}

          {loading && (
            <div style={{ padding: '24px 16px' }}>
              {[...Array(5)].map((_, i) => (
                <div key={i} style={{ marginBottom: 12, borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                  <div className="shimmer" style={{ height: 16, width: '70%', borderRadius: 4, marginBottom: 6 }} />
                  <div className="shimmer" style={{ height: 12, width: '50%', borderRadius: 4, marginBottom: 6 }} />
                  <div className="shimmer" style={{ height: 10, width: '90%', borderRadius: 4 }} />
                </div>
              ))}
            </div>
          )}

          {error && (
            <div style={{ padding: '16px', margin: '12px 8px', background: 'var(--accent-light)', borderRadius: 'var(--radius-md)', fontSize: 13, color: 'var(--accent)' }}>
              {error}
            </div>
          )}

          {papers.map(paper => (
            <button
              key={paper.id}
              onClick={() => setSelectedPaper(paper)}
              style={{
                width: '100%', textAlign: 'left',
                padding: '12px 14px',
                borderRadius: 'var(--radius-md)',
                border: selectedPaper?.id === paper.id ? '1.5px solid var(--accent)' : '1.5px solid transparent',
                background: selectedPaper?.id === paper.id ? 'var(--accent-light)' : 'transparent',
                cursor: 'pointer',
                marginBottom: 4,
                transition: 'all 0.15s',
              }}
            >
              <div style={{ fontWeight: 600, fontSize: 13, color: selectedPaper?.id === paper.id ? 'var(--accent)' : 'var(--ink)', lineHeight: 1.4, marginBottom: 5 }}>
                {paper.title.length > 80 ? paper.title.slice(0, 80) + '…' : paper.title}
              </div>
              <div style={{ fontSize: 11, color: 'var(--ink-muted)', marginBottom: 5 }}>
                {paper.authors.slice(0, 3).join(', ')}{paper.authors.length > 3 ? ' +' + (paper.authors.length - 3) + ' more' : ''}
              </div>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                {paper.categories.slice(0, 2).map((cat, i) => {
                  const style = getCategoryColor(cat);
                  return (
                    <span key={i} style={{ fontSize: 10, padding: '1px 6px', borderRadius: 'var(--radius-xs)', background: style.bg, color: style.color, fontWeight: 700, textTransform: 'uppercase' }}>
                      {cat}
                    </span>
                  );
                })}
                <span style={{ fontSize: 10.5, color: 'var(--ink-muted)', marginLeft: 'auto' }}>{paper.published}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Right Panel - Paper Detail */}
      <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--off-white)' }}>
        {!selectedPaper ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 48 }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: 'var(--ink-muted)', marginBottom: 8 }}>No paper selected</h3>
            <p style={{ fontSize: 13, color: 'var(--ink-muted)', textAlign: 'center', lineHeight: 1.6 }}>
              Search for papers on the left and select one to read the abstract and launch a research experiment.
            </p>
          </div>
        ) : (
          <>
            {/* Paper Header */}
            <div style={{ padding: '20px 24px 16px', background: 'var(--white)', borderBottom: '1px solid var(--rule)', flexShrink: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: 'var(--ink)', margin: '0 0 6px', lineHeight: 1.4 }}>
                    {selectedPaper.title}
                  </h2>
                  <div style={{ fontSize: 12, color: 'var(--ink-muted)', marginBottom: 8 }}>
                    {selectedPaper.authors.slice(0, 5).join(', ')}{selectedPaper.authors.length > 5 ? ` + ${selectedPaper.authors.length - 5} more` : ''}
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                    {selectedPaper.categories.slice(0, 4).map((cat, i) => {
                      const style = getCategoryColor(cat);
                      return (
                        <span key={i} style={{ fontSize: 10, padding: '2px 8px', borderRadius: 'var(--radius-xs)', background: style.bg, color: style.color, fontWeight: 700, textTransform: 'uppercase' }}>
                          {cat}
                        </span>
                      );
                    })}
                    <span style={{ fontSize: 11, color: 'var(--ink-muted)', fontFamily: 'var(--font-mono)' }}>
                      {selectedPaper.published}
                    </span>
                    <span style={{ fontSize: 11, color: 'var(--ink-muted)', fontFamily: 'var(--font-mono)' }}>
                      arXiv:{selectedPaper.arxivId}
                    </span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                  <a
                    href={selectedPaper.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-ghost"
                    style={{ fontSize: 12, padding: '7px 14px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 5 }}
                  >
                    ↗ ArXiv
                  </a>
                  <button
                    className="btn-primary sage"
                    style={{ fontSize: 12, padding: '7px 16px' }}
                    onClick={handleLaunch}
                  >
                    ▶ Research This Paper
                  </button>
                </div>
              </div>
            </div>

            {/* Abstract */}
            <div className="scroll-area" style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
              <div style={{ maxWidth: 780 }}>
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--ink-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
                    Abstract
                  </div>
                  <p style={{ fontSize: 13.5, lineHeight: 1.75, color: 'var(--ink-mid)', borderLeft: '3px solid var(--accent)', paddingLeft: 16 }}>
                    {selectedPaper.abstract}
                  </p>
                </div>

                {/* Launch card */}
                <div style={{
                  padding: '20px 24px',
                  background: 'var(--white)',
                  border: '1.5px solid var(--rule)',
                  borderRadius: 'var(--radius-lg)',
                  marginTop: 24,
                }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 600, color: 'var(--ink)', marginBottom: 8 }}>
                    Research This Paper with K2
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--ink-muted)', lineHeight: 1.6, marginBottom: 16 }}>
                    Silicon Scientist will autonomously investigate the key claims of this paper by formulating hypotheses,
                    writing simulation code, executing it, and generating visual artifacts — powered by K2-Think-v2.
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 20 }}>
                    {[
                      { label: 'Hypothesis', desc: 'Formulated from abstract' },
                      { label: 'Code Written', desc: 'Auto-generated by K2' },
                      { label: 'Artifact', desc: 'Visual summary rendered' },
                    ].map((step, i) => (
                      <div key={i} style={{ padding: '12px', background: 'var(--paper)', borderRadius: 'var(--radius-md)', border: '1px solid var(--rule-light)' }}>
                        <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--accent)', marginBottom: 6 }}>{i+1}</div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink)', marginBottom: 2 }}>{step.label}</div>
                        <div style={{ fontSize: 11, color: 'var(--ink-muted)' }}>{step.desc}</div>
                      </div>
                    ))}
                  </div>
                  <button
                    className="btn-primary"
                    style={{ width: '100%', justifyContent: 'center', padding: '12px 24px', fontSize: 14 }}
                    onClick={handleLaunch}
                  >
                    ▶ Launch Research Experiment
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
