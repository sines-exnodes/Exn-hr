import Image from "next/image";
import Link from "next/link";

const LOGO_SRC = "/exn.png";

type BrandLogoProps = {
  /** Chiều cao ảnh (px), width auto giữ tỉ lệ */
  imageHeight?: number;
  className?: string;
  imageClassName?: string;
  showTitle?: boolean;
  titleClassName?: string;
  href?: string | null;
  priority?: boolean;
};

export function BrandLogo({
  imageHeight = 36,
  className = "",
  imageClassName = "",
  showTitle = true,
  titleClassName = "",
  href = "/",
  priority = false,
}: BrandLogoProps) {
  const content = (
    <>
      <Image
        src={LOGO_SRC}
        alt="EXN HRM"
        width={Math.round(imageHeight * 3)}
        height={imageHeight}
        className={`w-auto object-contain object-left ${imageClassName}`}
        style={{ height: imageHeight }}
        priority={priority}
      />
      {showTitle && (
        <span
          className={`text-lg font-semibold text-white tracking-tight ${titleClassName}`}
          style={{ fontFamily: "var(--font-heading, 'Space Grotesk', sans-serif)" }}
        >
          EXN HRM
        </span>
      )}
    </>
  );

  const wrapClass = `flex items-center gap-2.5 min-w-0 ${className}`;

  if (href) {
    return (
      <Link href={href} className={`${wrapClass} hover:opacity-90 transition-opacity`}>
        {content}
      </Link>
    );
  }

  return <div className={wrapClass}>{content}</div>;
}

/** Logo + title (form đăng nhập: nền sáng hoặc panel xanh với titleOnDark) */
export function BrandLogoLight({
  imageHeight = 40,
  className = "",
  showTitle = true,
  titleOnDark = false,
}: Pick<BrandLogoProps, "imageHeight" | "className" | "showTitle"> & {
  titleOnDark?: boolean;
}) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <Image
        src={LOGO_SRC}
        alt="EXN HRM"
        width={Math.round(imageHeight * 3)}
        height={imageHeight}
        className="w-auto object-contain object-left"
        style={{ height: imageHeight }}
        priority
      />
      {showTitle && (
        <span
          className={`text-xl font-bold tracking-tight ${titleOnDark ? "text-white" : "text-slate-800"}`}
          style={{ fontFamily: "var(--font-heading, 'Space Grotesk', sans-serif)" }}
        >
          EXN HRM
        </span>
      )}
    </div>
  );
}
