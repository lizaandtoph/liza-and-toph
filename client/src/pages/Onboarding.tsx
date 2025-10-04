import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { logEvent } from '../analytics';
import { z } from 'zod';
import schemasData from '../data/schemas.json';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { calculateAgeFromBirthday, categorizeAgeBand, getAgeBandLabel } from '@shared/ageUtils';

const childOnlySchema = z.object({
  name: z.string().min(1, 'Child name is required'),
  birthday: z.string().min(1, 'Birthday is required'),
});

const childWithParentSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Valid email is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(1, 'Child name is required'),
  birthday: z.string().min(1, 'Birthday is required'),
});

const answersSchema = z.object({
  schemas: z.array(z.string()).min(0),
  barriers: z.array(z.string()).min(0),
  interests: z.array(z.string()).min(0),
});

export default function Onboarding() {
  const navigate = useNavigate();
  const { addChild, setAnswers, setLoggedIn, setParentAccount, parentAccount } = useStore();
  const hasParentAccount = !!parentAccount;
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    name: '',
    birthday: '',
    schemas: [] as string[],
    barriers: [] as string[],
    interests: [] as string[],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const barriers = [
    { value: 'access_to_toys', label: 'Hard to access toys', description: 'Toys are stored out of reach or in difficult-to-open containers' },
    { value: 'dumps_bins', label: 'Child dumps toy bins', description: 'Your child tends to dump entire toy bins rather than select individual items' },
    { value: 'space_constrained', label: 'Limited space', description: 'You have limited space for play areas or toy storage' },
  ];

  const interests = [
    { value: 'building', label: 'Building & Construction', description: 'Blocks, Legos, puzzles' },
    { value: 'dolls', label: 'Dolls & Pretend Play', description: 'Role-playing, dress-up, dolls' },
    { value: 'art', label: 'Art & Creativity', description: 'Drawing, painting, crafts' },
    { value: 'books', label: 'Books & Stories', description: 'Reading, storytelling' },
    { value: 'gross_motor', label: 'Climbing & Movement', description: 'Running, jumping, climbing' },
  ];

  const toggleArray = (arr: string[], value: string) => {
    return arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value];
  };

  const nextStep = () => {
    if (step === 1) {
      try {
        if (hasParentAccount) {
          childOnlySchema.parse({ 
            name: formData.name, 
            birthday: formData.birthday
          });
        } else {
          childWithParentSchema.parse({ 
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            password: formData.password,
            name: formData.name, 
            birthday: formData.birthday
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

  const handleSubmit = () => {
    try {
      const answers = answersSchema.parse({
        schemas: formData.schemas,
        barriers: formData.barriers,
        interests: formData.interests,
      });
      
      let childName: string;
      let childBirthday: string;
      
      if (hasParentAccount) {
        const childData = childOnlySchema.parse({ 
          name: formData.name, 
          birthday: formData.birthday
        });
        childName = childData.name;
        childBirthday = childData.birthday;
      } else {
        const childData = childWithParentSchema.parse({ 
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
          name: formData.name, 
          birthday: formData.birthday
        });
        childName = childData.name;
        childBirthday = childData.birthday;
        
        setParentAccount({
          firstName: childData.firstName,
          lastName: childData.lastName,
          email: childData.email,
          password: childData.password
        });
      }
      
      const { years, months, totalMonths } = calculateAgeFromBirthday(childBirthday);
      const ageBand = categorizeAgeBand(totalMonths);
      
      addChild({
        name: childName,
        birthday: childBirthday,
        ageYears: years,
        ageMonths: months,
        ageBand,
      }, answers);
      
      setLoggedIn(true);
      logEvent('onboarding_completed', { ageBand });
      navigate('/playboard');
    } catch (e) {
      console.error('Validation error:', e);
    }
  };

  return (
    <div className="container mx-auto px-4 max-w-4xl py-8">
      {/* Progress Bar */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-6">
          {[1, 2, 3, 4].map((num) => (
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
              {num !== 4 && (
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
          Step {step} of 4: {
            step === 1 ? 'About Your Child' :
            step === 2 ? 'Play Patterns' :
            step === 3 ? 'Current Challenges' :
            'Interests & Activities'
          }
        </p>
      </div>

      {/* Step 1: Child Info */}
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
                  className="w-full px-6 py-4 bg-ivory border-2 border-sand rounded-xl focus:border-olive focus:outline-none text-lg transition"
                  placeholder="Enter your first name"
                  data-testid="input-parent-first-name"
                />
                {errors.firstName && <p className="text-burnt text-sm mt-2" data-testid="error-first-name">{errors.firstName}</p>}
              </div>

              <div className="mb-6">
                <label className="block mb-3 font-semibold text-lg">Your Last Name</label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full px-6 py-4 bg-ivory border-2 border-sand rounded-xl focus:border-olive focus:outline-none text-lg transition"
                  placeholder="Enter your last name"
                  data-testid="input-parent-last-name"
                />
                {errors.lastName && <p className="text-burnt text-sm mt-2" data-testid="error-last-name">{errors.lastName}</p>}
              </div>

              <div className="mb-6">
                <label className="block mb-3 font-semibold text-lg">Email Address</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-6 py-4 bg-ivory border-2 border-sand rounded-xl focus:border-olive focus:outline-none text-lg transition"
                  placeholder="your@email.com"
                  data-testid="input-parent-email"
                />
                {errors.email && <p className="text-burnt text-sm mt-2" data-testid="error-email">{errors.email}</p>}
              </div>

              <div className="mb-6">
                <label className="block mb-3 font-semibold text-lg">Password</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-6 py-4 bg-ivory border-2 border-sand rounded-xl focus:border-olive focus:outline-none text-lg transition"
                  placeholder="Create a password (min. 6 characters)"
                  data-testid="input-parent-password"
                />
                {errors.password && <p className="text-burnt text-sm mt-2" data-testid="error-password">{errors.password}</p>}
              </div>
            </>
          )}

          <div className="mb-6">
            <label className="block mb-3 font-semibold text-lg">Your Child's Name</label>
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

          <div className="mb-8">
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
        </div>
      )}

      {/* Step 2: Play Schemas */}
      {step === 2 && (
        <div className="bg-gradient-to-br from-[#EDE9DC] to-ivory p-10 rounded-2xl shadow-lg">
          <h2 className="text-3xl font-bold mb-3 text-center" data-testid="heading-step-2">
            Play Patterns
          </h2>
          <p className="text-center mb-8 opacity-70">
            Have you noticed any of these play behaviors? Select all that apply.
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

      {/* Step 3: Barriers */}
      {step === 3 && (
        <div className="bg-gradient-to-br from-[#EDE9DC] to-ivory p-10 rounded-2xl shadow-lg">
          <h2 className="text-3xl font-bold mb-3 text-center" data-testid="heading-step-3">
            Current Challenges
          </h2>
          <p className="text-center mb-8 opacity-70">
            What challenges do you face with play at home? Select all that apply.
          </p>
          
          <div className="space-y-4">
            {barriers.map((barrier) => (
              <label
                key={barrier.value}
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

      {/* Step 4: Interests */}
      {step === 4 && (
        <div className="bg-gradient-to-br from-[#EDE9DC] to-ivory p-10 rounded-2xl shadow-lg">
          <h2 className="text-3xl font-bold mb-3 text-center" data-testid="heading-step-4">
            Interests & Activities
          </h2>
          <p className="text-center mb-8 opacity-70">
            What types of play does your child enjoy most? Select all that apply.
          </p>
          
          <div className="space-y-4">
            {interests.map((interest) => (
              <label
                key={interest.value}
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

        {step < 4 ? (
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
