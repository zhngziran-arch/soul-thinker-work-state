<template>
  <div class="start-layout page-enter">
    <section class="start-story">
      <span class="eyebrow">SOUL THINKER · 上班状态测试</span>
      <h1>这份工作，<br>你过得<span class="serif-accent">怎么样？</span></h1>
      <p class="intro">你可能挺喜欢手头的事，却受不了每天被消息追着跑。也可能没多忙，就是提不起劲。先把这阵子的感觉理一理。</p>
      <div class="story-rule"></div>
      <div class="start-features"><span>24 道日常题</span><span>2 个附加问题</span><span>6 个综合维度</span></div>
      <p class="small muted">大概 5 分钟。答到一半也能接着来。</p>
    </section>
    <section class="start-right">
      <div class="logo-art" aria-hidden="true"><img src="/soul-thinker-logo-transparent.png" alt=""></div>
      <div class="paper start-form"><span class="section-kicker">开始之前</span><h2>怎么称呼你？</h2>
        <label class="field-label" for="display-name">称呼 <span class="optional-note">可以不填</span></label>
        <input id="display-name" v-model="name" type="text" maxlength="20" placeholder="比如：阿乔" @keyup.enter="start">
        <button class="primary full" @click="start">开始答题 →</button>
        <button v-if="hasDraft" class="secondary full" @click="$emit('resume')">回到上次{{ hasReport?'的结果':'答到的地方' }}</button>
        <p class="small muted form-note">所有信息只会存在你自己的设备里。</p>
      </div>
    </section>
  </div>
</template>
<script setup>
import { ref, watch } from 'vue'
const props=defineProps({initialDisplayName:{type:String,default:''},hasDraft:Boolean,hasReport:Boolean})
const emit=defineEmits(['start','resume'])
const name=ref(props.initialDisplayName)
watch(()=>props.initialDisplayName,value=>{name.value=value})
const start=()=>emit('start',name.value.trim())
</script>
