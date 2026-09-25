import { questions, dimensions, dimensionScores, activeFollowup, priorityQuestion } from '../data/quizData.js'

export const MODEL_VERSION = '3.0'

const profiles = {
  '111': { name: '最近上班还挺顺', line: '有力气做事，也能从这里得到想要的东西。', shareLine: '做事有力气，这份工作也还有想要的东西。' },
  '110': { name: '能干，就是不太值', line: '事做得动，也有自己的办法。只是回头一看，得到的有点少。', shareLine: '事情做得动，也有办法，只是收获少了点。' },
  '101': { name: '有收获，没法做主', line: '这份工作不是一无是处，可很多时候你只能照着别人的想法来。', shareLine: '事情有收获，可做法常常不能自己决定。' },
  '100': { name: '能扛，但不想再扛', line: '本事和力气还在，心里却越来越想问一句：我图什么？', shareLine: '本事和力气还在，就是越来越想问：图什么？' },
  '011': { name: '有盼头，但是快没电了', line: '事情有意思，收获也看得见。可你最近确实有点累了。', shareLine: '事情有意思，收获也看得见，但是真的有点累了。' },
  '010': { name: '能做主，没人接住', line: '有些事你说了算，但累的时候，回头看不到几个能搭把手的人。', shareLine: '能自己做主，累的时候却很少有人搭把手。' },
  '001': { name: '看着不错，待着难受', line: '别人可能觉得这工作挺好。可每天在里面的人是你。', shareLine: '工作看着不错，日子过起来却不轻松。' },
  '000': { name: '上班快把你掏空了', line: '现在最缺的可能不是下一步计划，而是一口喘气的空间。', shareLine: '现在最缺的不是计划，是一口喘气的空间。' },
}

const concerns = {
  energy: { label: '电量', note: '这份消耗已经开始挤占下班后的生活。累到什么程度，值得按实际情况看，别总归到“最近有点忙”。' },
  boundary: { label: '边界', note: '你想拿回的是一段完整的休息时间。消息和临时任务总插进来，人很难真正下班。' },
  control: { label: '掌控', note: '有些事要你负责，怎么做却不一定由你决定。光靠更努力，解决不了这层憋屈。' },
  connection: { label: '关系', note: '你期待的不是客套安慰，而是卡住时有人愿意听，也愿意搭把手。' },
  return: { label: '回报', note: '你在意付出有没有回音。它可能是薪资、兑现的承诺，也可能是清楚的评价标准。' },
  growth: { label: '成长', note: '手里的事越来越熟，新的东西却没长出来。你在意的是继续做下去能不能留下可带走的经验。' },
}

// 同一短板下，按用户最后选中的具体情境给一件不同的小事。
const specificTasks = {
  energy: [
    '如果身体和睡眠已经被影响，这周先留出一个不加班的晚上。能就医或请假时，别把休息排在最后。',
    '记下这一周做完后有点满足的事，哪怕只有一件。也记下最耗你的杂事，看看能不能少接一点。',
    '周日晚上开始紧绷时，先别打开工作消息。写下明天第一件要做的事，然后把手机放远。',
    '说不清为什么累，也可以先停。给自己一个不用解释原因的晚上，第二天再想接下来怎么办。',
  ],
  boundary: [
    '选一个晚上设为下班后的空白时间。非紧急消息，第二天上班再回。',
    '这周挑一天，给周末工作消息设一个统一查看时段。其余时间先别守着手机。',
    '下一次请假前，把交接写成三句话：现在到哪、谁接手、什么情况才需要找你。',
    '忙的时候先保住睡觉时间。下次新任务插进来，问一句“这件加进来，哪件可以往后排？”',
  ],
  control: [
    '下一次方向变了，先请对方确认新目标和截止时间。已经做过的部分也留个记录。',
    '找一件风险小的事，提出你想试的做法，并约好用什么结果来判断有没有用。',
    '下一次接任务时，把谁拍板、谁负责讲清楚。后果不该全落在没做决定的人身上。',
    '挑一条最容易落地的建议，写成“问题—改法—省下什么”，再找能拍板的人聊。',
  ],
  connection: [
    '找一个相对可信的人，只说眼下最卡的一件事，问问他愿不愿意和你一起想十分钟。',
    '下一次讨论时，先说一个你真正不同意的点。可以从小事开始，看对方有没有认真听。',
    '把最近做成的一件事和自己的贡献记下来。向一个了解项目的人讲清楚这部分工作。',
    '如果相处让你不安全，先把经历和时间记下来，并找可信的人或合适的支持渠道。别独自硬扛。',
  ],
  return: [
    '把最近做成的三件事、对应的结果和你想谈的薪资写在一页纸上，再约一次正式谈话。',
    '把对方承诺过的事和时间点列出来。下次沟通只问一件事：具体什么时候兑现？',
    '问清下一次评价看哪些指标、由谁决定、什么时候回看。没有标准，也值得知道。',
    '挑一件最能说明你贡献的事，把结果发给真正需要知道的人，不用等别人替你说。',
  ],
  growth: [
    '挑一件反复占时间的杂事，记下它一周花掉多少时间。再找机会谈删掉、合并或交接；拿着具体例子，比只说“太忙了”更容易谈。',
    '给等待设一个复盘时间，比如下个项目结束。看看有没有新职责落下来，或做成一件能写进简历的事；到点仍没变化，就按事实重新评估。',
    '选一项你想带走的本事，找手头的一件小任务练一次。做完把过程和结果记下来，别只停在“我想学”。',
    '从熟练活里找一个能试新方法的环节，看看返工或耗时有没有变化。把结果留下来，下一次争取更有挑战的工作时就有东西可讲。',
  ],
}

