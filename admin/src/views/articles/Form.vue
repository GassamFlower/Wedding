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
      <el-form-item><el-button type="primary" :loading="saving" @click="save">{{ saving ? '保存中...' : '保存' }}</el-button><el-button @click="router.back()">取消</el-button></el-form-item>
    </el-form>
  </div>
</template>
<script setup>
import { ref, computed, onMounted } from 'vue'; import { useRoute, useRouter } from 'vue-router'; import { ElMessage } from 'element-plus'; import { callAdmin } from '@/api/cloud'; import RichEditor from '@/components/RichEditor.vue'
const route = useRoute(); const router = useRouter()
const isEdit = computed(() => !!route.params.id); const saving = ref(false); const tagInput = ref('')
const form = ref({ title:'', summary:'', content:'', coverImage:'', tags:[], published:false, author:'管理员' })

function addTag() { if (tagInput.value.trim()) { form.value.tags.push(tagInput.value.trim()); tagInput.value = '' } }

onMounted(async () => {
  if (isEdit.value) { try { const r = await callAdmin('articles:get', { id: route.params.id }); if (r) form.value = { ...form.value, ...r } } catch(e) { router.push('/articles') } }
})

async function save() {
  // 表单验证
  if (!form.value.title.trim()) {
    ElMessage.warning('请输入文章标题')
    return
  }
  if (!form.value.content.trim()) {
    ElMessage.warning('请输入正文内容')
    return
  }
  
  saving.value = true
  try { 
    if (isEdit.value) form.value._id = route.params.id
    await callAdmin('articles:save', { data: form.value })
    ElMessage.success(isEdit.value ? '编辑成功' : '创建成功')
    router.push('/articles')
  } catch(e) {
    ElMessage.error(e.message || '保存失败')
  } finally { 
    saving.value = false 
  }
}
</script>
<style scoped>
/* 文章表单页 — 通用表单样式已由 table-styles.css 提供 */
</style>
