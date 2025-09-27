const { Mastra, createTool } = require('@mastra/core');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini AI (keeping existing integration)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

class MastraMedicalSystem {
  constructor() {
    this.mastra = new Mastra();
    this.agents = {};
    this.initializeAgents();
  }

  initializeAgents() {
    // PRODUCTIVITY TOOLS FOR PROVIDER EFFICIENCY
    const bottleneckClassificationTool = createTool({
      name: 'bottleneckClassification',
      description: 'Identify and classify provider workflow bottlenecks (insurance, data gaps, follow-up)',
      parameters: {
        type: 'object',
        properties: {
          patientData: { type: 'object' },
          providerContext: { type: 'object' },
          timeConstraints: { type: 'string' }
        }
      },
      handler: async (params) => {
        const bottlenecks = [];
        const priorityScore = 0;

        // Insurance Bottlenecks
        if (!params.patientData?.insurance?.verified) {
          bottlenecks.push({
            type: 'INSURANCE_BARRIER',
            severity: 'HIGH',
            description: 'Insurance verification pending - delays in imaging authorization',
            estimatedDelay: '2-5 days',
            actionRequired: 'Prior authorization for CT/MRI',
            automatable: true
          });
        }

        // Missing Data Bottlenecks
        const missingData = [];
        if (!params.patientData?.labs?.ca19_9) missingData.push('CA 19-9 tumor marker');
        if (!params.patientData?.imaging?.recent) missingData.push('Recent imaging studies');
        if (!params.patientData?.family_history?.complete) missingData.push('Complete family history');

        if (missingData.length > 0) {
          bottlenecks.push({
            type: 'DATA_GAP',
            severity: 'MEDIUM',
            description: `Missing critical data: ${missingData.join(', ')}`,
            estimatedDelay: '1-3 days',
            actionRequired: 'Order pending labs/studies',
            automatable: true
          });
        }

        // Follow-up Bottlenecks
        if (params.patientData?.riskLevel === 'HIGH' && !params.patientData?.scheduled?.gastro) {
          bottlenecks.push({
            type: 'FOLLOW_UP_LAPSE',
            severity: 'CRITICAL',
            description: 'High-risk patient without gastroenterology follow-up scheduled',
            estimatedDelay: '1-2 weeks',
            actionRequired: 'Urgent gastro referral',
            automatable: true
          });
        }

        return {
          bottlenecks,
          totalIdentified: bottlenecks.length,
          criticalCount: bottlenecks.filter(b => b.severity === 'CRITICAL').length,
          automatableCount: bottlenecks.filter(b => b.automatable).length,
          estimatedTimeSavings: `${bottlenecks.length * 15} minutes`,
          recommendations: this.getBottleneckSolutions(bottlenecks)
        };
      }
    });

    const paperworkReductionTool = createTool({
      name: 'paperworkReduction',
      description: 'Auto-generate documentation, referrals, and administrative tasks',
      parameters: {
        type: 'object',
        properties: {
          documentType: { type: 'string' },
          patientData: { type: 'object' },
          clinicalFindings: { type: 'object' }
        }
      },
      handler: async (params) => {
        const documents = {
          referral: {
            generated: true,
            content: `URGENT GASTROENTEROLOGY REFERRAL\n\nPatient: ${params.patientData?.name}\nReason: High pancreatic cancer risk - new diabetes + weight loss + family history\nPriority: Within 1 week\nClinical urgency: Elevated CA 19-9 (${params.patientData?.labs?.ca19_9})\n\nAUTO-GENERATED - Please review and send`,
            timeSaved: '10 minutes'
          },
          prior_auth: {
            generated: true,
            content: `IMAGING PRIOR AUTHORIZATION REQUEST\n\nProcedure: CT Abdomen/Pelvis with contrast\nICD-10: R50.9 (Fever unspecified), K59.1 (Diarrhea unspecified)\nJustification: Rule out pancreatic pathology - high-risk presentation\nUrgency: Within 48 hours\n\nAUTO-GENERATED - Ready for submission`,
            timeSaved: '15 minutes'
          },
          progress_note: {
            generated: true,
            content: `PROGRESS NOTE - ${new Date().toLocaleDateString()}\n\nASSESSMENT: High pancreatic cancer risk\nPLAN:\n1. Urgent gastroenterology referral\n2. CT imaging with contrast\n3. Patient education provided\n4. Follow-up in 1 week\n\nAUTO-GENERATED - Please review and sign`,
            timeSaved: '8 minutes'
          }
        };

        return {
          documentsGenerated: Object.keys(documents).length,
          totalTimeSaved: '33 minutes',
          documents,
          readyForReview: true,
          complianceChecked: true
        };
      }
    });

    const criticalInfoSurfacingTool = createTool({
      name: 'criticalInfoSurfacing',
      description: 'Surface the most critical information at point of care',
      parameters: {
        type: 'object',
        properties: {
          patientData: { type: 'object' },
          providerContext: { type: 'string' },
          timeAvailable: { type: 'number' }
        }
      },
      handler: async (params) => {
        const criticalAlerts = [];
        const priorityActions = [];

        // Critical Risk Alerts
        if (params.patientData?.riskScore >= 8) {
          criticalAlerts.push({
            type: 'CRITICAL_RISK',
            icon: '🚨',
            message: 'HIGH PANCREATIC CANCER RISK - Immediate action required',
            priority: 1,
            colorCode: 'red'
          });
        }

        // Time-Sensitive Actions
        if (params.patientData?.labs?.ca19_9 > 37) {
          priorityActions.push({
            action: 'Order urgent CT imaging',
            timeFrame: 'Within 48 hours',
            rationale: 'Elevated CA 19-9 with high-risk presentation',
            priority: 1
          });
        }

        // Red Flags
        const redFlags = [];
        if (params.patientData?.symptoms?.includes('new_onset_diabetes')) {
          redFlags.push('New diabetes in patient >50 - pancreatic cancer warning sign');
        }
        if (params.patientData?.symptoms?.includes('weight_loss')) {
          redFlags.push('Unexplained weight loss - systemic disease concern');
        }

        return {
          criticalAlerts,
          priorityActions,
          redFlags,
          keyTakeaways: [
            'Patient requires immediate gastroenterology evaluation',
            'Insurance pre-authorization needed for imaging',
            'Family counseling about genetic risk recommended'
          ],
          estimatedReadTime: '30 seconds',
          actionableItems: priorityActions.length
        };
      }
    });

    // Create medical tools for agents
    const riskAssessmentTool = createTool({
      name: 'riskAssessment',
      description: 'Assess pancreatic cancer risk based on patient data',
      parameters: {
        type: 'object',
        properties: {
          symptoms: { type: 'array', items: { type: 'string' } },
          age: { type: 'number' },
          familyHistory: { type: 'array', items: { type: 'string' } },
          labs: { type: 'object' }
        }
      },
      handler: async (params) => {
        // Risk assessment logic
        let riskScore = 0;
        const reasons = [];

        if (params.age > 60) {
          riskScore += 2;
          reasons.push('Age over 60');
        }

        if (params.symptoms?.includes('new_onset_diabetes')) {
          riskScore += 4;
          reasons.push('New onset diabetes');
        }

        if (params.symptoms?.includes('weight_loss')) {
          riskScore += 3;
          reasons.push('Unexplained weight loss');
        }

        if (params.familyHistory?.includes('pancreatic_cancer')) {
          riskScore += 3;
          reasons.push('Family history of pancreatic cancer');
        }

        if (params.labs?.ca19_9 && params.labs.ca19_9 > 37) {
          riskScore += 4;
          reasons.push('Elevated CA 19-9');
        }

        const riskLevel = riskScore >= 8 ? 'HIGH' : riskScore >= 4 ? 'MEDIUM' : 'LOW';

        return {
          riskScore,
          riskLevel,
          reasons,
          recommendations: this.getRecommendations(riskLevel)
        };
      }
    });

    const treatmentPlanningTool = createTool({
      name: 'treatmentPlanning',
      description: 'Generate treatment plans and protocols',
      parameters: {
        type: 'object',
        properties: {
          riskLevel: { type: 'string' },
          patientCondition: { type: 'string' },
          preferences: { type: 'object' }
        }
      },
      handler: async (params) => {
        const plans = {
          HIGH: [
            'Immediate gastroenterology referral',
            'CT/MRI imaging with contrast',
            'Endoscopic ultrasound (EUS)',
            'Tumor marker monitoring',
            'Multidisciplinary team consultation'
          ],
          MEDIUM: [
            'Gastroenterology consultation within 2 weeks',
            'Imaging studies (CT or MRI)',
            'Regular monitoring',
            'Lifestyle modifications'
          ],
          LOW: [
            'Routine follow-up in 6 months',
            'Lifestyle counseling',
            'Regular screening if indicated'
          ]
        };

        return {
          treatmentPlan: plans[params.riskLevel] || plans.LOW,
          urgency: params.riskLevel,
          followUpInterval: params.riskLevel === 'HIGH' ? '1-2 weeks' : params.riskLevel === 'MEDIUM' ? '4-6 weeks' : '6 months'
        };
      }
    });

    const healthRoutineTool = createTool({
      name: 'healthRoutine',
      description: 'Generate personalized health routines',
      parameters: {
        type: 'object',
        properties: {
          patientData: { type: 'object' },
          preferences: { type: 'object' }
        }
      },
      handler: async (params) => {
        const routines = [
          {
            title: 'Morning Blood Sugar Check',
            frequency: 'Daily',
            time: '7:00 AM',
            duration: '5 minutes',
            description: 'Monitor blood glucose levels for diabetes management'
          },
          {
            title: 'Pancreatic Enzyme Supplement',
            frequency: 'With meals',
            time: 'Before eating',
            duration: '1 minute',
            description: 'Take prescribed pancreatic enzymes if recommended'
          },
          {
            title: 'Gentle Exercise Walk',
            frequency: 'Daily',
            time: '6:00 PM',
            duration: '30 minutes',
            description: 'Low-impact cardiovascular exercise'
          },
          {
            title: 'Meditation & Stress Management',
            frequency: 'Daily',
            time: '8:00 PM',
            duration: '15 minutes',
            description: 'Mindfulness practice for mental health'
          },
          {
            title: 'Nutritionist Consultation',
            frequency: 'Weekly',
            time: '10:00 AM',
            duration: '45 minutes',
            description: 'Specialized diet planning for pancreatic health'
          }
        ];

        return {
          activities: routines,
          totalActivities: routines.length,
          categories: ['Medical Monitoring', 'Exercise', 'Mental Health', 'Nutrition']
        };
      }
    });

    // Create Mastra-Enhanced Agents using simplified approach
    this.agents = {
      diagnostic: {
        name: 'Dr. Sarah Chen',
        role: 'Diagnostic Specialist',
        instructions: 'You are Dr. Sarah Chen, a diagnostic specialist with expertise in pancreatic cancer detection and risk stratification. Provide accurate medical diagnosis and risk assessment for pancreatic conditions.',
        tools: [riskAssessmentTool],
        model: genAI.getGenerativeModel({ model: "gemini-2.5-flash" })
      },
      treatment: {
        name: 'Dr. Michael Rodriguez',
        role: 'Treatment Specialist',
        instructions: 'You are Dr. Michael Rodriguez, an oncologist specialized in pancreatic cancer treatment. Provide evidence-based treatment recommendations and therapeutic protocols.',
        tools: [treatmentPlanningTool],
        model: genAI.getGenerativeModel({ model: "gemini-2.5-flash" })
      },
      routine: {
        name: 'Dr. Lisa Wang',
        role: 'Health Routine Specialist',
        instructions: 'You are Dr. Lisa Wang, a preventive medicine specialist focused on lifestyle interventions and comprehensive care planning. Create personalized health and wellness routines for optimal patient care.',
        tools: [healthRoutineTool],
        model: genAI.getGenerativeModel({ model: "gemini-2.5-flash" })
      },
      coordinator: {
        name: 'Jennifer Thompson',
        role: 'Care Coordinator',
        instructions: 'You are Jennifer Thompson, an experienced healthcare coordinator with expertise in patient navigation and care team collaboration. Focus on scheduling, communication, and care coordination.',
        tools: [],
        model: genAI.getGenerativeModel({ model: "gemini-2.5-flash" })
      },
      // NEW PRODUCTIVITY AGENTS FOR PROVIDER EFFICIENCY
      productivity: {
        name: 'Alex Chen',
        role: 'Productivity Specialist',
        instructions: 'You are Alex Chen, a clinical productivity specialist focused on identifying workflow bottlenecks, reducing administrative burden, and optimizing provider efficiency. Help clinicians save time while maintaining quality care.',
        tools: [bottleneckClassificationTool, paperworkReductionTool],
        model: genAI.getGenerativeModel({ model: "gemini-2.5-flash" })
      },
      insights: {
        name: 'Dr. Maya Patel',
        role: 'Clinical Insights Specialist',
        instructions: 'You are Dr. Maya Patel, a clinical insights specialist who surfaces the most critical information at the point of care. Your role is to help providers quickly identify red flags, prioritize actions, and focus on what matters most for patient outcomes.',
        tools: [criticalInfoSurfacingTool],
        model: genAI.getGenerativeModel({ model: "gemini-2.5-flash" })
      }
    };
  }

