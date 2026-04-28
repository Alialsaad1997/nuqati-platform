# 🚀 دليل رفع مشروع نقاطي على الإنترنت
## الخطوات من الصفر حتى الإطلاق

---

## ✅ الخطوة 1: إنشاء حساب GitHub (مجاناً)
1. اذهب إلى: https://github.com
2. اضغط "Sign up" وأنشئ حساباً مجانياً
3. تحقق من بريدك الإلكتروني

---

## ✅ الخطوة 2: إنشاء مستودع جديد على GitHub
1. بعد الدخول اضغط على "+" ثم "New repository"
2. اكتب الاسم: `naqati`
3. اتركه Public أو Private (كلاهما يعمل)
4. اضغط "Create repository"
5. **احتفظ برابط المستودع** (مثال: https://github.com/اسمك/naqati)

---

## ✅ الخطوة 3: رفع الكود على GitHub
### الطريقة السهلة (بدون Command Line):
1. اضغط على "uploading an existing file" في صفحة المستودع
2. اسحب **كل ملفات المشروع** (مجلد naqati) إلى الصفحة
3. اضغط "Commit changes"

### الطريقة الاحترافية (Git):
```bash
cd naqati
git init
git add .
git commit -m "Initial commit - Naqati Loyalty Platform"
git remote add origin https://github.com/اسمك/naqati.git
git push -u origin main
```

---

## ✅ الخطوة 4: إعداد Supabase (قاعدة البيانات)
1. اذهب إلى: https://supabase.com
2. أنشئ حساباً مجانياً
3. اضغط "New Project" واملأ البيانات
4. انتظر دقيقة حتى يُنشأ المشروع
5. اذهب إلى **SQL Editor** (في القائمة الجانبية)
6. انسخ كامل محتوى ملف `supabase/schema.sql`
7. الصقه في SQL Editor واضغط "Run"
8. ✅ تم إنشاء قاعدة البيانات!

### استخرج مفاتيح Supabase:
- اذهب إلى: Settings → API
- انسخ: **Project URL** و **anon public key** و **service_role key**
- ستحتاجها في الخطوة التالية

---

## ✅ الخطوة 5: الرفع على Vercel (الاستضافة المجانية)
1. اذهب إلى: https://vercel.com
2. أنشئ حساباً مجانياً (يمكن الدخول بحساب GitHub مباشرة)
3. اضغط "Add New Project"
4. اختر مستودع `naqati` من GitHub
5. في قسم **Environment Variables** أضف:
   ```
   NEXT_PUBLIC_SUPABASE_URL = [رابط مشروع Supabase]
   NEXT_PUBLIC_SUPABASE_ANON_KEY = [anon public key]
   SUPABASE_SERVICE_ROLE_KEY = [service_role key]
   JWT_SECRET = [أي نص عشوائي طويل]
   ```
6. اضغط **Deploy** وانتظر 2-3 دقائق
7. 🎉 موقعك الآن على الإنترنت!

---

## ✅ الخطوة 6: إنشاء أول حساب سوبر أدمن
1. افتح موقعك على Vercel
2. اذهب إلى `/auth/register` وأنشئ حساباً
3. ارجع إلى Supabase → Table Editor → profiles
4. ابحث عن الحساب الذي أنشأته
5. غير قيمة `role` من `customer` إلى `super_admin`
6. الآن ادخل بهذا الحساب وستجد لوحة السوبر أدمن!

---

## ✅ الخطوة 7: إضافة تاجر جديد
1. ادخل كسوبر أدمن
2. اذهب إلى "التجار" → "إضافة تاجر"
3. بعد إنشاء المتجر، اذهب إلى Supabase
4. في جدول `merchants` انسخ الـ `id` للمتجر الجديد
5. أنشئ حساباً جديداً للتاجر من `/auth/register`
6. في جدول `profiles` غير role إلى `merchant_admin` وضع merchant_id

---

## 🏷️ الباقات المجانية
| الخدمة | الباقة المجانية |
|--------|----------------|
| Vercel | مجاني للمشاريع الشخصية |
| Supabase | 500MB قاعدة بيانات + 50,000 مستخدم |
| GitHub | مجاني بالكامل |

---

## 📞 روابط مهمة
- GitHub: https://github.com
- Supabase: https://supabase.com
- Vercel: https://vercel.com
- وثائق Next.js: https://nextjs.org/docs

---

## ⚠️ ملاحظات مهمة
1. **لا ترفع ملف .env** على GitHub أبداً (المشروع يتضمن .gitignore يحمي هذا)
2. **Apple Wallet** يتطلب اشتراك Apple Developer ($99/سنة) - مُعدّ هيكلياً وجاهز للتفعيل
3. **Google Wallet** يتطلب إعداد Google Pay Console - مُعدّ هيكلياً وجاهز للتفعيل
4. لأي تعديل في الكود، فقط ارفعه على GitHub وسيُحدَّث Vercel تلقائياً

---

*تم إنشاء هذا المشروع بواسطة منصة نقاطي (Naqati) - جميع الحقوق محفوظة*
