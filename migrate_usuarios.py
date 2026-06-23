#!/usr/bin/env python3
"""Migrate funcionarios from SQL dump to edl_carepa.usuarios"""

import re
import mysql.connector
from mysql.connector import Error

# Password hash for "12345678"
PASSWORD_HASH = "$2y$12$3LuVBIhZuKf628yR7uFUueAYkFuSHMuR1JYbcIyWmQdnANAOdiKd."

# Dependencia mapping from old Id to new edl_carepa id
DEP_MAP = {
    1: 6,   # Secretaría de Agricultura y Medio Ambiente
    2: 7,   # Secretaría de Educación
    3: 8,   # Secretaría de General y Servicios Administrativos
    4: 9,   # Secretaria de Gobierno Y Participación Ciudadana
    5: 10,  # Secretaria de Planeación...
    6: 11,  # Secretaría de Salud y Protección Social
    7: 12,  # Secretaría de Transito y Transporte
    8: 13,  # Secretaria, de Hacienda
    9: 14,  # Inspección
    10: 15, # Comisaria
    11: 16, # Sisbén
    12: 17, # Despacho del Alcalde
    13: 18, # Oficina de Juridica
    17: 19, # Comunicaciones
    18: 20, # Control Interno
    19: 21, # Tesorería
    20: 22, # Secretaría de Planeación, Vivienda y Ordenamiento Territorial
    21: 23, # Secretaría de Infraestructura Física
}

def split_name(full_name):
    """Split full name into primer_nombre, segundo_nombre, primer_apellido, segundo_apellido"""
    parts = full_name.strip().split()
    if len(parts) >= 4:
        return parts[0], parts[1], parts[2], ' '.join(parts[3:])
    elif len(parts) == 3:
        return parts[0], parts[1], parts[2], None
    elif len(parts) == 2:
        return parts[0], None, parts[1], None
    else:
        return parts[0], None, None, None

def parse_sql_values(content):
    """Extract VALUES tuples from INSERT statements"""
    # Find the INSERT INTO ... VALUES part
    match = re.search(r'VALUES\s+(.*?);', content, re.DOTALL | re.IGNORECASE)
    if not match:
        return []
    
    values_str = match.group(1).strip()
    # Remove trailing semicolon and COMMIT
    values_str = values_str.rstrip(';').strip()
    if values_str.endswith('COMMIT'):
        values_str = values_str[:-6].strip()
    
    # Parse tuples
    tuples = []
    current = ''
    depth = 0
    in_string = False
    string_char = None
    
    for char in values_str:
        if char in ("'", '"') and not in_string:
            in_string = True
            string_char = char
        elif char == string_char and in_string:
            in_string = False
            string_char = None
        elif char == '(' and not in_string:
            depth += 1
        elif char == ')' and not in_string:
            depth -= 1
        
        current += char
        
        if depth == 0 and current.strip() and not in_string:
            tuples.append(current.strip().strip('()'))
            current = ''
    
    return tuples

def parse_tuple(tup_str):
    """Parse a single tuple into list of values"""
    values = []
    current = ''
    in_string = False
    string_char = None
    escaped = False
    
    for char in tup_str:
        if escaped:
            current += char
            escaped = False
        elif char == '\\' and in_string:
            escaped = True
            current += char
        elif char in ("'", '"') and not in_string:
            in_string = True
            string_char = char
            current += char
        elif char == string_char and in_string and not escaped:
            in_string = False
            string_char = None
            current += char
        elif char == ',' and not in_string:
            values.append(current.strip())
            current = ''
        else:
            current += char
    
    if current.strip():
        values.append(current.strip())
    
    # Clean values
    cleaned = []
    for v in values:
        v = v.strip()
        if v.upper() == 'NULL':
            cleaned.append(None)
        elif v.startswith("'") and v.endswith("'"):
            cleaned.append(v[1:-1])
        elif v.startswith('"') and v.endswith('"'):
            cleaned.append(v[1:-1])
        else:
            try:
                if '.' in v:
                    cleaned.append(float(v))
                else:
                    cleaned.append(int(v))
            except:
                cleaned.append(v)
    return cleaned

