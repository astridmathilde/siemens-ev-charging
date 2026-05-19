import { useMemo } from 'react'
import { ChargingScreenPreview } from '../components/ChargingScreenPreview'
import { DEFAULT_MOTION_PARAMS } from '../motion/params'
import { deriveChargingState } from '../state/chargingState'
import { DEFAULT_INPUTS } from '../state/constants'

export default function StationPage() {
  const derived = useMemo(() => deriveChargingState(DEFAULT_INPUTS), [])

  return (
    <>
      <style>{`
        .stationPage .previewMeta   { display: none; }
        .stationPage .previewWrap   { width: 100vw; height: 100dvh; }
        .stationPage .previewFrame  { width: 100% !important; height: 100% !important; }
        .stationPage .chargingScreen { width: 100%; height: 100%; }
      `}</style>
      <div className="stationPage">
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