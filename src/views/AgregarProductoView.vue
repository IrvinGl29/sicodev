<script setup>
import {
  computed,
  ref,
  watch,
} from 'vue'

import { useRouter } from 'vue-router'

import {
  calcularProducto,
} from '@/services/calculadora'

import {
  buscarProductos,
} from '@/services/db'

import {
  useDevolucionStore,
} from '@/stores/devolucion'

const router = useRouter()
const devolucion = useDevolucionStore()

/*
 * ==========================================
 * BUSCADOR
 * ==========================================
 */

const busqueda = ref('')
const resultados = ref([])
const buscando = ref(false)

let temporizadorBusqueda = null

/*
 * ==========================================
 * PRODUCTO SELECCIONADO
 * ==========================================
 */

const productoSeleccionado = ref(null)

const tipoUnidad = ref('CAJA')
const cantidad = ref(1)
const precio = ref('')

/*
 * ==========================================
 * VISTA PREVIA DEL CÁLCULO
 * ==========================================
 */

const calculoVistaPrevia = computed(() => {
  if (
    !productoSeleccionado.value ||
    !cantidad.value ||
    !precio.value
  ) {
    return null
  }

  return calcularProducto({
    ...productoSeleccionado.value,

    tipoUnidad:
      tipoUnidad.value,

    cantidad:
      cantidad.value,

    precio:
      precio.value,
  })
})

/*
 * ==========================================
 * BÚSQUEDA DE PRODUCTOS
 * ==========================================
 */

watch(busqueda, (nuevoValor) => {
  clearTimeout(temporizadorBusqueda)

  /*
   * Si ya hay un producto seleccionado,
   * no volvemos a buscar mientras el texto
   * corresponde al producto elegido.
   */
  if (productoSeleccionado.value) {
    resultados.value = []
    return
  }

  const texto = nuevoValor.trim()

  if (!texto) {
    resultados.value = []
    return
  }

  /*
   * Esperamos 250 ms para evitar realizar
   * una consulta por cada pulsación.
   */
  temporizadorBusqueda = setTimeout(
    async () => {
      try {
        buscando.value = true

        resultados.value =
          await buscarProductos(
            texto,
            10,
          )
      } catch (error) {
        console.error(
          'Error al buscar productos:',
          error,
        )

        resultados.value = []
      } finally {
        buscando.value = false
      }
    },
    250,
  )
})

/*
 * ==========================================
 * SELECCIONAR PRODUCTO
 * ==========================================
 */

function seleccionarProducto(producto) {
  productoSeleccionado.value =
    producto

  busqueda.value =
    `${producto.clave} - ${producto.descripcion}`

  resultados.value = []

  tipoUnidad.value = 'CAJA'
  cantidad.value = 1
  precio.value = ''
}

/*
 * ==========================================
 * CAJA / PIEZA
 * ==========================================
 */

function seleccionarTipo(tipo) {
  tipoUnidad.value = tipo

  /*
   * Reiniciamos estos campos porque el
   * precio de caja y el precio de pieza
   * pueden ser completamente diferentes.
   */
  cantidad.value = 1
  precio.value = ''
}

/*
 * ==========================================
 * LIMPIAR SELECCIÓN
 * ==========================================
 */

function limpiarSeleccion() {
  productoSeleccionado.value = null

  busqueda.value = ''
  resultados.value = []

  tipoUnidad.value = 'CAJA'
  cantidad.value = 1
  precio.value = ''
}

/*
 * ==========================================
 * AGREGAR PRODUCTO
 * ==========================================
 */

function guardarProducto() {
  if (!productoSeleccionado.value) {
    alert(
      'Selecciona un producto.',
    )

    return
  }

  const cantidadNumero =
    Number(cantidad.value)

  const precioNumero =
    Number(precio.value)

  if (
    !Number.isInteger(cantidadNumero) ||
    cantidadNumero <= 0
  ) {
    alert(
      'Captura una cantidad válida.',
    )

    return
  }

  if (
    Number.isNaN(precioNumero) ||
    precioNumero <= 0
  ) {
    alert(
      'Captura el precio según la factura.',
    )

    return
  }

  devolucion.agregarProducto({
    clave:
      productoSeleccionado.value.clave,

    descripcion:
      productoSeleccionado.value.descripcion,

    iva:
      productoSeleccionado.value.iva,

    ieps:
      productoSeleccionado.value.ieps,

    ivaPorcentaje:
      productoSeleccionado.value
        .ivaPorcentaje,

    iepsPorcentaje:
      productoSeleccionado.value
        .iepsPorcentaje,

    bonificacion:
      productoSeleccionado.value
        .bonificacion,

    tipoUnidad:
      tipoUnidad.value,

    cantidad:
      cantidadNumero,

    precio:
      precioNumero,
  })

  limpiarSeleccion()
}

