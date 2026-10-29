import {
  contarTiendas,
  reemplazarChoferes,
  reemplazarTiendas,
} from '@/services/db'

import {
  tiendasIniciales,
} from '@/data/tiendasIniciales'

const CHOFERES_INICIALES = [
  'Daniel Alberto Martinez Flores',
  'Diogenes Gonzalez Nuñez',
  'Alberto Merlin Lopez',
  'Fernando Macario Galvan',
  'Faustino Martinez Jose',
  'Daniel Martinez Reyes',
  'Karla Abigail Francisco Jimenez',
]

export async function inicializarDatos() {
  /*
   * ==========================================
   * CHOFERES
   * ==========================================
   *
   * Siempre sincronizamos los choferes
   * definidos en la aplicación.
   *
   * Así, cuando agreguemos uno nuevo
   * y actualicemos SICODEV, aparecerá
   * automáticamente en todos los dispositivos.
   */

  await reemplazarChoferes(
    CHOFERES_INICIALES,
  )

  /*
   * ==========================================
   * TIENDAS
   * ==========================================
   *
   * Las tiendas solamente se cargan
   * inicialmente si todavía no existen.
   */

  const totalTiendas =
    await contarTiendas()

  if (totalTiendas === 0) {
    await reemplazarTiendas(
      tiendasIniciales,
    )
  }
}
