import { useEffect, useState } from "react";
import { Auth } from "@supabase/ui";
import { supabase } from "../utils/supabaseClient";
import CompanyProfile from "../components/Profiles/CompanyProfile";
import UserProfile from "../components/Profiles/UserProfile";
import AdminProfile from "../components/Profiles/AdminProfile";

function Profile() {
  const { user } = Auth.useUser();
  const [role, setRole] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;

      const storedRole = localStorage.getItem("accessLevel");
      setRole(storedRole);

      try {
        if (storedRole === "user") {
          const { data, error } = await supabase
            .from("profile")
            .select("*")
            .eq("id", user.id)
            .single();

          if (error) throw error;
          setProfileData(data);
        } else if (storedRole === "company") {
          // giả sử "head" là email đăng nhập của company
          const { data, error } = await supabase
            .from("company")
            .select("*")
            .eq("head", user.email)
            .single();

          if (error) throw error;
          setProfileData(data);
        } else {
          // admin hoặc role khác
          setProfileData({});
        }
      } catch (err) {
        console.error("❌ Error fetching profile:", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  if (!user) return <h1>⚠️ Bạn chưa đăng nhập</h1>;
  if (loading) return <h1>Đang tải dữ liệu...</h1>;

  if (role === "user") {
    return <UserProfile user={user} profile={profileData} />;
  } else if (role === "company") {
    return <CompanyProfile user={user} profile={profileData} />;
  } else {
    return <AdminProfile user={user} profile={profileData} />;
  }
}

export default function ProfilePage() {
  return (
    <Auth.UserContextProvider supabaseClient={supabase}>
      <Profile />
    </Auth.UserContextProvider>
  );
}
