<template>
  <div>
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
      <h2 style="margin:0">道具管理</h2>
      <el-button type="primary" @click="showForm=true;editForm={}">+ 新建</el-button>
    </div>
    <el-table :data="list" v-loading="loading" border stripe style="width:100%">
      <el-table-column prop="name" label="道具名称" width="140" />
      <el-table-column prop="category" label="分类" width="80" />
      <el-table-column prop="total" label="总数" width="60" align="center" />
      <el-table-column prop="inUse" label="使用中" width="60" align="center" />
      <el-table-column prop="available" label="可用" width="60" align="center" />
      <el-table-column prop="unit" label="单位" width="50" />
      <el-table-column prop="status" label="状态" width="70"><template #default="{row}"><el-tag :type="row.status==='闲置'?'success':row.status==='需采购'?'danger':'warning'" size="small">{{row.status}}</el-tag></template></el-table-column>
      <el-table-column prop="notes" label="备注" min-width="120" />
      <el-table-column label="操作" width="120" fixed="right">
        <template #default="{row}"><el-button size="small" @click="edit(row)">编辑</el-button><el-popconfirm title="确认删除？" @confirm="remove(row._id)"><el-button size="small" type="danger">删除</el-button></el-popconfirm></template>
      </el-table-column>
    </el-table>
    <el-pagination v-if="total>pageSize" v-model:current-page="page" :total="total" :page-size="pageSize" layout="prev,pager,next" style="margin-top:16px;justify-content:center" @current-change="load" />
    <el-dialog v-model="showForm" :title="editForm._id?'编辑道具':'新建道具'" width="500px">
      <el-form :model="editForm" label-width="100px">
        <el-row :gutter="12"><el-col :span="12"><el-form-item label="名称"><el-input v-model="editForm.name" /></el-form-item></el-col><el-col :span="12"><el-form-item label="分类"><el-select v-model="editForm.category" style="width:100%"><el-option v-for="c in ['bg','flower','light','furniture','deco']" :key="c" :label="c" :value="c" /></el-select></el-form-item></el-col></el-row>
        <el-row :gutter="12"><el-col :span="8"><el-form-item label="总数"><el-input-number v-model="editForm.total" :min="0" /></el-form-item></el-col><el-col :span="8"><el-form-item label="使用中"><el-input-number v-model="editForm.inUse" :min="0" /></el-form-item></el-col><el-col :span="8"><el-form-item label="单位"><el-input v-model="editForm.unit" /></el-form-item></el-col></el-row>
        <el-form-item label="状态"><el-select v-model="editForm.status"><el-option label="闲置" value="闲置" /><el-option label="使用中" value="使用中" /><el-option label="需采购" value="需采购" /><el-option label="需维修" value="需维修" /></el-select></el-form-item>
        <el-form-item label="备注"><el-input v-model="editForm.notes" type="textarea" /></el-form-item>
      </el-form>
      <template #footer><el-button @click="showForm=false">取消</el-button><el-button type="primary" :loading="saving" @click="saveProp">{{ saving?'保存中...':'保存' }}</el-button></template>
    </el-dialog>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'; import { callAdmin } from '@/api/cloud'
const list = ref([]); const loading = ref(false); const page = ref(1); const pageSize = ref(20); const total = ref(0)
const showForm = ref(false); const saving = ref(false); const editForm = ref({})
async function load() { loading.value = true; try { const r = await callAdmin('props:list', { page: page.value, pageSize }); list.value = r.list; total.value = r.total } catch(e){} finally { loading.value = false } }
function edit(row) { editForm.value = { ...row }; showForm.value = true }
async function saveProp() { saving.value = true; try { await callAdmin('props:save', { data: editForm.value }); showForm.value = false; load() } catch(e){} finally { saving.value = false } }
async function remove(id) { try { await callAdmin('props:remove', { id }); load() } catch(e){} }
onMounted(() => load())
</script>
<style scoped>
/* 道具页 — 通用表格样式已由 table-styles.css 提供 */
</style>
