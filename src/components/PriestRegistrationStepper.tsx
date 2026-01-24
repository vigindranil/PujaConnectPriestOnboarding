import { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft, Check, Menu, ArrowLeft, Phone, Mail, User, Calendar, MapPin, Briefcase, Building2, Sparkles } from 'lucide-react';
import { API_CONFIG, getApiUrl } from '../config/api';
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

interface PriestRegistrationStepperProps {
  onComplete: (data: PriestRegistrationFormData) => void;
  onCancel: () => void;
}

export const PriestRegistrationStepper: React.FC<PriestRegistrationStepperProps> = ({
  onComplete,
  onCancel,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [otpSent, setOtpSent] = useState(false);
  const [otpInput, setOtpInput] = useState('');
  const [loadingOtp, setLoadingOtp] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [languages, setLanguages] = useState<Array<{ language_id: number; language_name: string; language_type_id: number }>>([]);
  const [loadingLanguages, setLoadingLanguages] = useState(true);
  const [states, setStates] = useState<Array<{ state_id: number; state_name: string; is_territory: number }>>([]);
  const [loadingStates, setLoadingStates] = useState(true);
  const [districts, setDistricts] = useState<Array<{ district_id: number; district_name: string; state_id: number }>>([]);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [policeStations, setPoliceStations] = useState<Array<{ ps_id: number; ps_name: string; ps_type_id: number }>>([]);
  const [loadingPoliceStations, setLoadingPoliceStations] = useState(false);
  const [temples, setTemples] = useState<Array<{ temple_id: number; temple_name: string; temple_type: string }>>([]);
  const [loadingTemples, setLoadingTemples] = useState(false);
  const [documentTypes, setDocumentTypes] = useState<Array<{ doc_type_id: number; doc_type_name: string }>>([]);
  const [loadingDocumentTypes, setLoadingDocumentTypes] = useState(true);
  const [loadingRegistration, setLoadingRegistration] = useState(false);
  const [registrationError, setRegistrationError] = useState('');
  const [pujaSearchQuery, setPujaSearchQuery] = useState('');
  const [languageSearchQuery, setLanguageSearchQuery] = useState('');
  const [stateSearchQuery, setStateSearchQuery] = useState('');
  const [districtSearchQuery, setDistrictSearchQuery] = useState('');
  const [policeStationSearchQuery, setPoliceStationSearchQuery] = useState('');
  const [documentTypeSearchQuery, setDocumentTypeSearchQuery] = useState('');
  const [templeSearchQuery, setTempleSearchQuery] = useState('');
  
  // Dropdown visibility states
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [showStateDropdown, setShowStateDropdown] = useState(false);
  const [showDistrictDropdown, setShowDistrictDropdown] = useState(false);
  const [showPoliceStationDropdown, setShowPoliceStationDropdown] = useState(false);
  const [showDocumentTypeDropdown, setShowDocumentTypeDropdown] = useState(false);
  const [showTempleDropdown, setShowTempleDropdown] = useState(false);

  // Validation states
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Validation functions
  const validateField = (field: string, value: string | boolean | string[] | undefined): string => {
    // Convert value to string for validation, handle undefined/null
    if (typeof value === 'boolean') return '';
    if (Array.isArray(value)) return '';
    const stringValue = value || '';
    
    switch (field) {
      case 'fullName':
        if (!stringValue || stringValue.trim().length < 2) return 'Full name must be at least 2 characters';
        if (!/^[a-zA-Z\s]+$/.test(stringValue)) return 'Full name can only contain letters and spaces';
        return '';
      case 'mobileNumber':
        if (!stringValue || stringValue.length !== 10) return 'Mobile number must be exactly 10 digits';
        if (!/^[0-9]+$/.test(stringValue)) return 'Mobile number can only contain digits';
        return '';
      case 'alternateMobile':
        if (stringValue && stringValue.length !== 10) return 'Alternate mobile must be exactly 10 digits';
        if (stringValue && !/^[0-9]+$/.test(stringValue)) return 'Alternate mobile can only contain digits';
        return '';
      case 'emailAddress':
        if (stringValue && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(stringValue)) return 'Please enter a valid email address';
        return '';
      case 'parentName':
        if (!stringValue || stringValue.trim().length < 2) return 'Parent name must be at least 2 characters';
        if (!/^[a-zA-Z\s]+$/.test(stringValue)) return 'Parent name can only contain letters and spaces';
        return '';
      case 'dateOfBirth': {
        if (!stringValue) return 'Date of birth is required';
        const today = new Date();
        const birthDate = new Date(stringValue);
        const age = today.getFullYear() - birthDate.getFullYear();
        if (age < 18 || age > 100) return 'Age must be between 18 and 100 years';
        return '';
      }
      case 'documentNumber':
        if (!stringValue || stringValue.trim().length < 5) return 'Document number must be at least 5 characters';
        return '';
      case 'houseNumber':
        if (!stringValue || stringValue.trim().length < 1) return 'House number is required';
        return '';
      case 'street':
        if (!stringValue || stringValue.trim().length < 2) return 'Street address must be at least 2 characters';
        return '';
      case 'city':
        if (!stringValue || stringValue.trim().length < 2) return 'City must be at least 2 characters';
        if (!/^[a-zA-Z\s]+$/.test(stringValue)) return 'City can only contain letters and spaces';
        return '';
      case 'postOffice':
        if (!stringValue || stringValue.trim().length < 2) return 'Post office must be at least 2 characters';
        return '';
      case 'pinCode':
        if (!stringValue || stringValue.length !== 6) return 'PIN code must be exactly 6 digits';
        if (!/^[0-9]+$/.test(stringValue)) return 'PIN code can only contain digits';
        return '';
      case 'yearsOfExperience':
        if (!stringValue || isNaN(Number(stringValue)) || Number(stringValue) < 0 || Number(stringValue) > 50) {
          return 'Years of experience must be a number between 0 and 50';
        }
        return '';
      case 'templeName':
        if (formData.associatedWithTemple && (!stringValue || stringValue.trim().length < 2)) {
          return 'Temple name is required when associated with temple';
        }
        return '';
      case 'managingAuthority':
        if (formData.associatedWithTemple && (!stringValue || stringValue.trim().length < 2)) {
          return 'Managing authority is required when associated with temple';
        }
        return '';
      case 'templeAddress':
        if (formData.associatedWithTemple && (!stringValue || stringValue.trim().length < 5)) {
          return 'Temple address is required when associated with temple';
        }
        return '';
      case 'templeContactNumber':
        if (formData.associatedWithTemple) {
          if (!stringValue || stringValue.length !== 10) return 'Temple contact must be exactly 10 digits';
          if (!/^[0-9]+$/.test(stringValue)) return 'Temple contact can only contain digits';
        }
        return '';
      default:
        return '';
    }
  };

  const validateCurrentStep = (): boolean => {
    const errors: Record<string, string> = {};
    let isValid = true;

    switch (currentStep) {
      case 2: {
        const fullNameError = validateField('fullName', formData.fullName);
        const mobileError = validateField('mobileNumber', formData.mobileNumber);
        const altMobileError = validateField('alternateMobile', formData.alternateMobile);
        const emailError = validateField('emailAddress', formData.emailAddress);
        
        if (fullNameError) { errors.fullName = fullNameError; isValid = false; }
        if (mobileError) { errors.mobileNumber = mobileError; isValid = false; }
        if (altMobileError) { errors.alternateMobile = altMobileError; isValid = false; }
        if (emailError) { errors.emailAddress = emailError; isValid = false; }
        if (!formData.otpVerified) { errors.otpVerified = 'Please verify your mobile number'; isValid = false; }
        break;
      }
        
      case 3: {
        const parentNameError = validateField('parentName', formData.parentName);
        const dobError = validateField('dateOfBirth', formData.dateOfBirth);
        
        if (parentNameError) { errors.parentName = parentNameError; isValid = false; }
        if (dobError) { errors.dateOfBirth = dobError; isValid = false; }
        if (!formData.gender) { errors.gender = 'Please select gender'; isValid = false; }
        break;
      }
        
      case 5: {
        const docNumError = validateField('documentNumber', formData.documentNumber);
        
        if (!formData.documentType) { errors.documentType = 'Please select document type'; isValid = false; }
        if (docNumError) { errors.documentNumber = docNumError; isValid = false; }
        break;
      }
        
      case 6: {
        const houseError = validateField('houseNumber', formData.houseNumber);
        const streetError = validateField('street', formData.street);
        const cityError = validateField('city', formData.city);
        const postOfficeError = validateField('postOffice', formData.postOffice);
        const pinCodeError = validateField('pinCode', formData.pinCode);
        
        if (houseError) { errors.houseNumber = houseError; isValid = false; }
        if (streetError) { errors.street = streetError; isValid = false; }
        if (cityError) { errors.city = cityError; isValid = false; }
        if (postOfficeError) { errors.postOffice = postOfficeError; isValid = false; }
        if (pinCodeError) { errors.pinCode = pinCodeError; isValid = false; }
        if (!formData.state) { errors.state = 'Please select state'; isValid = false; }
        if (!formData.district) { errors.district = 'Please select district'; isValid = false; }
        if (!formData.policeStation) { errors.policeStation = 'Please select police station'; isValid = false; }
        break;
      }
        
      case 8: {
        const experienceError = validateField('yearsOfExperience', formData.yearsOfExperience);
        
        if (experienceError) { errors.yearsOfExperience = experienceError; isValid = false; }
        if (!formData.primaryLanguage) { errors.primaryLanguage = 'Please select primary language'; isValid = false; }
        break;
      }
        
      case 9:
        if (formData.associatedWithTemple) {
          const templeNameError = validateField('templeName', formData.templeName);
          const managingAuthorityError = validateField('managingAuthority', formData.managingAuthority);
          const templeAddressError = validateField('templeAddress', formData.templeAddress);
          const templeContactError = validateField('templeContactNumber', formData.templeContactNumber);
          
          if (templeNameError) { errors.templeName = templeNameError; isValid = false; }
          if (managingAuthorityError) { errors.managingAuthority = managingAuthorityError; isValid = false; }
          if (templeAddressError) { errors.templeAddress = templeAddressError; isValid = false; }
          if (templeContactError) { errors.templeContactNumber = templeContactError; isValid = false; }
        }
        break;
        
      case 10:
        if (formData.selectedPujas.length === 0) {
          errors.selectedPujas = 'Please select at least one puja';
          isValid = false;
        }
        break;
    }
    
    // Only set validation errors if there are errors to avoid unnecessary re-renders
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
    }
    return isValid;
  };

  // Handle Step 2 completion and API call
  const handleStep2Complete = async () => {
    if (!formData.fullName || !formData.mobileNumber || !formData.otpVerified) {
      return false;
    }

    try {
      setLoadingRegistration(true);
      setRegistrationError('');

      const priestData = {
        user_name: formData.fullName,
        contact_no: formData.mobileNumber,
        alternate_contact_no: formData.alternateMobile || formData.mobileNumber,
        registration_mode: formData.registrationMode === 'self' ? 1 : 2,
        user_type_id: 1, // Priest user type
        email: formData.emailAddress || '',
        entry_user_id: 1 // Current user ID
      };

      const response = await authService.registerPriest(priestData);
      
      if (response.status === 0) {
        // Registration successful, proceed to next step
        return true;
      } else {
        setRegistrationError(response.message || 'Registration failed');
        return false;
      }
    } catch (error) {
      console.error('Registration error:', error);
      setRegistrationError(error instanceof Error ? error.message : 'Registration failed');
      return false;
    } finally {
      setLoadingRegistration(false);
    }
  };

  const [formData, setFormData] = useState<PriestRegistrationFormData>({
    registrationMode: '',
    mobileNumber: '',
    otpVerified: false,
    otpCode: '',
    fullName: '',
    parentName: '',
    dateOfBirth: '',
    gender: '',
    identityType: '',
    documentType: 'aadhaar',
    documentNumber: '',
    houseNumber: '',
    street: '',
    city: '',
    postOffice: '',
    pinCode: '',
    state: '',
    district: '',
    policeStation: '',
    permanentSameAsPresent: true,
    yearsOfExperience: '',
    primaryLanguage: '',
    additionalLanguages: [],
    associatedWithTemple: false,
    selectedPujas: [],
  });

  // Fetch languages from API
  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        const token = await authService.getValidToken();
        const url = getApiUrl(API_CONFIG.ENDPOINTS.MASTER.GET_ALL_LANGUAGES);
        
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'accept': '*/*',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ enc_data: JSON.stringify({ language_type_id: '0' }) }),
        });

        const result = await response.json();
        
        if (API_CONFIG.DEBUG) {
          console.log('Languages API Result:', result);
        }
        
        if (result.status === 0 && result.data) {
          const parsedData = typeof result.data === 'string' ? JSON.parse(result.data) : result.data;
          setLanguages(parsedData);
        }
      } catch (error) {
        console.error('Error fetching languages:', error);
        // Fallback to default languages if API fails
        setLanguages([
          { language_id: 1, language_name: 'Sanskrit', language_type_id: 5 },
          { language_id: 2, language_name: 'Bangla (Bengali)', language_type_id: 1 },
          { language_id: 3, language_name: 'English', language_type_id: 1 },
          { language_id: 4, language_name: 'Hindi', language_type_id: 1 },
        ]);
      } finally {
        setLoadingLanguages(false);
      }
    };

    fetchLanguages();
  }, []);

  // Fetch document types from API
  useEffect(() => {
    const fetchDocumentTypes = async () => {
      try {
        const token = await authService.getValidToken();
        const url = getApiUrl(API_CONFIG.ENDPOINTS.MASTER.GET_DOCUMENT_TYPES);
        
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'accept': '*/*',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ enc_data: JSON.stringify({}) }),
        });

        const result = await response.json();
        
        if (API_CONFIG.DEBUG) {
          console.log('Document Types API Result:', result);
        }
        
        if (result.status === 0 && result.data) {
          const parsedData = typeof result.data === 'string' ? JSON.parse(result.data) : result.data;
          setDocumentTypes(parsedData);
        }
      } catch (error) {
        console.error('Error fetching document types:', error);
        // Fallback to default document types
        setDocumentTypes([
          { doc_type_id: 1, doc_type_name: 'Aadhaar Card' },
          { doc_type_id: 2, doc_type_name: 'PAN Card' },
          { doc_type_id: 3, doc_type_name: 'Voter ID' },
          { doc_type_id: 4, doc_type_name: 'Passport' },
          { doc_type_id: 5, doc_type_name: 'Driving License' },
        ]);
      } finally {
        setLoadingDocumentTypes(false);
      }
    };

    fetchDocumentTypes();
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.relative')) {
        setShowLanguageDropdown(false);
        setShowStateDropdown(false);
        setShowDistrictDropdown(false);
        setShowPoliceStationDropdown(false);
        setShowDocumentTypeDropdown(false);
        setShowTempleDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fetch states from API
  useEffect(() => {
    const fetchStates = async () => {
      try {
        const token = await authService.getValidToken();
        const url = getApiUrl(API_CONFIG.ENDPOINTS.MASTER.GET_STATES);
        
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'accept': '*/*',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ enc_data: JSON.stringify({ country_id: '75' }) }),
        });

        const result = await response.json();
        
        if (API_CONFIG.DEBUG) {
          console.log('States API Result:', result);
        }
        
        if (result.status === 0 && result.data) {
          const parsedData = typeof result.data === 'string' ? JSON.parse(result.data) : result.data;
          setStates(parsedData);
        }
      } catch (error) {
        console.error('Error fetching states:', error);
      } finally {
        setLoadingStates(false);
      }
    };

    fetchStates();
  }, []);

  // Fetch districts when state changes
  useEffect(() => {
    if (!formData.state) {
      setDistricts([]);
      return;
    }

    const fetchDistricts = async () => {
      setLoadingDistricts(true);
      try {
        const token = await authService.getValidToken();
        const url = getApiUrl(API_CONFIG.ENDPOINTS.MASTER.GET_DISTRICTS);
        
        // Find the state_id for the selected state
        const selectedState = states.find(s => s.state_name === formData.state);
        if (!selectedState) return;
        
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'accept': '*/*',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ enc_data: JSON.stringify({ state_id: selectedState.state_id.toString() }) }),
        });

        const result = await response.json();
        
        if (API_CONFIG.DEBUG) {
          console.log('Districts API Result:', result);
        }
        
        if (result.status === 0 && result.data) {
          const parsedData = typeof result.data === 'string' ? JSON.parse(result.data) : result.data;
          setDistricts(parsedData);
        }
      } catch (error) {
        console.error('Error fetching districts:', error);
      } finally {
        setLoadingDistricts(false);
      }
    };

    fetchDistricts();
  }, [formData.state, states]);

  // Fetch police stations when district changes
  useEffect(() => {
    if (!formData.district) {
      setPoliceStations([]);
      return;
    }

    const fetchPoliceStations = async () => {
      setLoadingPoliceStations(true);
      try {
        const token = await authService.getValidToken();
        const url = getApiUrl(API_CONFIG.ENDPOINTS.MASTER.GET_POLICE_STATIONS);
        
        // Find the district_id for the selected district
        const selectedDistrict = districts.find(d => d.district_name === formData.district);
        if (!selectedDistrict) return;
        
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'accept': '*/*',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ enc_data: JSON.stringify({ district_id: selectedDistrict.district_id.toString() }) }),
        });

        const result = await response.json();
        
        if (API_CONFIG.DEBUG) {
          console.log('Police Stations API Result:', result);
        }
        
        if (result.status === 0 && result.data) {
          const parsedData = typeof result.data === 'string' ? JSON.parse(result.data) : result.data;
          setPoliceStations(parsedData);
        }
      } catch (error) {
        console.error('Error fetching police stations:', error);
      } finally {
        setLoadingPoliceStations(false);
      }
    };

    fetchPoliceStations();
  }, [formData.district, districts]);

  // Fetch temples when state changes
  useEffect(() => {
    if (!formData.state) {
      setTemples([]);
      return;
    }

    const fetchTemples = async () => {
      setLoadingTemples(true);
      try {
        const token = await authService.getValidToken();
        const url = getApiUrl(API_CONFIG.ENDPOINTS.MASTER.GET_TEMPLES);
        
        // Find the state_id for the selected state
        const selectedState = states.find(s => s.state_name === formData.state);
        if (!selectedState) return;
        
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'accept': '*/*',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ enc_data: JSON.stringify({ state_id: selectedState.state_id.toString(), district_id: '0' }) }),
        });

        const result = await response.json();
        
        if (API_CONFIG.DEBUG) {
          console.log('Temples API Result:', result);
        }
        
        if (result.status === 0 && result.data) {
          const parsedData = typeof result.data === 'string' ? JSON.parse(result.data) : result.data;
          setTemples(parsedData);
        }
      } catch (error) {
        console.error('Error fetching temples:', error);
      } finally {
        setLoadingTemples(false);
      }
    };

    fetchTemples();
  }, [formData.state, states]);

  const totalSteps = 10;
  const stepTitles = ['Mode', 'Contact', 'Personal', 'Identity', 'Document', 'Address', 'Permanent', 'Professional', 'Temple', 'Pujas'];

  const handleInputChange = (field: keyof PriestRegistrationFormData, value: string | boolean | string[] | undefined) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const pujaOptions = [
    { id: 'griha-pravesh', name: 'Griha Pravesh', priceWithSamagri: '5,000', priceWithoutSamagri: '3,500', duration: '2-3 hrs', emoji: '🏠' },
    { id: 'ganesh', name: 'Ganesh Puja', priceWithSamagri: '2,000', priceWithoutSamagri: '1,200', duration: '1 hr', emoji: '🐘' },
    { id: 'lakshmi', name: 'Lakshmi Puja', priceWithSamagri: '3,500', priceWithoutSamagri: '2,500', duration: '1.5 hrs', emoji: '🪷' },
    { id: 'durga', name: 'Durga Puja', priceWithSamagri: '4,500', priceWithoutSamagri: '3,000', duration: '2 hrs', emoji: '🔱' },
    { id: 'saraswati', name: 'Saraswati Puja', priceWithSamagri: '2,500', priceWithoutSamagri: '1,500', duration: '1 hr', emoji: '📚' },
    { id: 'shiva', name: 'Shiva Puja', priceWithSamagri: '2,800', priceWithoutSamagri: '1,800', duration: '1.5 hrs', emoji: '🕉️' },
    { id: 'hanuman', name: 'Hanuman Puja', priceWithSamagri: '1,800', priceWithoutSamagri: '1,000', duration: '45 min', emoji: '🙏' },
    { id: 'kali', name: 'Kali Puja', priceWithSamagri: '4,000', priceWithoutSamagri: '2,800', duration: '2 hrs', emoji: '⚡' },
    { id: 'vishnu', name: 'Vishnu Puja', priceWithSamagri: '3,200', priceWithoutSamagri: '2,200', duration: '1.5 hrs', emoji: '🌺' },
    { id: 'krishna', name: 'Krishna Puja', priceWithSamagri: '3,000', priceWithoutSamagri: '2,000', duration: '1.5 hrs', emoji: '🪈' },
    { id: 'navratri', name: 'Navratri Puja', priceWithSamagri: '8,000', priceWithoutSamagri: '5,500', duration: '3-4 hrs', emoji: '🌟' },
    { id: 'satyanarayan', name: 'Satyanarayan Puja', priceWithSamagri: '2,200', priceWithoutSamagri: '1,400', duration: '1 hr', emoji: '🙌' },
    { id: 'wedding', name: 'Wedding Ceremony', priceWithSamagri: '15,000', priceWithoutSamagri: '10,000', duration: '4-6 hrs', emoji: '💒' },
    { id: 'thread-ceremony', name: 'Thread Ceremony', priceWithSamagri: '8,000', priceWithoutSamagri: '5,000', duration: '3-4 hrs', emoji: '🧵' },
    { id: 'havana', name: 'Havan/Yagna', priceWithSamagri: '6,000', priceWithoutSamagri: '4,000', duration: '2-3 hrs', emoji: '🔥' },
    { id: 'annaprashan', name: 'Annaprashan', priceWithSamagri: '3,500', priceWithoutSamagri: '2,500', duration: '2 hrs', emoji: '🍼' }
  ];

  // Filter pujas based on search query
  const filteredPujaOptions = pujaOptions.filter(puja => 
    puja.name.toLowerCase().includes(pujaSearchQuery.toLowerCase())
  );

  // Filter functions for all dropdowns
  const filteredLanguages = languages.filter(lang =>
    lang.language_name.toLowerCase().includes(languageSearchQuery.toLowerCase())
  );

  const filteredStates = states.filter(state =>
    state.state_name.toLowerCase().includes(stateSearchQuery.toLowerCase())
  );

  const filteredDistricts = districts.filter(district =>
    district.district_name.toLowerCase().includes(districtSearchQuery.toLowerCase())
  );

  const filteredPoliceStations = policeStations.filter(ps =>
    ps.ps_name.toLowerCase().includes(policeStationSearchQuery.toLowerCase())
  );

  const filteredDocumentTypes = documentTypes.filter(docType =>
    docType.doc_type_name.toLowerCase().includes(documentTypeSearchQuery.toLowerCase())
  );

  const filteredTemples = temples.filter(temple =>
    temple.temple_name.toLowerCase().includes(templeSearchQuery.toLowerCase())
  );

  const togglePuja = (pujaId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedPujas: prev.selectedPujas.includes(pujaId)
        ? prev.selectedPujas.filter(p => p !== pujaId)
        : [...prev.selectedPujas, pujaId],
    }));
  };

  const canProceed = () => {
    // Only check basic requirements, don't run validation here to avoid side effects
    switch (currentStep) {
      case 1:
        return formData.registrationMode !== '';
      case 2:
        return formData.fullName && formData.mobileNumber.length === 10 && formData.otpVerified;
      case 3:
        return formData.parentName && formData.dateOfBirth && formData.gender;
      case 4:
        return formData.identityType !== '';
      case 5:
        return formData.documentType && formData.documentNumber;
      case 6:
        return formData.houseNumber && formData.street && formData.city && formData.postOffice && formData.pinCode.length === 6 && formData.state && formData.district && formData.policeStation;
      case 7:
        if (formData.permanentSameAsPresent) return true;
        return formData.permanentHouseNumber && formData.permanentStreet && formData.permanentCity && formData.permanentPostOffice && formData.permanentPinCode?.length === 6;
      case 8:
        return formData.yearsOfExperience && formData.primaryLanguage;
      case 9:
        if (!formData.associatedWithTemple) return true;
        return formData.templeName && formData.managingAuthority && formData.templeAddress && formData.templeContactNumber;
      case 10:
        return formData.selectedPujas.length > 0;
      default:
        return false;
    }
  };

  const handleSubmit = () => {
    onComplete(formData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 flex flex-col">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-lg border-b border-orange-100 sticky top-0 z-40 shadow-sm">
        <div className="max-w-3xl mx-auto px-6 py-5 flex items-center justify-between">
          <button 
            onClick={currentStep === 1 ? onCancel : () => setCurrentStep(currentStep - 1)} 
            className="p-2.5 hover:bg-orange-50 rounded-xl transition-all duration-200 group"
          >
            {currentStep === 1 ? (
              <Menu className="w-5 h-5 text-gray-600 group-hover:text-orange-600" />
            ) : (
              <ArrowLeft className="w-5 h-5 text-gray-600 group-hover:text-orange-600" />
            )}
          </button>
          <div className="text-center">
            <div className="flex items-center gap-2 justify-center">
              <Sparkles className="w-5 h-5 text-orange-500" />
              <h1 className="text-xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                Priest Registration
              </h1>
            </div>
            <p className="text-sm text-orange-600 font-semibold mt-1">
              {stepTitles[currentStep - 1]} • Step {currentStep} of {totalSteps}
            </p>
          </div>
          <div className="w-10"></div>
        </div>
        
        {/* Progress Bar */}
        <div className="bg-gradient-to-r from-orange-100 to-amber-100 h-2">
          <div 
            className="bg-gradient-to-r from-orange-500 via-orange-600 to-amber-600 h-full transition-all duration-500 ease-out shadow-lg" 
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          ></div>
        </div>

        {/* Step Indicators */}
        <div className="max-w-3xl mx-auto px-6 py-4 overflow-x-auto">
          <div className="flex justify-between items-center gap-2 min-w-max">
            {stepTitles.map((title, idx) => (
              <div
                key={idx}
                className={`flex items-center transition-all duration-300 ${
                  idx + 1 === currentStep ? 'scale-110' : 'scale-100'
                }`}
              >
                <div
                  className={`flex flex-col items-center min-w-[60px] ${
                    idx + 1 === currentStep
                      ? 'text-orange-700'
                      : idx + 1 < currentStep
                      ? 'text-green-600'
                      : 'text-gray-400'
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                      idx + 1 === currentStep
                        ? 'bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-200'
                        : idx + 1 < currentStep
                        ? 'bg-gradient-to-br from-green-500 to-green-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {idx + 1 < currentStep ? <Check className="w-5 h-5" /> : idx + 1}
                  </div>
                  <span className="text-xs font-semibold mt-1.5 text-center">{title}</span>
                </div>
                {idx < stepTitles.length - 1 && (
                  <div className={`w-8 h-0.5 mx-1 ${idx + 1 < currentStep ? 'bg-green-400' : 'bg-gray-200'}`}></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-6 py-8 pb-32">
          
          {/* Step 1: Registration Mode */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-3">Welcome!</h2>
                <p className="text-gray-600">Choose how you'd like to register</p>
              </div>
              
              <div className="space-y-4">
                <button
                  onClick={() => handleInputChange('registrationMode', 'self')}
                  className={`w-full p-6 border-2 rounded-2xl text-left transition-all duration-300 transform hover:scale-[1.02] ${
                    formData.registrationMode === 'self'
                      ? 'border-orange-500 bg-gradient-to-br from-orange-50 to-amber-50 shadow-xl shadow-orange-100'
                      : 'border-gray-200 bg-white hover:border-orange-200 hover:shadow-lg'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                        formData.registrationMode === 'self' ? 'bg-orange-100' : 'bg-gray-100'
                      }`}>
                        <User className={`w-7 h-7 ${formData.registrationMode === 'self' ? 'text-orange-600' : 'text-gray-500'}`} />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 text-lg">Self Registration</h3>
                        <p className="text-sm text-gray-600 mt-1">Register yourself independently</p>
                      </div>
                    </div>
                    <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all ${
                      formData.registrationMode === 'self' 
                        ? 'border-orange-600 bg-orange-600 shadow-lg shadow-orange-200' 
                        : 'border-gray-300'
                    }`}>
                      {formData.registrationMode === 'self' && <Check className="w-4 h-4 text-white" />}
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => handleInputChange('registrationMode', 'survey')}
                  className={`w-full p-6 border-2 rounded-2xl text-left transition-all duration-300 transform hover:scale-[1.02] ${
                    formData.registrationMode === 'survey'
                      ? 'border-orange-500 bg-gradient-to-br from-orange-50 to-amber-50 shadow-xl shadow-orange-100'
                      : 'border-gray-200 bg-white hover:border-orange-200 hover:shadow-lg'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                        formData.registrationMode === 'survey' ? 'bg-orange-100' : 'bg-gray-100'
                      }`}>
                        <Sparkles className={`w-7 h-7 ${formData.registrationMode === 'survey' ? 'text-orange-600' : 'text-gray-500'}`} />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 text-lg">Survey Assisted</h3>
                        <p className="text-sm text-gray-600 mt-1">Get help with registration</p>
                      </div>
                    </div>
                    <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all ${
                      formData.registrationMode === 'survey' 
                        ? 'border-orange-600 bg-orange-600 shadow-lg shadow-orange-200' 
                        : 'border-gray-300'
                    }`}>
                      {formData.registrationMode === 'survey' && <Check className="w-4 h-4 text-white" />}
                    </div>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Contact Information */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Phone className="w-8 h-8 text-orange-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Contact Information</h2>
                <p className="text-gray-600">We'll use this to verify your identity</p>
              </div>
              
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Full Name *</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
                      placeholder="Enter your full name"
                      className={`w-full pl-12 pr-4 py-4 text-base border-2 rounded-xl focus:outline-none focus:ring-4 transition-all ${
                        validationErrors.fullName 
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-100' 
                          : 'border-gray-200 focus:border-orange-500 focus:ring-orange-100'
                      }`}
                    />
                  </div>
                  {validationErrors.fullName && (
                    <p className="text-sm text-red-500 mt-2 font-medium">
                      {validationErrors.fullName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Mobile Number *</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      value={formData.mobileNumber}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 10);
                        handleInputChange('mobileNumber', value);
                      }}
                      onKeyPress={(e) => {
                        if (!/[0-9]/.test(e.key) && !['Backspace', 'Delete', 'Tab', 'Enter'].includes(e.key)) {
                          e.preventDefault();
                        }
                      }}
                      placeholder="Enter 10-digit mobile number"
                      className={`w-full pl-12 pr-4 py-4 text-base border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-orange-100 transition-all ${
                        validationErrors.mobileNumber 
                          ? 'border-red-500 focus:border-red-500' 
                          : 'border-gray-200 focus:border-orange-500'
                      }`}
                      disabled={formData.otpVerified}
                    />
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <p className={`text-xs ${
                      validationErrors.mobileNumber ? 'text-red-500' : 'text-gray-500'
                    }`}>
                      {validationErrors.mobileNumber || `${formData.mobileNumber.length}/10 digits`}
                    </p>
                    {formData.mobileNumber.length === 10 && !validationErrors.mobileNumber && (
                      <span className="text-xs text-green-600 font-semibold">✓ Valid</span>
                    )}
                  </div>
                </div>

                {formData.mobileNumber.length === 10 && !otpSent && (
                  <button
                    onClick={async () => {
                      setLoadingOtp(true);
                      setOtpError('');
                      try {
                        const response = await authService.sendOTP(formData.mobileNumber);
                        if (response.status === 0) {
                          setOtpSent(true);
                          setOtpInput('');
                        } else {
                          setOtpError(response.message || 'Failed to send OTP');
                        }
                      } catch (error) {
                        setOtpError('Error sending OTP. Please try again.');
                        console.error('Send OTP error:', error);
                      } finally {
                        setLoadingOtp(false);
                      }
                    }}
                    disabled={loadingOtp}
                    className={`w-full py-4 rounded-xl font-semibold transition-all transform ${
                      loadingOtp
                        ? 'bg-gray-400 text-white cursor-not-allowed'
                        : 'bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:shadow-lg hover:shadow-orange-200 hover:scale-[1.02]'
                    }`}
                  >
                    {loadingOtp ? 'Sending OTP...' : 'Send OTP'}
                  </button>
                )}
                {otpError && (
                  <div className="bg-red-50 border-2 border-red-200 p-4 rounded-xl">
                    <p className="text-red-700 text-sm font-semibold">{otpError}</p>
                  </div>
                )}

                {otpSent && !formData.otpVerified && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Enter OTP *</label>
                      <p className="text-xs text-gray-600 mb-3">We've sent a 6-digit OTP to {formData.mobileNumber}</p>
                    </div>
                    
                    <div className="flex justify-center gap-2">
                      {[0, 1, 2, 3, 4, 5].map((index) => (
                        <input
                          key={index}
                          ref={(el) => {
                            if (el) {
                              (window as any)[`otp-input-${index}`] = el;
                            }
                          }}
                          type="text"
                          maxLength={1}
                          value={otpInput[index] || ''}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '');
                            if (value) {
                              const newOtp = otpInput.split('');
                              newOtp[index] = value;
                              const updatedOtp = newOtp.join('');
                              setOtpInput(updatedOtp);
                              
                              // Auto-focus next input
                              if (index < 5 && value) {
                                const nextInput = (window as any)[`otp-input-${index + 1}`];
                                if (nextInput) nextInput.focus();
                              }
                            } else {
                              // Handle backspace
                              const newOtp = otpInput.split('');
                              newOtp[index] = '';
                              setOtpInput(newOtp.join(''));
                            }
                          }}
                          onKeyPress={(e) => {
                            if (!/[0-9]/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'Tab' && e.key !== 'Enter') {
                              e.preventDefault();
                            }
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Backspace' && !otpInput[index] && index > 0) {
                              const prevInput = (window as any)[`otp-input-${index - 1}`];
                              if (prevInput) {
                                prevInput.focus();
                                const newOtp = otpInput.split('');
                                newOtp[index - 1] = '';
                                setOtpInput(newOtp.join(''));
                              }
                            }
                          }}
                          onPaste={(e) => {
                            e.preventDefault();
                            const pastedText = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
                            setOtpInput(pastedText);
                            
                            // Focus the last filled input or the next empty one
                            const nextIndex = Math.min(pastedText.length, 5);
                            const targetInput = (window as any)[`otp-input-${nextIndex}`];
                            if (targetInput) targetInput.focus();
                          }}
                          className="w-12 h-12 text-xl font-bold text-center border-2 border-gray-300 rounded-md focus:border-orange-500 focus:outline-none bg-white"
                        />
                      ))}
                    </div>
                  </div>
                )}

                {otpSent && !formData.otpVerified && (
                  <button
                    onClick={async () => {
                      if (otpInput.length === 6) {
                        setLoadingOtp(true);
                        setOtpError('');
                        try {
                          const response = await authService.verifyOTP(formData.mobileNumber, otpInput);
                          if (response.status === 0) {
                            handleInputChange('otpVerified', true);
                            handleInputChange('otpCode', otpInput);
                            setOtpInput('');
                          } else {
                            setOtpError(response.message || 'Failed to verify OTP');
                          }
                        } catch (error) {
                          setOtpError('Error verifying OTP. Please try again.');
                          console.error('Verify OTP error:', error);
                        } finally {
                          setLoadingOtp(false);
                        }
                      }
                    }}
                    disabled={otpInput.length !== 6 || loadingOtp}
                    className={`w-full py-3 rounded-xl font-semibold transition-all ${
                      otpInput.length === 6 && !loadingOtp
                        ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:shadow-lg hover:shadow-orange-200 transform hover:scale-[1.02]'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {loadingOtp ? 'Verifying...' : 'Verify OTP'}
                  </button>
                )}

                {otpSent && !formData.otpVerified && (
                  <button
                    onClick={async () => {
                      setLoadingOtp(true);
                      setOtpError('');
                      try {
                        const response = await authService.sendOTP(formData.mobileNumber);
                        if (response.status === 0) {
                          setOtpInput('');
                        } else {
                          setOtpError(response.message || 'Failed to resend OTP');
                        }
                      } catch (error) {
                        setOtpError('Error resending OTP. Please try again.');
                        console.error('Resend OTP error:', error);
                      } finally {
                        setLoadingOtp(false);
                      }
                    }}
                    disabled={loadingOtp}
                    className="text-blue-600 font-semibold hover:text-blue-700 disabled:text-gray-400"
                  >
                    {loadingOtp ? 'Sending...' : 'Resend OTP'}
                  </button>
                )}

                {formData.otpVerified && (
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 p-5 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                        <Check className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-green-800 font-bold">Mobile Number Verified</p>
                        <p className="text-green-600 text-sm">You can proceed to next step</p>
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Alternate Mobile (Optional)</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      value={formData.alternateMobile || ''}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 10);
                        handleInputChange('alternateMobile', value || '');
                      }}
                      onKeyPress={(e) => {
                        if (!/[0-9]/.test(e.key) && !['Backspace', 'Delete', 'Tab', 'Enter'].includes(e.key)) {
                          e.preventDefault();
                        }
                      }}
                      placeholder="Alternate contact number"
                      className={`w-full pl-12 pr-4 py-4 text-base border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-orange-100 transition-all ${
                        validationErrors.alternateMobile 
                          ? 'border-red-500 focus:border-red-500' 
                          : 'border-gray-200 focus:border-orange-500'
                      }`}
                    />
                  </div>
                  {validationErrors.alternateMobile && (
                    <p className="text-xs text-red-500 mt-1">{validationErrors.alternateMobile}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Email Address (Optional)</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={formData.emailAddress || ''}
                      onChange={(e) => handleInputChange('emailAddress', e.target.value)}
                      placeholder="your.email@example.com"
                      className={`w-full pl-12 pr-4 py-4 text-base border-2 rounded-xl focus:outline-none focus:ring-4 transition-all ${
                        validationErrors.emailAddress 
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-100' 
                          : 'border-gray-200 focus:border-orange-500 focus:ring-orange-100'
                      }`}
                    />
                  </div>
                  {validationErrors.emailAddress && (
                    <p className="text-sm text-red-500 mt-2 font-medium">
                      {validationErrors.emailAddress}
                    </p>
                  )}
                </div>
              </div>
              
              {registrationError && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs font-bold">!</span>
                    </div>
                    <p className="text-red-700 text-sm font-medium">{registrationError}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Personal Details */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <User className="w-8 h-8 text-orange-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Personal Details</h2>
                <p className="text-gray-600">Tell us about yourself</p>
              </div>
              
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Parent's Name *</label>
                  <input
                    type="text"
                    value={formData.parentName}
                    onChange={(e) => handleInputChange('parentName', e.target.value)}
                    placeholder="Father's or Mother's name"
                    className={`w-full px-4 py-4 text-base border-2 rounded-xl focus:outline-none focus:ring-4 transition-all ${
                      validationErrors.parentName 
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-100' 
                        : 'border-gray-200 focus:border-orange-500 focus:ring-orange-100'
                    }`}
                  />
                  {validationErrors.parentName && (
                    <p className="text-sm text-red-500 mt-2 font-medium">
                      {validationErrors.parentName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Date of Birth *</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                      className={`w-full pl-12 pr-4 py-4 text-base border-2 rounded-xl focus:outline-none focus:ring-4 transition-all ${
                        validationErrors.dateOfBirth 
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-100' 
                          : 'border-gray-200 focus:border-orange-500 focus:ring-orange-100'
                      }`}
                    />
                  </div>
                  {validationErrors.dateOfBirth && (
                    <p className="text-sm text-red-500 mt-2 font-medium">
                      {validationErrors.dateOfBirth}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-4">Gender *</label>
                  <div className="grid grid-cols-3 gap-3">
                    {['Male', 'Female', 'Other'].map((gen) => (
                      <label key={gen} className="cursor-pointer">
                        <input
                          type="radio"
                          name="gender"
                          value={gen.toLowerCase()}
                          checked={formData.gender === gen.toLowerCase()}
                          onChange={(e) => handleInputChange('gender', e.target.value)}
                          className="hidden"
                        />
                        <div className={`p-4 text-center rounded-xl border-2 transition-all duration-200 transform hover:scale-105 ${
                          formData.gender === gen.toLowerCase()
                            ? 'border-orange-500 bg-gradient-to-br from-orange-50 to-amber-50 shadow-lg'
                            : 'border-gray-200 bg-white hover:border-orange-200'
                        }`}>
                          <span className={`font-semibold ${formData.gender === gen.toLowerCase() ? 'text-orange-700' : 'text-gray-700'}`}>
                            {gen}
                          </span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Identity Type */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Identity Verification</h2>
                <p className="text-gray-600">Choose your verification method</p>
              </div>
              
              <div className="space-y-4">
                <button
                  onClick={() => handleInputChange('identityType', 'aadhaar')}
                  className={`w-full p-6 border-2 rounded-2xl text-left transition-all duration-300 transform hover:scale-[1.02] ${
                    formData.identityType === 'aadhaar'
                      ? 'border-orange-500 bg-gradient-to-br from-orange-50 to-amber-50 shadow-xl shadow-orange-100'
                      : 'border-gray-200 bg-white hover:border-orange-200 hover:shadow-lg'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                        formData.identityType === 'aadhaar' ? 'bg-orange-100' : 'bg-gray-100'
                      }`}>
                        <span className="text-2xl">🆔</span>
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 text-lg">Aadhaar Card</h3>
                        <p className="text-sm text-gray-600 mt-1">Quick & secure verification</p>
                      </div>
                    </div>
                    <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all ${
                      formData.identityType === 'aadhaar' 
                        ? 'border-orange-600 bg-orange-600 shadow-lg shadow-orange-200' 
                        : 'border-gray-300'
                    }`}>
                      {formData.identityType === 'aadhaar' && <Check className="w-4 h-4 text-white" />}
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => handleInputChange('identityType', 'manual')}
                  className={`w-full p-6 border-2 rounded-2xl text-left transition-all duration-300 transform hover:scale-[1.02] ${
                    formData.identityType === 'manual'
                      ? 'border-orange-500 bg-gradient-to-br from-orange-50 to-amber-50 shadow-xl shadow-orange-100'
                      : 'border-gray-200 bg-white hover:border-orange-200 hover:shadow-lg'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                        formData.identityType === 'manual' ? 'bg-orange-100' : 'bg-gray-100'
                      }`}>
                        <span className="text-2xl">📄</span>
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 text-lg">Manual Documents</h3>
                        <p className="text-sm text-gray-600 mt-1">Upload other ID documents</p>
                      </div>
                    </div>
                    <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all ${
                      formData.identityType === 'manual' 
                        ? 'border-orange-600 bg-orange-600 shadow-lg shadow-orange-200' 
                        : 'border-gray-300'
                    }`}>
                      {formData.identityType === 'manual' && <Check className="w-4 h-4 text-white" />}
                    </div>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Step 5: Document Upload */}
          {currentStep === 5 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Document Details</h2>
                <p className="text-gray-600">Provide your identification document</p>
              </div>
              
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Document Type *</label>
                  {loadingDocumentTypes ? (
                    <div className="flex items-center justify-center px-4 py-4 border-2 border-gray-200 rounded-xl bg-gray-50">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-orange-600"></div>
                      <span className="ml-2 text-gray-600">Loading document types...</span>
                    </div>
                  ) : (
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => {
                          setShowDocumentTypeDropdown(!showDocumentTypeDropdown);
                          setDocumentTypeSearchQuery('');
                        }}
                        className="w-full px-4 py-4 text-left border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all bg-white flex items-center justify-between"
                      >
                        <span className={formData.documentType ? 'text-gray-900' : 'text-gray-500'}>
                          {formData.documentType || 'Select Document Type *'}
                        </span>
                        <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${showDocumentTypeDropdown ? 'rotate-90' : ''}`} />
                      </button>
                      
                      {showDocumentTypeDropdown && (
                        <div className="absolute z-50 w-full mt-1 bg-white border-2 border-gray-200 rounded-xl shadow-xl">
                          <div className="p-3 border-b border-gray-100">
                            <div className="relative">
                              <input
                                type="text"
                                placeholder="Search document types..."
                                value={documentTypeSearchQuery}
                                onChange={(e) => setDocumentTypeSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
                                autoFocus
                              />
                              <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            </div>
                          </div>
                          <div className="max-h-48 overflow-y-auto">
                            {filteredDocumentTypes.length > 0 ? (
                              filteredDocumentTypes.map((docType) => (
                                <div
                                  key={docType.doc_type_id}
                                  onClick={() => {
                                    handleInputChange('documentType', docType.doc_type_name);
                                    setShowDocumentTypeDropdown(false);
                                    setDocumentTypeSearchQuery('');
                                  }}
                                  className={`px-4 py-3 cursor-pointer hover:bg-orange-50 transition-colors ${
                                    formData.documentType === docType.doc_type_name ? 'bg-orange-100 text-orange-700 font-semibold' : 'text-gray-700'
                                  }`}
                                >
                                  {docType.doc_type_name}
                                </div>
                              ))
                            ) : (
                              <div className="px-4 py-3 text-gray-500 text-center">
                                {documentTypeSearchQuery ? `No document types found matching "${documentTypeSearchQuery}"` : 'No document types available'}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Document Number *</label>
                  <input
                    type="text"
                    value={formData.documentNumber}
                    onChange={(e) => handleInputChange('documentNumber', e.target.value)}
                    placeholder="Enter document number"
                    className="w-full px-4 py-4 text-base border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all"
                  />
                </div>

                <div className="bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:border-orange-400 hover:bg-orange-50 transition-all cursor-pointer group">
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-orange-100 transition-all">
                    <span className="text-3xl">📁</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Upload Document</h3>
                  <p className="text-sm text-gray-600">Click to browse or drag and drop</p>
                  <p className="text-xs text-gray-500 mt-2">PDF, JPG or PNG (Max 5MB)</p>
                </div>
              </div>
            </div>
          )}

          {/* Step 6: Address */}
          {currentStep === 6 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-8 h-8 text-orange-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Current Address</h2>
                <p className="text-gray-600">Where do you currently reside?</p>
              </div>
              
              <div className="space-y-4">
                <input 
                  type="text" 
                  placeholder="House Number / Building Name" 
                  value={formData.houseNumber} 
                  onChange={(e) => handleInputChange('houseNumber', e.target.value)} 
                  className="w-full px-4 py-4 text-base border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all" 
                />
                <input 
                  type="text" 
                  placeholder="Street / Lane / Road" 
                  value={formData.street} 
                  onChange={(e) => handleInputChange('street', e.target.value)} 
                  className="w-full px-4 py-4 text-base border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all" 
                />
                <div className="grid grid-cols-2 gap-4">
                  <input 
                    type="text" 
                    placeholder="City / Town" 
                    value={formData.city} 
                    onChange={(e) => handleInputChange('city', e.target.value)} 
                    className="px-4 py-4 text-base border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all" 
                  />
                  <input 
                    type="text" 
                    placeholder="Post Office" 
                    value={formData.postOffice} 
                    onChange={(e) => handleInputChange('postOffice', e.target.value)} 
                    className="px-4 py-4 text-base border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all" 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <input 
                      type="text" 
                      placeholder="PIN Code" 
                      value={formData.pinCode} 
                      onChange={(e) => handleInputChange('pinCode', e.target.value.replace(/\D/g, '').slice(0, 6))} 
                      onKeyPress={(e) => {
                        if (!/[0-9]/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'Tab' && e.key !== 'Enter') {
                          e.preventDefault();
                        }
                      }}
                      className={`px-4 py-4 text-base border-2 rounded-xl focus:outline-none focus:ring-4 transition-all ${
                        validationErrors.pinCode 
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-100' 
                          : 'border-gray-200 focus:border-orange-500 focus:ring-orange-100'
                      }`}
                    />
                    {validationErrors.pinCode && (
                      <p className="text-sm text-red-500 mt-1 font-medium">
                        {validationErrors.pinCode}
                      </p>
                    )}
                  </div>
                  <div>
                    {loadingStates ? (
                      <div className="flex items-center justify-center px-4 py-4 border-2 border-gray-200 rounded-xl bg-gray-50">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-orange-600"></div>
                      </div>
                    ) : (
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => {
                            setShowStateDropdown(!showStateDropdown);
                            setStateSearchQuery('');
                          }}
                          className="w-full px-4 py-4 text-left border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all bg-white flex items-center justify-between"
                        >
                          <span className={formData.state ? 'text-gray-900' : 'text-gray-500'}>
                            {formData.state || 'Select State *'}
                          </span>
                          <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${showStateDropdown ? 'rotate-90' : ''}`} />
                        </button>
                        
                        {showStateDropdown && (
                          <div className="absolute z-50 w-full mt-1 bg-white border-2 border-gray-200 rounded-xl shadow-xl">
                            <div className="p-3 border-b border-gray-100">
                              <div className="relative">
                                <input
                                  type="text"
                                  placeholder="Search states..."
                                  value={stateSearchQuery}
                                  onChange={(e) => setStateSearchQuery(e.target.value)}
                                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
                                  autoFocus
                                />
                                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                              </div>
                            </div>
                            <div className="max-h-48 overflow-y-auto">
                              {filteredStates.length > 0 ? (
                                filteredStates.map((state) => (
                                  <div
                                    key={state.state_id}
                                    onClick={() => {
                                      handleInputChange('state', state.state_name);
                                      handleInputChange('district', '');
                                      setShowStateDropdown(false);
                                      setStateSearchQuery('');
                                    }}
                                    className={`px-4 py-3 cursor-pointer hover:bg-orange-50 transition-colors ${
                                      formData.state === state.state_name ? 'bg-orange-100 text-orange-700 font-semibold' : 'text-gray-700'
                                    }`}
                                  >
                                    {state.state_name} {state.is_territory ? '(UT)' : ''}
                                  </div>
                                ))
                              ) : (
                                <div className="px-4 py-3 text-gray-500 text-center">
                                  {stateSearchQuery ? `No states found matching "${stateSearchQuery}"` : 'No states available'}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    {loadingDistricts && formData.state ? (
                      <div className="flex items-center justify-center px-4 py-4 border-2 border-gray-200 rounded-xl bg-gray-50">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-orange-600"></div>
                      </div>
                    ) : (
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => {
                            if (formData.state) {
                              setShowDistrictDropdown(!showDistrictDropdown);
                              setDistrictSearchQuery('');
                            }
                          }}
                          disabled={!formData.state}
                          className="w-full px-4 py-4 text-left border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all bg-white flex items-center justify-between disabled:bg-gray-100 disabled:cursor-not-allowed"
                        >
                          <span className={formData.district ? 'text-gray-900' : 'text-gray-500'}>
                            {formData.district || (formData.state ? 'Select District *' : 'Select State First')}
                          </span>
                          <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${showDistrictDropdown ? 'rotate-90' : ''}`} />
                        </button>
                        
                        {showDistrictDropdown && formData.state && (
                          <div className="absolute z-50 w-full mt-1 bg-white border-2 border-gray-200 rounded-xl shadow-xl">
                            <div className="p-3 border-b border-gray-100">
                              <div className="relative">
                                <input
                                  type="text"
                                  placeholder="Search districts..."
                                  value={districtSearchQuery}
                                  onChange={(e) => setDistrictSearchQuery(e.target.value)}
                                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
                                  autoFocus
                                />
                                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                              </div>
                            </div>
                            <div className="max-h-48 overflow-y-auto">
                              {filteredDistricts.length > 0 ? (
                                filteredDistricts.map((district) => (
                                  <div
                                    key={district.district_id}
                                    onClick={() => {
                                      handleInputChange('district', district.district_name);
                                      handleInputChange('policeStation', '');
                                      setShowDistrictDropdown(false);
                                      setDistrictSearchQuery('');
                                    }}
                                    className={`px-4 py-3 cursor-pointer hover:bg-orange-50 transition-colors ${
                                      formData.district === district.district_name ? 'bg-orange-100 text-orange-700 font-semibold' : 'text-gray-700'
                                    }`}
                                  >
                                    {district.district_name}
                                  </div>
                                ))
                              ) : (
                                <div className="px-4 py-3 text-gray-500 text-center">
                                  {districtSearchQuery ? `No districts found matching "${districtSearchQuery}"` : 'No districts available'}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <div>
                    {loadingPoliceStations && formData.district ? (
                      <div className="flex items-center justify-center px-4 py-4 border-2 border-gray-200 rounded-xl bg-gray-50">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-orange-600"></div>
                      </div>
                    ) : (
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => {
                            if (formData.district) {
                              setShowPoliceStationDropdown(!showPoliceStationDropdown);
                              setPoliceStationSearchQuery('');
                            }
                          }}
                          disabled={!formData.district}
                          className="w-full px-4 py-4 text-left border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all bg-white flex items-center justify-between disabled:bg-gray-100 disabled:cursor-not-allowed"
                        >
                          <span className={formData.policeStation ? 'text-gray-900' : 'text-gray-500'}>
                            {formData.policeStation || (formData.district ? 'Select Police Station *' : 'Select District First')}
                          </span>
                          <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${showPoliceStationDropdown ? 'rotate-90' : ''}`} />
                        </button>
                        
                        {showPoliceStationDropdown && formData.district && (
                          <div className="absolute z-50 w-full mt-1 bg-white border-2 border-gray-200 rounded-xl shadow-xl">
                            <div className="p-3 border-b border-gray-100">
                              <div className="relative">
                                <input
                                  type="text"
                                  placeholder="Search police stations..."
                                  value={policeStationSearchQuery}
                                  onChange={(e) => setPoliceStationSearchQuery(e.target.value)}
                                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
                                  autoFocus
                                />
                                <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                              </div>
                            </div>
                            <div className="max-h-48 overflow-y-auto">
                              {filteredPoliceStations.length > 0 ? (
                                filteredPoliceStations.map((ps) => (
                                  <div
                                    key={ps.ps_id}
                                    onClick={() => {
                                      handleInputChange('policeStation', ps.ps_name);
                                      setShowPoliceStationDropdown(false);
                                      setPoliceStationSearchQuery('');
                                    }}
                                    className={`px-4 py-3 cursor-pointer hover:bg-orange-50 transition-colors ${
                                      formData.policeStation === ps.ps_name ? 'bg-orange-100 text-orange-700 font-semibold' : 'text-gray-700'
                                    }`}
                                  >
                                    {ps.ps_name}
                                  </div>
                                ))
                              ) : (
                                <div className="px-4 py-3 text-gray-500 text-center">
                                  {policeStationSearchQuery ? `No police stations found matching "${policeStationSearchQuery}"` : 'No police stations available'}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 7: Permanent Address */}
          {currentStep === 7 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Permanent Address</h2>
                <p className="text-gray-600">Your official residential address</p>
              </div>
              
              <label className="flex items-center gap-4 p-5 bg-gradient-to-br from-orange-50 to-amber-50 border-2 border-orange-200 rounded-2xl cursor-pointer hover:shadow-lg transition-all">
                <input
                  type="checkbox"
                  checked={formData.permanentSameAsPresent}
                  onChange={(e) => handleInputChange('permanentSameAsPresent', e.target.checked)}
                  className="w-6 h-6 accent-orange-600 rounded cursor-pointer"
                />
                <div className="flex-1">
                  <span className="text-base font-bold text-gray-900">Same as current address</span>
                  <p className="text-sm text-gray-600 mt-1">Check if both addresses are identical</p>
                </div>
              </label>

              {!formData.permanentSameAsPresent && (
                <div className="space-y-4 bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-2xl border-2 border-gray-200">
                  <input type="text" placeholder="House Number" className="w-full px-4 py-4 text-base border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 bg-white transition-all" />
                  <input type="text" placeholder="Street" className="w-full px-4 py-4 text-base border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 bg-white transition-all" />
                  <div className="grid grid-cols-2 gap-4">
                    <input type="text" placeholder="City" className="px-4 py-4 text-base border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 bg-white transition-all" />
                    <input type="text" placeholder="Post Office" className="px-4 py-4 text-base border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 bg-white transition-all" />
                  </div>
                  <input type="text" placeholder="PIN Code" className="w-full px-4 py-4 text-base border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 bg-white transition-all" />
                </div>
              )}
            </div>
          )}

          {/* Step 8: Professional Details */}
          {currentStep === 8 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Briefcase className="w-8 h-8 text-orange-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Professional Details</h2>
                <p className="text-gray-600">Tell us about your experience</p>
              </div>
              
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Years of Experience *</label>
                  <input
                    type="number"
                    value={formData.yearsOfExperience}
                    onChange={(e) => handleInputChange('yearsOfExperience', e.target.value)}
                    placeholder="e.g., 10"
                    className="w-full px-4 py-4 text-base border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-4">Primary Language *</label>
                  {loadingLanguages ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
                      <span className="ml-3 text-gray-600">Loading languages...</span>
                    </div>
                  ) : (
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => {
                          setShowLanguageDropdown(!showLanguageDropdown);
                          setLanguageSearchQuery('');
                        }}
                        className="w-full px-4 py-4 text-left border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all bg-white flex items-center justify-between"
                      >
                        <span className={formData.primaryLanguage ? 'text-gray-900' : 'text-gray-500'}>
                          {formData.primaryLanguage || 'Select Primary Language *'}
                        </span>
                        <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${showLanguageDropdown ? 'rotate-90' : ''}`} />
                      </button>
                      
                      {showLanguageDropdown && (
                        <div className="absolute z-50 w-full mt-1 bg-white border-2 border-gray-200 rounded-xl shadow-xl">
                          <div className="p-3 border-b border-gray-100">
                            <div className="relative">
                              <input
                                type="text"
                                placeholder="Search languages..."
                                value={languageSearchQuery}
                                onChange={(e) => setLanguageSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
                                autoFocus
                              />
                              <Sparkles className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            </div>
                          </div>
                          <div className="max-h-48 overflow-y-auto">
                            {filteredLanguages.length > 0 ? (
                              filteredLanguages.map((lang) => (
                                <div
                                  key={lang.language_id}
                                  onClick={() => {
                                    handleInputChange('primaryLanguage', lang.language_name);
                                    setShowLanguageDropdown(false);
                                    setLanguageSearchQuery('');
                                  }}
                                  className={`px-4 py-3 cursor-pointer hover:bg-orange-50 transition-colors ${
                                    formData.primaryLanguage === lang.language_name ? 'bg-orange-100 text-orange-700 font-semibold' : 'text-gray-700'
                                  }`}
                                >
                                  {lang.language_name}
                                </div>
                              ))
                            ) : (
                              <div className="px-4 py-3 text-gray-500 text-center">
                                {languageSearchQuery ? `No languages found matching "${languageSearchQuery}"` : 'No languages available'}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 9: Temple Association */}
          {currentStep === 9 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Building2 className="w-8 h-8 text-orange-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Temple Association</h2>
                <p className="text-gray-600">Are you associated with any temple?</p>
              </div>
              
              <label className="flex items-center gap-4 p-5 bg-gradient-to-br from-orange-50 to-amber-50 border-2 border-orange-200 rounded-2xl cursor-pointer hover:shadow-lg transition-all">
                <input
                  type="checkbox"
                  checked={formData.associatedWithTemple}
                  onChange={(e) => handleInputChange('associatedWithTemple', e.target.checked)}
                  className="w-6 h-6 accent-orange-600 rounded cursor-pointer"
                />
                <div className="flex-1">
                  <span className="text-base font-bold text-gray-900">Yes, I'm associated with a temple</span>
                  <p className="text-sm text-gray-600 mt-1">Provide temple details if applicable</p>
                </div>
              </label>

              {formData.associatedWithTemple && (
                <div className="space-y-4 bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-2xl border-2 border-gray-200">
                  {loadingTemples && formData.state ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
                      <span className="ml-3 text-gray-600">Loading temples...</span>
                    </div>
                  ) : (
                    <>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">Select Temple *</label>
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => {
                              if (formData.state) {
                                setShowTempleDropdown(!showTempleDropdown);
                                setTempleSearchQuery('');
                              }
                            }}
                            disabled={!formData.state}
                            className="w-full px-4 py-4 text-left border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all bg-white flex items-center justify-between disabled:bg-gray-100 disabled:cursor-not-allowed"
                          >
                            <span className={formData.templeName ? 'text-gray-900' : 'text-gray-500'}>
                              {formData.templeName || (formData.state ? 'Select Temple *' : 'Select State First')}
                            </span>
                            <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${showTempleDropdown ? 'rotate-90' : ''}`} />
                          </button>
                          
                          {showTempleDropdown && formData.state && (
                            <div className="absolute z-50 w-full mt-1 bg-white border-2 border-gray-200 rounded-xl shadow-xl">
                              <div className="p-3 border-b border-gray-100">
                                <div className="relative">
                                  <input
                                    type="text"
                                    placeholder="Search temples..."
                                    value={templeSearchQuery}
                                    onChange={(e) => setTempleSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
                                    autoFocus
                                  />
                                  <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                </div>
                              </div>
                              <div className="max-h-48 overflow-y-auto">
                                {filteredTemples.length > 0 ? (
                                  filteredTemples.map((temple) => (
                                    <div
                                      key={temple.temple_id}
                                      onClick={() => {
                                        handleInputChange('templeName', temple.temple_name);
                                        setShowTempleDropdown(false);
                                        setTempleSearchQuery('');
                                      }}
                                      className={`px-4 py-3 cursor-pointer hover:bg-orange-50 transition-colors ${
                                        formData.templeName === temple.temple_name ? 'bg-orange-100 text-orange-700 font-semibold' : 'text-gray-700'
                                      }`}
                                    >
                                      {temple.temple_name}
                                    </div>
                                  ))
                                ) : (
                                  <div className="px-4 py-3 text-gray-500 text-center">
                                    {templeSearchQuery ? `No temples found matching "${templeSearchQuery}"` : temples.length === 0 ? 'No temples found for this state' : 'No temples available'}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <input 
                        type="text" 
                        value={formData.managingAuthority || ''} 
                        onChange={(e) => handleInputChange('managingAuthority', e.target.value)} 
                        placeholder="Managing Authority / Trust" 
                        className="w-full px-4 py-4 text-base border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 bg-white transition-all" 
                      />
                      <input 
                        type="text" 
                        value={formData.templeAddress || ''} 
                        onChange={(e) => handleInputChange('templeAddress', e.target.value)} 
                        placeholder="Temple Address" 
                        className="w-full px-4 py-4 text-base border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 bg-white transition-all" 
                      />
                      <input 
                        type="tel" 
                        value={formData.templeContactNumber || ''} 
                        onChange={(e) => handleInputChange('templeContactNumber', e.target.value.replace(/\D/g, '').slice(0, 10))} 
                        placeholder="Temple Contact Number" 
                        className="w-full px-4 py-4 text-base border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 bg-white transition-all" 
                      />
                      <div className="bg-white border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-orange-400 hover:bg-orange-50 transition-all cursor-pointer">
                        <span className="text-2xl mb-2 block">📄</span>
                        <p className="text-sm font-semibold text-gray-700">Upload Authorization Letter</p>
                        <p className="text-xs text-gray-500 mt-1">PDF or Image format</p>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Step 10: Preferred Pujas */}
          {currentStep === 10 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="text-center mb-6">
                <div className="w-14 h-14 bg-gradient-to-br from-orange-100 to-amber-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Sparkles className="w-7 h-7 text-orange-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">Preferred Pujas</h2>
                <p className="text-gray-600 text-sm">Select the pujas you specialize in</p>
              </div>
              
              {/* Search Box */}
              <div className="mb-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search pujas..."
                    value={pujaSearchQuery}
                    onChange={(e) => setPujaSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all"
                  />
                  <Sparkles className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
              </div>
              
              {/* Pujas Grid */}
              <div className="max-h-96 overflow-y-auto space-y-2 pr-2">
                {filteredPujaOptions.map((puja) => (
                  <div
                    key={puja.id}
                    onClick={() => togglePuja(puja.id)}
                    className={`p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 hover:scale-[1.01] ${
                      formData.selectedPujas.includes(puja.id)
                        ? 'border-orange-500 bg-orange-50 shadow-md'
                        : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                        formData.selectedPujas.includes(puja.id)
                          ? 'border-orange-600 bg-orange-600'
                          : 'border-gray-300'
                      }`}>
                        {formData.selectedPujas.includes(puja.id) && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <span className="text-lg">{puja.emoji}</span>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{puja.name}</h3>
                        <div className="flex items-center gap-4 mt-1 text-xs text-gray-600">
                          <span className="bg-gray-100 px-2 py-1 rounded">⏱ {puja.duration}</span>
                          <span className="text-green-700 font-semibold">₹{puja.priceWithSamagri}</span>
                          <span className="text-gray-500">₹{puja.priceWithoutSamagri}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {filteredPujaOptions.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Sparkles className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                    <p>No pujas found matching "{pujaSearchQuery}"</p>
                  </div>
                )}
              </div>

              {formData.selectedPujas.length > 0 && (
                <div className="bg-green-50 border-2 border-green-200 p-3 rounded-xl">
                  <p className="text-green-800 font-semibold text-sm">
                    ✓ {formData.selectedPujas.length} {formData.selectedPujas.length === 1 ? 'puja' : 'pujas'} selected
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Footer Buttons */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-gray-200 px-6 py-4 shadow-2xl">
        <div className="max-w-2xl mx-auto flex gap-3">
          <button
            onClick={() => {
              if (currentStep > 1) {
                setCurrentStep(currentStep - 1);
              } else {
                onCancel();
              }
            }}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all text-base font-semibold transform hover:scale-[1.02]"
          >
            <ChevronLeft className="w-5 h-5" />
            Back
          </button>

          {currentStep < 10 ? (
            <button
              onClick={async () => {
                // Run validation before proceeding
                const isValid = validateCurrentStep();
                if (!isValid) {
                  return; // Don't proceed if validation fails
                }
                
                if (currentStep === 2) {
                  // Handle Step 2 completion with API call
                  const success = await handleStep2Complete();
                  if (success) {
                    setCurrentStep(currentStep + 1);
                  }
                } else {
                  setCurrentStep(currentStep + 1);
                }
              }}
              disabled={!canProceed() || loadingRegistration}
              className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-xl transition-all text-base font-semibold transform ${
                canProceed() && !loadingRegistration
                  ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:shadow-xl hover:shadow-orange-200 hover:scale-[1.02]'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {loadingRegistration ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Registering...
                </>
              ) : (
                <>
                  Continue
                  <ChevronRight className="w-5 h-5" />
                </>
              )}
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!canProceed()}
              className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-xl transition-all text-base font-semibold transform ${
                canProceed()
                  ? 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:shadow-xl hover:shadow-green-200 hover:scale-[1.02]'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              <Check className="w-5 h-5" />
              Submit Registration
            </button>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out;
        }
      `}</style>
    </div>
  );
}

export default PriestRegistrationStepper;