/*
 * ==========================================
 * IR AL RESUMEN
 * ==========================================
 */

function irResumen() {
  router.push('/resumen')
}
</script>

<template>
  <main class="pagina">

    <!-- =====================================
         ENCABEZADO
    ====================================== -->

    <section class="encabezado-pagina">
      <div>
        <p class="eyebrow">
          SICODEV
        </p>

        <h1>
          Agregar producto
        </h1>

        <p>
          Busca un producto y captura los datos
          correspondientes a la factura.
        </p>
      </div>

      <div class="contador">
        {{ devolucion.cantidadProductos }}
        producto(s)
      </div>
    </section>

    <!-- =====================================
         BUSCADOR
    ====================================== -->

    <section class="tarjeta">
      <div class="campo">
        <label for="busqueda">
          Buscar producto
        </label>

        <input
          id="busqueda"
          v-model="busqueda"
          type="text"
          placeholder="Clave o descripción"
          autocomplete="off"
        />

        <small>
          Puedes escribir parte de la clave
          o del nombre del producto.
        </small>

        <div
          v-if="buscando"
          class="buscando"
        >
          Buscando productos...
        </div>

        <!-- RESULTADOS -->

        <div
          v-if="
            resultados.length &&
            !productoSeleccionado
          "
          class="resultados"
        >
          <button
            v-for="producto in resultados"
            :key="producto.clave"
            type="button"
            class="resultado"
            @click="
              seleccionarProducto(producto)
            "
          >
            <div class="resultado-clave">
              {{ producto.clave }}
            </div>

            <div>
              <strong>
                {{ producto.descripcion }}
              </strong>

              <div class="resultado-datos">
                <span>
                  IVA:
                  {{
                    producto.iva
                      ? `${producto.ivaPorcentaje}%`
                      : 'No'
                  }}
                </span>

                <span>
                  IEPS:
                  {{
                    producto.ieps
                      ? `${producto.iepsPorcentaje}%`
                      : 'No'
                  }}
                </span>

                <span>
                  Bonificación:
                  {{ producto.bonificacion }}%
                </span>
              </div>
            </div>
          </button>
        </div>

        <!-- SIN RESULTADOS -->

        <div
          v-if="
            busqueda &&
            !buscando &&
            !resultados.length &&
            !productoSeleccionado
          "
          class="sin-resultados"
        >
          No se encontraron productos.
        </div>
      </div>

      <!-- ===================================
           PRODUCTO SELECCIONADO
      ==================================== -->

      <div
        v-if="productoSeleccionado"
        class="producto-seleccionado"
      >
        <div class="producto-cabecera">
          <div>
            <small>
              Producto seleccionado
            </small>

            <h2>
              {{
                productoSeleccionado.descripcion
              }}
            </h2>

            <p>
              Clave:

              <strong>
                {{
                  productoSeleccionado.clave
                }}
              </strong>
            </p>
          </div>

          <button
            type="button"
            class="boton-cambiar"
            @click="limpiarSeleccion"
          >
            Cambiar
          </button>
        </div>

        <!-- =================================
             DATOS FISCALES
        ================================== -->

        <div class="impuestos">
          <span
            :class="[
              'etiqueta',
              productoSeleccionado.iva
                ? 'activo'
                : 'inactivo',
            ]"
          >
            IVA:
            {{
              productoSeleccionado.iva
                ? `${productoSeleccionado.ivaPorcentaje}%`
                : 'No'
            }}
          </span>

          <span
            :class="[
              'etiqueta',
              productoSeleccionado.ieps
                ? 'activo'
                : 'inactivo',
            ]"
          >
            IEPS:
            {{
              productoSeleccionado.ieps
                ? `${productoSeleccionado.iepsPorcentaje}%`
                : 'No'
            }}
          </span>

          <span
            class="etiqueta bonificacion"
          >
            Bonificación:
            {{
              productoSeleccionado.bonificacion
            }}%
          </span>
        </div>

        <!-- =================================
             TIPO DE DEVOLUCIÓN
        ================================== -->

        <div class="tipo-devolucion">
          <label>
            Tipo de devolución
          </label>

          <div class="selector-unidad">
            <button
              type="button"
              :class="[
                'unidad',
                {
                  seleccionada:
                    tipoUnidad === 'CAJA',
                },
              ]"
              @click="
                seleccionarTipo('CAJA')
              "
            >
              Unidad
            </button>

            <button
              type="button"
              :class="[
                'unidad',
                {
                  seleccionada:
                    tipoUnidad === 'PIEZA',
                },
              ]"
              @click="
                seleccionarTipo('PIEZA')
              "
            >
              Piezas
            </button>
          </div>
        </div>

        <!-- =================================
             CANTIDAD Y PRECIO
        ================================== -->

        <div class="campos-producto">
          <div class="campo">
            <label for="cantidad">
              {{
                tipoUnidad === 'CAJA'
                  ? 'Cantidad de cajas'
                  : 'Cantidad de piezas'
              }}
            </label>

            <input
              id="cantidad"
              v-model.number="cantidad"
              type="number"
              min="1"
              step="1"
            />
          </div>

          <div class="campo">
            <label for="precio">
              {{
                tipoUnidad === 'CAJA'
                  ? 'Precio por caja'
                  : 'Precio por pieza'
              }}
            </label>

            <input
              id="precio"
              v-model="precio"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
            />

            <small>
              Captura el precio indicado
              en la factura actual.
            </small>
          </div>
        </div>

        <!-- =================================
             RESUMEN DE CAPTURA
        ================================== -->

        <div class="resumen-captura">
          <div>
            <span>
              Presentación
            </span>

            <strong>
              {{ tipoUnidad }}
            </strong>
          </div>

          <div>
            <span>
              Cantidad
            </span>

            <strong>
              {{ cantidad || 0 }}
            </strong>
          </div>

          <div>
            <span>
              Precio unitario
            </span>

            <strong>
              ${{
                Number(
                  precio || 0,
                ).toFixed(2)
              }}
            </strong>
          </div>
        </div>

        <!-- =================================
             AVISO PRECIO
        ================================== -->

        <div class="aviso-precio">
          <strong>
            Precio según factura
          </strong>

          <p>
            El precio no se obtiene del catálogo
            porque puede cambiar. Captura siempre
            el precio correspondiente a la factura
            de la devolución.
          </p>
        </div>

        <!-- =================================
             CÁLCULO
        ================================== -->

        <div
          v-if="calculoVistaPrevia"
          class="calculo"
        >
          <div class="titulo-calculo">
            <div>
              <span>
                Cálculo automático
              </span>

              <h3>
                Devolución estimada
              </h3>
            </div>

            <span class="badge-unidad">
              {{ tipoUnidad }}
            </span>
          </div>

          <!-- BASE -->

          <div class="linea-calculo">
            <span>
              Base
            </span>

            <strong>
              ${{
                calculoVistaPrevia
                  .base
                  .toFixed(2)
              }}
            </strong>
          </div>

          <!-- BONIFICACIÓN -->

          <div class="linea-calculo">
            <span>
              Bonificación
              ({{
                calculoVistaPrevia
                  .porcentajeBonificacion
              }}%)
            </span>

            <strong class="resta">
              -${{
                calculoVistaPrevia
                  .bonificacion
                  .toFixed(2)
              }}
            </strong>
          </div>

          <!-- BASE BONIFICADA -->

          <div
            class="
              linea-calculo
              destacado
            "
          >
            <span>
              Base bonificada
            </span>

            <strong>
              ${{
                calculoVistaPrevia
                  .baseBonificada
                  .toFixed(2)
              }}
            </strong>
          </div>

          <!-- IVA -->

          <div
            v-if="
              calculoVistaPrevia.iva > 0
            "
            class="linea-calculo"
          >
            <span>
              IVA
              ({{
                calculoVistaPrevia
                  .porcentajeIva
              }}%)
            </span>

            <strong class="suma">
              +${{
                calculoVistaPrevia
                  .iva
                  .toFixed(2)
              }}
            </strong>
          </div>

          <!-- IEPS -->

          <div
            v-if="
              calculoVistaPrevia.ieps > 0
            "
            class="linea-calculo"
          >
            <span>
              IEPS
              ({{
                calculoVistaPrevia
                  .porcentajeIeps
              }}%)
            </span>

            <strong class="suma">
              +${{
                calculoVistaPrevia
                  .ieps
                  .toFixed(2)
              }}
            </strong>
          </div>

          <!-- TOTAL -->

          <div class="total-calculo">
            <div>
              <span>
                Total estimado
              </span>

              <small>
                Según la fórmula validada
                contra SIAC
              </small>
            </div>

            <strong>
              ${{
                calculoVistaPrevia
                  .total
                  .toFixed(2)
              }}
            </strong>
          </div>
        </div>

        <!-- =================================
             AGREGAR
        ================================== -->

        <button
          type="button"
          class="boton-principal"
          @click="guardarProducto"
        >
          + Agregar a la devolución
        </button>
      </div>
    </section>

    <!-- =====================================
         PRODUCTOS AGREGADOS
    ====================================== -->

    <section
      v-if="devolucion.productos.length"
      class="
        tarjeta
        productos-agregados
      "
    >
      <h2>
        Productos agregados
      </h2>

      <p>
        Productos incluidos actualmente
        en esta devolución.
      </p>

      <article
        v-for="
          producto
          in devolucion.productos
        "
        :key="producto.id"
        class="producto-lista"
      >
        <div class="producto-info">
          <strong>
            {{ producto.clave }}
          </strong>

          <span>
            {{ producto.descripcion }}
          </span>

          <div
            class="
              datos-producto-agregado
            "
          >
            <span class="tipo-unidad">
              {{ producto.tipoUnidad }}
            </span>

            <small>
              Cantidad:
              {{ producto.cantidad }}
            </small>

            <small>
              Precio:
              ${{
                producto.precio.toFixed(2)
              }}
            </small>

            <small>
              Bonificación:
              {{ producto.bonificacion }}%
            </small>
          </div>
        </div>

        <div class="producto-opciones">
          <span
            v-if="producto.iva"
            class="mini-etiqueta"
          >
            IVA
            {{ producto.ivaPorcentaje }}%
          </span>

          <span
            v-if="producto.ieps"
            class="mini-etiqueta"
          >
            IEPS
            {{ producto.iepsPorcentaje }}%
          </span>

          <button
            type="button"
            class="eliminar"
            @click="
              devolucion.eliminarProducto(
                producto.id,
              )
            "
          >
            Eliminar
          </button>
        </div>
      </article>

      <button
        type="button"
        class="boton-resumen"
        @click="irResumen"
      >
        Continuar al resumen
      </button>
    </section>

  </main>
