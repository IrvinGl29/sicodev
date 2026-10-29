import * as XLSX from 'xlsx'

function estaVacio(valor) {
  return (
    valor === null ||
    valor === undefined ||
    String(valor).trim() === ''
  )
}

function obtenerDescripcion(fila) {

  for (let i = 2; i <= 6; i++) {
    const valor = fila[i]

    if (typeof valor !== 'string') {
      continue
    }

    const texto = valor.trim()

    if (!texto) {
      continue
    }

    if (
      texto
        .toUpperCase()
        .startsWith('FAMILIA:')
    ) {
      continue
    }

    return texto
  }

  return ''
}

function obtenerImpuestosYBonificacion(fila) {
  /*
   * Hacemos una copia para no modificar
   * la fila original.
   */
  const datos = [...fila]

  /*
   * Quitamos columnas vacías al final.
   * Algunas hojas tienen una columna extra.
   */
  while (
    datos.length > 0 &&
    estaVacio(datos[datos.length - 1])
  ) {
    datos.pop()
  }

  if (datos.length < 3) {
    return null
  }

  /*
   * En el catálogo:
   *
   * últimas 3 columnas útiles =
   * IVA | IEPS | BONIFICACION
   */

  const iva = Number(
    datos[datos.length - 3],
  )

  const ieps = Number(
    datos[datos.length - 2],
  )

  const bonificacion = Number(
    datos[datos.length - 1],
  )

  if (
    Number.isNaN(iva) ||
    Number.isNaN(ieps) ||
    Number.isNaN(bonificacion)
  ) {
    return null
  }

  return {
    iva,
    ieps,
    bonificacion,
  }
}

function convertirFilaEnProducto(fila) {
  const familia = fila[0]
  const articulo = fila[1]

  /*
   * Las filas reales de producto tienen
   * familia numérica y artículo.
   *
   * Esto elimina automáticamente:
   *
   * encabezados
   * FAMILIA:
   * filas vacías
   */
  if (
    !Number.isFinite(Number(familia)) ||
    estaVacio(articulo)
  ) {
    return null
  }

  const descripcion =
    obtenerDescripcion(fila)

  if (!descripcion) {
    return null
  }

  const impuestos =
    obtenerImpuestosYBonificacion(fila)

  if (!impuestos) {
    return null
  }

  return {
    clave: String(articulo).trim(),

    descripcion:
      descripcion.trim().toUpperCase(),

    iva:
      impuestos.iva === 16,

    ieps:
      impuestos.ieps === 8,

    ivaPorcentaje:
      impuestos.iva,

    iepsPorcentaje:
      impuestos.ieps,

    bonificacion:
      impuestos.bonificacion,
  }
}

export async function leerCatalogoProductos(
  archivo,
) {
  const buffer =
    await archivo.arrayBuffer()

  const libro = XLSX.read(buffer, {
    type: 'array',
  })

  /*
   * Map evita claves duplicadas.
   * La clave del producto será ARTICULO.
   */
  const productos = new Map()

  let filasLeidas = 0
  let filasValidas = 0

  for (
    const nombreHoja
    of libro.SheetNames
  ) {
    const hoja =
      libro.Sheets[nombreHoja]

    const filas =
      XLSX.utils.sheet_to_json(
        hoja,
        {
          header: 1,
          defval: null,
          raw: true,
        },
      )

    for (const fila of filas) {
      filasLeidas++

      const producto =
        convertirFilaEnProducto(fila)

      if (!producto) {
        continue
      }

      filasValidas++

      productos.set(
        producto.clave,
        producto,
      )
    }
  }

  return {
    productos: [
      ...productos.values(),
    ],

    hojas:
      libro.SheetNames.length,

    filasLeidas,

    filasValidas,
  }
}
