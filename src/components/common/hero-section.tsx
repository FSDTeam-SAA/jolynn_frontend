
import Image from "next/image";

type HeroSectionProps = {
  title: string;
  desc?: string;
  image?: string;
  imageAlt?: string;
  compact?: boolean;
  imagePosition?: string;
};

const HeroSection = ({
  title,
  desc,
  image = "/assets/images/hero.png",
  imageAlt,
  compact = false,
  imagePosition = "center",
}: HeroSectionProps) => {
  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden ${
        compact
          ? "min-h-[300px] sm:min-h-[340px] lg:min-h-[380px]"
          : "min-h-[480px] sm:min-h-[600px] lg:min-h-[631px]"
      }`}
    >
      <Image
        src={image}
        alt={imageAlt || title}
        fill
        priority
        sizes="100vw"
        className="object-cover"
        style={{ objectPosition: imagePosition }}
      />
      <div className="absolute inset-0 bg-black/40" />

      <div className="container relative z-10 text-center text-white">
        <h1 className="text-center text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold leading-[150%] text-white">
          {title}
        </h1>
        {desc ? (
          <p className="mx-auto max-w-5xl pt-2 text-sm font-normal leading-[140%] text-white md:text-base lg:text-lg">
            {desc}
          </p>
        ) : null}
      </div>
    </div>
  );
};

export default HeroSection;
