import { apiUrl } from "../../config/api";
import { getAuthToken } from "./doctorSession";

const DIAGNOSIS_DROPDOWN_API = apiUrl("Consultation/diagnosis-dropdown");

export const DEFAULT_DIAGNOSIS_OPTIONS = [
  "Acne",
  "Anemia",
  "Anxiety Disorder",
  "Appendicitis",
  "Arrhythmia",
  "Arthritis",
  "Asthma",
  "Aortic Aneurysm",
  "Back Pain",
  "Brain Hemorrhage",
  "Brain Tumor",
  "Breast Cancer",
  "Burn Injury",
  "Cataract",
  "Chronic Kidney Disease (CKD)",
  "Chronic Obstructive Pulmonary Disease (COPD)",
  "Colon Cancer",
  "Congenital Heart Disease",
  "Coronary Artery Disease (CAD)",
  "COVID-19",
  "Dengue",
  "Depression",
  "Diabetes Mellitus",
  "Diabetic Retinopathy",
  "Ear Infection",
  "Eczema",
  "Epilepsy",
  "Fatty Liver Disease",
  "Gallstones",
  "Gastric Ulcer",
  "Gastritis",
  "GERD (Acid Reflux)",
  "Glaucoma",
  "Gout",
  "Heart Attack (Myocardial Infarction)",
  "Heart Failure",
  "Hearing Loss",
  "Hernia",
  "High-Risk Pregnancy",
  "Hypertension",
  "Hypothyroidism",
  "Hyperthyroidism",
  "Inflammatory Bowel Disease (IBD)",
  "Kidney Failure",
  "Kidney Stones",
  "Leukemia",
  "Ligament Injury",
  "Liver Cirrhosis",
  "Liver Failure",
  "Lung Cancer",
  "Lupus (SLE)",
  "Malaria",
  "Migraine",
  "Multiple Sclerosis",
  "Nephrotic Syndrome",
  "Neonatal Jaundice",
  "Neuropathy",
  "Osteoarthritis",
  "Osteoporosis",
  "Ovarian Cyst",
  "Parkinson's Disease",
  "Peptic Ulcer Disease",
  "Peripheral Artery Disease",
  "Pneumonia",
  "Polycystic Ovary Syndrome (PCOS)",
  "Prematurity",
  "Prostate Enlargement (BPH)",
  "Psoriasis",
  "Pulmonary Embolism",
  "Rheumatoid Arthritis",
  "Sepsis",
  "Schizophrenia",
  "Sinusitis",
  "Skin Infection",
  "Spinal Disc Disease",
  "Sports Injury",
  "Stroke",
  "Thyroid Disorders",
  "Tonsillitis",
  "Tuberculosis (TB)",
  "Urinary Tract Infection (UTI)",
  "Varicose Veins",
  "Valve Heart Disease",
  "Viral Fever",
];

export const DIAGNOSIS_TEST_OPTIONS = [
  "2D Echocardiogram",
  "Angiogram",
  "Audiometry",
  "Blood Culture",
  "Blood Glucose Test",
  "Bronchoscopy",
  "Cardiac Enzyme Test",
  "Clinical Biochemistry",
  "Clinical Microbiology",
  "Clinical Pathology",
  "Colonoscopy",
  "Complete Blood Count (CBC)",
  "CT Scan",
  "Cytopathology",
  "Digital OPG",
  "Digital X-Ray",
  "Doppler Study",
  "ECG (Electrocardiogram)",
  "EEG (Electroencephalogram)",
  "EMG / ENMG",
  "Endoscopy",
  "Endoscopic Ultrasound (EUS)",
  "ERCP",
  "HbA1c",
  "Histopathology",
  "Holter Monitoring",
  "Kidney Function Test (KFT)",
  "Liver Function Test (LFT)",
  "Lipid Profile",
  "Mammography",
  "MRI Scan",
  "Molecular Biology (RT-PCR)",
  "Nerve Conduction Study (NCS)",
  "Pap Smear",
  "Pulmonary Function Test (PFT)",
  "Radial & Convex EBUS",
  "Thyroid Function Test (T3, T4, TSH)",
  "Thoracoscopy",
  "Treadmill Test (TMT)",
  "Ultrasound Scan",
  "Urine Analysis",
  "X-Ray",
];

const getDiagnosisText = (item) => {
  if (typeof item === "string") return item;

  return item?.diagnosis || item?.name || item?.value || "";
};

export const normalizeDiagnosisOptions = (data) => {
  const list = Array.isArray(data)
    ? data
    : Array.isArray(data?.data)
      ? data.data
      : Array.isArray(data?.diagnoses)
        ? data.diagnoses
        : [];

  const seen = new Set();

  return list.reduce((options, item) => {
    const value = String(getDiagnosisText(item) || "").trim();
    const key = value.toLowerCase();

    if (!value || seen.has(key)) return options;

    seen.add(key);
    return [...options, value];
  }, []);
};

export const mergeDiagnosisOption = (options, diagnosis) => {
  const value = String(diagnosis || "").trim();
  if (!value) return Array.isArray(options) ? options : [];

  const list = Array.isArray(options) ? options : [];
  const exists = list.some(
    (option) => option.trim().toLowerCase() === value.toLowerCase()
  );

  return exists ? list : [value, ...list];
};

export const fetchDiagnosisOptions = async () => {
  const token = getAuthToken();
  const headers = {
    "ngrok-skip-browser-warning": "true",
  };

  if (token) headers["Authorization"] = `Bearer ${token}`;

  const response = await fetch(DIAGNOSIS_DROPDOWN_API, {
    headers,
  });
  const data = await response.json().catch(() => []);

  if (!response.ok) {
    throw new Error(data.message || "Unable to load diagnosis list.");
  }

  return normalizeDiagnosisOptions(data);
};
