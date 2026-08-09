type BookingSearchPromptIllustrationProps = {
  className?: string;
};

export function BookingSearchPromptIllustration({
  className,
}: BookingSearchPromptIllustrationProps) {
  return (
    <svg
      viewBox="0 0 240 180"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <ellipse cx="120" cy="158" rx="72" ry="10" fill="rgb(200 164 93 / 0.12)" />

      <path
        d="M52 128 C88 92, 112 88, 148 72 C164 64, 176 58, 188 48"
        stroke="rgb(200 164 93 / 0.55)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeDasharray="7 6"
      />

      <g transform="translate(38 112)">
        <circle cx="14" cy="14" r="18" fill="rgb(200 164 93 / 0.16)" />
        <circle cx="14" cy="14" r="10" fill="rgb(200 164 93 / 0.28)" />
        <path
          d="M14 8v8l5 3"
          stroke="rgb(120 90 40)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="14" cy="14" r="3" fill="rgb(200 164 93)"
        />
      </g>

      <g transform="translate(168 34)">
        <path
          d="M16 34c0-8.837 7.163-16 16-16s16 7.163 16 16c0 11.046-16 24-16 24S16 45.046 16 34z"
          fill="rgb(200 164 93 / 0.22)"
          stroke="rgb(200 164 93 / 0.75)"
          strokeWidth="2"
        />
        <circle cx="32" cy="34" r="5" fill="rgb(200 164 93)" />
      </g>

      <rect
        x="62"
        y="44"
        width="116"
        height="78"
        rx="14"
        fill="rgb(255 255 255 / 0.92)"
        stroke="rgb(200 164 93 / 0.35)"
        strokeWidth="1.5"
      />
      <rect
        x="74"
        y="58"
        width="56"
        height="8"
        rx="4"
        fill="rgb(200 164 93 / 0.22)"
      />
      <rect
        x="74"
        y="74"
        width="92"
        height="8"
        rx="4"
        fill="rgb(200 164 93 / 0.14)"
      />
      <rect
        x="74"
        y="90"
        width="72"
        height="8"
        rx="4"
        fill="rgb(200 164 93 / 0.14)"
      />
      <rect
        x="74"
        y="106"
        width="44"
        height="8"
        rx="4"
        fill="rgb(200 164 93 / 0.14)"
      />

      <circle cx="176" cy="56" r="18" fill="rgb(200 164 93 / 0.9)" />
      <circle
        cx="176"
        cy="56"
        r="11"
        stroke="white"
        strokeWidth="2.5"
        fill="none"
      />
      <path
        d="M182 62l8 8"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      <g transform="translate(98 132)">
        <rect
          x="0"
          y="8"
          width="44"
          height="18"
          rx="9"
          fill="rgb(200 164 93 / 0.85)"
        />
        <path
          d="M8 22h28M8 17h18"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.9"
        />
        <circle cx="10" cy="26" r="3" fill="rgb(40 40 45)" />
        <circle cx="34" cy="26" r="3" fill="rgb(40 40 45)" />
        <path
          d="M4 14h36l-4-8H8L4 14z"
          fill="rgb(40 40 45 / 0.85)"
        />
      </g>
    </svg>
  );
}
