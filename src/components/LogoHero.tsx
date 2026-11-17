import { useSite } from '@/site/SiteProvider';
import { publicImageUrl } from '@/lib/storage';
import { publicMediaUrl } from '@/lib/media';
import SmartLink from './SmartLink';

interface Props {
  title: string | null; body: string | null; first: boolean;
  imageUrl: string | null; videoUrl: string | null;
  buttonLabel: string | null; linkUrl: string | null;
}

/** Opening hero: a looping video or image if set, otherwise the brand's logo as a slowly turning 3D object. */
export default function LogoHero({ title, body, first, imageUrl, videoUrl, buttonLabel, linkUrl }: Props) {
  const { store } = useSite();
  const logo = publicImageUrl(store.logo_path);
  const H = first ? 'h1' : 'h2';
  const hasMedia = Boolean(videoUrl || imageUrl);
  const layers = Array.from({ length: 12 }, (_, i) => i);

  return (
    <section aria-label={title || store.name} className="relative isolate flex min-h-[88svh] flex-col justify-end overflow-hidden border-b border-white/15">
      {videoUrl ? (
        <video src={videoUrl} poster={imageUrl ?? undefined} autoPlay muted loop playsInline preload="metadata" aria-hidden className="absolute inset-0 -z-10 h-full w-full object-cover opacity-60" />
      ) : imageUrl ? (
        <img src={imageUrl} alt="" className="absolute inset-0 -z-10 h-full w-full object-cover opacity-55" />
      ) : (
        <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_50%_35%,rgba(255,255,255,0.12),transparent_62%)]" />
      )}
      {!hasMedia && logo && (
        <div aria-hidden className="logo-stage pointer-events-none absolute inset-x-0 top-[6%] flex h-[56%] items-center justify-center">
          <div className="logo-float h-full">
            <div className="logo-3d relative h-full aspect-square">
              {layers.map((i) => (
                <img key={i} src={logo} alt="" className="absolute inset-0 h-full w-full object-contain"
                  style={{ transform: `translateZ(${(i - layers.length) * 3}px)`, filter: `brightness(${0.28 + (i / layers.length) * 0.5})` }} />
              ))}
              <img src={logo} alt="" className="absolute inset-0 h-full w-full object-contain" style={{ transform: 'translateZ(0)' }} />
            </div>
          </div>
        </div>
      )}
      <div className="relative mx-auto w-full max-w-[90rem] px-4 pb-14 pt-32 sm:px-8 sm:pb-20">
        {title && <H className="max-w-full text-[clamp(2.8rem,12vw,10.5rem)] leading-[0.92] [overflow-wrap:anywhere]">{title}</H>}
        <div className="mt-6 flex flex-wrap items-end justify-between gap-6">
          {body ? <p className="max-w-md whitespace-pre-line text-base leading-relaxed text-white/80">{body}</p> : <span />}
          <SmartLink href={linkUrl} className="btn-accent">{buttonLabel || 'Shop now'}</SmartLink>
        </div>
        <span aria-hidden className="scroll-cue nav-font mt-10 block text-[11px] uppercase tracking-[0.3em] text-white/55">Scroll ↓</span>
      </div>
    </section>
  );
}
