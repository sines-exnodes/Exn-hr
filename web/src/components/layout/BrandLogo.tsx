import Link from "next/link";

const LOGO_SRC = "/exn.webp";

type BrandLogoProps = {
  /** Chiều cao ảnh (px), width auto giữ tỉ lệ */
  imageHeight?: number;
  className?: string;
  imageClassName?: string;
  showTitle?: boolean;
  titleClassName?: string;
  href?: string | null;
  priority?: boolean;
  imageFit?: "contain" | "cover";
  /**
   * inline: logo và chữ cùng hàng (sidebar hẹp).
   * stacked: chữ EXN HRM nằm dưới logo — tránh dính với tagline trong file PNG.
   */
  layout?: "inline" | "stacked";
};

export function BrandLogo({
  imageHeight = 36,
  className = "",
  imageClassName = "",
  showTitle = true,
  titleClassName = "",
  href = "/",
  priority = false,
  imageFit = "contain",
  layout = "stacked",
}: BrandLogoProps) {
  const fitClass =
    imageFit === "cover"
      ? "object-cover object-left-top"
      : "object-contain object-left";
  const img = (
    <span className="inline-flex shrink-0 leading-none [&>img]:block">
      <img
        src={LOGO_SRC}
        alt=""
        width={Math.round(imageHeight * 3)}
        height={imageHeight}
        className={`${fitClass} ${imageClassName}`}
        aria-hidden
        draggable={false}
      />
    </span>
  );

  const title = showTitle ? (
    <span
      className={`font-semibold text-white tracking-tight ${layout === "stacked" ? "text-base leading-tight mt-0.5" : "text-lg"} ${titleClassName}`}
      style={{ fontFamily: "var(--font-heading, 'Space Grotesk', sans-serif)" }}
    >
      EXN HRM
    </span>
  ) : null;

  const inner =
    layout === "stacked" ? (
      <div className="flex min-w-0 flex-col items-start gap-3">
        {img}
        {title}
      </div>
    ) : (
      <div className="flex min-w-0 items-start gap-3.5">
        {img}
        {title}
      </div>
    );

  const wrapClass = `min-w-0 ${className}`;

  if (href) {
    return (
      <Link
        href={href}
        aria-label="EXN HRM"
        className={`${wrapClass} inline-flex hover:opacity-90 transition-opacity`}
      >
        {inner}
      </Link>
    );
  }

  return <div className={wrapClass}>{inner}</div>;
}

/** Logo + title (form đăng nhập, hero dashboard) */
export function BrandLogoLight({
  imageHeight = 40,
  className = "",
  showTitle = true,
  titleOnDark = false,
  layout = "stacked",
  imageFit = "contain",
}: Pick<BrandLogoProps, "imageHeight" | "className" | "showTitle" | "layout"> & {
  titleOnDark?: boolean;
  imageFit?: "contain" | "cover";
}) {
  const fitClass =
    imageFit === "cover"
      ? "object-cover object-left-top"
      : "object-contain object-left";
  const img = (
    <span className="inline-flex shrink-0 leading-none [&>img]:block">
      <img
        src={LOGO_SRC}
        alt=""
        width={Math.round(imageHeight * 3)}
        height={imageHeight}
        className={`${fitClass}`}
        aria-hidden
        draggable={false}
      />
    </span>
  );

  const title = showTitle ? (
    <span
      className={`font-bold tracking-tight ${titleOnDark ? "text-white" : "text-slate-800"} ${layout === "stacked" ? "text-xl leading-tight mt-0.5" : "text-xl"}`}
      style={{ fontFamily: "var(--font-heading, 'Space Grotesk', sans-serif)" }}
    >
      EXN HRM
    </span>
  ) : null;

  const body =
    layout === "stacked" ? (
      <div className="flex flex-col items-start gap-3">
        {img}
        {title}
      </div>
    ) : (
      <div className="flex items-start gap-4">
        {img}
        {title}
      </div>
    );

  return <div className={`${className}`}>{body}</div>;
}
