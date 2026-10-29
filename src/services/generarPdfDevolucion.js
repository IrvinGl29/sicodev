import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

import {
  calcularProducto,
  calcularTotales,
} from '@/services/calculadora'

/*
 * ============================================================
 * CONFIGURACIÓN GENERAL
 * ============================================================
 */

const PRODUCTOS_POR_PAGINA = 5

const MOTIVOS = [
  'MAL ESTADO',
  'ERROR SURTIDO',
  'EXCEDENTE',
  'NO SOLICITADO',
  'FALTANTE',
  'LENTO DESPLAZAMIENTO',
  'OTRO',
]

/*
 * ============================================================
 * FORMATO DE DINERO
 * ============================================================
 */

function dinero(valor) {
  return `$${Number(valor || 0).toFixed(2)}`
}

/*
 * ============================================================
 * FORMATO DE FECHA
 * ============================================================
 */

function formatearFecha(fecha) {
  if (!fecha) {
    return ''
  }

  const partes = String(fecha).split('-')

  if (partes.length !== 3) {
    return fecha
  }

  const [anio, mes, dia] = partes

  return `${dia}/${mes}/${anio}`
}

/*
 * ============================================================
 * DIVIDIR PRODUCTOS EN PÁGINAS
 * ============================================================
 */

function dividirProductos(
  productos,
  cantidad,
) {
  const paginas = []

  for (
    let i = 0;
    i < productos.length;
    i += cantidad
  ) {
    paginas.push(
      productos.slice(
        i,
        i + cantidad,
      ),
    )
  }

  return paginas
}

/*
 * ============================================================
 * TEXTO SEGURO
 * ============================================================
 */

function textoSeguro(valor) {
  return String(
    valor ?? '',
  ).trim()
}

/*
 * ============================================================
 * DIBUJAR CAMPO
 * ============================================================
 */

function dibujarCampo(
  doc,
  etiqueta,
  valor,
  x,
  y,
  ancho,
) {
  /*
   * Etiqueta
   */

  doc.setFont(
    'helvetica',
    'normal',
  )

  doc.setFontSize(6.5)
  doc.setTextColor(100)

  doc.text(
    etiqueta,
    x,
    y,
  )

  /*
   * Valor
   */

  doc.setFont(
    'helvetica',
    'bold',
  )

  doc.setFontSize(8)
  doc.setTextColor(30)

  const texto =
    doc.splitTextToSize(
      textoSeguro(valor) || '—',
      ancho,
    )

  doc.text(
    texto,
    x,
    y + 4,
  )
}

/*
 * ============================================================
 * DIBUJAR MOTIVOS
 * ============================================================
 */

function dibujarMotivos(
  doc,
  motivosSeleccionados,
  x,
  y,
  ancho,
) {
  doc.setFont(
    'helvetica',
    'bold',
  )

  doc.setFontSize(6.5)
  doc.setTextColor(60)

  doc.text(
    'MOTIVO DE DEVOLUCION',
    x,
    y,
  )

  doc.setFont(
    'helvetica',
    'normal',
  )

  doc.setFontSize(5.6)

  /*
   * Permitimos el formato nuevo:
   * motivos: [...]
   *
   * Y conservamos compatibilidad
   * con un posible motivo anterior.
   */

  const lista =
    Array.isArray(
      motivosSeleccionados,
    )
      ? motivosSeleccionados
      : motivosSeleccionados
        ? [motivosSeleccionados]
        : []

  const seleccionados =
    new Set(
      lista.map(
        (motivo) =>
          textoSeguro(
            motivo,
          ).toUpperCase(),
      ),
    )

  const motivosTexto =
    MOTIVOS.map(
      (motivo) => {
        const seleccionado =
          seleccionados.has(
            motivo,
          )

        return `${
          seleccionado
            ? '[X]'
            : '[ ]'
        } ${motivo}`
      },
    ).join('     ')

  const lineas =
    doc.splitTextToSize(
      motivosTexto,
      ancho,
    )

  doc.text(
    lineas,
    x,
    y + 4,
  )
}

