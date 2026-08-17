function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function linkifyEscaped(text: string): string {
  return text
    .replace(
      /(https?:\/\/[^\s<]+)/g,
      '<a href="$1" rel="noopener noreferrer" target="_blank">$1</a>',
    )
    .replace(
      /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g,
      '<a href="mailto:$1">$1</a>',
    )
    .replace(
      /(royalrheintransfers\.com)/gi,
      '<a href="https://royalrheintransfers.com" rel="noopener noreferrer" target="_blank">royalrheintransfers.com</a>',
    );
}

function formatLine(line: string): string {
  return linkifyEscaped(escapeHtml(line));
}

function isTopLevelSectionHeading(line: string): boolean {
  return /^\d+\.\s/.test(line) && !/^\d+\.\d+\.\s/.test(line);
}

function isSubSectionHeading(line: string): boolean {
  return /^\d+\.\d+\.\s/.test(line);
}

function isUpdateFooter(line: string): boolean {
  return /^Son Güncelleme:/i.test(line);
}

/**
 * Converts plain KVKK text into sectioned HTML for the privacy page and editor.
 */
export function plainTextToPrivacyHtml(text: string): string {
  const normalized = text.replace(/\u2060/g, "").trim();
  const lines = normalized.split("\n");
  const output: string[] = [];
  const introLines: string[] = [];
  const sectionParts: string[] = [];
  const listItems: string[] = [];
  let inIntro = true;
  let footerLine: string | null = null;

  const flushList = () => {
    if (listItems.length === 0) {
      return;
    }

    sectionParts.push(
      `<ul>${listItems
        .map((item) => `<li>${formatLine(item)}</li>`)
        .join("")}</ul>`,
    );
    listItems.length = 0;
  };

  const closeSection = () => {
    flushList();
    if (sectionParts.length === 0) {
      return;
    }

    output.push(
      `<section class="privacy-block">${sectionParts.join("")}</section>`,
    );
    sectionParts.length = 0;
  };

  const pushIntro = () => {
    if (introLines.length === 0) {
      return;
    }

    const [brandLine, subtitleLine, ...rest] = introLines;
    const introBody = rest
      .map((line) => `<p>${formatLine(line)}</p>`)
      .join("");

    output.push(
      `<header class="privacy-intro">` +
        `<h1>${formatLine(brandLine)}</h1>` +
        (subtitleLine
          ? `<h2 class="privacy-doc-title">${formatLine(subtitleLine)}</h2>`
          : "") +
        introBody +
        `</header>`,
    );
    introLines.length = 0;
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (!line) {
      if (inIntro) {
        continue;
      }

      flushList();
      continue;
    }

    if (line === "⸻" || line === "---") {
      flushList();
      continue;
    }

    if (isUpdateFooter(line)) {
      flushList();
      closeSection();
      footerLine = line;
      continue;
    }

    if (inIntro && isTopLevelSectionHeading(line)) {
      pushIntro();
      inIntro = false;
      sectionParts.push(`<h2>${formatLine(line)}</h2>`);
      continue;
    }

    if (inIntro) {
      introLines.push(line);
      continue;
    }

    if (isTopLevelSectionHeading(line)) {
      closeSection();
      sectionParts.push(`<h2>${formatLine(line)}</h2>`);
      continue;
    }

    if (line.startsWith("* ")) {
      listItems.push(line.slice(2));
      continue;
    }

    flushList();

    if (isSubSectionHeading(line)) {
      sectionParts.push(`<h3>${formatLine(line)}</h3>`);
      continue;
    }

    sectionParts.push(`<p>${formatLine(line)}</p>`);
  }

  if (inIntro) {
    pushIntro();
  } else {
    closeSection();
  }

  if (footerLine) {
    output.push(`<footer class="privacy-footer"><p>${formatLine(footerLine)}</p></footer>`);
  }

  return output.join("");
}
