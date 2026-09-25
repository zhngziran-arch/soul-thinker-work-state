import { questions, followups, positiveFollowup, priorityQuestion, quizSteps } from '../data/quizData.js'
import { MODEL_VERSION } from './calculator.js'

const KEY = 'soul-thinker-work-state-v3'
const all = [...questions, ...Object.values(followups), positiveFollowup, priorityQuestion]

export function loadDraft() {
  try {
    const data = JSON.parse(localStorage.getItem(KEY))
    if (!data || data.version !== MODEL_VERSION || !data.answers || typeof data.answers !== 'object') return null
    const answers = {}
    for (const q of all) {
      const value = data.answers[q.id]
      if (q.options.some(option => (typeof option === 'string' ? option : option.id) === value)) answers[q.id] = value
    }
    const steps = quizSteps(answers)
    return {
      displayName: typeof data.displayName === 'string' ? data.displayName.slice(0, 20) : '', answers,
      index: Number.isInteger(data.index) ? Math.max(0, Math.min(steps.length - 1, data.index)) : 0,
      complete: !!data.complete && steps.length === 26 && steps.every(q => answers[q.id]),
      evaluatedAt: typeof data.evaluatedAt === 'string' ? data.evaluatedAt : null,
    }
  } catch { return null }
}
export function saveDraft(data) {
  try { localStorage.setItem(KEY, JSON.stringify({ ...data, version: MODEL_VERSION })); return true } catch { return false }
}
export function clearDraft() {
  try { localStorage.removeItem(KEY); return true } catch { return false }
}
