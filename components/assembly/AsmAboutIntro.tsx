const EVENT_MOMENTS = [
  {
    src: "/summit/media/hero-poster.jpg",
    alt: "Audience members gathered in front of the Cross Future stage",
    label: "Stage / 01",
    className: "is-primary",
  },
  {
    src: "/summit/media/rail-interviews.jpg",
    alt: "Two Cross Future guests discussing AI on stage",
    label: "Dialogue / 02",
    className: "is-dialogue",
  },
  {
    src: "/summit/media/intro-media.jpg",
    alt: "A Cross Future guest sharing her perspective in an interview",
    label: "Perspective / 03",
    className: "is-perspective",
  },
] as const;

export default function AsmAboutIntro() {
  return (
    <div className="asm-about-intro">
      <div className="asm-about-copy">
        <p className="asm-about-kicker">Cross Future / AI Forum</p>
        <h2 className="asm-about-title">
          Where <span>AI ideas</span> become shared momentum.
        </h2>
        <p className="asm-about-lead">
          Cross Future connects professors, researchers and industry builders
          through recurring AI events built for useful exchange and lasting
          collaboration.
        </p>
      </div>

      <div className="asm-about-collage" aria-label="Cross Future event moments">
        {EVENT_MOMENTS.map((moment) => (
          <figure
            className={`asm-about-moment ${moment.className}`}
            key={moment.src}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={moment.src}
              alt={moment.alt}
              loading="lazy"
              decoding="async"
            />
            <figcaption>{moment.label}</figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}
