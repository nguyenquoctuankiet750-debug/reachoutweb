import { useState, useEffect } from "react";
import { Auth } from "@supabase/ui";
import { supabase } from "../../utils/supabaseClient";
import { useSpeechSynthesis, useSpeechRecognition } from "react-speech-kit";

function UserProfile({ user }) {
  const [edit, setEdit] = useState(false);
  const [newUser, setNewUser] = useState(false);

  // Các trường trong Supabase
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [cccd, setCCCD] = useState("");
  const [age, setAge] = useState("");
  const [disabilityType, setDisabilityType] = useState("");
  const [disability, setDisability] = useState("");
  const [severity, setSeverity] = useState(""); // Nhẹ / Trung bình / Nặng
  const [qualifications, setQualifications] = useState("");
  const [place, setPlace] = useState("");
  const [mobile, setMobile] = useState("");

  const { speak } = useSpeechSynthesis();
  const { listen, stop } = useSpeechRecognition({
    onResult: (result) => {
      // Có thể mở rộng: đọc voice nhập vào từng field
    },
  });

  // Load dữ liệu từ Supabase
  useEffect(() => {
    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from("profile")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) {
        console.log("Chưa có profile, cần tạo mới");
        setNewUser(true);
        setEdit(true);
      } else if (data) {
        setFirstName(data.first_name || "");
        setLastName(data.last_name || "");
        setCCCD(data.cccd || "");
        setAge(data.age || "");
        setDisabilityType(data.disability_type || "");
        setDisability(data.disability || "");
        setSeverity(data.severity || "");
        setQualifications(data.qualifications || "");
        setPlace(data.place || "");
        setMobile(data.mobile || "");
      }
    };

    if (user) fetchProfile();
  }, [user]);

  // Lưu dữ liệu vào Supabase
  const saveProfile = async () => {
    const payload = {
      id: user.id,
      first_name: firstName,
      last_name: lastName,
      cccd,
      age,
      disability_type: disabilityType,
      disability,
      severity,
      qualifications,
      place,
      mobile,
    };

    if (newUser) {
      const { error } = await supabase.from("profile").insert([payload]);
      if (error) {
        alert("❌ Lỗi khi tạo profile: " + error.message);
      } else {
        alert("✅ Tạo mới profile thành công!");
        setNewUser(false);
        setEdit(false);
      }
    } else {
      const { error } = await supabase
        .from("profile")
        .update(payload)
        .eq("id", user.id);

      if (error) {
        alert("❌ Lỗi khi lưu profile: " + error.message);
      } else {
        alert("✅ Cập nhật profile thành công!");
        setEdit(false);
      }
    }
  };

  return (
    <div className="p-10">
      <h1 className="text-2xl font-bold mb-5">Thông tin cá nhân</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          saveProfile();
        }}
        className="grid gap-4 md:grid-cols-2"
      >
        <input
          type="text"
          placeholder="Họ"
          value={firstName}
          disabled={!edit}
          onChange={(e) => setFirstName(e.target.value)}
          onFocus={() =>
            speak({ text: "Nhập họ của bạn. Nhấn Insert để bắt đầu." })
          }
          className="border p-2 rounded"
        />
        <input
          type="text"
          placeholder="Tên"
          value={lastName}
          disabled={!edit}
          onChange={(e) => setLastName(e.target.value)}
          className="border p-2 rounded"
        />
        <input
          type="text"
          placeholder="CCCD"
          value={cccd}
          disabled={!edit}
          onChange={(e) => setCCCD(e.target.value)}
          className="border p-2 rounded"
        />
        <input
          type="number"
          placeholder="Tuổi"
          value={age}
          disabled={!edit}
          onChange={(e) => setAge(e.target.value)}
          className="border p-2 rounded"
        />
        <input
          type="text"
          placeholder="Số điện thoại"
          value={mobile}
          disabled={!edit}
          onChange={(e) => setMobile(e.target.value)}
          className="border p-2 rounded"
        />
        <input
          type="text"
          placeholder="Nơi ở"
          value={place}
          disabled={!edit}
          onChange={(e) => setPlace(e.target.value)}
          className="border p-2 rounded"
        />
        <input
          type="text"
          placeholder="Loại khuyết tật"
          value={disabilityType}
          disabled={!edit}
          onChange={(e) => setDisabilityType(e.target.value)}
          className="border p-2 rounded"
        />
        <input
          type="text"
          placeholder="Chi tiết khuyết tật"
          value={disability}
          disabled={!edit}
          onChange={(e) => setDisability(e.target.value)}
          className="border p-2 rounded"
        />
        <select
          value={severity}
          disabled={!edit}
          onChange={(e) => setSeverity(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">Chọn mức độ</option>
          <option value="Nhẹ">Nhẹ</option>
          <option value="Trung bình">Trung bình</option>
          <option value="Nặng">Nặng</option>
        </select>
        <input
          type="text"
          placeholder="Trình độ học vấn"
          value={qualifications}
          disabled={!edit}
          onChange={(e) => setQualifications(e.target.value)}
          className="border p-2 rounded"
        />
        <button
          type="button"
          onClick={() => (edit ? saveProfile() : setEdit(true))}
          className="col-span-2 p-2 bg-blue-600 text-white rounded"
        >
          {edit ? "Lưu thay đổi" : "Chỉnh sửa"}
        </button>
      </form>
    </div>
  );
}

export default function logi({ user }) {
  return (
    <Auth.UserContextProvider supabaseClient={supabase}>
      <UserProfile user={user} />
    </Auth.UserContextProvider>
  );
}
