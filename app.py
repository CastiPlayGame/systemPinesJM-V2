import mysql.connector
import json
from datetime import datetime

# --- CONFIGURACIÓN DE LA LÓGICA ---
# Ajusta estos umbrales según tu estrategia de stock.
LOW_STOCK_THRESHOLD = 5
MINIMUM_SOURCE_STOCK = 1

# --- Configuración de la Base de Datos ---
DB_CONFIG = {
    'host': "192.168.0.158",
    'user': "javi",
    'password': "javi123456",
    'database': "pinesjmv2",
    'port': 3306
}

def generar_reporte_consolidado():
    """
    Analiza desequilibrios de stock y guarda todas las acciones para un mismo
    producto en un único bloque consolidado dentro del reporte Markdown.
    """
    timestamp = datetime.now().strftime("%Y-%m-%d_%H%MS")
    filename = f"reporte_consolidado_stock_{timestamp}.md"

    connection = None
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        cursor = connection.cursor()

        query = "SELECT id, quantity FROM items"
        cursor.execute(query)
        items = cursor.fetchall()
        
        print("Iniciando análisis para generar reporte consolidado...")
        
        total_actions_found = 0
        
        with open(filename, 'w', encoding='utf-8') as report_file:
            # Escribir la cabecera del reporte
            report_file.write(f"# Reporte Consolidado de Acciones de Stock\n\n")
            report_file.write(f"**Generado el:** {datetime.now().strftime('%d/%m/%Y a las %H:%M:%S')}\n\n")
            report_file.write(f"**Criterios del Análisis:**\n")
            report_file.write(f"- **Bajo Stock si:** Cantidad de paquetes ≤ `{LOW_STOCK_THRESHOLD}`\n")
            report_file.write(f"- **Fuente Viable si:** Cantidad de paquetes ≥ `{MINIMUM_SOURCE_STOCK}`\n\n")
            report_file.write("---\n\n")

            for (item_id, quantity_json) in items:
                if not quantity_json: continue

                try:
                    quantity_data = json.loads(quantity_json)
                    primer_item_stock = next(iter(quantity_data.values()), None)
                    if not primer_item_stock or 'Packets' not in primer_item_stock: continue
                    
                    packets = primer_item_stock.get('Packets', {})
                    if not packets: continue
                    
                    # --- LÓGICA DE CONSOLIDACIÓN ---
                    # 1. Crear una lista para guardar todas las acciones de ESTE producto.
                    acciones_para_este_producto = []

                    # Ordenamos las claves para analizar de menor a mayor (ej. 25 antes que 50)
                    claves_paquetes_ordenadas = sorted(packets.keys(), key=lambda k: int(k))

                    for target_size_str in claves_paquetes_ordenadas:
                        target_quantity = packets[target_size_str]
                        
                        if target_quantity <= LOW_STOCK_THRESHOLD:
                            target_size = int(target_size_str)
                            # Buscamos una solución para este problema
                            for source_size_str in claves_paquetes_ordenadas:
                                if target_size_str == source_size_str: continue
                                
                                source_size = int(source_size_str)
                                source_quantity = packets[source_size_str]
                                
                                if (source_size > target_size and 
                                    source_size % target_size == 0 and 
                                    source_quantity >= MINIMUM_SOURCE_STOCK):
                                    
                                    # 2. Encontramos una solución. La formateamos y la añadimos a nuestra lista.
                                    accion_texto = (
                                        f"> **Problema:** Stock bajo en paquetes de `{target_size}` (quedan {target_quantity}). "
                                        f"**Solución:** Convertir 1 paquete de `{source_size}` para generar **{source_size // target_size}** nuevos paquetes."
                                    )
                                    acciones_para_este_producto.append(accion_texto)
                                    total_actions_found += 1
                                    # Rompemos para no buscar más soluciones para ESTE problema
                                    break
                    
                    # 3. Después de revisar todos los posibles problemas, si encontramos acciones, escribimos el bloque.
                    if acciones_para_este_producto:
                        report_file.write(f"## Producto ID: `{item_id}`\n\n")
                        
                        report_file.write(f"**Inventario Actual:**\n")
                        for size_str in claves_paquetes_ordenadas:
                            report_file.write(f"- Paquetes de `{size_str}`: **{packets[size_str]}** unidades\n")
                        report_file.write("\n")
                        
                        report_file.write(f"**Acciones Recomendadas:**\n\n")
                        for accion in acciones_para_este_producto:
                            report_file.write(f"{accion}\n")
                        report_file.write("\n---\n\n")

                except (json.JSONDecodeError, TypeError, ValueError):
                    continue

            if total_actions_found == 0:
                report_file.write("### No se encontraron acciones recomendadas con los criterios actuales.\n")
        
        print("-" * 50)
        if total_actions_found > 0:
            print(f"✅ ¡Reporte completado! Se generaron {total_actions_found} acciones recomendadas.")
            print(f"   El archivo ha sido guardado como: {filename}")
        else:
            print("ℹ️  Análisis completado. No se encontraron desequilibrios de stock.")
            print(f"   Se ha generado un reporte vacío: {filename}")
        print("-" * 50)

    except mysql.connector.Error as err:
        print(f"Error de base de datos: {err}")
    finally:
        if connection and connection.is_connected():
            cursor.close()
            connection.close()

if __name__ == "__main__":
    generar_reporte_consolidado()