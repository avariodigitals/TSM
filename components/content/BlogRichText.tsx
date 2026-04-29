import Link from "next/link";

type InlinePart =
  | { type: "text"; value: string }
  | { type: "strong"; value: string }
  | { type: "em"; value: string }
  | { type: "code"; value: string }
  | { type: "link"; value: string; href: string };

type Block =
  | { type: "heading"; level: 2 | 3; text: string }
  | { type: "list"; items: string[] }
  | { type: "paragraph"; text: string };

function parseBlocks(markdown: string): Block[] {
  const lines = markdown.split("\n");
  const blocks: Block[] = [];
  let paragraphBuffer: string[] = [];
  let listBuffer: string[] = [];

  const flushParagraph = () => {
    if (paragraphBuffer.length > 0) {
      blocks.push({ type: "paragraph", text: paragraphBuffer.join(" ").trim() });
      paragraphBuffer = [];
    }
  };

  const flushList = () => {
    if (listBuffer.length > 0) {
      blocks.push({ type: "list", items: [...listBuffer] });
      listBuffer = [];
    }
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (!line) {
      flushParagraph();
      flushList();
      continue;
    }

    if (line.startsWith("## ")) {
      flushParagraph();
      flushList();
      blocks.push({ type: "heading", level: 2, text: line.slice(3).trim() });
      continue;
    }

    if (line.startsWith("### ")) {
      flushParagraph();
      flushList();
      blocks.push({ type: "heading", level: 3, text: line.slice(4).trim() });
      continue;
    }

    if (line.startsWith("- ") || line.startsWith("* ")) {
      flushParagraph();
      listBuffer.push(line.slice(2).trim());
      continue;
    }

    flushList();
    paragraphBuffer.push(line);
  }

  flushParagraph();
  flushList();

  return blocks;
}

function parseInline(text: string): InlinePart[] {
  const parts: InlinePart[] = [];
  const pattern = /(\*\*([^*]+)\*\*)|(\*([^*]+)\*)|(`([^`]+)`)|(\[([^\]]+)\]\(([^)]+)\))/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: "text", value: text.slice(lastIndex, match.index) });
    }

    if (match[2]) {
      parts.push({ type: "strong", value: match[2] });
    } else if (match[4]) {
      parts.push({ type: "em", value: match[4] });
    } else if (match[6]) {
      parts.push({ type: "code", value: match[6] });
    } else if (match[8] && match[9]) {
      parts.push({ type: "link", value: match[8], href: match[9] });
    }

    lastIndex = pattern.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push({ type: "text", value: text.slice(lastIndex) });
  }

  return parts;
}

function renderInline(text: string) {
  return parseInline(text).map((part, index) => {
    if (part.type === "strong") {
      return <strong key={index}>{part.value}</strong>;
    }

    if (part.type === "em") {
      return <em key={index}>{part.value}</em>;
    }

    if (part.type === "code") {
      return (
        <code key={index} className="rounded bg-[#eef2ff] px-1.5 py-0.5 text-[0.9em] text-[#2E3192]">
          {part.value}
        </code>
      );
    }

    if (part.type === "link") {
      const isExternal = /^https?:\/\//.test(part.href);
      if (isExternal) {
        return (
          <a key={index} href={part.href} target="_blank" rel="noopener noreferrer" className="text-[#00AEEF] underline underline-offset-4">
            {part.value}
          </a>
        );
      }

      return (
        <Link key={index} href={part.href} className="text-[#00AEEF] underline underline-offset-4">
          {part.value}
        </Link>
      );
    }

    return <span key={index}>{part.value}</span>;
  });
}

export function getExcerptFromBody(body: string, fallback = "") {
  const compactBody = body
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^[-*]\s+/gm, "")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1")
    .replace(/\s+/g, " ")
    .trim();

  return compactBody || fallback;
}

export function getFirstImageFromBody(body: string) {
  const match = body.match(/!\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)/);
  return match?.[1] ?? null;
}

export default function BlogRichText({ markdown }: { markdown: string }) {
  const blocks = parseBlocks(markdown);

  return (
    <div className="space-y-6 text-gray-700 leading-8">
      {blocks.map((block, index) => {
        if (block.type === "heading") {
          if (block.level === 2) {
            return (
              <h2 key={index} className="text-2xl font-black text-[#231F20] pt-4">
                {renderInline(block.text)}
              </h2>
            );
          }

          return (
            <h3 key={index} className="text-xl font-black text-[#231F20] pt-2">
              {renderInline(block.text)}
            </h3>
          );
        }

        if (block.type === "list") {
          return (
            <ul key={index} className="list-disc space-y-2 pl-6 marker:text-[#00AEEF]">
              {block.items.map((item, itemIndex) => (
                <li key={itemIndex}>{renderInline(item)}</li>
              ))}
            </ul>
          );
        }

        return (
          <p key={index} className="text-base sm:text-lg leading-8 text-gray-700">
            {renderInline(block.text)}
          </p>
        );
      })}
    </div>
  );
}
