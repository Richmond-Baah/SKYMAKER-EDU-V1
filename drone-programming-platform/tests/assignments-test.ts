import { createAssignment, getAssignment, clearAssignmentsForTesting } from '@/lib/assignments'

async function run() {
  console.log('Running assignments tests...')
  clearAssignmentsForTesting()
  const a = createAssignment(['mission_01', 'mission_02'], 'Test Pack')
  console.log('Created assignment code:', a.code)
  const fetched = getAssignment(a.code)
  if (fetched && fetched.missions.length === 2) console.log('✅ assignments: create/get OK')
  else console.error('❌ assignments: failure')
}

run()
