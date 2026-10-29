import { defineStore } from 'pinia'
import { ref } from 'vue'

const CLAVE_CHOFER = 'sicodev_chofer_predeterminado'

export const useConfiguracionStore = defineStore('configuracion', () => {

  const choferPredeterminado = ref(
    localStorage.getItem(CLAVE_CHOFER) ||
      'Chofer Predeterminado',
  )

  function establecerChoferPredeterminado(nombre) {
    choferPredeterminado.value = nombre

    localStorage.setItem(
      CLAVE_CHOFER,
      nombre,
    )
  }

  return {
    choferPredeterminado,
    establecerChoferPredeterminado,
  }
})
