import { useMemo, useState } from 'react'
import { ChargingScreenPreview } from './components/ChargingScreenPreview'
import { MobilePreview } from './components/MobilePreview'
import { ControlPanel } from './components/ControlPanel'
import type { MotionModeId } from './motion/types'
import { DEFAULT_MOTION_PARAMS } from './motion/params'
import type { MotionParams } from './motion/params'
import { deriveChargingState } from './state/chargingState'
import { DEFAULT_INPUTS } from './state/constants'
import type { ChargingInputs } from './state/types'

export default function App() {
  const [viewMode, setViewMode] = useState<'station' | 'mobile'>('station')
  const [viewport, setViewport] = useState<'mobile' | 'medium' | 'large'>('medium')
  const [compareEnabled, setCompareEnabled] = useState(false)
  const [motionEnabled, setMotionEnabled] = useState(true)
  const [mode, setMode] = useState<MotionModeId>('electronCloud')
  const [seed, setSeed] = useState(1)

  const [inputsA, setInputsA] = useState<ChargingInputs>(DEFAULT_INPUTS)
  const [inputsB, setInputsB] = useState<ChargingInputs>({
    ...DEFAULT_INPUTS,
    kw: 120,
    temperature: 'cold',
    powerSharing: 'shared',
    batteryPct: 82,
  })

  const [motionParams, setMotionParams] = useState<MotionParams>(DEFAULT_MOTION_PARAMS)

  const derivedA = useMemo(() => deriveChargingState(inputsA), [inputsA])
  const derivedB = useMemo(() => deriveChargingState(inputsB), [inputsB])

  // Select component dynamically based on setup controls
  const PreviewComponent = viewMode === 'station' ? ChargingScreenPreview : MobilePreview

  return (
    <div className="appRoot">
      <header className="appHeader">
        <div className="appHeaderTitle">
          <div className="appHeaderEyebrow">Prototype</div>
          <div className="appHeaderName">Charging speed motion sandbox</div>
        </div>
        <div className="appHeaderActions">
          <div className="segmented" role="group" aria-label="Viewport presets">
            <button
              type="button"
              className={viewport === 'mobile' ? 'segmentedBtn isActive' : 'segmentedBtn'}
              onClick={() => setViewport('mobile')}
            >
              Mobile
            </button>
            <button
              type="button"
              className={viewport === 'medium' ? 'segmentedBtn isActive' : 'segmentedBtn'}
              onClick={() => setViewport('medium')}
            >
              Medium
            </button>
            <button
              type="button"
              className={viewport === 'large' ? 'segmentedBtn isActive' : 'segmentedBtn'}
              onClick={() => setViewport('large')}
            >
              Large
            </button>
          </div>

          <label className="toggle">
            <input
              type="checkbox"
              checked={motionEnabled}
              onChange={(e) => setMotionEnabled(e.target.checked)}
            />
            <span>Motion</span>
          </label>

          <label className="toggle">
            <input
              type="checkbox"
              checked={compareEnabled}
              onChange={(e) => setCompareEnabled(e.target.checked)}
            />
            <span>Compare</span>
          </label>

          <button type="button" className="btn" onClick={() => setSeed((s) => s + 1)}>
            Randomize seed
          </button>
        </div>
      </header>

      <div className="appBody">
        <aside className="panel">
          <ControlPanel
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            mode={mode}
            onModeChange={setMode}
            motionParams={motionParams}
            onMotionParamsChange={setMotionParams}
            inputsA={inputsA}
            onInputsAChange={setInputsA}
            inputsB={inputsB}
            onInputsBChange={setInputsB}
            compareEnabled={compareEnabled}
            onApplyPreset={(partial, target) => {
              if (target === 'A') setInputsA((prev) => ({ ...prev, ...partial }))
              else setInputsB((prev) => ({ ...prev, ...partial }))
            }}
          />
        </aside>

        <main className="stage">
          <div className={compareEnabled ? 'previewGrid isCompare' : 'previewGrid'}>
            <PreviewComponent
              label="A"
              viewport={viewport}
              inputs={inputsA}
              derived={derivedA}
              mode={mode}
              motionEnabled={motionEnabled}
              motionParams={motionParams}
              seed={seed}
            />
            {compareEnabled ? (
              <PreviewComponent
                label="B"
                viewport={viewport}
                inputs={inputsB}
                derived={derivedB}
                mode={mode}
                motionEnabled={motionEnabled}
                motionParams={motionParams}
                seed={seed + 1000}
              />
            ) : null}
          </div>
        </main>
      </div>
    </div>
  )
}