def migrate():
    # Read SQL file
    with open('/storage/emulated/0/edl/funcionarios (2).sql', 'r', encoding='utf-8') as f:
        content = f.read()
    
    tuples = parse_sql_values(content)
    print(f"Found {len(tuples)} funcionarios records")
    
    # Connect to DB
    conn = mysql.connector.connect(
        host='localhost',
        user='edl_user',
        password='Edl2026!Secure',
        database='edl_carepa',
        unix_socket='/data/data/com.termux/files/usr/var/run/mysqld.sock'
    )
    cursor = conn.cursor()
    
    # Clear existing usuarios (except admin id=1)
    cursor.execute("DELETE FROM usuarios WHERE id > 1")
    conn.commit()
    
    inserted = 0
    skipped = 0
    
    for tup in tuples:
        vals = parse_tuple(tup)
        if len(vals) < 8:
            continue
            
        # funcionarios columns: Id, Cedula, Nombre, fecha_nacimiento, Telefono, direccion, correo, is_active, id_super_usuario
        try:
            old_id = vals[0]
            cedula = str(vals[1])
            nombre_completo = vals[2]
            fecha_nac = vals[3] if vals[3] and str(vals[3]) != '0000-00-00' else None
            telefono = str(vals[4]) if vals[4] and vals[4] != 0 else None
            direccion = vals[5] if vals[5] else None
            email = vals[6] if vals[6] else f"{cedula}@carepa.gov.co"
            is_active = vals[7] if len(vals) > 7 else 1
            
            # Skip duplicates by cedula
            cursor.execute("SELECT id FROM usuarios WHERE documento = %s", (cedula,))
            if cursor.fetchone():
                skipped += 1
                continue
            
            # Split name
            pn, sn, pa, sa = split_name(nombre_completo)
            
            # Get dependencia from responsables table
            dep_id = 6  # default
            cursor.execute("SELECT Id_dependencia FROM responsables WHERE Id_funcionarios = %s AND is_active = 1 ORDER BY Id DESC LIMIT 1", (old_id,))
            resp = cursor.fetchone()
            if resp:
                old_dep = resp[0]
                dep_id = DEP_MAP.get(old_dep, 6)
            
            # Determine nivel from tbl_detalle_cargo -> tbl_cargo -> tbl_nivel_cargo
            nivel = 'tecnico'  # default
            cursor.execute("""
                SELECT nc.descripcion 
                FROM tbl_detalle_cargo dc
                JOIN tbl_cargo c ON c.id = dc.id_tbl_cargo
                JOIN tbl_nivel_cargo nc ON nc.id = c.id_tbl_nivel_cargo
                WHERE dc.id = (SELECT id_tbl_detalle_cargo FROM responsables WHERE Id_funcionarios = %s AND is_active = 1 ORDER BY Id DESC LIMIT 1)
            """, (old_id,))
            nivel_resp = cursor.fetchone()
            if nivel_resp:
                nivel_map = {
                    'Nivel 1 - Directivo': 'directivo',
                    'Nivel 2 - Asesor': 'asesor',
                    'Nivel 3 - Profesional': 'profesional',
                    'Nivel 4 - Técnico': 'tecnico',
                    'Nivel 5 - Asistencial': 'asistencial',
                    'Nivel 6 - Contratista': 'tecnico',
                }
                nivel = nivel_map.get(nivel_resp[0], 'tecnico')
            
            # Determine naturaleza
            naturaleza = 'carrera_administrativa'
            cursor.execute("""
                SELECT nn.descripcion 
                FROM tbl_detalle_cargo dc
                JOIN tbl_cargo c ON c.id = dc.id_tbl_cargo
                JOIN tbl_naturaleza_cargo nn ON nn.id = c.id_tbl_naturaleza_cargo
                WHERE dc.id = (SELECT id_tbl_detalle_cargo FROM responsables WHERE Id_funcionarios = %s AND is_active = 1 ORDER BY Id DESC LIMIT 1)
            """, (old_id,))
            nat_resp = cursor.fetchone()
            if nat_resp:
                nat_map = {
                    'Carrera Administrativa': 'carrera_administrativa',
                    'Libre Nombramiento': 'libre_nombramiento',
                    'Planta Temporal': 'libre_nombramiento',
                    'Contratista': 'libre_nombramiento',
                    'Otro': 'libre_nombramiento',
                }
                naturaleza = nat_map.get(nat_resp[0], 'carrera_administrativa')
            
            # Build insert (no fecha_nacimiento, no direccion columns in usuarios)
            sql = """
                INSERT INTO usuarios (
                    documento, tipo_documento, primer_nombre, segundo_nombre,
                    primer_apellido, segundo_apellido, email, telefono1,
                    password_hash, estado,
                    entidad_id, dependencia_id, es_contratista, nivel,
                    naturaleza, tipo_nombramiento, denominacion_empleo,
                    codigo_empleo, grado_empleo, fecha_posesion,
                    proposito_principal_empleo, debe_cambiar_password
                ) VALUES (
                    %s, 'CC', %s, %s, %s, %s, %s, %s, %s, %s,
                    1, %s, %s, %s, %s, 'hecho_en_carrera', %s,
                    NULL, NULL, %s, NULL, 1
                )
            """

            params = (
                cedula, pn, sn, pa, sa, email, telefono,
                PASSWORD_HASH,
                'activo' if is_active == 1 else 'inactivo',
                dep_id, 0 if naturaleza != 'libre_nombramiento' else 1,
                nivel, naturaleza,
                nombre_completo,  # denominacion_empleo
                fecha_nac  # fecha_posesion approx
            )
            
            cursor.execute(sql, params)
            inserted += 1
            
            if inserted % 50 == 0:
                conn.commit()
                print(f"  Inserted {inserted}...")
                
        except Exception as e:
            print(f"Error inserting {cedula}: {e}")
            skipped += 1
            continue
    
    conn.commit()
    cursor.close()
    conn.close()
    
    print(f"\nDone! Inserted: {inserted}, Skipped: {skipped}")

if __name__ == '__main__':
    migrate()