<template>
  <div>
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
      <h2 style="margin:0">酒店管理</h2>
      <el-button type="primary" style="background:#c19a50;border-color:#c19a50" @click="showForm=true;editForm={}">+ 新建</el-button>
    </div>
    <el-table :data="list" v-loading="loading" border stripe style="width:100%">
      <el-table-column prop="name" label="酒店名称" width="140" />
      <el-table-column prop="hall" label="宴会厅" width="100" />
      <el-table-column prop="address" label="地址" width="150" />
      <el-table-column prop="contact" label="联系人" width="80" />
      <el-table-column prop="contactPhone" label="电话" width="110" />
      <el-table-column prop="capacity" label="容纳" width="70" />
      <el-table-column prop="status" label="状态" width="70"><template #default="{row}"><el-tag :type="row.status==='常用'?'success':'info'" size="small">{{row.status}}</el-tag></template></el-table-column>
      <el-table-column label="操作" width="120" fixed="right">
        <template #default="{row}">
          <el-button size="small" @click="edit(row)">编辑</el-button>
          <el-popconfirm title="确认删除？" @confirm="remove(row._id)"><el-button size="small" type="danger">删除</el-button></el-popconfirm>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination v-if="total>pageSize" v-model:current-page="page" :total="total" :page-size="pageSize" layout="prev,pager,next" style="margin-top:16px;justify-content:center" @current-change="load" />
    <el-dialog v-model="showForm" :title="editForm._id?'编辑酒店':'新建酒店'" width="600px">
      <el-form :model="editForm" label-width="100px">
        <el-row :gutter="12"><el-col :span="12"><el-form-item label="酒店名称"><el-input v-model="editForm.name" /></el-form-item></el-col><el-col :span="12"><el-form-item label="宴会厅"><el-input v-model="editForm.hall" /></el-form-item></el-col></el-row>
        <el-row :gutter="12"><el-col :span="12"><el-form-item label="联系人"><el-input v-model="editForm.contact" /></el-form-item></el-col><el-col :span="12"><el-form-item label="联系电话"><el-input v-model="editForm.contactPhone" /></el-form-item></el-col></el-row>
        <el-form-item label="地址"><el-input v-model="editForm.address" /></el-form-item>
        <el-row :gutter="12"><el-col :span="8"><el-form-item label="容纳"><el-input v-model="editForm.capacity" /></el-form-item></el-col><el-col :span="8"><el-form-item label="押金标准"><el-input-number v-model="editForm.depositStandard" :min="0" /></el-form-item></el-col><el-col :span="8"><el-form-item label="状态"><el-select v-model="editForm.status"><el-option label="常用" value="常用" /><el-option label="偶尔用" value="偶尔用" /><el-option label="已停用" value="已停用" /></el-select></el-form-item></el-col></el-row>
        <el-form-item label="设备"><el-input v-model="editForm.equipment" /></el-form-item>
        <el-form-item label="备注"><el-input v-model="editForm.notes" type="textarea" /></el-form-item>
      </el-form>
      <template #footer><el-button @click="showForm=false">取消</el-button><el-button type="primary" style="background:#c19a50;border-color:#c19a50" :loading="saving" @click="saveHotel">{{ saving?'保存中...':'保存' }}</el-button></template>
    </el-dialog>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'; import { callAdmin } from '@/api/cloud'; import { formatDate } from '@/utils/helpers'
const list = ref([]); const loading = ref(false); const page = ref(1); const pageSize = ref(20); const total = ref(0)
const showForm = ref(false); const saving = ref(false); const editForm = ref({})
async function load() { loading.value = true; try { const r = await callAdmin('hotels:list', { page: page.value, pageSize }); list.value = r.list; total.value = r.total } catch(e){} finally { loading.value = false } }
function edit(row) { editForm.value = { ...row }; showForm.value = true }
async function saveHotel() { saving.value = true; try { await callAdmin('hotels:save', { data: editForm.value }); showForm.value = false; load() } catch(e){} finally { saving.value = false } }
async function remove(id) { try { await callAdmin('hotels:remove', { id }); load() } catch(e){} }
onMounted(() => load())
</script>
<style scoped>
/* ═══════════════════════════════════════════════
   ENHANCED HOTELS — Design Canvas Migration
   从设计画布迁移的管理端酒店页增强样式
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

/* ---------- 标签增强 ---------- */
:deep(.el-tag--success) {
  background: linear-gradient(135deg, #e5ede8 0%, #c5d5cc 100%);
  border: 1px solid #a5bdb0;
  color: #6b8b7a;
  border-radius: 20px;
  font-weight: 600;
}

:deep(.el-tag--info) {
  background: linear-gradient(135deg, #f5ebd4 0%, #e8d5a8 100%);
  border: 1px solid #d4b87c;
  color: #6f4e1f;
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

/* ---------- 对话框增强 ---------- */
:deep(.el-dialog) {
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(58, 40, 15, 0.15);
}

:deep(.el-dialog__header) {
  background: linear-gradient(135deg, #faf7f0 0%, #f5ebd4 100%);
  border-bottom: 1px solid #e8d5a8;
  border-radius: 16px 16px 0 0;
}

:deep(.el-dialog__title) {
  color: #6f4e1f;
  font-weight: 700;
}
</style>