</template>

<style scoped>
.pagina {
  width: min(100% - 32px, 900px);
  margin: 0 auto;
  padding: 40px 0 80px;
}

/* =========================================
   ENCABEZADO
========================================= */

.encabezado-pagina {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 20px;
  margin-bottom: 24px;
}

.eyebrow {
  margin: 0 0 5px;
  color: #611232;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 1.5px;
}

h1,
h2,
h3,
p {
  margin-top: 0;
}

h1 {
  margin-bottom: 8px;
  font-size: 32px;
}

.encabezado-pagina p {
  margin-bottom: 0;
  color: #666;
}

.contador {
  padding: 9px 13px;
  border-radius: 20px;
  background: #f4ebef;
  color: #611232;
  font-weight: 600;
  white-space: nowrap;
}

/* =========================================
   TARJETAS
========================================= */

.tarjeta {
  margin-bottom: 20px;
  padding: 26px;
  border: 1px solid #e5e5e5;
  border-radius: 18px;
  background: white;
  box-shadow:
    0 8px 25px
    rgb(0 0 0 / 5%);
}

/* =========================================
   CAMPOS
========================================= */

.campo {
  display: grid;
  gap: 8px;
}

.campo label {
  font-weight: 600;
}

.campo input {
  width: 100%;
  padding: 13px 14px;
  border: 1px solid #cfcfcf;
  border-radius: 10px;
  background: white;
  font: inherit;
}

