import { View, Linking, StyleSheet } from 'react-native';
import { useMemo } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, Text } from '../../shared/styles/index.js';
import LogoMark from '../../components/ui/LogoMark.jsx';
import Button from '../../components/ui/Button.jsx';
export default function UpdateRequiredScreen({ storeUrl }) {
  const { colors } = useTheme();
  const s = useMemo(() => createStyles(colors), [colors]);
  const insets = useSafeAreaInsets();
  return (
    <LinearGradient colors={colors.authGradient} start={{ x: 0, y: 0 }} end={{ x: 0.35, y: 1 }} style={{ flex: 1 }}>
      <View style={[s.body, { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 40 }]}>
        <LogoMark size={65} />
        <Text style={s.title}>Update required</Text>
        <Text style={s.message}>A new version of Spot it is available. Please update the app to keep tracking your cycle.</Text>
        {storeUrl ? (
          <Button style={s.button} onPress={() => Linking.openURL(storeUrl).catch(() => {})}>
            Update now
          </Button>
        ) : (
          <Text style={s.message}>Open the app store on your phone to update Spot it.</Text>
        )}
      </View>
    </LinearGradient>
  );
}
function createStyles(c) {
  return StyleSheet.create({
    body: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
    title: { fontSize: 22, fontWeight: '700', color: c.textPrimary, marginTop: 24, textAlign: 'center' },
    message: { fontSize: 13, lineHeight: 20, color: c.textSecondary, marginTop: 12, textAlign: 'center' },
    button: { marginTop: 28, alignSelf: 'stretch' },
  });
}
