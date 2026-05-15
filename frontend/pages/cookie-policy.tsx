import Link from "next/link";
import PolicyLayout from "../components/legal/PolicyLayout";
import PolicySection from "../components/legal/PolicySection";

const toc = [
  { id: "what-are-cookies", label: "What are cookies?" },
  { id: "cookies-we-use", label: "Cookies we use" },
  { id: "not-used", label: "What we do not use" },
  { id: "managing", label: "Managing cookies" },
  { id: "local-storage", label: "Local storage" },
];

const accent = "text-rose-500 hover:text-rose-600 underline underline-offset-2";

export default function CookiePolicy() {
  return (
    <PolicyLayout
      family="legal"
      eyebrow="Legal"
      title="Cookie Policy"
      lede="What cookies we use, why we use them, and how you can manage them. We do not use advertising or tracking cookies."
      lastUpdated="March 2026"
      metaTitle="Cookie Policy | MigRent AI"
      metaDescription="MigRent AI Cookie Policy - what cookies we use, why, and how to manage them."
      toc={toc}
      related={[
        { href: "/privacy-policy", label: "Privacy Policy", description: "How we handle your data" },
        { href: "/terms-of-service", label: "Terms of Service", description: "The rules that apply when you use MigRent" },
        { href: "/contact-legal", label: "Legal Contact", description: "Reach our legal team" },
      ]}
    >
      <PolicySection id="what-are-cookies" number={1} title="What Are Cookies?">
        <p>Cookies are small text files stored on your device when you visit a website. They help websites remember your preferences and improve your experience. MigRent uses a minimal set of cookies - we do not use advertising or tracking cookies.</p>
      </PolicySection>

      <PolicySection id="cookies-we-use" number={2} title="Cookies We Use">
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-sm border-collapse min-w-[540px]">
            <thead className="bg-slate-50 dark:bg-slate-900/50">
              <tr>
                <th className="text-left py-3 px-3 font-semibold text-slate-800 dark:text-slate-200">Cookie</th>
                <th className="text-left py-3 px-3 font-semibold text-slate-800 dark:text-slate-200">Type</th>
                <th className="text-left py-3 px-3 font-semibold text-slate-800 dark:text-slate-200">Purpose</th>
                <th className="text-left py-3 px-3 font-semibold text-slate-800 dark:text-slate-200">Duration</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <tr>
                <td className="py-2.5 px-3 font-mono text-xs">sb-*-auth-token</td>
                <td className="py-2.5 px-3"><span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-medium">Essential</span></td>
                <td className="py-2.5 px-3">Supabase authentication session</td>
                <td className="py-2.5 px-3">Session</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-mono text-xs">theme</td>
                <td className="py-2.5 px-3"><span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-medium">Essential</span></td>
                <td className="py-2.5 px-3">Dark mode / light mode preference</td>
                <td className="py-2.5 px-3">1 year</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-mono text-xs">i18nextLng</td>
                <td className="py-2.5 px-3"><span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-medium">Essential</span></td>
                <td className="py-2.5 px-3">Language preference</td>
                <td className="py-2.5 px-3">1 year</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-mono text-xs">migrent_session_cache</td>
                <td className="py-2.5 px-3"><span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-medium">Essential</span></td>
                <td className="py-2.5 px-3">Cached session for faster page loads</td>
                <td className="py-2.5 px-3">Session</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-mono text-xs">va (Vercel)</td>
                <td className="py-2.5 px-3"><span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-medium">Analytics</span></td>
                <td className="py-2.5 px-3">Anonymous page view tracking (Vercel Analytics)</td>
                <td className="py-2.5 px-3">Session</td>
              </tr>
            </tbody>
          </table>
        </div>
      </PolicySection>

      <PolicySection
        id="not-used"
        number={3}
        title="What We Do NOT Use"
        summary="No ads, no third-party tracking, no cross-site tracking, no profiling. We do not sell your data."
      >
        <ul className="list-disc list-inside space-y-1.5">
          <li><strong>Advertising cookies:</strong> We do not serve ads or use advertising tracking</li>
          <li><strong>Third-party tracking:</strong> We do not share data with ad networks (Google Ads, Facebook Pixel, etc.)</li>
          <li><strong>Cross-site tracking:</strong> We do not track your activity on other websites</li>
          <li><strong>User profiling cookies:</strong> We do not build profiles for targeted advertising</li>
        </ul>
        <p>MigRent does not sell your data to advertisers or any third parties.</p>
      </PolicySection>

      <PolicySection id="managing" number={4} title="Managing Cookies">
        <p>You can manage cookies through your browser settings:</p>
        <ul className="list-disc list-inside space-y-1.5">
          <li><strong>Block all cookies:</strong> This will prevent MigRent from remembering your login session and preferences</li>
          <li><strong>Delete cookies:</strong> You can clear cookies at any time, but you will need to log in again</li>
          <li><strong>Block third-party cookies:</strong> This will block analytics cookies but essential cookies will still work</li>
        </ul>
        <p>Note: Blocking essential cookies will prevent you from logging in or using core features of MigRent.</p>
      </PolicySection>

      <PolicySection id="local-storage" number={5} title="Local Storage">
        <p>In addition to cookies, MigRent uses browser local storage for:</p>
        <ul className="list-disc list-inside space-y-1.5">
          <li>Session cache (faster loading on return visits)</li>
          <li>Theme preference (dark/light mode)</li>
          <li>Language preference</li>
        </ul>
        <p>Local storage data stays on your device and is not sent to our servers with each request. You can clear it through your browser&apos;s developer tools or settings.</p>
        <p className="text-xs text-slate-400 dark:text-slate-500">For more information about how we handle your data, see our <Link href="/privacy-policy" className={accent}>Privacy Policy</Link>. Last reviewed: March 2026.</p>
      </PolicySection>
    </PolicyLayout>
  );
}
