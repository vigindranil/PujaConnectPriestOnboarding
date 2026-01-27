import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PriestRegistrationStepper from '../components/PriestRegistrationStepper';
import { authService } from '../services/authService';

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

  const handleRegistrationComplete = async (
    formData: PriestRegistrationFormData,
    additionalData: {
      registeredUserId: number | null;
      states: Array<{ state_id: number; state_name: string; is_territory: number }>;
      districts: Array<{ district_id: number; district_name: string; state_id: number }>;
      policeStations: Array<{ ps_id: number; ps_name: string; ps_type_id: number }>;
    }
  ) => {
    try {
      console.log('Priest Registration Data:', formData);
      console.log('Additional Data:', additionalData);

      // Get IDs for the selected values
      const selectedState = additionalData.states.find(s => s.state_name === formData.state);
      const selectedDistrict = additionalData.districts.find(d => d.district_name === formData.district);
      const selectedPS = additionalData.policeStations.find(ps => ps.ps_name === formData.policeStation);

      // For permanent address, use the same if permanentSameAsPresent is true
      const permanentState = formData.permanentSameAsPresent
        ? selectedState
        : additionalData.states.find(s => s.state_name === formData.permanentState);
      const permanentDistrict = formData.permanentSameAsPresent
        ? selectedDistrict
        : additionalData.districts.find(d => d.district_name === formData.permanentDistrict);
      const permanentPS = formData.permanentSameAsPresent
        ? selectedPS
        : additionalData.policeStations.find(ps => ps.ps_name === formData.permanentPoliceStation);

      // Prepare profile data according to the API structure
      const profileData = {
        authority_user_id: additionalData.registeredUserId || 0,
        full_name: formData.fullName,
        guardian_name: formData.parentName,
        dob: formData.dateOfBirth,
        gender: formData.gender.charAt(0).toUpperCase() + formData.gender.slice(1),
        present_house_plot_no: formData.houseNumber,
        present_street_locality: formData.street,
        present_city_town_village: formData.city,
        present_post_office: formData.postOffice,
        present_pin_code: formData.pinCode,
        present_state_id: selectedState?.state_id || 0,
        present_state_name: formData.state,
        present_district_id: selectedDistrict?.district_id || 0,
        present_district_name: formData.district,
        present_ps_id: selectedPS?.ps_id || 0,
        present_ps_name: formData.policeStation,
        permanent_house_plot_no: formData.permanentSameAsPresent
          ? formData.houseNumber
          : (formData.permanentHouseNumber || ''),
        permanent_street_locality: formData.permanentSameAsPresent
          ? formData.street
          : (formData.permanentStreet || ''),
        permanent_city_town_village: formData.permanentSameAsPresent
          ? formData.city
          : (formData.permanentCity || ''),
        permanent_post_office: formData.permanentSameAsPresent
          ? formData.postOffice
          : (formData.permanentPostOffice || ''),
        permanent_pin_code: formData.permanentSameAsPresent
          ? formData.pinCode
          : (formData.permanentPinCode || ''),
        permanent_state_id: permanentState?.state_id || 0,
        permanent_state_name: formData.permanentSameAsPresent
          ? formData.state
          : (formData.permanentState || ''),
        permanent_district_id: permanentDistrict?.district_id || 0,
        permanent_district_name: formData.permanentSameAsPresent
          ? formData.district
          : (formData.permanentDistrict || ''),
        permanent_ps_id: permanentPS?.ps_id || 0,
        permanent_ps_name: formData.permanentSameAsPresent
          ? formData.policeStation
          : (formData.permanentPoliceStation || ''),
        entry_user_id: 1
      };

      console.log('Profile Data to be sent:', profileData);

      const response = await authService.savePriestProfile(profileData);

      if (response.status === 0) {
        navigate('/dashboard');
      } else {
        alert(`Failed to save priest profile: ${response.message}`);
      }
    } catch (error) {
      console.error('Profile save error:', error);
      alert('An error occurred while saving the profile.');
    }
  };

  const handleCancel = () => {
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