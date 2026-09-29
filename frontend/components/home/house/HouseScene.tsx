import type { ReactNode } from "react";
import { sharesLivingAreas, type HouseState } from "../../../lib/home/houseConfig";

/**
 * The cut-away house, drawn by hand in SVG.
 *
 * A doll's house on a model plinth: the front wall is off so every room is
 * visible, the roof lifts once on arrival, and each setting in the panel
 * beside it changes something you can see - a lit bedroom, a car under the
 * carport, a dog at the kennel, a camera under the eave. The drawing is
 * decorative for assistive technology (the panel is the real control and
 * says the same thing in words), but a pointer can tap a bedroom directly.
 *
 * Geometry. The front face spans x 160-540. The house recedes up and to the
 * right by DEPTH (40, -26), which is what the side wall, the roof's side and
 * the plinth top are drawn with. Floors: upper 186-316, ground 322-452.
 * Every colour is a --hs-* token from styles/house.css, set per theme.
 */

const DEPTH = { x: 40, y: -26 };
const FRONT = { left: 160, right: 540, top: 186, slab: 316, ground: 322, floor: 452 };

interface Room {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

const UPPER_H = FRONT.slab - FRONT.top;
const GROUND_H = FRONT.floor - FRONT.ground;

/** Bedroom index (0-3) to its place in the house. */
const BEDROOMS: Room[] = [
  { id: "bed-1", x: 160, y: FRONT.top, w: 95, h: UPPER_H },
  { id: "bed-2", x: 255, y: FRONT.top, w: 95, h: UPPER_H },
  { id: "bed-3", x: 350, y: FRONT.top, w: 95, h: UPPER_H },
  { id: "bed-4", x: 160, y: FRONT.ground, w: 95, h: GROUND_H },
];
const BATH: Room = { id: "bath", x: 445, y: FRONT.top, w: 95, h: UPPER_H };
const LIVING: Room = { id: "living", x: 255, y: FRONT.ground, w: 130, h: GROUND_H };
const KITCHEN: Room = { id: "kitchen", x: 385, y: FRONT.ground, w: 95, h: GROUND_H };
const LAUNDRY: Room = { id: "laundry", x: 480, y: FRONT.ground, w: 60, h: GROUND_H };

const FLOOR_BAND = 12;
const floorLine = (r: Room) => r.y + r.h - FLOOR_BAND;

/* Lucide glyphs (24x24), drawn inside the small badges. */
const GLYPH = {
  check: <path d="M20 6 9 17l-5-5" />,
  lock: (
    <>
      <rect x="4" y="11" width="16" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </>
  ),
  user: (
    <>
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </>
  ),
  users: (
    <>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </>
  ),
  bolt: <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />,
  cameraOff: (
    <>
      <path d="M2 2l20 20" />
      <path d="M7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h14" />
      <path d="M9.5 4h5L17 7h3a2 2 0 0 1 2 2v7.5" />
    </>
  ),
} as const;

type Glyph = keyof typeof GLYPH;

/** A round badge with a glyph, centred on (cx, cy). */
function Badge({ cx, cy, glyph, tone = "tag", r = 9, className = "" }: { cx: number; cy: number; glyph: Glyph; tone?: "tag" | "quiet"; r?: number; className?: string }) {
  const s = r * 1.1;
  return (
    <g className={`hs-badge hs-badge--${tone} ${className}`}>
      <circle cx={cx} cy={cy} r={r} className="hs-badge__disc" />
      <g
        transform={`translate(${cx - s / 2} ${cy - s / 2}) scale(${s / 24})`}
        className="hs-badge__glyph"
        fill="none"
        strokeWidth={2.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {GLYPH[glyph]}
      </g>
    </g>
  );
}

/** Show or hide a drawn item with the scene's shared entrance. */
function Item({ on, children, className = "" }: { on: boolean; children: ReactNode; className?: string }) {
  return (
    <g className={`hs-item ${className}`} data-on={on ? "true" : "false"}>
      {children}
    </g>
  );
}

function Window({ x, y, w, h }: { x: number; y: number; w: number; h: number }) {
  return (
    <g className="hs-window">
      <rect x={x} y={y} width={w} height={h} rx={3} className="hs-window__glass" />
      <circle cx={x + w * 0.72} cy={y + h * 0.3} r={1.3} className="hs-window__star" />
      <path d={`M${x + w / 2} ${y}V${y + h}M${x} ${y + h / 2}H${x + w}`} className="hs-window__bar" />
      <rect x={x} y={y} width={w} height={h} rx={3} className="hs-window__frame" />
      <rect x={x - 3} y={y + h} width={w + 6} height={3} rx={1.5} className="hs-window__sill" />
    </g>
  );
}

function Bed({ x, fy, tone }: { x: number; fy: number; tone: number }) {
  return (
    <g className="hs-bed">
      <rect x={x} y={fy - 32} width={6} height={32} rx={2} className="hs-wood" />
      <rect x={x} y={fy - 12} width={60} height={8} rx={2} className="hs-wood" />
      <rect x={x + 56} y={fy - 18} width={4} height={18} rx={1.5} className="hs-wood" />
      <rect x={x + 4} y={fy - 20} width={54} height={9} rx={3} className="hs-linen" />
      <rect x={x + 8} y={fy - 27} width={15} height={7} rx={3.5} className="hs-linen" />
      <rect x={x + 22} y={fy - 22} width={36} height={12} rx={3} className={`hs-blanket hs-blanket--${tone}`} />
      <path d={`M${x + 24} ${fy - 17}h32`} className="hs-blanket__fold" />
    </g>
  );
}

function Lamp({ x, fy }: { x: number; fy: number }) {
  return (
    <g className="hs-lamp">
      <rect x={x} y={fy - 16} width={15} height={16} rx={2} className="hs-wood" />
      <rect x={x + 6.5} y={fy - 27} width={2} height={11} className="hs-metal" />
      <path d={`M${x + 1} ${fy - 26}h13l-3-9h-7z`} className="hs-lamp__shade" />
    </g>
  );
}

function AirCon({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <rect x={x} y={y} width={30} height={10} rx={3} className="hs-appliance" />
      <path d={`M${x + 4} ${y + 7.5}h22`} className="hs-appliance__line" />
    </g>
  );
}

function Bedroom({ room, index, lit, state, onToggle }: { room: Room; index: number; lit: boolean; state: HouseState; onToggle?: (i: number) => void }) {
  const fy = floorLine(room);
  const furnished = state.mode === "looking" || state.extras.furnished;
  return (
    <g
      className="hs-room hs-room--bed"
      data-lit={lit ? "true" : "false"}
      onClick={onToggle ? () => onToggle(index) : undefined}
    >
      <rect x={room.x} y={room.y} width={room.w} height={room.h} className="hs-wall" />
      <circle cx={room.x + 18} cy={fy - 30} r={46} className="hs-glow" />
      <rect x={room.x} y={fy} width={room.w} height={FLOOR_BAND} className="hs-floor" />
      <path d={`M${room.x} ${fy}H${room.x + room.w}`} className="hs-skirting" />
      <Window x={room.x + 10} y={room.y + 18} w={28} h={28} />
      <Item on={state.extras.aircon}>
        <AirCon x={room.x + 44} y={room.y + 12} />
      </Item>
      <Item on={furnished}>
        <Bed x={room.x + 30} fy={fy} tone={index % 3} />
        <Lamp x={room.x + 9} fy={fy} />
      </Item>
      <Item on={lit}>
        <Badge cx={room.x + room.w - 12} cy={room.y + 15} glyph="check" />
      </Item>
      <Item on={state.lockable && lit}>
        <Badge cx={room.x + room.w - 12} cy={room.y + 35} glyph="lock" tone="quiet" />
      </Item>
      <rect x={room.x} y={room.y} width={room.w} height={room.h} className="hs-hit" />
    </g>
  );
}

function Bathroom({ state }: { state: HouseState }) {
  const r = BATH;
  const fy = floorLine(r);
  const shared = state.bathroom === "shared";
  const known = state.bathroom !== "any";
  return (
    <g className="hs-room">
      <rect x={r.x} y={r.y} width={r.w} height={r.h} className="hs-wall hs-wall--tile" />
      <path d={`M${r.x} ${r.y + 72}H${r.x + r.w}M${r.x} ${r.y + 90}H${r.x + r.w}`} className="hs-tile-line" />
      <rect x={r.x} y={fy} width={r.w} height={FLOOR_BAND} className="hs-floor hs-floor--tile" />
      {/* Shower and bath */}
      <path d={`M${r.x + 16} ${r.y + 8}V${r.y + 30}h8`} className="hs-pipe" />
      <rect x={r.x + 20} y={r.y + 29} width={11} height={4} rx={2} className="hs-metal" />
      <rect x={r.x + 8} y={fy - 21} width={56} height={21} rx={7} className="hs-porcelain" />
      <path d={`M${r.x + 12} ${fy - 15}h48`} className="hs-porcelain__rim" />
      {/* Vanity and mirror */}
      <rect x={r.x + 70} y={r.y + 22} width={16} height={22} rx={4} className="hs-mirror" />
      <rect x={r.x + 68} y={fy - 26} width={21} height={26} rx={2} className="hs-cabinet" />
      <rect x={r.x + 66} y={fy - 30} width={25} height={5} rx={2} className="hs-porcelain" />
      <Item on={known}>
        <Badge cx={r.x + r.w - 12} cy={r.y + 15} glyph={shared ? "users" : "user"} tone="quiet" />
      </Item>
    </g>
  );
}

function Living({ state }: { state: HouseState }) {
  const r = LIVING;
  const fy = floorLine(r);
  const furnished = state.mode === "looking" || state.extras.furnished;
  const cameraInside = state.mode === "hosting" && state.cameras === "inside";
  return (
    <g className="hs-room">
      <rect x={r.x} y={r.y} width={r.w} height={r.h} className="hs-wall hs-wall--warm" />
      <circle cx={r.x + 104} cy={fy - 40} r={52} className="hs-glow hs-glow--always" />
      <rect x={r.x} y={fy} width={r.w} height={FLOOR_BAND} className="hs-floor" />
      <path d={`M${r.x} ${fy}H${r.x + r.w}`} className="hs-skirting" />
      <Window x={r.x + 12} y={r.y + 18} w={40} h={30} />
      {/* Shelf and router */}
      <rect x={r.x + 66} y={r.y + 36} width={44} height={4} rx={1.5} className="hs-wood" />
      <Item on={state.extras.internet}>
        <rect x={r.x + 76} y={r.y + 27} width={18} height={9} rx={2.5} className="hs-appliance" />
        <circle cx={r.x + 80} cy={r.y + 31.5} r={1.2} className="hs-led" />
        <path
          d={`M${r.x + 79} ${r.y + 20}a8 8 0 0 1 12 0M${r.x + 76} ${r.y + 16}a13 13 0 0 1 18 0`}
          className="hs-wifi"
        />
      </Item>
      <Item on={furnished}>
        <ellipse cx={r.x + 74} cy={fy + 1} rx={44} ry={5} className="hs-rug" />
        <rect x={r.x + 40} y={fy - 31} width={68} height={16} rx={6} className="hs-sofa hs-sofa--back" />
        <rect x={r.x + 36} y={fy - 20} width={76} height={16} rx={5} className="hs-sofa" />
        <rect x={r.x + 34} y={fy - 26} width={9} height={22} rx={4} className="hs-sofa hs-sofa--arm" />
        <rect x={r.x + 105} y={fy - 26} width={9} height={22} rx={4} className="hs-sofa hs-sofa--arm" />
        <rect x={r.x + 48} y={fy - 27} width={14} height={9} rx={3} className="hs-cushion" />
        <path d={`M${r.x + 40} ${fy - 4}v4M${r.x + 108} ${fy - 4}v4`} className="hs-leg" />
        {/* Plant */}
        <path d={`M${r.x + 10} ${fy - 14}h14l-2 14h-10z`} className="hs-pot" />
        <path
          d={`M${r.x + 17} ${fy - 14}c-6-6-9-15-4-22c3 6 4 13 4 22zm0 0c5-8 11-12 16-11c-3 7-9 10-16 11zm0 0c-4-4-11-5-15-2c4 4 10 4 15 2z`}
          className="hs-leaf"
        />
      </Item>
      <Item on={cameraInside}>
        <path d={`M${r.x + r.w - 12} ${r.y + 4}v6`} className="hs-pipe" />
        <rect x={r.x + r.w - 24} y={r.y + 9} width={16} height={8} rx={2.5} className="hs-camera" />
        <circle cx={r.x + r.w - 24} cy={r.y + 13} r={3} className="hs-camera__lens" />
        <circle cx={r.x + r.w - 12} cy={r.y + 11.5} r={1.2} className="hs-rec" />
      </Item>
      <Item on={sharesLivingAreas(state)}>
        <Badge cx={r.x + r.w - 14} cy={r.y + 36} glyph="users" tone="quiet" />
      </Item>
    </g>
  );
}

function Kitchen({ state }: { state: HouseState }) {
  const r = KITCHEN;
  const fy = floorLine(r);
  return (
    <g className="hs-room">
      <rect x={r.x} y={r.y} width={r.w} height={r.h} className="hs-wall hs-wall--warm" />
      <rect x={r.x} y={fy} width={r.w} height={FLOOR_BAND} className="hs-floor hs-floor--tile" />
      {/* Overhead cupboards and rangehood */}
      <rect x={r.x + 6} y={r.y + 14} width={50} height={22} rx={2} className="hs-cabinet" />
      <path d={`M${r.x + 31} ${r.y + 14}v22`} className="hs-cabinet__line" />
      <path d={`M${r.x + 22} ${r.y + 40}h20l6 10h-32z`} className="hs-metal" />
      {/* Bench, oven, kettle */}
      <rect x={r.x + 6} y={fy - 28} width={54} height={28} rx={2} className="hs-cabinet" />
      <rect x={r.x + 4} y={fy - 32} width={58} height={4} rx={1.5} className="hs-bench" />
      <rect x={r.x + 22} y={fy - 24} width={22} height={18} rx={2} className="hs-oven" />
      <path d={`M${r.x + 25} ${fy - 20}h16`} className="hs-cabinet__line" />
      <path d={`M${r.x + 10} ${fy - 32}v-8h8v8`} className="hs-kettle" />
      {/* Fridge */}
      <rect x={r.x + 64} y={fy - 62} width={26} height={62} rx={4} className="hs-fridge" />
      <path d={`M${r.x + 64} ${fy - 40}h26M${r.x + 68} ${fy - 55}v8M${r.x + 68} ${fy - 34}v10`} className="hs-fridge__line" />
      <Item on={sharesLivingAreas(state)}>
        <Badge cx={r.x + r.w - 14} cy={r.y + 15} glyph="users" tone="quiet" />
      </Item>
    </g>
  );
}

function Laundry({ state }: { state: HouseState }) {
  const r = LAUNDRY;
  const fy = floorLine(r);
  const machine = state.laundry !== "none";
  return (
    <g className="hs-room">
      <rect x={r.x} y={r.y} width={r.w} height={r.h} className="hs-wall" />
      <rect x={r.x} y={fy} width={r.w} height={FLOOR_BAND} className="hs-floor hs-floor--tile" />
      <rect x={r.x + 8} y={r.y + 36} width={44} height={3} rx={1.5} className="hs-wood" />
      <rect x={r.x + 13} y={r.y + 24} width={7} height={12} rx={2} className="hs-bottle" />
      <rect x={r.x + 24} y={r.y + 28} width={6} height={8} rx={2} className="hs-bottle hs-bottle--b" />
      <Item on={machine}>
        <rect x={r.x + 12} y={fy - 36} width={36} height={36} rx={4} className="hs-appliance" />
        <path d={`M${r.x + 12} ${fy - 28}h36`} className="hs-appliance__line" />
        <circle cx={r.x + 30} cy={fy - 14} r={10} className="hs-drum" />
        <circle cx={r.x + 30} cy={fy - 14} r={6} className="hs-drum__glass" />
      </Item>
      <Item on={state.laundry === "shared"}>
        <Badge cx={r.x + r.w - 12} cy={r.y + 15} glyph="users" tone="quiet" />
      </Item>
    </g>
  );
}

/** The side of the house, drawn in its own skewed frame so a rectangle
 *  there recedes with the wall. (u, v) -> (540 + u, v - 0.65u). */
const SIDE = `matrix(1 ${DEPTH.y / DEPTH.x} 0 1 ${FRONT.right} 0)`;

function Exterior({ state }: { state: HouseState }) {
  const cameraOutside = state.mode === "hosting" && (state.cameras === "outside" || state.cameras === "inside");
  const noCameras = state.mode === "looking" && state.cameras === "none";
  return (
    <>
      {/* Side wall with a window and the meter box */}
      <path
        d={`M${FRONT.right} ${FRONT.top}l${DEPTH.x} ${DEPTH.y}V${FRONT.floor + DEPTH.y}L${FRONT.right} ${FRONT.floor}z`}
        className="hs-side"
      />
      <g transform={SIDE}>
        <rect x={10} y={222} width={20} height={30} rx={2} className="hs-window__glass hs-window__glass--side" />
        <rect x={10} y={222} width={20} height={30} rx={2} className="hs-window__frame" />
        <rect x={12} y={362} width={16} height={22} rx={2} className="hs-meter" />
      </g>
      <Badge cx={FRONT.right + 20} cy={FRONT.floor - 86} glyph="bolt" tone="quiet" r={8} className="hs-meter__badge" />
      <Item on={state.extras.bills}>
        <Badge cx={FRONT.right + 30} cy={FRONT.floor - 98} glyph="check" r={7} />
      </Item>

      {/* Outdoor camera under the left eave, looking over the drive - or,
          for a renter who asked for none, the promise in its place. */}
      <Item on={cameraOutside}>
        <path d={`M${FRONT.left - 8} ${FRONT.top}v5`} className="hs-pipe" />
        <rect x={FRONT.left - 22} y={FRONT.top + 5} width={18} height={9} rx={3} className="hs-camera" />
        <circle cx={FRONT.left - 21} cy={FRONT.top + 9.5} r={3.2} className="hs-camera__lens" />
        <circle cx={FRONT.left - 8} cy={FRONT.top + 7.5} r={1.2} className="hs-rec" />
      </Item>
      <Item on={noCameras}>
        <Badge cx={FRONT.left - 14} cy={FRONT.top + 12} glyph="cameraOff" r={10} />
      </Item>
    </>
  );
}

function Roof() {
  const apex = { x: 350, y: 78 };
  const eaveL = FRONT.left - 16;
  const eaveR = FRONT.right + 16;
  const slope = (apex.y - FRONT.top) / (apex.x - eaveR);
  const yAt = (x: number) => FRONT.top + slope * (x - eaveR);
  return (
    <g className="hs-roof">
      {/* Chimney, behind the front gable */}
      <rect x={452} y={62} width={20} height={yAt(472) - 62 + 4} className="hs-chimney" />
      <rect x={448} y={58} width={28} height={6} rx={1.5} className="hs-chimney hs-chimney--cap" />
      {/* The roof's side, receding */}
      <path
        d={`M${apex.x} ${apex.y}l${DEPTH.x} ${DEPTH.y}L${eaveR + DEPTH.x} ${FRONT.top + DEPTH.y}L${eaveR} ${FRONT.top}z`}
        className="hs-roof__side"
      />
      <path
        d={[0.25, 0.5, 0.75]
          .map((t) => {
            const x = apex.x + (eaveR - apex.x) * t;
            const y = apex.y + (FRONT.top - apex.y) * t;
            return `M${x} ${y}l${DEPTH.x} ${DEPTH.y}`;
          })
          .join("")}
        className="hs-roof__tiles"
      />
      {/* The front gable: a thick fascia around an open attic */}
      <path d={`M${eaveL} ${FRONT.top}L${apex.x} ${apex.y}L${eaveR} ${FRONT.top}z`} className="hs-roof__fascia" />
      <path
        d={`M${FRONT.left + 8} ${FRONT.top - 4}L${apex.x} ${apex.y + 16}L${FRONT.right - 8} ${FRONT.top - 4}z`}
        className="hs-attic"
      />
      <circle cx={apex.x} cy={142} r={13} className="hs-window__glass" />
      <path d={`M${apex.x} ${129}v26M${apex.x - 13} ${142}h26`} className="hs-window__bar" />
      <circle cx={apex.x} cy={142} r={13} className="hs-window__frame" />
    </g>
  );
}

function Grounds({ state }: { state: HouseState }) {
  return (
    <>
      {/* Plinth: top, front, right */}
      <path d="M24 452L648 452L688 426L64 426z" className="hs-plinth__top" />
      <path d="M24 452H648V468H24z" className="hs-plinth__front" />
      <path d="M648 452L688 426V442L648 468z" className="hs-plinth__side" />
      <path d="M540 452L580 426H628L588 452z" className="hs-shadow" />

      {/* A tree behind the carport */}
      <path d="M88 452V330" className="hs-trunk" />
      <circle cx={78} cy={316} r={34} className="hs-foliage" />
      <circle cx={108} cy={296} r={28} className="hs-foliage hs-foliage--b" />
      <circle cx={60} cy={288} r={22} className="hs-foliage hs-foliage--b" />

      {/* The drive, and a carport with a car on it when there is parking */}
      <path d="M40 452L150 452L158 446H48z" className="hs-drive" />
      <Item on={state.extras.parking} className="hs-car">
        <path d="M36 356h124v-6l-8-6H44l-8 6z" className="hs-carport__roof" />
        <path d="M44 356V452M150 356V452" className="hs-carport__post" />
        <path d="M54 440v-12c0-3 2-5 5-5h9l9-13h32l10 13h6c3 0 5 2 5 5v12z" className="hs-car__body" />
        <path d="M80 412h13v11H72zM97 412h12l8 11H97z" className="hs-car__glass" />
        <circle cx={72} cy={442} r={8} className="hs-wheel" />
        <circle cx={118} cy={442} r={8} className="hs-wheel" />
        <circle cx={72} cy={442} r={3} className="hs-hub" />
        <circle cx={118} cy={442} r={3} className="hs-hub" />
        <rect x={124} y={429} width={6} height={4} rx={1.5} className="hs-car__light" />
      </Item>

      {/* Kennel, with its resident */}
      <Item on={state.extras.pets} className="hs-pet">
        <path d="M598 452V420h46v32z" className="hs-kennel" />
        <path d="M592 422L621 396L650 422z" className="hs-kennel__roof" />
        <path d="M612 452v-14a9 9 0 0 1 18 0v14z" className="hs-kennel__door" />
        <ellipse cx={621} cy={444} rx={9} ry={8} className="hs-dog" />
        <ellipse cx={613.5} cy={441} rx={3} ry={6} className="hs-dog__ear" transform="rotate(18 613.5 441)" />
        <ellipse cx={628.5} cy={441} rx={3} ry={6} className="hs-dog__ear" transform="rotate(-18 628.5 441)" />
        <circle cx={618} cy={442} r={1.2} className="hs-dog__eye" />
        <circle cx={624} cy={442} r={1.2} className="hs-dog__eye" />
        <ellipse cx={621} cy={447} rx={2.2} ry={1.6} className="hs-dog__eye" />
      </Item>
    </>
  );
}

export default function HouseScene({ state, onToggleBedroom }: { state: HouseState; onToggleBedroom?: (index: number) => void }) {
  return (
    <svg
      className="hs"
      data-mode={state.mode}
      viewBox="0 32 712 444"
      role="presentation"
      aria-hidden="true"
      focusable="false"
      preserveAspectRatio="xMidYMax meet"
    >
      <defs>
        <radialGradient id="hs-glow">
          <stop offset="0%" className="hs-glow__core" />
          <stop offset="100%" className="hs-glow__edge" />
        </radialGradient>
      </defs>

      <Grounds state={state} />
      <Exterior state={state} />

      {/* Upper and ground floors */}
      {BEDROOMS.slice(0, 3).map((room, i) => (
        <Bedroom key={room.id} room={room} index={i} lit={state.bedrooms[i]} state={state} onToggle={onToggleBedroom} />
      ))}
      <Bathroom state={state} />
      <Bedroom room={BEDROOMS[3]} index={3} lit={state.bedrooms[3]} state={state} onToggle={onToggleBedroom} />
      <Living state={state} />
      <Kitchen state={state} />
      <Laundry state={state} />

      {/* The cut edge: outer frame, the slab between floors, and the walls between rooms */}
      <rect x={FRONT.left} y={FRONT.slab} width={FRONT.right - FRONT.left} height={FRONT.ground - FRONT.slab} className="hs-frame__fill" />
      <path
        d={[
          ...[255, 350, 445].map((x) => `M${x} ${FRONT.top}V${FRONT.slab}`),
          ...[255, 385, 480].map((x) => `M${x} ${FRONT.ground}V${FRONT.floor}`),
        ].join("")}
        className="hs-frame__wall"
      />
      <rect
        x={FRONT.left}
        y={FRONT.top}
        width={FRONT.right - FRONT.left}
        height={FRONT.floor - FRONT.top}
        className="hs-frame__edge"
      />
      <path d={`M${FRONT.right} ${FRONT.slab + 3}l${DEPTH.x} ${DEPTH.y}`} className="hs-frame__wall" />

      <Roof />
    </svg>
  );
}
