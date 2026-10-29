<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'

import {
  useDevolucionStore,
} from '@/stores/devolucion'

const router = useRouter()
const devolucion = useDevolucionStore()

/*
 * ==========================================
 * VALIDACIONES
 * ==========================================
 */

const tieneProductos = computed(() => {
  return devolucion.productos.length > 0
})

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

/*
 * ==========================================
 * NAVEGACIÓN
 * ==========================================
 */

function volverDatos() {
  router.push('/')
}

function agregarProducto() {
  router.push('/agregar-producto')
}

function verVistaPrevia() {
  if (!datosCompletos.value) {
    alert(
      'Faltan datos para continuar. Revisa factura, tienda, motivo y productos.',
    )

    return
  }

  router.push('/vista-previa')
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
          Resumen de devolución
        </h1>

        <p>
          Revisa los datos y cálculos antes
          de generar el formato.
        </p>
      </div>

      <span
        :class="[
          'estado',
          datosCompletos
            ? 'estado-correcto'
            : 'estado-pendiente',
        ]"
      >
        {{
          datosCompletos
            ? 'Datos completos'
            : 'Información pendiente'
        }}
      </span>
    </section>

    <!-- =====================================
         DATOS GENERALES
    ====================================== -->

    <section class="tarjeta">
      <div class="titulo-seccion">
        <div>
          <h2>
            Datos generales
          </h2>

          <p>
            Información correspondiente a
            esta devolución.
          </p>
        </div>

        <button
          type="button"
          class="boton-editar"
          @click="volverDatos"
        >
          Editar
        </button>
      </div>

      <div class="datos-grid">

        <div class="dato">
          <span>
            Fecha
          </span>

          <strong>
            {{
              devolucion.fecha ||
              'Sin capturar'
            }}
          </strong>
        </div>

        <div class="dato">
          <span>
            Chofer
          </span>

          <strong>
            {{
              devolucion.chofer ||
              'Sin capturar'
            }}
          </strong>
        </div>

        <div class="dato">
          <span>
            No. Factura
          </span>

          <strong>
            {{
              devolucion.factura ||
              'Sin capturar'
            }}
          </strong>
        </div>

        <div class="dato">
          <span>
            No. Tienda
          </span>

          <strong>
            {{
              devolucion.numeroTienda ||
              'Sin capturar'
            }}
          </strong>
        </div>

        <div class="dato dato-ancho">
          <span>
            Tienda
          </span>

          <strong>
            {{
              devolucion.nombreTienda ||
              'Sin capturar'
            }}
          </strong>
        </div>

        <div class="dato dato-ancho">
          <span>
            Motivos
          </span>

          <div
            v-if="
              devolucion.motivos.length
            "
            class="motivos-resumen"
          >
            <span
              v-for="
                motivo in devolucion.motivos
              "
              :key="motivo"
              class="motivo-chip"
            >
              ✓ {{ motivo }}
            </span>
          </div>

          <strong v-else>
            Sin seleccionar
          </strong>
        </div>
      </div>

      <!-- FOLIO SIAC -->

      <div class="folio">
        <div>
          <span>
            Folio SIAC
          </span>

          <strong>
            ______________________
          </strong>
        </div>

        <p>
          Este dato se deja vacío porque
          se asigna posteriormente al registrar
          la devolución en SIAC.
        </p>
      </div>
    </section>

    <!-- =====================================
         PRODUCTOS
    ====================================== -->

    <section class="tarjeta">
      <div class="titulo-seccion">
        <div>
          <h2>
            Productos a devolver
          </h2>

          <p>
            {{ devolucion.productos.length }}
            producto(s) agregado(s).
          </p>
        </div>

        <button
          type="button"
          class="boton-editar"
          @click="agregarProducto"
        >
          + Agregar
        </button>
      </div>

      <!-- SIN PRODUCTOS -->

      <div
        v-if="!tieneProductos"
        class="sin-productos"
      >
        <strong>
          Todavía no hay productos.
        </strong>

        <p>
          Agrega al menos un producto antes
          de generar la devolución.
        </p>

        <button
          type="button"
          class="boton-principal pequeno"
          @click="agregarProducto"
        >
          Agregar producto
        </button>
      </div>

      <!-- TABLA -->

      <div
        v-else
        class="tabla-contenedor"
      >
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
                Bonif.
              </th>

              <th>
                IVA
              </th>

              <th>
                IEPS
              </th>

              <th>
                Total
              </th>

              <th>
                Acción
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
              <!-- CLAVE -->

              <td>
                <strong class="clave">
                  {{ producto.clave }}
                </strong>
              </td>

              <!-- DESCRIPCIÓN -->

              <td class="descripcion">
                {{ producto.descripcion }}
              </td>

              <!-- CAJA / PIEZA -->

              <td>
                <span class="unidad-resumen">
                  {{
                    producto.tipoUnidad ||
                    '—'
                  }}
                </span>
              </td>

              <!-- CANTIDAD -->

              <td>
                {{ producto.cantidad }}
              </td>

              <!-- PRECIO FACTURA -->

              <td>
                ${{
                  producto.precio.toFixed(2)
                }}
              </td>

              <!-- BONIFICACIÓN -->

              <td>
                <div class="dato-calculo">
                  <span>
                    {{
                      producto.bonificacion
                    }}%
                  </span>

                  <strong class="resta">
                    -${{
                      producto.calculo
                        .bonificacion
                        .toFixed(2)
                    }}
                  </strong>
                </div>
              </td>

              <!-- IVA -->

              <td>
                <div class="dato-calculo">
                  <span>
                    {{
                      producto.iva
                        ? `${producto.ivaPorcentaje}%`
                        : 'No'
                    }}
                  </span>

                  <strong>
                    ${{
                      producto.calculo
                        .iva
                        .toFixed(2)
                    }}
                  </strong>
                </div>
              </td>

              <!-- IEPS -->

              <td>
                <div class="dato-calculo">
                  <span>
                    {{
                      producto.ieps
                        ? `${producto.iepsPorcentaje}%`
                        : 'No'
                    }}
                  </span>

                  <strong>
                    ${{
                      producto.calculo
                        .ieps
                        .toFixed(2)
                    }}
                  </strong>
                </div>
              </td>

              <!-- TOTAL -->

              <td>
                <strong class="total-producto">
                  ${{
                    producto.calculo
                      .total
                      .toFixed(2)
                  }}
                </strong>
              </td>

              <!-- ELIMINAR -->

              <td>
                <button
                  type="button"
                  class="eliminar"
                  @click="
                    devolucion
                      .eliminarProducto(
                        producto.id,
                      )
                  "
                >
                  Eliminar
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- ===================================
           TOTALES
      ==================================== -->

      <div
        v-if="tieneProductos"
        class="totales-siac"
      >
        <div class="totales-titulo">
          <div>
            <span>
              Cálculo de devolución
            </span>

            <h3>
              Resumen general
            </h3>
          </div>

          <span class="badge-siac">
            SIAC
          </span>
        </div>

        <!-- BASE DE VENTA -->

        <div class="linea-total">
          <span>
            Base de venta
          </span>

          <strong>
            ${{
              devolucion.totales
                .baseVenta
                .toFixed(2)
            }}
          </strong>
        </div>

        <!-- BONIFICACIÓN -->

        <div class="linea-total">
          <span>
            Bonificación
          </span>

          <strong class="resta">
            -${{
              devolucion.totales
                .bonificacion
                .toFixed(2)
            }}
          </strong>
        </div>

        <!-- BASE BONIFICADA -->

        <div
          class="
            linea-total
            linea-destacada
          "
        >
          <span>
            Base bonificada
          </span>

          <strong>
            ${{
              devolucion.totales
                .baseBonificada
                .toFixed(2)
            }}
          </strong>
        </div>

        <div class="separador"></div>

        <!-- BASE 00 -->

        <div class="linea-total">
          <span>
            Base 00
          </span>

          <strong>
            ${{
              devolucion.totales
                .base00
                .toFixed(2)
            }}
          </strong>
        </div>

        <!-- BASE 16 -->

        <div class="linea-total">
          <span>
            Base 16%
          </span>

          <strong>
            ${{
              devolucion.totales
                .base16
                .toFixed(2)
            }}
          </strong>
        </div>

        <!-- BASE IEPS -->

        <div class="linea-total">
          <span>
            Base IEPS
          </span>

          <strong>
            ${{
              devolucion.totales
                .baseIeps
                .toFixed(2)
            }}
          </strong>
        </div>

        <div class="separador"></div>

        <!-- IVA -->

        <div class="linea-total">
          <span>
            IVA
          </span>

          <strong class="suma">
            +${{
              devolucion.totales
                .iva
                .toFixed(2)
            }}
          </strong>
        </div>

        <!-- IEPS -->

        <div class="linea-total">
          <span>
            IEPS
          </span>

          <strong class="suma">
            +${{
              devolucion.totales
                .ieps
                .toFixed(2)
            }}
          </strong>
        </div>

        <!-- SUBTOTAL -->

        <div
          class="
            linea-total
            subtotal
          "
        >
          <span>
            Subtotal
          </span>

          <strong>
            ${{
              devolucion.totales
                .subtotal
                .toFixed(2)
            }}
          </strong>
        </div>

        <!-- TOTAL GENERAL -->

        <div class="total-general">
          <div>
            <span>
              Total general
            </span>

            <small>
              Importe estimado de devolución
            </small>
          </div>

          <strong>
            ${{
              devolucion.totales
                .totalGeneral
                .toFixed(2)
            }}
          </strong>
        </div>
      </div>
    </section>

    <!-- =====================================
         NOTA DEL CÁLCULO
    ====================================== -->

    <section class="tarjeta nota-calculo">
      <div class="icono-calculo">
        %
      </div>

      <div>
        <h2>
          Cálculo automático
        </h2>

        <p>
          Los importes se calculan utilizando
          el precio capturado de la factura,
          la bonificación correspondiente al
          producto y los impuestos registrados
          en el catálogo.
        </p>

        <p>
          El Folio SIAC continuará vacío hasta
          que la devolución sea registrada
          oficialmente en el sistema.
        </p>
      </div>
    </section>

    <!-- =====================================
         ACCIONES
    ====================================== -->

    <section class="acciones-finales">
      <button
        type="button"
        class="boton-secundario"
        @click="volverDatos"
      >
        ← Volver a datos
      </button>

      <button
        type="button"
        class="boton-agregar"
        @click="agregarProducto"
      >
        + Agregar producto
      </button>

      <button
        type="button"
        class="boton-principal"
        :disabled="!datosCompletos"
        @click="verVistaPrevia"
      >
        Revisar y finalizar
      </button>
    </section>

  </main>
