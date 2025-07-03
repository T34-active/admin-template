<script setup lang="ts">
import { listPost, addPost, delPost, getPost, updatePost } from '@/api/system/post'
import { createRules } from '@/utils'
import type { FormInstance, FormRules } from 'element-plus'
import QueryForm, { type QueryItemConfig } from '@/components/QueryForm/index.vue'

const { proxy } = getCurrentInstance()

const { sys_normal_disable } = proxy.useDict('sys_normal_disable')

const postList = ref([])
const postRef = ref<FormInstance>(null)
const open = ref(false)
const loading = ref(true)
const showSearch = ref(true)
const ids = ref<number[]>([])
const single = ref(true)
const multiple = ref(true)
const total = ref(0)
const title = ref('')

const items = ref<QueryItemConfig[]>([
  // {
  //   label: '字典名称',
  //   prop: 'dictType',
  //   type: 'select',
  //   placeholder: '请选择字典名称',
  //   dict: typeOptions.value.map((item) => ({
  //     label: item.dictName,
  //     value: item.dictType,
  //   })),
  // },
  {
    label: '岗位编码',
    prop: 'postName',
    type: 'input',
    placeholder: '请输入岗位编码',
  },
  {
    label: '岗位名称',
    prop: 'dictLabel',
    type: 'input',
    placeholder: '请输入岗位名称',
  },
  {
    label: '状态',
    prop: 'status',
    type: 'radio',
    dict: sys_normal_disable,
  },
])

const data = reactive({
  form: {
    postId: undefined,
    postCode: undefined,
    postName: undefined,
    postSort: 0,
    status: '0',
    remark: undefined,
  },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    postCode: undefined,
    postName: undefined,
    status: undefined,
  },
  rules: {
    postName: createRules('岗位名称不能为空'),
    postCode: createRules('岗位编码不能为空'),
    postSort: createRules('岗位顺序不能为空'),
  } as FormRules,
})

const { queryParams, form, rules } = toRefs(data)

/** 查询岗位列表 */
async function getList() {
  loading.value = true
  const response = await listPost(queryParams.value)
  postList.value = response.rows
  total.value = response.total
  loading.value = false
}
/** 取消按钮 */
function cancel() {
  open.value = false
  reset()
}
/** 表单重置 */
function reset() {
  form.value = {
    postId: undefined,
    postCode: undefined,
    postName: undefined,
    postSort: 0,
    status: '0',
    remark: undefined,
  }
  proxy.resetForm('postRef')
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
  ids.value = selection.map((item) => item.postId)
  single.value = selection.length !== 1
  multiple.value = !selection.length
}
/** 新增按钮操作 */
function handleAdd() {
  reset()
  open.value = true
  title.value = '添加岗位'
}
/** 修改按钮操作 */
async function handleUpdate(row) {
  reset()
  const postId = row.postId || ids.value
  const response = await getPost(postId)
  form.value = response.data
  open.value = true
  title.value = '修改岗位'
}
/** 提交按钮 */
async function submitForm() {
  try {
    const valid = await postRef.value.validate()
    if (!valid) return
    const isEdit = form.value.postId !== undefined
    const action = isEdit ? updatePost : addPost
    const successMsg = isEdit ? '修改成功' : '新增成功'
    await action(form.value)
    proxy.$modal.msgSuccess(successMsg)
    open.value = false
    await getList()
  } catch (error) {
    console.error('提交失败：', error)
  }
}
/** 删除按钮操作 */
function handleDelete(row) {
  const postIds = row.postId || ids.value
  proxy.$modal
    .confirm('是否确认删除岗位编号为"' + postIds + '"的数据项？')
    .then(function () {
      return delPost(postIds)
    })
    .then(() => {
      getList()
      proxy.$modal.msgSuccess('删除成功')
    })
    .catch((e) => {
      console.log(e)
    })
}
/** 导出按钮操作 */
function handleExport() {
  proxy.download(
    'system/post/export',
    {
      ...queryParams.value,
    },
    `post_${new Date().getTime()}.xlsx`,
  )
}

onMounted(async () => {
  await getList()
})
</script>
<template>
  <div class="app-container">
    <collapsePanel v-model="showSearch">
      <div class="p-4">
        <el-form ref="queryRef" :model="queryParams" label-width="auto">
          <el-row :gutter="20">
            <QueryForm :model="queryParams" :items="items" />
          </el-row>
        </el-form>
        <el-row :gutter="10">
          <el-col :span="1.5">
            <el-button
              v-hasPermi="['system:post:add']"
              type="primary"
              plain
              icon="Plus"
              @click="handleAdd"
            >
              新增
            </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button
              v-hasPermi="['system:post:edit']"
              type="success"
              plain
              icon="Edit"
              :disabled="single"
              @click="handleUpdate"
            >
              修改
            </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button
              v-hasPermi="['system:post:remove']"
              type="danger"
              plain
              icon="Delete"
              :disabled="multiple"
              @click="handleDelete"
            >
              删除
            </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button
              v-hasPermi="['system:post:export']"
              type="warning"
              plain
              icon="Download"
              @click="handleExport"
            >
              导出
            </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button icon="Refresh" @click="resetQuery">重置</el-button>
          </el-col>
        </el-row>
      </div>
    </collapsePanel>
    <el-table v-loading="loading" :data="postList" @selectionChange="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="岗位编号" align="center" prop="postId" />
      <el-table-column label="岗位编码" align="center" prop="postCode" />
      <el-table-column label="岗位名称" align="center" prop="postName" />
      <el-table-column label="岗位排序" align="center" prop="postSort" />
      <el-table-column label="状态" align="center" prop="status">
        <template #default="scope">
          <dict-tag :options="sys_normal_disable" :value="scope.row.status" />
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createTime" width="180" />
      <el-table-column
        label="操作"
        align="center"
        class-name="small-padding fixed-width"
        fixed="right"
        min-width="150"
      >
        <template #default="scope">
          <el-button
            v-hasPermi="['system:post:edit']"
            link
            type="primary"
            icon="Edit"
            @click="handleUpdate(scope.row)"
          >
            修改
          </el-button>
          <el-button
            v-hasPermi="['system:post:remove']"
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
      <div class="flex items-center justify-end p-4">
        <pagination
          v-model:page="queryParams.pageNum"
          v-model:limit="queryParams.pageSize"
          :total="total"
          @pagination="getList"
        />
      </div>
    </BottomFixed>

    <!-- 添加或修改岗位对话框 -->
    <el-dialog
      v-model="open"
      :title="title"
      width="500px"
      append-to-body
      :close-on-click-modal="false"
    >
      <el-form ref="postRef" :model="form" :rules="rules" label-width="auto">
        <el-form-item label="岗位名称" prop="postName">
          <el-input v-model="form.postName" placeholder="请输入岗位名称" clearable />
        </el-form-item>
        <el-form-item label="岗位编码" prop="postCode">
          <el-input v-model="form.postCode" placeholder="请输入编码名称" clearable />
        </el-form-item>
        <el-form-item label="岗位顺序" prop="postSort">
          <el-input-number v-model="form.postSort" controls-position="right" :min="0" />
        </el-form-item>
        <el-form-item label="岗位状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio v-for="dict in sys_normal_disable" :key="dict.value" :value="dict.value">
              {{ dict.label }}
            </el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入内容" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>
