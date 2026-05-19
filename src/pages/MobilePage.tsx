import { useMemo } from 'react'
import { MobilePreview } from '../components/MobilePreview'
import { DEFAULT_MOTION_PARAMS } from '../motion/params'
import { deriveChargingState } from '../state/chargingState'
import { DEFAULT_INPUTS } from '../state/constants'

export default function MobilePage() {
  const derived = useMemo(() => deriveChargingState(DEFAULT_INPUTS), [])

  return (
    <>
      <style>{`
        .mobilePage .previewMeta   { display: none; }
        .mobilePage .previewWrap   { width: 100vw; height: 100dvh; }
        .mobilePage .previewFrame  { width: 100% !important; height: 100% !important; }
        .mobilePage .chargingScreen { width: 100%; height: 100%; }
      `}</style>
      <div className="mobilePage">
        <MobilePreview
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