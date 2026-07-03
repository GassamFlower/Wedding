<template>
  <div>
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
      <h2 style="margin:0">酒店管理</h2>
      <el-button type="primary" @click="showForm=true;editForm={}">+ 新建</el-button>
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
      <template #footer><el-button @click="showForm=false">取消</el-button><el-button type="primary" :loading="saving" @click="saveHotel">{{ saving?'保存中...':'保存' }}</el-button></template>
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
/* 酒店页 — 通用表格样式已由 table-styles.css 提供 */
</style>
