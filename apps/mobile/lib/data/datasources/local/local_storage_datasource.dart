import 'dart:convert';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:hive_flutter/hive_flutter.dart';

class LocalStorageDataSource {
  final FlutterSecureStorage _secureStorage;

  LocalStorageDataSource(this._secureStorage);

  // Secure storage (tokens, credentials)
  Future<void> saveSecure(String key, String value) =>
      _secureStorage.write(key: key, value: value);

  Future<String?> readSecure(String key) =>
      _secureStorage.read(key: key);

  Future<void> deleteSecure(String key) =>
      _secureStorage.delete(key: key);

  // Hive cache (offline data)
  Future<void> cacheData(String key, dynamic data) async {
    final box = await Hive.openBox('taga_cache');
    await box.put(key, jsonEncode(data));
  }

  Future<dynamic> getCachedData(String key) async {
    final box = await Hive.openBox('taga_cache');
    final data = box.get(key);
    if (data == null) return null;
    return jsonDecode(data);
  }

  Future<void> clearCache() async {
    final box = await Hive.openBox('taga_cache');
    await box.clear();
  }

  // Sync queue
  Future<void> addToSyncQueue(Map<String, dynamic> operation) async {
    final box = await Hive.openBox('sync_queue');
    final index = box.length;
    await box.put(index.toString(), jsonEncode(operation));
  }

  Future<List<Map<String, dynamic>>> getSyncQueue() async {
    final box = await Hive.openBox('sync_queue');
    return box.values.map((e) => jsonDecode(e) as Map<String, dynamic>).toList();
  }

  Future<void> clearSyncQueue() async {
    final box = await Hive.openBox('sync_queue');
    await box.clear();
  }
}
