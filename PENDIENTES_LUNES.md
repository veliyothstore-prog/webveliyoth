# 📅 Pendientes para el Lunes - Veliyoth Admin

**ID de Conversación**: `4e3e0d48-2338-40f6-a1e3-75b852ccf365`
**Estado Actual**: Desplegado con éxito en [https://webveliyoth.vercel.app](https://webveliyoth.vercel.app). El sistema es estable y la gestión de productos está corregida.

---

## 🚀 Tareas Pendientes:

1. **Gestión de Stock para Pedidos MULTI**:
   - Implementar el descuento de stock en bucle cuando se acepta una cotización que contiene múltiples productos (actualmente solo descuenta pedidos simples).

2. **Integración con WhatsApp**:
   - Añadir botones en las tablas de Pedidos y Cotizaciones para enviar el enlace del PDF o mensajes de confirmación directamente al cliente.

3. **Filtros de Búsqueda Avanzados**:
   - Asegurar que el filtro de búsqueda (`searchTerm`) siempre incluya el nombre del cliente recuperado desde `quoteDetails`.

4. **Optimización Móvil Final**:
   - Revisar el espaciado y tamaños de fuente en los modales de edición para dispositivos de gama baja/pantalla pequeña.

5. **Re-implementación de Estadísticas (Segura)**:
   - Evaluar una forma de mostrar el "Top Productos" y "Estados" sin usar librerías externas pesadas o procesos que puedan bloquear el renderizado si los datos están incompletos.

---

## 🛠️ Notas Técnicas:
- El archivo `vercel.json` ya está configurado para manejar el ruteo SPA.
- Se eliminó `allQuoteItems` y `fetchAllQuoteItems` para evitar inestabilidad.
- El panel de administración es accesible y funcional.

¡Nos vemos el lunes!
