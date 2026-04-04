import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { SignInPage } from './pages/SignInPage'
import { ForgotPasswordPage } from './pages/ForgotPasswordPage'
import { ResetPasswordPage } from './pages/ResetPasswordPage'
import { SignupPage } from './pages/signup/page'
import { BusinessSignupPage } from './pages/signup/BusinessSignupPage'
import { ExpertSignupPage } from './pages/signup/ExpertSignupPage'
import { Landing } from './pages/Landing'
import { ExpertDealEngine } from './pages/ExpertDealEngine'
import { Pricing } from './pages/Pricing'
import { Solutions } from './pages/Solutions'
import { Dashboard } from './pages/business/Dashboard'
import { CreateRequirement } from './pages/business/CreateRequirement'
import { Requirement } from './pages/business/Requirement'
import { RequirementDetail } from './pages/business/RequirementDetail'
import { Proposals } from './pages/business/Proposals'
import { Messages } from './pages/business/Messages'
import { Settings } from './pages/business/Settings'
import { Experts } from './pages/business/Experts'
import { BusinessCalendar } from './pages/business/Calendar'
import { ExpertDashboard } from './pages/expert/Dashboard'
import { ExpertProposals } from './pages/expert/Proposals'
import { ExpertBrowse } from './pages/expert/Browse'
import { ExpertOpportunityDetail } from './pages/expert/OpportunityDetail'
import { SubmitProposal } from './pages/expert/SubmitProposal'
import { ExpertCalendar } from './pages/expert/Calendar'
import { ExpertMessages } from './pages/expert/Messages'
import { ExpertProfile } from './pages/expert/Profile'
import { ExpertAnalytics } from './pages/expert/Analytics'
import { ExpertEarnings } from './pages/expert/Earnings'
import { ExpertSettings } from './pages/expert/Settings'
import { ProtectedRoute, PublicOnlyRoute } from './components/routing/RouteGuards'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/expert-network" element={<ExpertDealEngine />} />
        <Route path="/solutions" element={<Solutions />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route element={<PublicOnlyRoute />}>
          <Route path="/signin" element={<SignInPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/signup/business" element={<BusinessSignupPage />} />
          <Route path="/signup/expert" element={<ExpertSignupPage />} />
          <Route path="/join-expert" element={<ExpertSignupPage />} />
        </Route>
        <Route element={<ProtectedRoute allowedRole="business" />}>
          <Route path="/business/dashboard" element={<Dashboard />} />
          <Route path="/business/post-requirement" element={<Navigate to="/business/create-requirement" replace />} />
          <Route path="/business/create-requirement" element={<CreateRequirement />} />
          <Route path="/business/create-requirement/:draftId" element={<CreateRequirement />} />
          <Route path="/business/requirement" element={<Requirement />} />
          <Route path="/business/requirement/:requirementId" element={<RequirementDetail />} />
          <Route path="/business/experts" element={<Experts />} />
          <Route path="/business/proposals" element={<Proposals />} />
          <Route path="/business/calendar" element={<BusinessCalendar />} />
          <Route path="/business/messages" element={<Messages />} />
          <Route path="/business/settings" element={<Settings />} />
        </Route>
        <Route element={<ProtectedRoute allowedRole="expert" />}>
          <Route path="/expert/dashboard" element={<ExpertDashboard />} />
          <Route path="/expert/proposals" element={<ExpertProposals />} />
          <Route path="/expert/browse" element={<ExpertBrowse />} />
          <Route path="/expert/browse/:opportunityId" element={<ExpertOpportunityDetail />} />
          <Route path="/expert/browse/:opportunityId/propose" element={<SubmitProposal />} />
          <Route path="/expert/calendar" element={<ExpertCalendar />} />
          <Route path="/expert/messages" element={<ExpertMessages />} />
          <Route path="/expert/profile" element={<ExpertProfile />} />
          <Route path="/expert/analytics" element={<ExpertAnalytics />} />
          <Route path="/expert/earnings" element={<ExpertEarnings />} />
          <Route path="/expert/settings" element={<ExpertSettings />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
