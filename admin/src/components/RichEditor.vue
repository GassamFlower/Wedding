<template>
  <div style="border:1px solid #dcdfe6;border-radius:4px">
    <div style="border-bottom:1px solid #eee;padding:8px;background:#fafafa;display:flex;gap:4px;flex-wrap:wrap">
      <el-button size="small" @click="exec('bold')"><b>B</b></el-button>
      <el-button size="small" @click="exec('italic')"><i>I</i></el-button>
      <el-button size="small" @click="exec('underline')"><u>U</u></el-button>
      <el-divider direction="vertical" />
      <el-button size="small" @click="exec('insertUnorderedList')">☰ 列表</el-button>
      <el-button size="small" @click="exec('insertOrderedList')">1. 列表</el-button>
      <el-divider direction="vertical" />
      <el-button size="small" @click="addImage">🖼 图片</el-button>
      <el-button size="small" @click="exec('formatBlock','<h2>')">标题</el-button>
      <el-button size="small" @click="exec('formatBlock','<p>')">正文</el-button>
    </div>
    <div ref="editor" :contenteditable="true" @input="onInput" style="min-height:400px;padding:16px;outline:none;line-height:1.8" v-html="modelValue" />
    <input ref="fileInput" type="file" accept="image/*" style="display:none" @change="onFileSelected" />
  </div>
</template>
<script setup>
import { ref, watch } from 'vue'
const props = defineProps({ modelValue: { type: String, default: '' } })
const emit = defineEmits(['update:modelValue'])
const editor = ref(null); const fileInput = ref(null)
watch(() => props.modelValue, (nv) => { if (editor.value && editor.value.innerHTML !== nv && nv !== undefined) editor.value.innerHTML = nv })
function exec(cmd, val) { document.execCommand(cmd, false, val || null); editor.value?.focus(); emit('update:modelValue', editor.value?.innerHTML || '') }
function onInput() { emit('update:modelValue', editor.value?.innerHTML || '') }
function addImage() { fileInput.value?.click() }
function onFileSelected(e) {
  const file = e.target.files?.[0]; if (!file) return
  const reader = new FileReader()
  reader.onload = (ev) => { exec('insertImage', ev.target?.result) }
  reader.readAsDataURL(file); fileInput.value.value = ''
}
</script>
