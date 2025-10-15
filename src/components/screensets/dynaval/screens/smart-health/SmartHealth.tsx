import React, { useState, useEffect } from 'react';
import { Plus, User, Calendar, Pill, Activity, Heart, AlertTriangle, Stethoscope, Brain, MessageSquare, Save, Edit3, Trash2, FileText, Target, ArrowLeft } from 'lucide-react';

interface HealthProfile {
  id: string;
  name: string;
  age: number;
  weight: number; // kg
  height: number; // cm
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

// Available AI health agents
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

// Body parts for symptom tracking
const bodyParts = {
  head: { name: 'Head', x: 50, y: 12 },
  neck: { name: 'Neck', x: 50, y: 20 },
  'left-shoulder': { name: 'Left Shoulder', x: 35, y: 28 },
  'right-shoulder': { name: 'Right Shoulder', x: 65, y: 28 },
  chest: { name: 'Chest', x: 50, y: 35 },
  'left-arm': { name: 'Left Arm', x: 25, y: 40 },
  'right-arm': { name: 'Right Arm', x: 75, y: 40 },
  'left-elbow': { name: 'Left Elbow', x: 20, y: 50 },
  'right-elbow': { name: 'Right Elbow', x: 80, y: 50 },
  abdomen: { name: 'Abdomen', x: 50, y: 50 },
  'lower-back': { name: 'Lower Back', x: 50, y: 55 },
  'left-hip': { name: 'Left Hip', x: 40, y: 60 },
  'right-hip': { name: 'Right Hip', x: 60, y: 60 },
  'left-thigh': { name: 'Left Thigh', x: 40, y: 70 },
  'right-thigh': { name: 'Right Thigh', x: 60, y: 70 },
  'left-knee': { name: 'Left Knee', x: 40, y: 80 },
  'right-knee': { name: 'Right Knee', x: 60, y: 80 },
  'left-calf': { name: 'Left Calf', x: 40, y: 88 },
  'right-calf': { name: 'Right Calf', x: 60, y: 88 },
  'left-foot': { name: 'Left Foot', x: 40, y: 95 },
  'right-foot': { name: 'Right Foot', x: 60, y: 95 }
};

export const SmartHealth: React.FC = () => {
  const [currentView, setCurrentView] = useState<'profiles' | 'profile-detail' | 'body-diagram' | 'ai-consultation'>('profiles');
  const [profiles, setProfiles] = useState<HealthProfile[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<HealthProfile | null>(null);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [symptoms, setSymptoms] = useState<Symptom[]>([]);
  const [showNewProfileModal, setShowNewProfileModal] = useState(false);
  const [selectedBodyPart, setSelectedBodyPart] = useState<string | null>(null);
  const [newSymptom, setNewSymptom] = useState({ description: '', severity: 3 as 1 | 2 | 3 | 4 | 5, notes: '' });

  // Load data from localStorage
  useEffect(() => {
    const savedProfiles = localStorage.getItem('smart-health-profiles');
    const savedTests = localStorage.getItem('smart-health-tests');
    const savedMeds = localStorage.getItem('smart-health-medications');
    const savedSymptoms = localStorage.getItem('smart-health-symptoms');

    if (savedProfiles) setProfiles(JSON.parse(savedProfiles));
    if (savedTests) setTestResults(JSON.parse(savedTests));
    if (savedMeds) setMedications(JSON.parse(savedMeds));
    if (savedSymptoms) setSymptoms(JSON.parse(savedSymptoms));
  }, []);

  // Save data to localStorage
  const saveData = () => {
    localStorage.setItem('smart-health-profiles', JSON.stringify(profiles));
    localStorage.setItem('smart-health-tests', JSON.stringify(testResults));
    localStorage.setItem('smart-health-medications', JSON.stringify(medications));
    localStorage.setItem('smart-health-symptoms', JSON.stringify(symptoms));
  };

  useEffect(() => {
    saveData();
  }, [profiles, testResults, medications, symptoms]);

  const createProfile = (profileData: Omit<HealthProfile, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newProfile: HealthProfile = {
      ...profileData,
      id: `profile-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setProfiles(prev => [...prev, newProfile]);
    setShowNewProfileModal(false);
  };

  const addSymptom = () => {
    if (!selectedProfile || !selectedBodyPart || !newSymptom.description) return;

    const symptom: Symptom = {
      id: `symptom-${Date.now()}`,
      profileId: selectedProfile.id,
      bodyPart: selectedBodyPart,
      description: newSymptom.description,
      severity: newSymptom.severity,
      date: new Date(),
      notes: newSymptom.notes
    };

    setSymptoms(prev => [...prev, symptom]);
    setNewSymptom({ description: '', severity: 3, notes: '' });
    setSelectedBodyPart(null);
  };

  const getAIHealthAssessment = async (agentId: string, query: string) => {
    // Simulate AI response based on agent specialty
    const responses = {
      'general-health': `Based on your profile and symptoms, I recommend focusing on overall wellness. Your BMI appears to be in a normal range. The symptoms you've described could be related to stress or lifestyle factors. Consider regular exercise, adequate sleep, and a balanced diet. However, please consult with a healthcare provider for proper evaluation.`,
      'diagnostic-ai': `Analyzing your symptoms: The combination of symptoms you've reported could indicate several possibilities including viral infection, stress-related issues, or minor inflammatory conditions. The severity and duration of symptoms are important factors. I strongly recommend scheduling an appointment with a primary care physician for proper examination and potential diagnostic tests.`,
      'med-advisor': `Reviewing your current medications: I notice potential interactions between some of your medications. The timing of doses could be optimized for better effectiveness. Some side effects you're experiencing might be medication-related. Please discuss these findings with your pharmacist or prescribing physician before making any changes.`,
      'wellness-coach': `For optimal health maintenance: Based on your age and health profile, I recommend incorporating 150 minutes of moderate exercise weekly, maintaining a Mediterranean-style diet, and ensuring 7-9 hours of quality sleep. Regular health screenings appropriate for your age group should include annual check-ups and age-specific preventive care.`
    };

    return responses[agentId as keyof typeof responses] || "I'd be happy to help assess your health information. Please provide more specific details about your concerns.";
  };

  const renderMedicalDisclaimer = () => (
    <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 mb-6">
      <div className="flex items-start gap-3">
        <AlertTriangle size={24} className="text-red-600 flex-shrink-0 mt-1" />
        <div>
          <h3 className="text-lg font-bold text-red-800 mb-2">⚠️ IMPORTANT MEDICAL DISCLAIMER</h3>
          <p className="text-red-700 font-medium">
            <strong>AI IS NOT A DOCTOR.</strong> This application provides general health information and suggestions only. 
            It cannot replace professional medical advice, diagnosis, or treatment. Always consult with qualified healthcare 
            providers for specific medical concerns. In case of emergency, contact emergency services immediately.
          </p>
        </div>
      </div>
    </div>
  );

  const renderProfileDetail = () => {
    if (!selectedProfile) return null;

    const profileTests = testResults.filter(test => test.profileId === selectedProfile.id);
    const profileMeds = medications.filter(med => med.profileId === selectedProfile.id);
    const profileSymptoms = symptoms.filter(symptom => symptom.profileId === selectedProfile.id);

    return (
      <div className="p-6">
        {renderMedicalDisclaimer()}
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => setCurrentView('profiles')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">{selectedProfile.name}</h1>
            <p className="text-gray-600">
              {selectedProfile.age} years • {selectedProfile.gender} • 
              BMI: {(selectedProfile.weight / Math.pow(selectedProfile.height / 100, 2)).toFixed(1)}
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
            <button
              onClick={() => setCurrentView('body-diagram')}
              className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors"
            >
              <Target size={16} />
              Add Symptoms
            </button>
            <button
              onClick={() => setCurrentView('ai-consultation')}
              className="flex items-center gap-2 p-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors"
            >
              <Brain size={16} />
              AI Consultation
            </button>
            <button className="flex items-center gap-2 p-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors">
              <FileText size={16} />
              Add Test Result
            </button>
            <button className="flex items-center gap-2 p-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors">
              <Pill size={16} />
              Add Medication
            </button>
          </div>
        </div>

        {/* Profile Stats */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <User size={20} className="text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Age</p>
                <p className="text-lg font-semibold text-gray-900">{selectedProfile.age} years</p>
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
                <p className="text-lg font-semibold text-green-600">
                  {(selectedProfile.weight / Math.pow(selectedProfile.height / 100, 2)).toFixed(1)}
                </p>
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

        {/* Recent Symptoms */}
        {profileSymptoms.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <h3 className="font-semibold text-gray-900 mb-4">Recent Symptoms</h3>
            <div className="space-y-3">
              {profileSymptoms.slice(0, 5).map(symptom => (
                <div key={symptom.id} className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
                  <AlertTriangle size={16} className="text-red-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {symptom.bodyPart}: {symptom.description}
                    </p>
                    <p className="text-xs text-gray-500">
                      Severity: {symptom.severity}/5 • {new Date(symptom.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Profile Information */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Profile Information</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Height</p>
              <p className="font-medium text-gray-900">{selectedProfile.height} cm</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Weight</p>
              <p className="font-medium text-gray-900">{selectedProfile.weight} kg</p>
            </div>
            {selectedProfile.bloodType && (
              <div>
                <p className="text-sm text-gray-600">Blood Type</p>
                <p className="font-medium text-gray-900">{selectedProfile.bloodType}</p>
              </div>
            )}
            {selectedProfile.allergies.length > 0 && (
              <div>
                <p className="text-sm text-gray-600">Allergies</p>
                <p className="font-medium text-gray-900">{selectedProfile.allergies.join(', ')}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const [consultationSelectedAgent, setConsultationSelectedAgent] = useState<string | null>(null);
  const [consultationAiResponse, setConsultationAiResponse] = useState<string | null>(null);
  const [consultationIsThinking, setConsultationIsThinking] = useState(false);

  const renderAIConsultation = () => {

    const getAIHealthAssessment = async (agentId: string) => {
      setConsultationSelectedAgent(agentId);
      setConsultationIsThinking(true);
      
      // Simulate AI thinking
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const profileSymptoms = symptoms.filter(s => s.profileId === selectedProfile?.id);
      const profileMeds = medications.filter(m => m.profileId === selectedProfile?.id);
      
      const responses = {
        'general-health': `Based on ${selectedProfile?.name}'s profile (Age: ${selectedProfile?.age}, BMI: ${selectedProfile ? (selectedProfile.weight / Math.pow(selectedProfile.height / 100, 2)).toFixed(1) : 'N/A'}), overall health appears stable. ${profileSymptoms.length > 0 ? `Recent symptoms include ${profileSymptoms.length} reported issues.` : 'No current symptoms reported.'} I recommend regular exercise, balanced nutrition, and adequate sleep. Please consult healthcare provider for comprehensive evaluation.`,
        
        'diagnostic-ai': `Symptom Analysis: ${profileSymptoms.length > 0 ? `Analyzing ${profileSymptoms.length} reported symptoms. Most recent: ${profileSymptoms[0]?.description || 'None'}. Severity patterns suggest ${profileSymptoms.some(s => s.severity >= 4) ? 'immediate medical attention recommended' : 'monitoring with routine care'}.` : 'No current symptoms reported. Recommend establishing baseline health metrics.'} Consider consulting with appropriate specialists based on symptom patterns.`,
        
        'med-advisor': `Medication Review: ${profileMeds.length > 0 ? `Currently tracking ${profileMeds.length} medications. Please ensure proper timing and watch for potential interactions.` : 'No current medications recorded.'} Always consult with healthcare providers before making medication changes.`,
        
        'wellness-coach': `Wellness Plan: Age ${selectedProfile?.age}, BMI ${selectedProfile ? (selectedProfile.weight / Math.pow(selectedProfile.height / 100, 2)).toFixed(1) : 'N/A'}. Recommendations: 1) Physical activity: 150min moderate exercise weekly, 2) Nutrition: balanced diet, 3) Sleep: 7-9 hours nightly, 4) Stress management, 5) Regular check-ups.`
      };

      setConsultationAiResponse(responses[agentId as keyof typeof responses]);
      setConsultationIsThinking(false);
    };

    return (
      <div className="p-6">
        {renderMedicalDisclaimer()}
        
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => setCurrentView('profile-detail')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
          <div>
            <h2 className="text-xl font-bold text-gray-900">AI Health Consultation</h2>
            <p className="text-gray-600">Get AI-powered health insights for {selectedProfile?.name}</p>
          </div>
        </div>

        {/* AI Agents */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">Choose AI Health Assistant</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {healthAgents.map(agent => {
              const IconComponent = agent.icon;
              return (
                <button
                  key={agent.id}
                  onClick={() => getAIHealthAssessment(agent.id)}
                  disabled={consultationIsThinking}
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
                  {consultationIsThinking && consultationSelectedAgent === agent.id && (
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
        </div>

        {/* AI Response */}
        {consultationAiResponse && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h4 className="font-medium text-blue-900 mb-3 flex items-center gap-2">
              <Brain size={16} />
              AI Health Assessment
            </h4>
            <p className="text-blue-800 leading-relaxed mb-4">{consultationAiResponse}</p>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h5 className="font-medium text-yellow-800 mb-2">Recommended Next Steps:</h5>
              <ul className="text-yellow-700 text-sm space-y-1">
                <li>• Schedule appointment with primary care physician</li>
                <li>• Discuss symptoms and concerns with healthcare provider</li>
                <li>• Consider specialist referral if recommended</li>
                <li>• Keep tracking symptoms and medications</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderProfilesList = () => (
    <div className="p-6">
      {renderMedicalDisclaimer()}
      
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Smart Health Profiles</h1>
          <p className="text-gray-600">Manage your health information and get AI-powered insights</p>
        </div>
        <button
          onClick={() => setShowNewProfileModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          <Plus size={16} />
          New Profile
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {profiles.map(profile => (
          <div
            key={profile.id}
            onClick={() => {
              setSelectedProfile(profile);
              setCurrentView('profile-detail');
            }}
            className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <User size={24} className="text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{profile.name}</h3>
                <p className="text-sm text-gray-600">{profile.age} years old • {profile.gender}</p>
              </div>
            </div>
            
            <div className="space-y-1 text-sm text-gray-600">
              <p>Height: {profile.height} cm</p>
              <p>Weight: {profile.weight} kg</p>
              <p>BMI: {(profile.weight / Math.pow(profile.height / 100, 2)).toFixed(1)}</p>
            </div>
            
            <div className="mt-3 pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-500">
                Last updated: {new Date(profile.updatedAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        ))}
      </div>

      {profiles.length === 0 && (
        <div className="text-center py-12">
          <Heart size={48} className="text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Health Profiles</h3>
          <p className="text-gray-600 mb-4">Create your first health profile to get started with AI health insights.</p>
          <button
            onClick={() => setShowNewProfileModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Plus size={16} />
            Create Profile
          </button>
        </div>
      )}
    </div>
  );

  const renderBodyDiagram = () => (
    <div className="p-6">
      {renderMedicalDisclaimer()}
      
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => setCurrentView('profile-detail')}
          className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
        >
          ← Back to Profile
        </button>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Body Diagram - Add Symptoms</h2>
          <p className="text-gray-600">Click on a body part to add symptoms or complaints</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Body Diagram */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Select Body Part</h3>
          <div className="relative w-full max-w-md mx-auto">
            <svg viewBox="0 0 100 100" className="w-full h-auto border rounded-lg bg-gradient-to-b from-blue-50 to-blue-100">
              {/* More realistic human body outline */}
              
              {/* Head */}
              <ellipse cx="50" cy="12" rx="7" ry="9" fill="#fde68a" stroke="#d97706" strokeWidth="0.8" />
              
              {/* Neck */}
              <rect x="47" y="20" width="6" height="6" fill="#fde68a" stroke="#d97706" strokeWidth="0.8" />
              
              {/* Torso */}
              <ellipse cx="50" cy="42" rx="12" ry="16" fill="#fed7aa" stroke="#ea580c" strokeWidth="0.8" />
              
              {/* Arms */}
              <ellipse cx="32" cy="40" rx="4" ry="12" fill="#fde68a" stroke="#d97706" strokeWidth="0.8" transform="rotate(-15 32 40)" />
              <ellipse cx="68" cy="40" rx="4" ry="12" fill="#fde68a" stroke="#d97706" strokeWidth="0.8" transform="rotate(15 68 40)" />
              
              {/* Forearms */}
              <ellipse cx="25" cy="55" rx="3" ry="10" fill="#fde68a" stroke="#d97706" strokeWidth="0.8" transform="rotate(-10 25 55)" />
              <ellipse cx="75" cy="55" rx="3" ry="10" fill="#fde68a" stroke="#d97706" strokeWidth="0.8" transform="rotate(10 75 55)" />
              
              {/* Pelvis */}
              <ellipse cx="50" cy="62" rx="10" ry="6" fill="#fed7aa" stroke="#ea580c" strokeWidth="0.8" />
              
              {/* Thighs */}
              <ellipse cx="44" cy="75" rx="4" ry="12" fill="#fde68a" stroke="#d97706" strokeWidth="0.8" />
              <ellipse cx="56" cy="75" rx="4" ry="12" fill="#fde68a" stroke="#d97706" strokeWidth="0.8" />
              
              {/* Calves */}
              <ellipse cx="44" cy="90" rx="3" ry="8" fill="#fde68a" stroke="#d97706" strokeWidth="0.8" />
              <ellipse cx="56" cy="90" rx="3" ry="8" fill="#fde68a" stroke="#d97706" strokeWidth="0.8" />
              
              {/* Clickable body parts with better positioning */}
              {Object.entries(bodyParts).map(([part, data]) => (
                <g key={part}>
                  <circle
                    cx={data.x}
                    cy={data.y}
                    r="3"
                    fill={selectedBodyPart === part ? "#3b82f6" : "#dc2626"}
                    className="cursor-pointer hover:fill-blue-600 transition-colors"
                    onClick={() => setSelectedBodyPart(part)}
                    stroke="white"
                    strokeWidth="1"
                  />
                  {selectedBodyPart === part && (
                    <text
                      x={data.x}
                      y={data.y - 6}
                      textAnchor="middle"
                      className="text-xs font-medium fill-blue-600"
                      fontSize="3"
                    >
                      {data.name}
                    </text>
                  )}
                </g>
              ))}
              
              {/* Body part labels on hover */}
              <defs>
                <style>
                  {`
                    .body-part:hover + .body-label {
                      display: block;
                    }
                    .body-label {
                      display: none;
                    }
                  `}
                </style>
              </defs>
            </svg>
            
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">Click on any red dot to select a body part</p>
              <p className="text-xs text-gray-500 mt-1">Selected parts will turn blue</p>
            </div>
          </div>
          
          {selectedBodyPart && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm font-medium text-blue-900">
                Selected: {bodyParts[selectedBodyPart as keyof typeof bodyParts]?.name}
              </p>
            </div>
          )}
        </div>

        {/* Symptom Form */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Add Symptom/Complaint</h3>
          
          {selectedBodyPart ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Body Part: {bodyParts[selectedBodyPart as keyof typeof bodyParts]?.name}
                </label>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Describe the symptom
                </label>
                <textarea
                  value={newSymptom.description}
                  onChange={(e) => setNewSymptom(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="e.g., Sharp pain, dull ache, burning sensation..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Severity (1-5)
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(level => (
                    <button
                      key={level}
                      onClick={() => setNewSymptom(prev => ({ ...prev, severity: level as 1 | 2 | 3 | 4 | 5 }))}
                      className={`w-10 h-10 rounded-full font-medium transition-colors ${
                        newSymptom.severity === level
                          ? 'bg-red-500 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-1">1 = Mild, 5 = Severe</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Notes (Optional)
                </label>
                <textarea
                  value={newSymptom.notes}
                  onChange={(e) => setNewSymptom(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="When did it start? What makes it better/worse?"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={2}
                />
              </div>
              
              <button
                onClick={addSymptom}
                disabled={!newSymptom.description}
                className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Add Symptom
              </button>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">
              Click on a body part in the diagram to add a symptom
            </p>
          )}
        </div>
      </div>
    </div>
  );

  // New Profile Modal
  const NewProfileModal = () => {
    const [formData, setFormData] = useState({
      name: '',
      age: '',
      weight: '',
      height: '',
      gender: 'male' as 'male' | 'female' | 'child',
      bloodType: '',
      allergies: ''
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!formData.name || !formData.age || !formData.weight || !formData.height) return;

      createProfile({
        name: formData.name,
        age: parseInt(formData.age),
        weight: parseFloat(formData.weight),
        height: parseFloat(formData.height),
        gender: formData.gender,
        bloodType: formData.bloodType || undefined,
        allergies: formData.allergies ? formData.allergies.split(',').map(a => a.trim()) : []
      });
    };

    if (!showNewProfileModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Health Profile</h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                <input
                  type="number"
                  value={formData.age}
                  onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value as 'male' | 'female' | 'child' }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="child">Child</option>
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.weight}
                  onChange={(e) => setFormData(prev => ({ ...prev, weight: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Height (cm)</label>
                <input
                  type="number"
                  value={formData.height}
                  onChange={(e) => setFormData(prev => ({ ...prev, height: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Blood Type (Optional)</label>
              <input
                type="text"
                value={formData.bloodType}
                onChange={(e) => setFormData(prev => ({ ...prev, bloodType: e.target.value }))}
                placeholder="e.g., A+, O-, B+"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Allergies (Optional)</label>
              <input
                type="text"
                value={formData.allergies}
                onChange={(e) => setFormData(prev => ({ ...prev, allergies: e.target.value }))}
                placeholder="Separate with commas: peanuts, shellfish, penicillin"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => setShowNewProfileModal(false)}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Create Profile
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  if (currentView === 'body-diagram') {
    return (
      <div className="h-full bg-gray-50">
        {renderBodyDiagram()}
        <NewProfileModal />
      </div>
    );
  }

  if (currentView === 'profile-detail') {
    return (
      <div className="h-full bg-gray-50">
        {renderProfileDetail()}
        <NewProfileModal />
      </div>
    );
  }

  if (currentView === 'ai-consultation') {
    return (
      <div className="h-full bg-gray-50">
        {renderAIConsultation()}
        <NewProfileModal />
      </div>
    );
  }

  return (
    <div className="h-full bg-gray-50">
      {renderProfilesList()}
      <NewProfileModal />
    </div>
  );
};

export default SmartHealth;
