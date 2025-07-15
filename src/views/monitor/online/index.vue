<script setup lang="ts">
import { forceLogout, list as initData } from '@/api/monitor/online'
import { parseTime } from '@/utils/ruoyi'
import QueryForm, { type QueryItemConfig } from '@/components/QueryForm/index.vue'

const { proxy } = getCurrentInstance()

const onlineList = ref([])
const loading = ref(true)
const showSearch = ref(true)
const total = ref(0)
const pageNum = ref(1)
const pageSize = ref(10)

const queryParams = ref({
  pageNum: 1,
  pageSize: 10,
  ipaddr: undefined,
  userName: undefined,
})

const items = ref<QueryItemConfig[]>([
  {
    label: '登录地址',
    prop: 'ipaddr',
    type: 'input',
    placeholder: '请输入登录地址',
  },
  {
    label: '用户名称',
    prop: 'userName',
    type: 'input',
    placeholder: '请输入用户名称',
  },
])

/** 查询登录日志列表 */
async function getList() {
  loading.value = true
  const response = await initData(queryParams.value)
  onlineList.value = response.rows
  total.value = response.total
  loading.value = false
}
/** 搜索按钮操作 */
function handleQuery() {
  pageNum.value = 1
  getList()
}
/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm('queryRef')
  handleQuery()
}
/** 强退按钮操作 */
function handleForceLogout(row) {
  proxy.$modal
    .confirm('是否确认强退名称为"' + row.userName + '"的用户?')
    .then(function () {
      return forceLogout(row.tokenId)
    })
    .then(() => {
      getList()
      proxy.$modal.msgSuccess('删除成功')
    })
}
onMounted(async () => {
  await getList()
})
</script>

<template>
  <div class="app-container">
    <collapsePanel v-model="showSearch">
      <div class="p-16">
        <el-form ref="queryRef" :model="queryParams" label-width="auto">
          <el-row :gutter="10">
            <QueryForm :model="queryParams" :items="items" />
          </el-row>
        </el-form>
        <el-row :gutter="10">
          <el-col :span="1.5">
            <el-button icon="Refresh" @click="resetQuery">重置</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
          </el-col>
        </el-row>
      </div>
    </collapsePanel>
    <el-table
      v-loading="loading"
      :data="onlineList.slice((pageNum - 1) * pageSize, pageNum * pageSize)"
    >
      <el-table-column label="序号" width="50" type="index">
        <template #default="scope">
          <span>{{ (pageNum - 1) * pageSize + scope.$index + 1 }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="会话编号"
        min-width="250"
        prop="tokenId"
        :show-overflow-tooltip="true"
      />
      <el-table-column
        label="登录名称"
        prop="userName"
        :show-overflow-tooltip="true"
        min-width="150"
      />
      <el-table-column
        label="所属部门"
        prop="deptName"
        :show-overflow-tooltip="true"
        min-width="150"
      />
      <el-table-column label="主机" prop="ipaddr" :show-overflow-tooltip="true" min-width="150" />
      <el-table-column
        label="登录地点"
        prop="loginLocation"
        :show-overflow-tooltip="true"
        min-width="150"
      />
      <el-table-column label="操作系统" prop="os" :show-overflow-tooltip="true" min-width="150" />
      <el-table-column
        label="浏览器"
        prop="browser"
        :show-overflow-tooltip="true"
        min-width="150"
      />
      <el-table-column label="登录时间" prop="loginTime" min-width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.loginTime, 'YYYY-MM-DD HH:mm:ss') }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        class-name="small-padding fixed-width"
        fixed="right"
        min-width="100"
      >
        <template #default="scope">
          <el-button
            v-hasPermi="['monitor:online:forceLogout']"
            link
            type="danger"
            icon="Delete"
            @click="handleForceLogout(scope.row)"
          >
            强退
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <BottomFixed>
      <div class="flex justify-end items-center p-16">
        <pagination
          v-model:page="queryParams.pageNum"
          v-model:limit="queryParams.pageSize"
          :total="total"
          @pagination="getList"
        />
      </div>
    </BottomFixed>
  </div>
</template>
