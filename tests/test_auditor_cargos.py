#!/usr/bin/env python3
"""Tests del auditor determinista de niveles (tests/auditor_cargos.py).

Casos minimos que reproducen el bug existencial del prototipo
(/tmp/comparar_cargos.py:115 `all(any(...))`), donde un grupo mezclado
(tecnico+asistencial) validaba si existia AL MENOS una fila correcta.
"""
import unittest

from auditor_cargos import auditar_grupo, auditar, NIVEL


def tipos(issues):
    return {i['tipo'] for i in issues}


def severidades(issues):
    return {i['severidad'] for i in issues}


class CasosMinimos(unittest.TestCase):
    """Casos A-F del plan de reauditoria."""

    def test_caso_a_mezcla_tecnico_asistencial_falla(self):
        """manual=tecnico | BD={tecnico, asistencial} -> FAIL (bug original)."""
        issues = auditar_grupo(['3'], ['3', '4'], 33, 33)
        self.assertIn('NIVEL_INCORRECTO', tipos(issues))
        detalle = next(i for i in issues if i['tipo'] == 'NIVEL_INCORRECTO')['detalle']
        self.assertIn('tecnico', detalle)
        self.assertIn('asistencial', detalle)
        self.assertIn('ERROR', severidades(issues))

    def test_caso_b_homogeneo_tecnico_pasa(self):
        issues = auditar_grupo(['3'], ['3'], 10, 10)
        self.assertEqual([], issues)

    def test_caso_c_homogeneo_asistencial_pasa(self):
        issues = auditar_grupo(['4'], ['4'], 44, 44)
        self.assertEqual([], issues)

    def test_caso_d_esperado_asistencial_con_tecnico_mezaclada_falla(self):
        issues = auditar_grupo(['4'], ['3', '4'], 5, 5)
        self.assertIn('NIVEL_INCORRECTO', tipos(issues))

    def test_caso_e_solo_incorrecto_falla(self):
        issues = auditar_grupo(['3'], ['4'], 3, 3)
        self.assertIn('NIVEL_INCORRECTO', tipos(issues))
        detalle = next(i for i in issues if i['tipo'] == 'NIVEL_INCORRECTO')['detalle']
        # Debe expresar expected vs actual de forma explicita
        self.assertIn('EXPECTED LEVELS: [\'tecnico\']', detalle)
        self.assertIn("ACTUAL LEVELS: ['asistencial']", detalle)

    def test_caso_f1_clave_normativa_sin_bd(self):
        """Grupo vacio en BD -> FALTA_EN_BD explicito."""
        issues = auditar_grupo(['3'], [], 8, 0)
        self.assertIn('FALTA_EN_BD', tipos(issues))
        self.assertIn('ERROR', severidades(issues))

    def test_caso_f2_clave_bd_sin_respaldo_normativo(self):
        """Grupo en BD sin referencia normativa -> SIN_RESPALDO_NORMATIVO."""
        normativas = [('global', 'DESPACHO', 'ALCALDE', '0', '005', '03', 1)]
        bd = [{'planta': 'global', 'nivel': 'directivo', 'denom': 'Alcalde Municipal',
               'codigo': '999', 'grado': '01', 'num': 2,
               'dep_cod': 'DEP-004', 'dep_nom': 'Despacho del Alcalde'}]
        res = auditar(normativas, bd)
        clave = next(g for g in res['grupos'] if g['clave'] == ('global', '999', '01'))
        self.assertIn('SIN_RESPALDO_NORMATIVO',
                      {i['tipo'] for i in clave['issues']})


class RegresionEscenarioReal(unittest.TestCase):
    """El escenario exacto que el prototipo dejaba pasar."""

    def test_17_asistencial_mas_15_tecnico_bajo_una_clave_falla(self):
        """367/02 real: 18 empleos asistencial + 15 tecnico. El any() historico
        daba nivel_ok=True; la comparacion de conjuntos debe FALLAR."""
        niveles_bd = ['4'] * 17 + ['3'] * 15
        issues = auditar_grupo(['3'], niveles_bd, 36, 33)
        self.assertIn('NIVEL_INCORRECTO', tipos(issues))
        self.assertIn('CANTIDAD', tipos(issues))
        self.assertEqual({'ERROR'}, severidades(issues))

    def test_nivel_desconocido_no_se_cuela(self):
        """Un valor fuera del catalogo no puede validar un grupo."""
        issues = auditar_grupo(['3'], ['3', 'asistente'], 2, 2)
        self.assertIn('NIVEL_INCORRECTO', tipos(issues))

    def test_null_en_bd_tratado_como_valor_distinto(self):
        """None/'' en BD nunca equivale al nivel esperado."""
        issues = auditar_grupo(['3'], ['', ''], 2, 2)
        self.assertIn('NIVEL_INCORRECTO', tipos(issues))

    def test_denom_faltante_warn_y_extra_info(self):
        issues = auditar_grupo(['3'], ['3'], 5, 5,
                               denoms_esperadas=['TECNICO ADMINISTRATIVO'],
                               denoms_actuales=['Técnico Administrativo – Victimas'])
        t = tipos(issues)
        self.assertIn('DENOM_FALTANTE', t)
        self.assertIn('DENOM_ENRIQUECIDA', t)
        self.assertNotIn('ERROR', severidades(issues))

    def test_mapa_normativo_niveles(self):
        self.assertEqual(NIVEL['3'], 'tecnico')
        self.assertEqual(NIVEL['4'], 'asistencial')


if __name__ == '__main__':
    unittest.main()
