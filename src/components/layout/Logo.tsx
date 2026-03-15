export default function Logo({ size = 40 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Cercle de points colorés — identité OGong */}
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = (i * 30 * Math.PI) / 180;
        const cx = 24 + 18 * Math.cos(angle);
        const cy = 24 + 18 * Math.sin(angle);
        const colors = [
          "#FF8C42",
          "#FFB347",
          "#5B4CFF",
          "#8B7FFF",
          "#FF6B6B",
          "#FF8C42",
          "#FFB347",
          "#5B4CFF",
          "#8B7FFF",
          "#FF6B6B",
          "#FF8C42",
          "#FFB347",
        ];
        return (
          <circle key={i} cx={cx} cy={cy} r={2.5} fill={colors[i]} />
        );
      })}
      {/* Lettre centrale stylisée */}
      <text
        x="24"
        y="29"
        textAnchor="middle"
        fontSize="16"
        fontWeight="700"
        fill="#2d2b55"
        fontFamily="system-ui, sans-serif"
      >
        og
      </text>
    </svg>
  );
}