.campo input:focus {
  border-color: #611232;
  outline:
    2px solid
    rgb(97 18 50 / 12%);
}

.campo small {
  color: #777;
}

/* =========================================
   BÚSQUEDA
========================================= */

.buscando {
  padding: 10px 0;
  color: #666;
  font-size: 13px;
}

.resultados {
  overflow: hidden;
  margin-top: 6px;
  border: 1px solid #ddd;
  border-radius: 12px;
}

.resultado {
  display: grid;
  width: 100%;
  grid-template-columns:
    100px 1fr;
  gap: 12px;
  padding: 14px;
  border: 0;
  border-bottom:
    1px solid #eee;
  background: white;
  text-align: left;
  cursor: pointer;
}

.resultado:last-child {
  border-bottom: 0;
}

.resultado:hover {
  background: #faf5f7;
}

.resultado-clave {
  color: #611232;
  font-weight: 700;
}

.resultado-datos {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 12px;
  margin-top: 5px;
  color: #777;
  font-size: 12px;
}

.sin-resultados {
  margin-top: 8px;
  padding: 12px;
  border-radius: 10px;
  background: #fff8eb;
  color: #765000;
}

/* =========================================
   PRODUCTO SELECCIONADO
========================================= */

.producto-seleccionado {
  margin-top: 25px;
  padding-top: 25px;
  border-top: 1px solid #eee;
}

