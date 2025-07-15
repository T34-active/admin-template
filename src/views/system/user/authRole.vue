<template>
  <div class="app-container">
    <CollapsePanel v-model="showUser" title="基本信息">
      <div class="p-16">
        <el-form :model="form" label-width="auto">
          <el-row>
            <el-col :span="8" :offset="2">
              <el-form-item label="用户昵称" prop="nickName">
                <el-tag type="primary">{{ form.nickName }}</el-tag>
              </el-form-item>
            </el-col>
            <el-col :span="8" :offset="2">
              <el-form-item label="登录账号" prop="userName">
                <el-tag type="success">{{ form.userName }}</el-tag>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>
    </CollapsePanel>
    <CollapsePanel v-model="showRole" title="角色信息">
      <el-table
        ref="roleRef"
        v-loading="loading"
        :row-key="getRowKey"
        :data="roles.slice((pageNum - 1) * pageSize, pageNum * pageSize)"
        @rowClick="clickRow"
        @selectionChange="handleSelectionChange"
      >
        <el-table-column label="序号" width="55" type="index">
          <template #default="scope">
            <span>{{ (pageNum - 1) * pageSize + scope.$index + 1 }}</span>
          </template>
        </el-table-column>
        <el-table-column type="selection" :reserve-selection="true" width="55" />
        <el-table-column label="角色编号" prop="roleId" />
        <el-table-column label="角色名称" prop="roleName" />
        <el-table-column label="权限字符" prop="roleKey" />
        <el-table-column label="创建时间" prop="createTime" width="180">
          <template #default="scope">
            <span>{{ parseTime(scope.row.createTime) }}</span>
          </template>
        </el-table-column>
      </el-table>
    </CollapsePanel>

    <BottomFixed>
      <div class="flex items-center justify-between p-16">
        <div>
          <el-button type="primary" @click="submitForm()">提交</el-button>
          <el-button @click="close()">返回</el-button>
        </div>
        <div>
          <pagination v-model:page="pageNum" v-model:limit="pageSize" :total="total" />
        </div>
      </div>
    </BottomFixed>
  </div>
</template>

<script setup lang="ts">
import { getAuthRole, updateAuthRole } from '@/api/system/user'
import { parseTime } from '@/utils/ruoyi'

import { useRoute } from 'vue-router'

const route = useRoute()
const { proxy } = getCurrentInstance()

const loading = ref(true)
const showUser = ref(true)
const showRole = ref(true)
const total = ref(0)
const pageNum = ref(1)
const pageSize = ref(10)
const roleIds = ref([])
const roles = ref([])
const form = ref({
  nickName: undefined,
  userName: undefined,
  userId: undefined,
})

/** 单击选中行数据 */
function clickRow(row) {
  ;(proxy?.$refs.roleRef as any).toggleRowSelection(row)
}
/** 多选框选中数据 */
function handleSelectionChange(selection) {
  roleIds.value = selection.map((item) => item.roleId)
}
/** 保存选中的数据编号 */
function getRowKey(row) {
  return row.roleId
}
/** 关闭按钮 */
function close() {
  const obj = { path: '/system/user' }
  proxy.$tab.closeOpenPage(obj)
}
/** 提交按钮 */
async function submitForm() {
  const userId = form.value.userId
  const rIds = roleIds.value.join(',')
  await updateAuthRole({ userId, roleIds: rIds })
  proxy.$modal.msgSuccess('授权成功')
  close()
}

onMounted(async () => {
  const userId = route.params && route.params.userId
  if (userId) {
    loading.value = true
    const response = await getAuthRole(userId)
    form.value = response.user
    roles.value = response.roles
    total.value = roles.value.length
    await nextTick(() => {
      roles.value.forEach((row) => {
        if (row.flag) {
          proxy.$refs.roleRef.toggleRowSelection(row)
        }
      })
    })
    loading.value = false
  }
})
</script>
