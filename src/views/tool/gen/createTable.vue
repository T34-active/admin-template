<template>
  <!-- 创建表 -->
  <el-dialog
    title="创建表"
    v-model="visible"
    width="800px"
    top="5vh"
    append-to-body
    :close-on-click-modal="false"
  >
    <span>创建表语句(支持多个建表语句)：</span>
    <el-input type="textarea" :rows="10" placeholder="请输入文本" v-model="content" />
    <template #footer>
      <div class="dialog-footer">
        <el-button plain type="primary" @click="handleImportTable">确 定</el-button>
        <el-button plain @click="visible = false">取 消</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { createTable } from '@/api/tool/gen'

const visible = ref(false)
const content = ref('')
const { proxy } = getCurrentInstance()
const emit = defineEmits(['ok'])

/** 显示弹框 */
function show() {
  visible.value = true
}

/** 导入按钮操作 */
function handleImportTable() {
  if (content.value === '') {
    proxy.$modal.msgError('请输入建表语句')
    return
  }
  createTable({ sql: content.value }).then((res) => {
    proxy.$modal.msgSuccess(res.msg)
    if (res.code === 200) {
      visible.value = false
      emit('ok')
    }
  })
}

defineExpose({
  show,
})
</script>
