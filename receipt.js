const DEMO_SHOP = {
  name: 'ABC STORE',
  address: '12, Main Road, City',
  phone: '+91 98765 43210'
};

const DEMO_ITEMS = [
  { name: 'Rice 1kg', qty: 2, rate: 60 },
  { name: 'Sugar 1kg', qty: 1, rate: 45 },
  { name: 'Milk 500ml', qty: 4, rate: 28 },
  { name: 'Bread', qty: 1, rate: 40 },
  { name: 'Soap', qty: 3, rate: 35 }
];

function formatDate(date) {
  const pad = n => String(n).padStart(2, '0');
  return `${pad(date.getDate())}-${pad(date.getMonth() + 1)}-${date.getFullYear()} ` +
    `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function itemRow(name, qty, amount) {
  return name.slice(0, 18).padEnd(18) + String(qty).padStart(4) + String(amount).padStart(10) + '\n';
}

function buildReceipt(shop, items, billNo) {
  const total = items.reduce((sum, i) => sum + i.qty * i.rate, 0);
  const totalQty = items.reduce((sum, i) => sum + i.qty, 0);

  let r = '';
  r += ESC.center + ESC.bigOn + ESC.boldOn + shop.name + '\n' + ESC.bigOff + ESC.boldOff;
  r += shop.address + '\n';
  r += 'Ph: ' + shop.phone + '\n';
  r += ESC.left + divider();
  r += columns('Bill No: ' + billNo, '');
  r += columns('Date: ' + formatDate(new Date()), '');
  r += divider();
  r += ESC.boldOn + itemRow('Item', 'Qty', 'Amount') + ESC.boldOff;
  r += divider();
  for (const i of items) {
    r += itemRow(i.name, i.qty, (i.qty * i.rate).toFixed(2));
  }
  r += divider();
  r += columns('Items: ' + items.length, 'Qty: ' + totalQty);
  r += ESC.boldOn + ESC.bigOn + columns('TOTAL', 'Rs.' + total.toFixed(2), LINE_WIDTH / 2) +ESC.bigOff + ESC.boldOff;
  r += divider('=');
  r += ESC.center + 'Thank you! Visit again\n';
  return r;
}

async function printDemoReceipt() {
  const billNo = 'INV-' + Date.now().toString().slice(-6);
  await printText(buildReceipt(DEMO_SHOP, DEMO_ITEMS, billNo));
}
