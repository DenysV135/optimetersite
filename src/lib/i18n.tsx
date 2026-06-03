import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "uk" | "en";

type Dict = Record<string, string>;

const uk: Dict = {
  "app.name": "Optimeter",
  "app.tagline": "Розумний моніторинг лічильників",

  "nav.dashboard": "Огляд",
  "nav.devices": "Пристрої",
  "nav.apartments": "Локації",
  "nav.settings": "Налаштування",
  "nav.logout": "Вийти",

  "auth.login": "Увійти",
  "auth.email": "Електронна пошта",
  "auth.password": "Пароль",
  "auth.signin": "Увійти в акаунт",
  "auth.demo_hint": "Demo: будь-який email та пароль",
  "auth.welcome_back": "Раді бачити знову",
  "auth.subtitle": "Увійдіть, щоб переглянути показники ваших лічильників",

  "type.water": "Вода",
  "type.gas": "Газ",
  "type.electricity": "Електроенергія",

  "unit.water": "м³",
  "unit.gas": "м³",
  "unit.electricity": "кВт·год",

  "dashboard.title": "Огляд споживання",
  "dashboard.subtitle": "Детальна статистика та графіки",
  "dashboard.month_usage": "За цей місяць",
  "dashboard.last_reading": "Останнє показання",
  "dashboard.vs_prev_month": "vs. минулий місяць",
  "dashboard.usage_chart": "Динаміка споживання",
  "dashboard.distribution": "Розподіл витрат",
  "dashboard.anomalies": "Виявлення аномалій",
  "dashboard.no_anomalies": "Аномалій не виявлено. Все працює стабільно.",
  "dashboard.devices_online": "Пристрої онлайн",
  "dashboard.total_devices": "Всього пристроїв",
  "dashboard.period.week": "Тиждень",
  "dashboard.period.month": "Місяць",
  "dashboard.period.year": "Рік",

  "devices.title": "Пристрої Optimeter",
  "devices.subtitle": "Керуйте всіма підключеними лічильниками",
  "devices.add": "Додати пристрій",
  "devices.connect": "Підключити Optimeter",
  "devices.connect_desc": "Введіть ID пристрою, вказаний на корпусі",
  "devices.device_id": "ID пристрою",
  "devices.type": "Тип лічильника",
  "devices.apartment": "Локація",
  "devices.name": "Назва",
  "devices.connect_btn": "Підключити",
  "devices.status.online": "Онлайн",
  "devices.status.offline": "Офлайн",
  "devices.last_seen": "Остання активність",
  "devices.view": "Деталі",
  "devices.empty": "Ще немає пристроїв. Підключіть свій перший Optimeter.",

  "device.history": "Історія показань",
  "device.photo_proof": "Фото підтвердження",
  "device.reading": "Показання",
  "device.delta": "Зміна",
  "device.date": "Дата",
  "device.photo": "Фото",
  "device.view_photo": "Переглянути фото",
  "device.photo_title": "Фото лічильника",
  "device.photo_desc": "Можливість переглянути знімок лічильника",
  "device.recognized": "Розпізнано",
  "device.confidence": "Точність",
  "device.back": "До пристроїв",

  "apartments.title": "Мої локації",
  "apartments.subtitle": "Квартири, будинки та інші об'єкти",
  "apartments.add": "Додати локацію",
  "apartments.name": "Назва",
  "apartments.address": "Адреса",
  "apartments.create": "Створити",
  "apartments.devices_count": "пристроїв",

  "settings.title": "Налаштування",
  "settings.subtitle": "Персоналізуйте роботу Optimeter під себе",
  "settings.language": "Мова інтерфейсу",
  "settings.theme": "Тема",
  "settings.theme.light": "Світла",
  "settings.theme.dark": "Темна",
  "settings.capture": "Частота фотографування",
  "settings.capture_desc": "Як часто Optimeter робить знімок табла лічильника",
  "settings.interval.15m": "Кожні 15 хвилин",
  "settings.interval.1h": "Щогодини",
  "settings.interval.6h": "Кожні 6 годин",
  "settings.interval.12h": "Двічі на день",
  "settings.interval.24h": "Раз на добу",
  "settings.notifications": "Сповіщення про аномалії",
  "settings.notifications_desc": "Отримуйте сповіщення при підозрі на витоки",
  "settings.account": "Акаунт",
  "settings.save": "Зберегти зміни",
  "settings.saved": "Налаштування збережено",

  "anomaly.leak": "Сповіщення про можливий витік",
  "anomaly.spike": "Різкий стрибок споживання",
  "anomaly.offline": "Пристрій не виходить на зв'язок",
  "anomaly.severity.high": "Високий",
  "anomaly.severity.medium": "Середній",
  "anomaly.severity.low": "Низький",

  "common.cancel": "Скасувати",
  "common.close": "Закрити",
  "common.add": "Додати",
  "common.delete": "Видалити",
  "common.edit": "Редагувати",
  "common.search": "Пошук...",
  "common.ago": "тому",

  "landing.hero.badge": "Розумний моніторинг ресурсів",
  "landing.hero.title": "Автоматичне розпізнавання показників",
  "landing.hero.subtitle":
    "Optimeter автоматично фотографує ваші лічильники води, газу та електроенергії, розпізнає цифри та показує всю статистику в одному місці.",
  "landing.cta.start": "Спробувати demo",
  "landing.cta.login": "Увійти",

  "toast.connected": "Пристрій успішно підключено",
  "toast.apartment_added": "Локацію додано",
  "toast.logged_out": "Ви вийшли з акаунта",
};

