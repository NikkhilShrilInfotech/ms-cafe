import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Alert } from 'react-native';
import { C } from '../theme';
import { listStock, addStock, updateStock, deleteStock } from '../db';
import { Btn, Field, IconBtn, Sheet, Title, Empty } from '../ui';

export default function Stock() {
  const [rows, setRows] = useState([]); const [f, setF] = useState(null);
  const load = async () => setRows(await listStock());
  useEffect(() => { load(); }, []);
  const save = async () => {
    const q = parseFloat(f.qty);
    if (!f.name.trim() || isNaN(q)) return Alert.alert('Enter name and quantity');
    if (f.id) await updateStock(f.id, f.name.trim(), q, f.unit.trim()); else await addStock(f.name.trim(), q, f.unit.trim());
    setF(null); load();
  };
  const bump = async (r, d) => { await updateStock(r.id, r.name, Math.max(0, r.qty + d), r.unit); load(); };
  const del = (r) => Alert.alert('Delete stock item?', r.name, [{ text: 'Cancel', style: 'cancel' }, { text: 'Delete', style: 'destructive', onPress: async () => { await deleteStock(r.id); load(); } }]);
  return (
    <View style={{ flex: 1, padding: 18 }}>
      <Title right={<Btn title="Add" icon="plus" onPress={() => setF({ name: '', qty: '', unit: 'kg' })} style={{ paddingVertical: 10 }} />}>Stock</Title>
      <FlatList data={rows} keyExtractor={(r) => String(r.id)} ListEmptyComponent={<Empty icon="package" text="No stock added yet" />}
        renderItem={({ item: r }) => (
          <View style={{ backgroundColor: C.card, borderRadius: 16, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: C.line }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: '700', fontSize: 16, color: C.ink }}>{r.name}</Text>
                <Text style={{ color: r.qty <= 5 ? C.red : C.green, fontWeight: '600', marginTop: 2 }}>{r.qty} {r.unit} available{r.qty <= 5 ? ' · Low' : ''}</Text>
              </View>
              <IconBtn name="edit-2" onPress={() => setF({ id: r.id, name: r.name, qty: String(r.qty), unit: r.unit || '' })} />
              <View style={{ width: 8 }} />
              <IconBtn name="trash-2" color={C.red} bg="#FBE9E5" onPress={() => del(r)} />
            </View>
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
              <Btn title="− 1" kind="soft" onPress={() => bump(r, -1)} style={{ flex: 1, paddingVertical: 9 }} />
              <Btn title="+ 1" kind="soft" onPress={() => bump(r, 1)} style={{ flex: 1, paddingVertical: 9 }} />
              <Btn title="+ 10" kind="soft" onPress={() => bump(r, 10)} style={{ flex: 1, paddingVertical: 9 }} />
            </View>
          </View>
        )} />
      <Sheet visible={!!f} onClose={() => setF(null)} title={f && f.id ? 'Edit stock' : 'Add stock'}>
        {f && <>
          <Field label="Item" value={f.name} onChangeText={(t) => setF({ ...f, name: t })} placeholder="e.g. Milk" />
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Field label="Quantity" value={f.qty} onChangeText={(t) => setF({ ...f, qty: t })} keyboardType="decimal-pad" style={{ flex: 1 }} />
            <Field label="Unit" value={f.unit} onChangeText={(t) => setF({ ...f, unit: t })} placeholder="kg / L / pcs" style={{ flex: 1 }} />
          </View>
          <Btn title="Save" icon="check" onPress={save} />
        </>}
      </Sheet>
    </View>
  );
}
