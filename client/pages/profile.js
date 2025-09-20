import { useEffect, useState } from "react";
import { Auth } from "@supabase/ui";
import { supabase } from "../utils/supabaseClient";
import CompanyProfile from "../components/Profiles/CompanyProfile";
import UserProfile from "../components/Profiles/UserProfile";
import AdminProfile from "../components/Profiles/AdminProfile";

function Profile() {
  const [item, setItem] = useState(null);
  const { user } = Auth.useUser();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setItem(localStorage.getItem("accessLevel"));

    const fetchProfile = async () => {
      if (user) {
        const { data, error } = await supabase
          .from("profile")
          .select("*")
          .eq("id", user.id)
          .single();

        if (error) {
          console.error("❌ Error fetching profile:", error.message);
        } else {
          setProfileData(data);
          console.log("Profile from DB:", data);
        }
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  if (loading) return <h1>Loading...</h1>;

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

export default function logi() {
  return (
    <Auth.UserContextProvider supabaseClient={supabase}>
      <Profile supabaseClient={supabase}>
        <Auth supabaseClient={supabase} />
      </Profile>
    </Auth.UserContextProvider>
  );
}
