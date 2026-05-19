import type { MotionParams } from '../motion/params'
import { MOTION_PARAM_SCHEMA } from '../motion/params'
import type { MotionModeId } from '../motion/types'
import { MOTION_MODES } from '../motion/types'
import type { ChargingInputs } from '../state/types'
import { PRESETS } from '../state/presets'

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n))
}

export function ControlPanel(props: {
  viewMode: 'station' | 'mobile'
  onViewModeChange: (v: 'station' | 'mobile') => void
  mode: MotionModeId
  onModeChange: (m: MotionModeId) => void
  motionParams: MotionParams
  onMotionParamsChange: (p: MotionParams) => void
  inputsA: ChargingInputs
  onInputsAChange: (i: ChargingInputs) => void
  inputsB: ChargingInputs
  onInputsBChange: (i: ChargingInputs) => void
  compareEnabled: boolean
  onApplyPreset: (partial: Partial<ChargingInputs>, target: 'A' | 'B') => void
}) {
  const {
    viewMode,
    onViewModeChange,
    mode,
    onModeChange,
    motionParams,
    onMotionParamsChange,
    inputsA,
    onInputsAChange,
    inputsB,
    onInputsBChange,
    compareEnabled,
    onApplyPreset,
  } = props

  const setKw = (v: number, target: 'A' | 'B') => {
    const nextKw = clamp(v, 0, 350)
    if (target === 'A') onInputsAChange({ ...inputsA, kw: nextKw })
    else onInputsBChange({ ...inputsB, kw: nextKw })
  }

  const setBatteryPct = (v: number, target: 'A' | 'B') => {
    const next = clamp(v, 0, 100)
    if (target === 'A') onInputsAChange({ ...inputsA, batteryPct: next })
    else onInputsBChange({ ...inputsB, batteryPct: next })
  }

  const setTemperature = (v: ChargingInputs['temperature'], target: 'A' | 'B') => {
    if (target === 'A') onInputsAChange({ ...inputsA, temperature: v })
    else onInputsBChange({ ...inputsB, temperature: v })
  }

  const setPowerSharing = (v: ChargingInputs['powerSharing'], target: 'A' | 'B') => {
    if (target === 'A') onInputsAChange({ ...inputsA, powerSharing: v })
    else onInputsBChange({ ...inputsB, powerSharing: v })
  }

  const setExplanationMode = (v: ChargingInputs['explanationMode'], target: 'A' | 'B') => {
    if (target === 'A') onInputsAChange({ ...inputsA, explanationMode: v })
    else onInputsBChange({ ...inputsB, explanationMode: v })
  }

  const setManualExplanation = (v: string, target: 'A' | 'B') => {
    if (target === 'A') onInputsAChange({ ...inputsA, manualExplanation: v })
    else onInputsBChange({ ...inputsB, manualExplanation: v })
  }

  const setParam = (key: keyof MotionParams, value: number) => {
    onMotionParamsChange({ ...motionParams, [key]: value })
  }

  const renderInputs = (target: 'A' | 'B', inputs: ChargingInputs) => {
    return (
      <div className="cpGroup">
        <div className="cpTitle">Inputs {target}</div>

        <div className="cpRow">
          <div className="cpRowLabel">
            <span>Charging speed</span>
            <span>{Math.round(inputs.kw)} kW</span>
          </div>
          <input
            type="range"
            min={0}
            max={350}
            value={inputs.kw}
            onChange={(e) => setKw(Number(e.target.value), target)}
          />
          <div className="cpInline">
            {Object.values(PRESETS).map((p) => (
              <button
                key={p.id}
                type="button"
                className="chip"
                onClick={() => onApplyPreset(p.apply, target)}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div className="cpRow">
          <div className="cpRowLabel">
            <span>Battery %</span>
            <span>{Math.round(inputs.batteryPct)}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={inputs.batteryPct}
            onChange={(e) => setBatteryPct(Number(e.target.value), target)}
          />
        </div>

        <div className="cpRow">
          <div className="cpRowLabel">
            <span>Temperature</span>
            <span>{inputs.temperature}</span>
          </div>
          <select
            value={inputs.temperature}
            onChange={(e) => setTemperature(e.target.value as ChargingInputs['temperature'], target)}
          >
            <option value="cold">Cold battery</option>
            <option value="normal">Normal battery</option>
            <option value="warm">Warm / ideal</option>
          </select>
        </div>

        <div className="cpRow">
          <div className="cpRowLabel">
            <span>Power sharing</span>
            <span>{inputs.powerSharing}</span>
          </div>
          <select
            value={inputs.powerSharing}
            onChange={(e) =>
              setPowerSharing(e.target.value as ChargingInputs['powerSharing'], target)
            }
          >
            <option value="none">None</option>
            <option value="shared">Shared power</option>
          </select>
        </div>

        <div className="cpRow">
          <div className="cpRowLabel">
            <span>Explanation</span>
            <span>{inputs.explanationMode}</span>
          </div>
          <select
            value={inputs.explanationMode}
            onChange={(e) =>
              setExplanationMode(e.target.value as ChargingInputs['explanationMode'], target)
            }
          >
            <option value="auto">Auto</option>
            <option value="manual">Manual</option>
          </select>
          {inputs.explanationMode === 'manual' ? (
            <textarea
              value={inputs.manualExplanation ?? ''}
              onChange={(e) => setManualExplanation(e.target.value, target)}
              placeholder="Type an explanation..."
            />
          ) : (
            <div className="cpHelp">Auto text is derived from battery %, temperature, and power sharing.</div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="cpGroup">
        <div className="cpTitle">Display View</div>
        <div className="cpRow">
          <div className="cpRowLabel">
            <span>View Mode</span>
            <span>{viewMode === 'station' ? 'Station Screen' : 'Mobile App'}</span>
          </div>
          <select
            value={viewMode}
            onChange={(e) => onViewModeChange(e.target.value as 'station' | 'mobile')}
          >
            <option value="station">Station (ChargingScreenPreview)</option>
            <option value="mobile">Mobile (MobilePreview)</option>
          </select>
        </div>
      </div>

      <div className="cpGroup">
        <div className="cpTitle">Motion</div>

        <div className="cpRow">
          <div className="cpRowLabel">
            <span>Mode</span>
            <span>{MOTION_MODES.find((m) => m.id === mode)?.label ?? mode}</span>
          </div>
          <select value={mode} onChange={(e) => onModeChange(e.target.value as MotionModeId)}>
            {MOTION_MODES.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label}
              </option>
            ))}
          </select>
          <div className="cpHelp">
            Electron cloud is the primary exploration mode; the others are alternate motion languages for comparison.
          </div>
        </div>
      </div>

      {renderInputs('A', inputsA)}
      {compareEnabled ? renderInputs('B', inputsB) : null}

      <details className="cpGroup">
        <summary className="cpTitle" style={{ cursor: 'pointer' }}>
          Advanced controls
        </summary>
        <div className="cpHelp" style={{ marginTop: 8 }}>
          These directly affect the renderer. Good for tuning “feel” quickly.
        </div>
        {MOTION_PARAM_SCHEMA.map((p) => (
          <div key={p.key} className="cpRow">
            <div className="cpRowLabel">
              <span>{p.label}</span>
              <span style={{ fontFamily: 'var(--mono)' }}>{motionParams[p.key].toFixed(2)}</span>
            </div>
            <input
              type="range"
              min={p.min}
              max={p.max}
              step={p.step}
              value={motionParams[p.key]}
              onChange={(e) => setParam(p.key, Number(e.target.value))}
            />
            {p.help ? <div className="cpHelp">{p.help}</div> : null}
          </div>
        ))}
      </details>
    </div>
  )
}