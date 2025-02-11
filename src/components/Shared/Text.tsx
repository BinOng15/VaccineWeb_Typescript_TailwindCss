import React from "react";

const sizes = {
  textxs: "text-[12px] font-normal",
  texts: "text-[14px] font-normal",
  textlg: "text-[22px] font-normal lg:text-[18px]",
};

export type TextProps = Partial<{
  className: string;
  as: any;
  size: keyof typeof sizes;
}> &
  React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLSpanElement>,
    HTMLSpanElement
  >;

const Text: React.FC<React.PropsWithChildren<TextProps>> = ({
  children,
  className = "",
  as,
  size = "textxs",
  ...restProps
}) => {
  const Component = as || "p";

  return (
    <Component
      className={`text-_2d2323 font-roboto ${className} ${sizes[size]}`}
      {...restProps}
    >
      {children}
    </Component>
  );
};

export { Text };
