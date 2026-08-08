"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

type TabsContextValue = {
  value: string;
  onValueChange: (value: string) => void;
};

const TabsContext = React.createContext<TabsContextValue | null>(null);

function useTabsContext(): TabsContextValue {
  const context = React.useContext(TabsContext);

  if (!context) {
    throw new Error("Tabs components must be used within Tabs");
  }

  return context;
}

export function Tabs({
  value,
  defaultValue,
  onValueChange,
  className,
  children,
}: {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  className?: string;
  children: React.ReactNode;
}) {
  const [internalValue, setInternalValue] = React.useState(defaultValue ?? "");
  const currentValue = value ?? internalValue;

  const handleValueChange = React.useCallback(
    (nextValue: string) => {
      if (value === undefined) {
        setInternalValue(nextValue);
      }
      onValueChange?.(nextValue);
    },
    [onValueChange, value],
  );

  return (
    <TabsContext.Provider
      value={{ value: currentValue, onValueChange: handleValueChange }}
    >
      <div className={cn("space-y-4", className)}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsList({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}

export function TabsTrigger({
  value,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { value: string }) {
  const { value: selectedValue, onValueChange } = useTabsContext();
  const isSelected = selectedValue === value;

  return (
    <button
      type="button"
      className={cn(
        "inline-flex cursor-pointer items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:pointer-events-none disabled:opacity-50",
        isSelected
          ? "bg-background text-foreground shadow-sm"
          : "hover:text-foreground",
        className,
      )}
      onClick={() => onValueChange(value)}
      data-active={isSelected ? "true" : "false"}
      {...props}
    />
  );
}

export function TabsContent({
  value,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { value: string }) {
  const { value: selectedValue } = useTabsContext();

  if (selectedValue !== value) {
    return null;
  }

  return <div className={cn("space-y-4", className)} {...props} />;
}
