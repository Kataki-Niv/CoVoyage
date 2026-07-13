import { ChangeEvent, FocusEvent } from "react";

import { cn } from "@/lib/utils";

type FormFieldProps = {
  label: string;
  name?: string;
  type?: string;
  placeholder?: string;
  options?: string[];
  optionPlaceholder?: string;
  textarea?: boolean;
  className?: string;
  value?: string;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  onChange?: (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => void;
  onBlur?: (
    event: FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => void;
};

export function FormField({
  label,
  name,
  type = "text",
  placeholder,
  options,
  optionPlaceholder,
  textarea = false,
  className,
  value,
  disabled = false,
  required = false,
  error,
  onChange,
  onBlur,
}: FormFieldProps) {
  const hasError = Boolean(error);
  const errorId = name ? `${name}-error` : undefined;
  const inputClass = cn(
    "mt-2 w-full rounded-[4px] border bg-white/80 px-4 py-3 text-sm text-stone-800 outline-none transition focus:ring-2",
    hasError
      ? "border-red-300 bg-red-50/60 focus:border-red-400 focus:ring-red-100"
      : "border-stone-200 focus:border-stone-500 focus:ring-stone-200",
  );

  return (
    <label className={cn("block text-sm font-medium text-stone-700", className)}>
      {label}

      {textarea ? (
        <textarea
          className={cn(inputClass, "min-h-32 resize-y")}
          name={name}
          placeholder={placeholder}
          value={value}
          disabled={disabled}
          required={required}
          aria-invalid={hasError}
          aria-describedby={hasError ? errorId : undefined}
          onChange={onChange}
          onBlur={onBlur}
        />
      ) : options ? (
        <select
          className={inputClass}
          name={name}
          value={value}
          disabled={disabled}
          required={required}
          aria-invalid={hasError}
          aria-describedby={hasError ? errorId : undefined}
          onChange={onChange}
          onBlur={onBlur}
        >
          {optionPlaceholder ? (
            <option value="">{optionPlaceholder}</option>
          ) : null}
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      ) : (
        <input
          className={inputClass}
          name={name}
          type={type}
          placeholder={placeholder}
          value={value}
          disabled={disabled}
          required={required}
          aria-invalid={hasError}
          aria-describedby={hasError ? errorId : undefined}
          onChange={onChange}
          onBlur={onBlur}
        />
      )}
      {hasError ? (
        <p className="mt-2 text-sm font-normal text-red-700" id={errorId}>
          {error}
        </p>
      ) : null}
    </label>
  );
}