const en: Dict = {
  "app.name": "Optimeter",
  "app.tagline": "Smart meter monitoring",

  "nav.dashboard": "Overview",
  "nav.devices": "Devices",
  "nav.apartments": "Locations",
  "nav.settings": "Settings",
  "nav.logout": "Sign out",

  "auth.login": "Sign in",
  "auth.email": "Email",
  "auth.password": "Password",
  "auth.signin": "Sign in to your account",
  "auth.demo_hint": "Demo: any email and password works",
  "auth.welcome_back": "Welcome back",
  "auth.subtitle": "Sign in to view your meter readings",

  "type.water": "Water",
  "type.gas": "Gas",
  "type.electricity": "Electricity",

  "unit.water": "m³",
  "unit.gas": "m³",
  "unit.electricity": "kWh",

  "dashboard.title": "Consumption overview",
  "dashboard.subtitle": "Current status of all your meters",
  "dashboard.month_usage": "This month",
  "dashboard.last_reading": "Latest reading",
  "dashboard.vs_prev_month": "vs. previous month",
  "dashboard.usage_chart": "Usage trends",
  "dashboard.distribution": "Spending distribution",
  "dashboard.anomalies": "Anomalies & alerts",
  "dashboard.no_anomalies": "No anomalies detected. Everything looks great.",
  "dashboard.devices_online": "Devices online",
  "dashboard.total_devices": "Total devices",
  "dashboard.period.week": "Week",
  "dashboard.period.month": "Month",
  "dashboard.period.year": "Year",

  "devices.title": "Optimeter devices",
  "devices.subtitle": "Manage all your connected meters",
  "devices.add": "Add device",
  "devices.connect": "Connect Optimeter",
  "devices.connect_desc": "Enter the device ID printed on the case",
  "devices.device_id": "Device ID",
  "devices.type": "Meter type",
  "devices.apartment": "Location",
  "devices.name": "Name",
  "devices.connect_btn": "Connect",
  "devices.status.online": "Online",
  "devices.status.offline": "Offline",
  "devices.last_seen": "Last seen",
  "devices.view": "Details",
  "devices.empty": "No devices yet. Connect your first Optimeter.",

  "device.history": "Reading history",
  "device.photo_proof": "Photo proof",
  "device.reading": "Reading",
  "device.delta": "Change",
  "device.date": "Date",
  "device.photo": "Photo",
  "device.view_photo": "View photo",
  "device.photo_title": "Meter photo",
  "device.photo_desc": "Captured by the Optimeter device",
  "device.recognized": "Recognized",
  "device.confidence": "Confidence",
  "device.back": "Back to devices",

  "apartments.title": "My locations",
  "apartments.subtitle": "Apartments, houses and other properties",
  "apartments.add": "Add location",
  "apartments.name": "Name",
  "apartments.address": "Address",
  "apartments.create": "Create",
  "apartments.devices_count": "devices",

  "settings.title": "Settings",
  "settings.subtitle": "Personalize how Optimeter works for you",
  "settings.language": "Interface language",
  "settings.theme": "Theme",
  "settings.theme.light": "Light",
  "settings.theme.dark": "Dark",
  "settings.capture": "Capture frequency",
  "settings.capture_desc": "How often Optimeter takes a photo of the meter",
  "settings.interval.15m": "Every 15 minutes",
  "settings.interval.1h": "Hourly",
  "settings.interval.6h": "Every 6 hours",
  "settings.interval.12h": "Twice a day",
  "settings.interval.24h": "Once a day",
  "settings.notifications": "Anomaly notifications",
  "settings.notifications_desc": "Get alerts about possible leaks",
  "settings.account": "Account",
  "settings.save": "Save changes",
  "settings.saved": "Settings saved",

  "anomaly.leak": "Possible leak",
  "anomaly.spike": "Sudden consumption spike",
  "anomaly.offline": "Device is offline",
  "anomaly.severity.high": "High",
  "anomaly.severity.medium": "Medium",
  "anomaly.severity.low": "Low",

  "common.cancel": "Cancel",
  "common.close": "Close",
  "common.add": "Add",
  "common.delete": "Delete",
  "common.edit": "Edit",
  "common.search": "Search...",
  "common.ago": "ago",

  "landing.hero.badge": "Smart resource monitoring",
  "landing.hero.title": "Meters that think for you",
  "landing.hero.subtitle":
    "Optimeter automatically photographs your water, gas and electricity meters, recognizes the digits and shows all statistics in one place.",
  "landing.cta.start": "Try the demo",
  "landing.cta.login": "Sign in",

  "toast.connected": "Device connected successfully",
  "toast.apartment_added": "Location added",
  "toast.logged_out": "You have been signed out",
};

const dicts: Record<Lang, Dict> = { uk, en };

interface I18nCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
}

const Ctx = createContext<I18nCtx | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("uk");

  useEffect(() => {
    const saved = (typeof window !== "undefined" && (localStorage.getItem("optimeter:lang") as Lang)) || null;
    if (saved === "uk" || saved === "en") setLangState(saved);
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    if (typeof window !== "undefined") localStorage.setItem("optimeter:lang", l);
  };

  const t = (key: string) => dicts[lang][key] ?? key;

  return <Ctx.Provider value={{ lang, setLang, t }}>{children}</Ctx.Provider>;
}

export function useI18n() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useI18n must be used inside I18nProvider");
  return ctx;
}