const specificTaskTitles = {
  energy: ['睡觉这件事，先排在前面', '看看什么事还让你有劲', '周日晚上，别提前开工', '说不清，也可以先停'],
  boundary: ['给自己留一个完整的晚上', '周末别一直守着手机', '请假前，找好接力的人', '新任务来了，先问哪件往后放'],
  control: ['方向变了，先把新目标问清', '找件小事试试你的办法', '决定和责任得是同一回事', '把你的建议再说具体一点'],
  connection: ['找个人一起想十分钟', '从一件小事开始说不同意', '让那份功劳回到你身上', '先找个站在你这边的人'],
  return: ['准备一次正式的谈薪', '别让承诺一直悬着', '把评价标准问明白', '让做成的事被看见'],
  growth: ['看看杂事占掉了多少时间', '给等待设个复盘点', '选一项真的想学的本事', '熟活也能换种做法'],
}

const positiveTaskTitles = ['把有意思的事留在日程里', '守住下班后的时间', '跟帮过你的人说一声', '记下这一段的收获']
const positiveTasks = [
  '想一件最近做得最起劲的事。它为什么有意思？下次排工作时，试着多给这类事留点位置。',
  '现在能好好下班挺难得。以后临时加活，先问能不能放到工作时间做。',
  '想到一个最近帮过你的人，告诉他是哪件事让你轻松了些。好关系也需要有人回应。',
  '把最近最实在的一项收获记下来。等你以后再想“这份工作值不值”时，可以拿它对照。',
]

const followupAnswerLabels = {
  'follow-positive': '你最想留住的是',
  'follow-energy': '你希望别人明白的是',
  'follow-boundary': '你最想拿回的是',
  'follow-control': '最让你憋屈的是',
  'follow-connection': '你最想听到的是',
  'follow-return': '你最想等到的是',
  'follow-growth': '你最不想再经历的是',
}

const priorityMoves = [
  {
    focusDimension: 'boundary',
    action: { title: '先给自己留一段时间', text: '这周挑一个晚上，不处理非紧急的工作消息。临时任务来了，就和对方排清楚：这件加进来，原计划里的哪件往后放？' },
    overlap: { title: '看看工作占了多少休息时间', text: '把一周里下班后还要处理工作的次数记下来，再拿这份记录和负责人谈一条具体边界。先看它能不能被尊重。' },
  },
  {
    focusDimension: 'connection',
    action: { title: '找一个能听你说完的人', text: '把最近最卡的一件事讲给你信得过的人，问问他愿不愿意一起想下一步。先确认自己能不能得到实际支持，不必马上做去留决定。' },
    overlap: { title: '把你希望团队改变的事说具体', text: '选一件小事，把你需要什么帮助、希望对方怎么回应说清楚。之后看有没有跟进；持续没有回应，也是判断这段关系的信息。' },
  },
  {
    focusDimension: 'return',
    action: { title: '先看看外面有哪些真实选择', text: '找几份同类岗位，看看薪资和要求，顺手更新一版简历。眼下不用决定走不走，先弄清手里的稳定和外面的机会分别是什么。' },
    overlap: { title: '给自己的收入找个参照', text: '把固定收入、浮动部分和还没兑现的承诺分开记，再对照同类岗位的薪资。谈回报时有数可依，决定留不留也更稳。' },
  },
  {
    focusDimension: 'growth',
    action: { title: '做出一件能带走的成果', text: '挑一个能在工作里练到的本事，做成一项讲得清结果的小成果，把过程和结果存下来。岗位暂时没变，至少简历里能多一件做成的事。' },
    overlap: { title: '先盘点已经做成的事', text: '把最近做成的两三件事写成“遇到什么问题、你做了什么、结果怎样”。先看清已有积累，再决定还缺哪项本事。' },
  },
  {
    focusDimension: 'control',
    action: { title: '先争取一件小事由你做主', text: '接任务时先对齐要什么结果，再问具体做法能不能由你定。找一件风险小的事试试，看对方愿不愿意把空间和责任一起交给你。' },
    overlap: { title: '先把决定权和责任对齐', text: '下次承担结果前，确认谁定目标、谁能改方案、出了偏差谁负责。把这几件事说清，再决定怎么接。' },
  },
  {
    focusDimension: null,
    action: { title: '先观察一周，别催自己做决定', text: '每天记一句：什么时候最耗你，什么时候还愿意投入。一周后看看哪种情况反复出现，再挑一件最想先处理的事。' },
  },
]

