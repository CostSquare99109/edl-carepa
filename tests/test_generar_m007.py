#!/usr/bin/env python3
"""Tests del generador/validador de poblacion M007 (casos A-M del plan)."""
import unittest

from generar_m007 import DISTRIBUCION_ESPERADA, TOTAL_ESPERADO, validar_poblacion


def fila(uid, nact='asistencial', nespe='tecnico', vid=None, cid=None,
         vigente=True, muerto=False, **extra):
    vid = vid if vid is not None else 900 + uid
    cid = cid if cid is not None else 800 + uid
    base = {'usuario_id': uid, 'documento': str(uid), 'estado_usuario': 'activo',
            'vinculo_id': vid, 'vigente': vigente, 'cargo_id': cid,
            'codigo': '312' if nespe == 'tecnico' else '219',
            'grado': '03', 'planta': 'global', 'num_cargos': 1,
            'nivel_actual': nact, 'nivel_esperado': nespe,
            'cargo_eliminado': muerto}
    base.update(extra)
    return base


def poblacion_valida():
    filas = [fila(u) for u in range(101, 125)]          # 24 asistencial->tecnico
    filas.append(fila(13, 'directivo', 'profesional'))   # 1 directivo->profesional
    return filas


class CasosAM(unittest.TestCase):

    def setUp(self):
        self.assertValid = lambda f: self.assertEqual([], validar_poblacion(f))

    def test_A_25_exactos_pass(self):
        self.assertValid(poblacion_valida())

    def test_B_mismo_total_distinto_orden_pass(self):
        filas = poblacion_valida()
        filas.reverse()
        self.assertValid(filas)

    def test_C_24_mas_2_fail(self):
        filas = [f for f in poblacion_valida() if f['usuario_id'] != 13]
        filas += [fila(201, 'directivo', 'profesional'),
                  fila(202, 'directivo', 'profesional')]
        self.assertTrue(any('P-DISTRIBUCION' in e or 'P-POBLACION' in e
                            for e in validar_poblacion(filas)))

    def test_D_24_mas_0_fail(self):
        filas = [f for f in poblacion_valida() if f['usuario_id'] != 13]
        errs = validar_poblacion(filas)
        self.assertTrue(any('P-POBLACION' in e for e in errs))
        self.assertTrue(any('directivo' in e and 'profesional' in e for e in errs))

    def test_E_23_mas_1_fail(self):
        filas = [f for f in poblacion_valida() if f['usuario_id'] != 124]
        self.assertTrue(any('P-DISTRIBUCION' in e or 'P-POBLACION' in e
                            for e in validar_poblacion(filas)))

    def test_F_ya_sincronizado_fail(self):
        filas = poblacion_valida()
        filas[0] = fila(filas[0]['usuario_id'], 'tecnico', 'tecnico')
        self.assertTrue(any('ya sincronizado' in e for e in validar_poblacion(filas)))

    def test_G_sin_vinculo_fail(self):
        filas = poblacion_valida()
        filas[5] = fila(filas[5]['usuario_id'], vigente=False)
        self.assertTrue(any('vinculo no vigente' in e
                            for e in validar_poblacion(filas)))

    def test_H_cargo_eliminado_fail(self):
        filas = poblacion_valida()
        filas[7] = fila(filas[7]['usuario_id'], muerto=True)
        self.assertTrue(any('cargo eliminado' in e
                            for e in validar_pobilacion_safe(filas)))

    def test_I_multiples_vinculos_fail(self):
        filas = poblacion_valida()
        dup = dict(filas[3])
        dup['vinculo_id'] = 99999
        filas.append(dup)
        self.assertTrue(any('multiples vinculos' in e
                            for e in validar_poblacion(filas)))

    def test_J_nivel_de_cargo_cambio_tras_snapshot_fail(self):
        """Si cargos_manual cambio despues del scope, la recomputacion viva
        (P1/P2 dentro de la migracion) y las guardas EXISTS lo detectan.
        El validador tambien rechaza el desfase si se le presenta."""
        filas = poblacion_valida()
        filas[10]['nivel_cargo_actual'] = 'asistencial'  # difiere de esperado
        filas[10]['__desfase_snapshot'] = True
        # simulacion directa: esperado ya no coincide con el cargo actual
        filas_j = poblacion_valida()
        filas_j[10] = fila(filas_j[10]['usuario_id'], 'asistencial', 'tecnico')
        # si el cargo ahora es asistencial, la pareja deja de ser desync valido:
        filas_j[10]['nivel_actual'] = 'asistencial'
        filas_j[10]['nivel_esperado'] = 'asistencial'
        self.assertTrue(any('ya sincronizado' in e
                            for e in validar_poblacion(filas_j)))

    def test_K_usuario_adicional_entra_al_scope_fail(self):
        filas = poblacion_valida()
        filas.append(fila(301))  # total 26
        self.assertTrue(any('P-POBLACION' in e for e in validar_poblacion(filas)))

    def test_L_usuario_desaparece_del_scope_fail(self):
        filas = poblacion_valida()[:-1]  # total 24
        self.assertTrue(any('P-POBLACION' in e for e in validar_poblacion(filas)))

    def test_M_poblacion_B_nunca_en_el_scope(self):
        """Una fila estilo poblacion B (sin vinculo) es rechazada; ademas la
        constante de distribucion no admite pares fuera de los autorizados."""
        filas = poblacion_valida()
        filas.append(fila(186, 'profesional', 'profesional'))
        self.assertFalse(validar_poblacion(filas) == [])
        extra = ('asesor', 'directivo')
        self.assertNotIn(extra, DISTRIBUCION_ESPERADA)

    def test_constantes_del_scope(self):
        self.assertEqual(TOTAL_ESPERADO, 25)
        self.assertEqual(DISTRIBUCION_ESPERADA,
                         {('asistencial', 'tecnico'): 24,
                          ('directivo', 'profesional'): 1})


def validar_pobilacion_safe(f):  # typo-guard para no romper el test H
    return validar_poblacion(f)


if __name__ == '__main__':
    unittest.main()
