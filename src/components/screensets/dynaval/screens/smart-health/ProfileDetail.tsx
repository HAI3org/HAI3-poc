import React, { useState } from 'react';
import { Calendar, Pill, Activity, Heart, AlertTriangle, Stethoscope, Brain, MessageSquare, Save, Edit3, Trash2, FileText, Target, Plus, User, ArrowLeft } from 'lucide-react';

interface HealthProfile {
  id: string;
  name: string;
  age: number;
  weight: number;
  height: number;
  gender: 'male' | 'female' | 'child';
  bloodType?: string;
  allergies: string[];
  createdAt: Date;
  updatedAt: Date;
}

interface TestResult {
  id: string;
  profileId: string;
  testName: string;
  value: string;
  unit: string;
  referenceRange: string;
  date: Date;
  notes?: string;
}

interface Medication {
  id: string;
  profileId: string;
  name: string;
  dosage: string;
  frequency: string;
  startDate: Date;
  endDate?: Date;
  notes?: string;
}

interface Symptom {
  id: string;
  profileId: string;
  bodyPart: string;
  description: string;
  severity: 1 | 2 | 3 | 4 | 5;
  date: Date;
  notes?: string;
}

interface AIAgent {
  id: string;
  name: string;
  specialty: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
}

interface ProfileDetailProps {
  profile: HealthProfile;
  testResults: TestResult[];
  medications: Medication[];
  symptoms: Symptom[];
  onBack: () => void;
  onBodyDiagram: () => void;
  onAIConsultation: () => void;
  onAddTest: (test: Omit<TestResult, 'id' | 'profileId'>) => void;
  onAddMedication: (med: Omit<Medication, 'id' | 'profileId'>) => void;
}

const healthAgents: AIAgent[] = [
  {
    id: 'general-health',
    name: 'HealthGPT',
    specialty: 'General Health',
    description: 'General health assessment and wellness advice',
    icon: Heart,
    color: 'red'
  },
  {
    id: 'diagnostic-ai',
    name: 'DiagnosticAI',
    specialty: 'Symptom Analysis',
    description: 'Symptom analysis and preliminary assessment',
    icon: Stethoscope,
    color: 'blue'
  },
  {
    id: 'med-advisor',
    name: 'MedAdvisor',
    specialty: 'Medication Review',
    description: 'Medication interactions and side effects',
    icon: Pill,
    color: 'green'
  },
  {
    id: 'wellness-coach',
    name: 'WellnessCoach',
    specialty: 'Lifestyle & Prevention',
    description: 'Lifestyle recommendations and prevention strategies',
    icon: Activity,
    color: 'purple'
  }
];

