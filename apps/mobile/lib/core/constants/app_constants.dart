class AppConstants {
  AppConstants._();

  static const String appName = 'TAGA ERP';
  static const String supabaseUrl = String.fromEnvironment('SUPABASE_URL');
  static const String supabaseAnonKey = String.fromEnvironment('SUPABASE_ANON_KEY');
  static const int connectTimeout = 30000;
  static const int receiveTimeout = 30000;
  static const int pageSize = 20;
  static const String dateFormat = 'dd/MM/yyyy';
  static const String dateTimeFormat = 'dd/MM/yyyy HH:mm';
}