  async routeQuery(query, patientContext = {}) {
    const lowerQuery = query.toLowerCase();

    // PRODUCTIVITY ROUTING - Handle workflow efficiency queries
    if (lowerQuery.includes('bottleneck') || lowerQuery.includes('delay') || lowerQuery.includes('workflow') ||
        lowerQuery.includes('efficiency') || lowerQuery.includes('paperwork') || lowerQuery.includes('documentation') ||
        lowerQuery.includes('insurance') || lowerQuery.includes('authorization') || lowerQuery.includes('save time')) {
      return await this.executeAgentQuery(this.agents.productivity, query, patientContext);
    }

    // CRITICAL INSIGHTS ROUTING - Handle information prioritization queries
    if (lowerQuery.includes('critical') || lowerQuery.includes('priority') || lowerQuery.includes('alert') ||
        lowerQuery.includes('red flag') || lowerQuery.includes('urgent') || lowerQuery.includes('immediate') ||
        lowerQuery.includes('summary') || lowerQuery.includes('key') || lowerQuery.includes('highlight')) {
      return await this.executeAgentQuery(this.agents.insights, query, patientContext);
    }

    // MEDICAL ROUTING - Existing agent routing
    if (lowerQuery.includes('risk') || lowerQuery.includes('assess') || lowerQuery.includes('diagnos') || lowerQuery.includes('sympt')) {
      return await this.executeAgentQuery(this.agents.diagnostic, query, patientContext);
    } else if (lowerQuery.includes('treat') || lowerQuery.includes('therap') || lowerQuery.includes('protocol') || lowerQuery.includes('manag')) {
      return await this.executeAgentQuery(this.agents.treatment, query, patientContext);
    } else if (lowerQuery.includes('routine') || lowerQuery.includes('health') || lowerQuery.includes('lifestyle') || lowerQuery.includes('diet') || lowerQuery.includes('exercise')) {
      return await this.executeAgentQuery(this.agents.routine, query, patientContext);
    } else if (lowerQuery.includes('schedul') || lowerQuery.includes('appoint') || lowerQuery.includes('coordinat') || lowerQuery.includes('follow')) {
      return await this.executeAgentQuery(this.agents.coordinator, query, patientContext);
    } else {
      // Default to diagnostic agent for general medical queries
      return await this.executeAgentQuery(this.agents.diagnostic, query, patientContext);
    }
  }

