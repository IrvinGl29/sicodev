<script setup>
import {
  onMounted,
  ref,
} from 'vue'

import {
  useConfiguracionStore,
} from '@/stores/configuracion'

import {
  useDevolucionStore,
} from '@/stores/devolucion'

import {
  leerCatalogoProductos,
} from '@/services/importarCatalogoProductos'

import {
  reemplazarProductos,
  contarProductos,
  obtenerChoferes,
} from '@/services/db'

const configuracion =
  useConfiguracionStore()

const devolucion =
  useDevolucionStore()

const choferes = ref([])

/*
 * ==========================================
 * CHOFER PREDETERMINADO
 * ==========================================
 */

const predeterminadoSeleccionado =
  ref(
    configuracion.choferPredeterminado,
  )

function guardarPredeterminado() {
  if (
    !predeterminadoSeleccionado.value
  ) {
    alert(
      'Selecciona un chofer.',
    )

    return
  }

  /*
   * Guardamos el chofer seleccionado
   * como predeterminado de este
   * dispositivo.
   */

  configuracion
    .establecerChoferPredeterminado(
      predeterminadoSeleccionado.value,
    )

  /*
   * También actualizamos el chofer
   * de la devolución actual.
   *
   * Así no es necesario cerrar
   * ni recargar SICODEV.
   */

  devolucion
    .usarChoferPredeterminado()

  alert(
    `Chofer predeterminado guardado:\n\n${predeterminadoSeleccionado.value}`,
  )
}

/*
 * ==========================================
 * CHOFERES
 * ==========================================
 */

async function cargarChoferes() {
  try {
    const registros =
      await obtenerChoferes()

    choferes.value =
      registros
        .map(
          (registro) =>
            registro.nombre,
        )
        .sort(
          (a, b) =>
            a.localeCompare(b),
        )

    /*
     * Si el chofer almacenado ya
     * no existe en el catálogo,
     * no seleccionamos otro
     * automáticamente.
     */

    const existe =
      choferes.value.includes(
        predeterminadoSeleccionado.value,
      )

    if (!existe) {
      predeterminadoSeleccionado.value =
        ''
    }
  } catch (error) {
    console.error(
      'Error al cargar choferes:',
      error,
    )
  }
}

/*
 * ==========================================
 * CATÁLOGO DE PRODUCTOS
 * ==========================================
 */

const totalProductos =
  ref(0)

const importandoCatalogo =
  ref(false)

const mensajeCatalogo =
  ref('')

async function actualizarTotalProductos() {
  try {
    totalProductos.value =
      await contarProductos()
  } catch (error) {
    console.error(
      'Error al consultar productos:',
      error,
    )

    totalProductos.value = 0
  }
}

/*
 * ==========================================
 * INICIO
 * ==========================================
 */

onMounted(async () => {
  await Promise.all([
    actualizarTotalProductos(),
    cargarChoferes(),
  ])
})

/*
 * ==========================================
 * IMPORTAR CATÁLOGO
 * ==========================================
 */

async function importarCatalogo(
  event,
) {
  const input =
    event.target

  const archivo =
    input.files?.[0]

  if (!archivo) {
    return
  }

  importandoCatalogo.value =
    true

  mensajeCatalogo.value =
    ''

  try {
    const resultado =
      await leerCatalogoProductos(
        archivo,
      )

    if (
      !resultado.productos.length
    ) {
      alert(
        'No se encontraron productos válidos en el archivo.',
      )

      return
    }

    const confirmar =
      confirm(
        `Se encontraron ${resultado.productos.length} productos.\n\n` +
        `Se reemplazará el catálogo almacenado actualmente en este dispositivo.\n\n` +
        `¿Deseas continuar?`,
      )

    if (!confirmar) {
      return
    }

    await reemplazarProductos(
      resultado.productos,
    )

    await actualizarTotalProductos()

    mensajeCatalogo.value =
      `Catálogo actualizado correctamente: ${totalProductos.value} productos guardados.`

    console.log(
      'Productos guardados:',
      totalProductos.value,
    )

    console.log(
      'Hojas procesadas:',
      resultado.hojas,
    )

    console.log(
      'Filas leídas:',
      resultado.filasLeidas,
    )

    alert(
      `Catálogo actualizado correctamente.\n\n` +
      `${totalProductos.value} productos guardados.`,
    )
  } catch (error) {
    console.error(
      'Error al importar catálogo:',
      error,
    )

    alert(
      'Ocurrió un error al importar el catálogo. Revisa la consola para obtener más información.',
    )
  } finally {
    importandoCatalogo.value =
      false

    /*
     * Permitimos seleccionar nuevamente
     * el mismo archivo.
     */

    input.value = ''
  }
}
</script>

