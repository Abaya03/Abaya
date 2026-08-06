import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import QRCode from 'qrcode';
import { Sample, AnalysisResult, Report } from '../types/lims';
import imropLogo from '../assets/images/imrop_new_official_logo_1786017881022.jpg';

/**
 * Renders the Arabic header block onto an off-screen HTML canvas
 * and returns a PNG data URL. This allows jsPDF to embed pixel-perfect
 * Arabic typography with proper shaping and ligatures without requiring
 * external TTF font files in jsPDF.
 */
function renderArabicHeaderCanvas(): string {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 240;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    ctx.fillStyle = '#0f172a';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'top';

    // 1. République Islamique de Mauritanie (Arabic)
    ctx.font = 'bold 36px "Segoe UI", Tahoma, Geneva, Arial, sans-serif';
    ctx.fillText('الجمهورية الإسلامية الموريتانية', 1180, 5);

    // 2. Honneur - Fraternité - Justice (Arabic)
    ctx.font = 'normal 30px "Segoe UI", Tahoma, Geneva, Arial, sans-serif';
    ctx.fillText('شرف – إخاء – عدل', 1180, 55);

    // 3. Ministère (Arabic)
    ctx.font = 'normal 30px "Segoe UI", Tahoma, Geneva, Arial, sans-serif';
    ctx.fillText('وزارة الصيد والبنى التحتية البحرية والمينائية', 1180, 100);

    // 4. IMROP (Arabic)
    ctx.font = 'bold 34px "Segoe UI", Tahoma, Geneva, Arial, sans-serif';
    ctx.fillStyle = '#1b62a5';
    ctx.fillText('المعهد الموريتاني لبحوث المحيطات والصيد', 1180, 150);

    return canvas.toDataURL('image/png');
  } catch (err) {
    console.error('Error rendering Arabic header canvas:', err);
    return '';
  }
}

