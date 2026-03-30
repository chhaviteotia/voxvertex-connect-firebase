import { useEffect, useRef, useState } from 'react'
import { DashboardLayout } from '../../layouts/DashboardLayout'
import { businessSidebarItems, businessSidebarBottomItems } from '../../config/businessNav'
import { CustomSelect } from '../../components/CustomSelect'
import {
  IconBuilding,
  IconUser,
  IconBell,
  IconCreditCard,
  IconUsers,
} from '../../components/layout/DashboardIcons'
import { useAppSelector } from '../../store/hooks'
import {
  fetchBusinessSettings,
  updateOrganizationSettings,
  updateProfileSettings,
  changeBusinessPassword,
  uploadBusinessAvatar,
} from '../../api/businessSettings'

const TEAL = '#2293B4'

type TabId = 'organization' | 'profile' | 'notifications' | 'billing' | 'team'

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'organization', label: 'Organization', icon: <IconBuilding /> },
  { id: 'profile', label: 'Profile', icon: <IconUser /> },
  { id: 'notifications', label: 'Notifications', icon: <IconBell /> },
  { id: 'billing', label: 'Billing', icon: <IconCreditCard /> },
  { id: 'team', label: 'Team', icon: <IconUsers /> },
]

const INDUSTRY_OPTIONS = ['Technology', 'Healthcare', 'Finance', 'Education', 'Other']
const COMPANY_SIZE_OPTIONS = ['1-10 employees', '11-50 employees', '51-200 employees', '201-500 employees', '500+ employees']

