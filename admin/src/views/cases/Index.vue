<template>
  <div>
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
      <h2 style="margin:0">案例管理</h2>
      <el-button type="primary" style="background:#c19a50;border-color:#c19a50" @click="router.push('/cases/new')">+ 新建案例</el-button>
    </div>
    <el-table :data="list" v-loading="loading" border stripe style="width:100%">
      <el-table-column prop="caseTitle" label="标题" min-width="180" />
      <el-table-column prop="clientName" label="新人" width="150" />
      <el-table-column prop="style" label="风格" width="100" />
      <el-table-column label="封面" width="80">
        <template #default="{row}"><el-image v-if="row.caseImages?.length" :src="row.caseImages[0]" style="width:50px;height:50px;object-fit:cover" /></template>
      </el-table-column>
      <el-table-column prop="isFeatured" label="推荐" width="60">
        <template #default="{row}"><el-tag v-if="row.isFeatured" type="success" size="small">✓</el-tag></template>
      </el-table-column>
      <el-table-column :formatter="(r)=>formatDate(r.createdAt)" label="创建时间" width="120" />
      <el-table-column label="操作" width="160" fixed="right">
        <template #default="{row}">
          <el-button size="small" @click="router.push('/cases/'+row._id)">编辑</el-button>
          <el-popconfirm title="确认删除？" @confirm="remove(row._id)"><el-button size="small" type="danger">删除</el-button></el-popconfirm>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination v-if="total>pageSize" v-model:current-page="page" :total="total" :page-size="pageSize" layout="prev,pager,next" style="margin-top:16px;justify-content:center" @current-change="load" />
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'; import { useRouter } from 'vue-router'; import { callAdmin } from '@/api/cloud'; import { formatDate } from '@/utils/helpers'
const router = useRouter(); const list = ref([]); const loading = ref(false); const page = ref(1); const pageSize = ref(20); const total = ref(0)
async function load() {
  loading.value = true
  try { const r = await callAdmin('cases:list', { page: page.value, pageSize: pageSize.value }); list.value = r.list; total.value = r.total }
  catch(e){} finally { loading.value = false }
}
async function remove(id) { try { await callAdmin('cases:remove', { id }); load() } catch(e){} }
onMounted(() => load())
</script>
<style scoped>
/* ═══════════════════════════════════════════════
   ENHANCED CASES — Design Canvas Migration
   从设计画布迁移的管理端案例页增强样式
   ═══════════════════════════════════════════════ */

/* ---------- 页面标题增强 ---------- */
h2 {
  color: #6f4e1f;
  font-weight: 700;
}

/* ---------- 新建按钮增强 ---------- */
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

/* ---------- 表格增强 ---------- */
:deep(.el-table) {
  background: linear-gradient(135deg, #ffffff 0%, #faf7f0 100%);
  border: 1px solid #f5ebd4;
  box-shadow: 0 4px 8px rgba(58, 40, 15, 0.08);
  border-radius: 12px;
  overflow: hidden;
}

:deep(.el-table th) {
  background: linear-gradient(135deg, #faf7f0 0%, #f5ebd4 100%);
  color: #6f4e1f;
  font-weight: 700;
  border-bottom: 1px solid #e8d5a8;
}

:deep(.el-table tr) {
  transition: all 0.2s ease;
}

:deep(.el-table tr:hover > td) {
  background: #faf7f0 !important;
}

/* ---------- 图片增强 ---------- */
:deep(.el-image) {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(58, 40, 15, 0.1);
}

/* ---------- 标签增强 ---------- */
:deep(.el-tag--success) {
  background: linear-gradient(135deg, #e5ede8 0%, #c5d5cc 100%);
  border: 1px solid #a5bdb0;
  color: #6b8b7a;
  border-radius: 20px;
  font-weight: 600;
}

/* ---------- 操作按钮增强 ---------- */
:deep(.el-button--small) {
  border-radius: 8px;
  transition: all 0.2s ease;
}

:deep(.el-button--small:hover) {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(58, 40, 15, 0.1);
}

:deep(.el-button--danger) {
  background: linear-gradient(135deg, #f8e5e0 0%, #e8c5bb 100%);
  border: 1px solid #d4a596;
  color: #a66b58;
}

:deep(.el-button--danger:hover) {
  background: linear-gradient(135deg, #e8c5bb 0%, #d4a596 100%);
  color: #ffffff;
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
