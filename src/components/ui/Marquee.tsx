export default function Marquee({
  items,
  className = "",
}: {
  items: string[];
  className?: string;
}) {
  return (
    <div className={`overflow-hidden ${className}`}>
      <div className="marquee-track">
        {[0, 1, 2, 3].map((dup) => (
          <ul
            key={dup}
            aria-hidden={dup > 0}
            className="flex shrink-0 items-center gap-10 pe-10"
          >
            {items.map((item, i) => (
              <li
                key={`${dup}-${i}`}
                className="flex items-center gap-10 whitespace-nowrap text-xs tracking-[0.25em] text-cream-100/50"
              >
                {item}
                <span className="text-gold-400/60">◆</span>
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  );
}
