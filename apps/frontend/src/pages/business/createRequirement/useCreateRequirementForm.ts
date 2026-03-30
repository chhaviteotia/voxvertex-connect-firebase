import { useState } from 'react'
import { LEARNING_MODES } from './constants'
import { formatTime, getDurationCategory, levelSliderBg, percentSliderBg, inputClass, labelClass } from './utils'

export function useCreateRequirementForm() {
  const [selectedOutcome, setSelectedOutcome] = useState<string | null>(null)
  const [lastSaved] = useState(formatTime())
  const [step, setStep] = useState(1)

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

  const durationCategory = getDurationCategory(totalDurationMinutes)
  const toggleSecondary = (id: string) => {
    setSecondarySelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return {
    step,
    setStep,
    lastSaved,
    selectedOutcome,
    setSelectedOutcome,
    skillType,
    setSkillType,
    skillDomain,
    setSkillDomain,
    currentLevel,
    setCurrentLevel,
    targetLevel,
    setTargetLevel,
    learningMode,
    setLearningMode,
    handsOnPractice,
    setHandsOnPractice,
    certificationRequired,
    setCertificationRequired,
    secondarySelected,
    setSecondarySelected,
    successMetrics,
    setSuccessMetrics,
    revenueType,
    setRevenueType,
    targetAudience,
    setTargetAudience,
    expectedLeads,
    setExpectedLeads,
    expectedConversion,
    setExpectedConversion,
    dealSizeMin,
    setDealSizeMin,
    dealSizeMax,
    setDealSizeMax,
    followUpMechanism,
    setFollowUpMechanism,
    hiringGoal,
    setHiringGoal,
    assessmentType,
    setAssessmentType,
    rolesTargeted,
    setRolesTargeted,
    experienceLevel,
    setExperienceLevel,
    expectedHires,
    setExpectedHires,
    employerBrandingFocus,
    setEmployerBrandingFocus,
    positioningGoal,
    setPositioningGoal,
    brandTargetAudience,
    setBrandTargetAudience,
    brandMessageClarity,
    setBrandMessageClarity,
    visibilityChannels,
    setVisibilityChannels,
    speakerInfluence,
    setSpeakerInfluence,
    alignmentType,
    setAlignmentType,
    leadershipLevel,
    setLeadershipLevel,
    decisionOutcomeExpected,
    setDecisionOutcomeExpected,
    conflictResolutionRequired,
    setConflictResolutionRequired,
    crossFunctionAlignment,
    setCrossFunctionAlignment,
    problemType,
    setProblemType,
    problemDefinitionClarity,
    setProblemDefinitionClarity,
    collaborationLevel,
    setCollaborationLevel,
    solutionExpected,
    setSolutionExpected,
    prototypeExpected,
    setPrototypeExpected,
    complianceType,
    setComplianceType,
    regulatoryBody,
    setRegulatoryBody,
    mandatoryCompliance,
    setMandatoryCompliance,
    auditPreparationRequired,
    setAuditPreparationRequired,
    certificationRequiredCompliance,
    setCertificationRequiredCompliance,
    networkingType,
    setNetworkingType,
    connectionGoal,
    setConnectionGoal,
    relationshipDepthExpected,
    setRelationshipDepthExpected,
    followUpStructureDefined,
    setFollowUpStructureDefined,
    productType,
    setProductType,
    adoptionStage,
    setAdoptionStage,
    featureFocus,
    setFeatureFocus,
    userSegment,
    setUserSegment,
    onboardingRequired,
    setOnboardingRequired,
    behaviourType,
    setBehaviourType,
    currentBehaviorDescription,
    setCurrentBehaviorDescription,
    targetBehavior,
    setTargetBehavior,
    reinforcementRequired,
    setReinforcementRequired,
    measurementRequired,
    setMeasurementRequired,
    audienceSelected,
    setAudienceSelected,
    senioritySelected,
    setSenioritySelected,
    audienceSize,
    setAudienceSize,
    priorKnowledge,
    setPriorKnowledge,
    learningCurve,
    setLearningCurve,
    jargonTolerance,
    setJargonTolerance,
    depthCapacity,
    setDepthCapacity,
    paceOfDelivery,
    setPaceOfDelivery,
    functionalSelected,
    setFunctionalSelected,
    industrySelected,
    setIndustrySelected,
    resistanceLevel,
    setResistanceLevel,
    diversityOfAudience,
    setDiversityOfAudience,
    decisionPower,
    setDecisionPower,
    executionResponsibility,
    setExecutionResponsibility,
    domainExpertise,
    setDomainExpertise,
    influenceLevel,
    setInfluenceLevel,
    learningVsActionBias,
    setLearningVsActionBias,
    averageExperience,
    setAverageExperience,
    abstractionLevelCapacity,
    setAbstractionLevelCapacity,
    decisionAuthority,
    setDecisionAuthority,
    toleranceForBasics,
    setToleranceForBasics,
    technicalOrientation,
    setTechnicalOrientation,
    businessOrientation,
    setBusinessOrientation,
    toolUsageMaturity,
    setToolUsageMaturity,
    processOrientation,
    setProcessOrientation,
    regulationLevel,
    setRegulationLevel,
    technicalComplexity,
    setTechnicalComplexity,
    paceOfChange,
    setPaceOfChange,
    domainSpecificityRequired,
    setDomainSpecificityRequired,
    engagementEffortRequired,
    setEngagementEffortRequired,
    interactivityRequired,
    setInteractivityRequired,
    persuasionNeeded,
    setPersuasionNeeded,
    trustBuildingRequired,
    setTrustBuildingRequired,
    engagementDepth,
    setEngagementDepth,
    interactivityLevel,
    setInteractivityLevel,
    customizationNeed,
    setCustomizationNeed,
    deliverablesSelected,
    setDeliverablesSelected,
    deliverableDetailsActiveId,
    setDeliverableDetailsActiveId,
    deliverableDetailsById,
    setDeliverableDetailsById,
    followUpSupportRequired,
    setFollowUpSupportRequired,
    engagementTypeSelected,
    setEngagementTypeSelected,
    interactionIntensity,
    setInteractionIntensity,
    facilitationComplexity,
    setFacilitationComplexity,
    outcomeOrientation,
    setOutcomeOrientation,
    continuityRequired,
    setContinuityRequired,
    expertTypeRequired,
    setExpertTypeRequired,
    deliveryModeSelected,
    setDeliveryModeSelected,
    roomSeatingStyle,
    setRoomSeatingStyle,
    avSetupRequired,
    setAvSetupRequired,
    deliveryTechnologyDependency,
    setDeliveryTechnologyDependency,
    deliveryEngagementDropRisk,
    setDeliveryEngagementDropRisk,
    deliveryPlatform,
    setDeliveryPlatform,
    breakoutRoomsNeeded,
    setBreakoutRoomsNeeded,
    recordingRequired,
    setRecordingRequired,
    totalDurationMinutes,
    setTotalDurationMinutes,
    fatigueRisk,
    setFatigueRisk,
    pacingRequirement,
    setPacingRequirement,
    depthPossible,
    setDepthPossible,
    breaksRequired,
    setBreaksRequired,
    totalSessions,
    setTotalSessions,
    sessionPattern,
    setSessionPattern,
    continuityLevel,
    setContinuityLevel,
    multiSessionReinforcementRequired,
    setMultiSessionReinforcementRequired,
    schedulingComplexity,
    setSchedulingComplexity,
    dependencyBetweenSessions,
    setDependencyBetweenSessions,
    preferredStartDate,
    setPreferredStartDate,
    preferredEndDate,
    setPreferredEndDate,
    flexibilityLevel,
    setFlexibilityLevel,
    urgencyLevel,
    setUrgencyLevel,
    city,
    setCity,
    state,
    setState,
    country,
    setCountry,
    venueType,
    setVenueType,
    venueDetails,
    setVenueDetails,
    preferredTimeSlots,
    setPreferredTimeSlots,
    blackoutDates,
    setBlackoutDates,
    dailyTimeWindow,
    setDailyTimeWindow,
    timezone,
    setTimezone,
    schedulingRestrictions,
    setSchedulingRestrictions,
    preparationTimeSelected,
    setPreparationTimeSelected,
    schedulingFlexibility,
    setSchedulingFlexibility,
    coordinationComplexity,
    setCoordinationComplexity,
    conflictProbability,
    setConflictProbability,
    levelSliderBg,
    percentSliderBg,
    durationCategory,
    toggleSecondary,
    inputClass,
    labelClass,
  }
}

export type CreateRequirementForm = ReturnType<typeof useCreateRequirementForm>
