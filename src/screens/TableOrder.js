import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Alert, Pressable, Switch } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { C, inr } from '../theme';
import { listMenu, openOrders, orderItems, saveOrder, cancelOrder, payOrder } from '../db';
import { printBill } from '../printer';
import { Btn, IconBtn, Sheet, Empty } from '../ui';

export default function TableOrder({ table, onClose }) {
  const [menu, setMenu] = useState([]);
  const [qty, setQty] = useState({});
  const [existing, setExisting] = useState(null);
  const [pay, setPay] = useState(null); // order id
  const [method, setMethod] = useState('Cash');
  const [print, setPrint] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => { (async () => {
    setMenu(await listMenu());
    const o = (await openOrders()).find((x) => x.table_no === table);
    if (o) { setExisting(o); const q = {}; (await orderItems(o.id)).forEach((i) => (q[i.name] = i.qty)); setQty(q); }
  })(); }, []);

  // keep original price for removed/renamed menu items
  const [orig, setOrig] = useState({});
  useEffect(() => { if (existing) orderItems(existing.id).then((r) => setOrig(Object.fromEntries(r.map((i) => [i.name, i.price])))); }, [existing]);
  const lines = () => Object.entries(qty).filter(([, q]) => q > 0).map(([name, q]) => ({ name, qty: q, price: orig[name] ?? (menu.find((m) => m.name === name) || {}).price ?? 0 }));
  const total = lines().reduce((s, l) => s + l.price * l.qty, 0);
  const inc = (n, d) => setQty((p) => ({ ...p, [n]: Math.max(0, (p[n] || 0) + d) }));

  const take = async () => {
    if (!lines().length) return Alert.alert('Add at least one item');
    await saveOrder(table, lines()); onClose();
  };
  const cancel = () => Alert.alert('Cancel this order?', 'The table will become available.', [
    { text: 'No', style: 'cancel' }, { text: 'Cancel order', style: 'destructive', onPress: async () => { await cancelOrder(existing.id); onClose(); } }]);
  const openPay = async () => {
    if (!lines().length) return Alert.alert('Add at least one item');
    const id = await saveOrder(table, lines()); setPay(id);
  };
  const finish = async () => {
    if (saving) return; setSaving(true);
    const bill = { items: lines(), total, table, time: Date.now(), method };
    if (print) {
      try { await printBill(bill); }
      catch (e) {
        const ok = await new Promise((res) => Alert.alert('Print failed', 'Check the printer is on and paired (Profile → Printer). Save without printing?', [
          { text: 'Back', style: 'cancel', onPress: () => res(false) }, { text: 'Save anyway', onPress: () => res(true) }]));
        if (!ok) return setSaving(false);
      }
    }
    await payOrder(pay, method); setSaving(false); setPay(null); onClose();
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: 18, paddingBottom: 8 }}>
        <IconBtn name="arrow-left" onPress={onClose} />
        <View style={{ marginLeft: 12, flex: 1 }}>
          <Text style={{ fontSize: 22, fontWeight: '700', color: C.ink }}>{table ? `Table 0${table}` : 'Takeaway bill'}</Text>
          <Text style={{ color: C.mute, fontSize: 12 }}>{existing ? 'Order running · add or remove items' : 'New order'}</Text>
        </View>
      </View>
      <FlatList data={menu} keyExtractor={(m) => String(m.id)} contentContainerStyle={{ padding: 18, paddingTop: 8 }}
        ListEmptyComponent={<Empty icon="coffee" text="No menu items. Add items in the Menu tab first." />}
        renderItem={({ item: m }) => {
          const q = qty[m.name] || 0;
          return (
            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: q ? C.brandSoft : C.card, borderRadius: 16, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: q ? C.brand : C.line }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 16, fontWeight: '700', color: C.ink }}>{m.name}</Text>
                <Text style={{ color: C.mute, marginTop: 2 }}>{inr(m.price)}</Text>
              </View>
              {q === 0 ? <Btn title="Add" icon="plus" kind="soft" onPress={() => inc(m.name, 1)} style={{ paddingVertical: 10, paddingHorizontal: 16 }} /> : (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <IconBtn name="minus" onPress={() => inc(m.name, -1)} bg="#fff" />
                  <Text style={{ width: 40, textAlign: 'center', fontSize: 18, fontWeight: '700', color: C.ink }}>{q}</Text>
                  <IconBtn name="plus" onPress={() => inc(m.name, 1)} bg={C.brand} color="#fff" />
                </View>
              )}
            </View>
          );
        }} />
      <View style={{ padding: 18, borderTopWidth: 1, borderColor: C.line, backgroundColor: C.bg }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
          <Text style={{ color: C.mute, fontSize: 15 }}>{lines().reduce((s, l) => s + l.qty, 0)} items</Text>
          <Text style={{ fontSize: 22, fontWeight: '700', color: C.ink }}>{inr(total)}</Text>
        </View>
        {table ? (
          <View style={{ flexDirection: 'row', gap: 10 }}>
            {existing && <Btn title="Cancel" kind="soft" onPress={cancel} style={{ flex: 1 }} />}
            <Btn title={existing ? 'Update order' : 'Take order'} kind={existing ? 'soft' : 'primary'} onPress={take} style={{ flex: 2 }} />
            {existing && <Btn title="Bill" icon="credit-card" onPress={openPay} style={{ flex: 1.4 }} kind="dark" />}
          </View>
        ) : <Btn title="Bill & pay" icon="credit-card" onPress={openPay} />}
      </View>

      <Sheet visible={!!pay} onClose={() => setPay(null)} title="Payment">
        <Text style={{ textAlign: 'center', fontSize: 36, fontWeight: '700', color: C.ink }}>{inr(total)}</Text>
        <Text style={{ textAlign: 'center', color: C.mute, marginBottom: 16 }}>{table ? `Table 0${table}` : 'Takeaway'}</Text>
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 14 }}>
          {[['Cash', 'dollar-sign'], ['Online', 'smartphone']].map(([m, ic]) => (
            <Pressable key={m} onPress={() => setMethod(m)} style={{ flex: 1, alignItems: 'center', padding: 16, borderRadius: 16, borderWidth: 2, borderColor: method === m ? C.brand : C.line, backgroundColor: method === m ? C.brandSoft : '#fff' }}>
              <Feather name={ic} size={24} color={method === m ? C.brand : C.mute} />
              <Text style={{ marginTop: 6, fontWeight: '700', color: method === m ? C.brand : C.ink }}>{m}</Text>
            </Pressable>
          ))}
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: C.line }}>
          <View><Text style={{ fontWeight: '700', color: C.ink }}>Print bill</Text><Text style={{ color: C.mute, fontSize: 12 }}>Optional · thermal printer</Text></View>
          <Switch value={print} onValueChange={setPrint} trackColor={{ true: C.brand }} />
        </View>
        <Btn title={saving ? 'Saving…' : print ? 'Print & save' : 'Save'} icon="check" onPress={finish} disabled={saving} />
      </Sheet>
    </View>
  );
}
