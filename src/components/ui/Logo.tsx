import Image from "next/image";

export default function LogoMark({ className = "h-7" }: { className?: string }) {
  return (
    <span
      className={`relative inline-flex shrink-0 items-center rounded-lg overflow-hidden bg-white ${className}`}
      style={{ aspectRatio: "1/1" }}
    >
      <Image
        src="/images/logo-coffee.jpeg"
        alt="Birra Coffee"
        fill
        sizes="80px"
        loading="eager"
        className="object-contain"
      />
    </span>
  );
}
