export const prepareWechatExportHtml = (html: string): string => {
  if (!html.trim()) {
    return html;
  }

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    convertMultiImageGridToTable(doc);
    return doc.body.innerHTML;
  } catch (error) {
    console.warn('[prepareWechatExportHtml] 转换失败，返回原始 HTML：', error);
    return html;
  }
};

const convertMultiImageGridToTable = (doc: Document) => {
  const grids = Array.from(doc.querySelectorAll<HTMLElement>('.wechat-multi-image-grid'));
  if (grids.length === 0) {
    return;
  }

  grids.forEach((grid) => {
    const items = Array.from(grid.querySelectorAll<HTMLElement>('.wechat-multi-image-item'));
    if (items.length < 2) {
      return;
    }

    const explicitColumns = Number.parseInt(grid.getAttribute('data-columns') ?? '', 10);
    const columns = Number.isNaN(explicitColumns) ? resolveColumns(items.length) : explicitColumns;
    const table = doc.createElement('table');
    table.setAttribute(
      'style',
      [
        'width:100% !important',
        'border-collapse:collapse !important',
        'margin:20px auto !important',
        'table-layout:fixed !important',
        'border:none !important',
        'background:transparent !important'
      ].join(';'),
    );

    const sourceLine = grid.getAttribute('data-source-line');
    if (sourceLine) {
      table.setAttribute('data-source-line', sourceLine);
    }

    const rows = Math.ceil(items.length / columns);
    const cellWidth = `${(100 / columns).toFixed(2)}% !important`;

    for (let rowIndex = 0; rowIndex < rows; rowIndex += 1) {
      const tr = doc.createElement('tr');
      for (let columnIndex = 0; columnIndex < columns; columnIndex += 1) {
        const cellIndex = rowIndex * columns + columnIndex;
        const td = doc.createElement('td');
        td.setAttribute(
          'style',
          [
            'padding:6px !important',
            'vertical-align:top !important',
            `width:${cellWidth}`,
            'border:none !important',
            'background:transparent !important'
          ].join(';'),
        );

        if (cellIndex < items.length) {
          const wrapper = items[cellIndex];
          const img = wrapper.querySelector('img');
          if (img) {
            const outer = doc.createElement('div');
            outer.setAttribute(
              'style',
              [
                'width:100% !important',
                'height:100% !important',
                'background-color:#f5f7fb !important',
                'border-radius:12px !important',
                'padding:10px !important',
                'box-sizing:border-box !important',
                'display:table !important'
              ].join(';'),
            );

            const inner = doc.createElement('div');
            inner.setAttribute(
              'style',
              [
                'display:table-cell !important',
                'vertical-align:middle !important',
                'text-align:center !important'
              ].join(';'),
            );

            const clonedImg = img.cloneNode(true) as HTMLImageElement;
            const existingStyle = clonedImg.getAttribute('style') ?? '';
            const finalStyle = [
              existingStyle,
              'max-width:100% !important',
              'height:auto !important',
              'width:auto !important',
              'margin:0 auto !important',
              'display:inline-block !important'
            ]
              .filter(Boolean)
              .join(';');

            clonedImg.setAttribute('style', finalStyle);
            inner.appendChild(clonedImg);
            outer.appendChild(inner);
            td.appendChild(outer);
          }
        }

        tr.appendChild(td);
      }
      table.appendChild(tr);
    }

    grid.replaceWith(table);
  });
};

const resolveColumns = (count: number) => {
  if (count === 3 || count >= 5) {
    return 3;
  }
  if (count === 2 || count === 4) {
    return 2;
  }
  return 1;
};
