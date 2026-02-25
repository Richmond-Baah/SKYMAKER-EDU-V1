import { gradeMission } from '@/lib/grading'

async function run() {
  console.log('Running grading tests...')
  const result = gradeMission('mission_01', 'drone.takeoff()\ndrone.land()', { path: [{ x: 0, y: 0, z: 1 }], time: 5, maxAltitude: 1, landed: true }, { landed: true, minAltitude: 1.0 })
  console.log('Grade result:', result)
  if (result.passed) console.log('✅ grading: basic pass logic OK')
  else console.error('❌ grading: expected pass')
}

run()
