import { defineStore } from 'pinia'

import {
  computed,
  ref,
  watch,
} from 'vue'

import {
  useConfiguracionStore,
} from '@/stores/configuracion'

import {
  calcularProducto,
  calcularTotales,
} from '@/services/calculadora'

const CLAVE_DEVOLUCION =
  'sicodev_devolucion_actual'

function obtenerFechaActual() {
  const fecha = new Date()

  const anio =
    fecha.getFullYear()

  const mes =
    String(
      fecha.getMonth() + 1,
    ).padStart(2, '0')

  const dia =
    String(
      fecha.getDate(),
    ).padStart(2, '0')

  return `${anio}-${mes}-${dia}`
}

export const useDevolucionStore =
  defineStore(
    'devolucion',
    () => {
      const configuracion =
        useConfiguracionStore()

      /*
       * ====================================
       * ESTADO
       * ====================================
       */

      const fecha =
        ref(
          obtenerFechaActual(),
        )

      const chofer =
        ref(
          configuracion
            .choferPredeterminado,
        )

      /*
       * Lo conservamos internamente
       * para no romper borradores
       * o código anterior.
       */
      const choferTemporal =
        ref(false)

      const factura =
        ref('')

      const numeroTienda =
        ref('')

      const nombreTienda =
        ref('')

      /*
       * NUEVO:
       * Ahora pueden existir varios motivos.
       */
      const motivos =
        ref([])

      const productos =
        ref([])

      /*
       * ====================================
       * CARGAR BORRADOR
       * ====================================
       */

      function cargarBorrador() {
        try {
          const guardado =
            localStorage.getItem(
              CLAVE_DEVOLUCION,
            )

          if (!guardado) {
            return
          }

          const datos =
            JSON.parse(guardado)

          if (
            !datos ||
            typeof datos !== 'object'
          ) {
            return
          }

          fecha.value =
            datos.fecha ||
            obtenerFechaActual()

          chofer.value =
            datos.chofer ||
            configuracion
              .choferPredeterminado

          choferTemporal.value =
            Boolean(
              datos.choferTemporal,
            )

          factura.value =
            datos.factura || ''

          numeroTienda.value =
            datos.numeroTienda || ''

          nombreTienda.value =
            datos.nombreTienda || ''

          /*
           * ==================================
           * MIGRACIÓN DE MOTIVO
           * ==================================
           *
           * Formato nuevo:
           * motivos: [...]
           *
           * Formato anterior:
           * motivo: 'MAL ESTADO'
           */

          if (
            Array.isArray(
              datos.motivos,
            )
          ) {
            motivos.value =
              datos.motivos.filter(
                Boolean,
              )
          } else if (
            datos.motivo
          ) {
            motivos.value = [
              datos.motivo,
            ]
          } else {
            motivos.value = []
          }

          productos.value =
            Array.isArray(
              datos.productos,
            )
              ? datos.productos
              : []
        } catch (error) {
          console.error(
            'No fue posible recuperar la devolución:',
            error,
          )

          localStorage.removeItem(
            CLAVE_DEVOLUCION,
          )
        }
      }

      /*
       * ====================================
       * GUARDAR BORRADOR
       * ====================================
       */

      function guardarBorrador() {
        const estaVacia =
          !factura.value &&
          !numeroTienda.value &&
          motivos.value.length === 0 &&
          productos.value.length === 0

        if (estaVacia) {
          localStorage.removeItem(
            CLAVE_DEVOLUCION,
          )

          return
        }

        const datos = {
          fecha:
            fecha.value,

          chofer:
            chofer.value,

          choferTemporal:
            choferTemporal.value,

          factura:
            factura.value,

          numeroTienda:
            numeroTienda.value,

          nombreTienda:
            nombreTienda.value,

          motivos:
            motivos.value,

          productos:
            productos.value,
        }

        try {
          localStorage.setItem(
            CLAVE_DEVOLUCION,
            JSON.stringify(datos),
          )
        } catch (error) {
          console.error(
            'No fue posible guardar la devolución:',
            error,
          )
        }
      }

      /*
       * Recuperamos antes de activar
       * el guardado automático.
       */

      cargarBorrador()

      /*
       * ====================================
       * GUARDADO AUTOMÁTICO
       * ====================================
       */

      watch(
        [
          fecha,
          chofer,
          choferTemporal,
          factura,
          numeroTienda,
          nombreTienda,
          motivos,
          productos,
        ],
        () => {
          guardarBorrador()
        },
        {
          deep: true,
        },
      )

      /*
       * ====================================
       * COMPUTED
       * ====================================
       */

      const tiendaCompleta =
        computed(() => {
          if (
            !numeroTienda.value ||
            !nombreTienda.value
          ) {
            return ''
          }

          return `${numeroTienda.value} - ${nombreTienda.value}`
        })

      const cantidadProductos =
        computed(() => {
          return productos.value.length
        })

      const productosCalculados =
        computed(() => {
          return productos.value.map(
            (producto) => ({
              ...producto,

              calculo:
                calcularProducto(
                  producto,
                ),
            }),
          )
        })

      const totales =
        computed(() => {
          return calcularTotales(
            productos.value,
          )
        })

      /*
       * Texto útil para pantalla.
       */

      const motivosTexto =
        computed(() => {
          return motivos.value.join(
            ', ',
          )
        })

      /*
       * ====================================
       * PRODUCTOS
       * ====================================
       */

      function agregarProducto(
        producto,
      ) {
        const id =
          typeof crypto !==
            'undefined' &&
          crypto.randomUUID
            ? crypto.randomUUID()
            : `${Date.now()}-${Math.random()}`

        productos.value.push({
          id,
          ...producto,
        })
      }

      function eliminarProducto(id) {
        productos.value =
          productos.value.filter(
            (producto) =>
              producto.id !== id,
          )
      }

      /*
       * ====================================
       * CHOFER
       * ====================================
       */

      function cambiarChoferTemporal(
        nombre,
      ) {
        chofer.value = nombre

        choferTemporal.value =
          true
      }

      function usarChoferPredeterminado() {
        chofer.value =
          configuracion
            .choferPredeterminado

        choferTemporal.value =
          false
      }

      /*
       * ====================================
       * LIMPIAR
       * ====================================
       */

      function limpiarDevolucion() {
        localStorage.removeItem(
          CLAVE_DEVOLUCION,
        )

        fecha.value =
          obtenerFechaActual()

        factura.value = ''

        numeroTienda.value = ''

        nombreTienda.value = ''

        motivos.value = []

        productos.value = []

        usarChoferPredeterminado()
      }

      return {
        fecha,

        chofer,

        choferTemporal,

        factura,

        numeroTienda,

        nombreTienda,

        motivos,

        productos,

        tiendaCompleta,

        cantidadProductos,

        motivosTexto,

        productosCalculados,

        totales,

        agregarProducto,

        eliminarProducto,

        cambiarChoferTemporal,

        usarChoferPredeterminado,

        limpiarDevolucion,
      }
    },
  )
