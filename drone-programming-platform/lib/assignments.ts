import { Assignment } from '@/types/assignment'

const STORAGE_KEY = 'skymakers:assignments'

function isClient() {
  return typeof window !== 'undefined'
}

function loadAll(): Assignment[] {
  if (!isClient()) return []
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') as Assignment[]
  } catch {
    return []
  }
}

function saveAll(list: Assignment[]) {
  if (!isClient()) return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
}

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export function createAssignment(missions: string[], title?: string, deadline?: string | null, description?: string | null) {
  const code = generateCode()
  const a: Assignment = {
    code,
    title,
    description: description || null,
    missions,
    deadline: deadline || null,
    createdAt: new Date().toISOString(),
  }

  const list = loadAll()
  list.push(a)
  saveAll(list)
  return a
}

export function getAssignment(code: string): Assignment | undefined {
  return loadAll().find(a => a.code === code)
}

export function listAssignments(): Assignment[] {
  return loadAll()
}

export function clearAssignmentsForTesting() {
  if (!isClient()) return
  localStorage.removeItem(STORAGE_KEY)
}