.producto-cabecera {
  display: flex;
  justify-content: space-between;
  gap: 20px;
}

.producto-cabecera small {
  color: #777;
}

.producto-cabecera h2 {
  margin: 5px 0;
  font-size: 22px;
}

.producto-cabecera p {
  margin-bottom: 0;
}

.boton-cambiar {
  align-self: flex-start;
  padding: 9px 13px;
  border: 0;
  border-radius: 9px;
  background: #f4ebef;
  color: #611232;
  font-weight: 600;
  cursor: pointer;
}

/* =========================================
   IMPUESTOS
========================================= */

.impuestos {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 20px 0;
}

.etiqueta {
  padding: 7px 11px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
}

.etiqueta.activo {
  background: #f4ebef;
  color: #611232;
}

.etiqueta.inactivo {
  background: #eee;
  color: #666;
}

.etiqueta.bonificacion {
  background: #edf7ef;
  color: #285f32;
}

/* =========================================
   CAJA / PIEZA
========================================= */

.tipo-devolucion {
  display: grid;
  gap: 10px;
  margin-bottom: 20px;
}

.tipo-devolucion > label {
  font-weight: 600;
}

.selector-unidad {
  display: grid;
  grid-template-columns:
    1fr 1fr;
  gap: 10px;
}

.unidad {
  padding: 14px;
  border: 1px solid #ccc;
  border-radius: 10px;
  background: white;
  color: #555;
  font-weight: 700;
  cursor: pointer;
  transition:
    0.15s ease;
}

.unidad:hover {
  border-color: #611232;
}

.unidad.seleccionada {
  border-color: #611232;
  background: #611232;
  color: white;
}

/* =========================================
   CANTIDAD / PRECIO
========================================= */

.campos-producto {
  display: grid;
  grid-template-columns:
    1fr 1fr;
  gap: 15px;
}

/* =========================================
   RESUMEN CAPTURA
========================================= */

.resumen-captura {
  display: grid;
  grid-template-columns:
    repeat(3, 1fr);
  gap: 10px;
  margin-top: 20px;
}

.resumen-captura > div {
  display: grid;
  gap: 4px;
  padding: 13px;
  border-radius: 10px;
  background: #f7f7f7;
}

.resumen-captura span {
  color: #777;
  font-size: 12px;
}

.resumen-captura strong {
  color: #611232;
}

/* =========================================
   AVISO PRECIO
========================================= */

.aviso-precio {
  margin-top: 20px;
  padding: 14px;
  border-radius: 12px;
  background: #fff8eb;
}

.aviso-precio strong {
  color: #745000;
}

.aviso-precio p {
  margin: 5px 0 0;
  color: #6c5a30;
  line-height: 1.5;
}

/* =========================================
   CÁLCULO AUTOMÁTICO
========================================= */

