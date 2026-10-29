import type { IdiomaVista } from "@/lib/db";

/** Bandera de cada idioma de vista, en SVG (los emojis de bandera no se ven en Windows):
 * Colombia para español, Reino Unido para inglés y China para chino. */
export default function BanderaIdioma({ idioma, className = "h-3.5 w-5" }: { idioma: IdiomaVista; className?: string }) {
  if (idioma === "es") {
    return (
      <svg viewBox="0 0 6 4" className={className} aria-hidden="true">
        <rect width="6" height="2" fill="#FCD116" />
        <rect y="2" width="6" height="1" fill="#003893" />
        <rect y="3" width="6" height="1" fill="#CE1126" />
      </svg>
    );
  }
  if (idioma === "en") {
    return (
      <svg viewBox="0 0 60 30" className={className} aria-hidden="true">
        <clipPath id="bandera-uk">
          <rect width="60" height="30" />
        </clipPath>
        <g clipPath="url(#bandera-uk)">
          <rect width="60" height="30" fill="#012169" />
          <path d="M0,0 60,30 M60,0 0,30" stroke="#fff" strokeWidth="6" />
          <path d="M0,0 60,30 M60,0 0,30" stroke="#C8102E" strokeWidth="2" />
          <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10" />
          <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6" />
        </g>
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 30 20" className={className} aria-hidden="true">
      <rect width="30" height="20" fill="#DE2910" />
      <polygon points="5,2 5.9,4.8 8.8,4.8 6.5,6.5 7.4,9.3 5,7.6 2.6,9.3 3.5,6.5 1.2,4.8 4.1,4.8" fill="#FFDE00" />
      <circle cx="10" cy="2" r="0.8" fill="#FFDE00" />
      <circle cx="12" cy="4" r="0.8" fill="#FFDE00" />
      <circle cx="12" cy="7" r="0.8" fill="#FFDE00" />
      <circle cx="10" cy="9" r="0.8" fill="#FFDE00" />
    </svg>
  );
}
