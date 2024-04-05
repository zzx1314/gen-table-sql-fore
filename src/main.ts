
import { useTable } from './plugins/vxe-table'

import { createApp } from 'vue'
import App from './App.vue'

createApp(App)
    .use(useTable)
    .mount('#app')
