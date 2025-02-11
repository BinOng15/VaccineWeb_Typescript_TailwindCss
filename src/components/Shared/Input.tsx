import React from "react";

const shapes = {
  round: "rounded-[10px]",
} as const;

const variants = {
  fill: {
    light_neutral_secondary: "bg-light-neutral_secondary text-_2d2323",
  },
} as const;

const sizes = {
  sm: "h-[48px] pl-6 pr-3 text-[14px]",
  xs: "h-[40px] pl-[22px] pr-3 text-[12px]",
} as const;

type InputProps = Omit<
  React.ComponentPropsWithoutRef<"input">,
  "prefix" | "size"
> &
  Partial<{
    label: string;
    prefix: React.ReactNode;
    suffix: React.ReactNode;
    shape: keyof typeof shapes;
    variant: keyof typeof variants | null;
    size: keyof typeof sizes;
    color: string;
  }>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className = "",
      name = "",
      placeholder = "",
      type = "text",
      label = "",
      prefix,
      suffix,
      onChange,
      shape,
      variant = "fill",
      size = "sm",
      color = "light_neutral_secondary",
      ...restProps
    },
    ref
  ) => {
    return (
      <label
        className={`${className} flex items-center justify-center cursor-text bg-light-neutral_secondary rounded-[10px] ${
          shape && shapes[shape]
        } ${
          variant &&
          (variants[variant]?.[
            color as keyof (typeof variants)[typeof variant]
          ] ||
            variants[variant])
        } ${size && sizes[size]}`}
      >
        {!!label && label}
        {!!prefix && prefix}
        <input
          ref={ref}
          type={type}
          name={name}
          placeholder={placeholder}
          onChange={onChange}
          {...restProps}
        />
        {!!suffix && suffix}
      </label>
    );
  }
);

export { Input };