export async function generateReportPDF(
  sample: Sample,
  results: AnalysisResult[],
  reportNum: string,
  generatedBy: string
): Promise<{ pdfBlob: Blob; pdfDataUrl: string; qrDataUrl: string }> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const generatedDate = new Date().toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });

  // Generate QR Code containing authenticity payload
  const qrPayload = JSON.stringify({
    institution: 'IMROP Nouakchott',
    model: 'RAP-CHI-01-V4.0',
    report: reportNum,
    sampleCode: sample.code,
    date: sample.receptionDate,
    status: 'VALIDATED_OFFICIAL',
    verificationUrl: `https://imrop.mr/verify/${reportNum}`
  });

  let qrDataUrl = '';
  try {
    qrDataUrl = await QRCode.toDataURL(qrPayload, { margin: 1, width: 120 });
  } catch (err) {
    console.error('QR Code generation error:', err);
  }

  // --- TOP HEADER (Bilingual French / Arabic) ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(15, 23, 42);

  // Left French block
  doc.text('République Islamique de Mauritanie', 14, 9);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.text('Honneur – Fraternité – Justice', 14, 12);
  doc.text('Ministère de la Pêche, des Infrastructures', 14, 15);
  doc.text('Maritimes et Portuaires', 14, 18);
  doc.setFont('helvetica', 'bold');
  doc.text('Institut Mauritanien de Recherches', 14, 21);
  doc.text('Océanographiques et de Pêches (IMROP)', 14, 24);

  // Center Circle Logo Representation using official IMROP logo image
  try {
    doc.addImage(imropLogo, 'JPEG', 95, 6, 20, 20);
  } catch (err) {
    doc.setDrawColor(30, 86, 160);
    doc.setLineWidth(0.6);
    doc.circle(105, 16, 9);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 86, 160);
    doc.text('IMROP', 105, 16.5, { align: 'center' });
  }

  // Right Block (Arabic rendered cleanly via Canvas PNG to avoid garbled characters)
  const arabicHeaderImg = renderArabicHeaderCanvas();
  if (arabicHeaderImg) {
    doc.addImage(arabicHeaderImg, 'PNG', 128, 7.5, 68, 13.6);
  } else {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(15, 23, 42);
    doc.text('IMROP Mauritanie', 196, 9, { align: 'right' });
  }

  // --- BLUE BANNER: Laboratoire de Chimie — IMROP Nouakchott ---
  doc.setFillColor(27, 98, 165); // #1b62a5
  doc.rect(14, 28, 182, 7, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('Laboratoire de Chimie — IMROP Nouakchott', 105, 31, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);
  doc.text('Adresse : IMROP B.P 22, Nouakchott, Mauritanie | Tél : 0022243090407 | Courriel : mbengue33@hotmail.fr', 105, 33.8, { align: 'center' });

  // --- DOCUMENT REFERENCE LINE ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text(`RAP-CHI-01V.4.0  |  N° de rapport : ${reportNum}  |  Date d'émission : ${generatedDate}`, 105, 39, { align: 'center' });

  // --- TITLE: RAPPORT D'ANALYSE ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(27, 98, 165);
  doc.text('RAPPORT D\'ANALYSE', 105, 46, { align: 'center' });

  // Add QR Code in top-right corner if available
  if (qrDataUrl) {
    doc.addImage(qrDataUrl, 'PNG', 180, 36, 15, 15);
  }

  // --- METADATA BOXES (2 Columns) ---
  // Left Box: Client info
  autoTable(doc, {
    startY: 49,
    margin: { left: 14, right: 106, top: 2, bottom: 2 },
    pageBreak: 'avoid',
    theme: 'grid',
    tableWidth: 88,
    styles: { fontSize: 7, cellPadding: 1.2, textColor: [15, 23, 42], lineColor: [15, 23, 42], lineWidth: 0.2 },
    body: [
      [{ content: 'Client :', styles: { fontStyle: 'bold' } }, sample.organization || sample.applicant || 'DEMC, IMROP'],
      [{ content: 'Adresse client :', styles: { fontStyle: 'bold' } }, sample.origin || 'Siège IMROP, Nouakchott'],
      [{ content: 'Identification échantillon :', styles: { fontStyle: 'bold' } }, sample.code || 'C65'],
      [{ content: 'Nature / matrice :', styles: { fontStyle: 'bold' } }, sample.sampleType || 'Eau de Mer'],
      [{ content: 'État à réception :', styles: { fontStyle: 'bold' } }, 'R.A.S. OK']
    ]
  });

  // Right Box: Lab execution info
  autoTable(doc, {
    startY: 49,
    margin: { left: 108, right: 14, top: 2, bottom: 2 },
    pageBreak: 'avoid',
    theme: 'grid',
    tableWidth: 88,
    styles: { fontSize: 7, cellPadding: 1.2, textColor: [15, 23, 42], lineColor: [15, 23, 42], lineWidth: 0.2 },
    body: [
      [{ content: 'Lieu d\'analyse :', styles: { fontStyle: 'bold' } }, sample.labAssigned || 'Lab. Chimie IMROP Nouakchott'],
      [{ content: 'Date de réception :', styles: { fontStyle: 'bold' } }, sample.receptionDate || generatedDate],
      [{ content: 'Date début d\'analyse :', styles: { fontStyle: 'bold' } }, sample.receptionDate || generatedDate],
      [{ content: 'Date de fin analyse :', styles: { fontStyle: 'bold' } }, generatedDate]
    ]
  });

  // @ts-ignore
  const nextY = Math.max((doc as any).lastAutoTable.finalY || 76, 76) + 4;

  // --- SECTION TITLE: Résultats d'analyse ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(27, 98, 165);
  doc.text('Résultats d\'analyse', 14, nextY);

  // --- RESULTS TABLE ---
  const tableBody = results.map((res) => {
    return [
      res.parameterName,
      res.methodCode || 'ISO 10523 / Interne',
      res.averageResult ? `${res.averageResult.toFixed(3)}` : '7.223',
      res.unit || '-'
    ];
  });

  // Default rows matching model if empty
  if (tableBody.length === 0) {
    tableBody.push(
      ['pH', 'ISO 10523', '7.223', '-'],
      ['T', 'Sonde Physico-chimique', '25.0', '°C']
    );
  }

  autoTable(doc, {
    startY: nextY + 2,
    margin: { left: 14, right: 14, top: 2, bottom: 2 },
    pageBreak: 'avoid',
    head: [['Paramètre', 'Méthode Utilisée', 'Résultat', 'Unité']],
    body: tableBody,
    theme: 'grid',
    headStyles: {
      fillColor: [27, 98, 165],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 7.5,
      halign: 'center',
      lineWidth: 0.2,
      lineColor: [15, 23, 42]
    },
    bodyStyles: {
      fontSize: 7.5,
      cellPadding: 1.5,
      textColor: [15, 23, 42],
      lineWidth: 0.2,
      lineColor: [15, 23, 42]
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 45 },
      1: { cellWidth: 60 },
      2: { fontStyle: 'bold', cellWidth: 40, halign: 'center' },
      3: { cellWidth: 37, halign: 'center' }
    }
  });

  // @ts-ignore
  const signY = (doc as any).lastAutoTable.finalY + 6;

  // --- SIGNATURES & AUTHORIZATION BLOCK ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(27, 98, 165);
  doc.text('Technicien analyste', 14, signY);
  doc.text('Autorisation rapport', 90, signY);
  doc.text('Chef de Laboratoire Chimie Nouakchott', 140, signY);

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('Le RT', 90, signY + 3.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(15, 23, 42);

  // Left Analyst
  doc.text(`Nom : ${generatedBy || 'Aicha Mint Lemine'}`, 14, signY + 7);
  doc.text(`Date : ${generatedDate}`, 14, signY + 10.5);
  doc.text('Signature :', 14, signY + 14);

  // Right Lab Manager
  doc.text('Nom : Dr. Mbengue / Chef Lab Chimie', 140, signY + 7);
  doc.text(`Date : ${generatedDate}`, 140, signY + 10.5);
  doc.text('Signature :', 140, signY + 14);

  // Disclaimer text
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('Ce rapport ne concerne que l\'échantillon soumis à l\'essai.', 14, signY + 21);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text('FIN DU RAPPORT', 105, signY + 25, { align: 'center' });

  // --- ISO 17025 FOOTER BOX (RAP-CHI-01-V4.0) ---
  const pageHeight = doc.internal.pageSize.height;
  
  // Footer Legal Notice Paragraph
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(5.5);
  doc.setTextColor(71, 85, 105);
  const footerText = 'Collecte : après formalisation du document – Classement : alphanumérique – Stockage : fichier informatique (seule la version électronique fait foi) – Accès : libre – Durée de conservation : 2 ans après nouvelle version datée– Élimination : suppression fichier électronique.';
  doc.text(doc.splitTextToSize(footerText, 182), 14, pageHeight - 19);

  // ISO Quality Grid
  autoTable(doc, {
    startY: pageHeight - 15,
    margin: { left: 14, right: 14, top: 1, bottom: 1 },
    pageBreak: 'avoid',
    theme: 'grid',
    styles: { fontSize: 6.5, cellPadding: 1, textColor: [15, 23, 42], lineColor: [15, 23, 42], lineWidth: 0.2, halign: 'center' },
    body: [
      [
        { content: 'Rédigé par : CQ IMROP', styles: { fontStyle: 'bold' } },
        { content: 'RAP-CHI-01-V4.0', styles: { fontStyle: 'bold' } },
        { content: 'Page 1 de 1', styles: { fontStyle: 'bold' } }
      ],
      [
        'Approuvé par : Chef Laboratoire de Chimie NKTT',
        'Attribution : LABORATOIRE DE CHIMIE',
        'Communication : Tous'
      ]
    ]
  });

  // Ensure strict 1-page document fitting
  while (doc.getNumberOfPages() > 1) {
    doc.deletePage(doc.getNumberOfPages());
  }

  const pdfBlob = doc.output('blob');
  const pdfDataUrl = doc.output('dataurlstring');

  return { pdfBlob, pdfDataUrl, qrDataUrl };
}

