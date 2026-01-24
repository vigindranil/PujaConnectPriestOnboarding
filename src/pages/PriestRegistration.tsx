import React from 'react';
import { useNavigate } from 'react-router-dom';
import PriestRegistrationStepper from '../components/PriestRegistrationStepper';

interface PriestRegistrationFormData {
  registrationMode: 'self' | 'survey' | '';
  mobileNumber: string;
  alternateMobile?: string;
  emailAddress?: string;
  otpVerified: boolean;
  otpCode?: string;
  fullName: string;
  parentName: string;
  dateOfBirth: string;
  gender: string;
  identityType: 'aadhaar' | 'manual' | '';
  documentType: string;
  documentNumber: string;
  documentURL?: string;
  houseNumber: string;
  street: string;
  city: string;
  postOffice: string;
  pinCode: string;
  state: string;
  district: string;
  policeStation: string;
  permanentSameAsPresent: boolean;
  permanentHouseNumber?: string;
  permanentStreet?: string;
  permanentCity?: string;
  permanentPostOffice?: string;
  permanentPinCode?: string;
  permanentState?: string;
  permanentDistrict?: string;
  permanentPoliceStation?: string;
  yearsOfExperience: string;
  primaryLanguage: string;
  additionalLanguages: string[];
  associatedWithTemple: boolean;
  templeName?: string;
  managingAuthority?: string;
  templeAddress?: string;
  templeContactNumber?: string;
  authorizationLetterURL?: string;
  selectedPujas: string[];
}

export const PriestRegistration: React.FC = () => {
  const navigate = useNavigate();

  const handleRegistrationComplete = async (formData: PriestRegistrationFormData) => {
    try {
      // TODO: Replace with actual API call to register priest
      console.log('Priest Registration Data:', formData);
      
      // Simulating API call
      const response = await fetch('http://115.187.62.16:8005/PujaConnectRestAPI/api/priests/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          registrationMode: formData.registrationMode,
          mobileNumber: formData.mobileNumber,
          fullName: formData.fullName,
          parentName: formData.parentName,
          dateOfBirth: formData.dateOfBirth,
          gender: formData.gender,
          identityType: formData.identityType,
          documentType: formData.documentType,
          documentNumber: formData.documentNumber,
          address: {
            house: formData.houseNumber,
            street: formData.street,
            city: formData.city,
            postOffice: formData.postOffice,
            pinCode: formData.pinCode,
            state: formData.state,
            district: formData.district,
            policeStation: formData.policeStation,
          },
          professionalDetails: {
            experience: parseInt(formData.yearsOfExperience),
            primaryLanguage: formData.primaryLanguage,
            additionalLanguages: formData.additionalLanguages,
          },
          templeAssociation: {
            associated: formData.associatedWithTemple,
            ...(formData.associatedWithTemple && {
              templeName: formData.templeName,
              managingAuthority: formData.managingAuthority,
              address: formData.templeAddress,
              contactNumber: formData.templeContactNumber,
            }),
          },
          preferredPujas: formData.selectedPujas,
        }),
      });

      if (response.ok) {
        // Show success message and navigate back to dashboard
        alert('Priest registered successfully!');
        navigate('/dashboard');
      } else {
        alert('Failed to register priest. Please try again.');
      }
    } catch (error) {
      console.error('Registration error:', error);
      alert('An error occurred during registration.');
    }
  };

  const handleCancel = () => {
    // Navigate back to dashboard
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-white">
      <PriestRegistrationStepper 
        onComplete={handleRegistrationComplete}
        onCancel={handleCancel}
      />
    </div>
  );
};