export function Settings() {
  const [activeTab, setActiveTab] = useState<TabId>('organization')

  const authUser = useAppSelector((state) => state.auth.user)

  const [companyName, setCompanyName] = useState('')
  const [industry, setIndustry] = useState('')
  const [companySize, setCompanySize] = useState('')
  const [website, setWebsite] = useState('')
  const [address, setAddress] = useState('')

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const photoInputRef = useRef<HTMLInputElement>(null)
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [jobTitle, setJobTitle] = useState('')

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [notifExpertMatches, setNotifExpertMatches] = useState(true)
  const [notifProposals, setNotifProposals] = useState(true)
  const [notifMessages, setNotifMessages] = useState(true)
  const [notifWeeklyDigest, setNotifWeeklyDigest] = useState(false)

  const [isLoading, setIsLoading] = useState(true)
  const [savingOrganization, setSavingOrganization] = useState(false)
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        const res = await fetchBusinessSettings()
        if (!mounted || !res.success) return
        const { organization, profile } = res.data
        setCompanyName(organization.companyName ?? '')
        setIndustry(organization.industry ?? '')
        setCompanySize(organization.companySize ?? '')
        setWebsite(organization.website ?? '')
        setAddress(organization.address ?? '')

        let first = (profile.firstName ?? '').trim()
        let last = (profile.lastName ?? '').trim()
        if (!first && !last && (profile.fullName ?? '').trim()) {
          const parts = (profile.fullName as string).trim().split(/\s+/).filter(Boolean)
          first = parts[0] ?? ''
          last = parts.slice(1).join(' ') ?? ''
        }
        setFirstName(first)
        setLastName(last)
        setAvatarUrl(profile.avatarUrl ?? '')
        setEmail(profile.email ?? '')
        setPhone(profile.phone ?? '')
        setJobTitle(profile.jobTitle ?? '')
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to load settings.'
        setErrorMessage(msg)
      } finally {
        if (mounted) setIsLoading(false)
      }
    }
    load()
    return () => {
      mounted = false
    }
  }, [])

  const handleSaveOrganization = async () => {
    try {
      setSaveMessage('')
      setErrorMessage('')
      setSavingOrganization(true)
      await updateOrganizationSettings({ companyName, industry, companySize, website, address })
      setSaveMessage('Organization settings saved.')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to save organization settings.'
      setErrorMessage(msg)
    } finally {
      setSavingOrganization(false)
    }
  }

  const handleSaveProfile = async () => {
    try {
      setSaveMessage('')
      setErrorMessage('')
      setSavingProfile(true)
      await updateProfileSettings({ firstName, lastName, email, phone, jobTitle })
      setSaveMessage('Profile updated.')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to update profile.'
      setErrorMessage(msg)
    } finally {
      setSavingProfile(false)
    }
  }

  const handleChangePassword = async () => {
    try {
      setSaveMessage('')
      setErrorMessage('')
      if (!newPassword || newPassword !== confirmPassword) {
        setErrorMessage('New password and confirmation must match.')
        return
      }
      setSavingPassword(true)
      await changeBusinessPassword(currentPassword, newPassword)
      setSaveMessage('Password updated.')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to change password.'
      setErrorMessage(msg)
    } finally {
      setSavingPassword(false)
    }
  }

  const handleChangePhotoClick = () => {
    photoInputRef.current?.click()
  }

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!allowed.includes(file.type)) {
      setErrorMessage('Only JPG, PNG, GIF, or WebP allowed.')
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      setErrorMessage('Image must be 2MB or smaller.')
      return
    }
    try {
      setSaveMessage('')
      setErrorMessage('')
      setUploadingPhoto(true)
      const { avatarUrl: url } = await uploadBusinessAvatar(file)
      setAvatarUrl(url)
      setSaveMessage('Photo updated.')
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to upload photo.')
    } finally {
      setUploadingPhoto(false)
    }
  }

  const profileInitials = [firstName, lastName].map((s) => (s || '').trim().charAt(0)).filter(Boolean).join('').toUpperCase() || '?'

  const handleSaveNotifications = () => {
    setSaveMessage('')
    setErrorMessage('')
    setSaveMessage('Notification preferences are not connected to the server yet.')
  }

  const inputClass =
    'w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-[#F7F9FC] text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2293B4] focus:border-transparent'
  const labelClass = 'block text-sm font-medium text-gray-700 mb-1.5'

  return (
    <DashboardLayout
      sidebarItems={businessSidebarItems}
      sidebarBottomItems={businessSidebarBottomItems}
      userTypeLabel="Business"
      userDisplayName={companyName || authUser?.email || 'Business Account'}
      userSubLabel="Business Account"
      sidebarClassName="bg-gray-50"
    >
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage your account and preferences</p>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'border-gray-300 bg-gray-100 text-gray-900'
                  : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span className="w-5 h-5 flex items-center justify-center text-current [&>svg]:w-5 [&>svg]:h-5">
                {tab.icon}
              </span>
              {tab.label}
            </button>
          ))}
        </div>

        {isLoading && (
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">Loading settings...</p>
          </div>
        )}

        {!isLoading && errorMessage && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {errorMessage}
          </div>
        )}
        {!isLoading && !errorMessage && saveMessage && (
          <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            {saveMessage}
          </div>
        )}

        {!isLoading && activeTab === 'organization' && (
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-5">Organization Information</h2>
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Company Name</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Industry</label>
                  <CustomSelect
                    id="settings-industry"
                    value={industry}
                    onChange={setIndustry}
                    options={INDUSTRY_OPTIONS}
                    placeholder="Select industry"
                  />
                </div>
                <div>
                  <label className={labelClass}>Company Size</label>
                  <CustomSelect
                    id="settings-company-size"
                    value={companySize}
                    onChange={setCompanySize}
                    options={COMPANY_SIZE_OPTIONS}
                    placeholder="Select size"
                  />
                </div>
              </div>
              <div>
                <label className={labelClass}>Website</label>
                <input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={handleSaveOrganization}
                disabled={savingOrganization}
                className="rounded-lg px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-70"
                style={{ backgroundColor: TEAL }}
              >
                {savingOrganization ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </div>
        )}

        {!isLoading && activeTab === 'profile' && (
          <div className="space-y-6">
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-5">Personal Information</h2>
              <div className="flex flex-wrap items-start gap-4 mb-6">
                <input
                  ref={photoInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  className="hidden"
                  aria-hidden
                  onChange={handlePhotoChange}
                />
                <div className="w-16 h-16 rounded-full flex items-center justify-center text-white text-lg font-semibold border-2 border-gray-300 shrink-0 overflow-hidden bg-[#1E3A5F]">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    profileInitials
                  )}
                </div>
                <div>
                  <button
                    type="button"
                    onClick={handleChangePhotoClick}
                    disabled={uploadingPhoto}
                    className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-50 disabled:opacity-70"
                  >
                    {uploadingPhoto ? 'Uploading…' : 'Change Photo'}
                  </button>
                  <p className="text-xs text-gray-500 mt-1.5">JPG, PNG, GIF, WebP. Max 2MB.</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className={labelClass}>First Name</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Last Name</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className={labelClass}>Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Phone</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Job Title</label>
                  <input
                    type="text"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={handleSaveProfile}
                  disabled={savingProfile}
                  className="rounded-lg px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-70"
                  style={{ backgroundColor: TEAL }}
                >
                  {savingProfile ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-5">Change Password</h2>
              <div className="space-y-4 max-w-xl">
                <div>
                  <label className={labelClass}>Current Password</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder=""
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder=""
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder=""
                    className={inputClass}
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={handleChangePassword}
                  disabled={savingPassword}
                  className="rounded-lg px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-70"
                  style={{ backgroundColor: TEAL }}
                >
                  {savingPassword ? 'Updating…' : 'Update Password'}
                </button>
              </div>
            </div>
          </div>
        )}

        {!isLoading && activeTab === 'notifications' && (
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-5">Email Notifications</h2>
            <div className="divide-y divide-gray-200">
              {[
                {
                  id: 'expert-matches',
                  label: 'New Expert Matches',
                  description: 'Get notified when experts match your requirements',
                  on: notifExpertMatches,
                  setOn: setNotifExpertMatches,
                },
                {
                  id: 'proposals',
                  label: 'New Proposals',
                  description: 'Get notified when experts submit proposals',
                  on: notifProposals,
                  setOn: setNotifProposals,
                },
                {
                  id: 'messages',
                  label: 'Messages',
                  description: 'Get notified when you receive new messages',
                  on: notifMessages,
                  setOn: setNotifMessages,
                },
                {
                  id: 'weekly-digest',
                  label: 'Weekly Digest',
                  description: 'Receive a weekly summary of your activity',
                  on: notifWeeklyDigest,
                  setOn: setNotifWeeklyDigest,
                },
              ].map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-4 py-4 first:pt-0">
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900">{item.label}</p>
                    <p className="text-sm text-gray-500 mt-0.5">{item.description}</p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={item.on}
                    onClick={() => item.setOn(!item.on)}
                    className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-0 transition-colors focus:outline-none focus:ring-2 focus:ring-[#2293B4] focus:ring-offset-2 ${
                      item.on ? 'bg-gray-900' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow ring-0 transition-transform mt-0.5 ml-0.5 ${
                        item.on ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={handleSaveNotifications}
                className="rounded-lg px-5 py-2.5 text-sm font-semibold text-white"
                style={{ backgroundColor: TEAL }}
              >
                Save Preferences
              </button>
            </div>
          </div>
        )}

        {activeTab === 'billing' && (
          <div className="space-y-6">
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Current Plan</h2>
                  <p className="text-sm text-gray-500 mt-0.5">Professional Plan</p>
                </div>
                <span className="rounded-lg px-2.5 py-1 text-xs font-semibold text-white" style={{ backgroundColor: TEAL }}>
                  Active
                </span>
              </div>
              <div className="divide-y divide-gray-200">
                <div className="flex justify-between items-center py-3 first:pt-0">
                  <span className="text-sm text-gray-600">Monthly subscription</span>
                  <span className="text-sm font-medium text-gray-900">₹35,000 / month</span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="text-sm text-gray-600">Next billing date</span>
                  <span className="text-sm font-medium text-gray-900">March 22, 2026</span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="text-sm text-gray-600">Payment method</span>
                  <span className="text-sm font-medium text-gray-900">•••• 4242</span>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  type="button"
                  className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-50"
                >
                  Change Plan
                </button>
                <button
                  type="button"
                  className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-50"
                >
                  Update Payment Method
                </button>
              </div>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Billing History</h2>
              <div className="divide-y divide-gray-200">
                <div className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Feb 22, 2026</p>
                    <p className="text-xs text-gray-500">Paid</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium text-gray-900">₹35,000</span>
                    <button type="button" className="text-sm font-medium text-gray-900 hover:underline">
                      Download
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'team' && (
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Team Members</h2>
                <p className="text-sm text-gray-500 mt-0.5">Manage your team&apos;s access and permissions</p>
              </div>
              <button
                type="button"
                className="rounded-lg px-4 py-2.5 text-sm font-semibold text-white shrink-0"
                style={{ backgroundColor: TEAL }}
              >
                Invite Member
              </button>
            </div>
            <div className="space-y-3">
              {[
                { initials: 'JD', name: 'John Doe', email: 'john.doe@acme.com', role: 'Admin' },
                { initials: 'JS', name: 'Jane Smith', email: 'jane.smith@acme.com', role: 'Member' },
                { initials: 'MJ', name: 'Mike Johnson', email: 'mike.j@acme.com', role: 'Member' },
              ].map((member) => (
                <div
                  key={member.email}
                  className="flex flex-wrap items-center gap-4 rounded-lg border border-gray-200 bg-gray-50/50 px-4 py-3"
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-semibold shrink-0"
                    style={{ backgroundColor: '#1F2937' }}
                  >
                    {member.initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-gray-900">{member.name}</p>
                    <p className="text-sm text-gray-500">{member.email}</p>
                  </div>
                  <span className="text-sm text-gray-600">{member.role}</span>
                  <button type="button" className="text-sm font-medium hover:underline" style={{ color: TEAL }}>
                    Edit
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
