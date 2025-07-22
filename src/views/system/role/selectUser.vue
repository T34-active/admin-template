<script setup lang="ts">
import { authUserSelectAll, unallocatedUserList } from '@/api/system/role'

const props = defineProps({
  roleId: {
    type: [Number, String],
  },
})

const { proxy } = getCurrentInstance()

const { sys_normal_disable } = proxy.useDict('sys_normal_disable')

const userList = ref([])
const visible = ref(false)
const total = ref(0)
const userIds = ref([])

const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  roleId: undefined,
  userName: undefined,
  phonenumber: undefined,
})

// 显示弹框
function show() {
  queryParams.roleId = props.roleId
  getList()
  visible.value = true
}
/** 选择行 */
function clickRow(row) {
  proxy.$refs.refTable.toggleRowSelection(row)
}
// 多选框选中数据
function handleSelectionChange(selection) {
  userIds.value = selection.map((item) => item.userId)
}
// 查询表数据
async function getList() {
  const res = await unallocatedUserList(queryParams)
  userList.value = res.rows
  total.value = res.total
}
/** 搜索按钮操作 */
function handleQuery() {
  queryParams.pageNum = 1
  getList()
}
/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm('queryRef')
  handleQuery()
}
const emit = defineEmits(['ok'])
/** 选择授权用户操作 */
async function handleSelectUser() {
  const roleId = queryParams.roleId
  const uIds = userIds.value.join(',')
  if (uIds === '') {
    proxy.$modal.msgError('请选择要分配的用户')
    return
  }
  const response = await authUserSelectAll({ roleId, userIds: uIds })
  proxy.$modal.msgSuccess(response.msg)
  if (response.code === 200) {
    visible.value = false
    emit('ok')
  }
}

defineExpose({
  show,
})
</script>
<template>
  <!-- 授权用户 -->
  <el-dialog
    v-model="visible"
    title="选择用户"
    width="800px"
    append-to-body
    :close-on-click-modal="false"
  >
    <el-form ref="queryRef" :model="queryParams" label-width="auto">
      <el-row :gutter="20">
        <el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12">
          <el-form-item label="用户名称" prop="userName">
            <el-input
              v-model="queryParams.userName"
              placeholder="请输入用户名称"
              clearable
              @keyup.enter="handleQuery"
            />
          </el-form-item>
        </el-col>
        <el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12">
          <el-form-item label="手机号码" prop="phonenumber">
            <el-input
              v-model="queryParams.phonenumber"
              placeholder="请输入手机号码"
              clearable
              @keyup.enter="handleQuery"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>
    <el-row>
      <el-table
        ref="refTable"
        :data="userList"
        height="260px"
        @rowClick="clickRow"
        @selectionChange="handleSelectionChange"
        border
      >
        <el-table-column type="selection" width="55" />
        <el-table-column label="用户名称" prop="userName" :show-overflow-tooltip="true" />
        <el-table-column label="用户昵称" prop="nickName" :show-overflow-tooltip="true" />
        <el-table-column label="邮箱" prop="email" :show-overflow-tooltip="true" />
        <el-table-column label="手机" prop="phonenumber" :show-overflow-tooltip="true" />
        <el-table-column label="状态" prop="status">
          <template #default="scope">
            <dict-tag :options="sys_normal_disable" :value="scope.row.status" />
          </template>
        </el-table-column>
        <el-table-column label="创建时间" prop="createTime" />
      </el-table>
    </el-row>
    <pagination
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      :total="total"
      @pagination="getList"
    />
    <template #footer>
      <div class="dialog-footer">
        <el-button type="primary" @click="handleSelectUser">确 定</el-button>
        <el-button @click="visible = false">取 消</el-button>
      </div>
    </template>
  </el-dialog>
</template>