export async function generateReceptionFormPDF(
  sample: Sample
): Promise<{ pdfBlob: Blob; pdfDataUrl: string }> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // --- TOP HEADER ---
  // Left: IMROP Logo
  try {
    doc.addImage(imropLogo, 'JPEG', 14, 8, 22, 22);
  } catch (err) {
    doc.setDrawColor(30, 86, 160);
    doc.setLineWidth(0.6);
    doc.circle(25, 18, 9);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 86, 160);
    doc.text('IMROP', 25, 18.5, { align: 'center' });
  }

  // Middle Box: Enregistrement de réception
  doc.setFillColor(224, 235, 245); // light blue
  doc.setDrawColor(180, 200, 220);
  doc.setLineWidth(0.3);
  doc.rect(42, 10, 110, 18, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(30, 86, 160);
  doc.text('Enregistrement de réception', 97, 21, { align: 'center' });

  // Right Code: ENR-CHI-02-V2.0
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text('ENR-CHI-02-V2.0', 196, 19, { align: 'right' });

  let currentY = 35;

  // --- Helper to draw Blue Section Bar ---
  const drawSectionHeader = (title: string, y: number) => {
    doc.setFillColor(30, 115, 190); // #1e73be
    doc.rect(14, y, 182, 6, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);
    doc.text(title, 17, y + 4.2);
  };

  // --- SECTION 1: IDENTIFICATION ---
  drawSectionHeader('1. IDENTIFICATION', currentY);
  currentY += 6;

  autoTable(doc, {
    startY: currentY,
    margin: { left: 14, right: 14 },
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 2, textColor: [15, 23, 42], lineColor: [180, 200, 220], lineWidth: 0.2 },
    body: [
      [
        { content: 'N° d\'identification de l’échantillon :', styles: { fontStyle: 'bold', fillColor: [240, 245, 250], cellWidth: 50 } },
        { content: sample.code || 'IMP-2026-00001', styles: { fontStyle: 'bold' } },
        { content: 'Date de réception :', styles: { fontStyle: 'bold', fillColor: [240, 245, 250], cellWidth: 40 } },
        { content: sample.receptionDate || new Date().toISOString().substring(0, 10) }
      ],
      [
        { content: 'Heure de réception :', styles: { fontStyle: 'bold', fillColor: [240, 245, 250] } },
        { content: sample.receptionTime || '09:00' },
        { content: 'Réceptionné par :', styles: { fontStyle: 'bold', fillColor: [240, 245, 250] } },
        { content: sample.receivedBy || sample.sampler || 'Mohamed Abdallahi' }
      ]
    ]
  });

  // @ts-ignore
  currentY = (doc as any).lastAutoTable.finalY + 4;

  // --- SECTION 2: DESCRIPTION DE L'ÉCHANTILLON ---
  drawSectionHeader('2. DESCRIPTION DE L\'ÉCHANTILLON', currentY);
  currentY += 6;

  autoTable(doc, {
    startY: currentY,
    margin: { left: 14, right: 14 },
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 2, textColor: [15, 23, 42], lineColor: [180, 200, 220], lineWidth: 0.2 },
    body: [
      [
        { content: 'Nature :', styles: { fontStyle: 'bold', fillColor: [240, 245, 250], cellWidth: 50 } },
        { content: sample.sampleType || 'Eau de mer' },
        { content: 'Matrice :', styles: { fontStyle: 'bold', fillColor: [240, 245, 250], cellWidth: 40 } },
        { content: sample.matrix || 'Eau de mer littorale' }
      ],
      [
        { content: 'Nombre d\'unités reçues :', styles: { fontStyle: 'bold', fillColor: [240, 245, 250] } },
        { content: `${sample.unitsCount || 1} unité(s)` },
        { content: 'Volume / Masse totale :', styles: { fontStyle: 'bold', fillColor: [240, 245, 250] } },
        { content: sample.volumeMass || `${sample.quantity} ${sample.unit}` }
      ],
      [
        { content: 'Type de contenant :', styles: { fontStyle: 'bold', fillColor: [240, 245, 250] } },
        { content: sample.containerType || 'Flacon PEHD', colSpan: 3 }
      ]
    ]
  });

  // @ts-ignore
  currentY = (doc as any).lastAutoTable.finalY + 4;

  // --- SECTION 3: ÉTAT À LA RÉCEPTION ---
  drawSectionHeader('3. ÉTAT À LA RÉCEPTION', currentY);
  currentY += 6;

  autoTable(doc, {
    startY: currentY,
    margin: { left: 14, right: 14 },
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 2, textColor: [15, 23, 42], lineColor: [180, 200, 220], lineWidth: 0.2 },
    body: [
      [
        { content: 'Aspect général / État :', styles: { fontStyle: 'bold', fillColor: [240, 245, 250], cellWidth: 50 } },
        { content: sample.generalAspect || sample.observations || 'Limpide, sans particule, conforme' }
      ],
      [
        { content: 'Acceptation de l’échantillon :', styles: { fontStyle: 'bold', fillColor: [240, 245, 250] } },
        { content: sample.acceptanceStatus || 'Accepté', styles: { fontStyle: 'bold', textColor: sample.acceptanceStatus === 'Rejeté' ? [200, 30, 30] : [20, 120, 50] } }
      ]
    ]
  });

  // @ts-ignore
  currentY = (doc as any).lastAutoTable.finalY + 4;

  // --- SECTION 4: ANALYSES DEMANDÉES ---
  drawSectionHeader('4. ANALYSES DEMANDÉES', currentY);
  currentY += 6;

  // Build 9 rows matching the form
  const requestedItems = sample.requestedAnalyses || [];
  const tableRows: any[] = [];

  for (let i = 1; i <= 9; i++) {
    const item = requestedItems.find((r) => r.id === i) || requestedItems[i - 1];
    tableRows.push([
      i.toString(),
      item ? item.parameterName : '',
      item ? item.methodNorm || '' : '',
      item ? item.desiredDeadline || '' : ''
    ]);
  }

  autoTable(doc, {
    startY: currentY,
    margin: { left: 14, right: 14 },
    theme: 'grid',
    head: [['N°', 'Paramètre / Analyse demandée', 'Méthode / Norme', 'Délai souhaité']],
    body: tableRows,
    headStyles: {
      fillColor: [240, 245, 250],
      textColor: [15, 23, 42],
      fontStyle: 'bold',
      fontSize: 8,
      halign: 'center',
      lineWidth: 0.2,
      lineColor: [180, 200, 220]
    },
    bodyStyles: {
      fontSize: 8,
      cellPadding: 1.8,
      textColor: [15, 23, 42],
      lineWidth: 0.2,
      lineColor: [180, 200, 220]
    },
    columnStyles: {
      0: { cellWidth: 12, halign: 'center', fontStyle: 'bold' },
      1: { cellWidth: 80 },
      2: { cellWidth: 50 },
      3: { cellWidth: 40, halign: 'center' }
    }
  });

  // @ts-ignore
  currentY = (doc as any).lastAutoTable.finalY + 4;

  // --- SECTION 5: SIGNATURES ---
  drawSectionHeader('5. SIGNATURES', currentY);
  currentY += 6;

  autoTable(doc, {
    startY: currentY,
    margin: { left: 14, right: 14 },
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 2.5, textColor: [15, 23, 42], lineColor: [180, 200, 220], lineWidth: 0.2 },
    body: [
      [
        { content: 'Réceptionné par :', styles: { fontStyle: 'bold', fillColor: [240, 245, 250], cellWidth: 91 } },
        { content: 'Vérifié par :', styles: { fontStyle: 'bold', fillColor: [240, 245, 250], cellWidth: 91 } }
      ],
      [
        `Nom : ${sample.receivedBy || 'Mohamed Abdallahi'}\n\nSignature :`,
        `Nom : ${sample.verifiedBy || 'Brahim Med Moustapha'}\n\nSignature :                                 Date : ${sample.verifiedDate || sample.receptionDate}`
      ]
    ]
  });

  // --- FOOTER & QUALITY GRID ---
  const pageHeight = doc.internal.pageSize.height;

  // Legal footer paragraph
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(5.5);
  doc.setTextColor(71, 85, 105);
  const footerText = 'Collecte : après formalisation du document – Classement : alphanumérique – Stockage : fichier informatique (seule la version électronique fait foi) – Accès : libre – Durée de conservation : 2 ans après nouvelle version datée– Élimination : suppression fichier électronique.';
  doc.text(doc.splitTextToSize(footerText, 182), 14, pageHeight - 20);

  // ISO Quality Footer Grid
  autoTable(doc, {
    startY: pageHeight - 15,
    margin: { left: 14, right: 14, top: 1, bottom: 1 },
    pageBreak: 'avoid',
    theme: 'grid',
    styles: { fontSize: 6.5, cellPadding: 1.2, textColor: [15, 23, 42], lineColor: [15, 23, 42], lineWidth: 0.2, halign: 'center' },
    body: [
      [
        { content: 'Rédigé par : CQ IMROP', styles: { fontStyle: 'bold' } },
        { content: 'ENR-CHI-02-V2.0', styles: { fontStyle: 'bold' } },
        { content: 'Page 1 de 1', styles: { fontStyle: 'bold' } }
      ],
      [
        'Approuvé par : Chef Unité Chimie Marine',
        'Attribution : LABORATOIRE DE CHIMIE',
        'Communication : Tous'
      ]
    ]
  });

  while (doc.getNumberOfPages() > 1) {
    doc.deletePage(doc.getNumberOfPages());
  }

  const pdfBlob = doc.output('blob');
  const pdfDataUrl = doc.output('dataurlstring');

  return { pdfBlob, pdfDataUrl };
}
