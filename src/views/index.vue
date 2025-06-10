<template>
  <div class="app-container home">
    <el-row :gutter="20" class="rows">
      <el-col :xs="24" :sm="12" :md="12" :lg="5" :xl="6" class="my-col">
        <el-card>
          <!-- <countTo
              :startVal="0"
              :endVal="carTotal"
              :duration="1000"
              class="count-to-number"
            ></countTo> -->
          <h1 class="count-to-number">{{ carTotal }}</h1>
          <div class="count-to-title">车辆总数</div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="12" :lg="5" :xl="6" class="my-col">
        <el-card>
          <h1 class="count-to-number">{{ toBeInstalledNumber }}</h1>
          <div class="count-to-title">待安装总数</div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="12" :lg="5" :xl="6" class="my-col">
        <el-card>
          <h1 class="count-to-number">{{ wasInstalledNumber }}</h1>
          <div class="count-to-title">已安装总数</div>
        </el-card>
      </el-col>
    </el-row>
    <!-- <el-row>
        <el-col :xs="24" :sm="12" :md="12" :lg="8" :xl="8">
          <el-card>
            <template #header>
              <div class="pb-7px flex text-15px">
                <div class="w-40% text-center">安装点名称</div>
                <div class="w-30% text-center">已安装数量</div>
                <div class="w-30% text-center">库存数量</div>
              </div>
            </template>
            <div class="relative">
              <div class="flex justify-between text-15px">
                <div class="w-40% text-center">深大安装点</div>
                <div class="w-30% text-center">10</div>
                <div class="w-30% text-center">50</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row> -->
  </div>
</template>

<script setup name="Index">
const carTotal = ref(1000) // 车辆总数
const toBeInstalledNumber = ref(1000) // 待安装总数
const wasInstalledNumber = ref(1000) // 已安装总数
</script>

<style scoped lang="scss">
.count-to-number {
  font-size: 30px;
  font-weight: bold;
}

.count-to-title {
  color: #9ca3af;
  margin-top: 10px;
}

.my-col {
  margin-bottom: 20px;
}
</style>
