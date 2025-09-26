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

  useEffect(() => {
    setItem(localStorage.getItem("accessLevel"));

    const fetchProfile = async () => {
      if (!user) return;

      if (item === "user") {
        const { data, error } = await supabase
          .from("profile")
          .select("*")
          .eq("id", user.id)
          .single();

        if (!error) setProfileData(data);
        else console.error("❌ Error fetching user profile:", error.message);
      } else if (item === "company") {
        const { data, error } = await supabase
          .from("company")
          .select("*")
          .eq("id", user.id)
          .single();

        if (!error) setProfileData(data);
        else console.error("❌ Error fetching company profile:", error.message);
      }
    };

    fetchProfile();
  }, [user, item]);

  if (!item || !profileData) {
    return <h1>Loading...</h1>;
  }

  if (item === "user" && localStorage.getItem("supabase.auth.token")) {
    return <UserProfile user={user} profile={profileData} />;
  }

  if (item === "company" && localStorage.getItem("supabase.auth.token")) {
    return <CompanyProfile user={user} profile={profileData} />;
  }

  return <AdminProfile user={user} />;
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
