import test from 'node:test'
import assert from 'node:assert/strict'
import { calculateResults } from '../src/utils/calculator.js'
import { questions, dimensions, activeFollowup, quizSteps, priorityQuestion } from '../src/data/quizData.js'
import { loadDraft, saveDraft, clearDraft } from '../src/utils/storage.js'

const profile = (high = []) => {
  const answers = Object.fromEntries(questions.map(q => [q.id, high.includes(q.dimension) ? 'D' : 'A']))
  const follow = activeFollowup(answers)
  answers[follow.id] = follow.options[0]
  answers.priority = priorityQuestion.options[0]
  return answers
}

test('all eight work states are reachable and have usable advice', () => {
  for (let mask = 0; mask < 8; mask++) {
    const high = [
      ...(mask & 4 ? ['energy'] : []),
      ...(mask & 2 ? ['boundary', 'control'] : []),
      ...(mask & 1 ? ['connection', 'return', 'growth'] : []),
    ]
    const result = calculateResults(profile(high))
    assert.equal(result.profile.code, mask.toString(2).padStart(3, '0'))
    assert.ok(result.actions.length >= 1 && result.actions.length <= 2)
    assert.equal(new Set(result.dimensions.map(d => d.id)).size, 6)
    assert.ok(result.dimensions.every(d => d.score >= 0 && d.score <= 100))
  }
})

test('score direction and map shape stay clear', () => {
  const result = calculateResults(profile(['energy', 'boundary', 'control', 'connection', 'return', 'growth']))
  assert.ok(result.dimensions.every(d => d.score === 100))
  assert.equal(result.profile.code, '111')
  assert.equal(result.focus.kind, 'steady')
  assert.equal(result.actions.length, 1)
  assert.equal(result.alerts.length, 0)
  const low = calculateResults(profile())
  assert.ok(low.dimensions.every(d => d.score === 0))
  assert.equal(low.profile.code, '000')
})

test('the extra question follows the weakest dimension and changes its advice', () => {
  const a = profile(['boundary', 'control', 'connection', 'return', 'growth'])
  const b = profile(['energy', 'control', 'connection', 'return', 'growth'])
  assert.equal(activeFollowup(a).id, 'follow-energy')
  assert.equal(activeFollowup(b).id, 'follow-boundary')
  assert.equal(quizSteps(a).length, 26)
  assert.equal(calculateResults(a).focus.id, 'energy')
  assert.equal(calculateResults(b).focus.id, 'boundary')
  assert.notEqual(calculateResults(a).actions[0].text, calculateResults(b).actions[0].text)
  const c = { ...a, 'follow-energy': activeFollowup(a).options[1] }
  assert.notEqual(calculateResults(a).actions[0].text, calculateResults(c).actions[0].text)
})

test('serious answers surface support even when the average is high', () => {
  const answers = profile(['energy', 'boundary', 'control', 'connection', 'return', 'growth'])
  answers[3] = 'A'
  answers[15] = 'A'
  answers[18] = 'A'
  delete answers['follow-energy']
  const follow = activeFollowup(answers)
  answers[follow.id] = follow.options[0]
  const result = calculateResults(answers)
  assert.equal(result.alerts.length, 3)
  assert.ok(result.alerts.every(a => a.text.length > 10))
})

test('unfinished or invalid responses never produce a result', () => {
  assert.throws(() => calculateResults({}), /第 1 题/)
  const answers = profile()
  delete answers.priority
  assert.throws(() => calculateResults(answers), /收尾题/)
  answers.priority = priorityQuestion.options[0]
  answers[1] = 'Z'
  assert.throws(() => calculateResults(answers), /第 1 题/)
})

test('draft keeps only current model and valid answers', () => {
  const map = new Map([['other', 'keep']])
  globalThis.localStorage = {
    getItem: key => map.get(key) ?? null,
    setItem: (key, value) => map.set(key, value),
    removeItem: key => map.delete(key),
  }
  try {
    const answers = profile(dimensions.map(d => d.id))
    assert.equal(saveDraft({ displayName: '阿乔', answers, complete: true, index: 999 }), true)
    assert.equal(loadDraft().index, 25)
    assert.equal(loadDraft().complete, true)
    assert.equal(loadDraft().displayName, '阿乔')
    assert.equal(clearDraft(), true)
    assert.equal(map.get('other'), 'keep')
    assert.equal(loadDraft(), null)
    map.set('soul-thinker-work-state-v3', '{bad json')
    assert.equal(loadDraft(), null)
  } finally {
    delete globalThis.localStorage
  }
})
