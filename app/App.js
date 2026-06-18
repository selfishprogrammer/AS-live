import { useState, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import AuthScreen from './src/screens/AuthScreen';
import PostsScreen from './src/screens/PostsScreen';
import { getToken } from './src/storage';

export default function App() {
  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(true);

  // Restore an existing session on launch.
  useEffect(() => {
    (async () => {
      const token = await getToken();
      setAuthed(!!token);
      setChecking(false);
    })();
  }, []);

  if (checking) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar style="auto" />
      {authed ? (
        <PostsScreen onLogout={() => setAuthed(false)} />
      ) : (
        <AuthScreen onAuthenticated={() => setAuthed(true)} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingTop: 48 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
