import Image, { type ImageProps } from "next/image";

/**
 * Bundled images under /images are optimised by next/image. Admin-uploaded
 * (/media/...) and external URLs are served as-is, so no remote allow-list is
 * needed for whatever the organisers paste in.
 */
export function SmartImage({ src, alt, ...props }: Omit<ImageProps, "src"> & { src: string }) {
  const optimisable = src.startsWith("/images/");
  return <Image src={src} alt={alt} unoptimized={!optimisable} {...props} />;
}