<template>
  <main class="pagina">

    <!-- =====================================
         ENCABEZADO
    ====================================== -->

    <section class="encabezado-pagina">
      <p class="eyebrow">
        SICODEV
      </p>

      <h1>
        Configuración
      </h1>

      <p>
        Configuración local de este dispositivo.
      </p>
    </section>

    <!-- =====================================
         CHOFER PREDETERMINADO ACTUAL
    ====================================== -->

    <section
      class="
        tarjeta
        chofer-actual
      "
    >
      <div>
        <span>
          Chofer predeterminado
        </span>

        <strong>
          {{
            configuracion
              .choferPredeterminado ||
            'Sin seleccionar'
          }}
        </strong>
      </div>

      <span
        class="
          etiqueta-predeterminado
        "
      >
        Predeterminado
      </span>
    </section>

    <!-- =====================================
         SELECCIONAR CHOFER
    ====================================== -->

    <section class="tarjeta">
      <div class="titulo-seccion">
        <h2>
          Chofer predeterminado
        </h2>

        <p>
          Selecciona el chofer que
          SICODEV utilizará automáticamente
          al iniciar cada nueva devolución
          en este dispositivo.
        </p>
      </div>

      <div class="campo">
        <label
          for="choferPredeterminado"
        >
          Chofer de este dispositivo
        </label>

        <select
          id="choferPredeterminado"
          v-model="
            predeterminadoSeleccionado
          "
        >
          <option
            value=""
            disabled
          >
            Selecciona un chofer
          </option>

          <option
            v-for="
              chofer in choferes
            "
            :key="chofer"
            :value="chofer"
          >
            {{ chofer }}
          </option>
        </select>
      </div>

      <button
        type="button"
        class="boton-principal"
        :disabled="
          !predeterminadoSeleccionado
        "
        @click="
          guardarPredeterminado
        "
      >
        Guardar como predeterminado
      </button>
    </section>

    <!-- =====================================
         CATÁLOGO DE PRODUCTOS
    ====================================== -->

    <section class="tarjeta">
      <div class="titulo-catalogo">
        <div
          class="
            titulo-seccion
            sin-margen
          "
        >
          <h2>
            Catálogo de productos
          </h2>

          <p>
            Importa el Catálogo General
            para utilizar los productos
            reales en SICODEV.
          </p>
        </div>

        <div
          class="
            contador-productos
          "
        >
          {{ totalProductos }}
          productos
        </div>
      </div>

      <!-- ESTADO -->

      <div class="estado-catalogo">
        <div class="estado-icono">
          📦
        </div>

        <div>
          <span>
            Productos almacenados
            en este dispositivo
          </span>

          <strong>
            {{ totalProductos }}
          </strong>
        </div>
      </div>

      <!-- ARCHIVO -->

      <div
        class="
          campo
          archivo-catalogo
        "
      >
        <label
          for="archivoCatalogo"
        >
          Seleccionar Catálogo General
        </label>

        <input
          id="archivoCatalogo"
          type="file"
          accept=".xlsx,.xls"
          :disabled="
            importandoCatalogo
          "
          @change="
            importarCatalogo
          "
        >

        <small>
          Formatos admitidos:
          Excel .xlsx y .xls
        </small>
      </div>

      <!-- IMPORTANDO -->

      <div
        v-if="
          importandoCatalogo
        "
        class="importando"
      >
        Importando catálogo...

        <span>
          Por favor espera.
        </span>
      </div>

      <!-- CORRECTO -->

      <div
        v-if="
          mensajeCatalogo
        "
        class="
          catalogo-correcto
        "
      >
        <strong>
          ✓ Catálogo actualizado
        </strong>

        <span>
          {{ mensajeCatalogo }}
        </span>
      </div>

      <!-- AVISO -->

      <div
        class="
          aviso-catalogo
        "
      >
        <strong>
          Importante
        </strong>

        <p>
          Al importar un nuevo
          Catálogo General, los
          productos almacenados
          actualmente serán
          reemplazados por los
          productos contenidos
          en el nuevo archivo.
        </p>

        <p>
          Las devoluciones no se
          almacenan en esta sección.
        </p>
      </div>
    </section>

    <!-- =====================================
         INFORMACIÓN
    ====================================== -->

    <section
      class="
        tarjeta
        informacion
      "
    >
      <h2>
        ¿Qué se guarda en este dispositivo?
      </h2>

      <p>
        SICODEV conserva localmente
        el chofer predeterminado y
        el catálogo de productos.
      </p>

      <p>
        El chofer predeterminado será
        seleccionado automáticamente
        cada vez que se inicie una
        nueva devolución.
      </p>

      <p>
        Las devoluciones que se generen
        no se conservarán como historial.
      </p>
    </section>

  </main>
</template>

