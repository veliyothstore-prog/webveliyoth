import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generateProfessionalPDF = async (items, customerData, isPreview = false) => {
  try {
    const doc = new jsPDF();
    const isMulti = Array.isArray(items);
    const productList = isMulti ? items : [items];
    const ref = customerData.reference || 'VT-TEMP';

    // Función auxiliar para cargar imágenes
    const loadImage = (url) => {
      return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.src = url;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);
          resolve(canvas.toDataURL('image/jpeg', 0.8));
        };
        img.onerror = () => resolve(null);
      });
    };

    // Cabecera Corporativa
    doc.setFillColor(255, 222, 0); // Amarillo Veliyoth
    doc.rect(0, 0, 140, 40, 'F');
    doc.setFillColor(30, 41, 59); // Azul Oscuro
    doc.rect(140, 0, 70, 40, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(28);
    doc.setTextColor(0, 0, 0);
    doc.text('VELIYOTH STORE', 10, 20);
    doc.setFontSize(10);
    doc.text('TECNOLOGÍA Y SEGURIDAD ELECTRÓNICA', 10, 28);
    doc.setFont('helvetica', 'normal');
    doc.text('www.veliyoth.store | Lima, Perú', 10, 34);

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.text('PRESUPUESTO', 175, 15, { align: 'center' });
    doc.setFontSize(9);
    doc.text(`REF: ${ref}`, 175, 22, { align: 'center' });
    doc.text(`FECHA: ${new Date().toLocaleDateString()}`, 175, 28, { align: 'center' });

    // Datos del Cliente
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('DATOS DEL CLIENTE:', 10, 55);
    doc.setDrawColor(200, 200, 200);
    doc.line(10, 57, 100, 57);

    doc.setFontSize(13);
    doc.text(customerData.name?.toUpperCase() || 'CLIENTE', 10, 65);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text(`Teléfono: ${customerData.phone || 'No especificado'}`, 10, 72);

    // Tabla de Productos
    const tableBody = productList.map((item, idx) => {
      let desc = item.title.toUpperCase();
      let rawDescription = item.details;
      let showPdfDetails = false;

      // Extract rawDescription and showPdfDetails if it's an object
      while (typeof rawDescription === 'object' && rawDescription !== null) {
        showPdfDetails = showPdfDetails || rawDescription.showPdfDetails === true;
        rawDescription = rawDescription.description || '';
      }

      // Check if it's a kit or has the flag
      const isKit = item.title.toUpperCase().includes('KIT');
      
      if ((isKit || showPdfDetails) && rawDescription && rawDescription.trim().length > 0) {
         desc += `\n\n${rawDescription.trim()}`;
      }

      return [
        idx + 1,
        desc,
        item.quantity || 1,
        `S/ ${Number(item.price).toFixed(2)}`,
        `S/ ${(Number(item.price) * (item.quantity || 1)).toFixed(2)}`
      ];
    });

    const total = productList.reduce((acc, item) => acc + (Number(item.price) * (item.quantity || 1)), 0);

    autoTable(doc, {
      startY: 85,
      head: [['ITEM', 'DESCRIPCIÓN DEL PRODUCTO', 'CANT', 'P. UNIT', 'SUBTOTAL']],
      body: tableBody,
      theme: 'grid',
      headStyles: { fillColor: [30, 41, 59], fontSize: 9, halign: 'center', textColor: [255, 222, 0] },
      styles: { fontSize: 8, cellPadding: 4, valign: 'middle' },
      columnStyles: { 
        0: { halign: 'center', width: 12 }, 
        1: { width: 95 }, 
        2: { halign: 'center', width: 15 },
        3: { halign: 'right', width: 25 },
        4: { halign: 'right', width: 30 }
      }
    });

    const tableFinalY = doc.lastAutoTable.finalY || 150;

    // Cuadro de Resumen
    doc.setFillColor(30, 41, 59);
    doc.roundedRect(140, tableFinalY + 10, 60, 25, 4, 4, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.text('TOTAL A PAGAR:', 145, tableFinalY + 18);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(`S/ ${Number(total).toFixed(2)}`, 170, tableFinalY + 28, { align: 'center' });

    // Condiciones comerciales
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('CONDICIONES COMERCIALES:', 10, tableFinalY + 45);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    const conditions = customerData.commercialConditions ? customerData.commercialConditions.split('\n') : [
      'Forma de pago: 70% de adelanto al aceptar la cotización y 30% al finalizar la instalación.',
      'Plazo de entrega e instalación: Dentro de 2 días hábiles luego del adelanto.',
      'Validez Proforma: 2 días calendario',
      'Garantía: 12 meses por defecto de fábrica y 3 meses por instalación.'
    ];
    doc.text(conditions, 15, tableFinalY + 52);

    // Firma / Sello
    doc.setDrawColor(200, 200, 200);
    doc.line(140, tableFinalY + 80, 190, tableFinalY + 80);
    doc.setFontSize(8);
    doc.text('DEPARTAMENTO DE VENTAS', 165, tableFinalY + 85, { align: 'center' });

    // Pie de página
    doc.setFillColor(255, 222, 0);
    doc.rect(0, 285, 210, 12, 'F');
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(8);
    doc.text('Gracias por confiar en VeliYoth Store. Su seguridad es nuestra prioridad.', 105, 292, { align: 'center' });

    const outputType = (customerData && customerData.output) || (isPreview === true ? 'bloburl' : 'save');
    
    console.log('PDF Output Type:', outputType, 'Ref:', ref);

    if (outputType === 'blob') {
      return doc.output('blob');
    } else if (outputType === 'bloburl') {
      return doc.output('bloburl');
    } else {
      doc.save(`Cotizacion_Veliyoth_${ref}.pdf`);
      return true;
    }
  } catch (error) {
    console.error('Error generating PDF:', error);
    return false;
  }
};