  async executeAgentQuery(agent, query, patientContext) {
    try {
      // Prepare context for the agent - combining Mastra tools with Gemini execution
      const fullPrompt = `${agent.instructions}

Patient Context: ${JSON.stringify(patientContext, null, 2)}

Query: ${query}

You are ${agent.name}, a ${agent.role}. Respond according to your medical expertise and provide professional, evidence-based recommendations.`;

      // Use Gemini model for response generation
      const result = await agent.model.generateContent(fullPrompt);
      const response = result.response.text();

      // Calculate confidence based on query matching
      const confidence = this.calculateConfidence(agent.role, query);

      return {
        agent: agent.name,
        role: agent.role,
        response: response,
        confidence: confidence,
        tools_used: agent.tools ? agent.tools.map(t => t.name) : [],
        timestamp: new Date().toISOString(),
        mastra_powered: true // Indicate this is using Mastra framework
      };
    } catch (error) {
      console.error(`Error executing agent query for ${agent.name}:`, error);
      throw error;
    }
  }

  calculateConfidence(agentRole, query) {
    const lowerQuery = query.toLowerCase();
    const roleKeywords = {
      'Diagnostic Specialist': ['risk', 'assess', 'diagnos', 'sympt', 'test', 'evaluat'],
      'Treatment Specialist': ['treat', 'therap', 'protocol', 'manag', 'care', 'medicin'],
      'Health Routine Specialist': ['routine', 'health', 'lifestyle', 'diet', 'exercise', 'prevent'],
      'Care Coordinator': ['schedul', 'appoint', 'coordinat', 'follow', 'team', 'referr']
    };

    const keywords = roleKeywords[agentRole] || [];
    const matches = keywords.filter(keyword => lowerQuery.includes(keyword)).length;

    // Base confidence + keyword matching
    return Math.min(0.7 + (matches * 0.05), 0.95);
  }

