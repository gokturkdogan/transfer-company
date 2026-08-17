import DOMPurify from "isomorphic-dompurify";

const ALLOWED_TAGS = [
  "p",
  "br",
  "strong",
  "b",
  "em",
  "i",
  "u",
  "h1",
  "h2",
  "h3",
  "h4",
  "ul",
  "ol",
  "li",
  "a",
  "hr",
  "blockquote",
  "div",
  "span",
  "section",
  "header",
  "footer",
];

const ALLOWED_ATTR = ["href", "target", "rel", "class"];

export function sanitizePrivacyHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
  });
}
