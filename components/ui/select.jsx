"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

const Select = ({ children, value, onValueChange, disabled, ...props }) => {
  return (
    <div className="relative" {...props}>
      {React.Children.map(children, (child) => {
        if (child?.type?.displayName === "SelectTrigger") {
          return React.cloneElement(child, {
            value,
            onValueChange,
            selectChildren: children,
            disabled,
          });
        }
        return null;
      })}
    </div>
  );
};

const SelectTrigger = React.forwardRef(
  (
    {
      className,
      children,
      value,
      onValueChange,
      selectChildren,
      disabled,
      ...props
    },
    ref,
  ) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const triggerRef = React.useRef(null);

    // Close on outside click
    React.useEffect(() => {
      if (!isOpen) return;
      const handleClick = (e) => {
        if (triggerRef.current && !triggerRef.current.contains(e.target)) {
          setIsOpen(false);
        }
      };
      document.addEventListener("mousedown", handleClick);
      return () => document.removeEventListener("mousedown", handleClick);
    }, [isOpen]);

    const getDisplayValue = () => {
      if (!value) {
        const selectValue = React.Children.toArray(children).find(
          (child) => child?.type?.displayName === "SelectValue",
        );
        return selectValue?.props.placeholder || "Select an option";
      }
      let displayText = value;
      React.Children.forEach(selectChildren, (child) => {
        if (child?.type?.displayName === "SelectContent") {
          React.Children.forEach(child.props.children, (item) => {
            if (
              item?.type?.displayName === "SelectItem" &&
              item.props.value === value
            ) {
              displayText = item.props.children;
            }
          });
        }
      });
      return displayText;
    };

    return (
      <div ref={triggerRef}>
        <button
          ref={ref}
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
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
          <span className="truncate">{getDisplayValue()}</span>
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
        {isOpen && (
          <div className="absolute z-50 mt-1.5 w-full rounded-xl border shadow-xl animate-scale-in overflow-hidden bg-white border-violet-200/80 dark:bg-slate-900 dark:border-slate-700">
            {React.Children.map(selectChildren, (child) => {
              if (child?.type?.displayName === "SelectContent") {
                return React.cloneElement(child, {
                  value,
                  onValueChange,
                  onClose: () => setIsOpen(false),
                });
              }
              return null;
            })}
          </div>
        )}
      </div>
    );
  },
);
SelectTrigger.displayName = "SelectTrigger";

const SelectContent = ({
  children,
  className,
  value,
  onValueChange,
  onClose,
}) => {
  return (
    <div className={cn("max-h-60 overflow-auto p-1", className)}>
      {React.Children.map(children, (child) => {
        if (child?.type?.displayName === "SelectItem") {
          return React.cloneElement(child, {
            selectedValue: value,
            onValueChange,
            onClose,
          });
        }
        return child;
      })}
    </div>
  );
};
SelectContent.displayName = "SelectContent";

const SelectItem = ({
  children,
  value,
  selectedValue,
  onValueChange,
  onClose,
  className,
  ...props
}) => {
  const isSelected = selectedValue === value;
  return (
    <div
      onClick={() => {
        onValueChange(value);
        onClose();
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

const SelectValue = ({ placeholder }) => {
  return <span>{placeholder}</span>;
};
SelectValue.displayName = "SelectValue";

export { Select, SelectTrigger, SelectContent, SelectItem, SelectValue };
