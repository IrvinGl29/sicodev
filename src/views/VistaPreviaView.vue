<script setup>
import {
  computed,
  ref,
} from 'vue'

import { useRouter } from 'vue-router'

import {
  useDevolucionStore,
} from '@/stores/devolucion'

import {
  generarPdfDevolucion,
} from '@/services/generarPdfDevolucion'

const router = useRouter()
const devolucion = useDevolucionStore()

const copia = ref('TIENDA')
const pdfGenerado = ref(false)
const mostrarConfirmacion = ref(false)

const datosCompletos = computed(() => {
  return Boolean(
    devolucion.fecha &&
      devolucion.chofer &&
      devolucion.factura &&
      devolucion.numeroTienda &&
      devolucion.nombreTienda &&
      devolucion.motivos.length > 0 &&
      devolucion.productos.length,
  )
})

function formatoDinero(valor) {
  return Number(
    valor || 0,
  ).toLocaleString(
    'es-MX',
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    },
  )
}

function formatearFecha(fecha) {
  if (!fecha) {
    return '—'
  }

  const partes =
    String(fecha).split('-')

  if (partes.length !== 3) {
    return fecha
  }

  const [
    anio,
    mes,
    dia,
  ] = partes

  return `${dia}/${mes}/${anio}`
}

function volverResumen() {
  router.push('/resumen')
}

function descargarPdf() {
  if (!datosCompletos.value) {
    alert(
      'Faltan datos para generar la devolución.',
    )

    return
  }

  try {
    generarPdfDevolucion({
      fecha:
        devolucion.fecha,

      chofer:
        devolucion.chofer,

      factura:
        devolucion.factura,

      numeroTienda:
        devolucion.numeroTienda,

      nombreTienda:
        devolucion.nombreTienda,

      motivos:
        devolucion.motivos,

      productos:
        devolucion.productos,
    })

    pdfGenerado.value = true
  } catch (error) {
    console.error(
      'Error al generar PDF:',
      error,
    )

    alert(
      'No fue posible generar el PDF.',
    )
  }
}

function solicitarFinalizar() {
  if (!pdfGenerado.value) {
    alert(
      'Primero descarga el PDF antes de finalizar la devolución.',
    )

    return
  }

  mostrarConfirmacion.value = true
}

function cancelarFinalizacion() {
  mostrarConfirmacion.value = false
}

function confirmarFinalizacion() {
  /*
   * Limpia únicamente la devolución.
   *
   * Productos, tiendas, catálogo
   * y chofer predeterminado permanecen.
   */
  devolucion.limpiarDevolucion()

  mostrarConfirmacion.value = false

  router.push('/')
}
</script>

