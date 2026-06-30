<template>
  <div>
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
      <h2 style="margin:0">图库管理</h2>
      <el-upload :show-file-list="false" :before-upload="uploadImage" accept="image/*">
        <el-button type="primary" style="background:#c19a50;border-color:#c19a50">+ 上传图片</el-button>
      </el-upload>
    </div>
    <div v-if="uploading" style="margin-bottom:16px"><el-progress :percentage="uploadProgress" /></div>
    <el-row :gutter="12" v-loading="loading">
      <el-col :xs="12" :sm="8" :md="6" :lg="4" v-for="img in list" :key="img._id" style="margin-bottom:12px">
        <el-card :body-style="{ padding:'8px' }" shadow="hover">
          <el-image :src="img.url" style="width:100%;height:150px;object-fit:cover;border-radius:4px" :preview-src-list="[img.url]" />
          <div style="margin-top:4px;font-size:12px;color:#909399;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">{{ img.name || img.url.split('/').pop() }}</div>
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
/* ═══════════════════════════════════════════════
   ENHANCED IMAGES — Design Canvas Migration
   从设计画布迁移的管理端图库页增强样式
   ═══════════════════════════════════════════════ */

/* ---------- 页面标题增强 ---------- */
h2 {
  color: #6f4e1f;
  font-weight: 700;
}

/* ---------- 上传按钮增强 ---------- */
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

/* ---------- 进度条增强 ---------- */
:deep(.el-progress) {
  margin-bottom: 16px;
}

:deep(.el-progress-bar__outer) {
  background: linear-gradient(135deg, #f5ebd4 0%, #e8d5a8 100%);
}

:deep(.el-progress-bar__inner) {
  background: linear-gradient(135deg, #c19a50 0%, #a67c3c 100%);
}

/* ---------- 图片卡片增强 ---------- */
:deep(.el-card) {
  background: linear-gradient(135deg, #ffffff 0%, #faf7f0 100%);
  border: 1px solid #f5ebd4;
  box-shadow: 0 4px 8px rgba(58, 40, 15, 0.08);
  border-radius: 12px;
  transition: all 0.3s ease;
}

:deep(.el-card:hover) {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(58, 40, 15, 0.12);
}

/* ---------- 图片增强 ---------- */
:deep(.el-image) {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(58, 40, 15, 0.1);
}

/* ---------- 删除按钮增强 ---------- */
:deep(.el-button--danger) {
  background: linear-gradient(135deg, #f8e5e0 0%, #e8c5bb 100%);
  border: 1px solid #d4a596;
  color: #a66b58;
  border-radius: 8px;
  transition: all 0.2s ease;
}

:deep(.el-button--danger:hover) {
  background: linear-gradient(135deg, #e8c5bb 0%, #d4a596 100%);
  color: #ffffff;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(58, 40, 15, 0.1);
}

/* ---------- 分页增强 ---------- */
:deep(.el-pagination) {
  margin-top: 20px;
}

:deep(.el-pagination .el-pager li.is-active) {
  background: linear-gradient(135deg, #c19a50 0%, #a67c3c 100%);
  color: #ffffff;
  border-radius: 8px;
}
</style>
