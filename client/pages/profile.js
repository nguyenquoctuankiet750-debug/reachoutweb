import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../utils/supabaseClient";
import { Auth } from "@supabase/ui";

export default function Profile() {
  const { user } = Auth.useUser();
  const router = useRouter();
  const [role, setRole] = useState(null);
  const [profile, setProfile] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push("/login"); // chưa đăng nhập thì về login
      return;
    }

    const savedRole = localStorage.getItem("accessLevel");
    setRole(savedRole);

    const fetchProfile = async () => {
      try {
        if (savedRole === "user") {
          const { data, error } = await supabase
            .from("profile")
            .select("*")
            .eq("id", user.id)
            .maybeSingle();

          if (error) throw error;
          setProfile(data || {});
        }

        if (savedRole === "company") {
          const { data, error } = await supabase
            .from("company")
            .select("*")
            .eq("id", user.id)
            .maybeSingle();

          if (error) throw error;
          setProfile(data || {});
        }
      } catch (err) {
        console.error("❌ Lỗi khi lấy profile:", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user, router]);

  // Hàm update profile
  const handleSave = async () => {
    setSaving(true);
    try {
      if (role === "user") {
        const { error } = await supabase
          .from("profile")
          .update({
            first_name: profile.first_name,
            last_name: profile.last_name,
            age: profile.age,
            place: profile.place,
            disability_type: profile.disability_type,
            disability: profile.disability,
            severity: profile.severity,
            qualifications: profile.qualifications,
          })
          .eq("id", user.id);

        if (error) throw error;
      }

      if (role === "company") {
        const { error } = await supabase
          .from("company")
          .update({
            name: profile.name,
            head: profile.head,
            mobile: profile.mobile,
            website: profile.website,
            gstin: profile.gstin,
          })
          .eq("id", user.id);

        if (error) throw error;
      }

      alert("✅ Lưu thông tin thành công!");
    } catch (err) {
      console.error("❌ Lỗi khi lưu:", err.message);
      alert("⚠️ Có lỗi xảy ra khi lưu thông tin.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="p-6">⏳ Đang tải dữ liệu...</p>;
  if (!profile) return <p className="p-6">⚠️ Không tìm thấy dữ liệu profile.</p>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Trang Hồ Sơ</h1>

      {role === "user" && (
        <div className="bg-white shadow-md rounded-lg p-6 space-y-4">
          <h2 className="text-xl font-semibold">Thông tin User</h2>
          <label className="block">
            Họ:{" "}
            <input
              className="border p-2 w-full"
              value={profile.first_name || ""}
              onChange={(e) =>
                setProfile({ ...profile, first_name: e.target.value })
              }
            />
          </label>
          <label className="block">
            Tên:{" "}
            <input
              className="border p-2 w-full"
              value={profile.last_name || ""}
              onChange={(e) =>
                setProfile({ ...profile, last_name: e.target.value })
              }
            />
          </label>
          <label className="block">
            Tuổi:{" "}
            <input
              className="border p-2 w-full"
              type="number"
              value={profile.age || ""}
              onChange={(e) =>
                setProfile({ ...profile, age: e.target.value })
              }
            />
          </label>
          <label className="block">
            Nơi ở:{" "}
            <input
              className="border p-2 w-full"
              value={profile.place || ""}
              onChange={(e) =>
                setProfile({ ...profile, place: e.target.value })
              }
            />
          </label>
          <label className="block">
            Trình độ:{" "}
            <input
              className="border p-2 w-full"
              value={profile.qualifications || ""}
              onChange={(e) =>
                setProfile({ ...profile, qualifications: e.target.value })
              }
            />
          </label>

          <button
            className="bg-blue-600 text-white px-4 py-2 rounded"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Đang lưu..." : "💾 Lưu thông tin"}
          </button>
        </div>
      )}

      {role === "company" && (
        <div className="bg-white shadow-md rounded-lg p-6 space-y-4">
          <h2 className="text-xl font-semibold">Thông tin Company</h2>
          <label className="block">
            Tên công ty:{" "}
            <input
              className="border p-2 w-full"
              value={profile.name || ""}
              onChange={(e) =>
                setProfile({ ...profile, name: e.target.value })
              }
            />
          </label>
          <label className="block">
            Người đứng đầu:{" "}
            <input
              className="border p-2 w-full"
              value={profile.head || ""}
              onChange={(e) =>
                setProfile({ ...profile, head: e.target.value })
              }
            />
          </label>
          <label className="block">
            Số điện thoại:{" "}
            <input
              className="border p-2 w-full"
              value={profile.mobile || ""}
              onChange={(e) =>
                setProfile({ ...profile, mobile: e.target.value })
              }
            />
          </label>
          <label className="block">
            Website:{" "}
            <input
              className="border p-2 w-full"
              value={profile.website || ""}
              onChange={(e) =>
                setProfile({ ...profile, website: e.target.value })
              }
            />
          </label>
          <label className="block">
            GSTIN:{" "}
            <input
              className="border p-2 w-full"
              value={profile.gstin || ""}
              onChange={(e) =>
                setProfile({ ...profile, gstin: e.target.value })
              }
            />
          </label>

          <button
            className="bg-blue-600 text-white px-4 py-2 rounded"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Đang lưu..." : "💾 Lưu thông tin"}
          </button>
        </div>
      )}
    </div>
  );
}