<template>
  <main class="pagina">

    <!-- ENCABEZADO -->

    <section class="encabezado">
      <div>
        <p class="eyebrow">
          SICODEV
        </p>

        <h1>
          Vista previa
        </h1>

        <p>
          Revisa cómo quedará la devolución
          antes de descargarla.
        </p>
      </div>

      <button
        type="button"
        class="boton-volver"
        @click="volverResumen"
      >
        ← Resumen
      </button>
    </section>

    <!-- SELECTOR DE COPIA -->

    <section class="selector">
      <button
        type="button"
        :class="[
          'boton-copia',
          {
            activo:
              copia === 'TIENDA',
          },
        ]"
        @click="copia = 'TIENDA'"
      >
        Copia tienda
      </button>

      <button
        type="button"
        :class="[
          'boton-copia',
          {
            activo:
              copia === 'CHOFER',
          },
        ]"
        @click="copia = 'CHOFER'"
      >
        Copia chofer
      </button>
    </section>

    <p class="nota-carta">
      El PDF final imprimirá ambas copias
      en una sola hoja tamaño Carta.
    </p>

    <!-- DOCUMENTO -->

    <section class="documento">

      <!-- CABECERA -->

      <header class="documento-header">
        <div>
          <strong>
            SICODEV
          </strong>

          <span>
            FORMATO DE DEVOLUCIÓN
          </span>
        </div>

        <div class="tipo-copia">
          COPIA {{ copia }}
        </div>
      </header>

      <!-- DATOS -->

      <div class="datos">
        <div class="dato">
          <span>
            No. factura
          </span>

          <strong>
            {{ devolucion.factura }}
          </strong>
        </div>

        <div class="dato">
          <span>
            Fecha
          </span>

          <strong>
            {{
              formatearFecha(
                devolucion.fecha,
              )
            }}
          </strong>
        </div>

        <div class="dato">
          <span>
            Tienda No.
          </span>

          <strong>
            {{
              devolucion.numeroTienda
            }}
          </strong>
        </div>

        <div class="dato">
          <span>
            Folio SIAC
          </span>

          <strong class="folio-vacio">
            __________________
          </strong>
        </div>

        <div class="dato ancho">
          <span>
            Tienda
          </span>

          <strong>
            {{
              devolucion.nombreTienda
            }}
          </strong>
        </div>

        <div class="dato ancho">
          <span>
            Chofer
          </span>

          <strong>
            {{ devolucion.chofer }}
          </strong>
        </div>
      </div>

      <!-- PRODUCTOS -->

      <div class="titulo-productos">
        Productos
      </div>

      <!-- ESCRITORIO -->

      <div class="tabla-wrapper">
        <table>
          <thead>
            <tr>
              <th>
                Clave
              </th>

              <th>
                Producto
              </th>

              <th>
                Unidad
              </th>

              <th>
                Cant.
              </th>

              <th>
                Precio
              </th>

              <th>
                Total
              </th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="
                producto
                in devolucion.productosCalculados
              "
              :key="producto.id"
            >
              <td>
                {{ producto.clave }}
              </td>

              <td>
                {{ producto.descripcion }}
              </td>

              <td>
                {{
                  producto.tipoUnidad
                }}
              </td>

              <td>
                {{ producto.cantidad }}
              </td>

              <td>
                ${{
                  formatoDinero(
                    producto.precio,
                  )
                }}
              </td>

              <td>
                <strong>
                  ${{
                    formatoDinero(
                      producto.calculo.total,
                    )
                  }}
                </strong>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- VISTA MÓVIL -->

      <div class="productos-movil">
        <article
          v-for="
            producto
            in devolucion.productosCalculados
          "
          :key="
            `movil-${producto.id}`
          "
          class="producto-movil"
        >
          <div class="producto-superior">
            <div>
              <span class="clave">
                {{ producto.clave }}
              </span>

              <strong>
                {{ producto.descripcion }}
              </strong>
            </div>

            <span class="unidad">
              {{ producto.tipoUnidad }}
            </span>
          </div>

          <div class="producto-detalles">
            <div>
              <span>
                Cantidad
              </span>

              <strong>
                {{ producto.cantidad }}
              </strong>
            </div>

            <div>
              <span>
                Precio
              </span>

              <strong>
                ${{
                  formatoDinero(
                    producto.precio,
                  )
                }}
              </strong>
            </div>

            <div>
              <span>
                Bonif.
              </span>

              <strong>
                {{
                  producto.bonificacion
                }}%
              </strong>
            </div>

            <div>
              <span>
                Total
              </span>

              <strong class="total-producto">
                ${{
                  formatoDinero(
                    producto.calculo.total,
                  )
                }}
              </strong>
            </div>
          </div>
        </article>
      </div>

      <!-- MOTIVO -->

      <section class="motivo">
        <span>
          Motivos de devolución
        </span>

        <div class="motivos-vista">
          <strong
            v-for="
              motivo in devolucion.motivos
            "
            :key="motivo"
          >
            ☑ {{ motivo }}
          </strong>
        </div>
      </section>

      <!-- TOTALES -->

      <section class="totales">
        <div>
          <span>
            Base
          </span>

          <strong>
            ${{
              formatoDinero(
                devolucion.totales.baseVenta,
              )
            }}
          </strong>
        </div>

        <div>
          <span>
            Bonificación
          </span>

          <strong class="resta">
            -${{
              formatoDinero(
                devolucion.totales
                  .bonificacion,
              )
            }}
          </strong>
        </div>

        <div>
          <span>
            IVA
          </span>

          <strong>
            ${{
              formatoDinero(
                devolucion.totales.iva,
              )
            }}
          </strong>
        </div>

        <div>
          <span>
            IEPS
          </span>

          <strong>
            ${{
              formatoDinero(
                devolucion.totales.ieps,
              )
            }}
          </strong>
        </div>

        <div class="total-general">
          <span>
            Total general
          </span>

          <strong>
            ${{
              formatoDinero(
                devolucion.totales
                  .totalGeneral,
              )
            }}
          </strong>
        </div>
      </section>

      <!-- NOTA -->

      <p class="nota-operativa">
        Formato de control operativo.
        El Folio SIAC se captura posteriormente
        al registrar la devolución en el sistema.
      </p>

      <!-- FIRMAS -->

      <section class="firmas">
        <div>
          <span class="linea-firma"></span>

          <strong>
            Encargado de la tienda
          </strong>
        </div>

        <div>
          <span class="linea-firma"></span>

          <strong>
            Chofer
          </strong>

          <small>
            {{ devolucion.chofer }}
          </small>
        </div>
      </section>
    </section>

    <!-- ACCIONES -->

    <section class="acciones">
      <button
        type="button"
        class="boton-secundario"
        @click="volverResumen"
      >
        Corregir información
      </button>

      <button
        type="button"
        class="boton-descargar"
        @click="descargarPdf"
      >
        Descargar PDF
      </button>

      <button
        type="button"
        class="boton-finalizar"
        :class="{
          habilitado:
            pdfGenerado,
        }"
        @click="solicitarFinalizar"
      >
        Finalizar devolución
      </button>
    </section>

    <div
      v-if="pdfGenerado"
      class="pdf-generado"
    >
      ✓ PDF generado. Ya puedes finalizar
      la devolución cuando estés seguro.
    </div>

    <!-- MODAL -->

    <div
      v-if="mostrarConfirmacion"
      class="modal-fondo"
    >
      <section class="modal">
        <div class="modal-icono">
          ✓
        </div>

        <h2>
          ¿Finalizar devolución?
        </h2>

        <p>
          Confirma que ya descargaste
          o imprimiste el PDF.
        </p>

        <div class="advertencia">
          Al finalizar se eliminarán de la
          captura actual la factura, tienda,
          motivo y productos.
        </div>

        <p class="conserva">
          El catálogo de productos, las tiendas
          y el chofer predeterminado
          permanecerán guardados.
        </p>

        <div class="modal-botones">
          <button
            type="button"
            class="cancelar"
            @click="cancelarFinalizacion"
          >
            Cancelar
          </button>

          <button
            type="button"
            class="confirmar"
            @click="confirmarFinalizacion"
          >
            Sí, finalizar
          </button>
        </div>
      </section>
    </div>

  </main>
