export function redondear(valor) {
  const numero = Number(valor) || 0

  return Math.round(
    (numero + Number.EPSILON) * 100,
  ) / 100
}

export function calcularProducto(producto) {
  const cantidad =
    Number(producto.cantidad) || 0

  const precio =
    Number(producto.precio) || 0

  const porcentajeBonificacion =
    Number(producto.bonificacion) || 0

  const porcentajeIva =
    producto.iva
      ? Number(
          producto.ivaPorcentaje ?? 16,
        )
      : 0

  const porcentajeIeps =
    producto.ieps
      ? Number(
          producto.iepsPorcentaje ?? 8,
        )
      : 0

  /*
   * 1. Cantidad × precio de factura
   */
  const base = redondear(
    cantidad * precio,
  )

  /*
   * 2. Bonificación
   */
  const bonificacion = redondear(
    base *
      (porcentajeBonificacion / 100),
  )

  /*
   * 3. Base después de bonificación
   */
  const baseBonificada = redondear(
    base - bonificacion,
  )

  /*
   * 4. IVA
   */
  const iva = redondear(
    baseBonificada *
      (porcentajeIva / 100),
  )

  /*
   * 5. IEPS
   */
  const ieps = redondear(
    baseBonificada *
      (porcentajeIeps / 100),
  )

  /*
   * SIAC incluye IVA en el IMPORTE
   * de la línea.
   */
  const importe = redondear(
    baseBonificada + iva,
  )

  /*
   * El IEPS se agrega posteriormente.
   */
  const total = redondear(
    importe + ieps,
  )

  return {
    base,

    porcentajeBonificacion,
    bonificacion,

    baseBonificada,

    porcentajeIva,
    iva,

    porcentajeIeps,
    ieps,

    importe,

    total,
  }
}

export function calcularTotales(productos) {
  const totales = {
    baseVenta: 0,

    bonificacion: 0,

    baseBonificada: 0,

    base00: 0,

    base16: 0,

    baseIeps: 0,

    iva: 0,

    ieps: 0,

    subtotal: 0,

    totalGeneral: 0,
  }

  for (const producto of productos) {
    const calculo =
      calcularProducto(producto)

    totales.baseVenta +=
      calculo.base

    totales.bonificacion +=
      calculo.bonificacion

    totales.baseBonificada +=
      calculo.baseBonificada

    /*
     * BASE 00 en SIAC:
     * productos que no causan IVA.
     */
    if (!producto.iva) {
      totales.base00 +=
        calculo.baseBonificada
    }

    /*
     * BASE 16:
     * productos con IVA.
     */
    if (producto.iva) {
      totales.base16 +=
        calculo.baseBonificada
    }

    /*
     * BASE IEPS:
     * productos que causan IEPS.
     */
    if (producto.ieps) {
      totales.baseIeps +=
        calculo.baseBonificada
    }

    totales.iva +=
      calculo.iva

    totales.ieps +=
      calculo.ieps

    totales.subtotal +=
      calculo.importe
  }

  for (const clave in totales) {
    totales[clave] =
      redondear(totales[clave])
  }

  totales.totalGeneral =
    redondear(
      totales.subtotal +
        totales.ieps,
    )

  return totales
}
