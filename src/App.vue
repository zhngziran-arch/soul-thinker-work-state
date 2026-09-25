<template>
  <div class="app-shell">
    <header class="site-header">
      <button class="brand" @click="screen='start'" aria-label="上班状态测试 · Soul Thinker，返回首页"><span class="brand-mark"><img src="/soul-thinker-logo-transparent.png" alt="" /></span><span class="brand-lockup"><span class="brand-title">上班状态测试</span><small>SOUL THINKER</small></span></button>
    </header>
    <main>
      <StartScreen v-if="screen==='start'" :initial-display-name="displayName" :has-draft="hasDraft" :has-report="complete" @start="start" @resume="resume" />
      <QuizScreen v-else-if="screen==='quiz'" :key="quizSession" :answers="answers" :initial-index="index" @answer="answer" @progress="progress" @exit="screen='start'" @complete="finishQuiz" />
      <ResultScreen v-else-if="screen==='result' && results" :results="results" @edit="editAnswers" @share="showShare=true" @notice="notify" />
    </main>
    <footer class="site-footer"><span>Soul Thinker · 上班状态测试</span><button v-if="hasDraft" class="text-button" @click="requestClear=true">清掉这次的答案</button></footer>
    <SharePosterModal v-if="showShare && results" :results="results" @close="showShare=false" />
    <div v-if="requestClear" class="modal-backdrop" @click.self="requestClear=false"><section ref="clearDialog" class="paper confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="clear-title" @keydown="trapDialog"><h2 id="clear-title">清掉这次的答案？</h2><p class="muted">清掉以后，就不能接着上次答了。</p><div class="dialog-actions"><button class="secondary" @click="requestClear=false">先留着</button><button class="primary" @click="clear">清掉</button></div></section></div>
    <div v-if="notice" class="toast" role="status">{{ notice }}</div>
    <p v-if="storageFailed" class="storage-warning" role="status">浏览器没有保存成功。离开前可以先把结果存下来。</p>
  </div>
</template>
<script setup>
import { ref, watch, nextTick, onUnmounted } from 'vue'
import StartScreen from './components/StartScreen.vue'
import QuizScreen from './components/QuizScreen.vue'
import ResultScreen from './components/ResultScreen.vue'
import SharePosterModal from './components/SharePosterModal.vue'
import { calculateResults } from './utils/calculator.js'
import { loadDraft, saveDraft, clearDraft } from './utils/storage.js'
import { quizSteps, activeFollowup } from './data/quizData.js'

const draft = loadDraft()
const screen = ref('start'), displayName = ref(draft?.displayName || ''), answers = ref(draft?.answers || {}), index = ref(draft?.index || 0)
const complete = ref(draft?.complete || false), evaluatedAt = ref(draft?.evaluatedAt || null), quizSession = ref(0)
const hasDraft = ref(!!draft), results = ref(null), showShare = ref(false), storageFailed = ref(false), requestClear = ref(false), clearDialog = ref(null), notice = ref('')
let toastTimer, previousFocus
const notify = text => { notice.value = text; clearTimeout(toastTimer); toastTimer = setTimeout(() => notice.value = '', 3500) }
const persist = () => { hasDraft.value = true; storageFailed.value = !saveDraft({ displayName:displayName.value, answers:answers.value, index:index.value, complete:complete.value, evaluatedAt:evaluatedAt.value }) }
const start = name => { displayName.value = name; answers.value = {}; index.value = 0; complete.value = false; evaluatedAt.value = null; results.value = null; quizSession.value++; screen.value = 'quiz'; persist() }
const resume = () => { if (complete.value) showResult(); else { quizSession.value++; screen.value = 'quiz' } }
const answer = ({ questionId, optionId }) => {
  answers.value[questionId] = optionId
  const active = activeFollowup(answers.value)
  for (const id of ['follow-energy','follow-boundary','follow-control','follow-connection','follow-return','follow-growth','follow-positive']) if (id !== active?.id) delete answers.value[id]
  complete.value = false; evaluatedAt.value = null; persist()
}
const progress = value => { index.value = value; persist() }
const finishQuiz = () => { if (quizSteps(answers.value).every(q => answers.value[q.id])) showResult(); else notify('还有没答的题，往前翻翻。') }
const showResult = () => { try { results.value = calculateResults(answers.value, displayName.value); if (evaluatedAt.value) results.value.evaluatedAt = evaluatedAt.value; else evaluatedAt.value = results.value.evaluatedAt; complete.value = true; screen.value = 'result'; persist() } catch (error) { notify(error.message); screen.value = 'quiz' } }
const editAnswers = id => { const position = quizSteps(answers.value).findIndex(q => q.id === id); index.value = position >= 0 ? position : 0; quizSession.value++; screen.value = 'quiz' }
const clear = () => { if (!clearDraft()) { requestClear.value = false; notify('清除失败，请在浏览器设置中删除本站数据。'); return }; answers.value = {}; displayName.value = ''; index.value = 0; complete.value = false; evaluatedAt.value = null; results.value = null; hasDraft.value = false; requestClear.value = false; screen.value = 'start'; notify('已清除') }
const trapDialog = e => { if (e.key === 'Escape') { requestClear.value = false; return }; if (e.key !== 'Tab') return; const nodes = clearDialog.value.querySelectorAll('button'); if (e.shiftKey && document.activeElement === nodes[0]) { e.preventDefault(); nodes[nodes.length - 1].focus() } else if (!e.shiftKey && document.activeElement === nodes[nodes.length - 1]) { e.preventDefault(); nodes[0].focus() } }
watch(requestClear, async open => { if (open) { previousFocus = document.activeElement; await nextTick(); clearDialog.value?.querySelector('button')?.focus() } else previousFocus?.focus() })
watch(screen, () => window.scrollTo({ top:0, behavior:'smooth' }))
onUnmounted(() => clearTimeout(toastTimer))
</script>
