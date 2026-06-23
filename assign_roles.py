#!/usr/bin/env python3
"""Assign roles to migrated users based on responsable/cargo data"""

import mysql.connector

def assign_roles():
    conn = mysql.connector.connect(
        host='localhost',
        user='edl_user',
        password='Edl2026!Secure',
        database='edl_carepa',
        unix_socket='/data/data/com.termux/files/usr/var/run/mysqld.sock'
    )
    cursor = conn.cursor()
    
    # Get role IDs
    cursor.execute("SELECT id, codigo FROM roles")
    role_map = {codigo: id for id, codigo in cursor.fetchall()}
    print("Role IDs:", role_map)
    
    # Get users with their documento and dependencia
    cursor.execute("""
        SELECT u.id, u.documento, u.dependencia_id, u.nivel
        FROM usuarios u
        WHERE u.id > 1
    """)
    users = cursor.fetchall()
    print(f"Found {len(users)} users to assign roles")
    
    # For each user, find their responsable record and determine role
    assigned = 0
    for user_id, documento, dep_id, nivel in users:
        # Find responsable record for this funcionario (by documento matching old funcionarios)
        cursor.execute("""
            SELECT r.is_active, r.id_tbl_detalle_cargo,
                   c.id_tbl_nivel_cargo, nc.descripcion as nivel_desc
            FROM responsables r
            LEFT JOIN tbl_detalle_cargo dc ON dc.id = r.id_tbl_detalle_cargo
            LEFT JOIN tbl_cargo c ON c.id = dc.id_tbl_cargo
            LEFT JOIN tbl_nivel_cargo nc ON nc.id = c.id_tbl_nivel_cargo
            LEFT JOIN funcionarios f ON f.Id = r.Id_funcionarios
            WHERE f.Cedula = %s AND r.is_active = 1
            ORDER BY r.Id DESC LIMIT 1
        """, (documento,))
        
        resp = cursor.fetchone()
        role_codigo = 'evaluado'  # default
        
        if resp:
            is_active, det_cargo_id, nivel_cargo_id, nivel_desc = resp
            if nivel_desc:
                if 'Nivel 1' in nivel_desc or 'Nivel 2' in nivel_desc:
                    role_codigo = 'evaluador'
                else:
                    role_codigo = 'evaluado'
            elif nivel:
                # Fallback to nivel in usuarios table
                if nivel in ('directivo', 'asesor'):
                    role_codigo = 'evaluador'
                else:
                    role_codigo = 'evaluado'
        
        # Assign role
        if role_codigo in role_map:
            role_id = role_map[role_codigo]
            cursor.execute("""
                INSERT IGNORE INTO usuario_rol (usuario_id, rol_id) VALUES (%s, %s)
            """, (user_id, role_id))
            assigned += 1
    
    conn.commit()
    print(f"Assigned roles to {assigned} users")
    
    # Verify
    cursor.execute("""
        SELECT u.documento, u.primer_nombre, u.primer_apellido, 
               GROUP_CONCAT(r.codigo) as roles, u.nivel
        FROM usuarios u
        LEFT JOIN usuario_rol ur ON ur.usuario_id = u.id
        LEFT JOIN roles r ON r.id = ur.rol_id
        WHERE u.id > 1
        GROUP BY u.id
        ORDER BY u.id
    """)
    
    for row in cursor.fetchall():
        print(f"  {row[0]} - {row[1]} {row[2]}: {row[3]} (nivel: {row[4]})")
    
    cursor.close()
    conn.close()

if __name__ == '__main__':
    assign_roles()