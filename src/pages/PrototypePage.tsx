import { useMemo } from 'react'
import { ChargingScreenPreview } from '../components/ChargingScreenPreview'
import { DEFAULT_MOTION_PARAMS } from '../motion/params'
import { deriveChargingState } from '../state/chargingState'
import { DEFAULT_INPUTS } from '../state/constants'

export default function PrototypePage() {
  const derived = useMemo(() => deriveChargingState(DEFAULT_INPUTS), [])

  return (
    <>
      <style>{`
        .prototypePage .previewMeta   { display: none; }
        .prototypePage .previewWrap   { width: 100vw; height: 100dvh; }
        .prototypePage .previewFrame  { width: 100% !important; height: 100% !important; }
        .prototypePage .chargingScreen { width: 100%; height: 100%; }
      `}</style>
      <div className="prototypePage">
        <ChargingScreenPreview
          label="A"
          viewport="mobile"
          inputs={DEFAULT_INPUTS}
          derived={derived}
          mode="particleStream"
          motionEnabled={true}
          motionParams={DEFAULT_MOTION_PARAMS}
          seed={1}
        />
      </div>
    </>
  )
}

