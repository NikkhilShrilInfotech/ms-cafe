import * as SQLite from 'expo-sqlite';
let _db;
export async function db() {
  if (_db) return _db;
  _db = await SQLite.openDatabaseAsync('mscafe.db');
  await _db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT);
    CREATE TABLE IF NOT EXISTS menu_items (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, price REAL NOT NULL);
    CREATE TABLE IF NOT EXISTS stock (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, qty REAL NOT NULL, unit TEXT);
    CREATE TABLE IF NOT EXISTS orders (id INTEGER PRIMARY KEY AUTOINCREMENT, table_no INTEGER NOT NULL, status TEXT NOT NULL,
      total REAL NOT NULL DEFAULT 0, method TEXT, created_at INTEGER NOT NULL, paid_at INTEGER);
    CREATE TABLE IF NOT EXISTS order_items (id INTEGER PRIMARY KEY AUTOINCREMENT, order_id INTEGER NOT NULL, name TEXT NOT NULL, price REAL NOT NULL, qty INTEGER NOT NULL);
  `);
  const n = await _db.getFirstAsync('SELECT COUNT(*) c FROM menu_items');
  if (!n.c) for (const [a, b] of [['Tea', 15], ['Coffee', 30], ['Sandwich', 60], ['Samosa', 20]])
    await _db.runAsync('INSERT INTO menu_items(name,price) VALUES(?,?)', a, b);
  return _db;
}
const D = async () => db();
// settings
export async function getSetting(k) { const r = await (await D()).getFirstAsync('SELECT value FROM settings WHERE key=?', k); return r ? r.value : null; }
export async function setSetting(k, v) { const d = await D(); if (v == null) await d.runAsync('DELETE FROM settings WHERE key=?', k); else await d.runAsync('INSERT OR REPLACE INTO settings(key,value) VALUES(?,?)', k, String(v)); }
// menu
export const listMenu = async () => (await D()).getAllAsync('SELECT * FROM menu_items ORDER BY name COLLATE NOCASE');
export const addMenu = async (n, p) => (await D()).runAsync('INSERT INTO menu_items(name,price) VALUES(?,?)', n, p);
export const updateMenu = async (id, n, p) => (await D()).runAsync('UPDATE menu_items SET name=?, price=? WHERE id=?', n, p, id);
export const deleteMenu = async (id) => (await D()).runAsync('DELETE FROM menu_items WHERE id=?', id);
// stock
export const listStock = async () => (await D()).getAllAsync('SELECT * FROM stock ORDER BY name COLLATE NOCASE');
export const addStock = async (n, q, u) => (await D()).runAsync('INSERT INTO stock(name,qty,unit) VALUES(?,?,?)', n, q, u);
export const updateStock = async (id, n, q, u) => (await D()).runAsync('UPDATE stock SET name=?, qty=?, unit=? WHERE id=?', n, q, u, id);
export const deleteStock = async (id) => (await D()).runAsync('DELETE FROM stock WHERE id=?', id);
// orders
export const openOrders = async () => (await D()).getAllAsync("SELECT * FROM orders WHERE status='open'");
export const orderItems = async (id) => (await D()).getAllAsync('SELECT * FROM order_items WHERE order_id=?', id);
export async function saveOrder(table, cart) {
  const d = await D();
  const items = cart.filter((c) => c.qty > 0);
  const total = items.reduce((s, c) => s + c.price * c.qty, 0);
  let o = await d.getFirstAsync("SELECT * FROM orders WHERE table_no=? AND status='open'", table);
  if (!items.length) { if (o) await d.runAsync("UPDATE orders SET status='cancelled', total=0 WHERE id=?", o.id); return null; }
  let id;
  if (o) id = o.id; else id = (await d.runAsync("INSERT INTO orders(table_no,status,total,created_at) VALUES(?, 'open', 0, ?)", table, Date.now())).lastInsertRowId;
  await d.runAsync('DELETE FROM order_items WHERE order_id=?', id);
  for (const c of items) await d.runAsync('INSERT INTO order_items(order_id,name,price,qty) VALUES(?,?,?,?)', id, c.name, c.price, c.qty);
  await d.runAsync('UPDATE orders SET total=? WHERE id=?', total, id);
  return id;
}
export async function cancelOrder(id) { await (await D()).runAsync("UPDATE orders SET status='cancelled' WHERE id=?", id); }
export async function payOrder(id, method) { await (await D()).runAsync("UPDATE orders SET status='paid', method=?, paid_at=? WHERE id=?", method, Date.now(), id); }
export async function deleteOrder(id) { const d = await D(); await d.runAsync('DELETE FROM order_items WHERE order_id=?', id); await d.runAsync('DELETE FROM orders WHERE id=?', id); }
// revenue
const TODAY = "date(paid_at/1000,'unixepoch','localtime')=date('now','localtime')";
const MONTH = "strftime('%Y-%m',paid_at/1000,'unixepoch','localtime')=strftime('%Y-%m','now','localtime')";
const LASTM = "strftime('%Y-%m',paid_at/1000,'unixepoch','localtime')=strftime('%Y-%m','now','localtime','start of month','-1 month')";
export async function sales() {
  const d = await D();
  const q = (w) => d.getFirstAsync(`SELECT COALESCE(SUM(total),0) s, COUNT(*) c FROM orders WHERE status='paid' AND ${w}`);
  const [t, m, l] = [await q(TODAY), await q(MONTH), await q(LASTM)];
  return { today: t.s, todayCount: t.c, month: m.s, monthCount: m.c, last: l.s };
}
export async function transactions(range) {
  const w = range === 'today' ? TODAY : range === 'month' ? MONTH : '1=1';
  return (await D()).getAllAsync(`SELECT o.*, (SELECT COUNT(*) FROM order_items i WHERE i.order_id=o.id) n FROM orders o WHERE status='paid' AND ${w} ORDER BY paid_at DESC`);
}
export async function report() {
  const d = await D();
  const days = await d.getAllAsync(`SELECT date(paid_at/1000,'unixepoch','localtime') day, SUM(total) s FROM orders WHERE status='paid' AND paid_at >= ? GROUP BY day`, Date.now() - 8 * 864e5);
  const map = Object.fromEntries(days.map((x) => [x.day, x.s]));
  const week = [];
  for (let i = 6; i >= 0; i--) { const dt = new Date(Date.now() - i * 864e5); const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`; week.push({ label: dt.toLocaleDateString('en-IN', { weekday: 'short' }), v: map[key] || 0 }); }
  const split = await d.getAllAsync(`SELECT method, SUM(total) s, COUNT(*) c FROM orders WHERE status='paid' AND ${MONTH} GROUP BY method`);
  const top = await d.getAllAsync(`SELECT i.name, SUM(i.qty) q, SUM(i.qty*i.price) s FROM order_items i JOIN orders o ON o.id=i.order_id WHERE o.status='paid' AND ${MONTH.replace(/paid_at/g, 'o.paid_at')} GROUP BY i.name ORDER BY q DESC LIMIT 5`);
  return { week, split, top };
}