/*
 * ============================================================
 * DIBUJAR TOTALES
 * ============================================================
 */

function dibujarTotales(
  doc,
  totales,
  x,
  y,
  ancho,
) {
  /*
   * Fondo
   */

  doc.setDrawColor(220)

  doc.setFillColor(
    250,
    247,
    248,
  )

  doc.roundedRect(
    x,
    y,
    ancho,
    18,
    2,
    2,
    'FD',
  )

  /*
   * Encabezados
   */

  doc.setFontSize(6)
  doc.setTextColor(90)

  doc.setFont(
    'helvetica',
    'normal',
  )

  doc.text(
    'BASE',
    x + 3,
    y + 4.5,
  )

  doc.text(
    'BONIFICACION',
    x + 36,
    y + 4.5,
  )

  doc.text(
    'IVA',
    x + 78,
    y + 4.5,
  )

  doc.text(
    'IEPS',
    x + 107,
    y + 4.5,
  )

  doc.text(
    'TOTAL',
    x + ancho - 30,
    y + 4.5,
  )

  /*
   * Valores
   */

  doc.setFont(
    'helvetica',
    'bold',
  )

  doc.setFontSize(7)
  doc.setTextColor(30)

  doc.text(
    dinero(
      totales.baseVenta,
    ),
    x + 3,
    y + 10,
  )

  doc.text(
    `-${dinero(
      totales.bonificacion,
    )}`,
    x + 36,
    y + 10,
  )

  doc.text(
    dinero(
      totales.iva,
    ),
    x + 78,
    y + 10,
  )

  doc.text(
    dinero(
      totales.ieps,
    ),
    x + 107,
    y + 10,
  )

  /*
   * Total general
   */

  doc.setTextColor(
    97,
    18,
    50,
  )

  doc.setFontSize(9)

  doc.text(
    dinero(
      totales.totalGeneral,
    ),
    x + ancho - 3,
    y + 10,
    {
      align: 'right',
    },
  )
}

/*
 * ============================================================
 * DIBUJAR FIRMAS
 * ============================================================
 */

function dibujarFirmas(
  doc,
  chofer,
  x,
  y,
  ancho,
) {
  const mitad =
    ancho / 2

  /*
   * Líneas de firma
   */

  doc.setDrawColor(100)

  doc.line(
    x + 8,
    y,
    x + mitad - 8,
    y,
  )

  doc.line(
    x + mitad + 8,
    y,
    x + ancho - 8,
    y,
  )

  /*
   * Títulos
   */

  doc.setFont(
    'helvetica',
    'normal',
  )

  doc.setFontSize(6)

  doc.setTextColor(60)

  doc.text(
    'ENCARGADO DE LA TIENDA',
    x + mitad / 2,
    y + 4,
    {
      align: 'center',
    },
  )

  doc.text(
    'CHOFER',
    x +
      mitad +
      mitad / 2,
    y + 4,
    {
      align: 'center',
    },
  )

  /*
   * Nombre del chofer
   */

  if (chofer) {
    doc.setFontSize(5.5)

    doc.text(
      textoSeguro(chofer),
      x +
        mitad +
        mitad / 2,
      y + 8,
      {
        align: 'center',
      },
    )
  }
}

/*
 * ============================================================
 * DIBUJAR UNA COPIA DE LA DEVOLUCIÓN
 * ============================================================
 */

