"use client";

import { useEffect, useState } from "react";
import { IconCheck } from "@/components/store/Icons";

const COLOR_SECTIONS = [
  {
    title: "1. الشريط العلوي (شريط الإعلانات)",
    fields: [
      { key: "color_topbar_bg", label: "الخلفية", default: "#ffffff" },
      { key: "color_topbar_text", label: "النصوص بداخله", default: "#000000" },
    ],
  },
  {
    title: "2. الهيدر (القائمة العلوية)",
    fields: [
      { key: "color_header_bg", label: "خلفية الهيدر", default: "#ffffff" },
      { key: "color_header_icon", label: "الأيقونات", default: "#000000" },
      { key: "color_menu_bg", label: "خلفية القائمة (Menu)", default: "#ffffff" },
      { key: "color_menu_text", label: "النصوص بداخل القائمة", default: "#000000" },
    ],
  },
  {
    title: "شريط الأقسام (تحت الهيدر)",
    fields: [
      { key: "color_categories_bar_bg", label: "خلفية شريط الأقسام", default: "#ffffff" },
      { key: "color_category_item_bg", label: "خلفية كل مجموعة (قسم)", default: "#ffffff" },
      { key: "color_category_item_text", label: "لون نص القسم", default: "#000000" },
      { key: "color_category_active_bg", label: "خلفية القسم النشط", default: "#000000" },
      { key: "color_category_active_text", label: "لون نص القسم النشط", default: "#ffffff" },
    ],
  },
  {
    title: "3. الشريط السفلي (للهواتف)",
    fields: [
      { key: "color_bottombar_bg", label: "الخلفية", default: "#ffffff" },
      { key: "color_bottombar_icon_text", label: "الأيقونات والنصوص", default: "#000000" },
    ],
  },
  {
    title: "4. المتجر العام وبطاقات المنتجات",
    fields: [
      { key: "color_store_bg", label: "خلفية المتجر", default: "#ffffff" },
      { key: "color_product_card_bg", label: "خلفية بطاقة المنتج", default: "#f5f5f5" },
      { key: "color_product_card_btn_icon", label: "أيقونات وزر البطاقة", default: "#000000" },
      { key: "color_features_bg", label: "المستطيلات الأربعة التفصيلية", default: "#ffffff" },
    ],
  },
  {
    title: "5. الفوتر (أسفل الصفحة)",
    fields: [
      { key: "color_footer_bg", label: "خلفية الفوتر", default: "#ffffff" },
    ],
  },
  {
    title: "6. صفحة تفاصيل المنتج",
    fields: [
      { key: "color_product_back_btn", label: "زر العودة", default: "#ffffff" },
      { key: "color_product_fav_icon", label: "أيقونة المفضلة", default: "#000000" },
      { key: "color_product_variant_btn", label: "أزرار المقاس واللون (النشطة)", default: "#000000" },
      { key: "color_add_to_cart_btn", label: "زر الإضافة للسلة", default: "#000000" },
      { key: "color_order_btn", label: "زر الطلب", default: "#ffffff" },
    ],
  },
];

export default function AdminApparencePage() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((d) => {
        const normalized: Record<string, string> = {};
        for (const [k, v] of Object.entries(d.settings ?? {})) {
          normalized[k] =
            typeof v === "string" ? v : v ? JSON.stringify(v) : "";
        }
        setSettings(normalized);
        setLoading(false);
      });
  }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await fetch("/api/admin/settings", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(settings),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const resetColors = () => {
    const newSettings = { ...settings };
    COLOR_SECTIONS.forEach((section) => {
      section.fields.forEach((f) => {
        newSettings[f.key] = f.default;
      });
    });
    setSettings(newSettings);
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold">ألوان المتجر</h1>
          <p className="mt-1 text-sm text-neutral-500">
            تخصيص ألوان كل جزء من أجزاء المتجر بدقة
          </p>
        </div>
        <button
          onClick={resetColors}
          className="rounded-lg border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-50"
        >
          استعادة الألوان الافتراضية
        </button>
      </div>

      {loading ? (
        <p className="text-neutral-500">جاري التحميل...</p>
      ) : (
        <form onSubmit={save} className="space-y-8">
          {COLOR_SECTIONS.map((section) => (
            <div key={section.title} className="admin-card p-6">
              <h2 className="mb-6 font-serif text-xl font-bold text-black border-b border-neutral-100 pb-4">
                {section.title}
              </h2>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {section.fields.map((f) => (
                  <label key={f.key} className="block space-y-2 cursor-pointer">
                    <span className="admin-label block mb-0 text-sm font-semibold">{f.label}</span>
                    <div className="flex items-center gap-3">
                      <div className="relative h-10 w-10 flex-none overflow-hidden rounded-full border border-neutral-200 shadow-sm">
                        <input
                          type="color"
                          value={settings[f.key] || f.default}
                          onChange={(e) =>
                            setSettings({ ...settings, [f.key]: e.target.value })
                          }
                          className="absolute -left-2 -top-2 h-14 w-14 cursor-pointer border-0 bg-transparent p-0"
                        />
                      </div>
                      <input
                        type="text"
                        value={settings[f.key] || f.default}
                        onChange={(e) =>
                          setSettings({ ...settings, [f.key]: e.target.value })
                        }
                        className="admin-input flex-1 uppercase text-left"
                        dir="ltr"
                        pattern="^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$"
                        placeholder="#FFFFFF"
                      />
                    </div>
                  </label>
                ))}
              </div>
            </div>
          ))}

          <div className="sticky bottom-4 flex items-center gap-3 rounded-2xl bg-white p-4 shadow-[0_0_40px_-10px_rgba(0,0,0,0.1)] border border-neutral-100 z-10">
            <button type="submit" disabled={saving} className="admin-btn">
              {saving ? "جاري الحفظ..." : (
                <>
                  <IconCheck size={16} /> حفظ التعديلات
                </>
              )}
            </button>
            {saved && (
              <span className="text-sm font-semibold text-green-600">
                تم حفظ الألوان بنجاح ✓
              </span>
            )}
          </div>
        </form>
      )}
    </div>
  );
}
