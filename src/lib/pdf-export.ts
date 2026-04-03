import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

export const exportQuoteToPDF = (quote: any, client: any, items: any[]) => {
  const doc = new jsPDF()

  doc.setFontSize(20)
  doc.text("견적서", 105, 20, { align: "center" })

  doc.setFontSize(10)
  doc.text(`문서번호: ${quote.documentNumber}`, 20, 35)
  doc.text(`날짜: ${quote.issueDate}`, 20, 42)
  doc.text(`유효기간: ${quote.validUntil}`, 20, 49)

  doc.text("거래처 정보", 20, 65)
  doc.setFontSize(9)
  doc.text(`상호: ${client?.name || "미지정"}`, 20, 72)
  doc.text(`사업자번호: ${client?.businessNumber || "-"}`, 20, 78)
  doc.text(`대표자: ${client?.ownerName || "-"}`, 20, 84)
  doc.text(`연락처: ${client?.phone || "-"}`, 20, 90)
  doc.text(`주소: ${client?.address || "-"}`, 20, 96)

  const tableData = items.map((item, index) => [
    index + 1,
    item.description,
    item.quantity.toLocaleString(),
    item.unitPrice.toLocaleString(),
    item.amount.toLocaleString(),
  ])

  autoTable(doc, {
    startY: 105,
    head: [["No", "품목", "수량", "단가", "금액"]],
    body: tableData,
    foot: [
      ["", "", "", "합계", quote.totalAmount.toLocaleString()],
      ["", "", "", "세금", quote.taxAmount.toLocaleString()],
      ["", "", "", "총액", (quote.totalAmount + quote.taxAmount).toLocaleString()],
    ],
    theme: "striped",
    headStyles: { fillColor: [66, 66, 66] },
  })

  const finalY = (doc as any).lastAutoTable.finalY || 150

  if (quote.terms) {
    doc.text("결제조건", 20, finalY + 15)
    doc.setFontSize(8)
    doc.text(quote.terms, 20, finalY + 22)
  }

  if (quote.memo) {
    doc.text("메모", 20, finalY + 35)
    doc.setFontSize(8)
    doc.text(quote.memo, 20, finalY + 42)
  }

  doc.save(`${quote.documentNumber}.pdf`)
}

export const exportInvoiceToPDF = (invoice: any, client: any, items: any[]) => {
  const doc = new jsPDF()

  doc.setFontSize(20)
  doc.text("거래명세서", 105, 20, { align: "center" })

  doc.setFontSize(10)
  doc.text(`문서번호: ${invoice.documentNumber}`, 20, 35)
  doc.text(`발행일: ${invoice.issueDate}`, 20, 42)
  doc.text(`지불기한: ${invoice.dueDate}`, 20, 49)

  doc.text("거래처 정보", 20, 65)
  doc.setFontSize(9)
  doc.text(`상호: ${client?.name || "미지정"}`, 20, 72)
  doc.text(`사업자번호: ${client?.businessNumber || "-"}`, 20, 78)
  doc.text(`대표자: ${client?.ownerName || "-"}`, 20, 84)
  doc.text(`연락처: ${client?.phone || "-"}`, 20, 90)
  doc.text(`주소: ${client?.address || "-"}`, 20, 96)

  const tableData = items.map((item, index) => [
    index + 1,
    item.description,
    item.quantity.toLocaleString(),
    item.unitPrice.toLocaleString(),
    item.amount.toLocaleString(),
  ])

  autoTable(doc, {
    startY: 105,
    head: [["No", "품목", "수량", "단가", "금액"]],
    body: tableData,
    foot: [
      ["", "", "", "합계", invoice.totalAmount.toLocaleString()],
      ["", "", "", "세금", invoice.taxAmount.toLocaleString()],
      ["", "", "", "총액", (invoice.totalAmount + invoice.taxAmount).toLocaleString()],
    ],
    theme: "striped",
    headStyles: { fillColor: [66, 66, 66] },
  })

  const finalY = (doc as any).lastAutoTable.finalY || 150

  if (invoice.memo) {
    doc.text("메모", 20, finalY + 15)
    doc.setFontSize(8)
    doc.text(invoice.memo, 20, finalY + 22)
  }

  doc.save(`${invoice.documentNumber}.pdf`)
}

