// src/services/pdf.service.js
import PDFDocument from 'pdfkit'

export const generateDeliveryNotePdf = (deliveryNote, signatureUrl) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 })
    const chunks = []

    doc.on('data', chunk => chunks.push(chunk))
    doc.on('end', () => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)

    doc.fontSize(20).text('Albarán', { align: 'center' })
    doc.moveDown()

    doc.fontSize(12).text(`Cliente: ${deliveryNote.client?.name ?? ''} (${deliveryNote.client?.cif ?? ''})`)
    doc.text(`Proyecto: ${deliveryNote.project?.name ?? ''} (${deliveryNote.project?.projectCode ?? ''})`)
    doc.text(`Formato: ${deliveryNote.format}`)
    doc.text(`Fecha de trabajo: ${new Date(deliveryNote.workDate).toLocaleDateString('es-ES')}`)

    if (deliveryNote.description) {
      doc.moveDown().text(`Descripción: ${deliveryNote.description}`)
    }

    if (deliveryNote.format === 'material') {
      doc.moveDown()
      doc.text(`Material: ${deliveryNote.material}`)
      doc.text(`Cantidad: ${deliveryNote.quantity} ${deliveryNote.unit}`)
    }

    if (deliveryNote.format === 'hours') {
      doc.moveDown()
      if (deliveryNote.hours) doc.text(`Horas totales: ${deliveryNote.hours}`)
      if (deliveryNote.workers?.length > 0) {
        doc.text('Trabajadores:')
        deliveryNote.workers.forEach(w => {
          doc.text(`  - ${w.name}: ${w.hours}h`)
        })
      }
    }

    if (signatureUrl) {
      doc.moveDown().text('Firma:')
      doc.image(signatureUrl, { width: 200 })
    }

    doc.end()
  })
}