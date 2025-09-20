import { useEffect, useState } from "react";
import { Auth } from "@supabase/ui";
import { supabase } from "../utils/supabaseClient";
import CompanyProfile from "../components/Profiles/CompanyProfile";
import UserProfile from "../components/Profiles/UserProfile";
import AdminProfile from "../components/Profiles/AdminProfile";

function Profile() {
  const { user } = Auth.useUser();
  const [accessLevel, setAccessLevel] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const level = localStorage.getItem("accessLevel");
    setAccessLevel(level);

    const fetchProfile = async () => {
      if (user) {
        const { data, error } = await supabase
          .from("profile")
          .select("*")
          .eq("id", user.id)
          .single();

        if (error && error.code !== "PGRST116") {
          console.error("Error fetching profile:", error.message);
        } else {
          setProfileData(data || null); // nếu chưa có row thì data = null
        }
      }
      setLoading(false);
    };

    fetchProfile();
  }, [user]);

  if (!user) {
    return <h1 className="text-center mt-10">Vui lòng đăng nhập trước</h1>;
  }

  if (loading) {
    return <h1 className="text-center mt-10">Đang tải dữ liệu...</h1>;
  }

  if (accessLevel === "user") {
    return <UserProfile user={user} profile={profileData} />;
  }

  if (accessLevel === "company") {
    return <CompanyProfile user={user} profile={profileData} />;
  }

  return <AdminProfile user={user} profile={profileData} />;
}

export default function ProfileWrapper() {
  return (
    <Auth.UserContextProvider supabaseClient={supabase}>
      <Profile />
    </Auth.UserContextProvider>
  );
}
