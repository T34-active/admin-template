<script setup lang="ts">
import selectUser from './selectUser.vue'
import { allocatedUserList, authUserCancel, authUserCancelAll } from '@/api/system/role'
import { parseTime } from '@/utils/ruoyi'

import { useRoute } from 'vue-router'
import QueryForm, { type QueryItemConfig } from '@/components/QueryForm/index.vue'

const route = useRoute()
const { proxy } = getCurrentInstance()
const { sys_normal_disable } = proxy.useDict('sys_normal_disable')

const userList = ref([])
const loading = ref(true)
const showSearch = ref(true)
const multiple = ref(true)
const total = ref(0)
const userIds = ref([])

const queryItem = ref<QueryItemConfig[]>([
  {
    label: '用户名称',
    prop: 'userName',
    type: 'input',
    placeholder: '请输入用户名称',
  },
  {
    label: '手机号码',
    prop: 'phonenumber',
    type: 'input',
    placeholder: '请输入手机号码',
  },
])

const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  roleId: route.params.roleId,
  userName: undefined,
  phonenumber: undefined,
})

/** 查询授权用户列表 */
async function getList() {
  loading.value = true
  const response = await allocatedUserList(queryParams)
  userList.value = response.rows
  total.value = response.total
  loading.value = false
}
// 返回按钮
function handleClose() {
  const obj = { path: '/system/role' }
  proxy.$tab.closeOpenPage(obj)
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
// 多选框选中数据
function handleSelectionChange(selection) {
  userIds.value = selection.map((item) => item.userId)
  multiple.value = !selection.length
}
/** 打开授权用户表弹窗 */
function openSelectUser() {
  proxy.$refs.selectRef.show()
}
/** 取消授权按钮操作 */
function cancelAuthUser(row) {
  proxy.$modal
    .confirm('确认要取消该用户"' + row.userName + '"角色吗？')
    .then(function () {
      return authUserCancel({ userId: row.userId, roleId: queryParams.roleId })
    })
    .then(() => {
      getList()
      proxy.$modal.msgSuccess('取消授权成功')
    })
    .catch((e) => {
      console.log(e)
    })
}
/** 批量取消授权按钮操作 */
function cancelAuthUserAll(row) {
  const roleId = queryParams.roleId
  const uIds = userIds.value.join(',')
  proxy.$modal
    .confirm('是否取消选中用户授权数据项？')
    .then(function () {
      return authUserCancelAll({ roleId, userIds: uIds })
    })
    .then(() => {
      getList()
      proxy.$modal.msgSuccess('取消授权成功')
    })
    .catch((e) => {
      console.log(e)
    })
}
onMounted(async () => {
  await getList()
})
</script>
<template>
  <div class="app-container">
    <CollapsePanel v-model="showSearch">
      <div class="p-16">
        <el-form ref="queryRef" :model="queryParams" label-width="auto">
          <el-row :gutter="20">
            <QueryForm :model="queryParams" :items="queryItem" />
          </el-row>
        </el-form>
        <el-row :gutter="10">
          <el-col :span="1.5">
            <el-button
              v-hasPermi="['system:role:add']"
              type="primary"
              plain
              icon="Plus"
              @click="openSelectUser"
            >
              添加用户
            </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button
              v-hasPermi="['system:role:remove']"
              type="danger"
              plain
              icon="CircleClose"
              :disabled="multiple"
              @click="cancelAuthUserAll"
            >
              批量取消授权
            </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button icon="Refresh" @click="resetQuery">重置</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="warning" plain icon="Close" @click="handleClose">关闭</el-button>
          </el-col>
        </el-row>
      </div>
    </CollapsePanel>

    <el-table v-loading="loading" :data="userList" @selectionChange="handleSelectionChange">
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
      <el-table-column label="创建时间" prop="createTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.loginTime, 'YYYY-MM-DD HH:mm:ss') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button
            v-hasPermi="['system:role:remove']"
            link
            type="primary"
            icon="CircleClose"
            @click="cancelAuthUser(scope.row)"
          >
            取消授权
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <BottomFixed>
      <div class="flex items-center justify-end p-16">
        <pagination
          v-model:page="queryParams.pageNum"
          v-model:limit="queryParams.pageSize"
          :total="total"
          @pagination="getList"
        />
      </div>
    </BottomFixed>
    <select-user ref="selectRef" :roleId="queryParams.roleId" @ok="handleQuery" />
  </div>
</template>
