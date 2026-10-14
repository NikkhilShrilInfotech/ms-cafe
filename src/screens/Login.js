import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { C, serif } from '../theme';
import { Btn, Field } from '../ui';

export default function Login({ onDone }) {
  const [u, setU] = useState(''); const [p, setP] = useState(''); const [show, setShow] = useState(false); const [err, setErr] = useState('');
  const go = () => { if (u.trim().toLowerCase() === 'shubham@admin' && p === 'Pass@123') onDone(); else setErr('Incorrect username or password'); };
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }} keyboardShouldPersistTaps="handled">
        <View style={{ alignItems: 'center', marginBottom: 32 }}>
          <View style={{ width: 84, height: 84, borderRadius: 26, backgroundColor: C.brandSoft, alignItems: 'center', justifyContent: 'center' }}>
            <Feather name="coffee" size={38} color={C.brand} />
          </View>
          <Text style={{ fontFamily: serif, fontSize: 38, color: C.ink, marginTop: 16 }}>MS Cafe</Text>
          <Text style={{ color: C.mute, marginTop: 4 }}>A fresh start. A great service.</Text>
        </View>
        <View style={{ backgroundColor: C.card, borderRadius: 24, padding: 20, borderWidth: 1, borderColor: C.line }}>
          <Text style={{ fontSize: 20, fontWeight: '700', color: C.ink, marginBottom: 16 }}>Admin login</Text>
          <Field label="Username" value={u} onChangeText={(t) => { setU(t); setErr(''); }} autoCapitalize="none" placeholder="Enter username" />
          <View>
            <Field label="Password" value={p} onChangeText={(t) => { setP(t); setErr(''); }} secureTextEntry={!show} autoCapitalize="none" placeholder="Enter password" />
            <Pressable onPress={() => setShow(!show)} style={{ position: 'absolute', right: 14, top: 34 }}><Feather name={show ? 'eye-off' : 'eye'} size={20} color={C.mute} /></Pressable>
          </View>
          {err ? <Text style={{ color: C.red, marginBottom: 10 }}>{err}</Text> : null}
          <Btn title="Sign in" icon="log-in" onPress={go} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
