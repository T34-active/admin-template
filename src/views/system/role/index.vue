<script setup lang="ts">
import {
  addRole,
  changeRoleStatus,
  dataScope,
  delRole,
  getRole,
  listRole,
  updateRole,
  deptTreeSelect,
} from '@/api/system/role'
import { roleMenuTreeSelect, treeselect as menuTreeselect } from '@/api/system/menu'
import { parseTime } from '@/utils/ruoyi'

import { useRouter } from 'vue-router'
import { createRules } from '@/utils'
import type { FormInstance } from 'element-plus'
import { dataScopeOptions } from '@/utils/column'
import QueryForm, { type QueryItemConfig } from '@/components/QueryForm/index.vue'

const router = useRouter()
const { proxy } = getCurrentInstance()

const { sys_normal_disable } = proxy.useDict('sys_normal_disable')

const roleList = ref([])
const roleRef = ref<FormInstance>(null)
const open = ref(false)
const loading = ref(true)
const showSearch = ref(true)
const ids = ref<number[]>([])
const single = ref(true)
const multiple = ref(true)
const total = ref(0)
const title = ref('')
const menuOptions = ref([])
const menuExpand = ref(false)
const menuNodeAll = ref(false)
const deptExpand = ref(true)
const deptNodeAll = ref(false)
const deptOptions = ref([])
const openDataScope = ref(false)
const menuRef = ref(null)
const deptRef = ref(null)

const treeRefs = {
  menu: menuRef,
  dept: deptRef,
}

const queryItem = ref<QueryItemConfig[]>([
  {
    label: '角色名称',
    prop: 'roleName',
    type: 'input',
    placeholder: '请输入角色名称',
  },
  {
    label: '权限字符',
    prop: 'roleName',
    type: 'input',
    placeholder: '请输入权限字符',
  },
  {
    label: '状态',
    prop: 'status',
    type: 'radio',
    dict: sys_normal_disable,
  },
  {
    label: '创建时间',
    prop: 'dateRange',
    type: 'daterange',
    startPlaceholder: '开始时间',
    endPlaceholder: '结束时间',
  },
])

const treeOptions = {
  menu: menuOptions,
  dept: deptOptions,
}

const data = reactive({
  form: {
    roleId: undefined,
    roleName: undefined,
    roleKey: undefined,
    roleSort: 0,
    status: '0',
    menuIds: [],
    deptIds: [],
    menuCheckStrictly: true,
    deptCheckStrictly: true,
    remark: undefined,
    dataScope: undefined,
  },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    roleName: undefined,
    roleKey: undefined,
    status: undefined,
    dateRange: [undefined, undefined] as [Date | string | undefined, Date | string | undefined],
  },
  rules: {
    roleName: createRules('角色名称不能为空'),
    roleKey: createRules('权限字符不能为空'),
    roleSort: createRules('角色顺序不能为空'),
  },
})

const { queryParams, form, rules } = toRefs(data)

