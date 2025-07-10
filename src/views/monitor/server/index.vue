<template>
  <div class="app-container">
    <el-row :gutter="10">
      <el-col :span="12" class="card-box">
        <el-card>
          <template #header>
            <div class="flex items-center gap-x-2">
              <Cpu style="width: 1em; height: 1em; vertical-align: middle" />
              <span style="vertical-align: middle">CPU</span>
            </div>
          </template>
          <div class="el-table el-table--enable-row-hover el-table--medium">
            <table cellspacing="0" style="width: 100%">
              <thead>
                <tr>
                  <th class="el-table__cell is-leaf"><div class="cell">属性</div></th>
                  <th class="el-table__cell is-leaf"><div class="cell">值</div></th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td class="el-table__cell is-leaf"><div class="cell">核心数</div></td>
                  <td class="el-table__cell is-leaf">
                    <div v-if="server.cpu" class="cell">{{ server.cpu.cpuNum }}</div>
                  </td>
                </tr>
                <tr>
                  <td class="el-table__cell is-leaf"><div class="cell">用户使用率</div></td>
                  <td class="el-table__cell is-leaf">
                    <div v-if="server.cpu" class="cell">{{ server.cpu.used }}%</div>
                  </td>
                </tr>
                <tr>
                  <td class="el-table__cell is-leaf"><div class="cell">系统使用率</div></td>
                  <td class="el-table__cell is-leaf">
                    <div v-if="server.cpu" class="cell">{{ server.cpu.sys }}%</div>
                  </td>
                </tr>
                <tr>
                  <td class="el-table__cell is-leaf"><div class="cell">当前空闲率</div></td>
                  <td class="el-table__cell is-leaf">
                    <div v-if="server.cpu" class="cell">{{ server.cpu.free }}%</div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </el-card>
      </el-col>
      <el-col :span="12" class="card-box">
        <el-card>
          <template #header>
            <div class="flex items-center gap-x-2">
              <Tickets style="width: 1em; height: 1em; vertical-align: middle" />
              <span style="vertical-align: middle">内存</span>
            </div>
          </template>
          <div class="el-table el-table--enable-row-hover el-table--medium">
            <table cellspacing="0" style="width: 100%">
              <thead>
                <tr>
                  <th class="el-table__cell is-leaf"><div class="cell">属性</div></th>
                  <th class="el-table__cell is-leaf"><div class="cell">内存</div></th>
                  <th class="el-table__cell is-leaf"><div class="cell">JVM</div></th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td class="el-table__cell is-leaf"><div class="cell">总内存</div></td>
                  <td class="el-table__cell is-leaf">
                    <div v-if="server.mem" class="cell">{{ server.mem.total }}G</div>
                  </td>
                  <td class="el-table__cell is-leaf">
                    <div v-if="server.jvm" class="cell">{{ server.jvm.total }}M</div>
                  </td>
                </tr>
                <tr>
                  <td class="el-table__cell is-leaf"><div class="cell">已用内存</div></td>
                  <td class="el-table__cell is-leaf">
                    <div v-if="server.mem" class="cell">{{ server.mem.used }}G</div>
                  </td>
                  <td class="el-table__cell is-leaf">
                    <div v-if="server.jvm" class="cell">{{ server.jvm.used }}M</div>
                  </td>
                </tr>
                <tr>
                  <td class="el-table__cell is-leaf"><div class="cell">剩余内存</div></td>
                  <td class="el-table__cell is-leaf">
                    <div v-if="server.mem" class="cell">{{ server.mem.free }}G</div>
                  </td>
                  <td class="el-table__cell is-leaf">
                    <div v-if="server.jvm" class="cell">{{ server.jvm.free }}M</div>
                  </td>
                </tr>
                <tr>
                  <td class="el-table__cell is-leaf"><div class="cell">使用率</div></td>
                  <td class="el-table__cell is-leaf">
                    <div
                      v-if="server.mem"
                      class="cell"
                      :class="{ 'text-danger': server.mem.usage > 80 }"
                    >
                      {{ server.mem.usage }}%
                    </div>
                  </td>
                  <td class="el-table__cell is-leaf">
                    <div
                      v-if="server.jvm"
                      class="cell"
                      :class="{ 'text-danger': server.jvm.usage > 80 }"
                    >
                      {{ server.jvm.usage }}%
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </el-card>
      </el-col>
      <el-col :span="24" class="card-box">
        <el-card>
          <template #header>
            <div class="flex items-center gap-x-2">
              <Monitor style="width: 1em; height: 1em; vertical-align: middle" />
              <span style="vertical-align: middle">服务器信息</span>
            </div>
          </template>
          <div class="el-table el-table--enable-row-hover el-table--medium">
            <table cellspacing="0" style="width: 100%">
              <tbody>
                <tr>
                  <td class="el-table__cell is-leaf"><div class="cell">服务器名称</div></td>
                  <td class="el-table__cell is-leaf">
                    <div v-if="server.sys" class="cell">
                      {{ server.sys.computerName }}
                    </div>
                  </td>
                  <td class="el-table__cell is-leaf"><div class="cell">操作系统</div></td>
                  <td class="el-table__cell is-leaf">
                    <div v-if="server.sys" class="cell">{{ server.sys.osName }}</div>
                  </td>
                </tr>
                <tr>
                  <td class="el-table__cell is-leaf"><div class="cell">服务器IP</div></td>
                  <td class="el-table__cell is-leaf">
                    <div v-if="server.sys" class="cell">{{ server.sys.computerIp }}</div>
                  </td>
                  <td class="el-table__cell is-leaf"><div class="cell">系统架构</div></td>
                  <td class="el-table__cell is-leaf">
                    <div v-if="server.sys" class="cell">{{ server.sys.osArch }}</div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </el-card>
      </el-col>
      <el-col :span="24" class="card-box">
        <el-card>
          <template #header>
            <div class="flex items-center gap-x-2">
              <CoffeeCup style="width: 1em; height: 1em; vertical-align: middle" />
              <span style="vertical-align: middle">Java虚拟机信息</span>
            </div>
          </template>
          <div class="el-table el-table--enable-row-hover el-table--medium">
            <table cellspacing="0" style="width: 100%; table-layout: fixed">
              <tbody>
                <tr>
                  <td class="el-table__cell is-leaf"><div class="cell">Java名称</div></td>
                  <td class="el-table__cell is-leaf">
                    <div v-if="server.jvm" class="cell">{{ server.jvm.name }}</div>
                  </td>
                  <td class="el-table__cell is-leaf"><div class="cell">Java版本</div></td>
                  <td class="el-table__cell is-leaf">
                    <div v-if="server.jvm" class="cell">{{ server.jvm.version }}</div>
                  </td>
                </tr>
                <tr>
                  <td class="el-table__cell is-leaf"><div class="cell">启动时间</div></td>
                  <td class="el-table__cell is-leaf">
                    <div v-if="server.jvm" class="cell">{{ server.jvm.startTime }}</div>
                  </td>
                  <td class="el-table__cell is-leaf"><div class="cell">运行时长</div></td>
                  <td class="el-table__cell is-leaf">
                    <div v-if="server.jvm" class="cell">{{ server.jvm.runTime }}</div>
                  </td>
                </tr>
                <tr>
                  <td colspan="1" class="el-table__cell is-leaf">
                    <div class="cell">安装路径</div>
                  </td>
                  <td colspan="3" class="el-table__cell is-leaf">
                    <div v-if="server.jvm" class="cell">{{ server.jvm.home }}</div>
                  </td>
                </tr>
                <tr>
                  <td colspan="1" class="el-table__cell is-leaf">
                    <div class="cell">项目路径</div>
                  </td>
                  <td colspan="3" class="el-table__cell is-leaf">
                    <div v-if="server.sys" class="cell">{{ server.sys.userDir }}</div>
                  </td>
                </tr>
                <tr>
                  <td colspan="1" class="el-table__cell is-leaf">
                    <div class="cell">运行参数</div>
                  </td>
                  <td colspan="3" class="el-table__cell is-leaf">
                    <div v-if="server.jvm" class="cell">{{ server.jvm.inputArgs }}</div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </el-card>
      </el-col>
      <el-col :span="24" class="card-box">
        <el-card>
          <template #header>
            <div class="flex items-center gap-x-2">
              <MessageBox style="width: 1em; height: 1em; vertical-align: middle" />
              <span style="vertical-align: middle">磁盘状态</span>
            </div>
          </template>
          <el-table :data="server.sysFiles">
            <el-table-column label="盘符路径" min-width="180" prop="dirName" />
            <el-table-column label="文件系统" min-width="180" prop="sysTypeName" />
            <el-table-column label="盘符类型" min-width="180" prop="typeName" />
            <el-table-column label="总大小" min-width="180" prop="total" />
            <el-table-column label="可用大小" min-width="180" prop="free" />
            <el-table-column label="已用大小" min-width="180" prop="used" />
            <el-table-column label="已用百分比" min-width="180" prop="usage" />
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { getServer } from '@/api/monitor/server'

const server = ref({
  cpu: {
    cpuNum: null,
    total: null,
    sys: null,
    used: null,
    wait: null,
    free: null,
  },
  mem: {
    total: null,
    used: null,
    free: null,
    usage: null,
  },
  jvm: {
    total: null,
    max: null,
    free: null,
    version: null,
    home: null,
    name: null,
    startTime: null,
    used: null,
    usage: null,
    runTime: null,
    inputArgs: null,
  },
  sys: {
    computerName: null,
    computerIp: null,
    userDir: null,
    osName: null,
    osArch: null,
  },
  sysFiles: [],
})
const { proxy } = getCurrentInstance()

async function getList() {
  proxy.$modal.loading('正在加载服务监控数据，请稍候！')
  const response = await getServer()
  server.value = response.data
  proxy.$modal.closeLoading()
}
onMounted(() => {
  getList()
})
</script>
