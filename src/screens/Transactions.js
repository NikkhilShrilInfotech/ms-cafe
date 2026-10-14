import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { C, inr, timeStr, dateStr } from '../theme';
import { transactions, deleteOrder } from '../db';
import { IconBtn, Empty, Title } from '../ui';

export default function Transactions({ range, onClose }) {
  const [rows, setRows] = useState([]);
  const load = async () => setRows(await transactions(range));
  useEffect(() => { load(); }, []);
  const total = rows.reduce((s, r) => s + r.total, 0);
  const del = (r) => Alert.alert('Delete transaction?', `${inr(r.total)} will be removed from revenue.`, [
    { text: 'Cancel', style: 'cancel' }, { text: 'Delete', style: 'destructive', onPress: async () => { await deleteOrder(r.id); load(); } }]);
  return (
    <View style={{ flex: 1, padding: 18 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
        <IconBtn name="arrow-left" onPress={onClose} />
        <View style={{ flex: 1, marginLeft: 12 }}><Title>{range === 'today' ? 'Today' : 'This month'}</Title></View>
      </View>
      <View style={{ backgroundColor: C.dark, borderRadius: 18, padding: 16, marginBottom: 14 }}>
        <Text style={{ color: '#D9CEC4', fontSize: 12 }}>{rows.length} transactions</Text>
        <Text style={{ color: '#fff', fontSize: 28, fontWeight: '700' }}>{inr(total)}</Text>
      </View>
      <FlatList data={rows} keyExtractor={(r) => String(r.id)} ListEmptyComponent={<Empty icon="file-text" text="No transactions yet" />}
        renderItem={({ item: r }) => (
          <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: C.card, borderRadius: 16, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: C.line }}>
            <View style={{ width: 42, height: 42, borderRadius: 13, backgroundColor: r.method === 'Cash' ? '#E6EEE2' : C.brandSoft, alignItems: 'center', justifyContent: 'center' }}>
              <Feather name={r.method === 'Cash' ? 'dollar-sign' : 'smartphone'} size={18} color={r.method === 'Cash' ? C.green : C.brand} />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={{ fontWeight: '700', fontSize: 17, color: C.ink }}>{inr(r.total)}</Text>
              <Text style={{ color: C.mute, fontSize: 12 }}>{dateStr(r.paid_at)} · {timeStr(r.paid_at)}</Text>
              <Text style={{ color: C.mute, fontSize: 12 }}>{r.table_no ? `Table ${r.table_no}` : 'Takeaway'} · {r.method} · {r.n} items</Text>
            </View>
            <IconBtn name="trash-2" color={C.red} bg="#FBE9E5" onPress={() => del(r)} />
          </View>
        )} />
    </View>
  );
}
