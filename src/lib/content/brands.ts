import imgLaganja from "$lib/assets/home/brands/brand_laganja.png";
import imgCafeDalida from "$lib/assets/home/brands/brand_cafedalida.png";
import imgCumParty from "$lib/assets/home/brands/brand_cumparty.png";
import imgPrismGalaxia from "$lib/assets/home/brands/brand_prismgalaxia.png";
import imgDrThaiFans from "$lib/assets/home/brands/brand_drthaifans.png";

export interface Brand {
  key: string;
  label: string;
  href: string;
  logo: string;
  /** Per-brand scale factor to compensate for transparent padding in source PNG */
  scale?: number;
}

export interface BrandGroup {
  /** Display label shown in the hero text state */
  displayLabel: string;
  brands: Brand[];
  /** Text alignment within the hero nav */
  align?: "left" | "right";
}

export const heroBrandGroups: BrandGroup[] = [
  {
    displayLabel: "LAGANJA\nESTRANJA",
    brands: [
      { key: "laganja", label: "Laganja Estranja", href: "https://www.laganjaestranja.com", logo: imgLaganja, scale: 1.0 },
    ],
  },
  {
    displayLabel: "CAFÉ DALIDA &\nC.U.M. PARTY",
    brands: [
      { key: "cafedalida", label: "Café Dalida", href: "https://www.instagram.com/cafedalidataipei", logo: imgCafeDalida, scale: 1.05 },
      { key: "cumparty", label: "C.U.M. Party", href: "https://www.instagram.com/cumpartytw", logo: imgCumParty, scale: 1.3 },
    ],
  },
  {
    displayLabel: "PRISM\nGALAXIA",
    brands: [
      { key: "prismgalaxia", label: "Prism Galaxia", href: "https://www.instagram.com/prismgalaxia", logo: imgPrismGalaxia, scale: 1.4 },
    ],
  },
  {
    displayLabel: "DRAG RACE\nTHAI FANS",
    brands: [
      { key: "drthaifans", label: "Drag Race Thai Fans", href: "https://www.instagram.com/drthaifans", logo: imgDrThaiFans, scale: 1.35 },
    ],
    align: "right",
  },
];