</template>

<style scoped>
.pagina {
  width: min(100% - 24px, 1000px);
  margin: 0 auto;
  padding: 30px 0 80px;
}

.encabezado {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 20px;
  margin-bottom: 22px;
}

.eyebrow {
  margin: 0 0 4px;
  color: #611232;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 1.4px;
}

h1 {
  margin: 0 0 7px;
}

.encabezado p {
  margin: 0;
  color: #666;
}

.boton-volver {
  padding: 10px 14px;
  border: 0;
  border-radius: 10px;
  background: #eee;
  color: #444;
  font-weight: 600;
  cursor: pointer;
}

.selector {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  max-width: 430px;
  margin: 0 auto 8px;
  padding: 5px;
  border-radius: 13px;
  background: #eee;
}

.boton-copia {
  min-height: 44px;
  border: 0;
  border-radius: 9px;
  background: transparent;
  color: #666;
  font-weight: 700;
  cursor: pointer;
}

.boton-copia.activo {
  background: #611232;
  color: white;
}

.nota-carta {
  margin: 0 0 18px;
  color: #777;
  font-size: 12px;
  text-align: center;
}

/*
 * Documento visual.
 */

.documento {
  overflow: hidden;
  max-width: 850px;
  margin: auto;
  border: 1px solid #ccc;
  border-radius: 10px;
  background: white;
  box-shadow: 0 10px 35px rgb(0 0 0 / 8%);
}

