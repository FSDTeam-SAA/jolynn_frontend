
import Image from "next/image";

type HeroSectionProps = {
  title: string;
  desc?: string;
  image?: string;
  imageAlt?: string;
};

const HeroSection = ({
  title,
  desc,
  image = "/assets/images/hero.png",
  imageAlt,
}: HeroSectionProps) => {
  return (
    <div className="relative flex min-h-[420px] items-center justify-center overflow-hidden sm:min-h-[500px] lg:min-h-[575px]">
      <Image
        src={image}
        alt={imageAlt || title}
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-black/40" />

      <div className="container relative z-10 text-center text-white">
        <h1 className="text-center text-3xl font-bold leading-[150%] text-white md:text-4xl lg:text-5xl">
          {title}
        </h1>
        {desc ? (
          <p className="mx-auto max-w-2xl pt-2 text-sm font-normal leading-[140%] text-white md:text-base lg:text-lg">
            {desc}
          </p>
        ) : null}
      </div>
    </div>
  );
};

export default HeroSection;
