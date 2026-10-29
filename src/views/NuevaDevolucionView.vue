<script setup>
import { watch } from 'vue'
import { useRouter } from 'vue-router'

import {
  useDevolucionStore,
} from '@/stores/devolucion'

import {
  buscarTiendaPorNumero,
} from '@/services/db'

const router = useRouter()
const devolucion = useDevolucionStore()

/*
 * ==========================================
 * MOTIVOS
 * ==========================================
 */

const MOTIVOS_DEVOLUCION = [
  'MAL ESTADO',
  'ERROR SURTIDO',
  'EXCEDENTE',
  'NO SOLICITADO',
  'FALTANTE',
  'LENTO DESPLAZAMIENTO',
  'OTRO',
]

/*
 * ==========================================
 * BUSCAR TIENDA
 * ==========================================
 */

watch(
  () => devolucion.numeroTienda,
  async (numero) => {
    const numeroBuscado =
      String(
        numero ?? '',
      ).trim()

    if (!numeroBuscado) {
      devolucion.nombreTienda = ''

      return
    }

    try {
      const tienda =
        await buscarTiendaPorNumero(
          numeroBuscado,
        )

      devolucion.nombreTienda =
        tienda
          ? tienda.nombre
          : ''
    } catch (error) {
      console.error(
        'Error al buscar tienda:',
        error,
      )

      devolucion.nombreTienda = ''
    }
  },
)

/*
 * ==========================================
 * NÚMERO DE TIENDA
 * ==========================================
 */

function normalizarNumeroTienda() {
  const limpio =
    String(
      devolucion.numeroTienda ??
        '',
    ).replace(
      /\D/g,
      '',
    )

  if (
    devolucion.numeroTienda !==
    limpio
  ) {
    devolucion.numeroTienda =
      limpio
  }
}

/*
 * ==========================================
 * NAVEGACIÓN
 * ==========================================
 */

function agregarProducto() {
  router.push(
    '/agregar-producto',
  )
}

function irResumen() {
  router.push(
    '/resumen',
  )
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
          Nueva devolución
        </h1>

        <p>
          Captura los datos generales
          antes de agregar los productos.
        </p>
      </div>
    </section>

    <!-- =====================================
         FORMULARIO
    ====================================== -->

    <section class="tarjeta formulario">

      <!-- FECHA -->

      <div class="campo">
        <label for="fecha">
          Fecha
        </label>

        <input
          id="fecha"
          v-model="devolucion.fecha"
          type="date"
        >
      </div>

      <!-- ===================================
           CHOFER PREDETERMINADO
      ==================================== -->

      <div class="campo">
        <label>
          Chofer
        </label>

        <div class="chofer-fila">
          <input
            :value="devolucion.chofer"
            type="text"
            readonly
          >

          <RouterLink
            to="/configuracion"
            class="boton-secundario"
          >
            Cambiar
          </RouterLink>
        </div>

        <small>
          Se utilizará el chofer
          predeterminado configurado
          en este dispositivo.
        </small>
      </div>

      <!-- ===================================
           FACTURA
      ==================================== -->

      <div class="campo">
        <label for="factura">
          No. Factura
        </label>

        <input
          id="factura"
          v-model.trim="
            devolucion.factura
          "
          type="text"
          placeholder="Ej. A-45872"
          autocomplete="off"
        >
      </div>

      <!-- ===================================
           TIENDA
      ==================================== -->

      <div class="campo">
        <label for="tienda">
          No. Tienda
        </label>

        <input
          id="tienda"
          v-model="
            devolucion.numeroTienda
          "
          type="text"
          inputmode="numeric"
          pattern="[0-9]*"
          autocomplete="off"
          enterkeyhint="done"
          placeholder="Ej. 20"
          @input="
            normalizarNumeroTienda
          "
        >

        <!-- TIENDA ENCONTRADA -->

        <div
          v-if="
            devolucion.nombreTienda
          "
          class="
            tienda-encontrada
          "
        >
          <span>
            Tienda encontrada
          </span>

          <strong>
            {{
              devolucion
                .nombreTienda
            }}
          </strong>
        </div>

        <!-- NO ENCONTRADA -->

        <div
          v-else-if="
            devolucion.numeroTienda
          "
          class="
            tienda-no-encontrada
          "
        >
          No se encontró ese número
          de tienda.
        </div>
      </div>

      <!-- ===================================
           MOTIVOS
      ==================================== -->

      <div class="campo">
        <label>
          Motivo de devolución
        </label>

        <p class="ayuda-motivos">
          Puedes seleccionar uno o
          varios motivos.
        </p>

        <div class="motivos-grid">
          <label
            v-for="
              motivo
              in MOTIVOS_DEVOLUCION
            "
            :key="motivo"
            :class="[
              'motivo-opcion',
              {
                seleccionado:
                  devolucion
                    .motivos
                    .includes(
                      motivo,
                    ),
              },
            ]"
          >
            <input
              v-model="
                devolucion.motivos
              "
              type="checkbox"
              :value="motivo"
            >

            <span
              class="check-visual"
            >
              {{
                devolucion
                  .motivos
                  .includes(
                    motivo,
                  )
                  ? '✓'
                  : ''
              }}
            </span>

            <span>
              {{ motivo }}
            </span>
          </label>
        </div>

        <small
          v-if="
            devolucion
              .motivos
              .length
          "
          class="
            motivos-seleccionados
          "
        >
          {{
            devolucion
              .motivos
              .length
          }}
          motivo(s) seleccionado(s)
        </small>
      </div>

      <!-- ===================================
           ACCIONES
      ==================================== -->

      <div class="acciones">
        <button
          class="
            boton-principal
          "
          type="button"
          @click="
            agregarProducto
          "
        >
          + Agregar producto
        </button>

        <button
          class="
            boton-secundario
            boton-resumen
          "
          type="button"
          @click="
            irResumen
          "
        >
          Ver resumen
        </button>
      </div>

    </section>
  </main>
