import type { SVGProps } from "react";

import { cn } from "@/lib/utils";

type EmailIconProps = SVGProps<SVGSVGElement>;

export function EmailIcon({ className, ...props }: EmailIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 640 640"
      className={cn("shrink-0", className)}
      {...props}
    >
      <path
        fill="currentColor"
        d="M112 128C85.5 128 64 149.5 64 176V464C64 490.5 85.5 512 112 512H528C554.5 512 576 490.5 576 464V176C576 149.5 554.5 128 528 128H112zM112 160H528C541.2 160 549.3 168.1 549.3 181.3V192.8L320 336.8L90.7 192.8V181.3C90.7 168.1 98.8 160 112 160zM90.7 230.1L320 374.1L549.3 230.1V464C549.3 477.2 541.2 485.3 528 485.3H112C98.8 485.3 90.7 477.2 90.7 464V230.1z"
      />
    </svg>
  );
}
