<script setup lang="ts">
import {
  listDept,
  getDept,
  delDept,
  addDept,
  updateDept,
  listDeptExcludeChild,
} from '@/api/system/dept'
import { parseTime } from '@/utils/ruoyi'
import type { FormInstance, FormRules } from 'element-plus'
import { createRules } from '@/utils'
import QueryForm, { type QueryItemConfig } from '@/components/QueryForm/index.vue'

const { proxy } = getCurrentInstance()

const { sys_normal_disable } = proxy.useDict('sys_normal_disable')

const deptList = ref([])
const open = ref(false)
const loading = ref(true)
const showSearch = ref(true)
const title = ref('')
const deptOptions = ref([])
const isExpandAll = ref(true)
const refreshTable = ref(true)
const deptRef = ref<FormInstance>(null)
const items = ref<QueryItemConfig[]>([
  {
    label: '部门名称',
    prop: 'deptName',
    type: 'input',
    placeholder: '请输入部门名称',
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
    deptId: undefined,
    parentId: undefined,
    deptName: undefined,
    orderNum: 0,
    leader: undefined,
    phone: undefined,
    email: undefined,
    status: '0',
  },
  queryParams: {
    deptName: undefined,
    status: undefined,
  },
  rules: {
    parentId: createRules('上级部门不能为空'),
    deptName: createRules('部门名称不能为空'),
    orderNum: createRules('显示排序不能为空'),
    email: [{ type: 'email', message: '请输入正确的邮箱地址', trigger: ['blur', 'change'] }],
    phone: [
      { pattern: /^1[3|456789][0-9]\d{8}$/, message: '请输入正确的手机号码', trigger: 'blur' },
    ],
  } as FormRules,
})

const { queryParams, form, rules } = toRefs(data)

/** 查询部门列表 */
async function getList() {
  loading.value = true
  const response = await listDept(queryParams.value)
  deptList.value = proxy.handleTree(response.data, 'deptId')
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
    deptId: undefined,
    parentId: undefined,
    deptName: undefined,
    orderNum: 0,
    leader: undefined,
    phone: undefined,
    email: undefined,
    status: '0',
  }
  proxy.resetForm('deptRef')
}
/** 搜索按钮操作 */
function handleQuery() {
  getList()
}
/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm('queryRef')
  handleQuery()
}
/** 新增按钮操作 */
async function handleAdd(row) {
  reset()
  const response = await listDept({})
  deptOptions.value = proxy.handleTree(response.data, 'deptId')
  if (row !== undefined) {
    form.value.parentId = row.deptId
  }
  open.value = true
  title.value = '添加部门'
}
/** 展开/折叠操作 */
function toggleExpandAll() {
  refreshTable.value = false
  isExpandAll.value = !isExpandAll.value
  nextTick(() => {
    refreshTable.value = true
  })
}
/** 修改按钮操作 */
async function handleUpdate(department: any) {
  reset()
  // 获取排除当前部门及其子部门后的部门列表，用于构建树结构
  const excludeChildResponse = await listDeptExcludeChild(department.deptId)
  deptOptions.value = proxy.handleTree(excludeChildResponse.data, 'deptId')
  // 获取当前部门的详细信息
  const departmentDetailResponse = await getDept(department.deptId)
  form.value = departmentDetailResponse.data
  // 打开编辑弹窗
  open.value = true
  title.value = '修改部门'
}

/** 提交按钮 */
async function submitForm() {
  const valid = await deptRef.value.validate()
  if (!valid) return
  if (form.value.deptId !== undefined) {
    await updateDept(form.value)
    proxy.$modal.msgSuccess('修改成功')
  } else {
    await addDept(form.value)
    proxy.$modal.msgSuccess('新增成功')
  }
  open.value = false
  await getList()
}
/** 删除按钮操作 */
function handleDelete(row) {
  proxy.$modal
    .confirm('是否确认删除名称为"' + row.deptName + '"的数据项？')
    .then(function () {
      return delDept(row.deptId)
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
      <div class="p-4">
        <el-form ref="queryRef" :model="queryParams" label-width="auto">
          <el-row :gutter="20">
            <QueryForm :model="queryParams" :items="items" />
          </el-row>
        </el-form>
        <el-row :gutter="10">
          <el-col :span="1.5">
            <el-button
              plain
              v-hasPermi="['system:dept:add']"
              type="primary"
              icon="Plus"
              @click="handleAdd"
            >
              新增
            </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="info" plain icon="Sort" @click="toggleExpandAll">展开/折叠</el-button>
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
    <el-table
      v-if="refreshTable"
      v-loading="loading"
      :data="deptList"
      row-key="deptId"
      :default-expand-all="isExpandAll"
      :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
    >
      <el-table-column prop="deptName" label="部门名称" width="260" />
      <el-table-column prop="orderNum" label="排序" width="200" />
      <el-table-column prop="status" label="状态" width="100">
        <template #default="scope">
          <dict-tag :options="sys_normal_disable" :value="scope.row.status" />
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createTime" min-width="200">
        <template #default="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        align="center"
        class-name="small-padding fixed-width"
        fixed="right"
        min-width="250"
      >
        <template #default="scope">
          <el-button
            v-hasPermi="['system:dept:edit']"
            link
            type="primary"
            icon="Edit"
            @click="handleUpdate(scope.row)"
          >
            修改
          </el-button>
          <el-button
            v-hasPermi="['system:dept:add']"
            link
            type="primary"
            icon="Plus"
            @click="handleAdd(scope.row)"
          >
            新增
          </el-button>
          <el-button
            v-if="scope.row.parentId !== 0"
            v-hasPermi="['system:dept:remove']"
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

    <!-- 添加或修改部门对话框 -->
    <el-dialog
      v-model="open"
      :title="title"
      width="600px"
      append-to-body
      :close-on-click-modal="false"
    >
      <el-form ref="deptRef" :model="form" :rules="rules" label-width="auto">
        <el-row>
          <el-col v-if="form.parentId !== 0" :span="24">
            <el-form-item label="上级部门" prop="parentId">
              <el-tree-select
                v-model="form.parentId"
                :data="deptOptions"
                :props="{ value: 'deptId', label: 'deptName', children: 'children' }"
                value-key="deptId"
                placeholder="选择上级部门"
                check-strictly
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="部门名称" prop="deptName">
              <el-input v-model="form.deptName" placeholder="请输入部门名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="显示排序" prop="orderNum">
              <el-input-number v-model="form.orderNum" controls-position="right" :min="0" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="负责人" prop="leader">
              <el-input v-model="form.leader" placeholder="请输入负责人" maxlength="20" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系电话" prop="phone">
              <el-input v-model="form.phone" placeholder="请输入联系电话" maxlength="11" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="form.email" placeholder="请输入邮箱" maxlength="50" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="部门状态">
              <el-radio-group v-model="form.status">
                <el-radio v-for="dict in sys_normal_disable" :key="dict.value" :value="dict.value">
                  {{ dict.label }}
                </el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
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
