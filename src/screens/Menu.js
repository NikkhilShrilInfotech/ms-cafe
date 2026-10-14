import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Alert } from 'react-native';
import { C, inr } from '../theme';
import { listMenu, addMenu, updateMenu, deleteMenu } from '../db';
import { Btn, Field, IconBtn, Sheet, Title, Empty } from '../ui';

export default function MenuScreen() {
  const [rows, setRows] = useState([]); const [n, setN] = useState(''); const [p, setP] = useState('');
  const [edit, setEdit] = useState(null);
  const load = async () => setRows(await listMenu());
  useEffect(() => { load(); }, []);
  const add = async () => {
    const price = parseFloat(p);
    if (!n.trim() || isNaN(price)) return Alert.alert('Enter item name and price');
    await addMenu(n.trim(), price); setN(''); setP(''); load();
  };
  const del = (m) => Alert.alert('Delete item?', m.name, [{ text: 'Cancel', style: 'cancel' }, { text: 'Delete', style: 'destructive', onPress: async () => { await deleteMenu(m.id); load(); } }]);
  const saveEdit = async () => {
    const price = parseFloat(edit.price);
    if (!edit.name.trim() || isNaN(price)) return Alert.alert('Enter valid name and price');
    await updateMenu(edit.id, edit.name.trim(), price); setEdit(null); load();
  };
  return (
    <View style={{ flex: 1, padding: 18 }}>
      <Title>Menu</Title>
      <View style={{ backgroundColor: C.panel, borderRadius: 20, padding: 14, marginBottom: 14 }}>
        <Text style={{ fontWeight: '700', color: C.ink, marginBottom: 10 }}>Add new item</Text>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Field value={n} onChangeText={setN} placeholder="Item name" style={{ flex: 2, marginBottom: 0 }} />
          <Field value={p} onChangeText={setP} placeholder="Price" keyboardType="decimal-pad" style={{ flex: 1, marginBottom: 0 }} />
        </View>
        <Btn title="Add item" icon="plus" onPress={add} style={{ marginTop: 12 }} />
      </View>
      <FlatList data={rows} keyExtractor={(m) => String(m.id)} ListEmptyComponent={<Empty icon="coffee" text="No items yet" />}
        renderItem={({ item: m }) => (
          <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: C.card, borderRadius: 16, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: C.line }}>
            <View style={{ flex: 1 }}><Text style={{ fontWeight: '700', fontSize: 16, color: C.ink }}>{m.name}</Text><Text style={{ color: C.brand, fontWeight: '600', marginTop: 2 }}>{inr(m.price)}</Text></View>
            <IconBtn name="edit-2" onPress={() => setEdit({ id: m.id, name: m.name, price: String(m.price) })} />
            <View style={{ width: 8 }} />
            <IconBtn name="trash-2" color={C.red} bg="#FBE9E5" onPress={() => del(m)} />
          </View>
        )} />
      <Sheet visible={!!edit} onClose={() => setEdit(null)} title="Edit item">
        {edit && <>
          <Field label="Name" value={edit.name} onChangeText={(t) => setEdit({ ...edit, name: t })} />
          <Field label="Price" value={edit.price} onChangeText={(t) => setEdit({ ...edit, price: t })} keyboardType="decimal-pad" />
          <Btn title="Save changes" icon="check" onPress={saveEdit} />
        </>}
      </Sheet>
    </View>
  );
}