const priorityDimensions = ['boundary', 'connection', 'return', 'growth', 'control', null]

function makeSummary(low, high) {
  const spread = high.score - low.score
  if (high.score < 50) return `六项都不算轻松。「${low.name}」最让你费心，「${high.name}」只是稍微好一点。`
  if (spread < 12) return `六项分数差不多。「${high.name}」稍微顺一些，「${low.name}」更费心。`
  if (spread >= 25) return `「${high.name}」还算顺，「${low.name}」这块明显拖住了你。`
  return `「${high.name}」相对舒服一些，「${low.name}」这阵子更磨人。`
}

function strongestEvidence(answers, dimension) {
  return questions.filter(q => q.dimension === dimension)
    .map(q => ({ questionId: q.id, option: q.options.find(o => o.id === answers[q.id]) }))
    .sort((a, b) => a.option.score - b.option.score || a.questionId - b.questionId)[0]
}

export function calculateResults(answers, displayName = '') {
  const missing = questions.find(q => !q.options.some(o => o.id === answers[q.id]))
  if (missing) throw new Error(`先完成第 ${missing.id} 题，再来看结果。`)
  const followup = activeFollowup(answers)
  const followAnswer = followup.options.find(o => o === answers[followup.id])
  if (!followAnswer || !priorityQuestion.options.includes(answers.priority)) throw new Error('还有两道收尾题，答完就能看结果。')
  const isPositive = followup.id === 'follow-positive'
  const displayAnswer = followup.id === 'follow-energy' && followAnswer === '我也说不清，只想先停一下'
    ? '你也说不清，只想先停一下'
    : followAnswer

  const scores = dimensionScores(answers)
  const byId = Object.fromEntries(scores.map(dim => [dim.id, dim]))
  const low = [...scores].sort((a, b) => a.score - b.score || dimensions.findIndex(d => d.id === a.id) - dimensions.findIndex(d => d.id === b.id))[0]
  const high = [...scores].sort((a, b) => b.score - a.score || dimensions.findIndex(d => d.id === a.id) - dimensions.findIndex(d => d.id === b.id))[0]
  const axes = {
    energy: byId.energy.score >= 55,
    agency: (byId.boundary.score + byId.control.score) / 2 >= 55,
    gain: (byId.connection.score + byId.return.score + byId.growth.score) / 3 >= 55,
  }
  const code = [axes.energy, axes.agency, axes.gain].map(v => Number(v)).join('')
  const profile = { ...profiles[code], code, axes }
  const evidence = strongestEvidence(answers, low.id)
  const primary = concerns[low.id]
  const followIndex = followup.options.indexOf(followAnswer)
  const strengths = scores.filter(dim => dim.score >= 60 && dim.id !== low.id).sort((a, b) => b.score - a.score)
  const priorityIndex = priorityQuestion.options.indexOf(answers.priority)
  const priorityDimension = priorityDimensions[priorityIndex]
  const preferred = scores.find(dim => dim.id === priorityDimension && dim.score >= 60 && (isPositive || dim.id !== low.id))
  const strength = preferred || strengths[0] || (high.score >= 60 && high.id !== low.id ? high : null)
  const priorityMove = priorityMoves[priorityIndex]
  const alerts = questions.filter(q => q.options.find(o => o.id === answers[q.id])?.alert).map(q => ({
    questionId: q.id,
    text: q.dimension === 'energy'
      ? '你说睡眠或身体已经受了影响。这件事值得认真处理，必要时找医生聊聊。'
      : q.dimension === 'connection'
        ? '你说有人让你觉得不安全。先找个信得过的人说说，不用一个人扛。'
        : '工资或说好的待遇一直没兑现，别只靠口头催。把相关记录留好，找能帮你的人商量下一步。',
  }))

  const actions = isPositive
    ? [{ id: 'keep-positive', title: positiveTaskTitles[followIndex], text: positiveTasks[followIndex] }]
    : [
      { id: `focus-${low.id}`, title: specificTaskTitles[low.id][followIndex], text: specificTasks[low.id][followIndex] },
      {
        id: `priority-${priorityIndex}`,
        ...(priorityDimension === low.id && priorityMove.overlap ? priorityMove.overlap : priorityMove.action),
      },
    ]

  return {
    version: MODEL_VERSION,
    displayName: displayName.trim(),
    evaluatedAt: new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' }),
    dimensions: scores,
    profile,
    focus: isPositive
      ? { id: 'positive', kind: 'steady', name: '你最喜欢的部分', followupId: followup.id, followAnswer, displayAnswer, answerLabel: followupAnswerLabels[followup.id], questionId: followup.id, note: '六项分数都不低，看来这份工作现在确实有些地方让你待得舒服。' }
      : { ...low, kind: 'change', evidence: evidence.option.text, followupId: followup.id, questionId: evidence.questionId, followAnswer, displayAnswer, answerLabel: followupAnswerLabels[followup.id], note: primary.note },
    strength,
    priority: answers.priority,
    alerts,
    actions,
    summary: isPositive
      ? `六项分数都不低，你想留住的这部分也很具体。`
      : makeSummary(low, high),
  }
}
