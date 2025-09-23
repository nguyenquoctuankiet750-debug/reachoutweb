import { useEffect, useState } from "react";
import { supabase } from "../../utils/supabaseClient";

export default function UserProfile({ user }) {
  const [loading, setLoading] = useState(true);
  const [edit, setEdit] = useState(false);
  const [newUser, setNewUser] = useState(false);

  // Các state lưu dữ liệu profile
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [disability, setDisability] = useState("");
  const [severity, setSeverity] = useState("");
  const [cccd, setCCCD] = useState("");
  const [location, setLocation] = useState("");
  const [disabilityType, setDisabilityType] = useState("");
  const [qualifications, setQualifications] = useState("");
  const [age, setAge] = useState("");

  // Lấy profile từ Supabase
  const fetchProfile = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("profile")
      .select("*")
      .eq("id", user.id)
      .single();

    if (error || !data) {
      console.log("⚠️ Chưa có profile, bật chế độ nhập mới");
      setNewUser(true);
      setEdit(true);
    } else {
      console.log("✅ Profile:", data);
      setFirstName(data.first_name || "");
      setLastName(data.last_name || "");
      setPhone(data.mobile || "");
      setDisability(data.disability || "");
      setSeverity(data.severity || "");
      setCCCD(data.cccd || "");
      setLocation(data.place || "");
      setDisabilityType(data.disability_type || "");
      setQualifications(data.qualifications || "");
      setAge(data.age || "");
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchProfile();
  }, [user]);

  // Lưu profile
  const saveProfile = async () => {
    const profileData = {
      id: user.id,
      first_name: firstName,
      last_name: lastName,
      mobile: phone,
      disability,
      severity,
      cccd,
      place: location,
      disability_type: disabilityType,
      qualifications,
      age,
    };

    let error;
    if (newUser) {
      ({ error } = await supabase.from("profile").insert([profileData]));
    } else {
      ({ error } = await supabase
        .from("profile")
        .update(profileData)
        .eq("id", user.id));
    }

    if (error) {
      alert("❌ Lỗi khi lưu profile: " + error.message);
    } else {
      alert("✅ Lưu thành công!");
      setEdit(false);
      setNewUser(false);
    }
  };

  if (loading) return <h2>Loading...</h2>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Thông tin cá nhân</h1>

      <div className="grid grid-cols-2 gap-4">
        <input
          type="text"
          placeholder="Nhập họ (ví dụ: Nguyễn)"
          value={lastName}
          disabled={!edit}
          onChange={(e) => setLastName(e.target.value)}
          className="border p-2 rounded"
        />
        <input
          type="text"
          placeholder="Nhập tên (ví dụ: An)"
          value={firstName}
          disabled={!edit}
          onChange={(e) => setFirstName(e.target.value)}
          className="border p-2 rounded"
        />
        <input
          type="text"
          placeholder="Nhập số điện thoại"
          value={phone}
          disabled={!edit}
          onChange={(e) => setPhone(e.target.value)}
          className="border p-2 rounded"
        />
        <input
          type="text"
          placeholder="Nhập CCCD (12 số)"
          value={cccd}
          disabled={!edit}
          onChange={(e) => setCCCD(e.target.value)}
          className="border p-2 rounded"
        />
        <input
          type="number"
          placeholder="Nhập tuổi"
          value={age}
          disabled={!edit}
          onChange={(e) => setAge(e.target.value)}
          className="border p-2 rounded"
        />
        <input
          type="text"
          placeholder="Nhập nơi ở (ví dụ: Đà Nẵng)"
          value={location}
          disabled={!edit}
          onChange={(e) => setLocation(e.target.value)}
          className="border p-2 rounded"
        />
        <input
          type="text"
          placeholder="Loại khuyết tật (nếu có)"
          value={disabilityType}
          disabled={!edit}
          onChange={(e) => setDisabilityType(e.target.value)}
          className="border p-2 rounded"
        />
        <input
          type="text"
          placeholder="Mức độ khuyết tật (ví dụ: Nhẹ / Vừa / Nặng)"
          value={severity}
          disabled={!edit}
          onChange={(e) => setSeverity(e.target.value)}
          className="border p-2 rounded"
        />
        <input
          type="text"
          placeholder="Nhập bằng cấp (ví dụ: Đại học, Cao đẳng)"
          value={qualifications}
          disabled={!edit}
          onChange={(e) => setQualifications(e.target.value)}
          className="border p-2 rounded col-span-2"
        />
      </div>

      <div className="mt-4 flex gap-4">
        {!edit ? (
          <button
            onClick={() => setEdit(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            Sửa
          </button>
        ) : (
          <button
            onClick={saveProfile}
            className="px-4 py-2 bg-green-500 text-white rounded"
          >
            Lưu
          </button>
        )}
      </div>
    </div>
  );
}
