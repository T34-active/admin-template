<script setup lang="ts">
import { listNotice, delNotice } from '@/api/system/notice'

import type { QueryItemConfig } from '@/components/QueryForm/index.vue'

const { proxy } = getCurrentInstance()

const { sys_notice_status, sys_notice_type } = proxy.useDict('sys_notice_status', 'sys_notice_type')

const noticeList = ref([])
const loading = ref(true)
const showSearch = ref(true)
const ids = ref<number[]>([])
const single = ref(true)
const multiple = ref(true)
const total = ref(0)

const items = ref<QueryItemConfig[]>([
  {
    label: '公告标题',
    prop: 'noticeTitle',
    type: 'input',
    placeholder: '请输入公告标题',
  },
  {
    label: '操作人员',
    prop: 'createBy',
    type: 'input',
    placeholder: '请输入操作人员',
  },
  {
    label: '类型',
    prop: 'noticeType',
    type: 'radio',
    dict: sys_notice_type,
  },
])

const queryParams = ref({
  pageNum: 1,
  pageSize: 10,
  noticeTitle: undefined,
  noticeType: undefined,
  createBy: undefined,
  status: undefined,
})

/** 查询公告列表 */
async function getList() {
  loading.value = true
  const response = await listNotice(queryParams.value)
  noticeList.value = response.rows
  total.value = response.total
  loading.value = false
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1
  getList()
}
/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm('queryRef')
  handleQuery()
}
/** 多选框选中数据 */
function handleSelectionChange(selection) {
  ids.value = selection.map((item) => item.noticeId)
  single.value = selection.length !== 1
  multiple.value = !selection.length
}
/** 新增按钮操作 */
function handleAdd() {
  proxy.$router.push({
    path: '/system/noticeDetail',
  })
}
/** 修改按钮操作 */
async function handleUpdate(row) {
  proxy.$router.push({
    path: '/system/noticeDetail',
    query: { noticeId: row.noticeId },
  })
}

/** 删除按钮操作 */
function handleDelete(row) {
  const noticeIds = row.noticeId || ids.value
  proxy.$modal
    .confirm('是否确认删除公告编号为"' + noticeIds + '"的数据项？')
    .then(function () {
      return delNotice(noticeIds)
    })
    .then(() => {
      getList()
      proxy.$modal.msgSuccess('删除成功')
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
            <QueryForm :model="queryParams" :items="items" />
          </el-row>
        </el-form>
        <el-row :gutter="10">
          <el-col :span="1.5">
            <el-button
              plain
              v-hasPermi="['system:notice:add']"
              type="primary"
              icon="Plus"
              @click="handleAdd"
            >
              新增
            </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button
              plain
              v-hasPermi="['system:notice:edit']"
              type="success"
              icon="Edit"
              :disabled="single"
              @click="handleUpdate"
            >
              修改
            </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button
              plain
              v-hasPermi="['system:notice:remove']"
              type="danger"
              icon="Delete"
              :disabled="multiple"
              @click="handleDelete"
            >
              删除
            </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button icon="Refresh" @click="resetQuery">重置</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
          </el-col>
        </el-row>
      </div>
    </CollapsePanel>
    <el-table v-loading="loading" :data="noticeList" @selectionChange="handleSelectionChange">
      <el-table-column type="selection" width="55" />
      <el-table-column label="序号" prop="noticeId" min-width="150" />
      <el-table-column
        label="公告标题"
        prop="noticeTitle"
        :show-overflow-tooltip="true"
        min-width="200"
      />
      <el-table-column label="公告类型" prop="noticeType" min-width="150">
        <template #default="scope">
          <dict-tag :options="sys_notice_type" :value="scope.row.noticeType" />
        </template>
      </el-table-column>
      <el-table-column label="状态" prop="status" min-width="150">
        <template #default="scope">
          <dict-tag :options="sys_notice_status" :value="scope.row.status" />
        </template>
      </el-table-column>
      <el-table-column label="创建者" prop="createBy" min-width="150" />
      <el-table-column label="创建时间" prop="createTime" min-width="200" />
      <el-table-column
        label="操作"
        class-name="small-padding fixed-width"
        fixed="right"
        min-width="150"
      >
        <template #default="scope">
          <el-button
            v-hasPermi="['system:notice:edit']"
            link
            type="primary"
            icon="Edit"
            @click="handleUpdate(scope.row)"
          >
            修改
          </el-button>
          <el-button
            v-hasPermi="['system:notice:remove']"
            link
            type="primary"
            icon="Delete"
            @click="handleDelete(scope.row)"
          >
            删除
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
  </div>
</template>
