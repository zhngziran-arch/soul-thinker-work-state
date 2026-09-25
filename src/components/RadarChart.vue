<template>
  <figure class="radar-figure"><svg viewBox="0 0 400 350" role="img" aria-label="六项上班感受图。越向外代表这一项越好，具体分数见右侧或下方列表">
    <polygon v-for="level in [.25,.5,.75,1]" :key="level" :points="polygon(level)" fill="none" stroke="#6683a350" :stroke-dasharray="level===1?'none':'3 5'"/>
    <line v-for="(_,i) in data" :key="'axis'+i" x1="200" y1="175" :x2="point(i,1).x" :y2="point(i,1).y" stroke="#6683a345"/>
    <polygon :points="data.map((d,i)=>`${point(i,d.value/100).x},${point(i,d.value/100).y}`).join(' ')" fill="#398fff36" stroke="#87c6ff" stroke-width="2"/>
    <g v-for="(item,i) in data" :key="item.label"><circle :cx="point(i,item.value/100).x" :cy="point(i,item.value/100).y" r="4" fill="#b8e7ff"/><text :x="point(i,1.28).x" :y="point(i,1.28).y" text-anchor="middle" fill="#b4c7e2" font-size="13">{{ item.label }}</text><text :x="point(i,1.28).x" :y="point(i,1.28).y+18" text-anchor="middle" fill="#ecf4ff" font-size="14" font-weight="600">{{ item.value }}</text></g>
  </svg><figcaption>越往外，这项感受越好</figcaption></figure>
</template>
<script setup>
const props=defineProps({data:{type:Array,required:true}})
const point=(i,ratio)=>({x:200+120*Math.cos(i*2*Math.PI/props.data.length-Math.PI/2)*ratio,y:175+120*Math.sin(i*2*Math.PI/props.data.length-Math.PI/2)*ratio})
const polygon=ratio=>props.data.map((_,i)=>`${point(i,ratio).x},${point(i,ratio).y}`).join(' ')
</script>
