import { createPinia } from 'pinia'
import { createPersistedState } from 'pinia-plugin-persistedstate' // 数据持久化
const store = createPinia()
store.use(createPersistedState())
export default store
