import { useEffect, useRef, type ReactNode } from "react";
import { ShieldAlert, VolumeX } from "lucide-react";
import { startAlarm, stopAlarm, useAlarmSounding } from "../../../lib/hub/alarm";

/**
 * Red and blue police lights over the whole screen, a big banner and the
 * siren (lib/hub/alarm.ts). Used when the Admin panel locks itself after 30
 * idle seconds and after three wrong Admin panel passwords (/locked).
 *
 * The lights pulse once a second per colour, under the three flashes a
 * second that can trigger seizures, and stand still for anyone who has
 * asked their device to reduce motion (styles/hub.css, .hub-threat).
 */
export default function PoliceAlert({
  title,
  subtitle,
  children,
  action,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  /** The way out: sign in again, or unlock again. */
  action: ReactNode;
}) {
  const sounding = useAlarmSounding();
  const actions = useRef<HTMLDivElement>(null);

  useEffect(() => {
    startAlarm();
    actions.current?.querySelector<HTMLElement>("a, button")?.focus();
    return () => stopAlarm();
  }, []);

  return (
    <div className="hub hub-threat fixed inset-0 z-[200] overflow-y-auto" role="alertdialog" aria-modal="true" aria-labelledby="threat-title" aria-describedby="threat-body">
      <div className="hub-threat-lights" aria-hidden>
        <span className="hub-threat-red" />
        <span className="hub-threat-blue" />
      </div>
      <div className="hub-threat-bar" aria-hidden>
        <span className="hub-threat-red" />
        <span className="hub-threat-blue" />
      </div>

      <div className="relative z-[1] flex min-h-full flex-col items-center justify-center px-4 py-16 text-center">
        <div className="flex w-full max-w-[720px] flex-col items-center gap-6">
          <span className="flex h-16 w-16 items-center justify-center rounded-[20px] bg-white/10 text-white ring-1 ring-white/25">
            <ShieldAlert className="h-9 w-9" strokeWidth={1.75} aria-hidden />
          </span>
          <div className="w-full rounded-[18px] border-2 border-white/80 bg-black/55 px-5 py-6 shadow-[0_0_60px_rgb(0_0_0/0.5)] backdrop-blur-sm sm:px-10 sm:py-8">
            <h1 id="threat-title" className="text-[40px] font-extrabold uppercase leading-[1.02] tracking-[0.04em] text-white sm:text-[64px]">
              {title}
            </h1>
            <p className="mt-3 text-[18px] font-bold uppercase tracking-[0.18em] text-white/90 sm:text-[22px]">{subtitle}</p>
          </div>
          <div id="threat-body" className="flex max-w-[560px] flex-col gap-3 text-[16px] leading-relaxed text-white/90">
            {children}
          </div>
          <div ref={actions} className="mt-2 flex flex-wrap items-center justify-center gap-3">
            {action}
            {sounding && (
              <button
                type="button"
                onClick={stopAlarm}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-[12px] border border-white/60 px-5 text-[15px] font-semibold text-white hover:bg-white/10 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/50"
              >
                <VolumeX className="h-4 w-4" strokeWidth={2} aria-hidden />
                Silence alarm
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/** The white button style the alert's main action uses. */
export const policeActionClass =
  "inline-flex h-12 items-center justify-center rounded-[12px] bg-white px-6 text-[15px] font-semibold text-[#101828] hover:bg-white/90 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/50";
