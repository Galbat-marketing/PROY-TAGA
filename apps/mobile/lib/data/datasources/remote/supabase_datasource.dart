import 'dart:typed_data';
import 'package:supabase_flutter/supabase_flutter.dart';

class SupabaseDataSource {
  final SupabaseClient _client;

  SupabaseDataSource(this._client);

  SupabaseClient get client => _client;

  // Auth
  Future<AuthResponse> signIn(String email, String password) =>
      _client.auth.signInWithPassword(email: email, password: password);

  Future<void> signOut() => _client.auth.signOut();

  // Generic queries
  Future<List<Map<String, dynamic>>> query(String table, {
    String? select,
    String? eq,
    dynamic eqValue,
    String? order,
    bool ascending = false,
    int? limit,
    int? offset,
  }) async {
    dynamic query = _client.from(table).select(select ?? '*');

    if (eq != null && eqValue != null) {
      query = query.eq(eq, eqValue);
    }

    if (order != null) {
      query = query.order(order, ascending: ascending);
    }

    if (limit != null) {
      query = query.limit(limit);
    }

    if (offset != null) {
      query = query.range(offset, offset + (limit ?? 20));
    }

    final response = await query;
    return List<Map<String, dynamic>>.from(response);
  }

  Future<Map<String, dynamic>?> getById(String table, String id) async {
    final response = await _client.from(table).select('*').eq('id', id).single();
    return response;
  }

  Future<Map<String, dynamic>> insert(String table, Map<String, dynamic> data) async {
    final response = await _client.from(table).insert(data).select().single();
    return response;
  }

  Future<void> update(String table, String id, Map<String, dynamic> data) async {
    await _client.from(table).update(data).eq('id', id);
  }

  // Edge Functions
  Future<dynamic> callFunction(String name, Map<String, dynamic> body) async {
    return _client.functions.invoke(name, body: body);
  }

  // Storage
  Future<String> uploadFile(String bucket, String path, Uint8List bytes) async {
    await _client.storage.from(bucket).uploadBinary(path, bytes);
    return _client.storage.from(bucket).getPublicUrl(path);
  }

  // Realtime
  RealtimeChannel subscribe(String table, {
    required void Function(Map<String, dynamic> payload) onInsert,
    void Function(Map<String, dynamic> payload)? onUpdate,
    void Function(Map<String, dynamic> payload)? onDelete,
  }) {
    return _client
        .channel('public:$table')
        .onPostgresChanges(
          event: PostgresChangeEvent.insert,
          schema: 'public',
          table: table,
          callback: (payload) => onInsert(payload.newRecord),
        )
        .onPostgresChanges(
          event: PostgresChangeEvent.update,
          schema: 'public',
          table: table,
          callback: (payload) => onUpdate?.call(payload.newRecord),
        )
        .subscribe();
  }
}
