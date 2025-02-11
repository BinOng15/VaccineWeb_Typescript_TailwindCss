import React from "react";

const sizes = {
  textmd: "text-[16px] font-medium lg:text-[13px]",
  headingxs: "text-[14px] font-black",
  headings: "text-[16px] font-bold lg:text-[13px]",
  headingmd: "text-[18px] font-bold lg:text-[15px]",
  headinglg: "text-[20px] font-black lg:text-[17px]",
  headingxl:
    "text-[30px] font-black lg:text-[25px] md:text-[28px] sm:text-[26px]",
  heading2xl:
    "text-[40px] font-black lg:text-[34px] md:text-[38px] sm:text-[36px]",
};

export type HeadingProps = Partial<{
  className: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  as: any;
  size: keyof typeof sizes;
}> &
  React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLSpanElement>,
    HTMLSpanElement
  >;

const Heading: React.FC<React.PropsWithChildren<HeadingProps>> = ({
  children,
  className = "",
  size = "textmd",
  as,
  ...restProps
}) => {
  const Component = as || "h6";

  return (
    <Component
      className={`text-_2d2323 font-roboto ${className} ${
        sizes[size] as keyof typeof sizes
      }`}
      {...restProps}
    >
      {children}
    </Component>
  );
};

export default Heading;
