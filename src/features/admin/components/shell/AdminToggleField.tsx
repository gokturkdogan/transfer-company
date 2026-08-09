import { cn } from "@/lib/utils";

type AdminToggleFieldProps = {
  label: string;
  description?: string;
  name: string;
  defaultChecked?: boolean;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  className?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

export function AdminToggleField({
  label,
  description,
  name,
  defaultChecked,
  checked,
  onCheckedChange,
  className,
  onChange,
}: AdminToggleFieldProps) {
  const isControlled = checked !== undefined;

  return (
    <label
      className={cn(
        "flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 bg-slate-50/50 p-4 transition-colors hover:bg-slate-50",
        className,
      )}
    >
      <input
        type="checkbox"
        name={name}
        defaultChecked={isControlled ? undefined : defaultChecked}
        checked={isControlled ? checked : undefined}
        onChange={(event) => {
          onChange?.(event);
          onCheckedChange?.(event.target.checked);
        }}
        className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
      />
      <span>
        <span className="block text-sm font-medium text-slate-900">{label}</span>
        {description ? (
          <span className="mt-0.5 block text-xs text-slate-500">
            {description}
          </span>
        ) : null}
      </span>
    </label>
  );
}
