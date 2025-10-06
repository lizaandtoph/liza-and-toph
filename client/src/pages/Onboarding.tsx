import { useState, useMemo, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useStore, type Answers } from '../store';
import { logEvent } from '../analytics';
import { z } from 'zod';
import schemasData from '../data/schemas.json';
import milestonesData from '../data/questionnaire-milestones.json';
import barriersData from '../data/barriers.json';
import interestsData from '../data/interests.json';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { calculateAgeFromBirthday, categorizeAgeBand, getAgeBandLabel } from '@shared/ageUtils';
import { useAuth } from '../hooks/useAuth';

const QUESTIONNAIRE_VERSION = 2;

const childOnlySchema = z.object({
  name: z.string().min(1, 'Child name is required'),
  birthday: z.string().min(1, 'Birthday is required'),
  household_size: z.number().min(1).max(10),
});

const childWithParentSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Valid email is required'),
  name: z.string().min(1, 'Child name is required'),
  birthday: z.string().min(1, 'Birthday is required'),
  household_size: z.number().min(1).max(10),
});

export default function Onboarding() {
  const [, setLocation] = useLocation();
  const { setLoggedIn, setParentAccount, parentAccount, loadChildren } = useStore();
  const { user, isAuthenticated, isLoading } = useAuth();
  const hasParentAccount = !!parentAccount;
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    name: '',
    birthday: '',
    household_size: 1,
    schemas: [] as string[],
    barriers: [] as string[],
    interests: [] as string[],
    milestones: {
      social_emotional: { question: '', answer: '' },
      cognitive: { question: '', answer: '' },
      language: { question: '', answer: '' },
      motor: { question: '', answer: '' },
    },
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Pre-fill parent info from Replit Auth (only runs once when data loads)
  useEffect(() => {
    if (isAuthenticated && user && !formData.firstName && !formData.lastName && !formData.email) {
      setFormData(prev => ({
        ...prev,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
      }));
    }
  }, [isAuthenticated, user, formData.firstName, formData.lastName, formData.email]);

  const childAgeBand = useMemo(() => {
    if (!formData.birthday) return null;
    const { totalMonths } = calculateAgeFromBirthday(formData.birthday);
    return categorizeAgeBand(totalMonths);
  }, [formData.birthday]);

  const milestoneQuestions = useMemo(() => {
    if (!childAgeBand) return null;
    
    const bandKey = childAgeBand as keyof typeof milestonesData;
    if (bandKey in milestonesData) {
      return milestonesData[bandKey];
    }
    
    if (childAgeBand === '18m-3y') {
      return milestonesData['18m-3yr'];
    } else if (childAgeBand === '2-5y') {
      return milestonesData['2-5yr'];
    } else if (childAgeBand === '3-6y') {
      return milestonesData['3-6yr'];
    }
    
    return null;
  }, [childAgeBand]);

  const toggleArray = (arr: string[], value: string) => {
    return arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value];
  };

  const nextStep = () => {
    if (step === 1) {
      try {
        if (hasParentAccount) {
          childOnlySchema.parse({ 
            name: formData.name, 
            birthday: formData.birthday,
            household_size: formData.household_size
          });
        } else {
          childWithParentSchema.parse({ 
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            name: formData.name, 
            birthday: formData.birthday,
            household_size: formData.household_size
          });
        }
        setErrors({});
        setStep(2);
      } catch (e) {
        if (e instanceof z.ZodError) {
          const newErrors: Record<string, string> = {};
          e.errors.forEach(err => {
            newErrors[err.path[0] as string] = err.message;
          });
          setErrors(newErrors);
        }
      }
    } else {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  const handleSubmit = async () => {
    try {
      let childName: string;
      let childBirthday: string;
      let householdSize: number;
      
      if (hasParentAccount) {
        const childData = childOnlySchema.parse({ 
          name: formData.name, 
          birthday: formData.birthday,
          household_size: formData.household_size
        });
        childName = childData.name;
        childBirthday = childData.birthday;
        householdSize = childData.household_size;
      } else {
        const childData = childWithParentSchema.parse({ 
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          name: formData.name, 
          birthday: formData.birthday,
          household_size: formData.household_size
        });
        childName = childData.name;
        childBirthday = childData.birthday;
        householdSize = childData.household_size;

        // Use auth data if available, otherwise use form data
        const parentData = {
          firstName: (isAuthenticated && user?.firstName) || childData.firstName,
          lastName: (isAuthenticated && user?.lastName) || childData.lastName,
          email: (isAuthenticated && user?.email) || childData.email,
          password: '', // Not needed with Replit Auth
          role: (isAuthenticated && user?.role) || 'parent'
        };
        setParentAccount(parentData);
      }
      
      const { years, months, totalMonths } = calculateAgeFromBirthday(childBirthday);
      const ageBand = categorizeAgeBand(totalMonths);
      
      const childResponse = await fetch('/api/auth/children', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: childName,
          birthday: childBirthday,
          ageYears: years,
          ageMonths: months,
          ageBand,
          schemas: formData.schemas,
          barriers: formData.barriers,
          interests: formData.interests,
          householdSize: householdSize,
          milestones: formData.milestones,
          questionnaireVersion: QUESTIONNAIRE_VERSION,
        }),
      });

      if (!childResponse.ok) {
        console.error('Failed to create child');
        return;
      }

      const meResponse = await fetch('/api/auth/me');
      const meData = await meResponse.json();

      if (meResponse.ok && meData.children) {
        const children = meData.children.map((c: any) => ({
          id: c.id,
          name: c.name,
          birthday: c.birthday || '',
          ageYears: c.ageYears || 0,
          ageMonths: c.ageMonths || 0,
          ageBand: c.ageBand || '',
        }));

        const answersMap: Record<string, Answers> = {};
        meData.children.forEach((child: any) => {
          answersMap[child.id] = {
            schemas: child.schemas || [],
            barriers: child.barriers || [],
            interests: child.interests || [],
            household_size: child.householdSize || 1,
            milestones: child.milestones || {},
            questionnaire_version: child.questionnaireVersion || 2,
          };
        });

        loadChildren(children, answersMap);
      }
      
      setLoggedIn(true);
      logEvent('onboarding_completed', { ageBand, version: QUESTIONNAIRE_VERSION });
      setLocation('/playboard');
    } catch (e) {
      console.error('Validation error:', e);
    }
  };

  return (
    <div className="container mx-auto px-4 max-w-4xl py-8">
      {/* Progress Bar */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-6">
          {[1, 2, 3, 4, 5].map((num) => (
            <div key={num} className="flex items-center flex-1">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                  num <= step 
                    ? 'bg-olive text-ivory' 
                    : 'bg-sand text-espresso/50'
                }`}
                data-testid={`step-indicator-${num}`}
              >
                {num}
              </div>
              {num !== 5 && (
                <div
                  className={`flex-1 h-1 mx-2 transition-all ${
                    num < step ? 'bg-olive' : 'bg-sand'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        <p className="text-center text-lg font-medium">
          Step {step} of 5: {
            step === 1 ? 'Child Basics' :
            step === 2 ? 'Milestone Check' :
            step === 3 ? 'Play Patterns' :
            step === 4 ? 'Current Challenges' :
            'Interests & Activities'
          }
        </p>
      </div>

      {/* Step 1: Child Basics */}
      {step === 1 && (
        <div className="bg-gradient-to-br from-[#EDE9DC] to-ivory p-10 rounded-2xl shadow-lg">
          <h2 className="text-3xl font-bold mb-3 text-center" data-testid="heading-step-1">
            {hasParentAccount ? 'Add Another Child' : "Let's Get Started"}
          </h2>
          <p className="text-center mb-8 opacity-70">
            {hasParentAccount ? 'Tell us about your child' : 'Create your parent account and tell us about your child'}
          </p>
          
          {!hasParentAccount && (
            <>
              <div className="mb-6">
                <label className="block mb-3 font-semibold text-lg">Your First Name</label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full px-6 py-4 bg-ivory border-2 border-sand rounded-xl focus:border-olive focus:outline-none text-lg transition disabled:opacity-60 disabled:cursor-not-allowed"
                  placeholder={isLoading ? "Loading..." : "Enter your first name"}
                  data-testid="input-parent-first-name"
                  disabled={isLoading || isAuthenticated}
                />
                {errors.firstName && <p className="text-burnt text-sm mt-2" data-testid="error-first-name">{errors.firstName}</p>}
              </div>

              <div className="mb-6">
                <label className="block mb-3 font-semibold text-lg">Your Last Name</label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full px-6 py-4 bg-ivory border-2 border-sand rounded-xl focus:border-olive focus:outline-none text-lg transition disabled:opacity-60 disabled:cursor-not-allowed"
                  placeholder={isLoading ? "Loading..." : "Enter your last name"}
                  data-testid="input-parent-last-name"
                  disabled={isLoading || isAuthenticated}
                />
                {errors.lastName && <p className="text-burnt text-sm mt-2" data-testid="error-last-name">{errors.lastName}</p>}
              </div>

              <div className="mb-6">
                <label className="block mb-3 font-semibold text-lg">Email Address</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-6 py-4 bg-ivory border-2 border-sand rounded-xl focus:border-olive focus:outline-none text-lg transition disabled:opacity-60 disabled:cursor-not-allowed"
                  placeholder={isLoading ? "Loading..." : "your@email.com"}
                  data-testid="input-parent-email"
                  disabled={isLoading || isAuthenticated}
                />
                {errors.email && <p className="text-burnt text-sm mt-2" data-testid="error-email">{errors.email}</p>}
              </div>
            </>
          )}

          <div className="mb-6">
            <label className="block mb-3 font-semibold text-lg">Your Child's First Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-6 py-4 bg-ivory border-2 border-sand rounded-xl focus:border-olive focus:outline-none text-lg transition"
              placeholder="Enter child's name"
              data-testid="input-child-name"
            />
            {errors.name && <p className="text-burnt text-sm mt-2" data-testid="error-name">{errors.name}</p>}
          </div>

          <div className="mb-6">
            <label className="block mb-3 font-semibold text-lg">When is their birthday?</label>
            <input
              type="date"
              value={formData.birthday}
              onChange={(e) => setFormData({ ...formData, birthday: e.target.value })}
              max={new Date().toISOString().split('T')[0]}
              className="w-full px-6 py-4 bg-ivory border-2 border-sand rounded-xl focus:border-olive focus:outline-none text-lg transition"
              data-testid="input-birthday"
            />
            {errors.birthday && <p className="text-burnt text-sm mt-2" data-testid="error-birthday">{errors.birthday}</p>}
            {formData.birthday ? (
              <p className="text-sm mt-3 opacity-70">
                Age: <span className="font-semibold">{(() => {
                  const { years, months, totalMonths } = calculateAgeFromBirthday(formData.birthday);
                  return `${years} years, ${months} months`;
                })()} ({getAgeBandLabel(categorizeAgeBand(calculateAgeFromBirthday(formData.birthday).totalMonths))})</span>
              </p>
            ) : null}
          </div>

          <div className="mb-8">
            <label className="block mb-3 font-semibold text-lg">How many children in your household?</label>
            <select
              value={formData.household_size}
              onChange={(e) => setFormData({ ...formData, household_size: parseInt(e.target.value) })}
              className="w-full px-6 py-4 bg-ivory border-2 border-sand rounded-xl focus:border-olive focus:outline-none text-lg transition"
              data-testid="select-household-size"
            >
              <option value={1}>1</option>
              <option value={2}>2</option>
              <option value={3}>3</option>
              <option value={4}>4+</option>
            </select>
          </div>
        </div>
      )}

      {/* Step 2: Milestone Check */}
      {step === 2 && (
        <div className="bg-gradient-to-br from-[#EDE9DC] to-ivory p-10 rounded-2xl shadow-lg">
          <h2 className="text-3xl font-bold mb-3 text-center" data-testid="heading-step-2">
            Milestone Check
          </h2>
          <p className="text-center mb-8 opacity-70">
            These questions help us understand your child's current development
          </p>
          
          {milestoneQuestions ? (
            <div className="space-y-6">
              {/* Social-Emotional */}
              <div className="bg-ivory p-6 rounded-xl border-2 border-sand">
                <h3 className="font-semibold text-lg mb-4">Social-Emotional</h3>
                <p className="mb-4">{milestoneQuestions.social_emotional.question}</p>
                <div className="space-y-2">
                  {milestoneQuestions.social_emotional.options.map((option: string) => (
                    <label key={option} className="flex items-center cursor-pointer" data-testid={`option-milestone-social-emotional-${option}`}>
                      <input
                        type="radio"
                        name="social_emotional"
                        value={option}
                        checked={formData.milestones.social_emotional.answer === option}
                        onChange={(e) => setFormData({
                          ...formData,
                          milestones: {
                            ...formData.milestones,
                            social_emotional: {
                              question: milestoneQuestions.social_emotional.question,
                              answer: e.target.value
                            }
                          }
                        })}
                        className="mr-3 w-5 h-5 accent-olive"
                        data-testid={`input-milestone-social-emotional-${option}`}
                      />
                      <span className="capitalize">{option.replace('_', ' ')}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Cognitive */}
              <div className="bg-ivory p-6 rounded-xl border-2 border-sand">
                <h3 className="font-semibold text-lg mb-4">Cognitive</h3>
                <p className="mb-4">{milestoneQuestions.cognitive.question}</p>
                <div className="space-y-2">
                  {milestoneQuestions.cognitive.options.map((option: string) => (
                    <label key={option} className="flex items-center cursor-pointer" data-testid={`option-milestone-cognitive-${option}`}>
                      <input
                        type="radio"
                        name="cognitive"
                        value={option}
                        checked={formData.milestones.cognitive.answer === option}
                        onChange={(e) => setFormData({
                          ...formData,
                          milestones: {
                            ...formData.milestones,
                            cognitive: {
                              question: milestoneQuestions.cognitive.question,
                              answer: e.target.value
                            }
                          }
                        })}
                        className="mr-3 w-5 h-5 accent-olive"
                        data-testid={`input-milestone-cognitive-${option}`}
                      />
                      <span className="capitalize">{option.replace('_', ' ')}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Language */}
              <div className="bg-ivory p-6 rounded-xl border-2 border-sand">
                <h3 className="font-semibold text-lg mb-4">Language & Communication</h3>
                <p className="mb-4">{milestoneQuestions.language.question}</p>
                <div className="space-y-2">
                  {milestoneQuestions.language.options.map((option: string) => (
                    <label key={option} className="flex items-center cursor-pointer" data-testid={`option-milestone-language-${option}`}>
                      <input
                        type="radio"
                        name="language"
                        value={option}
                        checked={formData.milestones.language.answer === option}
                        onChange={(e) => setFormData({
                          ...formData,
                          milestones: {
                            ...formData.milestones,
                            language: {
                              question: milestoneQuestions.language.question,
                              answer: e.target.value
                            }
                          }
                        })}
                        className="mr-3 w-5 h-5 accent-olive"
                        data-testid={`input-milestone-language-${option}`}
                      />
                      <span className="capitalize">{option.replace('_', ' ').replace('+', '+')}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Motor */}
              <div className="bg-ivory p-6 rounded-xl border-2 border-sand">
                <h3 className="font-semibold text-lg mb-4">Motor Development</h3>
                <p className="mb-4">{milestoneQuestions.motor.question}</p>
                <div className="space-y-2">
                  {milestoneQuestions.motor.options.map((option: string) => (
                    <label key={option} className="flex items-center cursor-pointer" data-testid={`option-milestone-motor-${option}`}>
                      <input
                        type="radio"
                        name="motor"
                        value={option}
                        checked={formData.milestones.motor.answer === option}
                        onChange={(e) => setFormData({
                          ...formData,
                          milestones: {
                            ...formData.milestones,
                            motor: {
                              question: milestoneQuestions.motor.question,
                              answer: e.target.value
                            }
                          }
                        })}
                        className="mr-3 w-5 h-5 accent-olive"
                        data-testid={`input-milestone-motor-${option}`}
                      />
                      <span className="capitalize">{option.replace('_', ' ')}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-lg opacity-70">Please complete Step 1 first to see age-appropriate milestone questions.</p>
            </div>
          )}
          
          <p className="text-sm text-center mt-6 opacity-60">
            These are educational guidelines only - not diagnostic tools
          </p>
        </div>
      )}

      {/* Step 3: Play Schemas */}
      {step === 3 && (
        <div className="bg-gradient-to-br from-[#EDE9DC] to-ivory p-10 rounded-2xl shadow-lg">
          <h2 className="text-3xl font-bold mb-3 text-center" data-testid="heading-step-3">
            Play Patterns
          </h2>
          <p className="text-center mb-8 opacity-70">
            Which of these behaviors do you see your child do often? Select all that apply.
          </p>
          
          <div className="space-y-4">
            {Object.entries(schemasData).map(([key, schema]) => (
              <label
                key={key}
                className={`flex items-start p-5 border-2 rounded-xl cursor-pointer transition-all hover:shadow-md ${
                  formData.schemas.includes(key)
                    ? 'border-olive bg-olive/5'
                    : 'border-sand bg-ivory hover:border-ochre'
                }`}
                data-testid={`option-schema-${key}`}
              >
                <input
                  type="checkbox"
                  checked={formData.schemas.includes(key)}
                  onChange={() => setFormData({
                    ...formData,
                    schemas: toggleArray(formData.schemas, key)
                  })}
                  className="mt-1 mr-4 w-5 h-5 accent-olive"
                  data-testid={`input-schema-${key}`}
                />
                <div className="flex-1">
                  <div className="font-semibold text-lg mb-1">{schema.label}</div>
                  <div className="text-sm opacity-70">{schema.description}</div>
                </div>
              </label>
            ))}
          </div>
          <p className="text-sm text-center mt-6 opacity-60">
            It's okay if you don't see these behaviors yet - you can skip this step
          </p>
        </div>
      )}

      {/* Step 4: Barriers */}
      {step === 4 && (
        <div className="bg-gradient-to-br from-[#EDE9DC] to-ivory p-10 rounded-2xl shadow-lg">
          <h2 className="text-3xl font-bold mb-3 text-center" data-testid="heading-step-4">
            Current Challenges
          </h2>
          <p className="text-center mb-8 opacity-70">
            What makes play challenging for your child? Select all that apply.
          </p>
          
          <div className="space-y-4">
            {Object.entries(barriersData).map(([key, barrier]) => (
              <label
                key={key}
                className={`flex items-start p-5 border-2 rounded-xl cursor-pointer transition-all hover:shadow-md ${
                  formData.barriers.includes(barrier.value)
                    ? 'border-olive bg-olive/5'
                    : 'border-sand bg-ivory hover:border-ochre'
                }`}
                data-testid={`option-barrier-${barrier.value}`}
              >
                <input
                  type="checkbox"
                  checked={formData.barriers.includes(barrier.value)}
                  onChange={() => setFormData({
                    ...formData,
                    barriers: toggleArray(formData.barriers, barrier.value)
                  })}
                  className="mt-1 mr-4 w-5 h-5 accent-olive"
                  data-testid={`input-barrier-${barrier.value}`}
                />
                <div className="flex-1">
                  <div className="font-semibold text-lg mb-1">{barrier.label}</div>
                  <div className="text-sm opacity-70">{barrier.description}</div>
                </div>
              </label>
            ))}
          </div>
          <p className="text-sm text-center mt-6 opacity-60">
            Optional - we'll customize your Play Board based on your selections
          </p>
        </div>
      )}

      {/* Step 5: Interests */}
      {step === 5 && (
        <div className="bg-gradient-to-br from-[#EDE9DC] to-ivory p-10 rounded-2xl shadow-lg">
          <h2 className="text-3xl font-bold mb-3 text-center" data-testid="heading-step-5">
            Interests & Activities
          </h2>
          <p className="text-center mb-8 opacity-70">
            What does your child love right now? Select up to 5.
          </p>
          
          <div className="space-y-4">
            {Object.entries(interestsData).map(([key, interest]) => (
              <label
                key={key}
                className={`flex items-start p-5 border-2 rounded-xl cursor-pointer transition-all hover:shadow-md ${
                  formData.interests.includes(interest.value)
                    ? 'border-olive bg-olive/5'
                    : 'border-sand bg-ivory hover:border-ochre'
                }`}
                data-testid={`option-interest-${interest.value}`}
              >
                <input
                  type="checkbox"
                  checked={formData.interests.includes(interest.value)}
                  onChange={() => setFormData({
                    ...formData,
                    interests: toggleArray(formData.interests, interest.value)
                  })}
                  disabled={!formData.interests.includes(interest.value) && formData.interests.length >= 5}
                  className="mt-1 mr-4 w-5 h-5 accent-olive"
                  data-testid={`input-interest-${interest.value}`}
                />
                <div className="flex-1">
                  <div className="font-semibold text-lg mb-1">{interest.label}</div>
                  <div className="text-sm opacity-70">{interest.description}</div>
                </div>
              </label>
            ))}
          </div>
          {formData.interests.length >= 5 && (
            <p className="text-sm text-center mt-4 text-olive font-medium">
              You've selected 5 interests (maximum)
            </p>
          )}
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-8">
        {step > 1 ? (
          <button
            onClick={prevStep}
            className="flex items-center gap-2 px-6 py-3 border-2 border-olive text-olive rounded-xl hover:bg-olive hover:text-ivory transition font-medium"
            data-testid="button-back"
          >
            <ChevronLeft className="w-5 h-5" />
            Back
          </button>
        ) : (
          <div></div>
        )}

        {step < 5 ? (
          <button
            onClick={nextStep}
            className="flex items-center gap-2 px-8 py-3 bg-olive text-ivory rounded-xl hover:bg-ochre transition font-semibold text-lg shadow-md hover:shadow-lg ml-auto"
            data-testid="button-next"
          >
            Next
            <ChevronRight className="w-5 h-5" />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            className="flex items-center gap-2 px-8 py-3 bg-olive text-ivory rounded-xl hover:bg-ochre transition font-semibold text-lg shadow-md hover:shadow-lg ml-auto"
            data-testid="button-submit"
          >
            See My Play Board
            <ChevronRight className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}