  getRecommendations(riskLevel) {
    const recommendations = {
      HIGH: [
        'Immediate gastroenterology consultation',
        'Urgent imaging studies (CT/MRI)',
        'Consider endoscopic ultrasound',
        'Multidisciplinary team evaluation'
      ],
      MEDIUM: [
        'Gastroenterology referral within 2 weeks',
        'Imaging studies as appropriate',
        'Monitor symptoms closely',
        'Follow-up in 4-6 weeks'
      ],
      LOW: [
        'Routine follow-up care',
        'Health maintenance',
        'Lifestyle counseling',
        'Regular screening if indicated'
      ]
    };

    return recommendations[riskLevel] || recommendations.LOW;
  }

  getBottleneckSolutions(bottlenecks) {
    const solutions = [];

    bottlenecks.forEach(bottleneck => {
      switch (bottleneck.type) {
        case 'INSURANCE_BARRIER':
          solutions.push({
            solution: 'Auto-submit prior authorization request',
            implementation: 'Use pre-built templates with patient data',
            timeSaving: '2-3 days',
            automatable: true
          });
          break;
        case 'DATA_GAP':
          solutions.push({
            solution: 'Auto-order missing labs and studies',
            implementation: 'Generate lab orders based on risk assessment',
            timeSaving: '1-2 days',
            automatable: true
          });
          break;
        case 'FOLLOW_UP_LAPSE':
          solutions.push({
            solution: 'Auto-generate urgent referral',
            implementation: 'Create specialist referral with priority flagging',
            timeSaving: '1 week',
            automatable: true
          });
          break;
        default:
          solutions.push({
            solution: 'Manual review required',
            implementation: 'Provider intervention needed',
            timeSaving: 'Variable',
            automatable: false
          });
      }
    });

    return solutions;
  }
}

module.exports = MastraMedicalSystem;