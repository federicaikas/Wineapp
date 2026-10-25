import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import type { WineBottle } from '../types/wine';

const CATEGORY_COLORS: Record<string, string> = {
  red: '9F0000',
  white: 'FFCC79',
  sparkling: 'A0A738',
  rose: 'E74D6F',
  orange: 'F2542D',
  dessert: 'B85F00',
};

const CATEGORY_LABELS: Record<string, string> = {
  red: 'Rosso',
  white: 'Bianco',
  sparkling: 'Bollicine',
  rose: 'Rosato',
  orange: 'Orange',
  dessert: 'Dolce',
};

export async function exportWinesToExcel(wines: WineBottle[], filename = 'Cantina_Federica.xlsx') {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'AFFINAPP';
  const worksheet = workbook.addWorksheet('La Mia Cantina');

  worksheet.columns = [
    { header: 'ID', key: 'id', width: 20 },
    { header: 'Nome / Cru', key: 'name', width: 30 },
    { header: 'Produttore', key: 'producer', width: 30 },
    { header: 'Annata', key: 'vintage', width: 15 },
    { header: 'Tipologia', key: 'category', width: 20 },
    { header: 'Sub Categoria', key: 'subCategory', width: 25 },
    { header: 'Denominazione', key: 'appellation', width: 25 },
    { header: 'Giacenza', key: 'stock', width: 10 },
    { header: 'Stappate', key: 'uncorkedCount', width: 10 },
    { header: 'Paese', key: 'country', width: 15 },
    { header: 'Regione', key: 'region', width: 20 },
    { header: 'Uve', key: 'grapes', width: 30 },
    { header: 'Prezzo', key: 'price', width: 10 },
    { header: 'Valutazione', key: 'rating', width: 12 },
    { header: 'Stato di Beva', key: 'drinkingStatus', width: 15 },
    { header: 'Finestra di Beva', key: 'drinkingWindow', width: 15 },
  ];

  worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF2D234A' }
  };

  wines.forEach((wine) => {
    const categoryLabel = CATEGORY_LABELS[wine.category] || wine.category;
    
    const row = worksheet.addRow({
      id: wine.id,
      name: wine.name,
      producer: wine.producer,
      vintage: wine.vintage > 0 ? wine.vintage : 'S.A.',
      category: categoryLabel,
      subCategory: wine.subCategory,
      appellation: wine.appellation,
      stock: wine.stock,
      uncorkedCount: wine.uncorkedCount || 0,
      country: wine.country,
      region: wine.region,
      grapes: wine.grapes.join(', '),
      price: wine.price || '',
      rating: wine.rating || '',
      drinkingStatus: wine.drinkingStatus,
      drinkingWindow: wine.drinkingWindow || '',
    });

    const categoryCell = row.getCell('category');
    const colorHex = CATEGORY_COLORS[wine.category];
    
    if (colorHex) {
      categoryCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: `FF${colorHex}` }
      };
      const isLight = ['white'].includes(wine.category);
      categoryCell.font = { 
        color: { argb: isLight ? 'FF000000' : 'FFFFFFFF' },
        bold: true
      };
    }
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, filename);
}
