<template>
  <div>
    <h2 style="margin-bottom:16px">{{ isEdit ? '编辑文章' : '写文章' }}</h2>
    <el-form :model="form" label-width="80px" style="max-width:100%">
      <el-row :gutter="16">
        <el-col :span="16"><el-form-item label="标题"><el-input v-model="form.title" placeholder="输入文章标题" /></el-form-item></el-col>
        <el-col :span="4"><el-form-item label="作者"><el-input v-model="form.author" /></el-form-item></el-col>
        <el-col :span="4"><el-form-item label="发布"><el-switch v-model="form.published" /></el-form-item></el-col>
      </el-row>
      <el-form-item label="摘要"><el-input v-model="form.summary" type="textarea" :rows="2" placeholder="文章摘要/描述" /></el-form-item>
      <el-form-item label="标签"><el-input v-model="tagInput" placeholder="输入标签后按回车" @keyup.enter="addTag" style="width:400px" /><div v-if="form.tags?.length" style="margin-top:4px;display:flex;gap:4px"><el-tag v-for="(t,i) in form.tags" :key="i" closable @close="form.tags.splice(i,1)">{{t}}</el-tag></div></el-form-item>
      <el-form-item label="封面图"><el-input v-model="form.coverImage" placeholder="封面图片URL" style="width:400px" /></el-form-item>
      <el-form-item label="正文内容"><RichEditor v-model="form.content" /></el-form-item>
      <el-form-item><el-button type="primary" style="background:#c19a50;border-color:#c19a50" :loading="saving" @click="save">{{ saving ? '保存中...' : '保存' }}</el-button><el-button @click="router.back()">取消</el-button></el-form-item>
    </el-form>
  </div>
</template>
<script setup>
import { ref, computed, onMounted } from 'vue'; import { useRoute, useRouter } from 'vue-router'; import { callAdmin } from '@/api/cloud'; import RichEditor from '@/components/RichEditor.vue'
const route = useRoute(); const router = useRouter()
const isEdit = computed(() => !!route.params.id); const saving = ref(false); const tagInput = ref('')
const form = ref({ title:'', summary:'', content:'', coverImage:'', tags:[], published:false, author:'管理员' })

function addTag() { if (tagInput.value.trim()) { form.value.tags.push(tagInput.value.trim()); tagInput.value = '' } }

onMounted(async () => {
  if (isEdit.value) { try { const r = await callAdmin('articles:get', { id: route.params.id }); if (r) form.value = { ...form.value, ...r } } catch(e) { router.push('/articles') } }
})

async function save() {
  saving.value = true
  try { if (isEdit.value) form.value._id = route.params.id; await callAdmin('articles:save', { data: form.value }); router.push('/articles') }
  catch(e){} finally { saving.value = false }
}
</script>
<style scoped>
/* ═══════════════════════════════════════════════
   ENHANCED ARTICLE FORM — Design Canvas Migration
   从设计画布迁移的管理端文章表单增强样式
   ═══════════════════════════════════════════════ */

/* ---------- 页面标题增强 ---------- */
h2 {
  color: #6f4e1f;
  font-weight: 700;
}

/* ---------- 表单增强 ---------- */
:deep(.el-form) {
  background: linear-gradient(135deg, #ffffff 0%, #faf7f0 100%);
  border: 1px solid #f5ebd4;
  box-shadow: 0 4px 8px rgba(58, 40, 15, 0.08);
  border-radius: 12px;
  padding: 24px;
}

/* ---------- 输入框增强 ---------- */
:deep(.el-input__wrapper) {
  background: linear-gradient(135deg, #faf7f0 0%, #f5ebd4 100%);
  border: 1.5px solid #e8d5a8;
  box-shadow: none;
  transition: all 0.2s ease;
}

:deep(.el-input__wrapper:focus-within) {
  border-color: #c19a50;
  background: #ffffff;
  box-shadow: 0 0 0 3px rgba(193, 154, 80, 0.1);
}

/* ---------- 文本域增强 ---------- */
:deep(.el-textarea__inner) {
  background: linear-gradient(135deg, #faf7f0 0%, #f5ebd4 100%);
  border: 1.5px solid #e8d5a8;
  box-shadow: none;
  transition: all 0.2s ease;
}

:deep(.el-textarea__inner:focus) {
  border-color: #c19a50;
  background: #ffffff;
  box-shadow: 0 0 0 3px rgba(193, 154, 80, 0.1);
}

/* ---------- 标签增强 ---------- */
:deep(.el-tag) {
  background: linear-gradient(135deg, #f5ebd4 0%, #e8d5a8 100%);
  border: 1px solid #d4b87c;
  color: #6f4e1f;
  border-radius: 20px;
  font-weight: 600;
}

/* ---------- 按钮增强 ---------- */
:deep(.el-button--primary) {
  background: linear-gradient(135deg, #c19a50 0%, #a67c3c 100%);
  border: none;
  box-shadow: 0 4px 12px rgba(193, 154, 80, 0.3);
  font-weight: 600;
  transition: all 0.2s ease;
}

:deep(.el-button--primary:hover) {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(193, 154, 80, 0.4);
}

:deep(.el-button--primary:active) {
  transform: scale(0.97);
}

:deep(.el-button) {
  border-radius: 8px;
  transition: all 0.2s ease;
}

:deep(.el-button:hover) {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(58, 40, 15, 0.1);
}

/* ---------- 标签页增强 ---------- */
:deep(.el-form-item__label) {
  color: #6f4e1f;
  font-weight: 600;
}
</style>
