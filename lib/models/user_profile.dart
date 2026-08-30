class UserProfile {
  final String uid;
  final String email;
  final String name;
  final String companyName;
  final String designation;
  final String employeeId; // Mapped from 'pin' or 'employeeId' for v85 compatibility
  final String mobile;
  final String photoURL;

  UserProfile({
    required this.uid,
    required this.email,
    this.name = '',
    this.companyName = '',
    this.designation = '',
    this.employeeId = '',
    this.mobile = '',
    this.photoURL = '',
  });

  factory UserProfile.fromMap(String uid, Map<dynamic, dynamic>? map) {
    if (map == null) {
      return UserProfile(uid: uid, email: '');
    }
    return UserProfile(
      uid: uid,
      email: map['email']?.toString() ?? '',
      name: map['name']?.toString() ?? '',
      companyName: map['companyName']?.toString() ?? '',
      designation: map['designation']?.toString() ?? '',
      // Support legacy 'pin' field from v85 as well as new 'employeeId'
      employeeId: (map['employeeId'] ?? map['pin'])?.toString() ?? '',
      mobile: map['mobile']?.toString() ?? '',
      photoURL: map['photoURL']?.toString() ?? '',
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'email': email,
      'name': name,
      'companyName': companyName,
      'designation': designation,
      'employeeId': employeeId,
      'pin': employeeId, // Keep 'pin' populated for full v85 data compatibility
      'mobile': mobile,
      'photoURL': photoURL,
    };
  }

  UserProfile copyWith({
    String? name,
    String? companyName,
    String? designation,
    String? employeeId,
    String? mobile,
    String? photoURL,
  }) {
    return UserProfile(
      uid: uid,
      email: email,
      name: name ?? this.name,
      companyName: companyName ?? this.companyName,
      designation: designation ?? this.designation,
      employeeId: employeeId ?? this.employeeId,
      mobile: mobile ?? this.mobile,
      photoURL: photoURL ?? this.photoURL,
    );
  }
}
