import { useState, useEffect } from 'react';
import { Auth } from '@supabase/ui';
import { supabase } from '../../utils/supabaseClient';
import { useSpeechSynthesis, useSpeechRecognition } from 'react-speech-kit';
import { useDropzone } from 'react-dropzone';

function UserProfile({ user }) {
  const [edit, setEdit] = useState(false);
  const [newUser, setNewUser] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [disabilityType, setDisabilityType] = useState('');
  const [severity, setSeverity] = useState('');
  const [age, setAge] = useState('');
  const [aadhar, setAadhar] = useState('');
  const [disability, setDisability] = useState('');
  const [location, setLocation] = useState('');
  const [qualifications, setQualifications] = useState('');
  const [publicURL, setPublicURL] = useState(null);
  const [resumeURL, setResumeURL] = useState(null);

  const { getRootProps, getInputProps, acceptedFiles, isDragActive } = useDropzone();

  const files = acceptedFiles.map((file) => (
    <li key={file.path}>{file.path} - {file.size} bytes</li>
  ));

  const { speak } = useSpeechSynthesis();
  const [focusValue, setFocusValue] = useState('');
  const { listen, stop } = useSpeechRecognition({
    onResult: (result) => {
      switch(focusValue) {
        case 'firstname': setFirstName(result); break;
        case 'lastname': setLastName(result); break;
        case 'phonenumber': setPhone(result); break;
        case 'aadhar': setAadhar(result); break;
        case 'age': setAge(result); break;
        case 'severity': setSeverity(result); break;
        case 'location': setLocation(result); break;
        case 'disability': setDisability(result); break;
        case 'disabilitytype': setDisabilityType(result); break;
        case 'qualifications': setQualifications(result); break;
      }
    }
  });

  const setupUser = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('profile')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      console.log('No profile found, creating new user');
      setNewUser(true);
      setEdit(true);
    } else {
      setFirstName(data.first_name || '');
      setLastName(data.last_name || '');
      setPhone(data.mobile || '');
      setDisability(data.disability || '');
      setSeverity(data.severity || '');
      setAadhar(data.cccd || '');
      setLocation(data.place || '');
      setDisabilityType(data.disability_type || '');
      setQualifications(data.qualifications || '');

      const { data: certData, error: certError } = supabase.storage
        .from('certificate')
        .getPublicUrl(`public/${user.id}.pdf`);

      if (!certError) setPublicURL(certData.publicUrl);

      const { data: resumeData, error: resumeError } = supabase.storage
        .from('resume')
        .getPublicUrl(`public/${user.id}.pdf`);

      if (!resumeError) setResumeURL(resumeData.publicUrl);
    }
  };

  useEffect(() => {
    setupUser();
    speak({ text: 'Do you want to enable voice recognition for filling form. Speak yes or no.' });
  }, [user]);

  const submitForm = async () => {
    if (newUser) {
      const { data, error } = await supabase
        .from('profile')
        .insert([{
          id: user.id,
          first_name: firstName,
          last_name: lastName,
          mobile: phone,
          cccd: aadhar,
          age: age,
          place: location,
          disability_type: disabilityType,
          disability: disability,
          severity: severity,
          qualifications: qualifications,
        }]);
      if (!error) setNewUser(false);
    } else {
      await supabase
        .from('profile')
        .update({
          first_name: firstName,
          last_name: lastName,
          mobile: phone,
          cccd: aadhar,
          age: age,
          place: location,
          disability_type: disabilityType,
          disability: disability,
          severity: severity,
          qualifications: qualifications,
        })
        .eq('id', user.id);
    }
  };

  const handleFileUpload = async (event, bucket) => {
    const file = event.target.files[0];
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(`public/${user.id}.pdf`, file, { upsert: true });

    if (!error) {
      const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(`public/${user.id}.pdf`);
      if(bucket === 'certificate') setPublicURL(urlData.publicUrl);
      if(bucket === 'resume') setResumeURL(urlData.publicUrl);
    }
  };

  const formResponse = (e) => {
    e.preventDefault();
    if (edit) {
      setEdit(false);
      submitForm();
    } else {
      setEdit(true);
    }
  };

  return (
    <div className="p-10">
      <h3 className="text-3xl font-medium mb-6">Personal Information</h3>
      <form className="space-y-6" onSubmit={formResponse}>
        {/* First & Last Name */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label>First Name</label>
            <input
              type="text"
              value={firstName}
              disabled={!edit}
              onChange={(e) => setFirstName(e.target.value)}
              onFocus={() => setFocusValue('firstname')}
              className="border rounded w-full p-2"
            />
          </div>
          <div>
            <label>Last Name</label>
            <input
              type="text"
              value={lastName}
              disabled={!edit}
              onChange={(e) => setLastName(e.target.value)}
              onFocus={() => setFocusValue('lastname')}
              className="border rounded w-full p-2"
            />
          </div>
        </div>

        {/* Phone & Age */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label>Phone</label>
            <input
              type="tel"
              value={phone}
              disabled={!edit}
              onChange={(e) => setPhone(e.target.value)}
              onFocus={() => setFocusValue('phonenumber')}
              className="border rounded w-full p-2"
            />
          </div>
          <div>
            <label>Age</label>
            <input
              type="number"
              value={age}
              disabled={!edit}
              onChange={(e) => setAge(e.target.value)}
              onFocus={() => setFocusValue('age')}
              className="border rounded w-full p-2"
            />
          </div>
        </div>

        {/* Disability Type & Severity */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label>Disability Type</label>
            <select
              value={disabilityType}
              disabled={!edit}
              onChange={(e) => setDisabilityType(e.target.value)}
              onFocus={() => setFocusValue('disabilitytype')}
              className="border rounded w-full p-2"
            >
              <option value="">Select Type</option>
              <option value="Physical">Physical</option>
              <option value="Sensory">Sensory</option>
              <option value="Mental">Mental</option>
              <option value="Intellectual">Intellectual</option>
            </select>
          </div>
          <div>
            <label>Severity</label>
            <input
              type="number"
              value={severity}
              disabled={!edit}
              onChange={(e) => setSeverity(e.target.value)}
              onFocus={() => setFocusValue('severity')}
              className="border rounded w-full p-2"
            />
          </div>
        </div>

        {/* Location, Disability, Aadhar, Qualifications */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label>Location</label>
            <input
              type="text"
              value={location}
              disabled={!edit}
              onChange={(e) => setLocation(e.target.value)}
              onFocus={() => setFocusValue('location')}
              className="border rounded w-full p-2"
            />
          </div>
          <div>
            <label>Disability</label>
            <input
              type="text"
              value={disability}
              disabled={!edit}
              onChange={(e) => setDisability(e.target.value)}
              onFocus={() => setFocusValue('disability')}
              className="border rounded w-full p-2"
            />
          </div>
        </div>

        <div>
          <label>Aadhar</label>
          <input
            type="text"
            value={aadhar}
            disabled={!edit}
            onChange={(e) => setAadhar(e.target.value)}
            onFocus={() => setFocusValue('aadhar')}
            className="border rounded w-full p-2"
          />
        </div>

        <div>
          <label>Qualifications</label>
          <input
            type="text"
            value={qualifications}
            disabled={!edit}
            onChange={(e) => setQualifications(e.target.value)}
            onFocus={() => setFocusValue('qualifications')}
            className="border rounded w-full p-2"
          />
        </div>

        {/* Upload Certificate & Resume */}
        <div>
          <label>Certificate</label>
          <input
            type="file"
            disabled={!edit}
            onChange={(e) => handleFileUpload(e, 'certificate')}
            className="border rounded w-full p-2"
          />
          {publicURL && <a href={publicURL} target="_blank" className="text-blue-500">View Certificate</a>}
        </div>

        <div>
          <label>Resume</label>
          <input
            type="file"
            disabled={!edit}
            onChange={(e) => handleFileUpload(e, 'resume')}
            className="border rounded w-full p-2"
          />
          {resumeURL && <a href={resumeURL} target="_blank" className="text-blue-500">View Resume</a>}
        </div>

        <button type="submit" className="bg-blue-500 text-white px-6 py-2 rounded">
          {edit ? 'Save' : 'Edit'}
        </button>
      </form>
    </div>
  );
}

export default function ProfilePage() {
  const { user } = Auth.useUser();
  if (!user) return <p>Please log in to view your profile</p>;
  return <UserProfile user={user} />;
}
