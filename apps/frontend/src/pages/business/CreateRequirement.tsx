import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { DashboardLayout } from '../../layouts/DashboardLayout'
import { businessSidebarItems, businessSidebarBottomItems } from '../../config/businessNav'
import { CustomSelect } from '../../components/CustomSelect'
import { createRequirement as createRequirementApi, updateRequirement as updateRequirementApi, getRequirement as getRequirementApi } from '../../api/requirements'

const TEAL = '#2293B4'

const OUTCOME_CARDS = [
  { id: 'skill-development', title: 'Skill Development', description: 'Build technical or behavioral capabilities', icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></svg> },
  { id: 'revenue-generation', title: 'Revenue Generation', description: 'Generate leads, sales, or partnerships', icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg> },
  { id: 'hiring-talent', title: 'Hiring & Talent', description: 'Attract, assess, and hire talent', icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><line x1="19" y1="8" x2="19" y2="14" /><line x1="22" y1="11" x2="16" y2="11" /></svg> },
  { id: 'brand-positioning', title: 'Brand Positioning', description: 'Build thought leadership & visibility', icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg> },
  { id: 'leadership-alignment', title: 'Leadership Alignment', description: 'Align strategy, vision, and execution', icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg> },
  { id: 'innovation-problem-solving', title: 'Innovation & Problem Solving', description: 'Solve complex business challenges', icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18h6" /><path d="M10 22h4" /><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14" /></svg> },
  { id: 'compliance-risk', title: 'Compliance & Risk', description: 'Meet regulatory & governance needs', icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg> },
  { id: 'community-networking', title: 'Community & Networking', description: 'Build meaningful connections', icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg> },
  { id: 'product-adoption', title: 'Product Adoption', description: 'Drive product usage & engagement', icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg> },
  { id: 'behavior-change', title: 'Behavior Change', description: 'Transform mindsets and behaviors', icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg> },
]
const SKILL_TYPE_OPTIONS = ['Technical', 'Functional', 'Behavioural', 'Leadership']
const REVENUE_TYPE_OPTIONS = ['Lead generation', 'Sales conversion', 'Partnerships']
const TARGET_AUDIENCE_OPTIONS = ['Client', 'Partners', 'Investors']
const HIRING_GOAL_OPTIONS = ['Bulk hiring', 'Specialised roles', 'Pipeline building']
const ASSESSMENT_TYPE_OPTIONS = ['Screening', 'Interview', 'Hackathon']
const POSITIONING_GOAL_OPTIONS = ['Thought Leadership', 'Awareness', 'Reputation']
const ALIGNMENT_TYPE_OPTIONS = ['Strategy', 'Vision', 'Execution']
const LEADERSHIP_LEVEL_OPTIONS = ['Mid level', 'Senior', 'Executive']
const PROBLEM_TYPE_OPTIONS = ['Business', 'Technical', 'Product', 'Process']
const COMPLIANCE_TYPE_OPTIONS = ['Legal', 'ESG', 'Data privacy', 'AI ethics', 'POSH']
const NETWORKING_TYPE_OPTIONS = ['Peer networking', 'Expert networking', 'Investor networking', 'Alumini networking']
const RELATIONSHIP_DEPTH_OPTIONS = ['Surface Level', 'Deep Relationship']
const ADOPTION_STAGE_OPTIONS = ['Awareness', 'Trial', 'Active Use']
const BEHAVIOUR_TYPE_OPTIONS = ['Productivity', 'Leadership', 'Sales', 'Mindset']
const AUDIENCE_OPTIONS = ['Students', 'Job Seekers', 'Entry Level Employees', 'Individual Contributors', 'Managers', 'Senior Managers', 'Leaders', 'Executives', 'Founders', 'Entrepreneurs', 'Sales Team', 'Marketing Team', 'HR Team', 'Tech Team', 'Product Team', 'Operations Team', 'Finance Team', 'Cross-Functional Team', 'Customers', 'Partners', 'Investors', 'Community Members']
const SENIORITY_OPTIONS = ['Student', 'Intern', 'Junior', 'Mid-Level', 'Senior', 'Lead', 'Director', 'VP', 'C-Suite', 'Founder']
const PRIOR_KNOWLEDGE_OPTIONS = [{ id: 'L1', label: 'L1: No Exposure' }, { id: 'L2', label: 'L2: Basic Awareness' }, { id: 'L3', label: 'L3: Working Knowledge' }, { id: 'L4', label: 'L4: Advanced Practitioner' }, { id: 'L5', label: 'L5: Expert Level' }]
const FUNCTIONAL_BACKGROUND_OPTIONS = ['Engineering', 'Product Management', 'Design', 'Marketing', 'Sales', 'Customer Success', 'Operations', 'Finance', 'Human Resources', 'Legal', 'Data Science', 'Analytics', 'Consulting', 'General Management', 'Entrepreneurship', 'Mixed']
const INDUSTRY_CONTEXT_OPTIONS = ['Technology', 'SaaS', 'FinTech', 'Healthcare', 'Education', 'E-Commerce', 'Manufacturing', 'Logistics', 'Consulting', 'Media', 'Telecom', 'Government', 'Non-Profit', 'Real Estate', 'Energy', 'Agriculture', 'Cross-Industry']
const RESISTANCE_OPTIONS = [{ id: 'low', label: 'Low', sub: 'Engaged & willing' }, { id: 'medium', label: 'Medium', sub: 'Neutral, needs convincing' }, { id: 'high', label: 'High', sub: 'Skeptical or resistant' }]
const LEARNING_VS_ACTION_BIAS_OPTIONS = ['Learning-Oriented', 'Action-Oriented', 'Mixed']
const ENGAGEMENT_DEPTH_OPTIONS = [{ id: '1', title: 'Awareness', description: 'High-level overview, inspiration' }, { id: '2', title: 'Introduction', description: 'Basic concepts and frameworks' }, { id: '3', title: 'Working Knowledge', description: 'Practical application and tools' }, { id: '4', title: 'Proficiency', description: 'Deep dive with hands-on practice' }, { id: '5', title: 'Mastery', description: 'Advanced techniques and coaching' }]
const EXPECTED_DELIVERABLES = [{ id: 'knowledge-materials', label: 'Knowledge Materials', icon: 'document' }, { id: 'frameworks-templates', label: 'Frameworks & Templates', icon: 'document' }, { id: 'implementation-roadmap', label: 'Implementation Roadmap', icon: 'bar-chart' }, { id: 'participant-feedback', label: 'Participant Feedback', icon: 'document' }, { id: 'project-outputs', label: 'Project Outputs', icon: 'document' }, { id: 'strategy-document', label: 'Strategy Document', icon: 'document' }, { id: 'session-recordings', label: 'Session Recordings', icon: 'video' }, { id: 'action-plan', label: 'Action Plan', icon: 'check-circle' }, { id: 'assessment-reports', label: 'Assessment Reports', icon: 'document' }, { id: 'skill-assessment-scores', label: 'Skill Assessment Scores', icon: 'bar-chart' }, { id: 'prototype-solution', label: 'Prototype or Solution', icon: 'wrench' }, { id: 'decision-framework', label: 'Decision Framework', icon: 'document' }, { id: 'toolkits', label: 'Toolkits', icon: 'wrench' }, { id: 'post-session-summary', label: 'Post-Session Summary', icon: 'document' }, { id: 'coaching-notes', label: 'Coaching Notes', icon: 'document' }, { id: 'certification', label: 'Certification', icon: 'check-circle' }, { id: 'custom-playbooks', label: 'Custom Playbooks', icon: 'document' }, { id: 'performance-tracking', label: 'Performance Tracking', icon: 'bar-chart' }]
const DELIVERABLE_FORMAT_OPTIONS = ['PDF Document', 'Video Recording', 'Interactive Tool', 'Dashboard/Portal', 'Presentation Slides', 'Spreadsheet']
const DELIVERY_TIMELINE_OPTIONS = ['During session', 'Immediately After', 'within 1 week', 'within 2 weeks', 'within 1 month']
const DELIVERABLE_OWNERSHIP_OPTIONS = ['Experts Retain IP', 'Client Owns Fully', 'Shared Ownership']
const ENGAGEMENT_TYPE_OPTIONS = [{ id: 'keynote', title: 'Keynote Session', tag1: 'low intensity', tag2: 'low outcome' }, { id: 'panel', title: 'Panel Discussion', tag1: 'low intensity', tag2: 'low outcome' }, { id: 'fireside', title: 'Fireside Chat', tag1: 'low intensity', tag2: 'medium outcome' }, { id: 'workshop-single', title: 'Workshop (Single Day)', tag1: 'high intensity', tag2: 'medium outcome' }, { id: 'workshop-multi', title: 'Workshop (Multi-Day)', tag1: 'high intensity', tag2: 'high outcome' }, { id: 'bootcamp', title: 'Bootcamp', tag1: 'high intensity', tag2: 'high outcome' }, { id: 'coaching-1on1', title: 'Coaching (1-on-1)', tag1: 'high intensity', tag2: 'high outcome' }, { id: 'coaching-group', title: 'Coaching (Group)', tag1: 'high intensity', tag2: 'high outcome' }, { id: 'mentorship', title: 'Mentorship Program', tag1: 'medium intensity', tag2: 'high outcome' }, { id: 'advisory', title: 'Advisory Session', tag1: 'medium intensity', tag2: 'high outcome' }, { id: 'strategy-offsite', title: 'Strategy Offsite', tag1: 'high intensity', tag2: 'high outcome' }, { id: 'roundtable', title: 'Roundtable', tag1: 'medium intensity', tag2: 'medium outcome' }, { id: 'hackathon', title: 'Hackathon', tag1: 'high intensity', tag2: 'high outcome' }, { id: 'masterclass', title: 'Masterclass', tag1: 'medium intensity', tag2: 'high outcome' }, { id: 'webinar', title: 'Webinar', tag1: 'low intensity', tag2: 'low outcome' }, { id: 'training', title: 'Training Program', tag1: 'high intensity', tag2: 'high outcome' }, { id: 'implementation', title: 'Implementation Sprint', tag1: 'high intensity', tag2: 'high outcome' }]
const DELIVERY_MODE_OPTIONS = [{ id: 'in-person', title: 'In-Person', tag: 'low scalability' }, { id: 'virtual', title: 'Virtual (Live)', tag: 'high scalability' }, { id: 'hybrid', title: 'Hybrid', tag: 'medium scalability' }, { id: 'async', title: 'Async (Recorded)', tag: 'very_high scalability' }, { id: 'blended', title: 'Blended', tag: 'medium scalability' }]
const DELIVERY_PLATFORM_OPTIONS = ['Zoom', 'Microsoft Teams', 'Google Meet', 'WebEx', 'Other']
const OUTCOME_ORIENTATION_OPTIONS = ['Low', 'Medium', 'High']
const SESSION_PATTERN_OPTIONS = ['single_session', 'multi_session_fixed', 'recurring']
const FLEXIBILITY_LEVEL_OPTIONS = ['Fixed- Dates', 'Semi flexibile', 'Fully flexible']
const URGENCY_LEVEL_OPTIONS = ['Immediate(<7 Days)', 'Short Terms (1-4 weeks)', 'Planned (13 Months)', 'Long Terms(3+ Months)']
const VENUE_TYPE_OPTIONS = ['Office', 'External venue', 'Virtual', 'Client site', 'Other']
const PREPARATION_TIME_OPTIONS = [{ id: 'no_prep', title: 'No Prep', description: 'Less than 2 days', risk: 'high risk', riskClass: 'bg-red-500 text-white' }, { id: 'low', title: 'Low', description: '3-7 days', risk: 'medium risk', riskClass: 'bg-amber-200 text-gray-800' }, { id: 'moderate', title: 'Moderate', description: '1-3 weeks', risk: 'low risk', riskClass: 'bg-green-200 text-green-900' }, { id: 'high', title: 'High', description: '3+ weeks', risk: 'very_low risk', riskClass: 'bg-green-600 text-white' }]
const LEARNING_MODES = ['Awareness', 'Practical', 'Applied'] as const
const SECONDARY_OBJECTIVES = ['increase engagement', 'improve retention', 'drive action post event', 'build thought leadership', 'enable cross team collaboration', 'improve decision making', 'increase tool adoption', 'generate followup opportunities', 'improve confidence', 'create accountability', 'accelerate execution', 'improve communication', 'increase participation', 'build internal alignment']

const BUDGET_BANDS = [
  { id: 'low', label: 'Low', range: '₹5k-₹25k', tier: 'Entry' },
  { id: 'entry', label: 'Entry', range: '₹25k-₹75k', tier: 'Standard' },
  { id: 'mid', label: 'Mid', range: '₹75k-₹2L', tier: 'Professional' },
  { id: 'upper-mid', label: 'Upper Mid', range: '₹2L-₹5L', tier: 'Senior' },
  { id: 'premium', label: 'Premium', range: '₹5L-₹15L', tier: 'Premium' },
  { id: 'enterprise', label: 'Enterprise', range: '₹15L+', tier: 'Enterprise' },
]
const BUDGET_TYPE_OPTIONS = ['Per session', 'Per day', 'Per program', 'Monthly Retainer', 'Per participant', 'Fixed project']
const CURRENCY_OPTIONS = ['INR (₹)', 'USD ($)', 'EUR (€)', 'GBP (£)']
const SHOW_ADVANCED_REQUIREMENT_DETAILS = false
const BUDGET_FLEXIBILITY_OPTIONS = [
  { id: 'fixed', title: 'Fixed', description: 'Strictly within budget - maximizes cost efficiency', tag: 'No negotiation' },
  { id: 'slightly', title: 'Slightly Flexible', description: 'Minor adjustments possible for strong fit', tag: '±10%' },
  { id: 'moderate', title: 'Moderately Flexible', description: 'Willing to stretch for quality match', tag: '±25%' },
  { id: 'highly', title: 'Highly Flexible', description: 'Significant flexibility for exceptional experts', tag: '±50%' },
  { id: 'value', title: 'Value-Based', description: 'Outcome-focused - premium pricing acceptable if justified', tag: 'Open to premium if justified' },
]
const PAYMENT_TERMS_OPTIONS = [
  { id: 'upfront', title: '100% Upfront', risk: 'low', appeal: 'high' },
  { id: '50-50', title: '50-50 Split', risk: 'low', appeal: 'high' },
  { id: 'milestone', title: 'Milestone-Based', risk: 'medium', appeal: 'medium' },
  { id: 'post-delivery', title: 'Post-Delivery', risk: 'high', appeal: 'low' },
  { id: 'net15', title: 'Net 15', risk: 'medium', appeal: 'medium' },
  { id: 'net30', title: 'Net 30', risk: 'medium', appeal: 'medium' },
  { id: 'net60', title: 'Net 60', risk: 'high', appeal: 'low' },
  { id: 'retainer', title: 'Monthly Retainer', risk: 'low', appeal: 'high' },
  { id: 'performance', title: 'Performance-Based', risk: 'high', appeal: 'low' },
]
const COST_QUALITY_OPTIONS = [
  { id: 'cost', title: 'Cost-Sensitive', description: 'Minimize cost while meeting requirements', bars: 2 },
  { id: 'balanced', title: 'Balanced', description: 'Balance cost and quality', bars: 3 },
  { id: 'quality', title: 'Quality-Focused', description: 'Prioritize quality with reasonable budget', bars: 4 },
  { id: 'premium', title: 'Premium Outcome-Focused', description: 'Best outcome regardless of cost', bars: 5 },
]