export const exportTaxInvoiceToPDF = (taxInvoice: any, client: any, items: any[]) => {
  const doc = new jsPDF()

  doc.setFontSize(20)
  doc.text("세금계산서", 105, 20, { align: "center" })

  doc.setFontSize(10)
  doc.text(`문서번호: ${taxInvoice.documentNumber}`, 20, 35)
  doc.text(`공급일: ${taxInvoice.supplyDate}`, 20, 42)
  doc.text(`발행일: ${taxInvoice.issueDate}`, 20, 49)

  doc.text("공급자 정보", 20, 65)
  doc.setFontSize(9)
  doc.text(`상호: 코어넥스트`, 20, 72)
  doc.text(`사업자번호: 000-00-00000`, 20, 78)

  doc.text("공급받는자 정보", 20, 90)
  doc.text(`상호: ${client?.name || "미지정"}`, 20, 97)
  doc.text(`사업자번호: ${client?.businessNumber || "-"}`, 20, 103)
  doc.text(`대표자: ${client?.ownerName || "-"}`, 20, 109)
  doc.text(`연락처: ${client?.phone || "-"}`, 20, 115)
  doc.text(`주소: ${client?.address || "-"}`, 20, 121)

  const tableData = items.map((item, index) => [
    index + 1,
    item.description,
    item.quantity.toLocaleString(),
    item.unitPrice.toLocaleString(),
    item.taxableAmount?.toLocaleString() || item.amount.toLocaleString(),
    item.taxAmount?.toLocaleString() || Math.round(item.amount * 0.1).toLocaleString(),
    item.amount.toLocaleString(),
  ])

  autoTable(doc, {
    startY: 130,
    head: [["No", "품목", "수량", "단가", "공급가액", "세액", "합계"]],
    body: tableData,
    foot: [
      [
        "",
        "",
        "",
        "",
        taxInvoice.taxableAmount?.toLocaleString() || taxInvoice.totalAmount.toLocaleString(),
        taxInvoice.taxAmount.toLocaleString(),
        (taxInvoice.totalAmount + taxInvoice.taxAmount).toLocaleString(),
      ],
    ],
    theme: "striped",
    headStyles: { fillColor: [66, 66, 66] },
  })

  const finalY = (doc as any).lastAutoTable.finalY || 180

  doc.text(`현금: ${taxInvoice.cash?.toLocaleString() || 0}`, 20, finalY + 15)
  doc.text(`카드: ${((taxInvoice.totalAmount + taxInvoice.taxAmount) - (taxInvoice.cash || 0)).toLocaleString()}`, 20, finalY + 22)

  doc.save(`${taxInvoice.documentNumber}.pdf`)
}

export const exportContractToPDF = (contract: any, client: any, items: any[]) => {
  const doc = new jsPDF()

  doc.setFontSize(20)
  doc.text("계약서", 105, 20, { align: "center" })

  doc.setFontSize(10)
  doc.text(`문서번호: ${contract.documentNumber}`, 20, 35)
  doc.text(`계약일: ${contract.contractDate}`, 20, 42)
  doc.text(`계약기간: ${contract.startDate} ~ ${contract.endDate}`, 20, 49)

  doc.text("계약당사자", 20, 65)
  doc.setFontSize(9)
  doc.text(`갑: 코어넥스트`, 20, 72)
  doc.text(`을: ${client?.name || "미지정"}`, 20, 79)
  doc.text(`사업자번호: ${client?.businessNumber || "-"}`, 20, 86)
  doc.text(`대표자: ${client?.ownerName || "-"}`, 20, 93)
  doc.text(`주소: ${client?.address || "-"}`, 20, 100)

  if (items.length > 0) {
    const tableData = items.map((item, index) => [
      index + 1,
      item.description,
      item.quantity.toLocaleString(),
      item.unitPrice.toLocaleString(),
      item.amount.toLocaleString(),
    ])

    autoTable(doc, {
      startY: 110,
      head: [["No", "계약내용", "수량", "단가", "금액"]],
      body: tableData,
      theme: "striped",
      headStyles: { fillColor: [66, 66, 66] },
    })
  }

  const finalY = items.length > 0 ? (doc as any).lastAutoTable.finalY + 15 : 115

  if (contract.terms) {
    doc.text("계약조건", 20, finalY)
    doc.setFontSize(9)
    doc.text(contract.terms, 20, finalY + 7)
  }

  if (contract.memo) {
    doc.text("메모", 20, finalY + 25)
    doc.setFontSize(8)
    doc.text(contract.memo, 20, finalY + 32)
  }

  doc.save(`${contract.documentNumber}.pdf`)
}
