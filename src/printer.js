import { PermissionsAndroid, Platform } from 'react-native';
import * as Print from 'expo-print';
import { getSetting } from './db';

// Direct Bluetooth printing needs a native module (NOT in Expo Go).
// Loaded optionally; without it we fall back to the system print dialog.
let BT = null;
try { BT = require('react-native-bluetooth-classic').default; } catch (e) { BT = null; }
export const btAvailable = () => !!BT;

export const SHOP = { name: 'MS CAFE', addr: 'MS Cafe, near Shriram Gas Agency, Karmveer Nagar 1, Vasud Road, Sangola 413 307', phone: '+91 95030 00157' };
const W = 32; // 58mm paper = 32 chars
const pad = (l, r) => { const sp = Math.max(1, W - l.length - r.length); return l + ' '.repeat(sp) + r; };
const wrap = (s) => s.match(new RegExp(`.{1,${W}}(\\s|$)`, 'g')).map((x) => x.trim());
const money = (n) => 'Rs ' + Number(n).toFixed(0);

export function buildText(b) {
  const L = [];
  L.push('--------------------------------');
  L.push(pad('Item', 'Total'));
  L.push('--------------------------------');
  b.items.forEach((i) => { L.push(i.name.slice(0, W)); L.push(pad(`  ${i.qty} x ${i.price}`, money(i.qty * i.price))); });
  L.push('--------------------------------');
  return L;
}

async function ask() {
  if (Platform.OS !== 'android') return;
  const P = PermissionsAndroid.PERMISSIONS;
  await PermissionsAndroid.requestMultiple([P.BLUETOOTH_CONNECT, P.BLUETOOTH_SCAN, P.ACCESS_FINE_LOCATION].filter(Boolean));
}
export async function listPaired() {
  if (!BT) throw new Error('NO_BT');
  await ask();
  await BT.requestBluetoothEnabled();
  return BT.getBondedDevices();
}

function escpos(b) {
  const ESC = '\x1B', GS = '\x1D', C = ESC + 'a\x01', Lf = ESC + 'a\x00';
  let s = ESC + '@' + C + ESC + 'E\x01' + GS + '!\x11' + SHOP.name + '\n' + GS + '!\x00' + ESC + 'E\x00';
  wrap(SHOP.addr).forEach((l) => (s += l + '\n'));
  s += 'Ph: ' + SHOP.phone + '\n' + Lf;
  s += new Date(b.time).toLocaleString('en-IN') + '\n' + (b.table ? `Table ${b.table}` : 'Takeaway') + (b.method ? `  |  ${b.method}` : '') + '\n';
  buildText(b).slice(0, -1).forEach((l) => (s += l + '\n'));
  s += '--------------------------------\n' + ESC + 'E\x01' + GS + '!\x01' + pad('TOTAL', money(b.total)) + '\n' + GS + '!\x00' + ESC + 'E\x00';
  s += '--------------------------------\n' + C + 'Thanks for Visiting MS Cafe\n' + Lf + '\n\n\n\n' + GS + 'V\x00';
  return s;
}
function html(b) {
  const rows = b.items.map((i) => `<tr><td>${i.name}</td><td>${i.qty}</td><td>${i.price}</td><td align=right>${i.qty * i.price}</td></tr>`).join('');
  return `<html><body style="font-family:monospace;width:220px;font-size:11px"><center><b style="font-size:16px">${SHOP.name}</b><br>${SHOP.addr}<br>Ph: ${SHOP.phone}</center><hr>${new Date(b.time).toLocaleString('en-IN')}<br>${b.table ? 'Table ' + b.table : 'Takeaway'}<hr><table width=100%><tr><th align=left>Item</th><th>Qty</th><th>Rate</th><th align=right>Amt</th></tr>${rows}</table><hr><b>TOTAL: Rs ${b.total}</b><hr><center>Thanks for Visiting MS Cafe</center></body></html>`;
}

// bill: {items:[{name,price,qty}], total, table, time, method}
export async function printBill(b) {
  const addr = await getSetting('printer');
  if (BT && addr) {
    await ask();
    let dev;
    if (await BT.isDeviceConnected(addr)) dev = await BT.getConnectedDevice(addr);
    else dev = await BT.connectToDevice(addr);
    await dev.write(escpos(b));
    return 'bluetooth';
  }
  await Print.printAsync({ html: html(b), width: 164 });
  return 'system';
}
