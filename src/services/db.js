import { openDB } from 'idb'

const DB_NAME = 'sicodev'
const DB_VERSION = 1

const dbPromise = openDB(DB_NAME, DB_VERSION, {
  upgrade(db) {
    // PRODUCTOS
    if (!db.objectStoreNames.contains('productos')) {
      const storeProductos = db.createObjectStore('productos', {
        keyPath: 'clave',
      })

      storeProductos.createIndex(
        'descripcion',
        'descripcion',
      )
    }

    // TIENDAS
    if (!db.objectStoreNames.contains('tiendas')) {
      db.createObjectStore('tiendas', {
        keyPath: 'numero',
      })
    }

    // CHOFERES
    if (!db.objectStoreNames.contains('choferes')) {
      db.createObjectStore('choferes', {
        keyPath: 'nombre',
      })
    }
  },
})

export async function reemplazarProductos(productos) {
  const db = await dbPromise

  const tx = db.transaction(
    'productos',
    'readwrite',
  )

  await tx.store.clear()

  for (const producto of productos) {
    await tx.store.put(producto)
  }

  await tx.done
}

export async function obtenerProductos() {
  const db = await dbPromise

  return db.getAll('productos')
}

export async function contarProductos() {
  const db = await dbPromise

  return db.count('productos')
}

export async function buscarProductos(texto, limite = 8) {
  const busqueda = texto
    .trim()
    .toLowerCase()

  if (!busqueda) {
    return []
  }

  const productos = await obtenerProductos()

  return productos
    .filter((producto) => {
      return (
        producto.clave
          .toLowerCase()
          .includes(busqueda) ||
        producto.descripcion
          .toLowerCase()
          .includes(busqueda)
      )
    })
    .slice(0, limite)
}

export async function obtenerChoferes() {
  const db = await dbPromise

  return db.getAll('choferes')
}

export async function contarChoferes() {
  const db = await dbPromise

  return db.count('choferes')
}

export async function reemplazarChoferes(choferes) {
  const db = await dbPromise

  const tx = db.transaction(
    'choferes',
    'readwrite',
  )

  await tx.store.clear()

  for (const nombre of choferes) {
    await tx.store.put({
      nombre,
    })
  }

  await tx.done
}

export async function obtenerTiendas() {
  const db = await dbPromise

  return db.getAll('tiendas')
}

export async function contarTiendas() {
  const db = await dbPromise

  return db.count('tiendas')
}

export async function reemplazarTiendas(tiendas) {
  const db = await dbPromise

  const tx = db.transaction(
    'tiendas',
    'readwrite',
  )

  await tx.store.clear()

  for (const tienda of tiendas) {
    await tx.store.put(tienda)
  }

  await tx.done
}

export async function buscarTiendaPorNumero(numero) {
  const db = await dbPromise

  /*
   * Normalizamos:
   * 001 -> 1
   * 016 -> 16
   * 116 -> 116
   */
  const numeroNormalizado = String(
    Number(numero),
  )

  if (
    !numero ||
    numeroNormalizado === 'NaN'
  ) {
    return null
  }

  return (
    (await db.get(
      'tiendas',
      numeroNormalizado,
    )) || null
  )
}
