/**
 * Composition constants measured off the reference animation.
 *
 * The reference is a 1652x1114 capture. Every number below is the measured
 * position of a feature in that frame, expressed as a fraction, so the layout
 * can be rebuilt at any viewport instead of being pinned to one screen size.
 *
 *   plate aspect          1652 / 1114                      = 1.4829
 *   main roof ridge       y 468                            = 0.4201 of height
 *   wordmark cap top      y 224                            = 0.2011
 *   wordmark baseline     y 534                            = 0.4794
 *   wordmark cap height   310                              = 0.2783
 *   wordmark left / right x 152 / 1510                     = 0.0920 / 0.9140
 *   nav pill row centre   y 58                             = 0.0521
 *
 * The one that does the real work is ROOF_RIDGE. With object-fit: cover and
 * object-position: 50% 42%, the ridge lands at 42% of the box height at every
 * aspect ratio - the crop offset and the target move together and cancel out.
 * That is why the building sits in the same place on a 16:9 monitor and on a
 * phone without a single breakpoint-specific nudge to the plate.
 */
export const PLATE_WIDTH = 1652;
export const PLATE_HEIGHT = 1114;
export const PLATE_ASPECT = PLATE_WIDTH / PLATE_HEIGHT;

/** Fraction of the plate height at which the main roof ridge sits. */
export const ROOF_RIDGE = 0.4201;

/** Wordmark cap height as a fraction of its own rendered width. */
export const WORDMARK_CAP_OVER_WIDTH = 310 / 1358;

/** Fraction of the viewport width the wordmark spans in the reference. */
export const WORDMARK_WIDTH = 0.822;

/**
 * How far the giant wordmark travels against the page over one hero-height of
 * scroll, as a fraction of that scroll. The reference plate is flat, so its
 * type and building move together; splitting them is the one thing a layered
 * build can do that the capture cannot. Kept small - the word sinks a little
 * further behind the roofline on the way out rather than sliding visibly.
 */
export const WORDMARK_LAG = 0.07;

/** Cinematic push-in on the scene across the same scroll. */
export const SCENE_ZOOM = 0.045;
