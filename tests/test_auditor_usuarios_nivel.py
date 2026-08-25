#!/usr/bin/env python3
"""Tests del auditor de sincronizacion usuarios.nivel <-> cargo vigente (R1/R8)."""
import unittest

from auditor_usuarios_nivel import auditar_usuario, resumen


def tipos(issues):
    return {i['tipo'] for i in issues}


class Sincronizacion(unittest.TestCase):

    def test_sincronizado_ok(self):
        self.assertEqual([], auditar_usuario('tecnico', True, 'tecnico'))

    def test_desync_es_error_con_expected_actual(self):
        iss = auditar_usuario('asistencial', True, 'tecnico')
        self.assertIn('DESYNC_NIVEL', tipos(iss))
        d = iss[0]['detalle']
        self.assertIn('EXPECTED (cargo): tecnico', d)
        self.assertIn('ACTUAL (usuario): asistencial', d)

    def test_desync_directivo_profesional(self):
        """Caso R8 real (usuario 13): directivo vs cargo 219/02 profesional."""
        iss = auditar_usuario('directivo', True, 'profesional')
        self.assertIn('DESYNC_NIVEL', tipos(iss))

    def test_cargo_muerto_warn(self):
        iss = auditar_usuario('tecnico', True, None)
        self.assertIn('CARGO_MUERTO', tipos(iss))
        self.assertEqual({'WARN'}, {i['severidad'] for i in iss})

    def test_sin_vinculo_sin_nivel_activo_warn(self):
        iss = auditar_usuario(None, False)
        self.assertIn('SIN_VINCULO_SIN_NIVEL', tipos(iss))
        self.assertEqual({'WARN'}, {i['severidad'] for i in iss})

    def test_sin_vinculo_sin_nivel_inactivo_info(self):
        iss = auditar_usuario(None, False, usuario_activo=False)
        self.assertEqual({'INFO'}, {i['severidad'] for i in iss})

    def test_sin_vinculo_con_nivel_info_fuera_de_alcance(self):
        """Caso usuario 186: nivel correcto por codigo_empleo pero sin vinculo
        (cargo 91 soft-deleted). No es corregible automaticamente."""
        iss = auditar_usuario('profesional', False)
        self.assertIn('SIN_VINCULO_CON_NIVEL', tipos(iss))
        self.assertNotIn('ERROR', {i['severidad'] for i in iss})

    def test_resumen_cuenta_solo_errores_como_desync(self):
        usuarios = [
            {'issues': []},
            {'issues': auditar_usuario('asistencial', True, 'tecnico')},
            {'issues': auditar_usuario(None, False)},
        ]
        r = resumen(usuarios)
        self.assertEqual(r['error'], 1)
        self.assertEqual(r['warn'], 1)
        self.assertEqual(r['ok'], 1)


if __name__ == '__main__':
    unittest.main()
