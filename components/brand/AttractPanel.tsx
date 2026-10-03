import Link from "next/link";
import { BrandLogoSmall } from "@/components/BrandLogo";

// The dark brand panel beside the sign-in and sign-up forms: the DealerLoft
// magnet with its field lines pulling inward, the logo on top, and the
// slogan over the product line at the bottom ("Listings that attract." /
// "Post once. Sell everywhere.", paired as the identity guide sets them).
//
// The field is the identity guide's own (DealerLoft Identity v1.0, "The
// magnet"): five concentric U's around the mark's centre, radii spaced by
// √φ, thinning with distance, Cobalt Light on Asphalt, pulling inward one
// at a time on a 2.4 s loop. It's inline rather than the kit's
// dealerloft-hero-field.svg as an <img>: that file is a wide landscape piece
// with the magnet at its far right, so a tall, narrow panel only ever showed
// the straight ends of the lines. Reduced motion shows it still (globals.css).

// [radius, stroke width] from the identity guide's field panel.
const FIELD_LINES: [number, number][] = [
  [717.3, 26],
  [912.4, 13],
  [1160.6, 8.7],
  [1476.4, 6.5],
  [1878.0, 5.2],
];

const MARK_PATH =
  "M0 0.00H118.03A506.00 500.00 0 0 1 118.03 1000.00H0V809.02H118.03A309.02 309.02 0 0 0 118.03 190.98H0ZM0 309.02H118.03A190.98 190.98 0 0 1 118.03 690.98H0V618.03H118.03A118.03 118.03 0 0 0 118.03 381.97H0ZM0 427.05H118.03A72.95 72.95 0 0 1 118.03 572.95H0Z";

// Straight in from the left, around the magnet's centre (118, 500), and
// straight back out.
function fieldLine(r: number) {
  return `M-2700 ${500 - r}H118A${r} ${r} 0 0 1 118 ${500 + r}H-2700`;
}

export function AttractPanel() {
  return (
    <div className="dl-dark dl-auth-panel relative hidden overflow-hidden lg:flex lg:flex-col lg:justify-between lg:p-12">
      {/* Framed for a tall panel: magnet right of centre in the upper half;
          "slice" keeps it filled at other sizes. */}
      <svg
        className="dl-auth-panel__art"
        viewBox="-1000 -800 1800 3000"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden
      >
        <g fill="none" stroke="#7B88FF">
          {FIELD_LINES.map(([r, w], i) => (
            <path
              key={r}
              className="dl-auth-panel__line"
              style={{ animationDelay: `${i * 0.3}s` }}
              d={fieldLine(r)}
              strokeWidth={w}
            />
          ))}
        </g>
        <path d={MARK_PATH} fill="#FFFFFF" />
      </svg>

      <Link href="/" aria-label="DealerLoft home" className="relative w-fit">
        <BrandLogoSmall tone="white" className="h-6 w-auto" />
      </Link>

      <div className="relative">
        <h2 className="dl-display dl-auth-panel__slogan">
          Listings that
          <br />
          <em>attract.</em>
        </h2>
        <p className="dl-auth-panel__product">Post once. Sell everywhere.</p>
      </div>
    </div>
  );
}
