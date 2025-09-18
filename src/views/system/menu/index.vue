<script setup lang="ts">
import { addMenu, delMenu, getMenu, listMenu, updateMenu } from '@/api/system/menu'
import SvgIcon from '@/components/SvgIcon/index.vue'
import IconSelect from '@/components/IconSelect/index.vue'
import { ClickOutside as vClickOutside, type FormInstance, type FormRules } from 'element-plus'
import { createRules } from '@/utils'
import type { QueryItemConfig } from '@/components/QueryForm/index.vue'
import { menuTypeOptions } from '@/utils/column'
import { ElButton, ElAutoResizer, ElTag } from 'element-plus'
const { proxy } = getCurrentInstance()

const { sys_show_hide, sys_normal_disable } = proxy.useDict('sys_show_hide', 'sys_normal_disable')
const menuRef = ref<FormInstance>(null)
const menuList = ref([])
const open = ref(false)
const loading = ref(true)
const showSearch = ref(true)
const title = ref('')
const menuOptions = ref([])
const isExpandAll = ref(false)
const refreshTable = ref(true)
const showChooseIcon = ref(false)
const iconSelectRef = ref(null)
const isExpandedMap = ref<Record<string, boolean>>({})

// 模拟扁平化数据结构
function flattenTreeData(list, parentId = null, level = 0) {
  const result = []
  list.forEach((item) => {
    const id = item.menuId
    const flatItem = {
      ...item,
      _level: level,
      _parentId: parentId,
      _hasChildren: Array.isArray(item.children) && item.children.length > 0,
    }
    result.push(flatItem)
    if (flatItem._hasChildren) {
      result.push(...flattenTreeData(item.children, id, level + 1))
    }
  })
  return result
}

const flatMenuListAll = computed(() => flattenTreeData(menuList.value ?? []))

// 只展示展开后的节点
const flatMenuList = computed(() => {
  const list = []
  const map = isExpandedMap.value

  const idSet = new Set<string>()
  flatMenuListAll.value.forEach((item) => {
    const parentId = item._parentId
    if (!parentId || idSet.has(parentId)) {
      list.push(item)
      if (item._hasChildren && map[item.menuId]) {
        idSet.add(item.menuId)
      }
    }
  })
  return list
})

// 展开或折叠
function toggleExpand(row) {
  isExpandedMap.value[row.menuId] = !isExpandedMap.value[row.menuId]
}

// 2. el-table-v2 的 columns 定义
const columns = ref([
  {
    key: 'menuName',
    title: '菜单名称',
    dataKey: 'menuName',
    width: 250,
    cellRenderer: ({ rowData }) => {
      const indent = `${rowData._level * 20}px`
      const isExpanded = isExpandedMap.value[rowData.menuId] ?? false
      const hasChildren = rowData._hasChildren
      return h(
        'div',
        {
          class: 'flex items-center gap-x-15',
          style: { paddingLeft: indent },
        },
        [
          hasChildren &&
            h(
              'span',
              {
                class: 'cursor-pointer text-xs select-none',
                onClick: () => toggleExpand(rowData),
              },
              isExpanded ? '▼' : '▶',
            ),
          h('span', null, rowData.menuName),
        ],
      )
    },
  },
  {
    key: 'icon',
    title: '图标',
    dataKey: 'icon',
    width: 100,
    cellRenderer: ({ rowData }) => h(SvgIcon, { iconClass: rowData.icon }),
  },
  { key: 'orderNum', title: '排序', dataKey: 'orderNum', width: 60 },
  { key: 'perms', title: '权限标识', dataKey: 'perms', width: 200 },
  { key: 'component', title: '组件路径', dataKey: 'component', width: 200 },
  { key: 'path', title: '路由地址', dataKey: 'path', width: 150 },
  { key: 'routeName', title: '路由名称', dataKey: 'routeName', width: 150 },
  {
    key: 'status',
    title: '状态',
    dataKey: 'status',
    width: 80,
    cellRenderer: ({ rowData }) => {
      const status = rowData.status
      let label = ''
      let type: 'primary' | 'success' | 'info' | 'warning' | 'danger' = 'primary'

      if (status === '0' || status === 0) {
        label = '正常'
        type = 'success'
      } else if (status === '1' || status === 1) {
        label = '停用'
        type = 'danger'
      }

      return h(
        ElTag,
        {
          type,
          disableTransitions: true,
        },
        () => label,
      )
    },
  },
  { key: 'createTime', title: '创建时间', dataKey: 'createTime', width: 200 },
  {
    key: 'actions',
    title: '操作',
    width: 250,
    cellRenderer: ({ rowData }) =>
      h('div', { class: 'small-padding fixed-width' }, [
        h(
          ElButton,
          {
            link: true,
            type: 'primary',
            icon: 'Edit',
            onClick: () => handleUpdate(rowData),
          },
          () => '修改',
        ),
        h(
          ElButton,
          {
            link: true,
            type: 'primary',
            icon: 'Plus',
            onClick: () => handleAdd(rowData),
          },
          () => '新增',
        ),
        h(
          ElButton,
          {
            link: true,
            type: 'primary',
            icon: 'Delete',
            onClick: () => handleDelete(rowData),
          },
          () => '删除',
        ),
      ]),
  },
])

