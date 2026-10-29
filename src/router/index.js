import { createRouter, createWebHistory } from 'vue-router'

import NuevaDevolucionView from '@/views/NuevaDevolucionView.vue'
import AgregarProductoView from '@/views/AgregarProductoView.vue'
import ResumenView from '@/views/ResumenView.vue'
import ConfiguracionView from '@/views/ConfiguracionView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),

  routes: [
    {
      path: '/',
      name: 'nueva-devolucion',
      component: NuevaDevolucionView,
    },
    {
      path: '/agregar-producto',
      name: 'agregar-producto',
      component: AgregarProductoView,
    },
    {
      path: '/resumen',
      name: 'resumen',
      component: ResumenView,
    },
    {
      path: '/vista-previa',
      name: 'vista-previa',
      component: () =>
        import(
          '@/views/VistaPreviaView.vue'
        ),
    },
    {
      path: '/configuracion',
      name: 'configuracion',
      component: ConfiguracionView,
    },

  ],
})

export default router
