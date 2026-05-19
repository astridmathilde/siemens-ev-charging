# EV charging motion sandbox (prototype)

A lightweight React + TypeScript sandbox for exploring motion-language concepts for an EV “Charging speed” card (Siemens-connected context).

This is intentionally **not** a production app—it's a sketch environment for testing:
- state mapping (kW / battery % / temperature / power sharing)
- responsive layouts (mobile / medium / large preview frames)
- multiple motion modes (Canvas)
- rapid tuning via “Advanced controls”

## Run locally

```bash
cd ev-charging-motion-prototype
npm install
npm run dev
```

Then open the URL printed in your terminal (usually `http://localhost:5173/`, or the next available port).

## What to explore
- **Charging speed slider**: 0–350 kW
- **Battery %**: observe taper after ~80%
- **Temperature** and **Power sharing**: see “Reduced/Limited” behavior
- **Motion modes**: electron cloud, particle stream, soft glow pulse, energy column
- **Advanced controls**: particle count/size, glow, speed, spread, jitter, pulse, turbulence

## File structure

- `src/App.tsx`: layout shell, viewport presets, compare toggle, shared motion settings
- `src/components/ControlPanel.tsx`: input controls + advanced tuning UI
- `src/components/ChargingScreenPreview.tsx`: preview frame + charging UI composition
- `src/components/ChargingSpeedCard.tsx`: reusable card with embedded motion area
- `src/state/chargingState.ts`: readable state mapping + explanation text
- `src/state/constants.ts`, `src/state/presets.ts`: thresholds + preset buttons
- `src/motion/MotionRenderer.tsx`: Canvas loop, resize handling, smooth transitions
- `src/motion/params.ts`: motion parameter schema (drives advanced sliders)
- `src/motion/modes/*`: individual motion mode implementations (swap-friendly)
- `src/styles/*`: theme + layout + preview styling

## Tweak tips
- Start with `src/motion/modes/electronCloud.ts` for the primary exploration mode.
- The control panel “Advanced controls” sliders map directly to `src/motion/params.ts`.
- The interpretive logic (Reduced/Optimal/Fast/Slow/Limited) lives in `src/state/chargingState.ts`.
