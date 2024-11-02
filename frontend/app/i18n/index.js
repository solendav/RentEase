import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import HttpBackend from "i18next-http-backend";
import LanguageDetector from "i18next-browser-languagedetector";
import AsyncStorage from "@react-native-async-storage/async-storage";
import "intl-pluralrules";
const asyncLanguageDetector = {
  type: "languageDetector",
  async: true,
  detect: (callback) => {
    AsyncStorage.getItem("selectedLanguage").then((language) => {
      callback(language || "en"); // Default to English if no language is set
    });
  },
  init: () => {},
  cacheUserLanguage: (language) => {
    AsyncStorage.setItem("selectedLanguage", language);
  },
};

i18n
  .use(HttpBackend)
  .use(asyncLanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: "en",
    debug: true,
    interpolation: {
      escapeValue: false, // React already escapes by default
    },
    resources: {
      en: {
        translation: {
          Notifications: "Notifications",
          dashboard: "Dashboard",
          "Personal Profile": "Personal Profile",
          "Edit Personal Profile": "Edit Personal Profile",
          Home: "Home",
          Settings: "Settings",
          "Add Property": "Add Property",
          Cate: "Category",
          Wallet: "Wallet",
          "My Bookings": "My Bookings",
          "Owner Bookings": "Owner Bookings",
          "My Property": "My Property",
          Language: "Language",
          "Privacy and Security": "Privacy and Security",
          Theme: "Theme",
          "Change Role": "Change Role",
          Notification: "Notification",
          Saved: "Saved",
          Explore: "Explore",
          Amharic: "Amharic",
          English: "English",
          French: "French",
          Categories: "Categories",
          "Your Current Location": "Your Current Location",
          "Top Rated": "Top Rated",
          "Properties in Addis Ababa": "Properties in Addis Ababa",
          "Frequently Rented Properties": "Frequently Rented Properties",
          "My Rentals": "My Rentals",
          Properties: "Properties",
          Search: "Search",
          Main: "Main",
          House: "House",
          All: "All",
          Electronics: "Electronics",
          Clothes: "Clothes",
          Others: "Others",
          Vehicle: "Vehicle",
          "Event-Equipment": "Event Equipment",
          Cloth: "Cloth",
          Other: "Other",
          "Upgrade to Full Access": "Upgrade to Full Access",
          "Upgrade to Owner & Tenant": "Upgrade to Owner & Tenant",
          "Upgrade to a combined role to maximize your earnings and opportunities.":
            "Upgrade to a combined role to maximize your earnings and opportunities.",
          "Upgrade to include renting and earn more by utilizing all platform features!":
            "Upgrade to include renting and earn more by utilizing all platform features!",
          "You’re all set! Start adding your properties and rent them out now and rent for your self.":
            "You’re all set! Start adding your properties and rent them out now and rent for yourself.",
          "Sign up to start enjoying our services!":
            "Sign up to start enjoying our services!",
          "Expand your opportunities!": "Expand your opportunities!",
          "Maximize your reach!": "Maximize your reach!",
          "Add and rent your properties": "Add and rent your properties",
          "Join our platform!": "Join our platform!",
          "On Your Location": "On Your Location",
          "New Arrival": "New Arrival",
          "Advanced Options": "Advanced Options",
          Booked: "Booked",
          times: "times",
        },
      },
      am: {
        translation: {
          Notifications: "የግል መገለጫ አስተካክል",
          dashboard: "ዳሽቦርድ",
          "Personal Profile": "የግል መገለጫ",
          "Edit Personal Profile": "የግል መገለጫ አስተካክል",
          Home: "መነሣት",
          Settings: "ቅንብሮች",
          "Add Property": "ንብረት አክል",
          Cate: "ምድብ",
          Wallet: "ቦርሳ",
          "My Bookings": "የእኔ ምዝገባዎች",
          "Owner Bookings": "የባለቤት ማስያዣዎች",
          "My Property": "ንብረቴ",
          Language: "ቋንቋ",
          "Privacy and Security": "ግላዊነት እና ደህንነት",
          Theme: "ገጽታ",
          "Change Role": "ሚናን ለውጥ",
          Notification: "ማስታወቂያ",
          Saved: "ተቀምጧል",
          Explore: "መርምር",
          Amharic: "አማርኛ",
          English: "እንግሊዝኛ",
          French: "ፈረንሳይኛ",
          Categories: "ምድቦች",
          "Your Current Location": "አሁን ያለህበት ቦታ",
          "Top Rated": "ከፍተኛ ደረጃ",
          "Properties in Addis Ababa": "በአዲስ አበባ ውስጥ ያሉ ንብረቶች",
          "Frequently Rented Properties": "በተደጋጋሚ የሚከራዩ ንብረቶች",
          "My Rentals": "የእኔ ኪራዮች",
          Properties: "ንብረቶች",
          Search: "ፈልግ",
          Main: "ዋና",
          House: "ቤት",
          All: "ሁሉም",
          Vehicle: "መኪና",
          Books: "መፅሐፎች",
          Electronics: "ኤሌክትሮኒክስ",
          "Clothe": "ልብስ",
          "Other" : "ሌላ",
          "Event-Equipment": "የድግስ እቃዎች",
          "Upgrade to Full Access": "ወደ ሙሉ መዳረሻ አሻሽል",
          "Upgrade to Owner & Tenant": "ወደ ባለቤት እና ተከራይ አሻሽል",
          "Upgrade to a combined role to maximize your earnings and opportunities.":
            "ገቢዎን እና እድሎችዎን ከፍ ለማድረግ ወደ ጥምር ሚና ያሻሽሉ።",
          "Upgrade to include renting and earn more by utilizing all platform features!":
            "ኪራይ ለማካተት አሻሽል እና ሁሉንም የመድረክ ባህሪያትን በመጠቀም የበለጠ ገቢ ለማግኘት!",
          "You’re all set! Start adding your properties and rent them out now and rent for your self.":
            "ጨርሰሃል! ንብረቶችህን ማከል ጀምር እና አሁን ተከራይተህ ለራስህ ተከራይ",
          "Sign up to start enjoying our services!":
            "በአገልግሎታችን መደሰት ለመጀመር ተመዝግቡ!",
        },
      },
      fr: {
        translation: {
          Notifications: "Notifications",
          dashboard: "Tableau de bord",
          "Personal Profile": "Profil Personnel",
          "Edit Personal Profile": "Modifier le profil personnel",
          Home: "Accueil",
          Settings: "Paramètres",
          "Add Property": "Ajouter une propriété",
          Cate: "Catégorie",
          Wallet: "Portefeuille",
          "My Bookings": "Mes réservations",
          "Owner Bookings": "Réservations du propriétaire",
          "My Property": "Ma propriété",
          Language: "Langue",
          "Privacy and Security": "Confidentialité et sécurité",
          Theme: "Thème",
          "Change Role": "Changer de rôle",
          Notification: "Notification",
          Saved: "Enregistré",
          Explore: "Explorer",
          Amharic: "Amharique",
          English: "Anglais",
          French: "Français",
          Categories: "Catégories",
          "Your Current Location": "Votre position actuelle",
          "Top Rated": "Les mieux notés",
          "Properties in Addis Ababa": "Propriétés à Addis-Abeba",
          "Frequently Rented Properties": "Propriétés fréquemment louées",
          "My Rentals": "Mes locations",
          Properties: "Propriétés",
          Search: "Recherche",
          Main: "Principal",
          House: "Maison",
          All: "Tous",
          Car: "Voiture",
          Books: "Livres",
          Electronics: "Électronique",
          Bike: "Vélo",
          Clothes: "Vêtements",
          Furniture: "Meubles",
          Others: "Autres",
          Shoes: "Chaussures",
          Vehicle: "Véhicule",
          "Event Equipment": "Équipement événementiel",
          Cloth: "Tissu",
          Other: "Autre",
        },
      },
    },
  });

export default i18n;
