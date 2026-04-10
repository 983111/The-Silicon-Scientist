import React, { useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ArtifactRendererProps {
  artifact?: { type: string; content: string; iteration: number };
}

/**
 * Renders HTML artifacts in a sandboxed iframe for security.
 * SVG is rendered directly. Markdown is rendered via ReactMarkdown.
 */
function HtmlArtifact({ content }: { content: string }) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    // Wrap bare HTML fragments in a full document
    const isFullDoc = content.trim().toLowerCase().startsWith('<!doctype') || content.trim().toLowerCase().startsWith('<html');
    const doc = isFullDoc ? content : `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  body { margin: 0; padding: 16px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: transparent; }
  * { box-sizing: border-box; }
</style>
</head>
<body>${content}</body>
</html>`;

    const blob = new Blob([doc], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    iframe.src = url;
    return () => URL.revokeObjectURL(url);
  }, [content]);

  return (
    <iframe
      ref={iframeRef}
      sandbox="allow-scripts allow-same-origin"
      style={{ width: '100%', height: '100%', border: 'none', background: 'transparent' }}
      title="Visual Artifact"
    />
  );
}

export function ArtifactRenderer({ artifact }: ArtifactRendererProps) {
  if (!artifact || !artifact.content) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        height: '100%', gap: 12, padding: 32, textAlign: 'center',
      }}>
        <div style={{ fontSize: 40, opacity: 0.3 }}>🎨</div>
        <div style={{ fontSize: 14, color: '#6b6560', fontWeight: 500 }}>Visual Artifact</div>
        <div style={{ fontSize: 12, color: '#4a4540', maxWidth: 260, lineHeight: 1.6 }}>
          K2 will generate a beautiful visual artifact when an experiment is running.
          It will appear here automatically.
        </div>
      </div>
    );
  }

  const { type, content, iteration } = artifact;

  const typeLabelMap: Record<string, string> = {
    html: 'HTML',
    markdown: 'MARKDOWN',
    md: 'MARKDOWN',
    svg: 'SVG',
    xml: 'XML',
  };
  const typeLabel = typeLabelMap[type.toLowerCase()] ?? type.toUpperCase();

  const typeBadgeColors: Record<string, { bg: string; color: string }> = {
    html: { bg: 'rgba(212,81,42,0.15)', color: '#d4512a' },
    markdown: { bg: 'rgba(45,74,110,0.15)', color: '#2d4a6e' },
    md: { bg: 'rgba(45,74,110,0.15)', color: '#2d4a6e' },
    svg: { bg: 'rgba(58,107,90,0.15)', color: '#3a6b5a' },
  };
  const badgeStyle = typeBadgeColors[type.toLowerCase()] ?? { bg: 'rgba(192,57,43,0.1)', color: '#c0392b' };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      border: '1px solid #1e1d1b',
      borderRadius: 10,
      overflow: 'hidden',
      background: '#0a0908',
    }}>
      {/* Artifact Header bar */}
      <div style={{
        padding: '10px 16px',
        borderBottom: '1px solid #1e1d1b',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: '#111110',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 15 }}>🎨</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: '#9a9590', fontWeight: 500 }}>
            visual_artifact_iter_{iteration}.{type === 'markdown' || type === 'md' ? 'md' : type}
          </span>
        </div>
        <span style={{
          fontSize: 10, padding: '2px 8px', borderRadius: 4,
          background: badgeStyle.bg, color: badgeStyle.color,
          fontWeight: 700, letterSpacing: '0.08em',
          fontFamily: 'var(--font-mono)',
        }}>
          {typeLabel}
        </span>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: 'auto', position: 'relative', background: type === 'html' ? '#fff' : '#0a0908' }}>
        {(type === 'html' || type === 'xml') && (
          <HtmlArtifact content={content} />
        )}
        {type === 'svg' && (
          <div
            style={{ padding: 24, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100%' }}
            dangerouslySetInnerHTML={{ __html: content }}
          />
        )}
        {(type === 'markdown' || type === 'md') && (
          <div style={{
            padding: '24px',
            color: '#e8e5df',
            fontFamily: 'var(--font-body)',
            lineHeight: 1.75,
          }}>
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({ children }) => <h1 style={{ fontFamily: 'var(--font-display)', color: '#e8e5df', borderBottom: '1px solid #2a2825', paddingBottom: 8, marginBottom: 16 }}>{children}</h1>,
                h2: ({ children }) => <h2 style={{ fontFamily: 'var(--font-display)', color: '#c8c5c0', marginTop: 24, marginBottom: 12 }}>{children}</h2>,
                h3: ({ children }) => <h3 style={{ color: '#a8a5a0', marginTop: 16, marginBottom: 8 }}>{children}</h3>,
                p: ({ children }) => <p style={{ color: '#9a9590', marginBottom: 12, lineHeight: 1.7, fontSize: 13.5 }}>{children}</p>,
                code: ({ children }) => <code style={{ background: '#1e1d1b', color: '#d4512a', padding: '1px 6px', borderRadius: 4, fontSize: 12, fontFamily: 'var(--font-mono)' }}>{children}</code>,
                pre: ({ children }) => <pre style={{ background: '#1e1d1b', padding: 16, borderRadius: 8, overflow: 'auto', marginBottom: 16 }}>{children}</pre>,
                strong: ({ children }) => <strong style={{ color: '#e8e5df', fontWeight: 600 }}>{children}</strong>,
                ul: ({ children }) => <ul style={{ color: '#9a9590', paddingLeft: 20, marginBottom: 12 }}>{children}</ul>,
                li: ({ children }) => <li style={{ marginBottom: 4, lineHeight: 1.6 }}>{children}</li>,
              }}
            >
              {content}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}