/** 查询角色列表 */
async function getList() {
  loading.value = true
  const safeRange: [Date | string | undefined, Date | string | undefined] =
    Array.isArray(queryParams.value.dateRange) && queryParams.value.dateRange.length === 2
      ? [queryParams.value.dateRange[0], queryParams.value.dateRange[1]]
      : [undefined, undefined]
  const response = await listRole(proxy.addDateRange(queryParams.value, safeRange))
  roleList.value = response.rows
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
  queryParams.value.dateRange = [null, null]
  proxy.resetForm('queryRef')
  handleQuery()
}
/** 删除按钮操作 */
function handleDelete(row) {
  const roleIds = row.roleId || ids.value
  proxy.$modal
    .confirm('是否确认删除角色编号为"' + roleIds + '"的数据项？')
    .then(function () {
      return delRole(roleIds)
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
    'system/role/export',
    {
      ...queryParams.value,
    },
    `role_${new Date().getTime()}.xlsx`,
  )
}
/** 多选框选中数据 */
function handleSelectionChange(selection) {
  ids.value = selection.map((item) => item.roleId)
  single.value = selection.length !== 1
  multiple.value = !selection.length
}
/** 角色状态修改 */
function handleStatusChange(row) {
  const text = row.status === '0' ? '启用' : '停用'
  proxy.$modal
    .confirm('确认要"' + text + '""' + row.roleName + '"角色吗？')
    .then(function () {
      return changeRoleStatus(row.roleId, row.status)
    })
    .then(() => {
      proxy.$modal.msgSuccess(text + '成功')
    })
    .catch(function () {
      row.status = row.status === '0' ? '1' : '0'
    })
}

/** 分配用户 */
function handleAuthUser(row) {
  router.push('/system/role-auth/user/' + row.roleId)
}
/** 查询菜单树结构 */
async function getMenuTreeSelect() {
  const response = await menuTreeselect()
  menuOptions.value = response.data
}
/** 所有部门节点数据 */
function getDeptAllCheckedKeys() {
  // 目前被选中的部门节点
  const checkedKeys = deptRef.value.getCheckedKeys()
  // 半选中的部门节点
  const halfCheckedKeys = deptRef.value.getHalfCheckedKeys()
  checkedKeys.unshift.apply(checkedKeys, halfCheckedKeys)
  return checkedKeys
}
/** 重置新增的表单以及其他数据  */
function reset() {
  if (menuRef.value) {
    menuRef.value.setCheckedKeys([])
  }
  menuExpand.value = false
  menuNodeAll.value = false
  deptExpand.value = true
  deptNodeAll.value = false
  form.value = {
    roleId: undefined,
    roleName: undefined,
    roleKey: undefined,
    roleSort: 0,
    status: '0',
    menuIds: [],
    deptIds: [],
    menuCheckStrictly: true,
    deptCheckStrictly: true,
    remark: undefined,
    dataScope: undefined,
  }
  proxy.resetForm('roleRef')
}
/** 添加角色 */
function handleAdd() {
  reset()
  getMenuTreeSelect()
  open.value = true
  title.value = '添加角色'
}
/** 修改角色 */
async function handleUpdate(row) {
  reset()
  const roleId = row.roleId || ids.value
  // 并发请求角色信息和菜单权限树
  const [roleRes, menuRes] = await Promise.all([getRole(roleId), getroleMenuTreeSelect(roleId)])
  form.value = {
    ...roleRes.data,
    roleSort: Number(roleRes.data.roleSort),
  }
  open.value = true
  title.value = '修改角色'
  await nextTick()
  if (menuRef.value) {
    menuRef.value.setCheckedKeys(menuRes.checkedKeys || [])
  }
}

/** 根据角色ID查询菜单树结构 */
async function getroleMenuTreeSelect(roleId: number) {
  const { menus, ...rest } = await roleMenuTreeSelect(roleId)
  menuOptions.value = menus
  return { menus, ...rest }
}

/** 根据角色ID查询部门树结构 */
async function getDeptTree(roleId: number) {
  const { depts, ...rest } = await deptTreeSelect(roleId)
  deptOptions.value = depts
  return { depts, ...rest }
}

/** 树权限（展开/折叠） */
function handleCheckedTreeExpand(value: boolean, type: 'menu' | 'dept') {
  const ref = treeRefs[type].value
  const list = treeOptions[type].value
  list.forEach((item) => {
    const node = ref.store.nodesMap[item.id]
    if (node) node.expanded = value
  })
}

/** 树权限（全选/全不选） */
function handleCheckedTreeNodeAll(value: boolean, type: 'menu' | 'dept') {
  const ref = treeRefs[type].value
  const list = treeOptions[type].value
  ref.setCheckedNodes(value ? list : [])
}

/** 树权限（父子联动） */
function handleCheckedTreeConnect(value: boolean, type: 'menu' | 'dept') {
  const key = type === 'menu' ? 'menuCheckStrictly' : 'deptCheckStrictly'
  form.value[key] = value
}
/** 所有菜单节点数据 */
function getMenuAllCheckedKeys() {
  // 目前被选中的菜单节点
  const checkedKeys = menuRef.value.getCheckedKeys()
  // 半选中的菜单节点
  const halfCheckedKeys = menuRef.value.getHalfCheckedKeys()
  checkedKeys.unshift.apply(checkedKeys, halfCheckedKeys)
  return checkedKeys
}
/** 提交按钮 */
async function submitForm() {
  const isEdit = form.value.roleId !== undefined
  const handler = isEdit ? updateRole : addRole
  const successMsg = isEdit ? '修改成功' : '新增成功'
  const errorMsg = isEdit ? '修改失败' : '新增失败'
  try {
    const valid = await roleRef.value.validate()
    if (!valid) return
    form.value.menuIds = getMenuAllCheckedKeys()
    await handler(form.value)
    proxy.$modal.msgSuccess(successMsg)
    open.value = false
    await getList()
  } catch (error) {
    console.error(`${errorMsg}：`, error)
    proxy.$modal.msgError(errorMsg)
  }
}

/** 取消按钮 */
function cancel() {
  open.value = false
  reset()
}
/** 选择角色权限范围触发 */
function dataScopeSelectChange(value) {
  if (value !== '2') {
    deptRef.value.setCheckedKeys([])
  }
}
/** 分配数据权限操作 */
async function handleDataScope(row) {
  reset()
  const [deptTreeRes, roleRes] = await Promise.all([getDeptTree(row.roleId), getRole(row.roleId)])
  form.value = roleRes.data
  openDataScope.value = true
  title.value = '分配数据权限'
  await nextTick()
  if (deptRef.value) {
    deptRef.value.setCheckedKeys(deptTreeRes.checkedKeys)
  }
}

/** 提交按钮（数据权限） */
async function submitDataScope() {
  if (form.value.roleId) {
    form.value.deptIds = getDeptAllCheckedKeys()
    await dataScope(form.value)
    proxy.$modal.msgSuccess('修改成功')
    openDataScope.value = false
    await getList()
  }
}
/** 取消按钮（数据权限） */
function cancelDataScope() {
  openDataScope.value = false
  reset()
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
              @click="handleAdd"
            >
              新增
            </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button
              v-hasPermi="['system:role:edit']"
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
              v-hasPermi="['system:role:remove']"
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
              v-hasPermi="['system:role:export']"
              type="warning"
              plain
              icon="Download"
              @click="handleExport"
            >
              导出
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
    <!-- 表格数据 -->
    <el-table v-loading="loading" :data="roleList" @selectionChange="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="角色编号" prop="roleId" width="120" />
      <el-table-column label="角色名称" prop="roleName" :show-overflow-tooltip="true" width="150" />
      <el-table-column label="权限字符" prop="roleKey" :show-overflow-tooltip="true" width="150" />
      <el-table-column label="显示顺序" prop="roleSort" width="100" />
      <el-table-column label="状态" align="center" width="100">
        <template #default="scope">
          <el-switch
            v-model="scope.row.status"
            active-value="0"
            inactive-value="1"
            @change="handleStatusChange(scope.row)"
          />
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createTime" min-width="150">
        <template #default="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        align="center"
        class-name="small-padding fixed-width"
        fixed="right"
        min-width="150"
      >
        <template #default="scope">
          <el-tooltip v-if="scope.row.roleId !== 1" content="修改" placement="top">
            <el-button
              v-hasPermi="['system:role:edit']"
              link
              type="primary"
              icon="Edit"
              @click="handleUpdate(scope.row)"
            />
          </el-tooltip>
          <el-tooltip v-if="scope.row.roleId !== 1" content="删除" placement="top">
            <el-button
              v-hasPermi="['system:role:remove']"
              link
              type="primary"
              icon="Delete"
              @click="handleDelete(scope.row)"
            />
          </el-tooltip>
          <el-tooltip v-if="scope.row.roleId !== 1" content="数据权限" placement="top">
            <el-button
              v-hasPermi="['system:role:edit']"
              link
              type="primary"
              icon="CircleCheck"
              @click="handleDataScope(scope.row)"
            />
          </el-tooltip>
          <el-tooltip v-if="scope.row.roleId !== 1" content="分配用户" placement="top">
            <el-button
              v-hasPermi="['system:role:edit']"
              link
              type="primary"
              icon="User"
              @click="handleAuthUser(scope.row)"
            />
          </el-tooltip>
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
    <!-- 添加或修改角色配置对话框 -->
    <el-dialog
      v-model="open"
      :title="title"
      width="500px"
      append-to-body
      :close-on-click-modal="false"
    >
      <el-form ref="roleRef" :model="form" :rules="rules" label-width="auto">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="form.roleName" placeholder="请输入角色名称" />
        </el-form-item>
        <el-form-item prop="roleKey">
          <template #label>
            <span>
              <el-tooltip
                content="控制器中定义的权限字符，如：@PreAuthorize(`@ss.hasRole('admin')`)"
                placement="top"
              >
                <el-icon><question-filled /></el-icon>
              </el-tooltip>
              权限字符
            </span>
          </template>
          <el-input v-model="form.roleKey" placeholder="请输入权限字符" />
        </el-form-item>
        <el-form-item label="角色顺序" prop="roleSort">
          <el-input-number v-model="form.roleSort" controls-position="right" :min="0" />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="form.status">
            <el-radio v-for="dict in sys_normal_disable" :key="dict.value" :value="dict.value">
              {{ dict.label }}
            </el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="菜单权限">
          <el-checkbox v-model="menuExpand" @change="handleCheckedTreeExpand($event, 'menu')">
            展开/折叠
          </el-checkbox>
          <el-checkbox v-model="menuNodeAll" @change="handleCheckedTreeNodeAll($event, 'menu')">
            全选/全不选
          </el-checkbox>
          <el-checkbox
            v-model="form.menuCheckStrictly"
            @change="handleCheckedTreeConnect($event, 'menu')"
          >
            父子联动
          </el-checkbox>
          <el-tree
            ref="menuRef"
            class="tree-border"
            :data="menuOptions"
            show-checkbox
            node-key="id"
            :check-strictly="!form.menuCheckStrictly"
            empty-text="加载中，请稍候"
            :props="{ label: 'label', children: 'children' }"
          />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入内容" :rows="2" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 分配角色数据权限对话框 -->
    <el-dialog
      v-model="openDataScope"
      :title="title"
      width="500px"
      append-to-body
      :close-on-click-modal="false"
    >
      <el-form :model="form" label-width="auto">
        <el-form-item label="角色名称">
          <el-input v-model="form.roleName" :disabled="true" />
        </el-form-item>
        <el-form-item label="权限字符">
          <el-input v-model="form.roleKey" :disabled="true" />
        </el-form-item>
        <el-form-item label="权限范围">
          <el-select v-model="form.dataScope" @change="dataScopeSelectChange">
            <el-option
              v-for="item in dataScopeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item v-show="form.dataScope === 2" label="数据权限">
          <el-checkbox v-model="deptExpand" @change="handleCheckedTreeExpand($event, 'dept')">
            展开/折叠
          </el-checkbox>
          <el-checkbox v-model="deptNodeAll" @change="handleCheckedTreeNodeAll($event, 'dept')">
            全选/全不选
          </el-checkbox>
          <el-checkbox
            v-model="form.deptCheckStrictly"
            @change="handleCheckedTreeConnect($event, 'dept')"
          >
            父子联动
          </el-checkbox>
          <el-tree
            ref="deptRef"
            class="tree-border"
            :data="deptOptions"
            show-checkbox
            default-expand-all
            node-key="id"
            :check-strictly="!form.deptCheckStrictly"
            empty-text="加载中，请稍候"
            :props="{ label: 'label', children: 'children' }"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitDataScope">确 定</el-button>
          <el-button @click="cancelDataScope">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>
