import { Pressable, StyleSheet } from 'react-native';
import { useEffect, useState } from 'react';
import { useTheme, Text } from '../../shared/styles/index.js';
import { loadSupportEmail, openContactUs } from '../../shared/utils/support.js';

export default function ContactUsLink({ label = 'Need help?', onPhoto = false, style }) {
  const { colors } = useTheme();
  const [email, setEmail] = useState(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let alive = true;
    loadSupportEmail().then(found => alive && setEmail(found));
    return () => {
      alive = false;
    };
  }, []);
  if (!email) return null;
  async function open() {
    setFailed(!(await openContactUs(email)));
  }
  if (onPhoto) {
    return (
      <Pressable onPress={open} style={[styles.pill, style]} accessibilityRole="link" accessibilityLabel={`Contact us at ${email}`}>
        <Text style={styles.pillTx}>{failed ? email : 'Contact us'}</Text>
      </Pressable>
    );
  }
  return (
    <Pressable onPress={open} style={[styles.wrap, style]} accessibilityRole="link" accessibilityLabel={`Contact us at ${email}`}>
      <Text style={[styles.tx, { color: colors.authBody }]}>
        {failed ? 'Email us at ' : label ? `${label} ` : ''}
        <Text style={[styles.link, { color: colors.authAccent }]}>{failed ? email : 'Contact us'}</Text>
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { alignSelf: 'center', paddingVertical: 8, paddingHorizontal: 12 },
  tx: { fontSize: 12, textAlign: 'center' },
  link: { fontWeight: '700' },
  pill: { paddingHorizontal: 11, paddingVertical: 5, borderRadius: 99, backgroundColor: 'rgba(0,0,0,0.28)' },
  pillTx: { fontSize: 11, fontWeight: '600', color: '#fff' },
});
