import auth from '@/plugins/auth'
import cache from '@/plugins/cache'
import modal from '@/plugins/modal'
import tab from '@/plugins/tab'
import download from '@/plugins/download'
import { useDict } from '@/utils/dict'
import { download as utilsDownload } from '@/utils/request'
import type { FormInstance } from 'element-plus'
import {
  addDateRange,
  handleTree,
  parseTime,
  resetForm,
  selectDictLabel,
  selectDictLabels,
  addAllDateRanges,
} from '@/utils/ruoyi'
export {}
declare module 'vue' {
  interface ComponentCustomProperties {
    useDict: typeof useDict;
    download: typeof utilsDownload;
    parseTime: typeof parseTime;
    resetForm: typeof resetForm;
    handleTree: typeof handleTree;
    addDateRange: typeof addDateRange;
    selectDictLabel: typeof selectDictLabel;
    selectDictLabels: typeof selectDictLabels;
    addAllDateRanges: typeof addAllDateRanges;
    $tab: typeof tab;
    // 认证对象
    $auth: typeof auth;
    // 缓存对象
    $cache: typeof cache;
    // 模态框对象
    $modal: typeof modal;
    // 下载文件
    $download: typeof download;
    $refs: {
      authRef?: FormInstance
      userRef?: FormInstance
      userFormRef?: FormInstance
      // 你可以继续添加常用的表单 ref
      [key: string]: any // 兜底
    }
  }
}

declare global {
  interface Window {
    VConsole: any;
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  // interface ImportMeta {}
}
