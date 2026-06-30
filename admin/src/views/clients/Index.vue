<template>
  <div>
    <h2 style="margin-bottom:16px">客户管理</h2>
    <el-table :data="list" v-loading="loading" border stripe style="width:100%">
      <el-table-column prop="name" label="姓名" width="120" />
      <el-table-column prop="phone" label="手机号" width="130" />
      <el-table-column prop="wechat" label="微信" width="130" />
      <el-table-column prop="remark" label="备注" min-width="200" />
      <el-table-column prop="tags" label="标签" width="150"><template #default="{row}"><el-tag v-for="t in (row.tags||[])" :key="t" size="small" style="margin:1px">{{t}}</el-tag></template></el-table-column>
      <el-table-column :formatter="(r)=>formatDate(r.createdAt)" label="创建时间" width="120" />
    </el-table>
    <el-pagination v-if="total>pageSize" v-model:current-page="page" :total="total" :page-size="pageSize" layout="prev,pager,next" style="margin-top:16px;justify-content:center" @current-change="load" />
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'; import { callAdmin } from '@/api/cloud'; import { formatDate } from '@/utils/helpers'
const list = ref([]); const loading = ref(false); const page = ref(1); const pageSize = ref(20); const total = ref(0)
async function load() { loading.value = true; try { const r = await callAdmin('clients:list', { page: page.value, pageSize }); list.value = r.list; total.value = r.total } catch(e){} finally { loading.value = false } }
onMounted(() => load())
</script>
<style scoped>
/* ═══════════════════════════════════════════════
   ENHANCED CLIENTS — Design Canvas Migration
   从设计画布迁移的管理端客户页增强样式
   ═══════════════════════════════════════════════ */

/* ---------- 页面标题增强 ---------- */
h2 {
  color: #6f4e1f;
  font-weight: 700;
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

/* ---------- 标签增强 ---------- */
:deep(.el-tag) {
  background: linear-gradient(135deg, #f5ebd4 0%, #e8d5a8 100%);
  border: 1px solid #d4b87c;
  color: #6f4e1f;
  border-radius: 20px;
  font-weight: 600;
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