function dibujarCopia({
  doc,
  datos,
  productos,
  totales,
  paginaActual,
  totalPaginas,
  yInicio,
  nombreCopia,
}) {
  const paginaAncho =
    doc.internal.pageSize.getWidth()

  /*
   * Margen horizontal
   */

  const x = 8

  const ancho =
    paginaAncho - 16

  /*
   * Altura máxima de cada formato.
   *
   * Hoja Carta:
   * 279.4 mm de alto
   *
   * Cada copia ocupa aprox.
   * 127.5 mm.
   */

  const alto = 127.5

  /*
   * ========================================================
   * MARCO PRINCIPAL
   * ========================================================
   */

  doc.setDrawColor(160)

  doc.roundedRect(
    x,
    yInicio,
    ancho,
    alto,
    2,
    2,
  )

  /*
   * ========================================================
   * ENCABEZADO
   * ========================================================
   */

  doc.setFillColor(
    97,
    18,
    50,
  )

  doc.rect(
    x,
    yInicio,
    ancho,
    9,
    'F',
  )

  doc.setTextColor(255)

  doc.setFont(
    'helvetica',
    'bold',
  )

  doc.setFontSize(10)

  doc.text(
    'SICODEV - FORMATO DE DEVOLUCION',
    x + 4,
    yInicio + 6,
  )

  /*
   * Tipo de copia
   */

  doc.setFontSize(6.5)

  doc.text(
    nombreCopia,
    x + ancho - 4,
    yInicio + 4.5,
    {
      align: 'right',
    },
  )

  /*
   * Número de página
   */

  doc.text(
    `Pagina ${paginaActual} de ${totalPaginas}`,
    x + ancho - 4,
    yInicio + 8,
    {
      align: 'right',
    },
  )

  doc.setTextColor(30)

  /*
   * ========================================================
   * DATOS GENERALES
   * ========================================================
   */

  const yDatos =
    yInicio + 13

  /*
   * Fila 1
   */

  dibujarCampo(
    doc,
    'NO. FACTURA',
    datos.factura,
    x + 3,
    yDatos,
    30,
  )

  dibujarCampo(
    doc,
    'FECHA',
    formatearFecha(
      datos.fecha,
    ),
    x + 38,
    yDatos,
    24,
  )

  dibujarCampo(
    doc,
    'TIENDA NO.',
    datos.numeroTienda,
    x + 68,
    yDatos,
    22,
  )

  dibujarCampo(
    doc,
    'TIENDA',
    datos.nombreTienda,
    x + 96,
    yDatos,
    64,
  )

  /*
   * Folio SIAC
   *
   * IMPORTANTE:
   * Siempre debe quedar vacío.
   */

  dibujarCampo(
    doc,
    'FOLIO SIAC',
    '________________',
    x + ancho - 29,
    yDatos,
    26,
  )

  /*
   * Fila 2
   */

  dibujarCampo(
    doc,
    'CHOFER',
    datos.chofer,
    x + 3,
    yDatos + 9,
    84,
  )

  dibujarCampo(
    doc,
    'PRODUCTOS',
    `${datos.productos.length}`,
    x + 96,
    yDatos + 9,
    25,
  )

  /*
   * ========================================================
   * TABLA DE PRODUCTOS
   * ========================================================
   */

  const filas =
    productos.map(
      (producto) => {
        const calculo =
          calcularProducto(
            producto,
          )

        return [
          /*
           * Clave
           */
          producto.clave,

          /*
           * Descripción
           */
          producto.descripcion,

          /*
           * Caja / pieza
           */
          producto.tipoUnidad ===
          'PIEZA'
            ? 'PIEZA'
            : 'CAJA',

          /*
           * Cantidad
           */
          producto.cantidad,

          /*
           * Precio según factura
           */
          dinero(
            producto.precio,
          ),

          /*
           * Total calculado
           */
          dinero(
            calculo.total,
          ),
        ]
      },
    )

  autoTable(
    doc,
    {
      /*
       * Subimos la tabla para aprovechar
       * mejor media hoja Carta.
       */

      startY:
        yInicio + 34,

      margin: {
        left:
          x + 3,

        right:
          paginaAncho -
          (x + ancho - 3),
      },

      tableWidth:
        ancho - 6,

      /*
       * Encabezados
       */

      head: [[
        'CLAVE',
        'PRODUCTO',
        'UNIDAD',
        'CANT.',
        'PRECIO',
        'TOTAL',
      ]],

      /*
       * Datos
       */

      body:
        filas,

      theme:
        'grid',

      /*
       * Estilo general
       */

      styles: {
        font:
          'helvetica',

        fontSize:
          5.2,

        cellPadding:
          0.8,

        valign:
          'middle',

        overflow:
          'linebreak',

        lineColor: [
          215,
          215,
          215,
        ],

        lineWidth:
          0.15,
      },

      /*
       * Encabezado
       */

      headStyles: {
        fillColor: [
          97,
          18,
          50,
        ],

        textColor:
          255,

        fontStyle:
          'bold',

        halign:
          'center',
      },

      /*
       * Ancho por columna
       */

      columnStyles: {
        0: {
          cellWidth:
            22,
        },

        1: {
          cellWidth:
            79,
        },

        2: {
          cellWidth:
            17,

          halign:
            'center',
        },

        3: {
          cellWidth:
            13,

          halign:
            'center',
        },

        4: {
          cellWidth:
            25,

          halign:
            'right',
        },

        5: {
          cellWidth:
            25,

          halign:
            'right',
        },
      },
    },
  )

  /*
   * Posición final real de la tabla
   */

  const finTabla =
    doc.lastAutoTable.finalY

  /*
   * ========================================================
   * MOTIVO
   * ========================================================
   */

  dibujarMotivos(
    doc,
    datos.motivos,
    x + 3,
    finTabla + 4,
    ancho - 6,
  )

  /*
   * ========================================================
   * TOTALES
   * ========================================================
   */

  const yTotales =
    yInicio + 82

  dibujarTotales(
    doc,
    totales,
    x + 3,
    yTotales,
    ancho - 6,
  )

 /*
 * ========================================================
 * LEYENDA OPERATIVA
 * ========================================================
 */

  const yLeyenda =
    yInicio + 102

  const altoLeyenda =
    12

  /*
  * Fondo suave para hacer
  * la leyenda más visible.
  */

  doc.setFillColor(
    250,
    247,
    248,
  )

  doc.setDrawColor(
    97,
    18,
    50,
  )

  doc.setLineWidth(
    0.25,
  )

  doc.roundedRect(
    x + 3,
    yLeyenda,
    ancho - 6,
    altoLeyenda,
    1.5,
    1.5,
    'FD',
  )

  /*
  * Título
  */

  doc.setFont(
    'helvetica',
    'bold',
  )

  doc.setFontSize(
    5.8,
  )

  doc.setTextColor(
    97,
    18,
    50,
  )

  doc.text(
    'IMPORTANTE',
    x + 6,
    yLeyenda + 3.3,
  )

  /*
  * Leyenda
  */

  const leyenda =
    'ESTE FORMATO SE UTILIZA COMO APOYO PARA REGISTRAR DEVOLUCIONES DE MERCANCIA DURANTE EL SURTIMIENTO. SU FINALIDAD ES LLEVAR UN CONTROL INTERNO ENTRE EL PERSONAL DE REPARTO Y EL ALMACEN. ESTE REGISTRO NO SUSTITUYE LOS MOVIMIENTOS OFICIALES EN SISTEMA.'

  doc.setFont(
    'helvetica',
    'normal',
  )

  doc.setFontSize(
    5.3,
  )

  doc.setTextColor(
    45,
  )

  const leyendaLineas =
    doc.splitTextToSize(
      leyenda,
      ancho - 12,
    )

  doc.text(
    leyendaLineas,
    x + 6,
    yLeyenda + 6,
    {
      lineHeightFactor:
        1.15,
    },
  )

  /*
   * ========================================================
   * FIRMAS
   * ========================================================
   */

  dibujarFirmas(
    doc,
    datos.chofer,
    x + 3,
    yInicio + 117,
    ancho - 6,
  )
}