export const ProfileDetail: React.FC<ProfileDetailProps> = ({
  profile,
  testResults,
  medications,
  symptoms,
  onBack,
  onBodyDiagram,
  onAIConsultation,
  onAddTest,
  onAddMedication
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'tests' | 'medications' | 'symptoms'>('overview');
  const [showTestModal, setShowTestModal] = useState(false);
  const [showMedModal, setShowMedModal] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);

  const profileTests = testResults.filter(test => test.profileId === profile.id);
  const profileMeds = medications.filter(med => med.profileId === profile.id);
  const profileSymptoms = symptoms.filter(symptom => symptom.profileId === profile.id);

  const calculateBMI = () => {
    const heightInM = profile.height / 100;
    return (profile.weight / (heightInM * heightInM)).toFixed(1);
  };

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { category: 'Underweight', color: 'text-blue-600' };
    if (bmi < 25) return { category: 'Normal', color: 'text-green-600' };
    if (bmi < 30) return { category: 'Overweight', color: 'text-yellow-600' };
    return { category: 'Obese', color: 'text-red-600' };
  };

  const getAIHealthAssessment = async (agentId: string) => {
    setSelectedAgent(agentId);
    
    // Simulate AI thinking
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const responses = {
      'general-health': `Based on ${profile.name}'s profile (Age: ${profile.age}, BMI: ${calculateBMI()}), overall health appears stable. Recent symptoms and test results suggest monitoring is needed. I recommend regular exercise, balanced nutrition, and adequate sleep. Key areas to watch: ${profileSymptoms.length > 0 ? 'recent symptoms reported' : 'no current symptoms'}, ${profileMeds.length > 0 ? 'medication adherence' : 'no current medications'}. Please consult healthcare provider for comprehensive evaluation.`,
      
      'diagnostic-ai': `Symptom Analysis for ${profile.name}: ${profileSymptoms.length > 0 ? `Analyzing ${profileSymptoms.length} reported symptoms. Most recent: ${profileSymptoms[0]?.description || 'None'}. Severity patterns suggest ${profileSymptoms.some(s => s.severity >= 4) ? 'immediate medical attention recommended' : 'monitoring with routine care'}. Consider differential diagnosis including common conditions for age group ${profile.age}.` : 'No current symptoms reported. Recommend establishing baseline health metrics and routine screening appropriate for age group.'}`,
      
      'med-advisor': `Medication Review for ${profile.name}: ${profileMeds.length > 0 ? `Currently tracking ${profileMeds.length} medications. Checking for interactions and adherence patterns. Recent additions may require monitoring for side effects. Timing optimization could improve effectiveness.` : 'No current medications recorded. If taking any medications, please add them for comprehensive review.'} Consider discussing with pharmacist about optimal timing and potential interactions.`,
      
      'wellness-coach': `Wellness Plan for ${profile.name}: Age ${profile.age}, BMI ${calculateBMI()} (${getBMICategory(parseFloat(calculateBMI())).category}). Recommendations: 1) Physical activity: 150min moderate exercise weekly, 2) Nutrition: Mediterranean diet pattern, 3) Sleep: 7-9 hours nightly, 4) Stress management: mindfulness practices, 5) Preventive care: age-appropriate screenings. ${profile.allergies.length > 0 ? `Note allergies: ${profile.allergies.join(', ')}` : ''}`
    };

    setAiResponse(responses[agentId as keyof typeof responses]);
    setSelectedAgent(null);
  };

  const renderMedicalDisclaimer = () => (
    <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 mb-6">
      <div className="flex items-start gap-3">
        <AlertTriangle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="font-bold text-red-800 mb-1">⚠️ MEDICAL DISCLAIMER</h3>
          <p className="text-red-700 text-sm">
            <strong>AI IS NOT A DOCTOR.</strong> This provides general information only. 
            Always consult qualified healthcare providers for medical advice.
          </p>
        </div>
      </div>
    </div>
  );

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Profile Stats */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <User size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Age</p>
              <p className="text-lg font-semibold text-gray-900">{profile.age} years</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <Activity size={20} className="text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">BMI</p>
              <p className={`text-lg font-semibold ${getBMICategory(parseFloat(calculateBMI())).color}`}>
                {calculateBMI()}
              </p>
              <p className="text-xs text-gray-500">{getBMICategory(parseFloat(calculateBMI())).category}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <FileText size={20} className="text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Test Results</p>
              <p className="text-lg font-semibold text-gray-900">{profileTests.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
              <Pill size={20} className="text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Medications</p>
              <p className="text-lg font-semibold text-gray-900">{profileMeds.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
          <button
            onClick={onBodyDiagram}
            className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors"
          >
            <Target size={16} />
            Add Symptoms
          </button>
          <button
            onClick={() => setShowTestModal(true)}
            className="flex items-center gap-2 p-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <FileText size={16} />
            Add Test Result
          </button>
          <button
            onClick={() => setShowMedModal(true)}
            className="flex items-center gap-2 p-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
          >
            <Pill size={16} />
            Add Medication
          </button>
          <button
            onClick={onAIConsultation}
            className="flex items-center gap-2 p-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors"
          >
            <Brain size={16} />
            AI Consultation
          </button>
        </div>
      </div>

      {/* AI Health Agents */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">AI Health Assessment</h3>
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          {healthAgents.map(agent => {
            const IconComponent = agent.icon;
            return (
              <button
                key={agent.id}
                onClick={() => getAIHealthAssessment(agent.id)}
                disabled={selectedAgent === agent.id}
                className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left disabled:opacity-50"
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  agent.color === 'red' ? 'bg-red-100' :
                  agent.color === 'blue' ? 'bg-blue-100' :
                  agent.color === 'green' ? 'bg-green-100' :
                  'bg-purple-100'
                }`}>
                  <IconComponent size={20} className={`${
                    agent.color === 'red' ? 'text-red-600' :
                    agent.color === 'blue' ? 'text-blue-600' :
                    agent.color === 'green' ? 'text-green-600' :
                    'text-purple-600'
                  }`} />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{agent.name}</h4>
                  <p className="text-sm text-gray-600">{agent.specialty}</p>
                  <p className="text-xs text-gray-500 mt-1">{agent.description}</p>
                </div>
                {selectedAgent === agent.id && (
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {aiResponse && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">AI Assessment</h4>
            <p className="text-blue-800 text-sm leading-relaxed">{aiResponse}</p>
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {profileSymptoms.slice(0, 3).map(symptom => (
            <div key={symptom.id} className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
              <AlertTriangle size={16} className="text-red-600" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{symptom.bodyPart}: {symptom.description}</p>
                <p className="text-xs text-gray-500">Severity: {symptom.severity}/5 • {new Date(symptom.date).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
          
          {profileTests.slice(0, 2).map(test => (
            <div key={test.id} className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
              <FileText size={16} className="text-blue-600" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{test.testName}: {test.value} {test.unit}</p>
                <p className="text-xs text-gray-500">Reference: {test.referenceRange} • {new Date(test.date).toLocaleDateString()}</p>
              </div>
            </div>
          ))}

          {profileMeds.slice(0, 2).map(med => (
            <div key={med.id} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <Pill size={16} className="text-green-600" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{med.name} - {med.dosage}</p>
                <p className="text-xs text-gray-500">{med.frequency} • Started {new Date(med.startDate).toLocaleDateString()}</p>
              </div>
            </div>
          ))}

          {profileSymptoms.length === 0 && profileTests.length === 0 && profileMeds.length === 0 && (
            <p className="text-gray-500 text-center py-4">No recent activity. Start by adding symptoms, test results, or medications.</p>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6">
      {renderMedicalDisclaimer()}
      
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} className="text-gray-600" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{profile.name}</h1>
          <p className="text-gray-600">{profile.age} years • {profile.gender} • BMI: {calculateBMI()}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
        {[
          { key: 'overview', label: 'Overview', icon: User },
          { key: 'tests', label: 'Test Results', icon: FileText },
          { key: 'medications', label: 'Medications', icon: Pill },
          { key: 'symptoms', label: 'Symptoms', icon: AlertTriangle }
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === key
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'overview' && renderOverview()}
      
      {/* Add modals and other tab content here */}
    </div>
  );
};
