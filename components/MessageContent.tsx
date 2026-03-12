'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const contentClasses = `
  [&_h1]:text-lg [&_h1]:font-semibold [&_h1]:text-gray-900 [&_h1]:mt-3 [&_h1]:mb-1.5
  [&_h2]:text-base [&_h2]:font-semibold [&_h2]:text-gray-900 [&_h2]:mt-3 [&_h2]:mb-1.5
  [&_h3]:text-[15px] [&_h3]:font-semibold [&_h3]:text-gray-900 [&_h3]:mt-2 [&_h3]:mb-1
  [&_p]:my-2 [&_p]:leading-relaxed
  [&_ul]:my-2 [&_ul]:pl-5 [&_ul]:list-disc [&_li]:my-0.5
  [&_ol]:my-2 [&_ol]:pl-5 [&_ol]:list-decimal [&_ol]:list-outside [&_ol]:space-y-0.5
  [&_strong]:font-semibold [&_strong]:text-gray-900
  [&_code]:bg-gray-200 [&_code]:px-1 [&_code]:rounded [&_code]:text-sm
  [&_pre]:bg-gray-100 [&_pre]:rounded-lg [&_pre]:p-3 [&_pre]:overflow-x-auto [&_pre]:my-2
  text-gray-800 text-[15px] leading-relaxed
`.replace(/\s+/g, ' ').trim();

type MessageContentProps = {
  content: string;
  isAssistant?: boolean;
};

/**
 * Vykreslí obsah zprávy. U asistenta používá Markdown (nadpisy, číslované seznamy, odrážky).
 * Pokud model nepošle Markdown, normalizujeme řádky tak, aby se zobrazily jako odstavce.
 */
export function MessageContent({ content, isAssistant = false }: MessageContentProps) {
  if (!content.trim()) return null;

  if (isAssistant) {
    const hasMarkdown = /##|\*\*|^[\s]*[-*]\s|^[\s]*\d+\.\s/m.test(content);
    const toRender = hasMarkdown
      ? content
      : content.replace(/\n/g, '\n\n').trim();
    return (
      <div className={contentClasses}>
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {toRender}
        </ReactMarkdown>
      </div>
    );
  }

  return <span className="whitespace-pre-wrap break-words">{content}</span>;
}