function formatTime() {
  const d = new Date()
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`
}

/** Format YYYY-MM-DD to DD/MM/YYYY for review display */
function formatDateDDMMYYYY(iso: string): string {
  if (!iso || !iso.match(/^\d{4}-\d{2}-\d{2}/)) return iso || '—'
  const [y, m, d] = iso.slice(0, 10).split('-')
  return `${d}/${m}/${y}`
}

function toSet(v: unknown): Set<string> {
  return new Set(Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : [])
}
function toNum(v: unknown, def: number): number {
  const n = typeof v === 'number' && Number.isFinite(v) ? v : Number(v)
  return Number.isFinite(n) ? n : def
}
function toStr(v: unknown): string {
  return v != null ? String(v) : ''
}
function toBool(v: unknown): boolean {
  return Boolean(v)
}

export function CreateRequirement() {
  const { draftId } = useParams<{ draftId: string }>()
  const [selectedOutcome, setSelectedOutcome] = useState<string | null>(null)
  const [lastSaved] = useState(formatTime())
  const [step, setStep] = useState(1)
  const [draftLoadError, setDraftLoadError] = useState<string | null>(null)
  const [draftLoading, setDraftLoading] = useState(!!draftId)

  const scrollRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [step])

  const [skillType, setSkillType] = useState('')
  const [skillDomain, setSkillDomain] = useState('')
  const [currentLevel, setCurrentLevel] = useState(3)
  const [targetLevel, setTargetLevel] = useState(4)
  const [learningMode, setLearningMode] = useState<(typeof LEARNING_MODES)[number]>('Awareness')
  const [handsOnPractice, setHandsOnPractice] = useState(false)
  const [certificationRequired, setCertificationRequired] = useState(false)
  const [secondarySelected, setSecondarySelected] = useState<Set<string>>(new Set())
  const [successMetrics, setSuccessMetrics] = useState('')

  const [revenueType, setRevenueType] = useState('')
  const [targetAudience, setTargetAudience] = useState('')
  const [expectedLeads, setExpectedLeads] = useState('0')
  const [expectedConversion, setExpectedConversion] = useState('0')
  const [dealSizeMin, setDealSizeMin] = useState('0')
  const [dealSizeMax, setDealSizeMax] = useState('0')
  const [followUpMechanism, setFollowUpMechanism] = useState(false)

  const [hiringGoal, setHiringGoal] = useState('')
  const [assessmentType, setAssessmentType] = useState('')
  const [rolesTargeted, setRolesTargeted] = useState('')
  const [experienceLevel, setExperienceLevel] = useState('')
  const [expectedHires, setExpectedHires] = useState('0')
  const [employerBrandingFocus, setEmployerBrandingFocus] = useState(false)

  const [positioningGoal, setPositioningGoal] = useState('')
  const [brandTargetAudience, setBrandTargetAudience] = useState('')
  const [brandMessageClarity, setBrandMessageClarity] = useState(3)
  const [visibilityChannels, setVisibilityChannels] = useState('')
  const [speakerInfluence, setSpeakerInfluence] = useState(3)

  const [alignmentType, setAlignmentType] = useState('')
  const [leadershipLevel, setLeadershipLevel] = useState('')
  const [decisionOutcomeExpected, setDecisionOutcomeExpected] = useState(false)
  const [conflictResolutionRequired, setConflictResolutionRequired] = useState(false)
  const [crossFunctionAlignment, setCrossFunctionAlignment] = useState(false)

  const [problemType, setProblemType] = useState('')
  const [problemDefinitionClarity, setProblemDefinitionClarity] = useState(3)
  const [collaborationLevel, setCollaborationLevel] = useState(3)
  const [solutionExpected, setSolutionExpected] = useState(false)
  const [prototypeExpected, setPrototypeExpected] = useState(false)

  const [complianceType, setComplianceType] = useState('')
  const [regulatoryBody, setRegulatoryBody] = useState('')
  const [mandatoryCompliance, setMandatoryCompliance] = useState(false)
  const [auditPreparationRequired, setAuditPreparationRequired] = useState(false)
  const [certificationRequiredCompliance, setCertificationRequiredCompliance] = useState(false)

  const [networkingType, setNetworkingType] = useState('')
  const [connectionGoal, setConnectionGoal] = useState('0')
  const [relationshipDepthExpected, setRelationshipDepthExpected] = useState('')
  const [followUpStructureDefined, setFollowUpStructureDefined] = useState(false)

  const [productType, setProductType] = useState('')
  const [adoptionStage, setAdoptionStage] = useState('')
  const [featureFocus, setFeatureFocus] = useState('')
  const [userSegment, setUserSegment] = useState('')
  const [onboardingRequired, setOnboardingRequired] = useState(false)

  const [behaviourType, setBehaviourType] = useState('')
  const [currentBehaviorDescription, setCurrentBehaviorDescription] = useState('')
  const [targetBehavior, setTargetBehavior] = useState('')
  const [reinforcementRequired, setReinforcementRequired] = useState(false)
  const [measurementRequired, setMeasurementRequired] = useState(false)

  const [audienceSelected, setAudienceSelected] = useState<Set<string>>(new Set())
  const [senioritySelected, setSenioritySelected] = useState<Set<string>>(new Set())
  const [audienceSize, setAudienceSize] = useState('')
  const [priorKnowledge, setPriorKnowledge] = useState('L3')
  const [learningCurve, setLearningCurve] = useState(3)
  const [jargonTolerance, setJargonTolerance] = useState(3)
  const [depthCapacity, setDepthCapacity] = useState(3)
  const [paceOfDelivery, setPaceOfDelivery] = useState(3)
  const [functionalSelected, setFunctionalSelected] = useState<Set<string>>(new Set())
  const [industrySelected, setIndustrySelected] = useState<Set<string>>(new Set())
  const [resistanceLevel, setResistanceLevel] = useState('low')
  const [diversityOfAudience, setDiversityOfAudience] = useState(false)
  const [decisionPower, setDecisionPower] = useState(3)
  const [executionResponsibility, setExecutionResponsibility] = useState(3)
  const [domainExpertise, setDomainExpertise] = useState(3)
  const [influenceLevel, setInfluenceLevel] = useState(3)
  const [learningVsActionBias, setLearningVsActionBias] = useState('')

  const [averageExperience, setAverageExperience] = useState('')
  const [abstractionLevelCapacity, setAbstractionLevelCapacity] = useState(3)
  const [decisionAuthority, setDecisionAuthority] = useState(3)
  const [toleranceForBasics, setToleranceForBasics] = useState(3)

  const [technicalOrientation, setTechnicalOrientation] = useState(3)
  const [businessOrientation, setBusinessOrientation] = useState(3)
  const [toolUsageMaturity, setToolUsageMaturity] = useState(3)
  const [processOrientation, setProcessOrientation] = useState(3)

  const [regulationLevel, setRegulationLevel] = useState(3)
  const [technicalComplexity, setTechnicalComplexity] = useState(3)
  const [paceOfChange, setPaceOfChange] = useState(3)
  const [domainSpecificityRequired, setDomainSpecificityRequired] = useState(3)

  const [engagementEffortRequired, setEngagementEffortRequired] = useState(3)
  const [interactivityRequired, setInteractivityRequired] = useState(3)
  const [persuasionNeeded, setPersuasionNeeded] = useState(3)
  const [trustBuildingRequired, setTrustBuildingRequired] = useState(3)

  const [engagementDepth, setEngagementDepth] = useState('3')
  const [interactivityLevel, setInteractivityLevel] = useState(50)
  const [customizationNeed, setCustomizationNeed] = useState(50)
  const [deliverablesSelected, setDeliverablesSelected] = useState<Set<string>>(new Set())
  const [deliverableDetailsActiveId, setDeliverableDetailsActiveId] = useState<string | null>(null)
  const [deliverableDetailsById, setDeliverableDetailsById] = useState<Record<string, { format: string; deliveryTimeline: string; ownership: string; measurableOutput: boolean }>>({})
  const [followUpSupportRequired, setFollowUpSupportRequired] = useState(false)

  const [engagementTypeSelected, setEngagementTypeSelected] = useState<string | null>(null)

  const [interactionIntensity, setInteractionIntensity] = useState(3)
  const [facilitationComplexity, setFacilitationComplexity] = useState(3)
  const [outcomeOrientation, setOutcomeOrientation] = useState('')
  const [continuityRequired, setContinuityRequired] = useState(false)
  const [expertTypeRequired, setExpertTypeRequired] = useState('')

  const [deliveryModeSelected, setDeliveryModeSelected] = useState<string | null>(null)
  const [roomSeatingStyle, setRoomSeatingStyle] = useState('')
  const [avSetupRequired, setAvSetupRequired] = useState('')
  const [deliveryTechnologyDependency, setDeliveryTechnologyDependency] = useState(3)
  const [deliveryEngagementDropRisk, setDeliveryEngagementDropRisk] = useState(3)
  const [deliveryPlatform, setDeliveryPlatform] = useState('')
  const [meetLink, setMeetLink] = useState('')
  const [breakoutRoomsNeeded, setBreakoutRoomsNeeded] = useState(false)
  const [recordingRequired, setRecordingRequired] = useState(false)

  const [totalDurationMinutes, setTotalDurationMinutes] = useState('')

  const [fatigueRisk, setFatigueRisk] = useState(3)
  const [pacingRequirement, setPacingRequirement] = useState(3)
  const [depthPossible, setDepthPossible] = useState(3)
  const [breaksRequired, setBreaksRequired] = useState(false)

  const [totalSessions, setTotalSessions] = useState('1')
  const [sessionPattern, setSessionPattern] = useState('multi_session_fixed')

  const [continuityLevel, setContinuityLevel] = useState(3)
  const [multiSessionReinforcementRequired, setMultiSessionReinforcementRequired] = useState(false)
  const [schedulingComplexity, setSchedulingComplexity] = useState(3)
  const [dependencyBetweenSessions, setDependencyBetweenSessions] = useState(false)

  const [preferredStartDate, setPreferredStartDate] = useState('')
  const [preferredEndDate, setPreferredEndDate] = useState('')
  const [flexibilityLevel, setFlexibilityLevel] = useState('')
  const [urgencyLevel, setUrgencyLevel] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [country, setCountry] = useState('')
  const [venueType, setVenueType] = useState('')
  const [venueDetails, setVenueDetails] = useState('')
  const [preferredTimeSlots, setPreferredTimeSlots] = useState<Set<string>>(new Set())
  const [blackoutDates, setBlackoutDates] = useState('')
  const [dailyTimeWindow, setDailyTimeWindow] = useState('')
  const [timezone, setTimezone] = useState('')
  const [schedulingRestrictions, setSchedulingRestrictions] = useState('')
  const [preparationTimeSelected, setPreparationTimeSelected] = useState<string | null>(null)

  const [schedulingFlexibility, setSchedulingFlexibility] = useState(3)
  const [coordinationComplexity, setCoordinationComplexity] = useState(3)
  const [conflictProbability, setConflictProbability] = useState(3)

  const [budgetBandSelected, setBudgetBandSelected] = useState<string | null>(null)
  const [minBudget, setMinBudget] = useState(100000)
  const [maxBudget, setMaxBudget] = useState(250000)
  const [budgetType, setBudgetType] = useState('')
  const [currency, setCurrency] = useState('INR (₹)')
  const [budgetFlexibility, setBudgetFlexibility] = useState<string | null>('fixed')
  const [paymentTermSelected, setPaymentTermSelected] = useState<string | null>(null)
  const [costQualityPriority, setCostQualityPriority] = useState<string | null>('balanced')
  const [costQualityScore, setCostQualityScore] = useState(3)

  const [publishing, setPublishing] = useState(false)
  const [publishError, setPublishError] = useState('')
  const [savingDraft, setSavingDraft] = useState(false)
  const [draftMessage, setDraftMessage] = useState('')
  const [draftRequirementId, setDraftRequirementId] = useState<string | null>(null)
  const navigate = useNavigate()

  const levelSliderBg = (value: number) =>
    `linear-gradient(to right, #1e293b 0%, #1e293b ${((value - 1) / 4) * 100}%, #e5e7eb ${((value - 1) / 4) * 100}%)`
  const percentSliderBg = (value: number) =>
    `linear-gradient(to right, #1e293b 0%, #1e293b ${value}%, #e5e7eb ${value}%)`
  const durationCategory = ((): string => {
    const n = parseInt(totalDurationMinutes, 10)
    if (!Number.isFinite(n) || n < 1) return ''
    if (n < 30) return 'under 30 min'
    if (n <= 60) return 'micro (30-60 min)'
    if (n <= 120) return 'short (1-2 hrs)'
    if (n <= 240) return 'medium (2-4 hrs)'
    return 'long (4+ hrs)'
  })()
  const toggleSecondary = (id: string) => {
    setSecondarySelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }
  const inputClass = 'w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-[#F7F9FC] text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2293B4] focus:border-transparent'
  const labelClass = 'block text-sm font-medium text-gray-700 mb-1.5'

  useEffect(() => {
    if (!draftId) {
      setDraftLoading(false)
      return
    }
    let cancelled = false
    getRequirementApi(draftId)
      .then((res) => {
        if (cancelled || !res.success || !res.requirement) {
          if (!cancelled) setDraftLoadError('Requirement not found.')
          return
        }
        const r = res.requirement
        if (r.status !== 'draft') {
          if (!cancelled) setDraftLoadError('Only drafts can be edited.')
          return
        }
        setDraftRequirementId(r.id)
        const fd = (r.formData || {}) as Record<string, unknown>
        setSelectedOutcome((fd.selectedOutcome as string) || null)
        setSkillType(toStr(fd.skillType))
        setSkillDomain(toStr(fd.skillDomain))
        setCurrentLevel(toNum(fd.currentLevel, 3))
        setTargetLevel(toNum(fd.targetLevel, 4))
        setLearningMode(['Awareness', 'Practical', 'Applied'].includes(String(fd.learningMode)) ? (fd.learningMode as 'Awareness' | 'Practical' | 'Applied') : 'Awareness')
        setHandsOnPractice(toBool(fd.handsOnPractice))
        setCertificationRequired(toBool(fd.certificationRequired))
        setSecondarySelected(toSet(fd.secondarySelected))
        setSuccessMetrics(toStr(fd.successMetrics))
        setRevenueType(toStr(fd.revenueType))
        setTargetAudience(toStr(fd.targetAudience))
        setExpectedLeads(toStr(fd.expectedLeads))
        setExpectedConversion(toStr(fd.expectedConversion))
        setDealSizeMin(toStr(fd.dealSizeMin))
        setDealSizeMax(toStr(fd.dealSizeMax))
        setFollowUpMechanism(toBool(fd.followUpMechanism))
        setHiringGoal(toStr(fd.hiringGoal))
        setAssessmentType(toStr(fd.assessmentType))
        setRolesTargeted(toStr(fd.rolesTargeted))
        setExperienceLevel(toStr(fd.experienceLevel))
        setExpectedHires(toStr(fd.expectedHires))
        setEmployerBrandingFocus(toBool(fd.employerBrandingFocus))
        setPositioningGoal(toStr(fd.positioningGoal))
        setBrandTargetAudience(toStr(fd.brandTargetAudience))
        setBrandMessageClarity(toNum(fd.brandMessageClarity, 3))
        setVisibilityChannels(toStr(fd.visibilityChannels))
        setSpeakerInfluence(toNum(fd.speakerInfluence, 3))
        setAlignmentType(toStr(fd.alignmentType))
        setLeadershipLevel(toStr(fd.leadershipLevel))
        setDecisionOutcomeExpected(toBool(fd.decisionOutcomeExpected))
        setConflictResolutionRequired(toBool(fd.conflictResolutionRequired))
        setCrossFunctionAlignment(toBool(fd.crossFunctionAlignment))
        setProblemType(toStr(fd.problemType))
        setProblemDefinitionClarity(toNum(fd.problemDefinitionClarity, 3))
        setCollaborationLevel(toNum(fd.collaborationLevel, 3))
        setSolutionExpected(toBool(fd.solutionExpected))
        setPrototypeExpected(toBool(fd.prototypeExpected))
        setComplianceType(toStr(fd.complianceType))
        setRegulatoryBody(toStr(fd.regulatoryBody))
        setMandatoryCompliance(toBool(fd.mandatoryCompliance))
        setAuditPreparationRequired(toBool(fd.auditPreparationRequired))
        setCertificationRequiredCompliance(toBool(fd.certificationRequiredCompliance))
        setNetworkingType(toStr(fd.networkingType))
        setConnectionGoal(toStr(fd.connectionGoal))
        setRelationshipDepthExpected(toStr(fd.relationshipDepthExpected))
        setFollowUpStructureDefined(toBool(fd.followUpStructureDefined))
        setProductType(toStr(fd.productType))
        setAdoptionStage(toStr(fd.adoptionStage))
        setFeatureFocus(toStr(fd.featureFocus))
        setUserSegment(toStr(fd.userSegment))
        setOnboardingRequired(toBool(fd.onboardingRequired))
        setBehaviourType(toStr(fd.behaviourType))
        setCurrentBehaviorDescription(toStr(fd.currentBehaviorDescription))
        setTargetBehavior(toStr(fd.targetBehavior))
        setReinforcementRequired(toBool(fd.reinforcementRequired))
        setMeasurementRequired(toBool(fd.measurementRequired))
        setAudienceSelected(toSet(fd.audienceSelected))
        setSenioritySelected(toSet(fd.senioritySelected))
        setAudienceSize(toStr(fd.audienceSize))
        setPriorKnowledge(toStr(fd.priorKnowledge) || 'L3')
        setLearningCurve(toNum(fd.learningCurve, 3))
        setJargonTolerance(toNum(fd.jargonTolerance, 3))
        setDepthCapacity(toNum(fd.depthCapacity, 3))
        setPaceOfDelivery(toNum(fd.paceOfDelivery, 3))
        setFunctionalSelected(toSet(fd.functionalSelected))
        setIndustrySelected(toSet(fd.industrySelected))
        setResistanceLevel(toStr(fd.resistanceLevel) || 'low')
        setDiversityOfAudience(toBool(fd.diversityOfAudience))
        setDecisionPower(toNum(fd.decisionPower, 3))
        setExecutionResponsibility(toNum(fd.executionResponsibility, 3))
        setDomainExpertise(toNum(fd.domainExpertise, 3))
        setInfluenceLevel(toNum(fd.influenceLevel, 3))
        setLearningVsActionBias(toStr(fd.learningVsActionBias))
        setAverageExperience(toStr(fd.averageExperience))
        setAbstractionLevelCapacity(toNum(fd.abstractionLevelCapacity, 3))
        setDecisionAuthority(toNum(fd.decisionAuthority, 3))
        setToleranceForBasics(toNum(fd.toleranceForBasics, 3))
        setTechnicalOrientation(toNum(fd.technicalOrientation, 3))
        setBusinessOrientation(toNum(fd.businessOrientation, 3))
        setToolUsageMaturity(toNum(fd.toolUsageMaturity, 3))
        setProcessOrientation(toNum(fd.processOrientation, 3))
        setRegulationLevel(toNum(fd.regulationLevel, 3))
        setTechnicalComplexity(toNum(fd.technicalComplexity, 3))
        setPaceOfChange(toNum(fd.paceOfChange, 3))
        setDomainSpecificityRequired(toNum(fd.domainSpecificityRequired, 3))
        setEngagementEffortRequired(toNum(fd.engagementEffortRequired, 3))
        setInteractivityRequired(toNum(fd.interactivityRequired, 3))
        setPersuasionNeeded(toNum(fd.persuasionNeeded, 3))
        setTrustBuildingRequired(toNum(fd.trustBuildingRequired, 3))
        setEngagementDepth(toStr(fd.engagementDepth) || '3')
        setInteractivityLevel(toNum(fd.interactivityLevel, 50))
        setCustomizationNeed(toNum(fd.customizationNeed, 50))
        setDeliverablesSelected(toSet(fd.deliverablesSelected))
        setDeliverableDetailsById((fd.deliverableDetailsById as Record<string, { format: string; deliveryTimeline: string; ownership: string; measurableOutput: boolean }>) || {})
        setFollowUpSupportRequired(toBool(fd.followUpSupportRequired))
        setEngagementTypeSelected((fd.engagementTypeSelected as string) || null)
        setInteractionIntensity(toNum(fd.interactionIntensity, 3))
        setFacilitationComplexity(toNum(fd.facilitationComplexity, 3))
        setOutcomeOrientation(toStr(fd.outcomeOrientation))
        setContinuityRequired(toBool(fd.continuityRequired))
        setExpertTypeRequired(toStr(fd.expertTypeRequired))
        setDeliveryModeSelected((fd.deliveryModeSelected as string) || null)
        setRoomSeatingStyle(toStr(fd.roomSeatingStyle))
        setAvSetupRequired(toStr(fd.avSetupRequired))
        setDeliveryTechnologyDependency(toNum(fd.deliveryTechnologyDependency, 3))
        setDeliveryEngagementDropRisk(toNum(fd.deliveryEngagementDropRisk, 3))
        setDeliveryPlatform(toStr(fd.deliveryPlatform))
        setBreakoutRoomsNeeded(toBool(fd.breakoutRoomsNeeded))
        setRecordingRequired(toBool(fd.recordingRequired))
        setTotalDurationMinutes(toStr(fd.totalDurationMinutes))
        setFatigueRisk(toNum(fd.fatigueRisk, 3))
        setPacingRequirement(toNum(fd.pacingRequirement, 3))
        setDepthPossible(toNum(fd.depthPossible, 3))
        setBreaksRequired(toBool(fd.breaksRequired))
        setTotalSessions(toStr(fd.totalSessions) || '1')
        setSessionPattern(toStr(fd.sessionPattern) || 'multi_session_fixed')
        setContinuityLevel(toNum(fd.continuityLevel, 3))
        setMultiSessionReinforcementRequired(toBool(fd.multiSessionReinforcementRequired))
        setSchedulingComplexity(toNum(fd.schedulingComplexity, 3))
        setDependencyBetweenSessions(toBool(fd.dependencyBetweenSessions))
        setPreferredStartDate(toStr(fd.preferredStartDate))
        setPreferredEndDate(toStr(fd.preferredEndDate))
        setFlexibilityLevel(toStr(fd.flexibilityLevel))
        setUrgencyLevel(toStr(fd.urgencyLevel))
        setCity(toStr(fd.city))
        setState(toStr(fd.stateRegion ?? fd.state))
        setCountry(toStr(fd.country))
        setVenueType(toStr(fd.venueType))
        setVenueDetails(toStr(fd.venueDetails))
        setPreferredTimeSlots(toSet(fd.preferredTimeSlots))
        setBlackoutDates(toStr(fd.blackoutDates))
        setDailyTimeWindow(toStr(fd.dailyTimeWindow))
        setTimezone(toStr(fd.timezone))
        setSchedulingRestrictions(toStr(fd.schedulingRestrictions))
        setPreparationTimeSelected((fd.preparationTimeSelected as string) || null)
        setSchedulingFlexibility(toNum(fd.schedulingFlexibility, 3))
        setCoordinationComplexity(toNum(fd.coordinationComplexity, 3))
        setConflictProbability(toNum(fd.conflictProbability, 3))
        setBudgetBandSelected((fd.budgetBandSelected as string) || null)
        setMinBudget(toNum(fd.minBudget, 100000))
        setMaxBudget(toNum(fd.maxBudget, 250000))
        setBudgetType(toStr(fd.budgetType))
        setCurrency(toStr(fd.currency) || 'INR (₹)')
        setBudgetFlexibility((fd.budgetFlexibility as string) || null)
        setPaymentTermSelected((fd.paymentTermSelected as string) || null)
        setCostQualityPriority((fd.costQualityPriority as string) || null)
        setCostQualityScore(toNum(fd.costQualityScore, 3))
        if (!cancelled) setDraftLoadError(null)
      })
      .catch(() => {
        if (!cancelled) setDraftLoadError('Failed to load draft.')
      })
      .finally(() => {
        if (!cancelled) setDraftLoading(false)
      })
    return () => { cancelled = true }
  }, [draftId])

  function buildFormData(): Record<string, unknown> {
    return {
      selectedOutcome,
      skillType,
      skillDomain,
      currentLevel,
      targetLevel,
      learningMode,
      handsOnPractice,
      certificationRequired,
      secondarySelected: Array.from(secondarySelected),
      successMetrics,
      revenueType,
      targetAudience,
      expectedLeads,
      expectedConversion,
      dealSizeMin,
      dealSizeMax,
      followUpMechanism,
      hiringGoal,
      assessmentType,
      rolesTargeted,
      experienceLevel,
      expectedHires,
      employerBrandingFocus,
      positioningGoal,
      brandTargetAudience,
      brandMessageClarity,
      visibilityChannels,
      speakerInfluence,
      alignmentType,
      leadershipLevel,
      decisionOutcomeExpected,
      conflictResolutionRequired,
      crossFunctionAlignment,
      problemType,
      problemDefinitionClarity,
      collaborationLevel,
      solutionExpected,
      prototypeExpected,
      complianceType,
      regulatoryBody,
      mandatoryCompliance,
      auditPreparationRequired,
      certificationRequiredCompliance,
      networkingType,
      connectionGoal,
      relationshipDepthExpected,
      followUpStructureDefined,
      productType,
      adoptionStage,
      featureFocus,
      userSegment,
      onboardingRequired,
      behaviourType,
      currentBehaviorDescription,
      targetBehavior,
      reinforcementRequired,
      measurementRequired,
      audienceSelected: Array.from(audienceSelected),
      senioritySelected: Array.from(senioritySelected),
      audienceSize,
      priorKnowledge,
      learningCurve,
      jargonTolerance,
      depthCapacity,
      paceOfDelivery,
      functionalSelected: Array.from(functionalSelected),
      industrySelected: Array.from(industrySelected),
      resistanceLevel,
      diversityOfAudience,
      decisionPower,
      executionResponsibility,
      domainExpertise,
      influenceLevel,
      learningVsActionBias,
      averageExperience,
      abstractionLevelCapacity,
      decisionAuthority,
      toleranceForBasics,
      technicalOrientation,
      businessOrientation,
      toolUsageMaturity,
      processOrientation,
      regulationLevel,
      technicalComplexity,
      paceOfChange,
      domainSpecificityRequired,
      engagementEffortRequired,
      interactivityRequired,
      persuasionNeeded,
      trustBuildingRequired,
      engagementDepth,
      interactivityLevel,
      customizationNeed,
      deliverablesSelected: Array.from(deliverablesSelected),
      deliverableDetailsById,
      followUpSupportRequired,
      engagementTypeSelected,
      interactionIntensity,
      facilitationComplexity,
      outcomeOrientation,
      continuityRequired,
      expertTypeRequired,
      deliveryModeSelected,
      roomSeatingStyle,
      avSetupRequired,
      deliveryTechnologyDependency,
      deliveryEngagementDropRisk,
      deliveryPlatform,
      meetLink,
      breakoutRoomsNeeded,
      recordingRequired,
      totalDurationMinutes,
      fatigueRisk,
      pacingRequirement,
      depthPossible,
      breaksRequired,
      totalSessions,
      sessionPattern,
      continuityLevel,
      multiSessionReinforcementRequired,
      schedulingComplexity,
      dependencyBetweenSessions,
      preferredStartDate,
      preferredEndDate,
      flexibilityLevel,
      urgencyLevel,
      city,
      stateRegion: state,
      country,
      venueType,
      venueDetails,
      preferredTimeSlots: Array.from(preferredTimeSlots),
      blackoutDates,
      dailyTimeWindow,
      timezone,
      schedulingRestrictions,
      preparationTimeSelected,
      schedulingFlexibility,
      coordinationComplexity,
      conflictProbability,
      budgetBandSelected,
      minBudget,
      maxBudget,
      budgetType,
      currency,
      budgetFlexibility,
      paymentTermSelected,
      costQualityPriority,
      costQualityScore,
    }
  }

  async function handlePublish() {
    setPublishError('')
    setPublishing(true)
    try {
      const formData = buildFormData()
      const idToUpdate = draftId ?? draftRequirementId
      if (idToUpdate) {
        await updateRequirementApi(idToUpdate, { status: 'published', formData })
      } else {
        await createRequirementApi({ status: 'published', formData })
      }
      navigate('/business/requirement')
    } catch (err) {
      setPublishError(err instanceof Error ? err.message : 'Failed to publish requirement.')
      setPublishing(false)
    }
  }

  async function handleSaveDraft() {
    setDraftMessage('')
    setSavingDraft(true)
    try {
      const formData = buildFormData()
      const idToUpdate = draftId ?? draftRequirementId
      if (idToUpdate) {
        await updateRequirementApi(idToUpdate, { status: 'draft', formData })
      } else {
        await createRequirementApi({ status: 'draft', formData })
      }
      navigate('/business/requirement')
    } catch (err) {
      setDraftMessage(err instanceof Error ? err.message : 'Failed to save draft.')
      setSavingDraft(false)
    }
  }

  return (
    <DashboardLayout
      sidebarItems={businessSidebarItems}
      sidebarBottomItems={businessSidebarBottomItems}
      userTypeLabel="Business"
      userDisplayName="Acme Corp"
      userSubLabel="Business Account"
      sidebarClassName="bg-gray-50"
    >
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-8 max-h-[calc(100vh-10rem)] min-h-0">
          <div ref={scrollRef} className="flex-1 min-w-0 overflow-y-auto min-h-0 pr-2">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Create Requirement</h1>
                <p className="text-sm text-gray-500 mt-0.5">
                  {step === 1 ? 'Step 1: Define Your Objective' : step === 2 ? 'Step 2: Describe Your Audience' : step === 3 ? 'Step 3: Set Depth & Engagement' : step === 4 ? 'Step 4: Format & Logistics' : step === 5 ? 'Step 5: Commercial Terms' : 'Step 6: Review & Publish'}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-500">Last saved: {lastSaved}</span>
                <Link
                  to="/business/requirement"
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
                  aria-label="Close"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </Link>
              </div>
            </div>

            <div className="h-2 rounded-full bg-gray-200 overflow-hidden mb-8">
              <div className="h-full rounded-full bg-[#2293B4]" style={{ width: step === 1 ? '16.67%' : step === 2 ? '33.33%' : step === 3 ? '50%' : step === 4 ? '66.67%' : step === 5 ? '83.33%' : '100%' }} />
            </div>

            {draftLoading && (
              <div className="flex items-center justify-center py-12">
                <svg className="animate-spin h-8 w-8 text-[#2293B4]" width="32" height="32" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span className="ml-2 text-gray-600">Loading draft…</span>
              </div>
            )}

            {draftLoadError && !draftLoading && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 mb-6">
                <p className="text-amber-800">{draftLoadError}</p>
                <Link to="/business/requirement" className="inline-block mt-2 text-sm font-medium text-[#2293B4] hover:underline">
                  Back to requirements
                </Link>
              </div>
            )}

            {!draftLoading && !draftLoadError && step === 1 && (
            <>
            <h2 className="text-lg font-bold text-gray-900 mb-4">What&apos;s your primary outcome?</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {OUTCOME_CARDS.map((card) => (
                <button
                  key={card.id}
                  type="button"
                  onClick={() => setSelectedOutcome(selectedOutcome === card.id ? null : card.id)}
                  className={`text-left rounded-xl border p-4 shadow-sm transition-colors ${
                    selectedOutcome === card.id
                      ? 'border-[#2293B4] bg-[#E0F7FA] ring-1 ring-[#2293B4]'
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <span className={`inline-flex w-10 h-10 items-center justify-center rounded-lg shrink-0 ${selectedOutcome === card.id ? 'text-[#2293B4]' : 'text-gray-500'}`}>
                    {card.icon}
                  </span>
                  <h3 className="font-semibold text-gray-900 mt-3">{card.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">{card.description}</p>
                </button>
              ))}
            </div>

            {selectedOutcome === 'skill-development' && (
              <div className="mt-8 space-y-8">
                <div className="rounded-xl border border-gray-200 bg-[#F0F4F8] p-6 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 mb-5">Skill Development Details</h3>
                  <div className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className={labelClass}>Skill Type</label>
                        <CustomSelect
                          id="skill-type"
                          value={skillType}
                          onChange={setSkillType}
                          options={SKILL_TYPE_OPTIONS}
                          placeholder="Select type"
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Skill Domain</label>
                        <input
                          type="text"
                          value={skillDomain}
                          onChange={(e) => setSkillDomain(e.target.value)}
                          placeholder="e.g., AI, Sales, Communication"
                          className={inputClass}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className={labelClass}>Current Level (L1-L5)</label>
                        <input
                          type="range"
                          min={1}
                          max={5}
                          value={currentLevel}
                          onChange={(e) => setCurrentLevel(Number(e.target.value))}
                          className="level-slider w-full h-2 rounded-full [appearance:none] [-webkit-appearance:none] bg-transparent"
                          style={{ background: levelSliderBg(currentLevel) }}
                        />
                        <p className="text-sm mt-1" style={{ color: TEAL }}>Level {currentLevel}</p>
                      </div>
                      <div>
                        <label className={labelClass}>Target Level (L1-L5)</label>
                        <input
                          type="range"
                          min={1}
                          max={5}
                          value={targetLevel}
                          onChange={(e) => setTargetLevel(Number(e.target.value))}
                          className="level-slider w-full h-2 rounded-full [appearance:none] [-webkit-appearance:none] bg-transparent"
                          style={{ background: levelSliderBg(targetLevel) }}
                        />
                        <p className="text-sm mt-1" style={{ color: TEAL }}>Level {targetLevel}</p>
                      </div>
                    </div>
                    <div>
                      <label className={labelClass}>Learning Mode</label>
                      <div className="flex flex-wrap gap-6 pt-1">
                        {LEARNING_MODES.map((mode) => (
                          <label key={mode} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="learning-mode"
                              value={mode}
                              checked={learningMode === mode}
                              onChange={() => setLearningMode(mode)}
                              className="w-4 h-4 border-2 border-gray-300 text-[#2293B4] focus:ring-[#2293B4]"
                            />
                            <span className="text-sm font-medium text-gray-700">{mode}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-8 pt-1">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-gray-700">Hands-on Practice Required</span>
                        <button
                          type="button"
                          role="switch"
                          aria-checked={handsOnPractice}
                          onClick={() => setHandsOnPractice(!handsOnPractice)}
                          className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-0 transition-colors focus:outline-none focus:ring-2 focus:ring-[#2293B4] focus:ring-offset-2 ${
                            handsOnPractice ? 'bg-[#2293B4]' : 'bg-gray-200'
                          }`}
                        >
                          <span className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow ring-0 transition-transform mt-0.5 ml-0.5 ${handsOnPractice ? 'translate-x-6' : 'translate-x-0'}`} />
                        </button>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-gray-700">Certification Required</span>
                        <button
                          type="button"
                          role="switch"
                          aria-checked={certificationRequired}
                          onClick={() => setCertificationRequired(!certificationRequired)}
                          className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-0 transition-colors focus:outline-none focus:ring-2 focus:ring-[#2293B4] focus:ring-offset-2 ${
                            certificationRequired ? 'bg-[#2293B4]' : 'bg-gray-200'
                          }`}
                        >
                          <span className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow ring-0 transition-transform mt-0.5 ml-0.5 ${certificationRequired ? 'translate-x-6' : 'translate-x-0'}`} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">Secondary Objectives (Optional)</h3>
                  <p className="text-sm text-gray-500 mb-4">Select complementary goals to enhance outcomes</p>
                  <div className="flex flex-wrap gap-2">
                    {SECONDARY_OBJECTIVES.map((obj) => (
                      <button
                        key={obj}
                        type="button"
                        onClick={() => toggleSecondary(obj)}
                        className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                          secondarySelected.has(obj)
                            ? 'bg-[#2293B4] text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {obj}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4">How will you measure success?</h3>
                  <textarea
                    value={successMetrics}
                    onChange={(e) => setSuccessMetrics(e.target.value)}
                    placeholder="e.g., 80% of participants apply learned skills within 2 weeks, measured through manager surveys"
                    rows={4}
                    className={`${inputClass} resize-y min-h-[100px]`}
                  />
                  <p className="text-sm text-gray-500 mt-2">Clear success metrics improve expert matching by 40%</p>
                </div>
              </div>
            )}

            {selectedOutcome === 'revenue-generation' && (
              <div className="mt-8 space-y-8">
                <div className="rounded-xl border border-gray-200 bg-[#F0F4F8] p-6 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 mb-5">Revenue Generation Details</h3>
                  <div className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className={labelClass}>Revenue Type</label>
                        <CustomSelect
                          id="revenue-type"
                          value={revenueType}
                          onChange={setRevenueType}
                          options={REVENUE_TYPE_OPTIONS}
                          placeholder="Select type"
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Target Audience</label>
                        <CustomSelect
                          id="target-audience"
                          value={targetAudience}
                          onChange={setTargetAudience}
                          options={TARGET_AUDIENCE_OPTIONS}
                          placeholder="Who are you targeting?"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className={labelClass}>Expected Leads</label>
                        <input
                          type="number"
                          min={0}
                          value={expectedLeads}
                          onChange={(e) => setExpectedLeads(e.target.value)}
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Expected Conversion Rate (%)</label>
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={expectedConversion}
                          onChange={(e) => setExpectedConversion(e.target.value)}
                          className={inputClass}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className={labelClass}>Deal Size Min (₹)</label>
                        <input
                          type="number"
                          min={0}
                          value={dealSizeMin}
                          onChange={(e) => setDealSizeMin(e.target.value)}
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Deal Size Max (₹)</label>
                        <input
                          type="number"
                          min={0}
                          value={dealSizeMax}
                          onChange={(e) => setDealSizeMax(e.target.value)}
                          className={inputClass}
                        />
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                      <span className="text-sm font-medium text-gray-700">Follow-up Mechanism Defined</span>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={followUpMechanism}
                        onClick={() => setFollowUpMechanism(!followUpMechanism)}
                        className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-0 transition-colors focus:outline-none focus:ring-2 focus:ring-[#2293B4] focus:ring-offset-2 ${
                          followUpMechanism ? 'bg-[#2293B4]' : 'bg-gray-200'
                        }`}
                      >
                        <span className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow ring-0 transition-transform mt-0.5 ml-0.5 ${followUpMechanism ? 'translate-x-6' : 'translate-x-0'}`} />
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">Secondary Objectives (Optional)</h3>
                  <p className="text-sm text-gray-500 mb-4">Select complementary goals to enhance outcomes</p>
                  <div className="flex flex-wrap gap-2">
                    {SECONDARY_OBJECTIVES.map((obj) => (
                      <button
                        key={obj}
                        type="button"
                        onClick={() => toggleSecondary(obj)}
                        className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                          secondarySelected.has(obj)
                            ? 'bg-[#2293B4] text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {obj}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4">How will you measure success?</h3>
                  <textarea
                    value={successMetrics}
                    onChange={(e) => setSuccessMetrics(e.target.value)}
                    placeholder="e.g., 80% of participants apply learned skills within 2 weeks, measured through manager surveys"
                    rows={4}
                    className={`${inputClass} resize-y min-h-[100px]`}
                  />
                  <p className="text-sm text-gray-500 mt-2">Clear success metrics improve expert matching by 40%</p>
                </div>
              </div>
            )}

            {selectedOutcome === 'hiring-talent' && (
              <div className="mt-8 space-y-8">
                <div className="rounded-xl border border-gray-200 bg-[#F0F4F8] p-6 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 mb-5">Hiring & Talent Details</h3>
                  <div className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className={labelClass}>Hiring Goal</label>
                        <CustomSelect
                          id="hiring-goal"
                          value={hiringGoal}
                          onChange={setHiringGoal}
                          options={HIRING_GOAL_OPTIONS}
                          placeholder="Select goal"
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Assessment Type</label>
                        <CustomSelect
                          id="assessment-type"
                          value={assessmentType}
                          onChange={setAssessmentType}
                          options={ASSESSMENT_TYPE_OPTIONS}
                          placeholder="How will you assess?"
                        />
                      </div>
                    </div>
                    <div>
                      <label className={labelClass}>Roles Targeted (comma-separated)</label>
                      <input
                        type="text"
                        value={rolesTargeted}
                        onChange={(e) => setRolesTargeted(e.target.value)}
                        placeholder="e.g., Software Engineer, Product Manager"
                        className={inputClass}
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className={labelClass}>Experience Level Required</label>
                        <input
                          type="text"
                          value={experienceLevel}
                          onChange={(e) => setExperienceLevel(e.target.value)}
                          placeholder="e.g., 2-5 years"
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Expected Hires</label>
                        <input
                          type="number"
                          min={0}
                          value={expectedHires}
                          onChange={(e) => setExpectedHires(e.target.value)}
                          className={inputClass}
                        />
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                      <span className="text-sm font-medium text-gray-700">Employer Branding Focus</span>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={employerBrandingFocus}
                        onClick={() => setEmployerBrandingFocus(!employerBrandingFocus)}
                        className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-0 transition-colors focus:outline-none focus:ring-2 focus:ring-[#2293B4] focus:ring-offset-2 ${
                          employerBrandingFocus ? 'bg-[#2293B4]' : 'bg-gray-200'
                        }`}
                      >
                        <span className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow ring-0 transition-transform mt-0.5 ml-0.5 ${employerBrandingFocus ? 'translate-x-6' : 'translate-x-0'}`} />
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">Secondary Objectives (Optional)</h3>
                  <p className="text-sm text-gray-500 mb-4">Select complementary goals to enhance outcomes</p>
                  <div className="flex flex-wrap gap-2">
                    {SECONDARY_OBJECTIVES.map((obj) => (
                      <button
                        key={obj}
                        type="button"
                        onClick={() => toggleSecondary(obj)}
                        className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                          secondarySelected.has(obj)
                            ? 'bg-[#2293B4] text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {obj}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4">How will you measure success?</h3>
                  <textarea
                    value={successMetrics}
                    onChange={(e) => setSuccessMetrics(e.target.value)}
                    placeholder="e.g., 80% of participants apply learned skills within 2 weeks, measured through manager surveys"
                    rows={4}
                    className={`${inputClass} resize-y min-h-[100px]`}
                  />
                  <p className="text-sm text-gray-500 mt-2">Clear success metrics improve expert matching by 40%</p>
                </div>
              </div>
            )}

            {selectedOutcome === 'brand-positioning' && (
              <div className="mt-8 space-y-8">
                <div className="rounded-xl border border-gray-200 bg-[#F0F4F8] p-6 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 mb-5">Brand Positioning Details</h3>
                  <div className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className={labelClass}>Positioning Goal</label>
                        <CustomSelect
                          id="positioning-goal"
                          value={positioningGoal}
                          onChange={setPositioningGoal}
                          options={POSITIONING_GOAL_OPTIONS}
                          placeholder="Select goal"
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Target Audience</label>
                        <input
                          type="text"
                          value={brandTargetAudience}
                          onChange={(e) => setBrandTargetAudience(e.target.value)}
                          placeholder="e.g., C-suite, Industry peers"
                          className={inputClass}
                        />
                      </div>
                    </div>
                    <div>
                      <label className={labelClass}>Brand Message Clarity (1-5)</label>
                      <input
                        type="range"
                        min={1}
                        max={5}
                        value={brandMessageClarity}
                        onChange={(e) => setBrandMessageClarity(Number(e.target.value))}
                        className="level-slider w-full h-2 rounded-full [appearance:none] [-webkit-appearance:none] bg-transparent"
                        style={{ background: levelSliderBg(brandMessageClarity) }}
                      />
                      <p className="text-sm mt-1" style={{ color: TEAL }}>Level {brandMessageClarity}</p>
                    </div>
                    <div>
                      <label className={labelClass}>Visibility Channels (comma-separated)</label>
                      <input
                        type="text"
                        value={visibilityChannels}
                        onChange={(e) => setVisibilityChannels(e.target.value)}
                        placeholder="e.g., LinkedIn, Industry Events, PR"
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Speaker Influence Required (1-5)</label>
                      <input
                        type="range"
                        min={1}
                        max={5}
                        value={speakerInfluence}
                        onChange={(e) => setSpeakerInfluence(Number(e.target.value))}
                        className="level-slider w-full h-2 rounded-full [appearance:none] [-webkit-appearance:none] bg-transparent"
                        style={{ background: levelSliderBg(speakerInfluence) }}
                      />
                      <p className="text-sm mt-1" style={{ color: TEAL }}>Level {speakerInfluence}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">Secondary Objectives (Optional)</h3>
                  <p className="text-sm text-gray-500 mb-4">Select complementary goals to enhance outcomes</p>
                  <div className="flex flex-wrap gap-2">
                    {SECONDARY_OBJECTIVES.map((obj) => (
                      <button
                        key={obj}
                        type="button"
                        onClick={() => toggleSecondary(obj)}
                        className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                          secondarySelected.has(obj)
                            ? 'bg-[#2293B4] text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {obj}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4">How will you measure success?</h3>
                  <textarea
                    value={successMetrics}
                    onChange={(e) => setSuccessMetrics(e.target.value)}
                    placeholder="e.g., 80% of participants apply learned skills within 2 weeks, measured through manager surveys"
                    rows={4}
                    className={`${inputClass} resize-y min-h-[100px]`}
                  />
                  <p className="text-sm text-gray-500 mt-2">Clear success metrics improve expert matching by 40%</p>
                </div>
              </div>
            )}

            {selectedOutcome === 'leadership-alignment' && (
              <div className="mt-8 space-y-8">
                <div className="rounded-xl border border-gray-200 bg-[#F0F4F8] p-6 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 mb-5">Leadership Alignment Details</h3>
                  <div className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className={labelClass}>Alignment Type</label>
                        <CustomSelect
                          id="alignment-type"
                          value={alignmentType}
                          onChange={setAlignmentType}
                          options={ALIGNMENT_TYPE_OPTIONS}
                          placeholder="Select type"
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Leadership Level</label>
                        <CustomSelect
                          id="leadership-level"
                          value={leadershipLevel}
                          onChange={setLeadershipLevel}
                          options={LEADERSHIP_LEVEL_OPTIONS}
                          placeholder="Select level"
                        />
                      </div>
                    </div>
                    <div className="flex flex-col gap-4 pt-1">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-sm font-medium text-gray-700">Decision Outcome Expected</span>
                        <button
                          type="button"
                          role="switch"
                          aria-checked={decisionOutcomeExpected}
                          onClick={() => setDecisionOutcomeExpected(!decisionOutcomeExpected)}
                          className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-0 transition-colors focus:outline-none focus:ring-2 focus:ring-[#2293B4] focus:ring-offset-2 ${
                            decisionOutcomeExpected ? 'bg-[#2293B4]' : 'bg-gray-200'
                          }`}
                        >
                          <span className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow ring-0 transition-transform mt-0.5 ml-0.5 ${decisionOutcomeExpected ? 'translate-x-6' : 'translate-x-0'}`} />
                        </button>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-sm font-medium text-gray-700">Conflict Resolution Required</span>
                        <button
                          type="button"
                          role="switch"
                          aria-checked={conflictResolutionRequired}
                          onClick={() => setConflictResolutionRequired(!conflictResolutionRequired)}
                          className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-0 transition-colors focus:outline-none focus:ring-2 focus:ring-[#2293B4] focus:ring-offset-2 ${
                            conflictResolutionRequired ? 'bg-[#2293B4]' : 'bg-gray-200'
                          }`}
                        >
                          <span className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow ring-0 transition-transform mt-0.5 ml-0.5 ${conflictResolutionRequired ? 'translate-x-6' : 'translate-x-0'}`} />
                        </button>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-sm font-medium text-gray-700">Cross-Function Alignment</span>
                        <button
                          type="button"
                          role="switch"
                          aria-checked={crossFunctionAlignment}
                          onClick={() => setCrossFunctionAlignment(!crossFunctionAlignment)}
                          className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-0 transition-colors focus:outline-none focus:ring-2 focus:ring-[#2293B4] focus:ring-offset-2 ${
                            crossFunctionAlignment ? 'bg-[#2293B4]' : 'bg-gray-200'
                          }`}
                        >
                          <span className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow ring-0 transition-transform mt-0.5 ml-0.5 ${crossFunctionAlignment ? 'translate-x-6' : 'translate-x-0'}`} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">Secondary Objectives (Optional)</h3>
                  <p className="text-sm text-gray-500 mb-4">Select complementary goals to enhance outcomes</p>
                  <div className="flex flex-wrap gap-2">
                    {SECONDARY_OBJECTIVES.map((obj) => (
                      <button
                        key={obj}
                        type="button"
                        onClick={() => toggleSecondary(obj)}
                        className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                          secondarySelected.has(obj)
                            ? 'bg-[#2293B4] text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {obj}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4">How will you measure success?</h3>
                  <textarea
                    value={successMetrics}
                    onChange={(e) => setSuccessMetrics(e.target.value)}
                    placeholder="e.g., 80% of participants apply learned skills within 2 weeks, measured through manager surveys"
                    rows={4}
                    className={`${inputClass} resize-y min-h-[100px]`}
                  />
                  <p className="text-sm text-gray-500 mt-2">Clear success metrics improve expert matching by 40%</p>
                </div>
              </div>
            )}

            {selectedOutcome === 'innovation-problem-solving' && (
              <div className="mt-8 space-y-8">
                <div className="rounded-xl border border-gray-200 bg-[#F0F4F8] p-6 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 mb-5">Innovation & Problem Solving Details</h3>
                  <div className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className={labelClass}>Problem Type</label>
                        <CustomSelect
                          id="problem-type"
                          value={problemType}
                          onChange={setProblemType}
                          options={PROBLEM_TYPE_OPTIONS}
                          placeholder="Select type"
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Problem Definition Clarity (1-5)</label>
                        <input
                          type="range"
                          min={1}
                          max={5}
                          value={problemDefinitionClarity}
                          onChange={(e) => setProblemDefinitionClarity(Number(e.target.value))}
                          className="level-slider w-full h-2 rounded-full [appearance:none] [-webkit-appearance:none] bg-transparent"
                          style={{ background: levelSliderBg(problemDefinitionClarity) }}
                        />
                        <p className="text-sm mt-1" style={{ color: TEAL }}>Level {problemDefinitionClarity}</p>
                      </div>
                    </div>
                    <div>
                      <label className={labelClass}>Collaboration Level (1-5)</label>
                      <input
                        type="range"
                        min={1}
                        max={5}
                        value={collaborationLevel}
                        onChange={(e) => setCollaborationLevel(Number(e.target.value))}
                        className="level-slider w-full h-2 rounded-full [appearance:none] [-webkit-appearance:none] bg-transparent"
                        style={{ background: levelSliderBg(collaborationLevel) }}
                      />
                      <p className="text-sm mt-1" style={{ color: TEAL }}>Level {collaborationLevel}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-8 pt-1">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-gray-700">Solution Expected</span>
                        <button
                          type="button"
                          role="switch"
                          aria-checked={solutionExpected}
                          onClick={() => setSolutionExpected(!solutionExpected)}
                          className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-0 transition-colors focus:outline-none focus:ring-2 focus:ring-[#2293B4] focus:ring-offset-2 ${solutionExpected ? 'bg-[#2293B4]' : 'bg-gray-200'}`}
                        >
                          <span className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow ring-0 transition-transform mt-0.5 ml-0.5 ${solutionExpected ? 'translate-x-6' : 'translate-x-0'}`} />
                        </button>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-gray-700">Prototype Expected</span>
                        <button
                          type="button"
                          role="switch"
                          aria-checked={prototypeExpected}
                          onClick={() => setPrototypeExpected(!prototypeExpected)}
                          className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-0 transition-colors focus:outline-none focus:ring-2 focus:ring-[#2293B4] focus:ring-offset-2 ${prototypeExpected ? 'bg-[#2293B4]' : 'bg-gray-200'}`}
                        >
                          <span className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow ring-0 transition-transform mt-0.5 ml-0.5 ${prototypeExpected ? 'translate-x-6' : 'translate-x-0'}`} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                <div><h3 className="text-lg font-bold text-gray-900 mb-1">Secondary Objectives (Optional)</h3><p className="text-sm text-gray-500 mb-4">Select complementary goals to enhance outcomes</p><div className="flex flex-wrap gap-2">{SECONDARY_OBJECTIVES.map((obj) => (<button key={obj} type="button" onClick={() => toggleSecondary(obj)} className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${secondarySelected.has(obj) ? 'bg-[#2293B4] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>{obj}</button>))}</div></div>
                <div><h3 className="text-lg font-bold text-gray-900 mb-4">How will you measure success?</h3><textarea value={successMetrics} onChange={(e) => setSuccessMetrics(e.target.value)} placeholder="e.g., 80% of participants apply learned skills within 2 weeks, measured through manager surveys" rows={4} className={`${inputClass} resize-y min-h-[100px]`} /><p className="text-sm text-gray-500 mt-2">Clear success metrics improve expert matching by 40%</p></div>
              </div>
            )}

            {selectedOutcome === 'compliance-risk' && (
              <div className="mt-8 space-y-8">
                <div className="rounded-xl border border-gray-200 bg-[#F0F4F8] p-6 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 mb-5">Compliance & Risk Details</h3>
                  <div className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className={labelClass}>Compliance Type</label>
                        <CustomSelect
                          id="compliance-type"
                          value={complianceType}
                          onChange={setComplianceType}
                          options={COMPLIANCE_TYPE_OPTIONS}
                          placeholder="Select type"
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Regulatory Body</label>
                        <input
                          type="text"
                          value={regulatoryBody}
                          onChange={(e) => setRegulatoryBody(e.target.value)}
                          placeholder="e.g., SEBI, RBI, ISO"
                          className={inputClass}
                        />
                      </div>
                    </div>
                    <div className="flex flex-col gap-4 pt-1">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-sm font-medium text-gray-700">Mandatory Compliance</span>
                        <button type="button" role="switch" aria-checked={mandatoryCompliance} onClick={() => setMandatoryCompliance(!mandatoryCompliance)} className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-0 transition-colors focus:outline-none focus:ring-2 focus:ring-[#2293B4] focus:ring-offset-2 ${mandatoryCompliance ? 'bg-[#2293B4]' : 'bg-gray-200'}`}><span className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow ring-0 transition-transform mt-0.5 ml-0.5 ${mandatoryCompliance ? 'translate-x-6' : 'translate-x-0'}`} /></button>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-sm font-medium text-gray-700">Audit Preparation Required</span>
                        <button type="button" role="switch" aria-checked={auditPreparationRequired} onClick={() => setAuditPreparationRequired(!auditPreparationRequired)} className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-0 transition-colors focus:outline-none focus:ring-2 focus:ring-[#2293B4] focus:ring-offset-2 ${auditPreparationRequired ? 'bg-[#2293B4]' : 'bg-gray-200'}`}><span className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow ring-0 transition-transform mt-0.5 ml-0.5 ${auditPreparationRequired ? 'translate-x-6' : 'translate-x-0'}`} /></button>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-sm font-medium text-gray-700">Certification Required</span>
                        <button type="button" role="switch" aria-checked={certificationRequiredCompliance} onClick={() => setCertificationRequiredCompliance(!certificationRequiredCompliance)} className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-0 transition-colors focus:outline-none focus:ring-2 focus:ring-[#2293B4] focus:ring-offset-2 ${certificationRequiredCompliance ? 'bg-[#2293B4]' : 'bg-gray-200'}`}><span className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow ring-0 transition-transform mt-0.5 ml-0.5 ${certificationRequiredCompliance ? 'translate-x-6' : 'translate-x-0'}`} /></button>
                      </div>
                    </div>
                  </div>
                </div>
                <div><h3 className="text-lg font-bold text-gray-900 mb-1">Secondary Objectives (Optional)</h3><p className="text-sm text-gray-500 mb-4">Select complementary goals to enhance outcomes</p><div className="flex flex-wrap gap-2">{SECONDARY_OBJECTIVES.map((obj) => (<button key={obj} type="button" onClick={() => toggleSecondary(obj)} className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${secondarySelected.has(obj) ? 'bg-[#2293B4] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>{obj}</button>))}</div></div>
                <div><h3 className="text-lg font-bold text-gray-900 mb-4">How will you measure success?</h3><textarea value={successMetrics} onChange={(e) => setSuccessMetrics(e.target.value)} placeholder="e.g., 80% of participants apply learned skills within 2 weeks, measured through manager surveys" rows={4} className={`${inputClass} resize-y min-h-[100px]`} /><p className="text-sm text-gray-500 mt-2">Clear success metrics improve expert matching by 40%</p></div>
              </div>
            )}

            {selectedOutcome === 'community-networking' && (
              <div className="mt-8 space-y-8">
                <div className="rounded-xl border border-gray-200 bg-[#F0F4F8] p-6 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 mb-5">Community & Networking Details</h3>
                  <div className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className={labelClass}>Networking Type</label>
                        <CustomSelect
                          id="networking-type"
                          value={networkingType}
                          onChange={setNetworkingType}
                          options={NETWORKING_TYPE_OPTIONS}
                          placeholder="Select type"
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Connection Goal (Number)</label>
                        <input type="number" min={0} value={connectionGoal} onChange={(e) => setConnectionGoal(e.target.value)} className={inputClass} />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className={labelClass}>Relationship Depth Expected</label>
                        <CustomSelect
                          id="relationship-depth"
                          value={relationshipDepthExpected}
                          onChange={setRelationshipDepthExpected}
                          options={RELATIONSHIP_DEPTH_OPTIONS}
                          placeholder="Select depth"
                        />
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <label className={labelClass}>Follow-up Structure Defined</label>
                        <button type="button" role="switch" aria-checked={followUpStructureDefined} onClick={() => setFollowUpStructureDefined(!followUpStructureDefined)} className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-0 transition-colors focus:outline-none focus:ring-2 focus:ring-[#2293B4] focus:ring-offset-2 ${followUpStructureDefined ? 'bg-[#2293B4]' : 'bg-gray-200'}`}><span className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow ring-0 transition-transform mt-0.5 ml-0.5 ${followUpStructureDefined ? 'translate-x-6' : 'translate-x-0'}`} /></button>
                      </div>
                    </div>
                  </div>
                </div>
                <div><h3 className="text-lg font-bold text-gray-900 mb-1">Secondary Objectives (Optional)</h3><p className="text-sm text-gray-500 mb-4">Select complementary goals to enhance outcomes</p><div className="flex flex-wrap gap-2">{SECONDARY_OBJECTIVES.map((obj) => (<button key={obj} type="button" onClick={() => toggleSecondary(obj)} className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${secondarySelected.has(obj) ? 'bg-[#2293B4] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>{obj}</button>))}</div></div>
                <div><h3 className="text-lg font-bold text-gray-900 mb-4">How will you measure success?</h3><textarea value={successMetrics} onChange={(e) => setSuccessMetrics(e.target.value)} placeholder="e.g., 80% of participants apply learned skills within 2 weeks, measured through manager surveys" rows={4} className={`${inputClass} resize-y min-h-[100px]`} /><p className="text-sm text-gray-500 mt-2">Clear success metrics improve expert matching by 40%</p></div>
              </div>
            )}

            {selectedOutcome === 'product-adoption' && (
              <div className="mt-8 space-y-8">
                <div className="rounded-xl border border-gray-200 bg-[#F0F4F8] p-6 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 mb-5">Product Adoption Details</h3>
                  <div className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className={labelClass}>Product Type</label>
                        <input
                          type="text"
                          value={productType}
                          onChange={(e) => setProductType(e.target.value)}
                          placeholder="e.g., SaaS, Mobile App"
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Adoption Stage</label>
                        <CustomSelect
                          id="adoption-stage"
                          value={adoptionStage}
                          onChange={setAdoptionStage}
                          options={ADOPTION_STAGE_OPTIONS}
                          placeholder="Select stage"
                        />
                      </div>
                    </div>
                    <div>
                      <label className={labelClass}>Feature Focus (comma-separated)</label>
                      <input
                        type="text"
                        value={featureFocus}
                        onChange={(e) => setFeatureFocus(e.target.value)}
                        placeholder="e.g., Dashboard, Reporting, API"
                        className={inputClass}
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className={labelClass}>User Segment</label>
                        <input
                          type="text"
                          value={userSegment}
                          onChange={(e) => setUserSegment(e.target.value)}
                          placeholder="e.g., Power users, New users"
                          className={inputClass}
                        />
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-sm font-medium text-gray-700">Onboarding Required</span>
                        <button
                          type="button"
                          role="switch"
                          aria-checked={onboardingRequired}
                          onClick={() => setOnboardingRequired(!onboardingRequired)}
                          className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-0 transition-colors focus:outline-none focus:ring-2 focus:ring-[#2293B4] focus:ring-offset-2 ${onboardingRequired ? 'bg-[#2293B4]' : 'bg-gray-200'}`}
                        >
                          <span className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow ring-0 transition-transform mt-0.5 ml-0.5 ${onboardingRequired ? 'translate-x-6' : 'translate-x-0'}`} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                <div><h3 className="text-lg font-bold text-gray-900 mb-1">Secondary Objectives (Optional)</h3><p className="text-sm text-gray-500 mb-4">Select complementary goals to enhance outcomes</p><div className="flex flex-wrap gap-2">{SECONDARY_OBJECTIVES.map((obj) => (<button key={obj} type="button" onClick={() => toggleSecondary(obj)} className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${secondarySelected.has(obj) ? 'bg-[#2293B4] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>{obj}</button>))}</div></div>
                <div><h3 className="text-lg font-bold text-gray-900 mb-4">How will you measure success?</h3><textarea value={successMetrics} onChange={(e) => setSuccessMetrics(e.target.value)} placeholder="e.g., 80% of participants apply learned skills within 2 weeks, measured through manager surveys" rows={4} className={`${inputClass} resize-y min-h-[100px]`} /><p className="text-sm text-gray-500 mt-2">Clear success metrics improve expert matching by 40%</p></div>
              </div>
            )}

            {selectedOutcome === 'behavior-change' && (
              <div className="mt-8 space-y-8">
                <div className="rounded-xl border border-gray-200 bg-[#F0F4F8] p-6 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 mb-5">Behavior Change Details</h3>
                  <div className="space-y-5">
                    <div>
                      <label className={labelClass}>Behavior Type</label>
                      <CustomSelect
                        id="behaviour-type"
                        value={behaviourType}
                        onChange={setBehaviourType}
                        options={BEHAVIOUR_TYPE_OPTIONS}
                        placeholder="Select type"
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Current Behavior Description</label>
                      <textarea
                        value={currentBehaviorDescription}
                        onChange={(e) => setCurrentBehaviorDescription(e.target.value)}
                        placeholder="Describe the current state..."
                        rows={4}
                        className={`${inputClass} resize-y min-h-[100px]`}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Target Behavior Description</label>
                      <textarea
                        value={targetBehavior}
                        onChange={(e) => setTargetBehavior(e.target.value)}
                        placeholder="Describe the desired state..."
                        rows={4}
                        className={`${inputClass} resize-y min-h-[100px]`}
                      />
                    </div>
                    <div className="flex flex-wrap items-center gap-8 pt-1">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-sm font-medium text-gray-700">Reinforcement Required</span>
                        <button
                          type="button"
                          role="switch"
                          aria-checked={reinforcementRequired}
                          onClick={() => setReinforcementRequired(!reinforcementRequired)}
                          className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-0 transition-colors focus:outline-none focus:ring-2 focus:ring-[#2293B4] focus:ring-offset-2 ${reinforcementRequired ? 'bg-[#2293B4]' : 'bg-gray-200'}`}
                        >
                          <span className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow ring-0 transition-transform mt-0.5 ml-0.5 ${reinforcementRequired ? 'translate-x-6' : 'translate-x-0'}`} />
                        </button>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-sm font-medium text-gray-700">Measurement Method Defined</span>
                        <button
                          type="button"
                          role="switch"
                          aria-checked={measurementRequired}
                          onClick={() => setMeasurementRequired(!measurementRequired)}
                          className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-0 transition-colors focus:outline-none focus:ring-2 focus:ring-[#2293B4] focus:ring-offset-2 ${measurementRequired ? 'bg-[#2293B4]' : 'bg-gray-200'}`}
                        >
                          <span className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow ring-0 transition-transform mt-0.5 ml-0.5 ${measurementRequired ? 'translate-x-6' : 'translate-x-0'}`} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                <div><h3 className="text-lg font-bold text-gray-900 mb-1">Secondary Objectives (Optional)</h3><p className="text-sm text-gray-500 mb-4">Select complementary goals to enhance outcomes</p><div className="flex flex-wrap gap-2">{SECONDARY_OBJECTIVES.map((obj) => (<button key={obj} type="button" onClick={() => toggleSecondary(obj)} className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${secondarySelected.has(obj) ? 'bg-[#2293B4] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>{obj}</button>))}</div></div>
                <div><h3 className="text-lg font-bold text-gray-900 mb-4">How will you measure success?</h3><textarea value={successMetrics} onChange={(e) => setSuccessMetrics(e.target.value)} placeholder="e.g., 80% of participants apply learned skills within 2 weeks, measured through manager surveys" rows={4} className={`${inputClass} resize-y min-h-[100px]`} /><p className="text-sm text-gray-500 mt-2">Clear success metrics improve expert matching by 40%</p></div>
              </div>
            )}
            </>
            )}

            {!draftLoading && !draftLoadError && step === 2 && (
              <div className="space-y-8">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Who is your audience?</h2>
                <div className="grid grid-cols-3 gap-4">
                  {AUDIENCE_OPTIONS.map((opt) => (
                    <button key={opt} type="button" onClick={() => { setAudienceSelected((prev) => { const n = new Set(prev); if (n.has(opt)) n.delete(opt); else n.add(opt); return n; }); }} className={`rounded-lg border px-4 py-2.5 text-sm font-medium text-left min-h-[44px] ${audienceSelected.has(opt) ? 'border-[#2293B4] bg-[#E0F7FA] text-gray-900' : 'border-gray-200 bg-white text-gray-800 hover:bg-gray-50'}`}>{opt}</button>
                  ))}
                </div>

                {SHOW_ADVANCED_REQUIREMENT_DETAILS && audienceSelected.size > 0 && (
                  <div className="rounded-xl border border-gray-200 bg-[#F4F8FA] p-6 shadow-sm">
                    <div className="flex items-center gap-2 mb-5">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-300 text-gray-700 text-xs font-bold">i</span>
                      <h3 className="text-lg font-bold text-gray-900">Audience Characteristics</h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-5">
                      {[
                        { label: 'Decision Power (1-5)', value: decisionPower, set: setDecisionPower },
                        { label: 'Domain Expertise (1-5)', value: domainExpertise, set: setDomainExpertise },
                        { label: 'Execution Responsibility (1-5)', value: executionResponsibility, set: setExecutionResponsibility },
                        { label: 'Influence Level (1-5)', value: influenceLevel, set: setInfluenceLevel },
                      ].map(({ label, value, set }) => (
                        <div key={label}>
                          <label className={labelClass}>{label}</label>
                          <input type="range" min={1} max={5} value={value} onChange={(e) => set(Number(e.target.value))} className="level-slider w-full h-2 rounded-full [appearance:none] [-webkit-appearance:none] bg-transparent" style={{ background: levelSliderBg(value) }} />
                          <p className="text-sm mt-1" style={{ color: TEAL }}>Level {value}</p>
                        </div>
                      ))}
                    </div>
                    <div>
                      <label className={labelClass}>Learning vs Action Bias</label>
                      <CustomSelect
                        id="learning-vs-action-bias"
                        value={learningVsActionBias}
                        onChange={setLearningVsActionBias}
                        options={LEARNING_VS_ACTION_BIAS_OPTIONS}
                        placeholder="Select orientation"
                      />
                    </div>
                  </div>
                )}

                <h2 className="text-lg font-bold text-gray-900 mb-4">Seniority Level</h2>
                <div className="grid grid-cols-5 gap-4">
                  {SENIORITY_OPTIONS.map((opt) => (
                    <button key={opt} type="button" onClick={() => { setSenioritySelected((prev) => { const n = new Set(prev); if (n.has(opt)) n.delete(opt); else n.add(opt); return n; }); }} className={`rounded-lg border px-4 py-2.5 text-sm font-medium text-left min-h-[44px] ${senioritySelected.has(opt) ? 'border-[#2293B4] bg-[#E0F7FA] text-gray-900' : 'border-gray-200 bg-white text-gray-800 hover:bg-gray-50'}`}>{opt}</button>
                  ))}
                </div>

                {SHOW_ADVANCED_REQUIREMENT_DETAILS && senioritySelected.size > 0 && (
                  <div className="rounded-xl border border-gray-200 bg-[#F4F8FA] p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-5">Seniority Profile</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-5">
                        <div>
                          <label className={labelClass}>Average Experience (Years)</label>
                          <input
                            type="text"
                            value={averageExperience}
                            onChange={(e) => setAverageExperience(e.target.value)}
                            placeholder="e.g., 5-8"
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label className={labelClass}>Abstraction Level Capacity (1-5)</label>
                          <input type="range" min={1} max={5} value={abstractionLevelCapacity} onChange={(e) => setAbstractionLevelCapacity(Number(e.target.value))} className="level-slider w-full h-2 rounded-full [appearance:none] [-webkit-appearance:none] bg-transparent" style={{ background: levelSliderBg(abstractionLevelCapacity) }} />
                          <p className="text-sm mt-1" style={{ color: TEAL }}>Level {abstractionLevelCapacity}</p>
                        </div>
                      </div>
                      <div className="space-y-5">
                        <div>
                          <label className={labelClass}>Decision Authority (1-5)</label>
                          <input type="range" min={1} max={5} value={decisionAuthority} onChange={(e) => setDecisionAuthority(Number(e.target.value))} className="level-slider w-full h-2 rounded-full [appearance:none] [-webkit-appearance:none] bg-transparent" style={{ background: levelSliderBg(decisionAuthority) }} />
                          <p className="text-sm mt-1" style={{ color: TEAL }}>Level {decisionAuthority}</p>
                        </div>
                        <div>
                          <label className={labelClass}>Tolerance for Basics (1-5, inverse)</label>
                          <input type="range" min={1} max={5} value={toleranceForBasics} onChange={(e) => setToleranceForBasics(Number(e.target.value))} className="level-slider w-full h-2 rounded-full [appearance:none] [-webkit-appearance:none] bg-transparent" style={{ background: levelSliderBg(toleranceForBasics) }} />
                          <p className="text-sm mt-1" style={{ color: TEAL }}>Level {toleranceForBasics}</p>
                          <p className="text-xs text-gray-500 mt-0.5">(Higher = Less tolerance)</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <label className={labelClass}>Audience Size</label>
                  <div className="flex rounded-lg border border-gray-200 bg-white overflow-hidden focus-within:ring-2 focus-within:ring-[#2293B4] focus-within:border-transparent">
                    <input
                      type="number"
                      min={0}
                      value={audienceSize}
                      onChange={(e) => { const v = e.target.value; if (v === '') setAudienceSize(''); else { const n = parseInt(v, 10); if (!Number.isNaN(n) && n >= 0) setAudienceSize(String(n)); } }}
                      placeholder="Enter number of people"
                      className="w-full min-w-0 px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:outline-none bg-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <div className="flex flex-col border-l border-gray-200 shrink-0">
                      <button type="button" aria-label="Increase" onClick={() => setAudienceSize(String(Math.max(0, (parseInt(audienceSize, 10) || 0) + 1)))} className="flex items-center justify-center w-9 h-1/2 min-h-[22px] text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-inset focus:ring-1 focus:ring-[#2293B4]">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 16l6-6H6l6 6z" /></svg>
                      </button>
                      <button type="button" aria-label="Decrease" onClick={() => setAudienceSize(String(Math.max(0, (parseInt(audienceSize, 10) || 0) - 1)))} className="flex items-center justify-center w-9 min-h-[22px] text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-inset focus:ring-1 focus:ring-[#2293B4]">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 8l-6 6h12L12 8z" /></svg>
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <h2 className="text-lg font-bold text-gray-900 mb-2">Prior Knowledge Level</h2>
                  <p className="text-sm text-gray-500 mb-3">What&apos;s their current understanding of the topic?</p>
                  <div className="space-y-2">
                    {PRIOR_KNOWLEDGE_OPTIONS.map(({ id, label }) => (
                      <button key={id} type="button" onClick={() => setPriorKnowledge(id)} className={`w-full rounded-lg border px-4 py-3 text-sm font-medium flex items-center justify-between text-left ${priorKnowledge === id ? 'border-[#2293B4] bg-[#E0F7FA] text-gray-900' : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'}`}>
                        <span>{label}</span>
                        {priorKnowledge === id && <span className="rounded px-2 py-0.5 text-xs font-semibold text-white shrink-0" style={{ backgroundColor: TEAL }}>Selected</span>}
                      </button>
                    ))}
                  </div>
                </div>

                {SHOW_ADVANCED_REQUIREMENT_DETAILS && (
                <div className="rounded-xl border border-gray-200 bg-[#F0F4F8] p-6 shadow-sm">
                  <h2 className="text-lg font-bold text-gray-900 mb-5">Knowledge Profile</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {[
                      { label: 'Learning Curve Required (1-5)', value: learningCurve, set: setLearningCurve },
                      { label: 'Jargon Tolerance (1-5)', value: jargonTolerance, set: setJargonTolerance },
                      { label: 'Depth Capacity (1-5)', value: depthCapacity, set: setDepthCapacity },
                      { label: 'Pace of Delivery (1-5)', value: paceOfDelivery, set: setPaceOfDelivery },
                    ].map(({ label, value, set }) => (
                      <div key={label}>
                        <label className={labelClass}>{label}</label>
                        <input type="range" min={1} max={5} value={value} onChange={(e) => set(Number(e.target.value))} className="level-slider w-full h-2 rounded-full [appearance:none] [-webkit-appearance:none] bg-transparent" style={{ background: levelSliderBg(value) }} />
                        <p className="text-sm mt-1" style={{ color: TEAL }}>Level {value}</p>
                        {label.startsWith('Pace') && <p className="text-xs text-gray-500 mt-0.5">1=Slow, 5=Fast</p>}
                      </div>
                    ))}
                  </div>
                </div>
                )}

                <div>
                  <h2 className="text-lg font-bold text-gray-900 mb-4">Functional Background</h2>
                  <div className="flex flex-wrap gap-2">
                    {FUNCTIONAL_BACKGROUND_OPTIONS.map((opt) => (
                      <button key={opt} type="button" onClick={() => { setFunctionalSelected((prev) => { const n = new Set(prev); if (n.has(opt)) n.delete(opt); else n.add(opt); return n; }); }} className={`rounded-lg border px-4 py-2.5 text-sm font-medium ${functionalSelected.has(opt) ? 'border-[#2293B4] bg-[#E0F7FA] text-gray-900' : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'}`}>{opt}</button>
                    ))}
                  </div>
                </div>

                {SHOW_ADVANCED_REQUIREMENT_DETAILS && functionalSelected.size > 0 && (
                  <div className="rounded-xl border border-sky-200 bg-[#F4F8FA] p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-5">Functional Profile</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {[
                        { label: 'Technical Orientation (1-5)', value: technicalOrientation, set: setTechnicalOrientation },
                        { label: 'Business Orientation (1-5)', value: businessOrientation, set: setBusinessOrientation },
                        { label: 'Tool Usage Maturity (1-5)', value: toolUsageMaturity, set: setToolUsageMaturity },
                        { label: 'Process Orientation (1-5)', value: processOrientation, set: setProcessOrientation },
                      ].map(({ label, value, set }) => (
                        <div key={label}>
                          <label className={labelClass}>{label}</label>
                          <input type="range" min={1} max={5} value={value} onChange={(e) => set(Number(e.target.value))} className="level-slider w-full h-2 rounded-full [appearance:none] [-webkit-appearance:none] bg-transparent" style={{ background: levelSliderBg(value) }} />
                          <p className="text-sm mt-1" style={{ color: TEAL }}>Level {value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <h2 className="text-lg font-bold text-gray-900 mb-4">Industry Context</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {INDUSTRY_CONTEXT_OPTIONS.map((opt) => (
                      <button key={opt} type="button" onClick={() => { setIndustrySelected((prev) => { const n = new Set(prev); if (n.has(opt)) n.delete(opt); else n.add(opt); return n; }); }} className={`rounded-lg border px-4 py-2.5 text-sm font-medium text-left ${industrySelected.has(opt) ? 'border-[#2293B4] bg-[#E0F7FA] text-gray-900' : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'}`}>{opt}</button>
                    ))}
                  </div>
                </div>

                {SHOW_ADVANCED_REQUIREMENT_DETAILS && industrySelected.size > 0 && (
                  <div className="rounded-xl border border-sky-200 bg-[#F4F8FA] p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-5">Industry Profile</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {[
                        { label: 'Regulation Level (1-5)', value: regulationLevel, set: setRegulationLevel },
                        { label: 'Technical Complexity (1-5)', value: technicalComplexity, set: setTechnicalComplexity },
                        { label: 'Pace of Change (1-5)', value: paceOfChange, set: setPaceOfChange },
                        { label: 'Domain Specificity Required (1-5)', value: domainSpecificityRequired, set: setDomainSpecificityRequired },
                      ].map(({ label, value, set }) => (
                        <div key={label}>
                          <label className={labelClass}>{label}</label>
                          <input type="range" min={1} max={5} value={value} onChange={(e) => set(Number(e.target.value))} className="level-slider w-full h-2 rounded-full [appearance:none] [-webkit-appearance:none] bg-transparent" style={{ background: levelSliderBg(value) }} />
                          <p className="text-sm mt-1" style={{ color: TEAL }}>Level {value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <h2 className="text-lg font-bold text-gray-900 mb-2">Expected Resistance Level</h2>
                  <p className="text-sm text-gray-500 mb-3">How receptive will the audience be to this engagement?</p>
                  <div className="grid grid-cols-3 gap-4">
                    {RESISTANCE_OPTIONS.map(({ id, label, sub }) => {
                      const isSelected = resistanceLevel === id
                      const selectedStyles = id === 'low' ? 'border-green-500 bg-green-50' : id === 'medium' ? 'border-amber-400 bg-amber-50' : 'border-red-400 bg-red-50'
                      const labelSelectedStyles = id === 'low' ? 'text-green-700' : id === 'medium' ? 'text-amber-700' : 'text-red-700'
                      const subSelectedStyles = id === 'low' ? 'text-green-600' : id === 'medium' ? 'text-amber-600' : 'text-red-600'
                      return (
                        <button key={id} type="button" onClick={() => setResistanceLevel(id)} className={`rounded-lg border px-4 py-3 text-sm text-left ${isSelected ? selectedStyles : 'border-gray-200 bg-white hover:bg-gray-50'}`}>
                          <span className={`font-medium block ${isSelected ? labelSelectedStyles : 'text-gray-900'}`}>{label}</span>
                          <span className={`text-xs ${isSelected ? subSelectedStyles : 'text-gray-500'}`}>{sub}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div className="rounded-xl border border-sky-200 bg-[#F4F8FA] p-6 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 mb-5">Resistance Profile</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {[
                      { label: 'Engagement Effort Required (1-5)', value: engagementEffortRequired, set: setEngagementEffortRequired },
                      { label: 'Interactivity Required (1-5)', value: interactivityRequired, set: setInteractivityRequired },
                      { label: 'Persuasion Needed (1-5)', value: persuasionNeeded, set: setPersuasionNeeded },
                      { label: 'Trust Building Required (1-5)', value: trustBuildingRequired, set: setTrustBuildingRequired },
                    ].map(({ label, value, set }) => (
                      <div key={label}>
                        <label className={labelClass}>{label}</label>
                        <input type="range" min={1} max={5} value={value} onChange={(e) => set(Number(e.target.value))} className="level-slider w-full h-2 rounded-full [appearance:none] [-webkit-appearance:none] bg-transparent" style={{ background: levelSliderBg(value) }} />
                        <p className="text-sm mt-1" style={{ color: TEAL }}>Level {value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h2 className="text-lg font-bold text-gray-900 mb-3">Diversity of Audience</h2>
                  <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Diverse Audience</p>
                      <p className="text-sm text-gray-500 mt-0.5">Is this audience mixed across different dimensions?</p>
                    </div>
                    <button type="button" role="switch" aria-checked={diversityOfAudience} onClick={() => setDiversityOfAudience(!diversityOfAudience)} className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-0 transition-colors focus:outline-none focus:ring-2 focus:ring-[#2293B4] focus:ring-offset-2 ${diversityOfAudience ? 'bg-[#2293B4]' : 'bg-gray-200'}`}>
                      <span className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow ring-0 transition-transform mt-0.5 ml-0.5 ${diversityOfAudience ? 'translate-x-6' : 'translate-x-0'}`} />
                    </button>
                  </div>
                </div>

                {audienceSelected.size > 0 && (
                  <div className="rounded-xl border border-[#BEDCFF] bg-[#E8F0FE] p-4 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2172EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                      </svg>
                      <h3 className="text-base font-bold" style={{ color: '#2172EB' }}>Audience Insights</h3>
                    </div>
                    <p className="text-sm text-gray-800 pl-7">
                      <span className="text-gray-800">• Knowledge level: </span>
                      <span className="font-semibold" style={{ color: '#2172EB' }}>
                        {PRIOR_KNOWLEDGE_OPTIONS.find((o) => o.id === priorKnowledge)?.label ?? priorKnowledge}
                      </span>
                    </p>
                    <p className="text-sm text-gray-800 pl-7 mt-1">
                      <span className="text-gray-800">• Resistance level: </span>
                      <span className="font-semibold" style={{ color: '#2172EB' }}>
                        {(() => {
                          const r = RESISTANCE_OPTIONS.find((o) => o.id === resistanceLevel)
                          return r ? `${r.label} — ${r.sub}` : resistanceLevel
                        })()}
                      </span>
                    </p>
                  </div>
                )}
              </div>
            )}

            {!draftLoading && !draftLoadError && step === 3 && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-lg font-bold text-gray-900 mb-2">Engagement Depth</h2>
                  <p className="text-sm text-gray-500 mb-4">How deep should the expert go into the topic?</p>
                  <div className="space-y-3">
                    {ENGAGEMENT_DEPTH_OPTIONS.map(({ id, title, description }) => {
                      const isSelected = engagementDepth === id
                      return (
                        <button key={id} type="button" onClick={() => setEngagementDepth(id)} className={`w-full rounded-lg border px-4 py-3 text-left relative ${isSelected ? 'border-[#2293B4] bg-[#E0F7FA]' : 'border-gray-200 bg-white hover:bg-gray-50'}`}>
                          <span className={`absolute top-3 right-3 rounded px-2 py-0.5 text-xs font-medium ${isSelected ? 'text-white' : 'bg-gray-100 text-gray-600'}`} style={isSelected ? { backgroundColor: TEAL } : undefined}>Level {id}</span>
                          <p className="font-semibold text-gray-900 pr-20">{title}</p>
                          <p className="text-sm text-gray-500 mt-0.5">{description}</p>
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className={labelClass}>Interactivity Level</label>
                    <input type="range" min={0} max={100} value={interactivityLevel} onChange={(e) => setInteractivityLevel(Number(e.target.value))} className="level-slider w-full h-2 rounded-full [appearance:none] [-webkit-appearance:none] bg-transparent" style={{ background: percentSliderBg(interactivityLevel) }} />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Lecture</span>
                      <span>Workshop</span>
                    </div>
                    <p className="text-sm mt-1" style={{ color: TEAL }}>{interactivityLevel}%</p>
                  </div>
                  <div>
                    <label className={labelClass}>Customization Need</label>
                    <input type="range" min={0} max={100} value={customizationNeed} onChange={(e) => setCustomizationNeed(Number(e.target.value))} className="level-slider w-full h-2 rounded-full [appearance:none] [-webkit-appearance:none] bg-transparent" style={{ background: percentSliderBg(customizationNeed) }} />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Generic</span>
                      <span>Tailored</span>
                    </div>
                    <p className="text-sm mt-1" style={{ color: TEAL }}>{customizationNeed}%</p>
                  </div>
                </div>

                <div>
                  <h2 className="text-lg font-bold text-gray-900 mb-2">Expected Deliverables</h2>
                  <p className="text-sm text-gray-500 mb-4">What tangible outputs do you expect? (Select all that apply)</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {EXPECTED_DELIVERABLES.map(({ id, label, icon }) => {
                      const isSelected = deliverablesSelected.has(id)
                      return (
                        <button key={id} type="button" onClick={() => { setDeliverablesSelected((prev) => { const n = new Set(prev); if (n.has(id)) { n.delete(id); if (deliverableDetailsActiveId === id) setDeliverableDetailsActiveId(n.size === 0 ? null : Array.from(n)[0]); } else { n.add(id); setDeliverableDetailsActiveId(id); } return n; }); }} className={`rounded-lg border px-4 py-3 text-sm font-medium flex items-center gap-3 text-left ${isSelected ? 'border-[#2293B4] bg-[#E0F7FA] text-gray-900' : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'}`}>
                          {icon === 'document' && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 text-gray-500"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>}
                          {icon === 'bar-chart' && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 text-gray-500"><line x1="12" y1="20" x2="12" y2="10" /><line x1="18" y1="20" x2="18" y2="4" /><line x1="6" y1="20" x2="6" y2="16" /></svg>}
                          {icon === 'video' && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 text-gray-500"><polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" /></svg>}
                          {icon === 'check-circle' && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`shrink-0 ${isSelected ? 'text-[#2293B4]' : 'text-gray-500'}`}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>}
                          {icon === 'wrench' && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 text-gray-500"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" /></svg>}
                          <span>{label}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {SHOW_ADVANCED_REQUIREMENT_DETAILS && deliverablesSelected.size > 0 && (() => {
                  const activeId = (deliverableDetailsActiveId && deliverablesSelected.has(deliverableDetailsActiveId) ? deliverableDetailsActiveId : Array.from(deliverablesSelected)[0]) ?? null
                  const details = activeId ? (deliverableDetailsById[activeId] ?? { format: '', deliveryTimeline: '', ownership: '', measurableOutput: false }) : null
                  const selectedLabels = Array.from(deliverablesSelected).map(id => EXPECTED_DELIVERABLES.find(d => d.id === id)!.label)
                  const activeLabel = activeId ? EXPECTED_DELIVERABLES.find(d => d.id === activeId)!.label : ''
                  return (
                    <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] pt-6 pb-6 px-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.08)]">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[#E2E8F0] bg-white text-[#4A5568] text-xs font-medium">i</span>
                        <h3 className="text-base font-semibold text-[#1A202C]">Deliverable Details</h3>
                      </div>
                      <p className="text-sm text-[#4A5568] mb-5 pl-8">Configure deliverable details</p>
                      <div className="mb-5">
                        <CustomSelect id="deliverable-config-select" value={activeLabel} onChange={(label) => setDeliverableDetailsActiveId(EXPECTED_DELIVERABLES.find(d => d.label === label)!.id)} options={selectedLabels} placeholder="Select deliverable to configure" className="!bg-[#EDF2F7] !border-[#E2E8F0]" />
                      </div>
                      <hr className="border-0 border-b border-[#E2E8F0] my-0 mb-5" />
                      {activeId && details && (
                        <>
                          <h4 className="text-base font-medium text-[#1A202C] mb-4">{activeLabel}</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                            <div>
                              <label className="block text-sm font-medium text-[#1A202C] mb-1.5">Format</label>
                              <CustomSelect id="deliverable-format" value={details.format} onChange={(v) => setDeliverableDetailsById(prev => ({ ...prev, [activeId]: { ...(prev[activeId] ?? { format: '', deliveryTimeline: '', ownership: '', measurableOutput: false }), format: v } }))} options={DELIVERABLE_FORMAT_OPTIONS} placeholder="Select format" className="!bg-white !border-[#CBD5E0]" />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-[#1A202C] mb-1.5">Delivery Timeline</label>
                              <CustomSelect id="deliverable-timeline" value={details.deliveryTimeline} onChange={(v) => setDeliverableDetailsById(prev => ({ ...prev, [activeId]: { ...(prev[activeId] ?? { format: '', deliveryTimeline: '', ownership: '', measurableOutput: false }), deliveryTimeline: v } }))} options={DELIVERY_TIMELINE_OPTIONS} placeholder="When needed?" className="!bg-white !border-[#CBD5E0]" />
                            </div>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                            <div>
                              <label className="block text-sm font-medium text-[#1A202C] mb-1.5">Ownership</label>
                              <CustomSelect id="deliverable-ownership" value={details.ownership} onChange={(v) => setDeliverableDetailsById(prev => ({ ...prev, [activeId]: { ...(prev[activeId] ?? { format: '', deliveryTimeline: '', ownership: '', measurableOutput: false }), ownership: v } }))} options={DELIVERABLE_OWNERSHIP_OPTIONS} placeholder="Who owns it?" className="!bg-white !border-[#CBD5E0]" />
                            </div>
                            <div className="flex items-center justify-between gap-3">
                              <label className="block text-sm font-medium text-[#1A202C] mb-1.5">Measurable Output</label>
                              <button type="button" role="switch" aria-checked={details.measurableOutput} onClick={() => setDeliverableDetailsById(prev => ({ ...prev, [activeId]: { ...(prev[activeId] ?? { format: '', deliveryTimeline: '', ownership: '', measurableOutput: false }), measurableOutput: !details.measurableOutput } }))} className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-0 transition-colors focus:outline-none focus:ring-2 focus:ring-[#2293B4] focus:ring-offset-2 ${details.measurableOutput ? 'bg-[#2293B4]' : 'bg-gray-200'}`}>
                                <span className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow ring-0 transition-transform mt-0.5 ml-0.5 ${details.measurableOutput ? 'translate-x-6' : 'translate-x-0'}`} />
                              </button>
                            </div>
                          </div>
                        </>
                      )}
                      <p className="text-sm text-[#718096] mt-4">Selected: {deliverablesSelected.size} deliverable(s)</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {Array.from(deliverablesSelected).map(id => (
                          <span key={id} className="rounded-lg border border-[#BFDFFF] bg-[#E2F3FF] px-3 py-1.5 text-sm font-medium text-[#2B6CB0]">
                            {EXPECTED_DELIVERABLES.find(d => d.id === id)!.label}
                          </span>
                        ))}
                      </div>
                    </div>
                  )
                })()}

                <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Follow-up Support Required</p>
                    <p className="text-sm text-gray-500 mt-0.5">Ongoing support after the main engagement</p>
                  </div>
                  <button type="button" role="switch" aria-checked={followUpSupportRequired} onClick={() => setFollowUpSupportRequired(!followUpSupportRequired)} className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-0 transition-colors focus:outline-none focus:ring-2 focus:ring-[#2293B4] focus:ring-offset-2 ${followUpSupportRequired ? 'bg-[#2293B4]' : 'bg-gray-200'}`}>
                    <span className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow ring-0 transition-transform mt-0.5 ml-0.5 ${followUpSupportRequired ? 'translate-x-6' : 'translate-x-0'}`} />
                  </button>
                </div>

                {deliverablesSelected.size > 0 && (
                  <div className="rounded-xl border border-[#B0E6C5] bg-[#F7FCF8] p-5 shadow-sm">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-[#35A162] text-[#35A162]">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                      </span>
                      <h3 className="text-base font-bold text-[#35A162]">Engagement Clarity</h3>
                    </div>
                    <ul className="space-y-1.5 text-sm text-[#35A162] pl-1 list-none">
                      <li className="flex items-start gap-2">
                        <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[#35A162] shrink-0" />
                        <span>{deliverablesSelected.size} deliverable(s) defined - improves proposal quality</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[#35A162] shrink-0" />
                        <span>Depth level: <strong>Level {engagementDepth}</strong> - matches experts with appropriate expertise</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[#35A162] shrink-0" />
                        <span>One-time engagement - focuses on immediate impact experts</span>
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            )}

            {!draftLoading && !draftLoadError && step === 4 && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-lg font-bold text-gray-900 mb-2">Engagement Type</h2>
                  <p className="text-sm text-gray-500 mb-4">What structure and format works best for your objective?</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {ENGAGEMENT_TYPE_OPTIONS.map(({ id, title, tag1, tag2 }) => {
                      const isSelected = engagementTypeSelected === id
                      return (
                        <button key={id} type="button" onClick={() => setEngagementTypeSelected(engagementTypeSelected === id ? null : id)} className={`rounded-xl border p-4 text-left transition-colors ${isSelected ? 'border-[#2293B4] bg-[#E0F7FA] ring-1 ring-[#2293B4]' : 'border-gray-200 bg-gray-50 hover:bg-gray-100 hover:border-gray-300'}`}>
                          <p className="font-semibold text-gray-900">{title}</p>
                          <div className="flex flex-wrap gap-2 mt-2">
                            <span className="rounded-full bg-gray-200 px-2.5 py-0.5 text-xs font-medium text-gray-700">{tag1}</span>
                            <span className="rounded-full bg-gray-200 px-2.5 py-0.5 text-xs font-medium text-gray-700">{tag2}</span>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {SHOW_ADVANCED_REQUIREMENT_DETAILS && engagementTypeSelected && (
                  <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center gap-2 mb-5">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sky-100 text-[#2293B4] text-xs font-bold">i</span>
                      <h3 className="text-lg font-bold text-gray-900">Engagement Characteristics</h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-5">
                        <div>
                          <label className={labelClass}>Interaction Intensity (1-5)</label>
                          <input type="range" min={1} max={5} value={interactionIntensity} onChange={(e) => setInteractionIntensity(Number(e.target.value))} className="level-slider w-full h-2 rounded-full [appearance:none] [-webkit-appearance:none] bg-transparent" style={{ background: levelSliderBg(interactionIntensity) }} />
                          <p className="text-sm mt-1" style={{ color: TEAL }}>Level {interactionIntensity}</p>
                        </div>
                        <div>
                          <label className={labelClass}>Facilitation Complexity (1-5)</label>
                          <input type="range" min={1} max={5} value={facilitationComplexity} onChange={(e) => setFacilitationComplexity(Number(e.target.value))} className="level-slider w-full h-2 rounded-full [appearance:none] [-webkit-appearance:none] bg-transparent" style={{ background: levelSliderBg(facilitationComplexity) }} />
                          <p className="text-sm mt-1" style={{ color: TEAL }}>Level {facilitationComplexity}</p>
                        </div>
                        <div>
                          <label className={labelClass}>Expert Type Required</label>
                          <input type="text" value={expertTypeRequired} onChange={(e) => setExpertTypeRequired(e.target.value)} placeholder="e.g., Facilitator, Coach, Consultant" className={inputClass} />
                        </div>
                      </div>
                      <div className="space-y-5">
                        <div>
                          <label className={labelClass}>Outcome Orientation</label>
                          <CustomSelect id="outcome-orientation" value={outcomeOrientation} onChange={setOutcomeOrientation} options={OUTCOME_ORIENTATION_OPTIONS} placeholder="Select level" />
                        </div>
                        <div>
                          <label className={labelClass}>Continuity Required</label>
                          <div className="pt-1">
                            <button type="button" role="switch" aria-checked={continuityRequired} onClick={() => setContinuityRequired(!continuityRequired)} className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-0 transition-colors focus:outline-none focus:ring-2 focus:ring-[#2293B4] focus:ring-offset-2 ${continuityRequired ? 'bg-[#2293B4]' : 'bg-gray-200'}`}>
                              <span className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow ring-0 transition-transform mt-0.5 ml-0.5 ${continuityRequired ? 'translate-x-6' : 'translate-x-0'}`} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <h2 className="text-lg font-bold text-gray-900 mb-4">Delivery Mode</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {DELIVERY_MODE_OPTIONS.map(({ id, title, tag }) => {
                      const isSelected = deliveryModeSelected === id
                      return (
                        <button key={id} type="button" onClick={() => setDeliveryModeSelected(id)} className={`rounded-xl border p-4 text-left transition-colors ${isSelected ? 'border-[#2293B4] bg-[#E0F7FA] ring-1 ring-[#2293B4]' : 'border-gray-200 bg-gray-50 hover:bg-gray-100 hover:border-gray-300'}`}>
                          <p className="font-semibold text-gray-900">{title}</p>
                          <span className="inline-block rounded-full bg-gray-200 px-2.5 py-0.5 text-xs font-medium text-gray-700 mt-2">{tag}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {SHOW_ADVANCED_REQUIREMENT_DETAILS && (deliveryModeSelected === 'in-person') && (
                  <div className="rounded-xl border border-sky-200 bg-[#F4F8FA] p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-5">Delivery Details</h3>
                    <div className="space-y-4 mb-5">
                      <div>
                        <label className={labelClass}>Room/Seating Style</label>
                        <input type="text" value={roomSeatingStyle} onChange={(e) => setRoomSeatingStyle(e.target.value)} placeholder="e.g., U-shape, Theater, Classroom" className={inputClass} />
                      </div>
                      <div>
                        <label className={labelClass}>AV Setup Required</label>
                        <input type="text" value={avSetupRequired} onChange={(e) => setAvSetupRequired(e.target.value)} placeholder="e.g., Projector, Mic, Flipcharts" className={inputClass} />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <label className={labelClass}>Technology Dependency (1-5)</label>
                        <input type="range" min={1} max={5} value={deliveryTechnologyDependency} onChange={(e) => setDeliveryTechnologyDependency(Number(e.target.value))} className="level-slider w-full h-2 rounded-full [appearance:none] [-webkit-appearance:none] bg-transparent" style={{ background: levelSliderBg(deliveryTechnologyDependency) }} />
                        <p className="text-sm mt-1" style={{ color: TEAL }}>Level {deliveryTechnologyDependency}</p>
                      </div>
                      <div>
                        <label className={labelClass}>Engagement Drop Risk (1-5)</label>
                        <input type="range" min={1} max={5} value={deliveryEngagementDropRisk} onChange={(e) => setDeliveryEngagementDropRisk(Number(e.target.value))} className="level-slider w-full h-2 rounded-full [appearance:none] [-webkit-appearance:none] bg-transparent" style={{ background: levelSliderBg(deliveryEngagementDropRisk) }} />
                        <p className="text-sm mt-1" style={{ color: TEAL }}>Level {deliveryEngagementDropRisk}</p>
                      </div>
                    </div>
                  </div>
                )}

                {SHOW_ADVANCED_REQUIREMENT_DETAILS && deliveryModeSelected === 'hybrid' && (
                  <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-5">Delivery Details</h3>
                    <div className="space-y-4 mb-5">
                      <div>
                        <label className={labelClass}>Platform</label>
                        <CustomSelect id="delivery-platform-hybrid" value={deliveryPlatform} onChange={setDeliveryPlatform} options={DELIVERY_PLATFORM_OPTIONS} placeholder="Select platform" />
                      </div>
                      <div>
                        <label className={labelClass}>Meeting Link</label>
                        <input
                          type="text"
                          value={meetLink}
                          onChange={(e) => setMeetLink(e.target.value)}
                          placeholder="Paste meeting URL (Zoom/Teams/Meet/etc.)"
                          className={inputClass}
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
                          <span className="text-sm font-medium text-gray-900">Breakout Rooms Needed</span>
                          <button type="button" role="switch" aria-checked={breakoutRoomsNeeded} onClick={() => setBreakoutRoomsNeeded(!breakoutRoomsNeeded)} className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-0 transition-colors focus:outline-none focus:ring-2 focus:ring-[#2293B4] focus:ring-offset-2 ${breakoutRoomsNeeded ? 'bg-[#2293B4]' : 'bg-gray-200'}`}>
                            <span className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow ring-0 transition-transform mt-0.5 ml-0.5 ${breakoutRoomsNeeded ? 'translate-x-6' : 'translate-x-0'}`} />
                          </button>
                        </div>
                        <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
                          <span className="text-sm font-medium text-gray-900">Recording Required</span>
                          <button type="button" role="switch" aria-checked={recordingRequired} onClick={() => setRecordingRequired(!recordingRequired)} className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-0 transition-colors focus:outline-none focus:ring-2 focus:ring-[#2293B4] focus:ring-offset-2 ${recordingRequired ? 'bg-[#2293B4]' : 'bg-gray-200'}`}>
                            <span className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow ring-0 transition-transform mt-0.5 ml-0.5 ${recordingRequired ? 'translate-x-6' : 'translate-x-0'}`} />
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className={labelClass}>Room/Seating Style</label>
                        <textarea value={roomSeatingStyle} onChange={(e) => setRoomSeatingStyle(e.target.value)} placeholder="e.g., U-shape, Theater, Classroom" rows={3} className={`${inputClass} resize-y`} />
                      </div>
                      <div>
                        <label className={labelClass}>AV Setup Required</label>
                        <textarea value={avSetupRequired} onChange={(e) => setAvSetupRequired(e.target.value)} placeholder="e.g., Projector, Mic, Flipcharts" rows={3} className={`${inputClass} resize-y`} />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <label className={labelClass}>Technology Dependency (1-5)</label>
                        <input type="range" min={1} max={5} value={deliveryTechnologyDependency} onChange={(e) => setDeliveryTechnologyDependency(Number(e.target.value))} className="level-slider w-full h-2 rounded-full [appearance:none] [-webkit-appearance:none] bg-transparent" style={{ background: levelSliderBg(deliveryTechnologyDependency) }} />
                        <p className="text-sm mt-1" style={{ color: TEAL }}>Level {deliveryTechnologyDependency}</p>
                      </div>
                      <div>
                        <label className={labelClass}>Engagement Drop Risk (1-5)</label>
                        <input type="range" min={1} max={5} value={deliveryEngagementDropRisk} onChange={(e) => setDeliveryEngagementDropRisk(Number(e.target.value))} className="level-slider w-full h-2 rounded-full [appearance:none] [-webkit-appearance:none] bg-transparent" style={{ background: levelSliderBg(deliveryEngagementDropRisk) }} />
                        <p className="text-sm mt-1" style={{ color: TEAL }}>Level {deliveryEngagementDropRisk}</p>
                      </div>
                    </div>
                  </div>
                )}

                {SHOW_ADVANCED_REQUIREMENT_DETAILS && (deliveryModeSelected === 'virtual' || deliveryModeSelected === 'blended') && (
                  <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-5">Delivery Details</h3>
                    <div className="space-y-4 mb-5">
                      <div>
                        <label className={labelClass}>Platform</label>
                        <CustomSelect id="delivery-platform" value={deliveryPlatform} onChange={setDeliveryPlatform} options={DELIVERY_PLATFORM_OPTIONS} placeholder="Select platform" />
                      </div>
                      {deliveryModeSelected === 'virtual' && (
                        <div>
                          <label className={labelClass}>Meeting Link</label>
                          <input
                            type="text"
                            value={meetLink}
                            onChange={(e) => setMeetLink(e.target.value)}
                            placeholder="Paste meeting URL (Zoom/Teams/Meet/etc.)"
                            className={inputClass}
                          />
                        </div>
                      )}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
                          <span className="text-sm font-medium text-gray-900">Breakout Rooms Needed</span>
                          <button type="button" role="switch" aria-checked={breakoutRoomsNeeded} onClick={() => setBreakoutRoomsNeeded(!breakoutRoomsNeeded)} className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-0 transition-colors focus:outline-none focus:ring-2 focus:ring-[#2293B4] focus:ring-offset-2 ${breakoutRoomsNeeded ? 'bg-[#2293B4]' : 'bg-gray-200'}`}>
                            <span className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow ring-0 transition-transform mt-0.5 ml-0.5 ${breakoutRoomsNeeded ? 'translate-x-6' : 'translate-x-0'}`} />
                          </button>
                        </div>
                        <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
                          <span className="text-sm font-medium text-gray-900">Recording Required</span>
                          <button type="button" role="switch" aria-checked={recordingRequired} onClick={() => setRecordingRequired(!recordingRequired)} className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-0 transition-colors focus:outline-none focus:ring-2 focus:ring-[#2293B4] focus:ring-offset-2 ${recordingRequired ? 'bg-[#2293B4]' : 'bg-gray-200'}`}>
                            <span className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow ring-0 transition-transform mt-0.5 ml-0.5 ${recordingRequired ? 'translate-x-6' : 'translate-x-0'}`} />
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <label className={labelClass}>Technology Dependency (1-5)</label>
                        <input type="range" min={1} max={5} value={deliveryTechnologyDependency} onChange={(e) => setDeliveryTechnologyDependency(Number(e.target.value))} className="level-slider w-full h-2 rounded-full [appearance:none] [-webkit-appearance:none] bg-transparent" style={{ background: levelSliderBg(deliveryTechnologyDependency) }} />
                        <p className="text-sm mt-1" style={{ color: TEAL }}>Level {deliveryTechnologyDependency}</p>
                      </div>
                      <div>
                        <label className={labelClass}>Engagement Drop Risk (1-5)</label>
                        <input type="range" min={1} max={5} value={deliveryEngagementDropRisk} onChange={(e) => setDeliveryEngagementDropRisk(Number(e.target.value))} className="level-slider w-full h-2 rounded-full [appearance:none] [-webkit-appearance:none] bg-transparent" style={{ background: levelSliderBg(deliveryEngagementDropRisk) }} />
                        <p className="text-sm mt-1" style={{ color: TEAL }}>Level {deliveryEngagementDropRisk}</p>
                      </div>
                    </div>
                  </div>
                )}

                {SHOW_ADVANCED_REQUIREMENT_DETAILS && deliveryModeSelected === 'async' && (
                  <div className="rounded-xl border border-sky-200 bg-[#F4F8FA] p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-5">Delivery Details</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <label className={labelClass}>Technology Dependency (1-5)</label>
                        <input type="range" min={1} max={5} value={deliveryTechnologyDependency} onChange={(e) => setDeliveryTechnologyDependency(Number(e.target.value))} className="level-slider w-full h-2 rounded-full [appearance:none] [-webkit-appearance:none] bg-transparent" style={{ background: levelSliderBg(deliveryTechnologyDependency) }} />
                        <p className="text-sm mt-1" style={{ color: TEAL }}>Level {deliveryTechnologyDependency}</p>
                      </div>
                      <div>
                        <label className={labelClass}>Engagement Drop Risk (1-5)</label>
                        <input type="range" min={1} max={5} value={deliveryEngagementDropRisk} onChange={(e) => setDeliveryEngagementDropRisk(Number(e.target.value))} className="level-slider w-full h-2 rounded-full [appearance:none] [-webkit-appearance:none] bg-transparent" style={{ background: levelSliderBg(deliveryEngagementDropRisk) }} />
                        <p className="text-sm mt-1" style={{ color: TEAL }}>Level {deliveryEngagementDropRisk}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <h2 className="text-lg font-bold text-gray-900 mb-4">Duration</h2>
                  <label className={labelClass}>Total Duration (Minutes)</label>
                  <input type="number" min={1} value={totalDurationMinutes} onChange={(e) => setTotalDurationMinutes(e.target.value)} placeholder="e.g., 30" className={`${inputClass} bg-white border-gray-200`} />
                  {totalDurationMinutes.trim() !== '' && durationCategory && (
                    <>
                      <div className="mt-4 flex items-center justify-between rounded-lg bg-[#E8EEF2] px-4 py-3">
                        <span className="text-sm font-medium text-gray-700">Duration Category:</span>
                        <span className="rounded-full bg-[#2293B4] px-3 py-1 text-xs font-medium text-white">{durationCategory}</span>
                      </div>
                      <div className="mt-4 rounded-xl border border-sky-200 bg-[#F4F8FA] p-6 shadow-sm">
                        <h3 className="text-lg font-bold text-gray-900 mb-5">Duration Considerations</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                          <div className="space-y-5">
                            <div>
                              <label className={labelClass}>Fatigue Risk (1-5)</label>
                              <input type="range" min={1} max={5} value={fatigueRisk} onChange={(e) => setFatigueRisk(Number(e.target.value))} className="w-full h-2 rounded-full [appearance:none] [-webkit-appearance:none] bg-transparent" style={{ background: levelSliderBg(fatigueRisk) }} />
                              <p className="text-sm mt-1" style={{ color: TEAL }}>Level {fatigueRisk}</p>
                            </div>
                            <div>
                              <label className={labelClass}>Pacing Requirement (1-5)</label>
                              <input type="range" min={1} max={5} value={pacingRequirement} onChange={(e) => setPacingRequirement(Number(e.target.value))} className="w-full h-2 rounded-full [appearance:none] [-webkit-appearance:none] bg-transparent" style={{ background: levelSliderBg(pacingRequirement) }} />
                              <p className="text-xs mt-1 text-gray-500">1=Slow, 5=Fast</p>
                            </div>
                          </div>
                          <div className="space-y-5">
                            <div>
                              <label className={labelClass}>Depth Possible (1-5)</label>
                              <input type="range" min={1} max={5} value={depthPossible} onChange={(e) => setDepthPossible(Number(e.target.value))} className="w-full h-2 rounded-full [appearance:none] [-webkit-appearance:none] bg-transparent" style={{ background: levelSliderBg(depthPossible) }} />
                              <p className="text-sm mt-1" style={{ color: TEAL }}>Level {depthPossible}</p>
                            </div>
                            <div>
                              <label className={labelClass}>Breaks Required</label>
                              <div className="pt-1">
                                <button type="button" role="switch" aria-checked={breaksRequired} onClick={() => setBreaksRequired(!breaksRequired)} className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-0 transition-colors focus:outline-none focus:ring-2 focus:ring-[#2293B4] focus:ring-offset-2 ${breaksRequired ? 'bg-[#2293B4]' : 'bg-gray-200'}`}>
                                  <span className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow ring-0 transition-transform mt-0.5 ml-0.5 ${breaksRequired ? 'translate-x-6' : 'translate-x-0'}`} />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <div>
                  <h2 className="text-lg font-bold text-gray-900 mb-4">Number of Sessions</h2>
                  <div className="flex flex-col sm:flex-row sm:items-end gap-4">
                    <div className="sm:w-48">
                      <label className={labelClass}>Total Sessions</label>
                      <input type="number" min={1} value={totalSessions} onChange={(e) => setTotalSessions(e.target.value)} className={`${inputClass} bg-[#F7F9FC] border-gray-200 focus:ring-2 focus:ring-[#2293B4] focus:border-[#2293B4]`} />
                    </div>
                    <div className="flex items-center gap-2 rounded-lg bg-[#E8EEF2] px-4 py-3 h-[42px] box-border sm:h-auto sm:min-h-[42px]">
                      <span className="text-sm font-medium text-gray-700 whitespace-nowrap">Session Pattern:</span>
                      <span className="rounded-full bg-[#2293B4] px-3 py-1 text-xs font-medium text-white whitespace-nowrap">
                        {parseInt(totalSessions, 10) === 1 ? 'single_session' : sessionPattern}
                      </span>
                    </div>
                  </div>
                  {parseInt(totalSessions, 10) > 1 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {SESSION_PATTERN_OPTIONS.filter((o) => o !== 'single_session').map((opt) => (
                        <button key={opt} type="button" onClick={() => setSessionPattern(opt)} className={`rounded-lg px-3 py-2 text-sm font-medium ${sessionPattern === opt ? 'bg-[#2293B4] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>{opt}</button>
                      ))}
                    </div>
                  )}
                  {parseInt(totalSessions, 10) > 1 && (
                    <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                      <h3 className="text-lg font-bold text-gray-900 mb-5">Multi-Session Details</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-5">
                          <div>
                            <label className={labelClass}>Continuity Level (1-5)</label>
                            <input type="range" min={1} max={5} value={continuityLevel} onChange={(e) => setContinuityLevel(Number(e.target.value))} className="w-full h-2 rounded-full [appearance:none] [-webkit-appearance:none] bg-transparent" style={{ background: levelSliderBg(continuityLevel) }} />
                            <p className="text-sm mt-1" style={{ color: TEAL }}>Level {continuityLevel}</p>
                          </div>
                          <div>
                            <label className={labelClass}>Reinforcement Required</label>
                            <div className="pt-1">
                              <button type="button" role="switch" aria-checked={multiSessionReinforcementRequired} onClick={() => setMultiSessionReinforcementRequired(!multiSessionReinforcementRequired)} className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-0 transition-colors focus:outline-none focus:ring-2 focus:ring-[#2293B4] focus:ring-offset-2 ${multiSessionReinforcementRequired ? 'bg-[#2293B4]' : 'bg-gray-200'}`}>
                                <span className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow ring-0 transition-transform mt-0.5 ml-0.5 ${multiSessionReinforcementRequired ? 'translate-x-6' : 'translate-x-0'}`} />
                              </button>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-5">
                          <div>
                            <label className={labelClass}>Scheduling Complexity (1-5)</label>
                            <input type="range" min={1} max={5} value={schedulingComplexity} onChange={(e) => setSchedulingComplexity(Number(e.target.value))} className="w-full h-2 rounded-full [appearance:none] [-webkit-appearance:none] bg-transparent" style={{ background: levelSliderBg(schedulingComplexity) }} />
                            <p className="text-sm mt-1" style={{ color: TEAL }}>Level {schedulingComplexity}</p>
                          </div>
                          <div>
                            <label className={labelClass}>Dependency Between Sessions</label>
                            <div className="pt-1">
                              <button type="button" role="switch" aria-checked={dependencyBetweenSessions} onClick={() => setDependencyBetweenSessions(!dependencyBetweenSessions)} className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-0 transition-colors focus:outline-none focus:ring-2 focus:ring-[#2293B4] focus:ring-offset-2 ${dependencyBetweenSessions ? 'bg-[#2293B4]' : 'bg-gray-200'}`}>
                                <span className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow ring-0 transition-transform mt-0.5 ml-0.5 ${dependencyBetweenSessions ? 'translate-x-6' : 'translate-x-0'}`} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <h2 className="text-lg font-bold text-gray-900 mb-4">Timeline</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className={labelClass} htmlFor="preferred-start-date">Preferred Start Date</label>
                      <input
                        id="preferred-start-date"
                        type="date"
                        value={preferredStartDate}
                        onChange={(e) => setPreferredStartDate(e.target.value)}
                        max={preferredEndDate || undefined}
                        className={inputClass}
                        aria-label="Preferred start date"
                      />
                    </div>
                    <div>
                      <label className={labelClass} htmlFor="preferred-end-date">Preferred End Date</label>
                      <input
                        id="preferred-end-date"
                        type="date"
                        value={preferredEndDate}
                        onChange={(e) => setPreferredEndDate(e.target.value)}
                        min={preferredStartDate || undefined}
                        className={inputClass}
                        aria-label="Preferred end date"
                      />
                    </div>
                  </div>
                  {preferredStartDate && preferredEndDate && preferredStartDate >= preferredEndDate && (
                    <p className="text-sm text-red-600 mb-4">Start date must be before end date.</p>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Flexibility Level</label>
                      <CustomSelect id="flexibility-level" value={flexibilityLevel} onChange={setFlexibilityLevel} options={FLEXIBILITY_LEVEL_OPTIONS} placeholder="How flexible are dates?" />
                    </div>
                    <div>
                      <label className={labelClass}>Urgency Level</label>
                      <CustomSelect id="urgency-level" value={urgencyLevel} onChange={setUrgencyLevel} options={URGENCY_LEVEL_OPTIONS} placeholder="How urgent?" />
                    </div>
                  </div>
                </div>

                <div>
                  <h2 className="text-lg font-bold text-gray-900 mb-4">Location</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className={labelClass}>City</label>
                      <input type="text" value={city} onChange={(e) => setCity(e.target.value)} placeholder="e.g., Mumbai" className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>State</label>
                      <input type="text" value={state} onChange={(e) => setState(e.target.value)} placeholder="e.g., Maharashtra" className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Country</label>
                      <input type="text" value={country} onChange={(e) => setCountry(e.target.value)} placeholder="e.g., India" className={inputClass} />
                    </div>
                  </div>
                </div>

                {deliveryModeSelected !== 'virtual' && (
                  <>
                    <div>
                      <h2 className="text-lg font-bold text-gray-900 mb-4">Venue Type</h2>
                      <CustomSelect id="venue-type" value={venueType} onChange={setVenueType} options={VENUE_TYPE_OPTIONS} placeholder="Select venue type" />
                    </div>

                    <div>
                      <h2 className="text-lg font-bold text-gray-900 mb-4">Venue Details (Optional)</h2>
                      <textarea value={venueDetails} onChange={(e) => setVenueDetails(e.target.value)} placeholder="e.g., Conference room on 5th floor, capacity 30" rows={3} className={`${inputClass} resize-y`} />
                    </div>
                  </>
                )}

                <div>
                  <h2 className="text-lg font-bold text-gray-900 mb-2">Time Constraints</h2>
                  <p className="text-sm text-gray-500 mb-4">Specify scheduling preferences and limitations</p>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">Preferred Time Slots</label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {['morning (9-12)', 'afternoon (12-4)', 'evening (4-8)', 'night'].map((slot) => (
                          <label key={slot} className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-3 cursor-pointer hover:bg-gray-50">
                            <input type="checkbox" checked={preferredTimeSlots.has(slot)} onChange={() => setPreferredTimeSlots((prev) => { const n = new Set(prev); if (n.has(slot)) n.delete(slot); else n.add(slot); return n })} className="w-4 h-4 rounded border-gray-300 text-[#2293B4] focus:ring-[#2293B4]" />
                            <span className="text-sm text-gray-900">{slot}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className={labelClass}>Blackout Dates (comma-separated)</label>
                      <input type="text" value={blackoutDates} onChange={(e) => setBlackoutDates(e.target.value)} placeholder="e.g., 2024-12-25, 2024-12-26" className={inputClass} />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className={labelClass}>Daily Time Window</label>
                        <input type="text" value={dailyTimeWindow} onChange={(e) => setDailyTimeWindow(e.target.value)} placeholder="e.g., 9 AM - 5 PM" className={inputClass} />
                      </div>
                      <div>
                        <label className={labelClass}>Timezone</label>
                        <input type="text" value={timezone} onChange={(e) => setTimezone(e.target.value)} placeholder="e.g., IST, EST" className={inputClass} />
                      </div>
                    </div>
                    <div>
                      <label className={labelClass}>Scheduling Restrictions (Optional)</label>
                      <input type="text" value={schedulingRestrictions} onChange={(e) => setSchedulingRestrictions(e.target.value)} placeholder="e.g., No Mondays, Must avoid quarter-end weeks" className={inputClass} />
                    </div>
                  </div>
                  {SHOW_ADVANCED_REQUIREMENT_DETAILS && (preferredTimeSlots.size > 0 || blackoutDates.trim() !== '' || dailyTimeWindow.trim() !== '' || timezone.trim() !== '' || schedulingRestrictions.trim() !== '') && (
                    <div className="mt-6 rounded-xl border border-gray-200 bg-[#F4F8FA] p-6 shadow-sm">
                      <h3 className="text-lg font-bold text-gray-900 mb-5">Scheduling Profile</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                        <div>
                          <label className={labelClass}>Scheduling Flexibility (1-5)</label>
                          <input type="range" min={1} max={5} value={schedulingFlexibility} onChange={(e) => setSchedulingFlexibility(Number(e.target.value))} className="w-full h-2 rounded-full [appearance:none] [-webkit-appearance:none] bg-transparent" style={{ background: levelSliderBg(schedulingFlexibility) }} />
                          <p className="text-sm mt-1" style={{ color: TEAL }}>Level {schedulingFlexibility}</p>
                        </div>
                        <div>
                          <label className={labelClass}>Coordination Complexity (1-5)</label>
                          <input type="range" min={1} max={5} value={coordinationComplexity} onChange={(e) => setCoordinationComplexity(Number(e.target.value))} className="w-full h-2 rounded-full [appearance:none] [-webkit-appearance:none] bg-transparent" style={{ background: levelSliderBg(coordinationComplexity) }} />
                          <p className="text-sm mt-1" style={{ color: TEAL }}>Level {coordinationComplexity}</p>
                        </div>
                      </div>
                      <div>
                        <label className={labelClass}>Conflict Probability (1-5)</label>
                        <input type="range" min={1} max={5} value={conflictProbability} onChange={(e) => setConflictProbability(Number(e.target.value))} className="w-full h-2 rounded-full [appearance:none] [-webkit-appearance:none] bg-transparent" style={{ background: levelSliderBg(conflictProbability) }} />
                        <p className="text-sm mt-1" style={{ color: TEAL }}>Level {conflictProbability}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <h2 className="text-lg font-bold text-gray-900 mb-2">Preparation Time Available</h2>
                  <p className="text-sm text-gray-500 mb-4">How much time can the expert have to prepare?</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {PREPARATION_TIME_OPTIONS.map(({ id, title, description, risk, riskClass }) => {
                      const isSelected = preparationTimeSelected === id
                      return (
                        <button key={id} type="button" onClick={() => setPreparationTimeSelected(preparationTimeSelected === id ? null : id)} className={`rounded-xl border p-4 text-left transition-colors relative ${isSelected ? 'border-[#2293B4] bg-[#E0F7FA] ring-1 ring-[#2293B4]' : 'border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300'}`}>
                          <p className="font-semibold text-gray-900">{title}</p>
                          <p className="text-sm text-gray-500 mt-0.5">{description}</p>
                          <span className={`absolute top-3 right-3 rounded-lg px-2 py-0.5 text-xs font-medium ${riskClass}`}>{risk.replace('_', ' ')}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {(engagementTypeSelected != null || deliveryModeSelected != null || totalDurationMinutes.trim() !== '' || preferredStartDate !== '' || preferredEndDate !== '' || flexibilityLevel !== '' || urgencyLevel !== '' || city.trim() !== '' || state.trim() !== '' || country.trim() !== '' || venueType !== '' || venueDetails.trim() !== '' || preferredTimeSlots.size > 0 || blackoutDates.trim() !== '' || dailyTimeWindow.trim() !== '' || timezone.trim() !== '' || schedulingRestrictions.trim() !== '' || preparationTimeSelected != null) && (
                  <div className="rounded-xl border-2 border-purple-200 bg-[#FAF5FF] p-6 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-purple-600" aria-hidden>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                          <line x1="16" y1="2" x2="16" y2="6" />
                          <line x1="8" y1="2" x2="8" y2="6" />
                          <line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                      </span>
                      <h3 className="text-lg font-bold text-purple-800">Logistics Summary</h3>
                    </div>
                    <ul className="space-y-2 text-sm">
                      {totalDurationMinutes.trim() !== '' && (
                        <li className="flex items-baseline gap-2">
                          <span className="text-purple-600 mt-0.5">•</span>
                          <span className="text-purple-700">Duration:</span>
                          <span className="font-bold text-purple-800">{totalDurationMinutes} minutes</span>
                          {durationCategory && <span className="text-purple-600/80">({durationCategory})</span>}
                        </li>
                      )}
                      <li className="flex items-baseline gap-2">
                        <span className="text-purple-600 mt-0.5">•</span>
                        <span className="text-purple-700">Sessions:</span>
                        <span className="font-bold text-purple-800">{totalSessions || '—'}</span>
                        <span className="text-purple-600/80">({parseInt(totalSessions, 10) === 1 ? 'single_session' : sessionPattern})</span>
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            )}

            {!draftLoading && !draftLoadError && step === 5 && (
              <div className="space-y-8">
                <h2 className="text-lg font-bold text-gray-900 mb-2">Budget Range</h2>
                <p className="text-sm text-gray-500 mb-4">Select a budget band, then fine-tune with precise values</p>
                <div className="space-y-3">
                  {BUDGET_BANDS.map((band) => {
                    const isSelected = budgetBandSelected === band.id
                    return (
                      <button
                        key={band.id}
                        type="button"
                        onClick={() => setBudgetBandSelected(isSelected ? null : band.id)}
                        className={`w-full rounded-xl border-2 p-4 flex items-center justify-between text-left transition-colors ${
                          isSelected ? 'border-[#2293B4] bg-white' : 'border-gray-200 bg-gray-50 hover:border-gray-300 hover:bg-gray-100'
                        }`}
                      >
                        <span className="text-gray-900">
                          <span className="font-bold">{band.label}</span>
                          <span className="font-normal text-gray-700"> {band.range}</span>
                        </span>
                        <span className={`rounded-lg px-2.5 py-1 text-xs font-bold shrink-0 ${
                          isSelected ? 'bg-[#2293B4] text-white' : 'bg-gray-200 text-gray-700'
                        }`}>
                          {band.tier}
                        </span>
                      </button>
                    )
                  })}
                </div>

                <div className="rounded-xl border-2 border-sky-200 bg-sky-50/50 p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Fine-tune Budget</h3>
                  <div className="space-y-5">
                    <div>
                      <label className={labelClass}>Minimum Budget</label>
                      <div className="flex items-center gap-4">
                        <input
                          type="range"
                          min={5000}
                          max={500000}
                          step={5000}
                          value={minBudget}
                          onChange={(e) => setMinBudget(Number(e.target.value))}
                          className="flex-1 h-2 rounded-full [appearance:none] [-webkit-appearance:none] bg-gray-200"
                          style={{ background: percentSliderBg(((minBudget - 5000) / 495000) * 100) }}
                        />
                        <span className="text-base font-semibold text-gray-900 w-28 text-right">
                          {minBudget >= 100000 ? `₹${(minBudget / 100000).toFixed(1)}L` : `₹${(minBudget / 1000).toFixed(0)}k`}
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className={labelClass}>Maximum Budget</label>
                      <div className="flex items-center gap-4">
                        <input
                          type="range"
                          min={25000}
                          max={2000000}
                          step={25000}
                          value={maxBudget}
                          onChange={(e) => setMaxBudget(Number(e.target.value))}
                          className="flex-1 h-2 rounded-full [appearance:none] [-webkit-appearance:none] bg-gray-200"
                          style={{ background: percentSliderBg(((maxBudget - 25000) / 1975000) * 100) }}
                        />
                        <span className="text-base font-semibold text-gray-900 w-28 text-right">
                          {maxBudget >= 100000 ? `₹${(maxBudget / 100000).toFixed(1)}L` : `₹${(maxBudget / 1000).toFixed(0)}k`}
                        </span>
                      </div>
                    </div>
                    <div className="rounded-lg border border-gray-200 bg-white px-4 py-3 flex items-center justify-between">
                      <span className="text-sm text-gray-600">Your Budget Range:</span>
                      <span className="font-semibold text-gray-900">
                        ₹{minBudget.toLocaleString('en-IN')} - ₹{maxBudget.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Budget Type</label>
                  <CustomSelect
                    id="budget-type"
                    value={budgetType}
                    onChange={setBudgetType}
                    options={BUDGET_TYPE_OPTIONS}
                    placeholder="How is the budget structured?"
                  />
                </div>
                <div>
                  <label className={labelClass}>Currency</label>
                  <CustomSelect
                    id="currency"
                    value={currency}
                    onChange={setCurrency}
                    options={CURRENCY_OPTIONS}
                    placeholder="Select currency"
                  />
                </div>

                <div className="rounded-xl border-2 border-green-200 bg-green-50/50 p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-green-600" aria-hidden>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                        <polyline points="17 6 23 6 23 12" />
                      </svg>
                    </span>
                    <h3 className="text-lg font-bold text-gray-900">Budget Intelligence</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div className="rounded-lg border border-gray-200 bg-gray-100 p-4 shadow-sm">
                      <p className="text-xs text-gray-500 mb-1">Expected Expert Tier</p>
                      <p className="font-semibold text-green-700">Senior consultants</p>
                    </div>
                    <div className="rounded-lg border border-gray-200 bg-gray-100 p-4 shadow-sm">
                      <p className="text-xs text-gray-500 mb-2">Affordability Score</p>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <div key={i} className={`w-2 h-8 rounded-sm ${i <= 4 ? 'bg-green-500' : 'bg-gray-200'}`} />
                        ))}
                        <span className="ml-2 text-sm font-medium text-gray-900">4/5</span>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-lg border border-gray-200 bg-gray-100 p-4 shadow-sm mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Price Sensitivity</p>
                    <span className="inline-block rounded-full border border-gray-300 bg-gray-200 px-3 py-1.5 text-sm font-medium text-gray-900">Medium</span>
                  </div>
                  <div className="rounded-lg border border-gray-200 bg-gray-100 p-4 flex gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-green-600 text-green-600 text-xs font-bold">i</span>
                    <p className="text-sm font-medium text-green-800">
                      This budget will filter the expert pool to those matching your range. Overpriced proposals will be penalized, and underpricing will be flagged as a risk signal.
                    </p>
                  </div>
                </div>

                <div>
                  <h2 className="text-lg font-bold text-gray-900 mb-2">Budget Flexibility</h2>
                  <p className="text-sm text-gray-500 mb-4">How open are you to negotiating beyond your stated budget?</p>
                  <div className="space-y-3">
                    {BUDGET_FLEXIBILITY_OPTIONS.map((opt) => {
                      const isSelected = budgetFlexibility === opt.id
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setBudgetFlexibility(opt.id)}
                          className={`w-full rounded-xl border p-4 flex items-center justify-between text-left transition-colors ${
                            isSelected ? 'border-[#2293B4] bg-[#E0F7FA] ring-1 ring-[#2293B4]' : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          <div>
                            <p className="font-semibold text-gray-900">{opt.title}</p>
                            <p className="text-sm text-gray-500 mt-0.5">{opt.description}</p>
                          </div>
                          {isSelected ? (
                            <span className="shrink-0 rounded-lg bg-[#2293B4] px-3 py-1.5 text-sm font-medium text-white">
                              {opt.tag}
                            </span>
                          ) : (
                            <span className="text-sm text-gray-500 shrink-0">{opt.tag}</span>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {budgetFlexibility && (
                  <div className="rounded-xl border-2 border-sky-200 bg-white p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-blue-900 mb-4">Negotiation Profile</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                      <div className="rounded-lg border border-gray-200 bg-white p-4">
                        <p className="text-xs text-gray-500 mb-1">Negotiation Bandwidth</p>
                        <p className="text-base font-semibold text-gray-900">
                          {budgetFlexibility === 'fixed' ? '0%' : budgetFlexibility === 'slightly' ? '10%' : budgetFlexibility === 'moderate' ? '25%' : budgetFlexibility === 'highly' ? '50%' : 'Open'}
                        </p>
                      </div>
                      <div className="rounded-lg border border-gray-200 bg-white p-4">
                        <p className="text-xs text-gray-500 mb-1">Premium Acceptance Probability</p>
                        <p className="text-base font-semibold text-gray-900">
                          {budgetFlexibility === 'fixed' ? 'Very Low' : budgetFlexibility === 'slightly' ? 'Low' : budgetFlexibility === 'moderate' ? 'Medium' : budgetFlexibility === 'highly' ? 'High' : 'Very High'}
                        </p>
                      </div>
                      <div className="rounded-lg border border-gray-200 bg-white p-4">
                        <p className="text-xs text-gray-500 mb-1">Deal Closure Probability</p>
                        <span className="inline-block rounded-full bg-gray-600 px-3 py-1 text-sm font-medium text-white">Medium</span>
                      </div>
                      <div className="rounded-lg border border-gray-200 bg-white p-4">
                        <p className="text-xs text-gray-500 mb-1">Expert Pool Impact</p>
                        <p className="text-base font-semibold text-[#2293B4]">Standard pool</p>
                      </div>
                    </div>
                    <div className="rounded-lg border border-sky-200 bg-sky-50/50 p-4 flex gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#2293B4] text-white text-xs font-bold">i</span>
                      <p className="text-sm text-gray-700">
                        Flexibility allows ranking premium experts higher while maintaining cost awareness in scoring.
                      </p>
                    </div>
                  </div>
                )}

                <div>
                  <h2 className="text-lg font-bold text-gray-900 mb-2">Payment Terms</h2>
                  <p className="text-sm text-gray-500 mb-4">Define how and when you&apos;ll pay the expert</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {PAYMENT_TERMS_OPTIONS.map((term) => {
                      const riskClass = term.risk === 'low' ? 'bg-green-100 text-green-800' : term.risk === 'medium' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                      const appealClass = term.appeal === 'high' ? 'bg-green-100 text-green-800' : term.appeal === 'medium' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                      return (
                        <button
                          key={term.id}
                          type="button"
                          onClick={() => setPaymentTermSelected(paymentTermSelected === term.id ? null : term.id)}
                          className={`rounded-xl border p-4 text-left transition-colors ${
                            paymentTermSelected === term.id ? 'border-[#2293B4] bg-[#E0F7FA] ring-1 ring-[#2293B4]' : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          <p className="font-semibold text-gray-900">{term.title}</p>
                          <div className="flex flex-wrap gap-2 mt-2">
                            <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${riskClass}`}>{term.risk} risk</span>
                            <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${appealClass}`}>{term.appeal} appeal</span>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {paymentTermSelected && (() => {
                  const isUpfront = paymentTermSelected === 'upfront' || paymentTermSelected === '50-50' || paymentTermSelected === 'retainer'
                  const isMilestone = paymentTermSelected === 'milestone' || paymentTermSelected === 'net30'
                  const isNet15 = paymentTermSelected === 'net15'
                  const isNet60OrPerformance = paymentTermSelected === 'net60' || paymentTermSelected === 'performance'
                  const isPostDelivery = paymentTermSelected === 'post-delivery'
                  const purple = '#5B21B6'
                  if (isUpfront) {
                    return (
                      <div className="rounded-xl border-2 border-violet-200 bg-white p-6 shadow-sm">
                        <h3 className="text-lg font-bold mb-4" style={{ color: purple }}>Payment Intelligence</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                          <div className="rounded-lg border border-gray-200 bg-white p-4">
                            <p className="text-sm text-gray-600 mb-1">Cash Flow Risk</p>
                            <span className="inline-block rounded-full bg-gray-200 px-3 py-1 text-sm font-bold text-gray-800 uppercase">LOW</span>
                          </div>
                          <div className="rounded-lg border border-gray-200 bg-white p-4">
                            <p className="text-sm text-gray-600 mb-1">Expert Attractiveness</p>
                            <span className="inline-block rounded-full bg-gray-200 px-3 py-1 text-sm font-bold text-gray-800 uppercase">HIGH</span>
                          </div>
                          <div className="rounded-lg border border-gray-200 bg-white p-4">
                            <p className="text-sm text-gray-600 mb-1">Trust Level Required</p>
                            <p className="text-base font-normal" style={{ color: purple }}>Low</p>
                          </div>
                          <div className="rounded-lg border border-gray-200 bg-white p-4">
                            <p className="text-sm text-gray-600 mb-1">Enterprise Complexity</p>
                            <p className="text-base font-normal" style={{ color: purple }}>Low</p>
                          </div>
                        </div>
                        <div className="rounded-lg border border-violet-200 bg-violet-50/30 p-4 flex gap-3 items-start">
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-white text-sm font-bold" style={{ backgroundColor: purple }}>!</span>
                          <div>
                            <p className="text-sm font-semibold mb-1" style={{ color: purple }}>Impact on Matching:</p>
                            <p className="text-sm text-gray-700"><span className="text-green-600">✓</span> Upfront payment terms maximize expert pool and improve response rates.</p>
                          </div>
                        </div>
                      </div>
                    )
                  }
                  if (isMilestone) {
                    return (
                      <div className="rounded-xl border-2 border-violet-200 bg-white p-6 shadow-sm">
                        <h3 className="text-lg font-bold mb-4" style={{ color: purple }}>Payment Intelligence</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                          <div className="rounded-lg border border-gray-200 bg-white p-4">
                            <p className="text-sm text-gray-600 mb-1">Cash Flow Risk</p>
                            <span className="inline-block rounded-full bg-gray-600 px-3 py-1 text-sm font-bold text-white uppercase">MEDIUM</span>
                          </div>
                          <div className="rounded-lg border border-gray-200 bg-white p-4">
                            <p className="text-sm text-gray-600 mb-1">Expert Attractiveness</p>
                            <span className="inline-block rounded-full bg-gray-600 px-3 py-1 text-sm font-bold text-white uppercase">MEDIUM</span>
                          </div>
                          <div className="rounded-lg border border-gray-200 bg-white p-4">
                            <p className="text-sm text-gray-600 mb-1">Trust Level Required</p>
                            <p className="text-base font-normal" style={{ color: purple }}>Medium</p>
                          </div>
                          <div className="rounded-lg border border-gray-200 bg-white p-4">
                            <p className="text-sm text-gray-600 mb-1">Enterprise Complexity</p>
                            <p className="text-base font-normal" style={{ color: purple }}>High</p>
                          </div>
                        </div>
                        <div className="rounded-lg border border-violet-200 bg-violet-50/30 p-4 flex gap-3 items-start">
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-white text-sm font-bold" style={{ backgroundColor: purple }}>!</span>
                          <div>
                            <p className="text-sm font-semibold mb-1" style={{ color: purple }}>Impact on Matching:</p>
                            <p className="text-sm" style={{ color: '#7C3AED' }}><span style={{ color: purple }}>✓</span> Structured payment terms are preferred for long-term or complex engagements.</p>
                          </div>
                        </div>
                      </div>
                    )
                  }
                  if (isNet15) {
                    return (
                      <div className="rounded-xl border-2 border-violet-200 bg-white p-6 shadow-sm">
                        <h3 className="text-lg font-bold mb-4" style={{ color: purple }}>Payment Intelligence</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                          <div className="rounded-lg border border-gray-200 bg-white p-4">
                            <p className="text-sm text-gray-500 mb-1">Cash Flow Risk</p>
                            <span className="inline-block rounded-full bg-gray-600 px-3 py-1 text-sm font-bold text-white uppercase">MEDIUM</span>
                          </div>
                          <div className="rounded-lg border border-gray-200 bg-white p-4">
                            <p className="text-sm text-gray-500 mb-1">Expert Attractiveness</p>
                            <span className="inline-block rounded-full bg-gray-600 px-3 py-1 text-sm font-bold text-white uppercase">MEDIUM</span>
                          </div>
                          <div className="rounded-lg border border-gray-200 bg-white p-4">
                            <p className="text-sm text-gray-500 mb-1">Trust Level Required</p>
                            <p className="text-base font-normal" style={{ color: purple }}>Medium</p>
                          </div>
                          <div className="rounded-lg border border-gray-200 bg-white p-4">
                            <p className="text-sm text-gray-500 mb-1">Enterprise Complexity</p>
                            <p className="text-base font-normal" style={{ color: purple }}>Low</p>
                          </div>
                        </div>
                        <div className="rounded-lg border border-violet-200 bg-violet-50/30 p-4 flex gap-3 items-center">
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-white text-sm font-bold" style={{ backgroundColor: purple }}>!</span>
                          <p className="text-sm font-medium text-gray-700">Impact on Matching:</p>
                        </div>
                      </div>
                    )
                  }
                  if (isNet60OrPerformance) {
                    return (
                      <div className="rounded-xl border-2 border-violet-200 bg-white p-6 shadow-sm">
                        <h3 className="text-lg font-bold mb-4" style={{ color: purple }}>Payment Intelligence</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                          <div className="rounded-lg border border-gray-200 bg-white p-4">
                            <p className="text-sm text-gray-500 mb-1">Cash Flow Risk</p>
                            <span className="inline-block rounded-full bg-gray-200 px-3 py-1 text-sm font-bold text-gray-800 uppercase">HIGH</span>
                          </div>
                          <div className="rounded-lg border border-gray-200 bg-white p-4">
                            <p className="text-sm text-gray-500 mb-1">Expert Attractiveness</p>
                            <span className="inline-block rounded-full bg-gray-200 px-3 py-1 text-sm font-bold text-gray-800 uppercase">LOW</span>
                          </div>
                          <div className="rounded-lg border border-gray-200 bg-white p-4">
                            <p className="text-sm text-gray-500 mb-1">Trust Level Required</p>
                            <p className="text-base font-semibold" style={{ color: purple }}>High</p>
                          </div>
                          <div className="rounded-lg border border-gray-200 bg-white p-4">
                            <p className="text-sm text-gray-500 mb-1">Enterprise Complexity</p>
                            <p className="text-base font-semibold" style={{ color: purple }}>High</p>
                          </div>
                        </div>
                        <div className="rounded-lg border border-violet-200 bg-violet-50/30 p-4">
                          <div className="flex gap-3 items-center mb-2">
                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-white text-xs font-bold" style={{ backgroundColor: purple }}>i</span>
                            <p className="text-sm font-semibold" style={{ color: purple }}>Impact on Matching:</p>
                          </div>
                          <p className="text-sm flex items-start gap-2 pl-9">
                            <svg className="shrink-0 w-4 h-4 text-amber-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20" aria-hidden><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                            <span className="text-gray-700"><span className="font-semibold text-gray-900">Delayed payment terms</span> may filter out some independent experts who prefer <span className="font-semibold" style={{ color: purple }}>upfront payment</span>.</span>
                          </p>
                        </div>
                      </div>
                    )
                  }
                  if (isPostDelivery) {
                    return (
                      <div className="rounded-xl border-2 border-violet-200 bg-white p-6 shadow-sm">
                        <h3 className="text-lg font-bold mb-4" style={{ color: purple }}>Payment Intelligence</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                          <div className="rounded-lg border border-gray-200 bg-white p-4">
                            <p className="text-sm text-gray-600 mb-1">Cash Flow Risk</p>
                            <span className="inline-block rounded-full bg-gray-200 px-3 py-1 text-sm font-bold text-gray-800 uppercase">HIGH</span>
                          </div>
                          <div className="rounded-lg border border-gray-200 bg-white p-4">
                            <p className="text-sm text-gray-600 mb-1">Expert Attractiveness</p>
                            <span className="inline-block rounded-full bg-gray-200 px-3 py-1 text-sm font-bold text-gray-800 uppercase">LOW</span>
                          </div>
                          <div className="rounded-lg border border-gray-200 bg-white p-4">
                            <p className="text-sm text-gray-600 mb-1">Trust Level Required</p>
                            <p className="text-base font-semibold" style={{ color: purple }}>High</p>
                          </div>
                          <div className="rounded-lg border border-gray-200 bg-white p-4">
                            <p className="text-sm text-gray-600 mb-1">Enterprise Complexity</p>
                            <p className="text-base font-semibold" style={{ color: purple }}>Low</p>
                          </div>
                        </div>
                        <div className="rounded-lg border border-violet-200 bg-violet-50/30 p-4 flex gap-3 items-start">
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-white text-xs font-bold" style={{ backgroundColor: purple }}>i</span>
                          <div>
                            <p className="text-sm font-semibold mb-1" style={{ color: purple }}>Impact on Matching:</p>
                            <p className="text-sm text-gray-700 flex items-center gap-2">
                              <svg className="shrink-0 w-4 h-4 text-amber-500" fill="currentColor" viewBox="0 0 20 20" aria-hidden><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                              Delayed payment terms may filter out some independent experts who prefer upfront payment.
                            </p>
                          </div>
                        </div>
                      </div>
                    )
                  }
                  return (
                    <div className="rounded-xl border-2 border-violet-200 bg-white p-6 shadow-sm">
                      <h3 className="text-lg font-bold mb-4" style={{ color: purple }}>Payment Intelligence</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                        <div className="rounded-lg border border-gray-200 bg-white p-4">
                          <p className="text-sm text-gray-600 mb-1">Cash Flow Risk</p>
                          <span className="inline-block rounded-full bg-gray-600 px-3 py-1 text-sm font-bold text-white uppercase">MEDIUM</span>
                        </div>
                        <div className="rounded-lg border border-gray-200 bg-white p-4">
                          <p className="text-sm text-gray-600 mb-1">Expert Attractiveness</p>
                          <span className="inline-block rounded-full bg-gray-600 px-3 py-1 text-sm font-bold text-white uppercase">MEDIUM</span>
                        </div>
                        <div className="rounded-lg border border-gray-200 bg-white p-4">
                          <p className="text-sm text-gray-600 mb-1">Trust Level Required</p>
                          <p className="text-base font-normal" style={{ color: purple }}>Medium</p>
                        </div>
                        <div className="rounded-lg border border-gray-200 bg-white p-4">
                          <p className="text-sm text-gray-600 mb-1">Enterprise Complexity</p>
                          <p className="text-base font-normal" style={{ color: purple }}>High</p>
                        </div>
                      </div>
                      <div className="rounded-lg border border-violet-200 bg-violet-50/30 p-4 flex gap-3 items-start">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-white text-sm font-bold" style={{ backgroundColor: purple }}>!</span>
                        <p className="text-sm text-gray-700">Payment terms influence expert matching and response likelihood.</p>
                      </div>
                    </div>
                  )
                })()}

                <div>
                  <h2 className="text-lg font-bold text-gray-900 mb-2">Priority: Cost vs Quality</h2>
                  <p className="text-sm text-gray-500 mb-4">What matters more to you in expert selection?</p>
                  <div className="space-y-3 mb-6">
                    {COST_QUALITY_OPTIONS.map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => { setCostQualityPriority(opt.id); setCostQualityScore(opt.bars); }}
                        className={`w-full rounded-xl border p-4 flex items-center justify-between text-left transition-colors ${
                          costQualityPriority === opt.id ? 'border-[#2293B4] bg-[#E0F7FA] ring-1 ring-[#2293B4]' : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <div>
                          <p className="font-semibold text-gray-900">{opt.title}</p>
                          <p className="text-sm text-gray-500 mt-0.5">{opt.description}</p>
                        </div>
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className={`w-2 h-5 rounded-sm ${i <= opt.bars ? 'bg-[#2293B4]' : 'bg-gray-200'}`} />
                          ))}
                        </div>
                      </button>
                    ))}
                  </div>
                  <div>
                    <label className={labelClass}>Cost vs. Quality</label>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-700">Cost</span>
                      <input
                        type="range"
                        min={1}
                        max={5}
                        value={costQualityScore}
                        onChange={(e) => setCostQualityScore(Number(e.target.value))}
                        className="flex-1 h-2 rounded-full [appearance:none] [-webkit-appearance:none] bg-transparent"
                        style={{ background: levelSliderBg(costQualityScore) }}
                      />
                      <span className="text-sm font-medium text-gray-700">Quality</span>
                    </div>
                    <p className="text-sm mt-2" style={{ color: TEAL }}>Score: {costQualityScore}/5</p>
                  </div>
                </div>
              </div>
            )}

            {!draftLoading && !draftLoadError && step === 6 && (
              <div className="space-y-6">
                {publishError && (
                  <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-800 text-sm">
                    {publishError}
                  </div>
                )}
                <div className="rounded-xl border border-sky-200 bg-sky-50 p-5 flex gap-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#2293B4] text-white" aria-hidden>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                  </span>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">Ready to Publish</h2>
                    <p className="text-sm text-gray-600 mt-1">Review your requirement below. Once published, our AI will start matching you with relevant experts.</p>
                  </div>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 mb-5">Requirement Summary</h3>

                  {/* Objective */}
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-[#2293B4]" aria-hidden>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></svg>
                      </span>
                      <h4 className="text-base font-semibold" style={{ color: TEAL }}>Objective</h4>
                    </div>
                    <dl className="space-y-2 text-sm">
                      <div>
                        <dt className="text-gray-500 font-medium">Primary Goal:</dt>
                        <dd className="text-gray-900 mt-0.5">
                          {selectedOutcome ? selectedOutcome.replace(/-/g, '_') : '—'}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-gray-500 font-medium">Desired Transformation:</dt>
                        <dd className="text-gray-900 mt-0.5">{successMetrics.trim() || '—'}</dd>
                      </div>
                      <div>
                        <dt className="text-gray-500 font-medium">Secondary Objectives:</dt>
                        <dd className="mt-1 flex flex-wrap gap-1.5">
                          {secondarySelected.size > 0
                            ? Array.from(secondarySelected).map((id) => (
                                <span key={id} className="inline-flex rounded-md bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                                  {id.replace(/\s+/g, '_')}
                                </span>
                              ))
                            : '—'}
                        </dd>
                      </div>
                    </dl>
                  </div>

                  {/* Audience */}
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-[#2293B4]" aria-hidden>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                      </span>
                      <h4 className="text-base font-semibold" style={{ color: TEAL }}>Audience</h4>
                    </div>
                    <dl className="space-y-2 text-sm">
                      <div>
                        <dt className="text-gray-500 font-medium">Roles:</dt>
                        <dd className="mt-0.5 flex flex-wrap gap-1.5">
                          {audienceSelected.size > 0
                            ? Array.from(audienceSelected).map((r) => (
                                <span key={r} className="inline-flex rounded-md bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                                  {r.replace(/\s+/g, '_').toLowerCase()}
                                </span>
                              ))
                            : '—'}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-gray-500 font-medium">Seniority Levels:</dt>
                        <dd className="mt-0.5 flex flex-wrap gap-1.5">
                          {senioritySelected.size > 0
                            ? Array.from(senioritySelected).map((s) => (
                                <span key={s} className="inline-flex rounded-md bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                                  {s.replace(/\s+/g, '_').toLowerCase()}
                                </span>
                              ))
                            : '—'}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-gray-500 font-medium">Audience Size:</dt>
                        <dd className="text-gray-900 mt-0.5">{audienceSize ? `${audienceSize} participants` : '—'}</dd>
                      </div>
                      <div>
                        <dt className="text-gray-500 font-medium">Average Experience:</dt>
                        <dd className="text-gray-900 mt-0.5">{averageExperience || '—'}</dd>
                      </div>
                      <div>
                        <dt className="text-gray-500 font-medium">Functional Background:</dt>
                        <dd className="mt-0.5 flex flex-wrap gap-1.5">
                          {functionalSelected.size > 0
                            ? Array.from(functionalSelected).map((f) => (
                                <span key={f} className="inline-flex rounded-md bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                                  {f.replace(/\s+/g, '_').toLowerCase()}
                                </span>
                              ))
                            : '—'}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-gray-500 font-medium">Industry Context:</dt>
                        <dd className="text-gray-900 mt-0.5">
                          {industrySelected.size > 0 ? Array.from(industrySelected).map((i) => i.replace(/\s+/g, '_').toLowerCase()).join(', ') : '—'}
                        </dd>
                      </div>
                    </dl>
                  </div>

                  {/* Engagement Details */}
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-[#2293B4]" aria-hidden>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>
                      </span>
                      <h4 className="text-base font-semibold" style={{ color: TEAL }}>Engagement Details</h4>
                    </div>
                    <dl className="space-y-2 text-sm">
                      <div>
                        <dt className="text-gray-500 font-medium">Format:</dt>
                        <dd className="text-gray-900 mt-0.5">
                          {engagementTypeSelected
                            ? (ENGAGEMENT_TYPE_OPTIONS.find((o) => o.id === engagementTypeSelected)?.title ?? engagementTypeSelected).replace(/\s+/g, '_')
                            : '—'}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-gray-500 font-medium">Delivery Mode:</dt>
                        <dd className="text-gray-900 mt-0.5">
                          {deliveryModeSelected
                            ? (DELIVERY_MODE_OPTIONS.find((o) => o.id === deliveryModeSelected)?.title ?? deliveryModeSelected).replace(/\s+/g, ' ')
                            : '—'}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-gray-500 font-medium">Total Duration:</dt>
                        <dd className="text-gray-900 mt-0.5">
                          {totalDurationMinutes
                            ? (() => {
                                const n = parseInt(totalDurationMinutes, 10)
                                if (Number.isFinite(n) && n >= 60) return `${Math.round(n / 60)} hours`
                                if (Number.isFinite(n)) return `${n} minutes`
                                return totalDurationMinutes
                              })()
                            : '—'}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-gray-500 font-medium">Number of Sessions:</dt>
                        <dd className="text-gray-900 mt-0.5">{totalSessions ? `${totalSessions} sessions` : '—'}</dd>
                      </div>
                      <div>
                        <dt className="text-gray-500 font-medium">Expected Deliverables:</dt>
                        <dd className="mt-0.5 flex flex-wrap gap-1.5">
                          {deliverablesSelected.size > 0
                            ? Array.from(deliverablesSelected).map((id) => (
                                <span key={id} className="inline-flex rounded-md bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                                  {id.replace(/-/g, '_')}
                                </span>
                              ))
                            : '—'}
                        </dd>
                      </div>
                    </dl>
                  </div>

                  {/* Timeline & Location */}
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-[#2293B4]" aria-hidden>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                      </span>
                      <h4 className="text-base font-semibold" style={{ color: TEAL }}>Timeline &amp; Location</h4>
                    </div>
                    <dl className="space-y-2 text-sm">
                      <div>
                        <dt className="text-gray-500 font-medium">Timeline:</dt>
                        <dd className="text-gray-900 mt-0.5">
                          {preferredStartDate || preferredEndDate
                            ? `Start: ${formatDateDDMMYYYY(preferredStartDate)} • End: ${formatDateDDMMYYYY(preferredEndDate)}`
                            : '—'}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-gray-500 font-medium">Urgency:</dt>
                        <dd className="text-gray-900 mt-0.5">{urgencyLevel || '—'}</dd>
                      </div>
                      <div>
                        <dt className="text-gray-500 font-medium">Timeline Flexibility:</dt>
                        <dd className="text-gray-900 mt-0.5">{flexibilityLevel ? flexibilityLevel.replace(/\s+/g, '_') : '—'}</dd>
                      </div>
                      <div>
                        <dt className="text-gray-500 font-medium">Location:</dt>
                        <dd className="text-gray-900 mt-0.5">
                          {[city, state, country].filter(Boolean).join(', ') || '—'}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-gray-500 font-medium">Venue Type:</dt>
                        <dd className="text-gray-900 mt-0.5">{venueType ? venueType.replace(/\s+/g, '_') : '—'}</dd>
                      </div>
                      <div>
                        <dt className="text-gray-500 font-medium">Preferred Time Slots:</dt>
                        <dd className="mt-0.5 flex flex-wrap gap-1.5">
                          {preferredTimeSlots.size > 0
                            ? Array.from(preferredTimeSlots).map((slot) => (
                                <span key={slot} className="inline-flex rounded-md border border-gray-200 bg-white px-2.5 py-0.5 text-xs font-medium text-gray-800">
                                  {slot.toLowerCase()}
                                </span>
                              ))
                            : '—'}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-gray-500 font-medium">Timezone:</dt>
                        <dd className="text-gray-900 mt-0.5">{timezone || '—'}</dd>
                      </div>
                      <div>
                        <dt className="text-gray-500 font-medium">Preparation Time Available:</dt>
                        <dd className="text-gray-900 mt-0.5">
                          {preparationTimeSelected
                            ? (() => {
                                const opt = PREPARATION_TIME_OPTIONS.find((o) => o.id === preparationTimeSelected)
                                return opt ? `${opt.title.toLowerCase()} (${opt.description})` : preparationTimeSelected
                              })()
                            : '—'}
                        </dd>
                      </div>
                    </dl>
                  </div>

                  {/* Budget & Commercial */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-[#2293B4]" aria-hidden>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
                      </span>
                      <h4 className="text-base font-semibold" style={{ color: TEAL }}>Budget &amp; Commercial</h4>
                    </div>
                    <dl className="space-y-2 text-sm">
                      <div>
                        <dt className="text-gray-500 font-medium">Budget Range:</dt>
                        <dd className="text-gray-900 mt-0.5">
                          {minBudget > 0 || maxBudget > 0
                            ? `₹${minBudget.toLocaleString('en-IN')} - ₹${maxBudget.toLocaleString('en-IN')}`
                            : '—'}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-gray-500 font-medium">Budget Type:</dt>
                        <dd className="text-gray-900 mt-0.5">{budgetType ? budgetType.replace(/\s+/g, '_') : '—'}</dd>
                      </div>
                      <div>
                        <dt className="text-gray-500 font-medium">Budget Flexibility:</dt>
                        <dd className="text-gray-900 mt-0.5">
                          {budgetFlexibility
                            ? (BUDGET_FLEXIBILITY_OPTIONS.find((o) => o.id === budgetFlexibility)?.title ?? budgetFlexibility)
                            : '—'}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-gray-500 font-medium">Payment Terms:</dt>
                        <dd className="text-gray-900 mt-0.5">
                          {paymentTermSelected
                            ? (PAYMENT_TERMS_OPTIONS.find((o) => o.id === paymentTermSelected)?.title ?? paymentTermSelected).replace(/\s+/g, '_').replace(/-/g, '_')
                            : '—'}
                        </dd>
                      </div>
                    </dl>
                  </div>
                </div>
              </div>
            )}
          </div>

          <aside className="w-full lg:w-80 shrink-0 space-y-4 overflow-y-auto min-h-0 lg:max-h-[calc(100vh-10rem)] pr-2">
            <div className="flex items-center gap-2">
              <span className="text-[#2293B4]" aria-hidden>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3l1.2 3.6L17 8l-3.8 1.4L12 13l-1.2-3.6L7 8l3.8-1.4L12 3z" />
                </svg>
              </span>
              <h3 className="text-base font-bold text-gray-900">AI Insights</h3>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <h4 className="text-sm font-semibold text-gray-900 mb-2">Requirement Summary</h4>
              <p className="text-sm text-gray-600">Leadership workshop for middle managers</p>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <h4 className="text-sm font-semibold text-gray-900 mb-2">Suggested Expert Type</h4>
              <span className="inline-flex rounded-full px-3 py-1 text-sm font-medium text-white" style={{ backgroundColor: TEAL }}>
                Training Specialist
              </span>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <h4 className="text-sm font-semibold text-gray-900 mb-2">Estimated Matches</h4>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
                8 experts
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <h4 className="text-sm font-semibold text-gray-900 mb-2">Budget Fit</h4>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-2 rounded-full bg-gray-200 overflow-hidden">
                  <div className="h-full rounded-full bg-[#2293B4]" style={{ width: '70%' }} />
                </div>
                <span className="text-sm font-medium text-gray-700">Good</span>
              </div>
            </div>

            <div className="rounded-xl border border-sky-200 bg-sky-50 p-4">
              <div className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sky-200 text-sky-700 text-sm font-bold">i</span>
                <p className="text-sm text-sky-900">
                  Providing more details about measurable outcomes increases match quality by 40%.
                </p>
              </div>
            </div>
          </aside>
        </div>

        {!draftLoading && (
        <footer className="fixed bottom-0 left-0 right-0 sm:left-56 border-t border-gray-200 bg-white py-4 z-40">
          <div className="max-w-6xl mx-auto px-6 flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => { if (step === 2) setStep(1); if (step === 3) setStep(2); if (step === 4) setStep(3); if (step === 5) setStep(4); if (step === 6) setStep(5); }}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
              Back
            </button>
            <button
              type="button"
              onClick={handleSaveDraft}
              disabled={savingDraft}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-70"
            >
              {savingDraft ? (
                <>
                  <svg className="animate-spin h-[18px] w-[18px]" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Saving…
                </>
              ) : (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                    <polyline points="17 21 17 13 7 13 7 21" />
                    <polyline points="7 3 7 8 15 8 15 3" />
                  </svg>
                  Save Draft
                </>
              )}
            </button>
            {draftMessage && (
              <span className="text-sm text-gray-600">{draftMessage}</span>
            )}
            {step === 6 ? (
              <button
                type="button"
                onClick={handlePublish}
                disabled={publishing}
                className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-70 disabled:cursor-not-allowed"
                style={{ backgroundColor: TEAL }}
              >
                {publishing ? (
                  <>
                    <svg className="animate-spin h-[18px] w-[18px]" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Publishing…
                  </>
                ) : (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                    Post Requirement
                  </>
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setStep((s) => Math.min(6, s + 1))}
                className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90"
                style={{ backgroundColor: TEAL }}
              >
                Continue
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </button>
            )}
          </div>
        </footer>
        )}

        <div className="h-20 shrink-0" aria-hidden />
      </div>
    </DashboardLayout>
  )
}
