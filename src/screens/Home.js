import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable, RefreshControl } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { C, serif, inr } from '../theme';
import { sales, openOrders } from '../db';
import { Btn } from '../ui';

const TABLES = [1, 2, 3, 4, 5, 6];
const Seats = ({ busy }) => (
  <View style={{ flexDirection: 'row', gap: 5, justifyContent: 'center' }}>
    {[0, 1, 2].map((i) => <View key={i} style={{ width: 22, height: 7, borderRadius: 4, backgroundColor: busy ? '#E6B5A5' : '#E3DDD0' }} />)}
  </View>
);

export default function Home({ nav }) {
  const [S, setS] = useState({ today: 0, todayCount: 0, month: 0, last: 0 });
  const [orders, setOrders] = useState({});
  const [busy, setBusy] = useState(false);
  const load = useCallback(async () => {
    setS(await sales());
    const o = await openOrders(); const m = {}; o.forEach((x) => (m[x.table_no] = x)); setOrders(m);
  }, []);
  useEffect(() => { load(); }, [load]);
  const refresh = async () => { setBusy(true); await load(); setBusy(false); };
  const occ = TABLES.filter((t) => orders[t]).length;
  const pct = S.last > 0 ? ((S.month - S.last) / S.last) * 100 : null;
  const now = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 30 }} refreshControl={<RefreshControl refreshing={busy} onRefresh={refresh} tintColor={C.brand} />}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View style={{ width: 52, height: 52, borderRadius: 16, backgroundColor: C.brandSoft, alignItems: 'center', justifyContent: 'center' }}>
          <Feather name="coffee" size={24} color={C.brand} />
        </View>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={{ fontFamily: serif, fontSize: 30, color: C.ink }}>MS Cafe</Text>
          <Text style={{ color: C.mute, fontSize: 12 }}>Your Daily Smile Station </Text>
        </View>
        <Pressable onPress={() => nav.open({ name: 'profile' })} style={{ width: 46, height: 46, borderRadius: 23, backgroundColor: C.card, borderWidth: 1, borderColor: C.line, alignItems: 'center', justifyContent: 'center' }}>
          <Feather name="user" size={20} color={C.ink} />
        </Pressable>
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 14 }}>
        <Text style={{ color: C.mute, fontSize: 13 }}>{now}</Text>
        <Text style={{ color: C.green, fontSize: 13 }}>● Open for service</Text>
      </View>

      <View style={{ flexDirection: 'row', backgroundColor: C.dark, borderRadius: 24, padding: 20, marginTop: 14 }}>
        <Pressable style={{ flex: 1 }} onPress={() => nav.open({ name: 'tx', range: 'today' })}>
          <Text style={{ color: '#D9CEC4', fontSize: 13 }}>Daily sales <Feather name="chevron-right" size={12} /></Text>
          <Text style={{ color: '#fff', fontSize: 32, fontWeight: '700', marginTop: 4 }}>{inr(S.today)}</Text>
          <Text style={{ color: '#D9CEC4', fontSize: 12, marginTop: 6 }}>{S.todayCount} orders today</Text>
        </Pressable>
        <View style={{ width: 1, backgroundColor: '#5A4B40', marginHorizontal: 14 }} />
        <Pressable style={{ flex: 1 }} onPress={() => nav.open({ name: 'tx', range: 'month' })}>
          <Text style={{ color: '#D9CEC4', fontSize: 13 }}>Monthly · {new Date().toLocaleDateString('en-IN', { month: 'short' })} <Feather name="chevron-right" size={12} /></Text>
          <Text style={{ color: '#fff', fontSize: 26, fontWeight: '700', marginTop: 8 }}>{inr(S.month)}</Text>
          {pct !== null && <Text style={{ color: pct >= 0 ? '#A8D5A0' : '#F2A99A', fontSize: 12, marginTop: 6 }}>{pct >= 0 ? '↗' : '↘'} {Math.abs(pct).toFixed(1)}% vs last month</Text>}
        </Pressable>
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 26 }}>
        <Text style={{ fontFamily: serif, fontSize: 28, color: C.ink }}>Your tables</Text>
        <Text style={{ color: C.mute, fontSize: 12 }}>Tap to manage</Text>
      </View>
      <Text style={{ marginTop: 6, color: C.mute, fontSize: 12 }}><Text style={{ color: C.green }}>●</Text> {6 - occ} available   <Text style={{ color: C.brand }}>●</Text> {occ} occupied</Text>

      <View style={{ backgroundColor: C.panel, borderRadius: 24, padding: 14, marginTop: 12, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 16 }}>
        {TABLES.map((t) => {
          const o = orders[t];
          const mins = o ? Math.max(1, Math.round((Date.now() - o.created_at) / 60000)) : 0;
          return (
            <Pressable key={t} onPress={() => nav.open({ name: 'order', table: t })} style={{ width: '47%' }}>
              <Seats busy={!!o} />
              <View style={{ marginVertical: 5, borderRadius: 18, paddingVertical: 16, alignItems: 'center', backgroundColor: o ? C.brand : '#fff', borderWidth: 1, borderColor: o ? C.brand : C.line }}>
                <Text style={{ fontSize: 17, fontWeight: '700', color: o ? '#fff' : C.ink }}>Table 0{t}</Text>
                <Text style={{ fontSize: 13, color: o ? '#fff' : C.mute, marginTop: 2 }}>{o ? inr(o.total) : '6 seats'}</Text>
              </View>
              <Seats busy={!!o} />
              <Text style={{ textAlign: 'center', fontSize: 12, marginTop: 6, color: o ? C.brand : C.green }}>● {o ? `Occupied · ${mins}m` : 'Available'}</Text>
            </Pressable>
          );
        })}
      </View>
      <Btn title="New takeaway bill" icon="plus" onPress={() => nav.open({ name: 'order', table: 0 })} style={{ marginTop: 20, justifyContent: 'flex-start' }} />
    </ScrollView>
  );
}