.documento-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 15px;
  padding: 13px 16px;
  background: #611232;
  color: white;
}

.documento-header > div:first-child {
  display: grid;
}

.documento-header strong {
  font-size: 18px;
}

.documento-header span {
  font-size: 10px;
  letter-spacing: 1px;
}

.tipo-copia {
  font-size: 11px;
  font-weight: 700;
}

.datos {
  display: grid;
  grid-template-columns:
    repeat(4, 1fr);
  gap: 1px;
  background: #ddd;
  border-bottom: 1px solid #ddd;
}

.dato {
  display: grid;
  gap: 4px;
  min-width: 0;
  padding: 11px;
  background: white;
}

.dato.ancho {
  grid-column: span 2;
}

.dato span {
  color: #777;
  font-size: 10px;
  text-transform: uppercase;
}

.dato strong {
  overflow-wrap: anywhere;
  font-size: 13px;
}

.folio-vacio {
  color: #611232;
}

.titulo-productos {
  padding: 12px 14px 8px;
  color: #611232;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
}

.tabla-wrapper {
  overflow-x: auto;
  padding: 0 14px;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th {
  padding: 8px 6px;
  background: #611232;
  color: white;
  font-size: 10px;
  text-align: left;
}

td {
  padding: 9px 6px;
  border-bottom: 1px solid #ddd;
  font-size: 11px;
}

.productos-movil {
  display: none;
}

.motivo {
  display: grid;
  gap: 5px;
  margin: 15px;
  padding: 11px;
  border: 1px solid #ddd;
  border-radius: 8px;
}

.motivo span {
  color: #777;
  font-size: 10px;
  text-transform: uppercase;
}

.motivo strong {
  color: #611232;
  font-size: 12px;
}

.totales {
  width: min(100% - 30px, 430px);
  margin: 15px 15px 15px auto;
  padding: 13px;
  border-radius: 9px;
  background: #faf7f8;
}

.totales > div {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  padding: 5px 0;
}

.totales span {
  color: #666;
  font-size: 12px;
}

.totales strong {
  font-size: 12px;
}

.resta {
  color: #a42323;
}

.total-general {
  margin-top: 6px;
  padding-top: 10px !important;
  border-top: 2px solid #611232;
}

.total-general span,
.total-general strong {
  color: #611232;
  font-size: 17px;
  font-weight: 700;
}

.nota-operativa {
  margin: 15px;
  color: #777;
  font-size: 9px;
}

.firmas {
  display: grid;
  grid-template-columns:
    1fr 1fr;
  gap: 35px;
  padding: 35px 30px 22px;
}

.firmas > div {
  display: grid;
  gap: 5px;
  text-align: center;
}

.linea-firma {
  display: block;
  border-top: 1px solid #444;
}

.firmas strong {
  font-size: 10px;
  text-transform: uppercase;
}

.firmas small {
  color: #777;
  font-size: 9px;
}

/*
 * Acciones.
 */

.acciones {
  display: grid;
  max-width: 850px;
  grid-template-columns:
    1fr 1fr 1fr;
  gap: 10px;
  margin: 20px auto 0;
}

.acciones button {
  min-height: 48px;
  padding: 12px;
  border: 0;
  border-radius: 10px;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
}

.boton-secundario {
  background: #eee;
  color: #444;
}

.boton-descargar {
  background: #611232;
  color: white;
}

.boton-finalizar {
  background: #ddd;
  color: #777;
}

.boton-finalizar.habilitado {
  background: #245d37;
  color: white;
}

.pdf-generado {
  max-width: 850px;
  margin: 12px auto 0;
  padding: 12px;
  border-radius: 9px;
  background: #eaf5ed;
  color: #245d37;
  font-size: 13px;
  text-align: center;
}

/*
 * Modal.
 */

.modal-fondo {
  position: fixed;
  z-index: 999;
  inset: 0;
  display: grid;
  padding: 20px;
  background: rgb(0 0 0 / 55%);
  place-items: center;
}

.modal {
  width: min(100%, 430px);
  padding: 25px;
  border-radius: 18px;
  background: white;
  text-align: center;
}

.modal-icono {
  display: grid;
  width: 48px;
  height: 48px;
  margin: 0 auto 12px;
  border-radius: 50%;
  background: #eaf5ed;
  color: #245d37;
  font-size: 24px;
  font-weight: 700;
  place-items: center;
}

.modal h2 {
  margin: 0 0 7px;
}

.modal p {
  color: #666;
}

.advertencia {
  margin: 15px 0;
  padding: 12px;
  border-radius: 9px;
  background: #fff2e5;
  color: #7a4a00;
  font-size: 13px;
}

.conserva {
  font-size: 12px;
}

.modal-botones {
  display: grid;
  grid-template-columns:
    1fr 1fr;
  gap: 10px;
  margin-top: 20px;
}

.modal-botones button {
  min-height: 46px;
  border: 0;
  border-radius: 10px;
  font-weight: 700;
  cursor: pointer;
}

.cancelar {
  background: #eee;
  color: #444;
}

.confirmar {
  background: #611232;
  color: white;
}

/*
 * Móvil.
 */

@media (max-width: 650px) {
  .pagina {
    width:
      min(
        100% - 16px,
        1000px
      );
    padding-top: 20px;
  }

  .encabezado {
    align-items: flex-start;
    flex-direction: column;
  }

  .boton-volver {
    width: 100%;
  }

  .documento {
    border-radius: 7px;
  }

  .documento-header {
    align-items: flex-start;
  }

  .documento-header strong {
    font-size: 15px;
  }

  .datos {
    grid-template-columns:
      1fr 1fr;
  }

  .dato.ancho {
    grid-column: 1 / -1;
  }

  /*
   * En teléfono escondemos la tabla
   * tradicional y utilizamos tarjetas.
   */

  .tabla-wrapper {
    display: none;
  }

  .productos-movil {
    display: grid;
    gap: 9px;
    padding: 0 12px;
  }

  .producto-movil {
    padding: 12px;
    border: 1px solid #ddd;
    border-radius: 9px;
  }

  .producto-superior {
    display: flex;
    justify-content:
      space-between;
    align-items:
      flex-start;
    gap: 10px;
  }

  .producto-superior > div {
    display: grid;
    min-width: 0;
    gap: 3px;
  }

  .clave {
    color: #611232;
    font-size: 10px;
    font-weight: 700;
  }

  .producto-superior strong {
    font-size: 12px;
  }

  .unidad {
    flex: 0 0 auto;
    padding: 4px 7px;
    border-radius: 15px;
    background: #f4ebef;
    color: #611232;
    font-size: 9px;
    font-weight: 700;
  }

  .producto-detalles {
    display: grid;
    grid-template-columns:
      1fr 1fr;
    gap: 8px;
    margin-top: 11px;
  }

  .producto-detalles > div {
    display: grid;
    gap: 2px;
    padding: 7px;
    border-radius: 7px;
    background: #f7f7f7;
  }

  .producto-detalles span {
    color: #777;
    font-size: 9px;
  }

  .producto-detalles strong {
    font-size: 11px;
  }

  .total-producto {
    color: #611232;
  }

  .totales {
    width: auto;
    margin: 12px;
  }

  .firmas {
    gap: 20px;
    padding:
      35px 15px 20px;
  }

  .acciones {
    grid-template-columns:
      1fr;
  }

  .modal-botones {
    grid-template-columns:
      1fr;
  }
}

.motivos-vista {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
}

.motivos-vista strong {
  padding: 5px 8px;
  border-radius: 7px;
  background: #f4ebef;
  color: #611232;
  font-size: 11px;
}
</style>
