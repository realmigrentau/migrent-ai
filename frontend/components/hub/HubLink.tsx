import Link from "next/link";
import { useRouter } from "next/router";
import { forwardRef, useCallback, type AnchorHTMLAttributes, type ReactNode } from "react";
import { hubLink } from "../../lib/hub/routes";

type Props = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
  /** A Hub path without the /hub prefix, e.g. "/applications/123". */
  to: string;
  children?: ReactNode;
  prefetch?: boolean;
  replace?: boolean;
  scroll?: boolean;
};

/** A link to a Hub page, correct whether the Hub is at /hub or on its own host. */
const HubLink = forwardRef<HTMLAnchorElement, Props>(function HubLink({ to, children, prefetch, replace, scroll, ...rest }, ref) {
  const { href, as } = hubLink(to);
  const hash = to.includes("#") ? `#${to.split("#")[1]}` : "";
  return (
    <Link ref={ref} href={href + hash} as={as + hash} prefetch={prefetch} replace={replace} scroll={scroll} {...rest}>
      {children}
    </Link>
  );
});

export default HubLink;

/** router.push for Hub paths. */
export function useHubNavigate() {
  const router = useRouter();
  return useCallback(
    (to: string, opts: { replace?: boolean; shallow?: boolean; scroll?: boolean } = {}) => {
      const { href, as } = hubLink(to);
      const hash = to.includes("#") ? `#${to.split("#")[1]}` : "";
      return opts.replace
        ? router.replace(href + hash, as + hash, { shallow: opts.shallow, scroll: opts.scroll })
        : router.push(href + hash, as + hash, { shallow: opts.shallow, scroll: opts.scroll });
    },
    [router],
  );
}
