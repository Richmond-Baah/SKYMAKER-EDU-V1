import fs from 'fs'
import path from 'path'
import { Assignment } from '@/types/assignment'

const DATA_DIR = path.resolve(process.cwd(), 'data')
const FILE = path.join(DATA_DIR, 'server-assignments.json')

function ensureDataFile() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })
  if (!fs.existsSync(FILE)) fs.writeFileSync(FILE, '[]')
}

export function readServerAssignments(): Assignment[] {
  try {
    ensureDataFile()
    const raw = fs.readFileSync(FILE, 'utf-8')
    return JSON.parse(raw || '[]') as Assignment[]
  } catch (err) {
    return []
  }
}

export function findServerAssignment(code: string): Assignment | undefined {
  const list = readServerAssignments()
  return list.find(a => a.code === code)
}

export function saveServerAssignment(a: Assignment) {
  const list = readServerAssignments()
  list.push(a)
  fs.writeFileSync(FILE, JSON.stringify(list, null, 2), 'utf-8')
  return a
}
