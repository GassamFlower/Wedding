<template>
  <div>
    <h2 style="margin-bottom:16px">{{ isEdit ? '编辑案例' : '新建案例' }}</h2>
    <el-form :model="form" label-width="100px" style="max-width:800px">
      <el-form-item label="案例标题"><el-input v-model="form.caseTitle" placeholder="如：新中式·水墨山水婚礼" /></el-form-item>
      <el-form-item label="新人姓名"><el-input v-model="form.clientName" placeholder="如：张先生 & 李女士" /></el-form-item>
      <el-row :gutter="16">
        <el-col :span="8"><el-form-item label="婚礼风格"><el-select v-model="form.style" style="width:100%"><el-option v-for="s in ['新中式','韩式','森系','欧式','复古','极简','梦幻','其他']" :key="s" :label="s" :value="s" /></el-select></el-form-item></el-col>
        <el-col :span="8"><el-form-item label="场地类型"><el-select v-model="form.venueType" style="width:100%"><el-option v-for="s in ['室内','户外','草坪','宴会厅','其他']" :key="s" :label="s" :value="s" /></el-select></el-form-item></el-col>
        <el-col :span="8"><el-form-item label="婚礼场地"><el-input v-model="form.venue" /></el-form-item></el-col>
      </el-row>
      <el-row :gutter="16">
        <el-col :span="8"><el-form-item label="预算(元)"><el-input-number v-model="form.budget" :min="0" :step="1000" style="width:100%" /></el-form-item></el-col>
        <el-col :span="8"><el-form-item label="推荐案例"><el-switch v-model="form.isFeatured" /></el-form-item></el-col>
        <el-col :span="8"><el-form-item label="排序权重"><el-input-number v-model="form.sortOrder" :min="0" style="width:100%" /></el-form-item></el-col>
      </el-row>
      <el-form-item label="案例描述"><el-input v-model="form.description" type="textarea" :rows="3" /></el-form-item>
      <el-form-item label="设计说明"><el-input v-model="form.caseDesignNotes" type="textarea" :rows="3" /></el-form-item>
      <el-form-item label="客户评价"><el-input v-model="form.clientReview" type="textarea" :rows="2" /></el-form-item>
      <el-form-item label="客户评分"><el-rate v-model="form.clientRating" :max="5" /></el-form-item>
      <el-form-item label="案例图片">
        <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:8px">
          <div v-for="(img, i) in form.caseImages" :key="i" style="position:relative;width:120px;height:120px;border:1px solid #eee;border-radius:4px;overflow:hidden">
            <el-image :src="img" style="width:100%;height:100%;object-fit:cover" />
            <el-button size="small" circle style="position:absolute;top:2px;right:2px;padding:2px;min-height:auto" type="danger" @click="form.caseImages.splice(i,1)">✕</el-button>
          </div>
          <label class="upload-btn" style="width:120px;height:120px;border:2px dashed #dcdfe6;border-radius:4px;display:flex;align-items:center;justify-content:center;cursor:pointer;color:#909399">
            + 添加图片
            <input type="file" accept="image/*" multiple style="display:none" @change="addImages" />
          </label>
        </div>
      </el-form-item>
      <el-form-item><el-button type="primary" style="background:#c19a50;border-color:#c19a50" :loading="saving" @click="save">{{ saving ? '保存中...' : '保存' }}</el-button><el-button @click="router.back()">取消</el-button></el-form-item>
    </el-form>
  </div>
</template>
<script setup>
import { ref, onMounted, computed } from 'vue'; import { useRoute, useRouter } from 'vue-router'; import { callAdmin } from '@/api/cloud'
const route = useRoute(); const router = useRouter()
const isEdit = computed(() => !!route.params.id)
const saving = ref(false)
const form = ref({ caseTitle:'', clientName:'', style:'', venueType:'', venue:'', budget:0, description:'', caseImages:[], caseDesignNotes:'', clientReview:'', clientRating:0, isFeatured:false, sortOrder:0 })

onMounted(async () => {
  if (isEdit.value) {
    try { const r = await callAdmin('cases:get', { id: route.params.id }); if (r) form.value = { ...form.value, ...r } } catch(e) { router.push('/cases') }
  }
})

async function save() {
  saving.value = true
  try {
    if (isEdit.value) form.value._id = route.params.id
    await callAdmin('cases:save', { data: form.value })
    router.push('/cases')
  } catch(e) {} finally { saving.value = false }
}

function addImages(e) {
  const files = Array.from(e.target.files || [])
  files.forEach(file => {
    const reader = new FileReader()
    reader.onload = (ev) => { form.value.caseImages.push(ev.target.result) }
    reader.readAsDataURL(file)
  })
  e.target.value = ''
}
</script>
<style scoped>
/* ═══════════════════════════════════════════════
   ENHANCED CASE FORM — Design Canvas Migration
   从设计画布迁移的管理端案例表单增强样式
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

/* ---------- 图片增强 ---------- */
:deep(.el-image) {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(58, 40, 15, 0.1);
}

/* ---------- 上传按钮增强 ---------- */
.upload-btn {
  background: linear-gradient(135deg, #faf7f0 0%, #f5ebd4 100%);
  border: 2px dashed #d4b87c;
  transition: all 0.2s ease;
}

.upload-btn:hover {
  border-color: #c19a50;
  background: linear-gradient(135deg, #f5ebd4 0%, #e8d5a8 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(193, 154, 80, 0.2);
}

/* ---------- 删除按钮增强 ---------- */
:deep(.el-button--danger) {
  background: linear-gradient(135deg, #f8e5e0 0%, #e8c5bb 100%);
  border: 1px solid #d4a596;
  color: #a66b58;
  border-radius: 50%;
  transition: all 0.2s ease;
}

:deep(.el-button--danger:hover) {
  background: linear-gradient(135deg, #e8c5bb 0%, #d4a596 100%);
  color: #ffffff;
  transform: scale(1.1);
  box-shadow: 0 2px 8px rgba(58, 40, 15, 0.1);
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

/* ---------- 评分增强 ---------- */
:deep(.el-rate__icon) {
  color: #d4b87c;
}

:deep(.el-rate__item:hover .el-rate__icon) {
  color: #c19a50;
}
</style>
