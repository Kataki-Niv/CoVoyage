import { ChangeEvent } from "react";

import { cn } from "@/lib/utils";

type FormFieldProps = {
  label: string;
  name?: string;
  type?: string;
  placeholder?: string;
  textarea?: boolean;
  className?: string;
  value?: string;
  disabled?: boolean;
  required?: boolean;
  onChange?: (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
};

export function FormField({
  label,
  name,
  type = "text",
  placeholder,
  textarea = false,
  className,
  value,
  disabled = false,
  required = false,
  onChange,
}: FormFieldProps) {
  const inputClass =
    "mt-2 w-full rounded-[4px] border border-stone-200 bg-white/80 px-4 py-3 text-sm text-stone-800 outline-none transition focus:border-stone-500 focus:ring-2 focus:ring-stone-200";

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
          onChange={onChange}
        />
      ) : (
        <input
          className={inputClass}
          name={name}
          type={type}
          placeholder={placeholder}
          value={value}
          disabled={disabled}
          required={required}
          onChange={onChange}
        />
      )}
    </label>
  );
}
