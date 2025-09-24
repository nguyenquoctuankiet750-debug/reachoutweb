import { useEffect, useState } from "react";
import { Auth } from "@supabase/ui";
import { supabase } from "../utils/supabaseClient";
import CompanyProfile from "../components/Profiles/CompanyProfile";
import UserProfile from "../components/Profiles/UserProfile";
import AdminProfile from "../components/Profiles/AdminProfile";

function Profile() {
  const { user } = Auth.useUser();
  const [item, setItem] = useState(null);
  const [profileData, setProfileData] = useState(null);

  useEffect(() => {
    if (!user) return;

    // lấy kiểu (user/company) từ localStorage
    const accessLevel = localStorage.getItem("accessLevel");
    setItem(accessLevel);

    const fetchProfile = async () => {
      try {
        if (accessLevel === "user") {
          const { data, error } = await supabase
            .from("profile")
            .select("*")
            .eq("id", user.id)
            .single();

          if (error) throw error;
          setProfileData(data);
        } else if (accessLevel === "company") {
          const { data, error } = await supabase
            .from("company")
            .select("*")
            .eq("id", user.id)
            .single();

          if (error) throw error;
          setProfileData(data);
        } else {
          // mặc định admin
          setProfileData({});
        }
      } catch (err) {
        console.error("❌ Error fetching profile:", err.message);
      }
    };

    fetchProfile();
  }, [user]);

  if (!user) return <h1>⚠️ Bạn chưa đăng nhập</h1>;
  if (!item || !profileData) return <h1>Loading...</h1>;

  if (item === "user") {
    return (
      <div>
        <UserProfile user={user} profile={profileData} />
      </div>
    );
  } else if (item === "company") {
    return (
      <div>
        <CompanyProfile user={user} profile={profileData} />
      </div>
    );
  } else {
    return (
      <div>
        <AdminProfile user={user} profile={profileData} />
      </div>
    );
  }
}

export default function ProfilePage() {
  return (
    <Auth.UserContextProvider supabaseClient={supabase}>
      <Profile supabaseClient={supabase}>
        <Auth supabaseClient={supabase} />
      </Profile>
    </Auth.UserContextProvider>
  );
}
