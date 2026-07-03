<template>
  <div>
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
      <h2 style="margin:0">图库管理</h2>
      <el-upload :show-file-list="false" :before-upload="uploadImage" accept="image/*">
        <el-button type="primary">+ 上传图片</el-button>
      </el-upload>
    </div>
    <div v-if="uploading" style="margin-bottom:16px"><el-progress :percentage="uploadProgress" /></div>
    <el-row :gutter="12" v-loading="loading">
      <el-col :xs="12" :sm="8" :md="6" :lg="4" v-for="img in list" :key="img._id" style="margin-bottom:12px">
        <el-card :body-style="{ padding:'8px' }" shadow="hover">
          <el-image :src="img.url" style="width:100%;height:150px;object-fit:cover;border-radius:4px" :preview-src-list="[img.url]" />
          <div style="margin-top:4px;font-size:12px;color:var(--info);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">{{ img.name || img.url.split('/').pop() }}</div>
          <div style="margin-top:4px;text-align:right"><el-button size="small" type="danger" @click="remove(img._id)">删除</el-button></div>
        </el-card>
      </el-col>
    </el-row>
    <el-pagination v-if="total>pageSize" v-model:current-page="page" :total="total" :page-size="pageSize" layout="prev,pager,next" style="margin-top:16px;justify-content:center" @current-change="load" />
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'; import { callAdmin } from '@/api/cloud'
const list = ref([]); const loading = ref(false); const uploading = ref(false); const uploadProgress = ref(0)
const page = ref(1); const pageSize = ref(50); const total = ref(0)

async function load() { loading.value = true; try { const r = await callAdmin('images:list', { page: page.value, pageSize }); list.value = r.list; total.value = r.total } catch(e){} finally { loading.value = false } }

async function uploadImage(file) {
  uploading.value = true; uploadProgress.value = 0
  try {
    const dataUrl = await new Promise((resolve) => { const r = new FileReader(); r.onload = (e) => resolve(e.target.result); r.readAsDataURL(file) })
    await callAdmin('images:save', { data: { url: dataUrl, name: file.name, size: file.size, type: file.type } })
    uploadProgress.value = 100; load()
  } catch(e) {} finally { setTimeout(() => { uploading.value = false; uploadProgress.value = 0 }, 1000) }
  return false
}

async function remove(id) { try { await callAdmin('images:remove', { id }); load() } catch(e){} }

onMounted(() => load())
</script>
<style scoped>
/* 图库页 — 通用表格样式已由 table-styles.css 提供 */
</style>
