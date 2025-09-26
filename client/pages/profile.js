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

    const fetchData = async () => {
      if (!user) return;

      if (item === "user") {
        const { data, error } = await supabase
          .from("profile")
          .select("*")
          .eq("id", user.id)
          .single();

        if (error) {
          console.error("❌ Error fetching user profile:", error.message);
        } else {
          setProfileData(data);
        }
      }

      if (item === "company") {
        const { data, error } = await supabase
          .from("company")
          .select("*")
          .eq("id", user.id)
          .single();

        if (error) {
          console.error("❌ Error fetching company profile:", error.message);
        } else {
          setProfileData(data);
        }
      }
    };

    fetchData();
  }, [user, item]);

  if (!item || !profileData) {
    return <h1>Loading...</h1>;
  }

  if (item === "user" && localStorage.getItem("supabase.auth.token")) {
    return (
      <div>
        <UserProfile user={user} profile={profileData} />
      </div>
    );
  }

  if (item === "company" && localStorage.getItem("supabase.auth.token")) {
    return (
      <div>
        <CompanyProfile user={user} profile={profileData} />
      </div>
    );
  }

  return (
    <div>
      <AdminProfile user={user} profile={profileData} />
    </div>
  );
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
