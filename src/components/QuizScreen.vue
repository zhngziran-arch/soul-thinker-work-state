<template>
  <section class="quiz-layout page-enter">
    <aside class="quiz-aside"><span class="eyebrow">SOUL THINKER · 上班状态测试</span><h1>工作状态</h1><p class="muted">按你平时的实际感受来答。</p><div class="quiz-sections"><div v-for="(dim, i) in dimensions" :key="dim.id" :class="{active:currentQuestion.dimension===dim.id,passed:sectionIndex>i}"><span>{{ String(i+1).padStart(2,'0') }}</span>{{ dim.name }}</div><div :class="{active:sectionIndex===6}"><span>07</span>再问两句</div></div><p class="small muted">拿不准时，选更常发生的那个。</p></aside>
    <div class="quiz-main"><div class="quiz-top"><button class="text-button" @click="$emit('exit')">← 回首页</button><span class="small muted">{{ currentIndex+1 }} / {{ steps.length }}</span></div><div class="progress-track" role="progressbar" :aria-valuenow="currentIndex+1" :aria-valuemax="steps.length" aria-valuemin="0" aria-label="答题进度"><div :style="{width:(currentIndex+1)/steps.length*100+'%'}"></div></div>
      <div class="paper question-card"><div class="section-kicker">{{ sectionIndex===6?'最后两题':dimensions[sectionIndex].name }} <span class="question-number">{{ String(currentIndex+1).padStart(2,'0') }}</span></div><h2 :id="'q'+currentQuestion.id" ref="heading" tabindex="-1">{{ currentQuestion.title }}</h2><div class="options" role="radiogroup" :aria-labelledby="'q'+currentQuestion.id"><button v-for="(option,i) in currentQuestion.options" :key="currentQuestion.id+optionId(option)" :ref="el=>optionRefs[i]=el" role="radio" :aria-checked="selected===optionId(option)" :tabindex="selected ? (selected===optionId(option)?0:-1) : (i===0?0:-1)" class="option" :class="{selected:selected===optionId(option)}" @click="select(optionId(option))" @keydown="navigate($event,i)"><span class="option-letter">{{ selected===optionId(option)?'✓':String.fromCharCode(65+i) }}</span><span>{{ optionText(option) }}</span></button></div><div class="question-nav"><button class="secondary" :disabled="currentIndex===0" @click="move(-1)">上一题</button><button class="primary" :disabled="!selected" @click="next">{{ currentIndex===steps.length-1?'看结果':'下一题' }} →</button></div></div>
    </div>
  </section>
</template>
<script setup>
import { computed, ref, nextTick } from 'vue'
import { dimensions, quizSteps } from '../data/quizData.js'
const props=defineProps({answers:Object,initialIndex:{type:Number,default:0}})
const emit=defineEmits(['answer','complete','exit','progress'])
const currentIndex=ref(Math.max(0,Math.min(25,props.initialIndex)))
const steps=computed(()=>quizSteps(props.answers))
const currentQuestion=computed(()=>steps.value[Math.min(currentIndex.value,steps.value.length-1)])
const selected=computed(()=>props.answers[currentQuestion.value.id])
const sectionIndex=computed(()=>currentQuestion.value.dimension?dimensions.findIndex(d=>d.id===currentQuestion.value.dimension):6)
const heading=ref(null),optionRefs=ref([])
const optionId=o=>typeof o==='string'?o:o.id
const optionText=o=>typeof o==='string'?o:o.text
const select=id=>emit('answer',{questionId:currentQuestion.value.id,optionId:id})
const navigate=(event,index)=>{if(!['ArrowDown','ArrowRight','ArrowUp','ArrowLeft','Home','End'].includes(event.key))return;event.preventDefault();const count=currentQuestion.value.options.length;const next=event.key==='Home'?0:event.key==='End'?count-1:(index+(event.key==='ArrowDown'||event.key==='ArrowRight'?1:-1)+count)%count;select(optionId(currentQuestion.value.options[next]));optionRefs.value[next]?.focus()}
const move=async delta=>{currentIndex.value=Math.max(0,Math.min(steps.value.length-1,currentIndex.value+delta));emit('progress',currentIndex.value);await nextTick();heading.value?.focus();window.scrollTo({top:0,behavior:'smooth'})}
const next=()=>{if(!selected.value)return;if(currentIndex.value===steps.value.length-1)emit('complete');else move(1)}
</script>
