import React from 'react';
import { View, Text, Pressable, TextInput, Modal, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { C, serif } from './theme';

export const Btn = ({ title, onPress, icon, kind = 'primary', style, disabled }) => {
  const bg = kind === 'primary' ? C.brand : kind === 'dark' ? C.dark : kind === 'danger' ? C.red : C.brandSoft;
  const fg = kind === 'soft' ? C.brand : '#fff';
  return (
    <Pressable onPress={onPress} disabled={disabled} style={({ pressed }) => [s.btn, { backgroundColor: bg, opacity: disabled ? 0.5 : pressed ? 0.85 : 1 }, style]}>
      {icon ? <Feather name={icon} size={18} color={fg} style={{ marginRight: 8 }} /> : null}
      <Text style={{ color: fg, fontWeight: '700', fontSize: 15 }}>{title}</Text>
    </Pressable>
  );
};
export const IconBtn = ({ name, onPress, color = C.ink, bg = C.panel, size = 18 }) => (
  <Pressable onPress={onPress} hitSlop={6} style={({ pressed }) => [s.icon, { backgroundColor: bg, opacity: pressed ? 0.7 : 1 }]}>
    <Feather name={name} size={size} color={color} />
  </Pressable>
);
export const Field = ({ label, style, ...p }) => (
  <View style={[{ marginBottom: 12 }, style]}>
    {label ? <Text style={s.label}>{label}</Text> : null}
    <TextInput placeholderTextColor={C.mute} {...p} style={s.input} />
  </View>
);
export const Title = ({ children, right }) => (
  <View style={s.titleRow}><Text style={s.title}>{children}</Text>{right}</View>
);
export const Empty = ({ icon = 'inbox', text }) => (
  <View style={{ alignItems: 'center', padding: 40 }}>
    <Feather name={icon} size={36} color={C.line} /><Text style={{ color: C.mute, marginTop: 10, textAlign: 'center' }}>{text}</Text>
  </View>
);
export const Sheet = ({ visible, onClose, title, children }) => (
  <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(43,33,27,.45)' }}>
      <Pressable style={{ flex: 1 }} onPress={onClose} />
      <View style={s.sheet}>
        <View style={s.grab} />
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <Text style={[s.title, { fontSize: 22 }]}>{title}</Text>
          <IconBtn name="x" onPress={onClose} />
        </View>
        {children}
      </View>
    </KeyboardAvoidingView>
  </Modal>
);
export const s = StyleSheet.create({
  btn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: 16, paddingVertical: 15, paddingHorizontal: 20 },
  icon: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  label: { color: C.mute, fontSize: 12, fontWeight: '600', marginBottom: 6, marginLeft: 2 },
  input: { backgroundColor: C.card, borderWidth: 1, borderColor: C.line, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 13, fontSize: 16, color: C.ink },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  title: { fontFamily: serif, fontSize: 30, color: C.ink },
  sheet: { backgroundColor: C.bg, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 20, paddingBottom: 30, maxHeight: '88%' },
  grab: { alignSelf: 'center', width: 44, height: 5, borderRadius: 3, backgroundColor: C.line, marginBottom: 14 },
  card: { backgroundColor: C.card, borderRadius: 20, padding: 14, borderWidth: 1, borderColor: C.line },
});
