import { Auth } from "@supabase/ui";
import { useRouter } from "next/router";
import { supabase } from "../utils/supabaseClient";
import { useState, useEffect } from "react";

const LoginPage = () => {
  const { user } = Auth.useUser();
  const router = useRouter();
  const [type, setType] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const createOrUpdateProfile = async () => {
      if (!user || !type) return;

      setLoading(true);
      try {
        const { data: existing } = await supabase
          .from("profile")
          .select("*")
          .eq("id", user.id)
          .single();

        if (!existing) {
          const { error: insertError } = await supabase.from("profile").insert([
            {
              id: user.id,
              first_name: user.email.split("@")[0],
              last_name: user.email,
              role: type,
            },
          ]);
          if (insertError) throw insertError;
        } else {
          await supabase.from("profile").update({ role: type }).eq("id", user.id);
        }

        router.push("/profile");
      } catch (error) {
        console.error("Error handling profile:", error.message);
        alert("Lỗi khi tạo/cập nhật profile: " + error.message);
      } finally {
        setLoading(false);
      }
    };

    createOrUpdateProfile();
  }, [user, type]);

  // Nếu đang load dữ liệu
  if (loading) return <p className="text-blue-600">Loading...</p>;

  // Nếu chưa login
  if (!user) {
    return (
      <div style={{ maxWidth: 400, margin: "auto", paddingTop: "50px" }}>
        <h1 className="mb-4 text-center text-xl font-semibold">Login As</h1>

        {/* Radio chọn role */}
        <div className="mb-4">
          <label className="mr-4">
            <input
              type="radio"
              name="role"
              value="user"
              onChange={() => setType("user")}
            />{" "}
            User
          </label>
          <label>
            <input
              type="radio"
              name="role"
              value="company"
              onChange={() => setType("company")}
            />{" "}
            Company
          </label>
        </div>

        {/* Auth form */}
        <Auth supabaseClient={supabase} />
      </div>
    );
  }

  return null;
};

export default function Login() {
  return (
    <Auth.UserContextProvider supabaseClient={supabase}>
      <LoginPage />
    </Auth.UserContextProvider>
  );
}
