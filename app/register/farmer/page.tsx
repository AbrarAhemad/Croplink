'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store/use-app-store';
import { useTranslation } from '@/lib/i18n/context';
import { MobileInput } from '@/components/auth/MobileInput';
import { OtpVerificationSection } from '@/components/auth/OtpVerificationSection';
import { validateGmail } from '@/lib/auth/validation';
import { UserCheck, Upload, CheckCircle2, FileText, X, AlertCircle, RefreshCw, Mail, ShieldCheck } from 'lucide-react';

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_EXTENSIONS = ['pdf', 'jpg', 'jpeg', 'png'];

export default function RegisterFarmerPage() {
  const router = useRouter();
  const { loginAs } = useAppStore();
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    fullName: '',
    mobile: '',
    email: '',
    village: '',
    district: '',
    state: '',
    pincode: '',
    farmName: '',
    landAreaAcres: '',
  });

  // Mobile OTP Verification State
  const [mobileVerified, setMobileVerified] = useState(false);

  // Email Validation & Uniqueness States
  const [emailError, setEmailError] = useState<string | null>(null);
  const [emailRegistered, setEmailRegistered] = useState(false);

  // Selected Files State
  const [landDocument, setLandDocument] = useState<File | null>(null);
  const [governmentId, setGovernmentId] = useState<File | null>(null);

  // Error & Submission States
  const [landDocError, setLandDocError] = useState<string | null>(null);
  const [govtIdError, setGovtIdError] = useState<string | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);

  const [submittingState, setSubmittingState] = useState<'IDLE' | 'UPLOADING_DOCS' | 'SUBMITTING_REGISTRATION' | 'SUCCESS'>('IDLE');

  const landInputRef = useRef<HTMLInputElement>(null);
  const govtInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const validateFile = (file: File): string | null => {
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return 'Unsupported file type. Please upload PDF, JPG, JPEG or PNG.';
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return 'File size must be less than 5 MB.';
    }
    return null;
  };

  const handleMobileChange = (newMobile: string) => {
    setFormData(prev => ({ ...prev, mobile: newMobile }));
    setMobileVerified(false);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setFormData(prev => ({ ...prev, email: val }));
    setEmailError(null);
    setEmailRegistered(false);

    if (val && val.includes('@')) {
      const gRes = validateGmail(val);
      if (!gRes.valid) {
        setEmailError(gRes.error || t('otp.invalidGmail'));
      }
    }
  };

  const handleEmailBlur = async () => {
    if (!formData.email) return;

    const gRes = validateGmail(formData.email);
    if (!gRes.valid) {
      setEmailError(gRes.error || t('otp.invalidGmail'));
      return;
    }

    try {
      const res = await fetch('/api/auth/check-unique', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: gRes.normalized }),
      });
      const data = await res.json();
      if (data.emailExists) {
        setEmailRegistered(true);
        setEmailError(data.emailError || t('otp.gmailAlreadyRegistered'));
      } else if (data.emailError) {
        setEmailError(data.emailError);
      } else {
        setEmailError(null);
        setEmailRegistered(false);
      }
    } catch (err) {
      // Ignore network hiccup
    }
  };

  const handleLandDocChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLandDocError(null);
    setGeneralError(null);
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const err = validateFile(file);
    if (err) {
      setLandDocError(err);
      setLandDocument(null);
    } else {
      setLandDocument(file);
    }
  };

  const handleGovtIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGovtIdError(null);
    setGeneralError(null);
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const err = validateFile(file);
    if (err) {
      setGovtIdError(err);
      setGovernmentId(null);
    } else {
      setGovernmentId(file);
    }
  };

  const isFormValid =
    mobileVerified &&
    formData.fullName.trim() &&
    formData.email.trim() &&
    !emailError &&
    !emailRegistered &&
    formData.village.trim() &&
    formData.district.trim() &&
    formData.pincode.trim() &&
    formData.farmName.trim() &&
    formData.landAreaAcres &&
    landDocument &&
    governmentId;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLandDocError(null);
    setGovtIdError(null);
    setGeneralError(null);

    if (!mobileVerified) {
      setGeneralError(t('otp.verificationRequired'));
      return;
    }

    const gRes = validateGmail(formData.email);
    if (!gRes.valid) {
      setEmailError(gRes.error || t('otp.invalidGmail'));
      return;
    }

    let hasError = false;
    if (!landDocument) {
      setLandDocError(t('farmerRegister.revenueDocLabel') + ' ' + t('common.required'));
      hasError = true;
    }
    if (!governmentId) {
      setGovtIdError(t('farmerRegister.identityDocLabel') + ' ' + t('common.required'));
      hasError = true;
    }

    if (hasError || !landDocument || !governmentId) return;

    try {
      setSubmittingState('UPLOADING_DOCS');

      // Upload Land Document (7/12 Extract)
      let doc1Name = landDocument.name;
      let doc1Url = '';
      try {
        const landFormData = new FormData();
        landFormData.append('file', landDocument);
        const uRes1 = await fetch('/api/auth/upload-doc', { method: 'POST', body: landFormData });
        const uData1 = await uRes1.json();
        if (uData1.success) {
          doc1Url = uData1.url;
          doc1Name = uData1.filename;
        }
      } catch (err) {
        // Fallback reference
      }

      // Upload Government ID
      let doc2Name = governmentId.name;
      let doc2Url = '';
      try {
        const govtFormData = new FormData();
        govtFormData.append('file', governmentId);
        const uRes2 = await fetch('/api/auth/upload-doc', { method: 'POST', body: govtFormData });
        const uData2 = await uRes2.json();
        if (uData2.success) {
          doc2Url = uData2.url;
          doc2Name = uData2.filename;
        }
      } catch (err) {
        // Fallback reference
      }

      setSubmittingState('SUBMITTING_REGISTRATION');

      // Call server backend registration endpoint
      const res = await fetch('/api/auth/register/farmer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: formData.fullName,
          mobile: formData.mobile,
          email: gRes.normalized,
          village: formData.village,
          district: formData.district,
          pincode: formData.pincode,
          farmName: formData.farmName,
          landAreaAcres: formData.landAreaAcres,
          doc1Name: doc1Name,
          doc1Url: doc1Url,
          doc2Name: doc2Name,
          doc2Url: doc2Url,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setSubmittingState('IDLE');
        setGeneralError(data.error || 'Registration submission failed.');
        return;
      }

      setSubmittingState('SUCCESS');

      setTimeout(() => {
        loginAs('FARMER');
        router.push('/farmer/dashboard');
      }, 1500);
    } catch (err: any) {
      setSubmittingState('IDLE');
      setGeneralError('An unexpected server error occurred.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto my-10 px-4 sm:px-6 space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-lg bg-[#23483A] text-white flex items-center justify-center mx-auto shadow-sm">
          <UserCheck className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold text-[#252A27] tracking-tight">{t('farmerRegister.title')}</h1>
        <p className="text-xs text-[#6F756F] font-medium">
          {t('farmerRegister.subtitle')}
        </p>
      </div>

      {submittingState === 'SUCCESS' ? (
        <div className="bg-[#FFFDF8] rounded-md border border-[#23483A]/30 p-8 text-center space-y-4 shadow-sm animate-in fade-in">
          <div className="w-12 h-12 bg-[#23483A]/10 text-[#23483A] rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-[#252A27]">{t('farmerRegister.successMsg')}</h2>
          <p className="text-xs text-[#6F756F] leading-relaxed max-w-md mx-auto">
            {t('common.pleaseWait')}
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-[#FFFDF8] rounded-md border border-[#DDD8CC] shadow-sm p-6 lg:p-8 space-y-6">
          {generalError && (
            <div className="p-3 bg-[#B65C3A]/10 text-[#B65C3A] text-xs font-semibold rounded-md border border-[#B65C3A]/20 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{generalError}</span>
            </div>
          )}

          {/* Section 1: Personal Details */}
          <div className="space-y-4">
            <h3 className="font-bold text-sm text-[#252A27] border-b border-[#DDD8CC] pb-2">{t('farmerRegister.personalSection')}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-[#252A27] block mb-1">
                  {t('farmerRegister.fullNameLabel')} <span className="text-[#B65C3A]">*</span>
                </label>
                <input
                  type="text"
                  required
                  autoComplete="name"
                  placeholder={t('farmerRegister.fullNamePlaceholder')}
                  value={formData.fullName}
                  onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full text-xs p-2.5 bg-[#FFFDF8] border border-[#CFC9BC] rounded-md font-bold text-[#252A27] focus:ring-1 focus:ring-[#23483A] focus:outline-none"
                />
              </div>

              {/* Indian Mobile Input */}
              <MobileInput
                value={formData.mobile}
                onChange={handleMobileChange}
                onVerifiedChange={setMobileVerified}
              />

              {/* Gmail Address Input */}
              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-[#252A27] block mb-1">
                  {t('auth.emailLabel')} <span className="text-[#B65C3A]">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#6F756F] absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="example@gmail.com"
                    value={formData.email}
                    onChange={handleEmailChange}
                    onBlur={handleEmailBlur}
                    className={`w-full text-xs pl-9 pr-3 py-2.5 bg-[#FFFDF8] border rounded-md font-bold text-[#252A27] focus:ring-1 focus:outline-none ${
                      emailError ? 'border-[#B65C3A] focus:ring-[#B65C3A]' : 'border-[#CFC9BC] focus:ring-[#23483A]'
                    }`}
                  />
                </div>
                {emailError && (
                  <div className="text-xs font-medium text-[#B65C3A] flex items-center justify-between gap-2 mt-1">
                    <div className="flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{emailError}</span>
                    </div>
                    {emailRegistered && (
                      <Link href="/login" className="font-bold text-[#23483A] hover:underline bg-[#23483A]/10 px-2 py-0.5 rounded text-[11px]">
                        {t('auth.signIn')} →
                      </Link>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs font-bold text-[#252A27] block mb-1">
                  {t('farmerRegister.villageLabel')} <span className="text-[#B65C3A]">*</span>
                </label>
                <input
                  type="text"
                  required
                  autoComplete="address-level2"
                  placeholder={t('farmerRegister.villagePlaceholder')}
                  value={formData.village}
                  onChange={e => setFormData({ ...formData, village: e.target.value })}
                  className="w-full text-xs p-2.5 bg-[#FFFDF8] border border-[#CFC9BC] rounded-md font-bold text-[#252A27] focus:ring-1 focus:ring-[#23483A] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#252A27] block mb-1">
                  {t('farmerRegister.districtLabel')} <span className="text-[#B65C3A]">*</span>
                </label>
                <input
                  type="text"
                  required
                  autoComplete="address-level1"
                  placeholder={t('farmerRegister.districtPlaceholder')}
                  value={formData.district}
                  onChange={e => setFormData({ ...formData, district: e.target.value })}
                  className="w-full text-xs p-2.5 bg-[#FFFDF8] border border-[#CFC9BC] rounded-md font-bold text-[#252A27] focus:ring-1 focus:ring-[#23483A] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#252A27] block mb-1">
                  {t('farmerRegister.pincodeLabel')} <span className="text-[#B65C3A]">*</span>
                </label>
                <input
                  type="text"
                  required
                  autoComplete="postal-code"
                  placeholder={t('farmerRegister.pincodePlaceholder')}
                  value={formData.pincode}
                  onChange={e => setFormData({ ...formData, pincode: e.target.value })}
                  className="w-full text-xs p-2.5 bg-[#FFFDF8] border border-[#CFC9BC] rounded-md font-bold text-[#252A27] focus:ring-1 focus:ring-[#23483A] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Mobile OTP Verification */}
          <OtpVerificationSection
            mobile={formData.mobile}
            isVerified={mobileVerified}
            onVerificationSuccess={() => setMobileVerified(true)}
          />

          {/* Section 3: Farm Information */}
          <div className="space-y-4">
            <h3 className="font-bold text-sm text-[#252A27] border-b border-[#DDD8CC] pb-2">{t('farmerRegister.farmSection')}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-[#252A27] block mb-1">
                  {t('farmerRegister.farmNameLabel')} <span className="text-[#B65C3A]">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder={t('farmerRegister.farmNamePlaceholder')}
                  value={formData.farmName}
                  onChange={e => setFormData({ ...formData, farmName: e.target.value })}
                  className="w-full text-xs p-2.5 bg-[#FFFDF8] border border-[#CFC9BC] rounded-md font-bold text-[#252A27] focus:ring-1 focus:ring-[#23483A] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#252A27] block mb-1">
                  {t('farmerRegister.landAreaLabel')} <span className="text-[#B65C3A]">*</span>
                </label>
                <input
                  type="number"
                  required
                  placeholder={t('farmerRegister.landAreaPlaceholder')}
                  value={formData.landAreaAcres}
                  onChange={e => setFormData({ ...formData, landAreaAcres: e.target.value })}
                  className="w-full text-xs p-2.5 bg-[#FFFDF8] border border-[#CFC9BC] rounded-md font-bold text-[#252A27] focus:ring-1 focus:ring-[#23483A] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Document Upload Inputs */}
          <div className="space-y-4">
            <h3 className="font-bold text-sm text-[#252A27] border-b border-[#DDD8CC] pb-2">
              {t('farmerRegister.docSection')}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Card 1: 7/12 Land Revenue Extract */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-[#252A27] block">{t('farmerRegister.revenueDocLabel')} *</span>

                <input
                  ref={landInputRef}
                  id="land-doc-input"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleLandDocChange}
                  className="sr-only"
                />

                {landDocument ? (
                  <div className="p-4 bg-[#FFFDF8] rounded-md border border-[#23483A]/30 space-y-3 shadow-sm">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <FileText className="w-5 h-5 text-[#23483A] shrink-0" />
                        <div className="truncate">
                          <span className="font-bold text-xs text-[#252A27] block truncate">
                            ✓ {landDocument.name}
                          </span>
                          <span className="text-[11px] text-[#6F756F] block font-medium">
                            {formatFileSize(landDocument.size)}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setLandDocument(null);
                          if (landInputRef.current) landInputRef.current.value = '';
                        }}
                        className="text-[#6F756F] hover:text-[#B65C3A] p-1 rounded transition"
                        title={t('farmerRegister.removeFile')}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => landInputRef.current?.click()}
                    className={`w-full p-4 rounded-md border-2 border-dashed text-left space-y-2 transition ${
                      landDocError ? 'border-[#B65C3A] bg-[#B65C3A]/5' : 'border-[#DDD8CC] hover:border-[#23483A] bg-[#FFFDF8]'
                    }`}
                  >
                    <div className="flex items-center gap-2 text-[#23483A]">
                      <Upload className="w-4 h-4" />
                      <span className="font-bold text-xs">{t('farmerRegister.chooseFile')}</span>
                    </div>
                    <p className="text-[11px] text-[#6F756F] font-medium">{t('farmerRegister.maxSizeNotice')}</p>
                  </button>
                )}

                {landDocError && <p className="text-[11px] font-bold text-[#B65C3A]">{landDocError}</p>}
              </div>

              {/* Card 2: Government ID */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-[#252A27] block">{t('farmerRegister.identityDocLabel')} *</span>

                <input
                  ref={govtInputRef}
                  id="govt-id-input"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleGovtIdChange}
                  className="sr-only"
                />

                {governmentId ? (
                  <div className="p-4 bg-[#FFFDF8] rounded-md border border-[#23483A]/30 space-y-3 shadow-sm">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <FileText className="w-5 h-5 text-[#23483A] shrink-0" />
                        <div className="truncate">
                          <span className="font-bold text-xs text-[#252A27] block truncate">
                            ✓ {governmentId.name}
                          </span>
                          <span className="text-[11px] text-[#6F756F] block font-medium">
                            {formatFileSize(governmentId.size)}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setGovernmentId(null);
                          if (govtInputRef.current) govtInputRef.current.value = '';
                        }}
                        className="text-[#6F756F] hover:text-[#B65C3A] p-1 rounded transition"
                        title={t('farmerRegister.removeFile')}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => govtInputRef.current?.click()}
                    className={`w-full p-4 rounded-md border-2 border-dashed text-left space-y-2 transition ${
                      govtIdError ? 'border-[#B65C3A] bg-[#B65C3A]/5' : 'border-[#DDD8CC] hover:border-[#23483A] bg-[#FFFDF8]'
                    }`}
                  >
                    <div className="flex items-center gap-2 text-[#23483A]">
                      <Upload className="w-4 h-4" />
                      <span className="font-bold text-xs">{t('farmerRegister.chooseFile')}</span>
                    </div>
                    <p className="text-[11px] text-[#6F756F] font-medium">{t('farmerRegister.maxSizeNotice')}</p>
                  </button>
                )}

                {govtIdError && <p className="text-[11px] font-bold text-[#B65C3A]">{govtIdError}</p>}
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={!isFormValid || submittingState !== 'IDLE'}
            className="w-full py-3.5 bg-[#23483A] hover:bg-[#1b382d] text-white font-bold text-xs rounded-md shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {submittingState === 'UPLOADING_DOCS' ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Uploading documents...</span>
              </>
            ) : submittingState === 'SUBMITTING_REGISTRATION' ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>{t('farmerRegister.submitting')}</span>
              </>
            ) : (
              <span>Submit Farmer Registration</span>
            )}
          </button>
        </form>
      )}
    </div>
  );
}
