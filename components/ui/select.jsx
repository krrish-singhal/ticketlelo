"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

const SelectContext = React.createContext(null);

const Select = ({ children, value, onValueChange, disabled }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [selectedLabel, setSelectedLabel] = React.useState("");
  const containerRef = React.useRef(null);
  const itemLabels = React.useRef({});

  // Close on outside click
  React.useEffect(() => {
    if (!isOpen) return;
    const handleMouseDown = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, [isOpen]);

  // When value changes, look up the label from the registry
  React.useEffect(() => {
    if (!value) {
      setSelectedLabel("");
    } else {
      // Delay one tick so items have had a chance to register via useLayoutEffect
      const id = setTimeout(() => {
        if (itemLabels.current[value]) {
          setSelectedLabel(itemLabels.current[value]);
        }
      }, 0);
      return () => clearTimeout(id);
    }
  }, [value]);

  const handleSelect = React.useCallback(
    (itemValue, itemLabel) => {
      onValueChange(itemValue);
      setSelectedLabel(itemLabel);
      setIsOpen(false);
    },
    [onValueChange],
  );

  // Safe registration: only writes to ref, never calls setState
  const registerItem = React.useCallback((itemValue, itemLabel) => {
    itemLabels.current[itemValue] = itemLabel;
  }, []);

  return (
    <SelectContext.Provider
      value={{
        value,
        isOpen,
        setIsOpen,
        handleSelect,
        registerItem,
        selectedLabel,
        disabled: !!disabled,
      }}
    >
      <div className="relative" ref={containerRef}>
        {children}
      </div>
    </SelectContext.Provider>
  );
};
Select.displayName = "Select";

const SelectTrigger = React.forwardRef(
  ({ className, children, ...props }, ref) => {
    const { value, isOpen, setIsOpen, disabled, selectedLabel } =
      React.useContext(SelectContext);

    const placeholder =
      React.Children.toArray(children).find(
        (c) => c?.type?.displayName === "SelectValue",
      )?.props?.placeholder ?? "Select an option";

    return (
      <button
        ref={ref}
        type="button"
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        disabled={disabled}
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-xl border px-3 py-2 text-sm transition-all",
          "bg-white border-violet-200 text-gray-900 hover:border-violet-300 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400",
          "dark:bg-slate-900/80 dark:border-slate-700 dark:text-slate-200 dark:hover:border-slate-600 dark:focus:ring-violet-500/20 dark:focus:border-violet-500",
          !value && "text-gray-400 dark:text-slate-500",
          disabled && "opacity-50 cursor-not-allowed",
          className,
        )}
        {...props}
      >
        <span className="truncate">{selectedLabel || placeholder}</span>
        <svg
          className={cn(
            "h-4 w-4 shrink-0 transition-transform opacity-50",
            isOpen && "rotate-180",
          )}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
    );
  },
);
SelectTrigger.displayName = "SelectTrigger";

// Always in DOM (hidden via CSS) so items stay registered
const SelectContent = ({ children, className }) => {
  const { isOpen } = React.useContext(SelectContext);
  return (
    <div
      className={cn(
        "absolute z-50 mt-1.5 w-full rounded-xl border shadow-xl overflow-hidden bg-white border-violet-200/80 dark:bg-slate-900 dark:border-slate-700",
        isOpen ? "block animate-scale-in" : "hidden",
      )}
    >
      <div className={cn("max-h-60 overflow-auto p-1", className)}>
        {children}
      </div>
    </div>
  );
};
SelectContent.displayName = "SelectContent";

const SelectItem = ({ children, value, className, ...props }) => {
  const {
    value: selectedValue,
    handleSelect,
    registerItem,
  } = React.useContext(SelectContext);
  const isSelected = selectedValue === value;
  const label = typeof children === "string" ? children : String(value);

  // Register via layout effect — safe, never during render
  React.useLayoutEffect(() => {
    registerItem(value, label);
  }, [value, label, registerItem]);

  return (
    <div
      onMouseDown={(e) => {
        e.preventDefault();
        handleSelect(value, label);
      }}
      className={cn(
        "relative flex cursor-pointer select-none items-center rounded-lg px-3 py-2 text-sm transition-colors",
        "text-gray-700 hover:bg-violet-50 hover:text-violet-700",
        "dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white",
        isSelected &&
          "bg-violet-50 text-violet-700 font-medium dark:bg-violet-500/10 dark:text-violet-400",
        className,
      )}
      {...props}
    >
      {children}
      {isSelected && (
        <svg
          className="ml-auto h-4 w-4 text-violet-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
      )}
    </div>
  );
};
SelectItem.displayName = "SelectItem";

const SelectValue = ({ placeholder }) => <span>{placeholder}</span>;
SelectValue.displayName = "SelectValue";

export { Select, SelectTrigger, SelectContent, SelectItem, SelectValue };