const items = ref<QueryItemConfig[]>([
  {
    label: '菜单名称',
    prop: 'menuName',
    type: 'input',
    placeholder: '请输入菜单名称',
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
    menuId: undefined,
    parentId: 0,
    menuName: undefined,
    icon: undefined,
    menuType: 'M',
    orderNum: 1,
    isFrame: '1',
    isCache: '0',
    visible: '0',
    status: '0',
    path: undefined,
    routeName: undefined,
    query: undefined,
    component: undefined,
    perms: undefined,
  },
  queryParams: {
    status: undefined,
    menuName: undefined,
    visible: undefined,
  },
  rules: {
    menuName: createRules('菜单名称不能为空'),
    orderNum: createRules('菜单顺序不能为空'),
    path: createRules('路由地址不能为空'),
  } as FormRules,
})

const { queryParams, form, rules } = toRefs(data)

/** 查询菜单列表 */
async function getList() {
  loading.value = true
  const response = await listMenu(queryParams.value)
  menuList.value = proxy.handleTree(response.data, 'menuId')
  loading.value = false
}

/** 查询菜单下拉树结构 */
async function getTreeSelect() {
  menuOptions.value = []
  const response = await listMenu()
  const menu: any = { menuId: 0, menuName: '主类目', children: [] }
  menu.children = proxy.handleTree(response.data, 'menuId')
  menuOptions.value.push(menu)
}

/** 取消按钮 */
function cancel() {
  open.value = false
  reset()
}

/** 表单重置 */
function reset() {
  form.value = {
    menuId: undefined,
    parentId: 0,
    menuName: undefined,
    icon: undefined,
    menuType: 'M',
    orderNum: 1,
    isFrame: '1',
    isCache: '0',
    visible: '0',
    status: '0',
    path: undefined,
    query: undefined,
    routeName: undefined,
    component: undefined,
    perms: undefined,
  }
  proxy.resetForm('menuRef')
}

/** 展示下拉图标 */
function showSelectIcon() {
  iconSelectRef.value.reset()
  showChooseIcon.value = true
}

/** 选择图标 */
function selected(name: string) {
  form.value.icon = name
  showChooseIcon.value = false
}

/** 图标外层点击隐藏下拉列表 */
function hideSelectIcon(event: any) {
  const elem = event.relatedTarget || event.srcElement || event.target || event.currentTarget
  const className = elem.className
  if (className !== 'el-input__inner') {
    showChooseIcon.value = false
  }
}

/** 搜索按钮操作 */
async function handleQuery() {
  await getList()
}

/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm('queryRef')
  handleQuery()
}

/** 新增按钮操作 */
async function handleAdd(row) {
  reset()
  await getTreeSelect()
  if (row !== null && row.menuId) {
    form.value.parentId = row.menuId
  } else {
    form.value.parentId = 0
  }
  open.value = true
  title.value = '添加菜单'
}

/** 展开/折叠操作 */
function toggleExpandAll() {
  const expand = !isExpandAll.value
  isExpandAll.value = expand

  const map = {}
  if (expand) {
    for (const item of flatMenuListAll.value) {
      if (item._hasChildren) {
        map[item.menuId] = true
      }
    }
  }

  isExpandedMap.value = map
}

/** 修改按钮操作 */
async function handleUpdate(row) {
  reset()
  await getTreeSelect()
  const response = await getMenu(row.menuId)
  form.value = response.data
  open.value = true
  title.value = '修改菜单'
}

/** 提交按钮 */
async function submitForm() {
  const valid = menuRef.value.validate()
  if (!valid) return
  if (form.value.menuId !== undefined) {
    await updateMenu(form.value)
    proxy.$modal.msgSuccess('修改成功')
  } else {
    await addMenu(form.value)
    proxy.$modal.msgSuccess('新增成功')
  }
  await getList()
  open.value = false
}

