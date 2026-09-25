<template>
  <div class="modal-backdrop share-backdrop" @click.self="$emit('close')"><section ref="dialog" class="share-dialog" role="dialog" aria-modal="true" aria-labelledby="share-title" @keydown="onKey"><div class="share-toolbar"><h2 id="share-title">做张图，留着或发给朋友</h2><button class="secondary" @click="$emit('close')">关闭</button></div>
    <div ref="poster" class="share-poster"><div class="poster-brand"><div class="poster-brand-lockup"><span class="poster-mark"><img src="/soul-thinker-logo-transparent.png" alt=""></span><span>上班状态测试<small>SOUL THINKER</small></span></div><span>{{ results.evaluatedAt }}</span></div><p class="poster-kicker">{{ results.displayName ? results.displayName + ' 最近上班实况' : '最近上班实况' }}</p><h2>{{ results.profile.name }}</h2><p class="poster-line">{{ results.profile.shareLine || results.profile.line }}</p><div class="poster-map"><div v-for="dim in results.dimensions" :key="dim.id"><span>{{ dim.name }}</span><b>{{ dim.score }}</b><div><i :style="{width:dim.score+'%',background:dim.color}"></i></div></div></div><div class="poster-thought"><span>{{ posterThought.label }}</span><p>{{ posterThought.text }}</p></div><div class="poster-promo"><img ref="promoQr" class="poster-promo-qr" src="/soul-thinker-wechat-qr.png" alt="非典型思考者微信公众号二维码"><div class="poster-promo-copy"><span class="poster-promo-kicker">SOUL THINKER</span><strong>公众号关注「非典型思考者」</strong><span class="poster-promo-hint">让我们一起在荒唐中，写几句真话。</span></div></div></div>
    <p v-if="error" class="share-error" role="alert">{{ error }}</p><div v-if="imageUrl" class="generated-preview"><p>在手机上长按图片就能保存</p><img :src="imageUrl" alt="生成的上班状态分享图"></div><button v-if="!imageUrl" class="primary full share-save" :disabled="generating" @click="generate">{{ generating?'做图中…':'生成图片' }}</button><a v-else :href="imageUrl" download="Soul-Thinker-上班状态.png" class="primary full share-save">下载图片</a>
  </section></div>
</template>
<script setup>
import {ref,onMounted,onUnmounted,nextTick,computed} from 'vue'
import html2canvas from 'html2canvas'
const props=defineProps({results:{type:Object,required:true}}),emit=defineEmits(['close'])
const dialog=ref(null),poster=ref(null),promoQr=ref(null),imageUrl=ref(''),generating=ref(false),error=ref('')
const shareLabels={
  'follow-positive':'最想留住的是',
  'follow-boundary':'最想拿回的是',
  'follow-control':'最让人憋屈的是',
  'follow-connection':'最想听到的是',
  'follow-return':'最想等到的是',
  'follow-growth':'最不想再经历的是',
}
const shareAnswerEdits={
  'follow-positive':{
    '做的事本身让我有劲':'做的事本身很有劲',
    '下班后还有完整的自己的时间':'下班后还能留出完整的个人时间',
  },
  'follow-energy':{
    '我也说不清，只想先停一下':'说不清，但是想先停一下',
  },
  'follow-return':{
    '把答应过我的事兑现':'答应过的事能兑现',
    '告诉我怎样才算做得好':'把做好的标准说清',
    '有人认真看见我的付出':'付出能被认真看见',
  },
}
const posterThought=computed(()=>{
  const {results:r}=props
  if(r.alerts.length)return {label:'给自己的提醒：',text:'先把自己照顾好'}
  if(r.focus.followupId==='follow-energy')return {
    label:r.displayName?`${r.displayName}现在的状态：`:'现在的状态：',
    text:shareAnswerEdits['follow-energy'][r.focus.followAnswer]||r.focus.followAnswer,
  }
  const answer=shareAnswerEdits[r.focus.followupId]?.[r.focus.followAnswer]||r.focus.followAnswer
  return {
    label:`${shareLabels[r.focus.followupId]||'最近的感受'}：`,
    text:r.focus.followupId==='follow-connection'?`“${answer}”`:answer,
  }
})
let previousFocus,overflow
onMounted(()=>{previousFocus=document.activeElement;overflow=document.body.style.overflow;document.body.style.overflow='hidden';dialog.value.querySelector('button').focus()})
onUnmounted(()=>{document.body.style.overflow=overflow;previousFocus?.focus()})
const onKey=e=>{if(e.key==='Escape'){emit('close');return}if(e.key!=='Tab')return;const nodes=[...dialog.value.querySelectorAll('button:not(:disabled),a[href]')];if(e.shiftKey&&document.activeElement===nodes[0]){e.preventDefault();nodes.at(-1).focus()}else if(!e.shiftKey&&document.activeElement===nodes.at(-1)){e.preventDefault();nodes[0].focus()}}
const generate=async()=>{if(generating.value)return;generating.value=true;error.value='';try{await nextTick();await document.fonts.ready;await promoQr.value?.decode?.();const canvas=await html2canvas(poster.value,{scale:2,backgroundColor:'#090d19',logging:false});imageUrl.value=canvas.toDataURL('image/png')}catch{error.value='图片没生成出来，再试一次。'}finally{generating.value=false}}
</script>