</template>

<style scoped>
/* =========================================
   PÁGINA
========================================= */

.pagina {
  width: min(
    100% - 32px,
    850px
  );

  margin: 0 auto;

  padding:
    40px 0 80px;
}

/* =========================================
   ENCABEZADO
========================================= */

.encabezado-pagina {
  margin-bottom: 24px;
}

.eyebrow {
  margin: 0 0 5px;

  color: #611232;

  font-size: 13px;
  font-weight: 700;

  letter-spacing: 1.5px;
}

h1 {
  margin: 0;

  color: #202124;

  font-size: 32px;
}

.encabezado-pagina
p:not(.eyebrow) {
  margin: 8px 0 0;

  color: #666;
}

/* =========================================
   TARJETA
========================================= */

.tarjeta {
  padding: 28px;

  border:
    1px solid #e5e5e5;

  border-radius: 18px;

  background: white;

  box-shadow:
    0 8px 25px
    rgb(0 0 0 / 5%);
}

.formulario {
  display: grid;

  gap: 22px;
}

/* =========================================
   CAMPOS
========================================= */

.campo {
  display: grid;

  gap: 8px;
}

.campo > label {
  color: #303030;

  font-weight: 600;
}

.campo input,
.campo select {
  width: 100%;

  box-sizing: border-box;

  padding: 13px 14px;

  border:
    1px solid #cfcfcf;

  border-radius: 10px;

  background: white;

  color: #202124;

  font: inherit;
}

.campo input:focus,
.campo select:focus {
  border-color: #611232;

  outline:
    2px solid
    rgb(97 18 50 / 15%);
}

.campo small {
  color: #777;
}

/* =========================================
   CHOFER
========================================= */

.chofer-fila {
  display: grid;

  grid-template-columns:
    1fr auto;

  gap: 10px;
}

/* =========================================
   TIENDA
========================================= */

.tienda-encontrada {
  display: flex;

  flex-direction: column;

  gap: 3px;

  padding: 12px 14px;

  border-radius: 10px;

  background: #f8f2f4;

  color: #611232;
}

.tienda-encontrada span {
  color: #777;

  font-size: 12px;
}

.tienda-no-encontrada {
  padding: 10px 14px;

  border-radius: 10px;

  background: #fff7e8;

  color: #805400;

  font-size: 14px;
}

/* =========================================
   MOTIVOS
========================================= */

.ayuda-motivos {
  margin:
    -2px 0 10px;

  color: #777;

  font-size: 13px;
}

.motivos-grid {
  display: grid;

  grid-template-columns:
    repeat(2, 1fr);

  gap: 10px;
}

/*
 * Sobrescribimos el estilo general
 * del input porque aquí utilizamos
 * un checkbox oculto personalizado.
 */

.motivo-opcion {
  display: flex;

  align-items: center;

  gap: 10px;

  min-height: 48px;

  padding: 11px 13px;

  border:
    1px solid #ddd;

  border-radius: 10px;

  background: white;

  color: #303030;

  cursor: pointer;

  transition:
    border-color 0.15s ease,
    background 0.15s ease;
}

.motivo-opcion input {
  position: absolute;

  width: 1px;
  height: 1px;

  padding: 0;

  opacity: 0;

  pointer-events: none;
}

.motivo-opcion.seleccionado {
  border-color: #611232;

  background: #faf3f6;

  color: #611232;

  font-weight: 600;
}

.check-visual {
  display: grid;

  flex:
    0 0 22px;

  width: 22px;
  height: 22px;

  box-sizing: border-box;

  border:
    2px solid #bbb;

  border-radius: 6px;

  background: white;

  color: white;

  font-size: 14px;
  font-weight: 700;

  place-items: center;
}

.motivo-opcion.seleccionado
.check-visual {
  border-color: #611232;

  background: #611232;
}

.motivos-seleccionados {
  display: block;

  margin-top: 6px;

  color: #611232 !important;

  font-weight: 600;
}

/* =========================================
   ACCIONES
========================================= */

.acciones {
  display: flex;

  gap: 12px;

  margin-top: 5px;
}

.boton-principal,
.boton-secundario {
  padding: 13px 18px;

  border: 0;

  border-radius: 10px;

  font: inherit;

  font-weight: 600;

  cursor: pointer;

  text-decoration: none;
}

.boton-principal {
  flex: 1;

  background: #611232;

  color: white;
}

.boton-principal:hover {
  background: #4d0e28;
}

.boton-secundario {
  background: #f4ebef;

  color: #611232;
}

.boton-secundario:hover {
  background: #eadbe1;
}

/* =========================================
   RESPONSIVE
========================================= */

@media (max-width: 650px) {
  .pagina {
    width: min(
      100% - 24px,
      850px
    );

    padding-top: 25px;
  }

  .tarjeta {
    padding: 20px;
  }

  h1 {
    font-size: 27px;
  }

  .chofer-fila {
    grid-template-columns:
      1fr;
  }

  .motivos-grid {
    grid-template-columns:
      1fr;
  }

  .acciones {
    flex-direction:
      column;
  }

  .boton-secundario,
  .boton-resumen {
    text-align: center;
  }
}
</style>
