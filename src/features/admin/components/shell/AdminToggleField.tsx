import { cn } from "@/lib/utils";

type AdminToggleFieldProps = {
  label: string;
  description?: string;
  name: string;
  defaultChecked?: boolean;
  className?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

export function AdminToggleField({
  label,
  description,
  name,
  defaultChecked,
  className,
  onChange,
}: AdminToggleFieldProps) {
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
        defaultChecked={defaultChecked}
        onChange={onChange}
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
