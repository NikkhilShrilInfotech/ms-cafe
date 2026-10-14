import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { C, serif } from '../theme';
import { getSetting, setSetting } from '../db';
import { listPaired, printBill, btAvailable, SHOP } from '../printer';
import { Btn, IconBtn, Sheet, Title } from '../ui';

const Row = ({ k, v }) => <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 }}><Text style={{ color: C.mute }}>{k}</Text><Text style={{ color: C.ink, fontWeight: '600', flex: 1, textAlign: 'right', marginLeft: 20 }}>{v}</Text></View>;

export default function Profile({ onClose, onLogout }) {
  const [dev, setDev] = useState(null); const [list, setList] = useState(null);
  useEffect(() => { (async () => { const a = await getSetting('printer'); const nm = await getSetting('printerName'); if (a) setDev(nm || a); })(); }, []);
  const pick = async () => {
    try { setList(await listPaired()); }
    catch (e) { Alert.alert('Direct Bluetooth not available', e.message === 'NO_BT' ? 'Expo Go cannot talk to Bluetooth printers directly. Bills will open the Android print dialog instead. Build a development build to print straight to the KP206B-UB (see README).' : String(e.message || e)); }
  };
  const choose = async (d) => { await setSetting('printer', d.address); await setSetting('printerName', d.name); setDev(d.name); setList(null); };
  const test = async () => { try { await printBill({ items: [{ name: 'Test item', price: 10, qty: 2 }], total: 20, table: 0, time: Date.now(), method: 'Cash' }); } catch (e) { Alert.alert('Print failed', String(e.message || e)); } };
  return (
    <View style={{ flex: 1, padding: 18 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}><IconBtn name="arrow-left" onPress={onClose} /><View style={{ marginLeft: 12 }}><Title>Profile</Title></View></View>
      <ScrollView>
        <View style={{ alignItems: 'center', marginVertical: 14 }}>
          <View style={{ width: 84, height: 84, borderRadius: 42, backgroundColor: C.brand, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: '#fff', fontSize: 36, fontFamily: serif }}>S</Text></View>
          <Text style={{ fontSize: 22, fontWeight: '700', color: C.ink, marginTop: 10 }}>Shubham</Text>
          <Text style={{ color: C.mute }}>Admin · shubham@admin</Text>
        </View>
        <View style={{ backgroundColor: C.card, borderRadius: 20, padding: 16, borderWidth: 1, borderColor: C.line, marginBottom: 14 }}>
          <Text style={{ fontWeight: '700', color: C.ink, marginBottom: 4 }}>App details</Text>
          <Row k="App" v="MS Cafe POS" /><Row k="Version" v="1.0.0" /><Row k="Phone" v={SHOP.phone} /><Row k="Address" v={SHOP.addr} />
        </View>
        <View style={{ backgroundColor: C.card, borderRadius: 20, padding: 16, borderWidth: 1, borderColor: C.line, marginBottom: 14 }}>
          <Text style={{ fontWeight: '700', color: C.ink, marginBottom: 4 }}>Printer (KP206B-UB)</Text>
          <Row k="Selected" v={dev || (btAvailable() ? 'None' : 'System print dialog')} />
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 8 }}>
            <Btn title="Choose" icon="bluetooth" kind="soft" onPress={pick} style={{ flex: 1 }} />
            <Btn title="Test print" icon="printer" onPress={test} style={{ flex: 1 }} />
          </View>
        </View>
        <Btn title="Log out" icon="log-out" kind="dark" onPress={onLogout} />
      </ScrollView>
      <Sheet visible={!!list} onClose={() => setList(null)} title="Paired devices">
        {list && list.length === 0 && <Text style={{ color: C.mute }}>Pair the printer in Android Bluetooth settings first (PIN usually 0000 or 1234).</Text>}
        {list && list.map((d) => <Btn key={d.address} title={`${d.name}  ·  ${d.address}`} kind="soft" onPress={() => choose(d)} style={{ marginBottom: 8 }} />)}
      </Sheet>
    </View>
  );
}
