import { useEffect, useState } from "react";
import { supabase } from "../../utils/supabaseClient";

export default function CompanyProfile({ user }) {
  const [loading, setLoading] = useState(true);
  const [edit, setEdit] = useState(false);
  const [newCompany, setNewCompany] = useState(false);

  // Các state lưu dữ liệu company profile
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [industry, setIndustry] = useState("");
  const [website, setWebsite] = useState("");
  const [description, setDescription] = useState("");

  // Lấy profile công ty từ Supabase
  const fetchProfile = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("company")
      .select("*")
      .eq("id", user.id)
      .single();

    if (error || !data) {
      console.log("⚠️ Chưa có profile công ty, bật chế độ nhập mới");
      setNewCompany(true);
      setEdit(true);
    } else {
      console.log("✅ Company profile:", data);
      setCompanyName(data.company_name || "");
      setEmail(data.email || "");
      setPhone(data.phone || "");
      setLocation(data.location || "");
      setIndustry(data.industry || "");
      setWebsite(data.website || "");
      setDescription(data.description || "");
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchProfile();
  }, [user]);

  // Lưu profile công ty
  const saveProfile = async () => {
    const companyData = {
      id: user.id,
      company_name: companyName,
      email,
      phone,
      location,
      industry,
      website,
      description,
    };

    let error;
    if (newCompany) {
      ({ error } = await supabase.from("company").insert([companyData]));
    } else {
      ({ error } = await supabase
        .from("company")
        .update(companyData)
        .eq("id", user.id));
    }

    if (error) {
      alert("❌ Lỗi khi lưu company profile: " + error.message);
    } else {
      alert("✅ Lưu thành công!");
      setEdit(false);
      setNewCompany(false);
    }
  };

  if (loading) return <h2>Loading...</h2>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Thông tin công ty</h1>

      <div className="grid grid-cols-2 gap-4">
        <input
          type="text"
          placeholder="Tên công ty (ví dụ: Công ty TNHH ABC)"
          value={companyName}
          disabled={!edit}
          onChange={(e) => setCompanyName(e.target.value)}
          className="border p-2 rounded col-span-2"
        />
        <input
          type="email"
          placeholder="Email công ty (ví dụ: contact@abc.com)"
          value={email}
          disabled={!edit}
          onChange={(e) => setEmail(e.target.value)}
          className="border p-2 rounded"
        />
        <input
          type="text"
          placeholder="Số điện thoại (ví dụ: 0901234567)"
          value={phone}
          disabled={!edit}
          onChange={(e) => setPhone(e.target.value)}
          className="border p-2 rounded"
        />
        <input
          type="text"
          placeholder="Địa chỉ (ví dụ: Hà Nội, Việt Nam)"
          value={location}
          disabled={!edit}
          onChange={(e) => setLocation(e.target.value)}
          className="border p-2 rounded col-span-2"
        />
        <input
          type="text"
          placeholder="Ngành nghề (ví dụ: Công nghệ thông tin, Xây dựng)"
          value={industry}
          disabled={!edit}
          onChange={(e) => setIndustry(e.target.value)}
          className="border p-2 rounded col-span-2"
        />
        <input
          type="text"
          placeholder="Website công ty (ví dụ: https://abc.com)"
          value={website}
          disabled={!edit}
          onChange={(e) => setWebsite(e.target.value)}
          className="border p-2 rounded col-span-2"
        />
        <textarea
          placeholder="Mô tả ngắn gọn về công ty, lĩnh vực hoạt động, sứ mệnh..."
          value={description}
          disabled={!edit}
          onChange={(e) => setDescription(e.target.value)}
          className="border p-2 rounded col-span-2 h-24"
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