</template>

<style scoped>
.pagina {
  width:
    min(
      100% - 32px,
      1200px
    );

  margin: 0 auto;
  padding: 40px 0 80px;
}

/* =========================================
   ENCABEZADO
========================================= */

.encabezado-pagina {
  display: flex;
  justify-content:
    space-between;
  align-items:
    flex-end;
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

.estado {
  padding: 8px 13px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 700;
  white-space: nowrap;
}

.estado-correcto {
  background: #e8f5e9;
  color: #256029;
}

.estado-pendiente {
  background: #fff3e0;
  color: #8a5700;
}

/* =========================================
   TARJETAS
========================================= */

.tarjeta {
  margin-bottom: 20px;
  padding: 26px;
  border:
    1px solid #e5e5e5;
  border-radius: 18px;
  background: white;
  box-shadow:
    0 8px 25px
    rgb(0 0 0 / 5%);
}

.titulo-seccion {
  display: flex;
  justify-content:
    space-between;
  align-items:
    flex-start;
  gap: 20px;
  margin-bottom: 20px;
}

.titulo-seccion h2 {
  margin-bottom: 5px;
}

.titulo-seccion p {
  margin-bottom: 0;
  color: #777;
}

/* =========================================
   DATOS GENERALES
========================================= */

.datos-grid {
  display: grid;
  grid-template-columns:
    1fr 1fr;
  gap: 15px;
}

.dato {
  display: grid;
  gap: 5px;
  padding: 14px;
  border-radius: 11px;
  background: #f8f8f8;
}

.dato span {
  color: #777;
  font-size: 12px;
}

.dato strong {
  color: #252525;
}

.dato-ancho {
  grid-column: 1 / -1;
}

/* =========================================
   FOLIO
========================================= */

.folio {
  display: grid;
  grid-template-columns:
    220px 1fr;
  gap: 20px;
  align-items: center;

  margin-top: 18px;
  padding: 16px;

  border:
    1px dashed #b9b9b9;

  border-radius: 12px;
}

.folio div {
  display: grid;
  gap: 5px;
}

.folio span {
  color: #777;
  font-size: 12px;
}

.folio strong {
  color: #611232;
}

.folio p {
  margin: 0;
  color: #666;
  font-size: 13px;
  line-height: 1.5;
}

/* =========================================
   BOTONES
========================================= */

.boton-editar {
  padding: 9px 13px;
  border: 0;
  border-radius: 9px;
  background: #f4ebef;
  color: #611232;
  font: inherit;
  font-weight: 600;
  cursor: pointer;
}

.boton-editar:hover {
  background: #eadbe1;
}

.boton-principal,
.boton-secundario,
.boton-agregar {
  padding: 13px 20px;
  border: 0;
  border-radius: 10px;
  font: inherit;
  font-weight: 600;
  cursor: pointer;
}

.boton-principal {
  background: #611232;
  color: white;
}

.boton-principal:hover:not(
  :disabled
) {
  background: #4d0e28;
}

.boton-principal:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.boton-secundario {
  background: #eee;
  color: #444;
}

.boton-agregar {
  background: #f4ebef;
  color: #611232;
}

.pequeno {
  width: auto;
}

/* =========================================
   SIN PRODUCTOS
========================================= */

.sin-productos {
  padding: 35px;
  border:
    1px dashed #ccc;
  border-radius: 12px;
  text-align: center;
}

.sin-productos p {
  color: #777;
}

/* =========================================
   TABLA
========================================= */

.tabla-contenedor {
  overflow-x: auto;
}

table {
  width: 100%;
  min-width: 1100px;
  border-collapse:
    collapse;
}

th {
  padding: 11px 9px;
  border-bottom:
    2px solid #eee;
  color: #666;
  font-size: 11px;
  text-align: left;
  white-space: nowrap;
}

td {
  padding: 14px 9px;
  border-bottom:
    1px solid #eee;
  vertical-align: middle;
  font-size: 13px;
}

.descripcion {
  min-width: 190px;
}

.clave {
  color: #611232;
}

.unidad-resumen {
  display: inline-block;
  padding: 5px 8px;
  border-radius: 20px;
  background: #f4ebef;
  color: #611232;
  font-size: 10px;
  font-weight: 700;
}

.dato-calculo {
  display: grid;
  gap: 3px;
}

.dato-calculo span {
  color: #777;
  font-size: 10px;
}

.dato-calculo strong {
  font-size: 12px;
}

.resta {
  color: #a42323;
}

.suma {
  color: #285f32;
}

.total-producto {
  color: #611232;
  white-space: nowrap;
}

.eliminar {
  padding: 7px 9px;
  border: 0;
  border-radius: 8px;
  background: #f7eeee;
  color: #8b1e1e;
  font: inherit;
  font-size: 12px;
  cursor: pointer;
}

.eliminar:hover {
  background: #efdcdc;
}

/* =========================================
   TOTALES
========================================= */

.totales-siac {
  width:
    min(
      100%,
      470px
    );

  margin-top: 28px;
  margin-left: auto;

  padding: 20px;

  border:
    1px solid #e4d7dc;

  border-radius: 14px;

  background: #faf7f8;
}

.totales-titulo {
  display: flex;
  justify-content:
    space-between;
  align-items:
    flex-start;
  gap: 15px;
  margin-bottom: 15px;
}

.totales-titulo span {
  color: #777;
  font-size: 11px;
}

.totales-titulo h3 {
  margin: 3px 0 0;
  color: #611232;
}

.badge-siac {
  padding: 6px 9px;
  border-radius: 20px;
  background: #611232;
  color: white !important;
  font-weight: 700;
}

.linea-total {
  display: flex;
  justify-content:
    space-between;
  gap: 20px;
  padding: 6px 0;
}

.linea-total span {
  color: #666;
}

.linea-total strong {
  white-space: nowrap;
}

.linea-destacada {
  font-weight: 700;
}

.separador {
  height: 1px;
  margin: 8px 0;
  background: #e3e3e3;
}

.subtotal {
  margin-top: 8px;
  padding-top: 10px;
  border-top:
    1px solid #ddd;
  font-weight: 700;
}

.total-general {
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

.total-general > div {
  display: grid;
  gap: 3px;
}

.total-general span {
  font-size: 17px;
  font-weight: 700;
}

.total-general small {
  color: #777;
  font-size: 10px;
}

.total-general > strong {
  color: #611232;
  font-size: 24px;
}

/* =========================================
   NOTA CÁLCULO
========================================= */

.nota-calculo {
  display: flex;
  gap: 18px;
  align-items:
    flex-start;
  background: #faf7f8;
}

.icono-calculo {
  display: grid;
  flex:
    0 0 45px;
  width: 45px;
  height: 45px;
  border-radius: 12px;
  background: #611232;
  color: white;
  font-size: 21px;
  font-weight: 700;
  place-items: center;
}

.nota-calculo h2 {
  margin-bottom: 6px;
  font-size: 18px;
}

.nota-calculo p {
  margin-bottom: 7px;
  color: #666;
  line-height: 1.6;
}

.nota-calculo p:last-child {
  margin-bottom: 0;
}

/* =========================================
   ACCIONES
========================================= */

.acciones-finales {
  display: flex;
  justify-content:
    flex-end;
  gap: 12px;
}

/* =========================================
   RESPONSIVE
========================================= */

@media (max-width: 700px) {
  .pagina {
    width:
      min(
        100% - 24px,
        1200px
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

  .datos-grid {
    grid-template-columns:
      1fr;
  }

  .dato-ancho {
    grid-column: auto;
  }

  .folio {
    grid-template-columns:
      1fr;
  }

  .titulo-seccion {
    flex-direction:
      column;
  }

  .totales-siac {
    width: 100%;
  }

  .nota-calculo {
    flex-direction:
      column;
  }

  .acciones-finales {
    flex-direction:
      column-reverse;
  }

  .boton-principal,
  .boton-secundario,
  .boton-agregar {
    width: 100%;
  }

}

.motivos-resumen {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.motivo-chip {
  display: inline-block;
  padding: 5px 9px;
  border-radius: 20px;
  background: #f4ebef;
  color: #611232 !important;
  font-size: 11px !important;
  font-weight: 700;
}
</style>