<style scoped>
.pagina {
  width: min(
    100% - 32px,
    850px
  );

  margin: 0 auto;
  padding: 40px 0 80px;
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

h1,
h2,
p {
  margin-top: 0;
}

h1 {
  margin-bottom: 8px;
  font-size: 32px;
}

.encabezado-pagina > p:last-child {
  margin-bottom: 0;
  color: #666;
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
   CHOFER PREDETERMINADO
========================================= */

.chofer-actual {
  display: flex;
  justify-content:
    space-between;
  align-items: center;
  gap: 15px;
}

.chofer-actual > div {
  display: grid;
  gap: 5px;
}

.chofer-actual span {
  color: #777;
  font-size: 13px;
}

.chofer-actual strong {
  color: #611232;
  font-size: 22px;
}

.etiqueta-predeterminado {
  flex-shrink: 0;
  padding: 7px 11px;
  border-radius: 20px;
  background: #f4ebef;
  color: #611232 !important;
  font-size: 12px !important;
  font-weight: 700;
}

/* =========================================
   SECCIONES
========================================= */

.titulo-seccion {
  margin-bottom: 20px;
}

.titulo-seccion.sin-margen {
  margin-bottom: 0;
}

.titulo-seccion h2 {
  margin-bottom: 7px;
}

.titulo-seccion p {
  margin-bottom: 0;
  color: #666;
  line-height: 1.6;
}

/* =========================================
   CAMPOS
========================================= */

.campo {
  display: grid;
  gap: 8px;
  margin-bottom: 18px;
}

.campo label {
  font-weight: 600;
}

.campo select {
  width: 100%;
  padding: 13px 14px;
  border: 1px solid #ccc;
  border-radius: 10px;
  background: white;
  font: inherit;
}

.campo select:focus {
  border-color: #611232;

  outline:
    2px solid
    rgb(97 18 50 / 12%);
}

/* =========================================
   BOTONES
========================================= */

.boton-principal {
  padding: 12px 17px;
  border: 0;
  border-radius: 10px;
  background: #611232;
  color: white;
  font: inherit;
  font-weight: 600;
  cursor: pointer;
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

/* =========================================
   CATÁLOGO
========================================= */

.titulo-catalogo {
  display: flex;
  justify-content:
    space-between;
  align-items:
    flex-start;
  gap: 20px;
  margin-bottom: 22px;
}

.contador-productos {
  flex-shrink: 0;
  padding: 8px 13px;
  border-radius: 20px;
  background: #f4ebef;
  color: #611232;
  font-size: 13px;
  font-weight: 700;
}

.estado-catalogo {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 22px;
  padding: 16px;
  border-radius: 12px;
  background: #f8f8f8;
}

.estado-icono {
  display: grid;
  width: 45px;
  height: 45px;
  flex-shrink: 0;
  border-radius: 11px;
  background: #f4ebef;
  font-size: 21px;
  place-items: center;
}

.estado-catalogo >
div:last-child {
  display: grid;
  gap: 3px;
}

.estado-catalogo span {
  color: #777;
  font-size: 13px;
}

.estado-catalogo strong {
  color: #611232;
  font-size: 22px;
}

/* =========================================
   ARCHIVO
========================================= */

.archivo-catalogo input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ccc;
  border-radius: 10px;
  background: white;
  font: inherit;
}

.archivo-catalogo input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.archivo-catalogo small {
  color: #777;
}

/* =========================================
   IMPORTANDO
========================================= */

.importando {
  display: grid;
  gap: 4px;
  margin-bottom: 18px;
  padding: 14px;
  border-radius: 10px;
  background: #fff8eb;
  color: #735000;
  font-weight: 600;
}

.importando span {
  font-size: 12px;
  font-weight: 400;
}

/* =========================================
   CATÁLOGO CORRECTO
========================================= */

.catalogo-correcto {
  display: grid;
  gap: 5px;
  margin-bottom: 18px;
  padding: 14px;
  border-radius: 10px;
  background: #edf7ef;
  color: #285f32;
}

.catalogo-correcto span {
  font-size: 13px;
}

/* =========================================
   AVISO
========================================= */

.aviso-catalogo {
  padding: 15px;
  border-radius: 12px;
  background: #faf7f8;
}

.aviso-catalogo strong {
  color: #611232;
}

.aviso-catalogo p {
  margin: 6px 0 0;
  color: #666;
  font-size: 13px;
  line-height: 1.5;
}

/* =========================================
   INFORMACIÓN
========================================= */

.informacion {
  background: #faf7f8;
}

.informacion h2 {
  font-size: 18px;
}

.informacion p {
  margin-bottom: 7px;
  color: #666;
  line-height: 1.6;
}

.informacion p:last-child {
  margin-bottom: 0;
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

  .chofer-actual {
    align-items:
      flex-start;

    flex-direction:
      column;
  }

  .chofer-actual strong {
    font-size: 19px;
  }

  .titulo-catalogo {
    flex-direction:
      column;
  }

  .boton-principal {
    width: 100%;
  }
}
</style>