/*
 * ============================================================
 * GENERAR PDF
 * ============================================================
 */

export function generarPdfDevolucion(
  datos,
) {
  /*
   * Validar productos
   */

  if (
    !datos ||
    !Array.isArray(
      datos.productos,
    ) ||
    !datos.productos.length
  ) {
    throw new Error(
      'No hay productos para generar el PDF.',
    )
  }

  /*
   * ========================================================
   * CALCULAR PRODUCTOS
   * ========================================================
   */

  const productosCalculados =
    datos.productos.map(
      (producto) => ({
        ...producto,

        calculo:
          calcularProducto(
            producto,
          ),
      }),
    )

  /*
   * ========================================================
   * TOTALES DE LA DEVOLUCIÓN
   * ========================================================
   */

  const totales =
    calcularTotales(
      productosCalculados,
    )

  /*
   * ========================================================
   * DIVIDIR PRODUCTOS
   * ========================================================
   */

  const paginas =
    dividirProductos(
      productosCalculados,
      PRODUCTOS_POR_PAGINA,
    )

  /*
   * ========================================================
   * CREAR DOCUMENTO
   * ========================================================
   *
   * Tamaño:
   * CARTA / LETTER
   *
   * 215.9 × 279.4 mm
   *
   * Orientación:
   * Vertical
   */

  const doc =
    new jsPDF({
      orientation:
        'portrait',

      unit:
        'mm',

      format:
        'letter',
    })

  /*
   * ========================================================
   * DIMENSIONES REALES DE LA HOJA
   * ========================================================
   */

  const anchoPagina =
    doc.internal.pageSize.getWidth()

  const altoPagina =
    doc.internal.pageSize.getHeight()

  /*
   * En Letter tendremos aproximadamente:
   *
   * anchoPagina = 215.9 mm
   * altoPagina  = 279.4 mm
   */

  const lineaCorte =
    altoPagina / 2

  /*
   * Dejamos 6 mm de margen.
   */

  const yCopiaSuperior =
    6

  const yCopiaInferior =
    lineaCorte + 6

  /*
   * ========================================================
   * CREAR PÁGINAS
   * ========================================================
   */

  paginas.forEach(
    (
      productosPagina,
      indice,
    ) => {
      /*
       * Después de la primera página
       * agregamos una nueva hoja.
       */

      if (indice > 0) {
        doc.addPage()
      }

      const paginaActual =
        indice + 1

      /*
       * ====================================================
       * COPIA SUPERIOR
       * ====================================================
       */

      dibujarCopia({
        doc,

        datos,

        productos:
          productosPagina,

        totales,

        paginaActual,

        totalPaginas:
          paginas.length,

        yInicio:
          yCopiaSuperior,

        nombreCopia:
          'COPIA TIENDA',
      })

      /*
       * ====================================================
       * LÍNEA DE CORTE
       * ====================================================
       */

      doc.setDrawColor(
        170,
      )

      doc.setLineDashPattern(
        [2, 2],
        0,
      )

      doc.line(
        7,
        lineaCorte,
        anchoPagina - 7,
        lineaCorte,
      )

      /*
       * Texto CORTE
       */

      doc.setFont(
        'helvetica',
        'normal',
      )

      doc.setFontSize(5)

      doc.setTextColor(
        130,
      )

      doc.text(
        'CORTE',
        anchoPagina / 2,
        lineaCorte - 1.5,
        {
          align:
            'center',
        },
      )

      /*
       * Regresar a línea normal
       */

      doc.setLineDashPattern(
        [],
        0,
      )

      /*
       * ====================================================
       * COPIA INFERIOR
       * ====================================================
       */

      dibujarCopia({
        doc,

        datos,

        productos:
          productosPagina,

        totales,

        paginaActual,

        totalPaginas:
          paginas.length,

        yInicio:
          yCopiaInferior,

        nombreCopia:
          'COPIA CHOFER',
      })
    },
  )

  /*
   * ========================================================
   * NOMBRE DEL ARCHIVO
   * ========================================================
   */

  const factura =
    textoSeguro(
      datos.factura,
    ).replace(
      /[^a-zA-Z0-9_-]/g,
      '_',
    )

  const tienda =
    textoSeguro(
      datos.numeroTienda,
    ).replace(
      /[^a-zA-Z0-9_-]/g,
      '_',
    )

  const nombreArchivo =
    `SICODEV_DEVOLUCION_${factura || 'SIN_FACTURA'}_TIENDA_${tienda || 'SIN_NUMERO'}.pdf`

  /*
   * ========================================================
   * DESCARGAR PDF
   * ========================================================
   */

  doc.save(
    nombreArchivo,
  )
}