.calculo {
  margin: 20px 0;
  padding: 18px;
  border:
    1px solid #e4d7dc;
  border-radius: 14px;
  background: #faf7f8;
}

.titulo-calculo {
  display: flex;
  justify-content:
    space-between;
  align-items: flex-start;
  gap: 15px;
  margin-bottom: 14px;
}

.titulo-calculo span {
  color: #777;
  font-size: 12px;
}

.titulo-calculo h3 {
  margin: 3px 0 0;
  color: #611232;
  font-size: 18px;
}

.badge-unidad {
  padding: 6px 10px;
  border-radius: 20px;
  background: #611232;
  color: white !important;
  font-size: 11px !important;
  font-weight: 700;
}

.linea-calculo {
  display: flex;
  justify-content:
    space-between;
  gap: 15px;
  padding: 9px 0;
  border-bottom:
    1px solid #eee;
}

.linea-calculo span {
  color: #666;
}

.linea-calculo strong {
  white-space: nowrap;
}

.linea-calculo.destacado {
  font-weight: 600;
}

.resta {
  color: #a42323;
}

.suma {
  color: #285f32;
}

.total-calculo {
  display: flex;
  justify-content:
    space-between;
  align-items: flex-end;
  gap: 20px;
  margin-top: 12px;
  padding-top: 15px;
  border-top:
    2px solid #611232;
}

.total-calculo > div {
  display: grid;
  gap: 3px;
}

.total-calculo span {
  font-weight: 700;
}

.total-calculo small {
  color: #777;
  font-size: 11px;
}

.total-calculo > strong {
  color: #611232;
  font-size: 24px;
}

/* =========================================
   BOTONES PRINCIPALES
========================================= */

.boton-principal,
.boton-resumen {
  width: 100%;
  padding: 13px 18px;
  border: 0;
  border-radius: 10px;
  background: #611232;
  color: white;
  font: inherit;
  font-weight: 600;
  cursor: pointer;
}

.boton-principal:hover,
.boton-resumen:hover {
  background: #4d0e28;
}

/* =========================================
   PRODUCTOS AGREGADOS
========================================= */

.productos-agregados > p {
  color: #666;
}

.producto-lista {
  display: flex;
  justify-content:
    space-between;
  gap: 20px;
  padding: 16px 0;
  border-top:
    1px solid #eee;
}

.producto-info {
  display: grid;
  gap: 4px;
}

.producto-info > strong {
  color: #611232;
}

.datos-producto-agregado {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 7px 12px;
  margin-top: 5px;
}

.tipo-unidad {
  padding: 4px 8px;
  border-radius: 20px;
  background: #611232;
  color: white;
  font-size: 11px;
  font-weight: 700;
}

.datos-producto-agregado small {
  color: #777;
}

.producto-opciones {
  display: flex;
  align-items: center;
  gap: 6px;
}

.mini-etiqueta {
  padding: 5px 8px;
  border-radius: 20px;
  background: #f4ebef;
  color: #611232;
  font-size: 11px;
  font-weight: 700;
}

.eliminar {
  padding: 7px 10px;
  border: 0;
  border-radius: 8px;
  background: #f5f5f5;
  color: #8b1e1e;
  font: inherit;
  cursor: pointer;
}

.eliminar:hover {
  background: #f0dddd;
}

.boton-resumen {
  margin-top: 18px;
}

/* =========================================
   RESPONSIVE
========================================= */

@media (max-width: 650px) {
  .pagina {
    width:
      min(
        100% - 24px,
        900px
      );
    padding-top: 25px;
  }

  .tarjeta {
    padding: 20px;
  }

  .encabezado-pagina {
    align-items:
      flex-start;
    flex-direction:
      column;
  }

  .resultado {
    grid-template-columns:
      1fr;
  }

  .producto-cabecera {
    flex-direction:
      column;
  }

  .boton-cambiar {
    align-self:
      flex-start;
  }

  .campos-producto {
    grid-template-columns:
      1fr;
  }

  .resumen-captura {
    grid-template-columns:
      1fr;
  }

  .linea-calculo {
    align-items:
      flex-start;
  }

  .total-calculo {
    align-items:
      flex-start;
    flex-direction:
      column;
  }

  .producto-lista {
    flex-direction:
      column;
  }

  .producto-opciones {
    flex-wrap: wrap;
  }
}
</style>