/** 删除按钮操作 */
async function handleDelete(row) {
  try {
    await proxy.$modal.confirm(`是否确认删除名称为"${row.menuName}"的数据项？`)
    await delMenu(row.menuId)
    await getList()
    proxy.$modal.msgSuccess('删除成功')
  } catch (e) {
    console.log(e)
  }
}

onMounted(async () => {
  await getList()
})
</script>
<template>
  <div class="app-container">
    <CollapsePanel v-model="showSearch">
      <div class="p-16">
        <el-form v-show="showSearch" ref="queryRef" :model="queryParams" label-width="auto">
          <el-row :gutter="10">
            <QueryForm :model="queryParams" :items="items" />
          </el-row>
        </el-form>
        <el-row :gutter="10">
          <el-col :span="1.5">
            <el-button
              v-hasPermi="['system:menu:add']"
              type="primary"
              plain
              icon="Plus"
              @click="handleAdd"
            >
              新增
            </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button icon="Refresh" @click="resetQuery">重置</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="info" plain icon="Sort" @click="toggleExpandAll">展开/折叠</el-button>
          </el-col>
        </el-row>
      </div>
    </CollapsePanel>
    <!-- 扁平化后的 menuList -->
    <div class="h-65vh">
      <el-auto-resizer>
        <template #default="{ height, width }">
          <el-table-v2
            v-if="refreshTable"
            :data="flatMenuList"
            :columns="columns"
            :width="width"
            :height="height"
            :loading="loading"
          />
        </template>
      </el-auto-resizer>
    </div>

    <!-- 添加或修改菜单对话框 -->
    <el-dialog
      v-model="open"
      :title="title"
      width="80%"
      append-to-body
      :close-on-click-modal="false"
    >
      <el-form ref="menuRef" :model="form" :rules="rules" label-width="auto">
        <el-row>
          <el-col :span="24">
            <el-form-item label="上级菜单">
              <el-tree-select
                v-model="form.parentId"
                :data="menuOptions"
                :props="{ value: 'menuId', label: 'menuName', children: 'children' }"
                value-key="menuId"
                placeholder="选择上级菜单"
                check-strictly
              />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="菜单类型" prop="menuType">
              <el-radio-group v-model="form.menuType">
                <el-radio v-for="dict in menuTypeOptions" :key="dict.value" :value="dict.value">
                  {{ dict.label }}
                </el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col v-if="form.menuType !== 'F'" :span="24">
            <el-form-item label="菜单图标" prop="icon">
              <el-popover
                v-model:visible="showChooseIcon"
                placement="bottom-start"
                :width="540"
                trigger="click"
                @show="showSelectIcon"
              >
                <template #reference>
                  <el-input
                    v-model="form.icon"
                    v-click-outside="hideSelectIcon"
                    placeholder="点击选择图标"
                    readonly
                    @blur="showSelectIcon"
                  >
                    <template #prefix>
                      <svg-icon
                        v-if="form.icon"
                        :icon-class="form.icon"
                        class="el-input__icon"
                        style="height: 32px; width: 16px"
                      />
                      <el-icon v-else style="height: 32px; width: 16px">
                        <search />
                      </el-icon>
                    </template>
                  </el-input>
                </template>
                <icon-select ref="iconSelectRef" @selected="selected" />
              </el-popover>
            </el-form-item>
          </el-col>
          <el-col :span="12" :xs="24">
            <el-form-item label="菜单名称" prop="menuName">
              <el-input v-model="form.menuName" placeholder="请输入菜单名称" clearable />
            </el-form-item>
          </el-col>
          <el-col :span="12" :xs="24" v-if="form.menuType === 'C'">
            <el-form-item prop="routeName">
              <template #label>
                <span>
                  <el-tooltip
                    content="默认不填则和路由地址相同：如地址为：`user`，则名称为`User`（注意：因为router会删除名称相同路由，为避免名字的冲突，特殊情况下请自定义，保证唯一性）"
                    placement="top"
                  >
                    <el-icon><question-filled /></el-icon>
                  </el-tooltip>
                  路由名称
                </span>
              </template>
              <el-input v-model="form.routeName" placeholder="请输入路由名称" clearable />
            </el-form-item>
          </el-col>
          <el-col :span="12" :xs="24">
            <el-form-item label="显示排序" prop="orderNum">
              <el-input-number v-model="form.orderNum" controls-position="right" :min="0" />
            </el-form-item>
          </el-col>
          <template v-if="form.menuType !== 'F'">
            <el-col :span="12" :xs="24">
              <el-form-item>
                <template #label>
                  <span>
                    <el-tooltip
                      content="选择是外链则路由地址需要以`http(s)://`开头"
                      placement="top"
                    >
                      <el-icon><question-filled /></el-icon>
                    </el-tooltip>
                    是否外链
                  </span>
                </template>
                <el-radio-group v-model="form.isFrame">
                  <el-radio value="0">是</el-radio>
                  <el-radio value="1">否</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>
            <el-col :span="12" :xs="24">
              <el-form-item prop="path">
                <template #label>
                  <span>
                    <el-tooltip
                      content="访问的路由地址，如：`user`，如外网地址需内链访问则以`http(s)://`开头"
                      placement="top"
                    >
                      <el-icon><question-filled /></el-icon>
                    </el-tooltip>
                    路由地址
                  </span>
                </template>
                <el-input v-model="form.path" placeholder="请输入路由地址" clearable />
              </el-form-item>
            </el-col>
          </template>
          <el-col v-if="form.menuType === 'C'" :span="12" :xs="24">
            <el-form-item prop="component">
              <template #label>
                <span>
                  <el-tooltip
                    content="访问的组件路径，如：`system/user/index`，默认在`views`目录下"
                    placement="top"
                  >
                    <el-icon><question-filled /></el-icon>
                  </el-tooltip>
                  组件路径
                </span>
              </template>
              <el-input v-model="form.component" placeholder="请输入组件路径" clearable />
            </el-form-item>
          </el-col>
          <el-col v-if="form.menuType !== 'M'" :span="12" :xs="24">
            <el-form-item>
              <el-input
                v-model="form.perms"
                placeholder="请输入权限标识"
                maxlength="100"
                clearable
              />
              <template #label>
                <span>
                  <el-tooltip
                    content="控制器中定义的权限字符，如：@PreAuthorize(`@ss.hasPermi('system:user:list')`)"
                    placement="top"
                  >
                    <el-icon><question-filled /></el-icon>
                  </el-tooltip>
                  权限字符
                </span>
              </template>
            </el-form-item>
          </el-col>
          <template v-if="form.menuType === 'C'">
            <el-col :span="12" :xs="24">
              <el-form-item>
                <el-input
                  v-model="form.query"
                  placeholder="请输入路由参数"
                  maxlength="255"
                  clearable
                />
                <template #label>
                  <span>
                    <el-tooltip
                      content='访问路由的默认传递参数，如：`{"id": 1, "name": "ry"}`'
                      placement="top"
                    >
                      <el-icon><question-filled /></el-icon>
                    </el-tooltip>
                    路由参数
                  </span>
                </template>
              </el-form-item>
            </el-col>
            <el-col :span="12" :xs="24">
              <el-form-item>
                <template #label>
                  <span>
                    <el-tooltip
                      content="选择是则会被`keep-alive`缓存，需要匹配组件的`name`和地址保持一致"
                      placement="top"
                    >
                      <el-icon><question-filled /></el-icon>
                    </el-tooltip>
                    是否缓存
                  </span>
                </template>
                <el-radio-group v-model="form.isCache">
                  <el-radio value="0">缓存</el-radio>
                  <el-radio value="1">不缓存</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>
          </template>
          <template v-if="form.menuType !== 'F'">
            <el-col :span="12" :xs="24">
              <el-form-item>
                <template #label>
                  <span>
                    <el-tooltip
                      content="选择隐藏则路由将不会出现在侧边栏，但仍然可以访问"
                      placement="top"
                    >
                      <el-icon><question-filled /></el-icon>
                    </el-tooltip>
                    显示状态
                  </span>
                </template>
                <el-radio-group v-model="form.visible">
                  <el-radio v-for="dict in sys_show_hide" :key="dict.value" :value="dict.value">
                    {{ dict.label }}
                  </el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>
            <el-col :span="12" :xs="24">
              <el-form-item>
                <template #label>
                  <span>
                    <el-tooltip
                      content="选择停用则路由将不会出现在侧边栏，也不能被访问"
                      placement="top"
                    >
                      <el-icon><question-filled /></el-icon>
                    </el-tooltip>
                    菜单状态
                  </span>
                </template>
                <el-radio-group v-model="form.status">
                  <el-radio
                    v-for="dict in sys_normal_disable"
                    :key="dict.value"
                    :value="dict.value"
                  >
                    {{ dict.label }}
                  </el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>
          </template>
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
