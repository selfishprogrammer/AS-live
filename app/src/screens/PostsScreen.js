import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { fetchPosts, createPost } from '../api';
import { clearToken } from '../storage';

export default function PostsScreen({ onLogout }) {
  const [posts, setPosts] = useState([]);
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const data = await fetchPosts();
      setPosts(data);
    } catch (e) {
      // An expired/invalid token should send the user back to auth.
      if (e.message === 'Not authenticated') {
        await handleLogout();
        return;
      }
      setError(e.message);
    }
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await load();
      setLoading(false);
    })();
  }, [load]);

  async function handleRefresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  async function handleCreate() {
    const value = title.trim();
    if (!value) return;

    setSubmitting(true);
    setError(null);
    try {
      const created = await createPost(value);
      // Optimistic-ish update: prepend the new post so the list updates
      // immediately without a full reload.
      setPosts((prev) => [created, ...prev]);
      setTitle('');
    } catch (e) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleLogout() {
    await clearToken();
    onLogout();
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.heading}>Your posts</Text>
        <TouchableOpacity onPress={handleLogout}>
          <Text style={styles.logout}>Log out</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.composer}>
        <TextInput
          style={styles.input}
          placeholder="What's on your mind?"
          value={title}
          onChangeText={setTitle}
          editable={!submitting}
        />
        <TouchableOpacity
          style={[
            styles.button,
            (submitting || !title.trim()) && styles.buttonDisabled,
          ]}
          onPress={handleCreate}
          disabled={submitting || !title.trim()}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Add</Text>
          )}
        </TouchableOpacity>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {loading ? (
        <ActivityIndicator style={{ marginTop: 32 }} size="large" />
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          ListEmptyComponent={
            <Text style={styles.empty}>No posts yet. Add your first one.</Text>
          }
          renderItem={({ item }) => (
            <View style={styles.post}>
              <Text style={styles.postTitle}>{item.title}</Text>
              <Text style={styles.postDate}>
                {new Date(item.created_at).toLocaleString()}
              </Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  heading: { fontSize: 24, fontWeight: '700' },
  logout: { color: '#dc2626', fontWeight: '600' },
  composer: { flexDirection: 'row', marginBottom: 12 },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginRight: 8,
  },
  button: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 20,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  error: { color: '#dc2626', marginBottom: 8 },
  empty: { textAlign: 'center', color: '#666', marginTop: 32 },
  post: {
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    padding: 14,
    marginBottom: 10,
  },
  postTitle: { fontSize: 16, fontWeight: '500' },
  postDate: { fontSize: 12, color: '#888', marginTop: 4 },
});
