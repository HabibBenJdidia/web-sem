/**
 * List of countries with their flags and nationalities
 * Using flag-icons library (fi fi-{code})
 */
export const countries = [
  { code: "dz", name: "Algeria", nationality: "Algerian" },
  { code: "eg", name: "Egypt", nationality: "Egyptian" },
  { code: "ma", name: "Morocco", nationality: "Moroccan" },
  { code: "tn", name: "Tunisia", nationality: "Tunisian" },
  { code: "ly", name: "Libya", nationality: "Libyan" },
  { code: "sd", name: "Sudan", nationality: "Sudanese" },
  { code: "mr", name: "Mauritania", nationality: "Mauritanian" },
  { code: "so", name: "Somalia", nationality: "Somali" },
  { code: "dj", name: "Djibouti", nationality: "Djiboutian" },
  { code: "km", name: "Comoros", nationality: "Comorian" },
  
  // Europe
  { code: "fr", name: "France", nationality: "French" },
  { code: "de", name: "Germany", nationality: "German" },
  { code: "it", name: "Italy", nationality: "Italian" },
  { code: "es", name: "Spain", nationality: "Spanish" },
  { code: "gb", name: "United Kingdom", nationality: "British" },
  { code: "pt", name: "Portugal", nationality: "Portuguese" },
  { code: "nl", name: "Netherlands", nationality: "Dutch" },
  { code: "be", name: "Belgium", nationality: "Belgian" },
  { code: "ch", name: "Switzerland", nationality: "Swiss" },
  { code: "at", name: "Austria", nationality: "Austrian" },
  { code: "se", name: "Sweden", nationality: "Swedish" },
  { code: "no", name: "Norway", nationality: "Norwegian" },
  { code: "dk", name: "Denmark", nationality: "Danish" },
  { code: "fi", name: "Finland", nationality: "Finnish" },
  { code: "gr", name: "Greece", nationality: "Greek" },
  { code: "pl", name: "Poland", nationality: "Polish" },
  { code: "cz", name: "Czech Republic", nationality: "Czech" },
  { code: "hu", name: "Hungary", nationality: "Hungarian" },
  { code: "ro", name: "Romania", nationality: "Romanian" },
  { code: "ie", name: "Ireland", nationality: "Irish" },
  
  // Americas
  { code: "us", name: "United States", nationality: "American" },
  { code: "ca", name: "Canada", nationality: "Canadian" },
  { code: "mx", name: "Mexico", nationality: "Mexican" },
  { code: "br", name: "Brazil", nationality: "Brazilian" },
  { code: "ar", name: "Argentina", nationality: "Argentinian" },
  { code: "cl", name: "Chile", nationality: "Chilean" },
  { code: "co", name: "Colombia", nationality: "Colombian" },
  { code: "pe", name: "Peru", nationality: "Peruvian" },
  { code: "ve", name: "Venezuela", nationality: "Venezuelan" },
  
  // Asia
  { code: "cn", name: "China", nationality: "Chinese" },
  { code: "jp", name: "Japan", nationality: "Japanese" },
  { code: "kr", name: "South Korea", nationality: "Korean" },
  { code: "in", name: "India", nationality: "Indian" },
  { code: "pk", name: "Pakistan", nationality: "Pakistani" },
  { code: "bd", name: "Bangladesh", nationality: "Bangladeshi" },
  { code: "id", name: "Indonesia", nationality: "Indonesian" },
  { code: "my", name: "Malaysia", nationality: "Malaysian" },
  { code: "th", name: "Thailand", nationality: "Thai" },
  { code: "vn", name: "Vietnam", nationality: "Vietnamese" },
  { code: "ph", name: "Philippines", nationality: "Filipino" },
  { code: "sg", name: "Singapore", nationality: "Singaporean" },
  { code: "ae", name: "United Arab Emirates", nationality: "Emirati" },
  { code: "sa", name: "Saudi Arabia", nationality: "Saudi" },
  { code: "il", name: "Israel", nationality: "Israeli" },
  { code: "tr", name: "Turkey", nationality: "Turkish" },
  { code: "iq", name: "Iraq", nationality: "Iraqi" },
  { code: "ir", name: "Iran", nationality: "Iranian" },
  { code: "jo", name: "Jordan", nationality: "Jordanian" },
  { code: "lb", name: "Lebanon", nationality: "Lebanese" },
  { code: "sy", name: "Syria", nationality: "Syrian" },
  { code: "ye", name: "Yemen", nationality: "Yemeni" },
  { code: "kw", name: "Kuwait", nationality: "Kuwaiti" },
  { code: "qa", name: "Qatar", nationality: "Qatari" },
  { code: "bh", name: "Bahrain", nationality: "Bahraini" },
  { code: "om", name: "Oman", nationality: "Omani" },
  
  // Oceania
  { code: "au", name: "Australia", nationality: "Australian" },
  { code: "nz", name: "New Zealand", nationality: "New Zealander" },
  
  // Africa (autres)
  { code: "za", name: "South Africa", nationality: "South African" },
  { code: "ng", name: "Nigeria", nationality: "Nigerian" },
  { code: "ke", name: "Kenya", nationality: "Kenyan" },
  { code: "gh", name: "Ghana", nationality: "Ghanaian" },
  { code: "et", name: "Ethiopia", nationality: "Ethiopian" },
  { code: "ug", name: "Uganda", nationality: "Ugandan" },
  { code: "tz", name: "Tanzania", nationality: "Tanzanian" },
  { code: "sn", name: "Senegal", nationality: "Senegalese" },
  { code: "ci", name: "Ivory Coast", nationality: "Ivorian" },
  { code: "cm", name: "Cameroon", nationality: "Cameroonian" },
  { code: "rw", name: "Rwanda", nationality: "Rwandan" },
];

// Sort countries alphabetically by name
countries.sort((a, b) => a.name.localeCompare(b.name));

export default countries;

