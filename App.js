import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, ActivityIndicator, BackHandler } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Feather } from '@expo/vector-icons';
import { getSetting, setSetting, db } from './src/db';
import { C } from './src/theme';
import Login from './src/screens/Login';
import Home from './src/screens/Home';
import MenuScreen from './src/screens/Menu';
import Stock from './src/screens/Stock';
import Reports from './src/screens/Reports';
import TableOrder from './src/screens/TableOrder';
import Transactions from './src/screens/Transactions';
import Profile from './src/screens/Profile';

const TABS = [['Home', 'home'], ['Menu', 'coffee'], ['Stock', 'package'], ['Report', 'bar-chart-2']];

function Root() {
  const insets = useSafeAreaInsets();
  const [ready, setReady] = useState(false);
  const [logged, setLogged] = useState(false);
  const [tab, setTab] = useState('Home');
  const [over, setOver] = useState(null); // {name, ...params}
  const [tick, setTick] = useState(0);
  const bump = () => setTick((t) => t + 1);

  useEffect(() => { (async () => { await db(); setLogged((await getSetting('logged')) === '1'); setReady(true); })(); }, []);
  useEffect(() => {
    const h = BackHandler.addEventListener('hardwareBackPress', () => { if (over) { setOver(null); bump(); return true; } return false; });
    return () => h.remove();
  }, [over]);

  if (!ready) return <View style={{ flex: 1, justifyContent: 'center', backgroundColor: C.bg }}><ActivityIndicator color={C.brand} /></View>;
  if (!logged) return <Login onDone={async () => { await setSetting('logged', '1'); setLogged(true); }} />;

  const close = () => { setOver(null); bump(); };
  const nav = { open: setOver, close, bump };
  const body = { Home: <Home nav={nav} />, Menu: <MenuScreen />, Stock: <Stock />, Report: <Reports /> }[tab];

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <View style={{ flex: 1, paddingTop: insets.top }} key={tab + tick}>{body}</View>
      <View style={{ flexDirection: 'row', backgroundColor: C.bg, borderTopWidth: 1, borderColor: C.line, paddingBottom: Math.max(insets.bottom, 8), paddingTop: 8 }}>
        {TABS.map(([n, i]) => (
          <Pressable key={n} onPress={() => setTab(n)} style={{ flex: 1, alignItems: 'center' }}>
            <View style={{ paddingHorizontal: 20, paddingVertical: 6, borderRadius: 16, backgroundColor: tab === n ? C.brandSoft : 'transparent' }}>
              <Feather name={i} size={21} color={tab === n ? C.brand : C.mute} />
            </View>
            <Text style={{ fontSize: 11, marginTop: 2, fontWeight: '600', color: tab === n ? C.brand : C.mute }}>{n}</Text>
          </Pressable>
        ))}
      </View>
      {over && (
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: C.bg, paddingTop: insets.top, paddingBottom: insets.bottom }}>
          {over.name === 'order' && <TableOrder table={over.table} onClose={close} />}
          {over.name === 'tx' && <Transactions range={over.range} onClose={close} />}
          {over.name === 'profile' && <Profile onClose={close} onLogout={async () => { await setSetting('logged', '0'); setOver(null); setLogged(false); }} />}
        </View>
      )}
      <StatusBar style="dark" />
    </View>
  );
}
export default function App() { return <SafeAreaProvider><Root /></SafeAreaProvider>; }
