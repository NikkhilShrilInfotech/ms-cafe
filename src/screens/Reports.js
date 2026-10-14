import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { C, inr } from '../theme';
import { report, sales } from '../db';
import { Title } from '../ui';

const Card = ({ children, style }) => <View style={[{ backgroundColor: C.card, borderRadius: 20, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: C.line }, style]}>{children}</View>;
const H = ({ children }) => <Text style={{ fontWeight: '700', fontSize: 16, color: C.ink, marginBottom: 12 }}>{children}</Text>;

export default function Reports() {
  const [R, setR] = useState(null); const [S, setS] = useState(null);
  useEffect(() => { (async () => { setR(await report()); setS(await sales()); })(); }, []);
  if (!R || !S) return null;
  const max = Math.max(1, ...R.week.map((d) => d.v));
  const weekTotal = R.week.reduce((s, d) => s + d.v, 0);
  const pct = S.last > 0 ? ((S.month - S.last) / S.last) * 100 : null;
  const avg = S.monthCount ? S.month / S.monthCount : 0;
  const mTotal = R.split.reduce((s, x) => s + x.s, 0) || 1;
  return (
    <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 30 }}>
      <Title>Reports</Title>
      <View style={{ flexDirection: 'row', gap: 10, marginBottom: 14 }}>
        {[['Today', S.today], ['Last 7 days', weekTotal], ['This month', S.month]].map(([l, v]) => (
          <View key={l} style={{ flex: 1, backgroundColor: C.dark, borderRadius: 18, padding: 12 }}>
            <Text style={{ color: '#D9CEC4', fontSize: 11 }}>{l}</Text>
            <Text style={{ color: '#fff', fontSize: 17, fontWeight: '700', marginTop: 4 }}>{inr(v)}</Text>
          </View>
        ))}
      </View>
      <Card>
        <H>Last 7 days</H>
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: 150, justifyContent: 'space-between' }}>
          {R.week.map((d, i) => (
            <View key={i} style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-end', height: '100%' }}>
              <Text style={{ fontSize: 9, color: C.mute }}>{d.v ? Math.round(d.v) : ''}</Text>
              <View style={{ width: 22, height: Math.max(4, (d.v / max) * 110), borderRadius: 8, backgroundColor: i === 6 ? C.brand : '#E6B5A5', marginTop: 3 }} />
              <Text style={{ fontSize: 11, color: C.mute, marginTop: 6 }}>{d.label}</Text>
            </View>
          ))}
        </View>
      </Card>
      <Card>
        <H>This month</H>
        <Text style={{ color: C.mute }}>Orders <Text style={{ color: C.ink, fontWeight: '700' }}>{S.monthCount}</Text>   ·   Avg bill <Text style={{ color: C.ink, fontWeight: '700' }}>{inr(Math.round(avg))}</Text></Text>
        {pct !== null && <Text style={{ color: pct >= 0 ? C.green : C.red, marginTop: 6, fontWeight: '600' }}>{pct >= 0 ? '↗' : '↘'} {Math.abs(pct).toFixed(1)}% vs last month ({inr(S.last)})</Text>}
        <View style={{ marginTop: 14 }}>
          {['Cash', 'Online'].map((m) => {
            const x = R.split.find((r) => r.method === m) || { s: 0, c: 0 };
            return (
              <View key={m} style={{ marginBottom: 10 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}><Text style={{ color: C.ink, fontWeight: '600' }}>{m}</Text><Text style={{ color: C.mute }}>{inr(x.s)} · {x.c}</Text></View>
                <View style={{ height: 8, backgroundColor: C.panel, borderRadius: 4, marginTop: 5 }}><View style={{ height: 8, width: `${(x.s / mTotal) * 100}%`, borderRadius: 4, backgroundColor: m === 'Cash' ? C.green : C.brand }} /></View>
              </View>
            );
          })}
        </View>
      </Card>
      <Card>
        <H>Top selling · this month</H>
        {R.top.length === 0 ? <Text style={{ color: C.mute }}>No sales yet</Text> : R.top.map((t, i) => (
          <View key={t.name} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderTopWidth: i ? 1 : 0, borderColor: C.line }}>
            <Text style={{ width: 26, color: C.brand, fontWeight: '700' }}>{i + 1}</Text>
            <Text style={{ flex: 1, color: C.ink, fontWeight: '600' }}>{t.name}</Text>
            <Text style={{ color: C.mute }}>{t.q} sold · {inr(t.s)}</Text>
          </View>
        ))}
      </Card>
    </ScrollView>
  );
}
